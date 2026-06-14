import { create } from "zustand";

export type SizeClass = "1cm" | "3cm" | "5cm" | "10cm";
export type RiskLevel = "Low" | "Medium" | "High";
export type Stage = "sensor" | "signal" | "anomaly" | "features" | "classifier" | "orbit" | "viz";

export interface Sample {
  t: number;
  amp: number; // dB-ish, baseline near 0
  freq: number; // Hz offset
}

export interface Features {
  amplitudeDrop: number; // dB
  dopplerShift: number; // Hz
  duration: number; // ms
  snr: number; // dB
  bandwidth: number; // Hz
}

export interface Classification {
  size: SizeClass;
  velocity: number; // km/s
  confidence: number; // 0-1
}

export interface OrbitParams {
  inclination: number; // deg
  raan: number; // deg
  phase: number; // 0..1 along orbit
  altitudeKm: number;
  velocity: number; // km/s
  speed: number; // anim speed
}

export interface RiskAssessment {
  closestApproachKm: number;
  probability: number; // 0..1
  level: RiskLevel;
}

export interface DetectionEvent {
  id: string;
  timestamp: number;
  features: Features;
  classification: Classification;
  orbit: OrbitParams;
  risk: RiskAssessment;
}

interface AnomalyState {
  active: boolean;
  startedAt: number;
  durationMs: number;
  injectedSize: SizeClass;
  injectedVelocityKms: number; // km/s
  peakAmpDrop: number;
  peakDoppler: number;
}

interface PlasmaState {
  // simulation
  running: boolean;
  autoMode: boolean;
  tick: number;
  samples: Sample[]; // rolling
  spectrogram: Float32Array[]; // columns of frequency bins, rolling
  spectroBins: number;
  spectroCols: number;

  // controls
  selectedSize: SizeClass;
  selectedVelocity: number; // km/s slider

  // current detection
  anomaly: AnomalyState | null;
  liveFeatures: Features | null;
  liveClassification: Classification | null;
  liveOrbit: OrbitParams | null;
  liveRisk: RiskAssessment | null;
  activeStage: Stage;

  // log
  events: DetectionEvent[];

  // actions
  start: () => void;
  stop: () => void;
  toggleAuto: () => void;
  setSize: (s: SizeClass) => void;
  setVelocity: (v: number) => void;
  injectEvent: () => void;
  _tick: () => void;
}

const FREQ_BINS = 48;
const SPECTRO_COLS = 140;
const SAMPLE_BUFFER = 220;

function makeEmptyColumn(): Float32Array {
  return new Float32Array(FREQ_BINS);
}

function noise(scale = 1) {
  return (Math.random() - 0.5) * 2 * scale;
}

function sizeFromAmpDrop(drop: number): SizeClass {
  if (drop > 22) return "10cm";
  if (drop > 15) return "5cm";
  if (drop > 9) return "3cm";
  return "1cm";
}

function classifyRisk(distanceKm: number, prob: number): RiskLevel {
  if (prob > 0.6 || distanceKm < 3) return "High";
  if (prob > 0.25 || distanceKm < 12) return "Medium";
  return "Low";
}

function randomOrbit(velocityKms: number): OrbitParams {
  return {
    inclination: 20 + Math.random() * 80,
    raan: Math.random() * 360,
    phase: Math.random(),
    altitudeKm: 380 + Math.random() * 120,
    velocity: velocityKms,
    speed: 0.05 + (velocityKms - 6) * 0.01,
  };
}

let loopId: number | null = null;
let lastTickMs = 0;

export const usePlasmaStore = create<PlasmaState>((set, get) => ({
  running: false,
  autoMode: true,
  tick: 0,
  samples: Array.from({ length: SAMPLE_BUFFER }, (_, i) => ({ t: i, amp: noise(0.6), freq: noise(2) })),
  spectrogram: Array.from({ length: SPECTRO_COLS }, () => makeEmptyColumn()),
  spectroBins: FREQ_BINS,
  spectroCols: SPECTRO_COLS,

  selectedSize: "3cm",
  selectedVelocity: 7.6,

  anomaly: null,
  liveFeatures: null,
  liveClassification: null,
  liveOrbit: null,
  liveRisk: null,
  activeStage: "sensor",

  events: [],

  start: () => {
    if (get().running) return;
    set({ running: true });
    lastTickMs = performance.now();
    const loop = () => {
      get()._tick();
      loopId = requestAnimationFrame(loop);
    };
    loopId = requestAnimationFrame(loop);
  },

  stop: () => {
    if (loopId) cancelAnimationFrame(loopId);
    loopId = null;
    set({ running: false });
  },

  toggleAuto: () => set((s) => ({ autoMode: !s.autoMode })),
  setSize: (s) => set({ selectedSize: s }),
  setVelocity: (v) => set({ selectedVelocity: v }),

  injectEvent: () => {
    const { selectedSize, selectedVelocity } = get();
    const sizeIdx = ["1cm", "3cm", "5cm", "10cm"].indexOf(selectedSize);
    const peakAmpDrop = 6 + sizeIdx * 6 + Math.random() * 3; // 6..27 dB
    const peakDoppler = (selectedVelocity / 7.6) * (180 + Math.random() * 120) * (Math.random() < 0.5 ? -1 : 1);
    set({
      activeStage: "sensor",
      anomaly: {
        active: true,
        startedAt: performance.now(),
        durationMs: 900 + Math.random() * 800,
        injectedSize: selectedSize,
        injectedVelocityKms: selectedVelocity,
        peakAmpDrop,
        peakDoppler,
      },
    });
  },

  _tick: () => {
    const now = performance.now();
    const dt = now - lastTickMs;
    if (dt < 50) return; // ~20Hz
    lastTickMs = now;

    const state = get();
    let { samples, spectrogram, anomaly, activeStage } = state;
    samples = samples.slice(1);

    // Auto mode: occasionally inject
    if (state.autoMode && !anomaly && Math.random() < 0.012) {
      get().injectEvent();
      return;
    }

    // Build sample
    let amp = noise(0.8);
    let freq = noise(2);
    let anomalyProgress = 0;

    if (anomaly?.active) {
      const elapsed = now - anomaly.startedAt;
      const p = elapsed / anomaly.durationMs;
      anomalyProgress = p;
      // Bell-shaped dip
      const bell = Math.exp(-Math.pow((p - 0.5) * 3.2, 2));
      amp -= anomaly.peakAmpDrop * bell;
      // Doppler ramps + chirp
      freq += anomaly.peakDoppler * bell;

      // stage progression
      if (p > 0.15 && activeStage === "sensor") set({ activeStage: "signal" });
      if (p > 0.35 && state.activeStage !== "anomaly" && p < 0.55) set({ activeStage: "anomaly" });

      if (p >= 1) {
        // finalize detection
        const features: Features = {
          amplitudeDrop: anomaly.peakAmpDrop,
          dopplerShift: anomaly.peakDoppler,
          duration: anomaly.durationMs,
          snr: 12 + Math.random() * 8,
          bandwidth: Math.abs(anomaly.peakDoppler) * (0.6 + Math.random() * 0.6),
        };
        const size = sizeFromAmpDrop(features.amplitudeDrop);
        const velocity = Math.min(11.2, Math.max(5.5, 7.6 + (Math.abs(features.dopplerShift) - 180) / 80));
        const classification: Classification = {
          size,
          velocity,
          confidence: Math.min(0.99, 0.62 + features.amplitudeDrop / 60 + features.snr / 120),
        };
        const orbit = randomOrbit(velocity);
        const distanceKm = Math.max(0.4, 25 - features.amplitudeDrop * 0.6 + (Math.random() - 0.5) * 6);
        const probability = Math.min(0.95, Math.max(0.02, (25 - distanceKm) / 30 + Math.random() * 0.1));
        const risk: RiskAssessment = {
          closestApproachKm: distanceKm,
          probability,
          level: classifyRisk(distanceKm, probability),
        };
        const event: DetectionEvent = {
          id: `evt_${Math.floor(now)}_${Math.floor(Math.random() * 1e4)}`,
          timestamp: Date.now(),
          features,
          classification,
          orbit,
          risk,
        };
        set({
          anomaly: null,
          liveFeatures: features,
          liveClassification: classification,
          liveOrbit: orbit,
          liveRisk: risk,
          activeStage: "viz",
          events: [event, ...state.events].slice(0, 40),
        });
      } else {
        // live features mid-event
        const live: Features = {
          amplitudeDrop: anomaly.peakAmpDrop * bell,
          dopplerShift: anomaly.peakDoppler * bell,
          duration: elapsed,
          snr: 10 + bell * 10,
          bandwidth: Math.abs(anomaly.peakDoppler) * bell * 0.8,
        };
        set({ liveFeatures: live });
      }
    } else {
      // idle stage progression
      if (state.activeStage !== "viz" && state.activeStage !== "sensor") {
        // hold viz briefly
      }
    }

    samples.push({ t: samples[samples.length - 1].t + 1, amp, freq });

    // Spectrogram column: simulate FFT bins around freq with amplitude
    const col = makeEmptyColumn();
    const centerBin = Math.floor(FREQ_BINS / 2 + (freq / 600) * (FREQ_BINS / 2));
    for (let i = 0; i < FREQ_BINS; i++) {
      const distance = Math.abs(i - centerBin);
      const base = Math.max(0, 0.18 - distance * 0.012) + Math.random() * 0.05;
      const anomalyBoost = anomaly?.active
        ? Math.exp(-Math.pow((i - centerBin) / 4, 2)) * (0.8 + Math.random() * 0.3) * Math.exp(-Math.pow((anomalyProgress - 0.5) * 3, 2))
        : 0;
      col[i] = Math.min(1, base + anomalyBoost);
    }
    spectrogram = [...spectrogram.slice(1), col];

    set({ samples, spectrogram, tick: state.tick + 1 });
  },
}));
