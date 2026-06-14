import { useEffect, useRef } from "react";
import { usePlasmaStore } from "@/lib/plasma/store";

// Map 0..1 intensity to neon palette (deep blue → cyan → magenta)
function colorFor(v: number): [number, number, number] {
  const c = Math.min(1, Math.max(0, v));
  // stops
  const stops: [number, [number, number, number]][] = [
    [0.0, [8, 14, 36]],
    [0.25, [20, 60, 120]],
    [0.5, [40, 200, 230]],
    [0.75, [160, 90, 230]],
    [1.0, [255, 90, 180]],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, c0] = stops[i];
    const [p1, c1] = stops[i + 1];
    if (c <= p1) {
      const t = (c - p0) / (p1 - p0);
      return [c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, c0[2] + (c1[2] - c0[2]) * t];
    }
  }
  return stops[stops.length - 1][1];
}

export function Spectrogram() {
  const ref = useRef<HTMLCanvasElement>(null);
  const tick = usePlasmaStore((s) => s.tick);
  const spectrogram = usePlasmaStore((s) => s.spectrogram);
  const bins = usePlasmaStore((s) => s.spectroBins);
  const cols = usePlasmaStore((s) => s.spectroCols);
  const anomaly = usePlasmaStore((s) => s.anomaly);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    ctx.scale(dpr, dpr);

    const cellW = cw / cols;
    const cellH = ch / bins;
    for (let x = 0; x < cols; x++) {
      const col = spectrogram[x];
      for (let y = 0; y < bins; y++) {
        const v = col[y];
        const [r, g, b] = colorFor(v);
        ctx.fillStyle = `rgb(${r|0}, ${g|0}, ${b|0})`;
        ctx.fillRect(x * cellW, ch - (y + 1) * cellH, Math.ceil(cellW) + 0.5, Math.ceil(cellH) + 0.5);
      }
    }

    // anomaly overlay box
    if (anomaly?.active) {
      const elapsed = performance.now() - anomaly.startedAt;
      const p = Math.min(1, elapsed / anomaly.durationMs);
      const x = cw * (1 - 0.25);
      const w = cw * 0.22 * p;
      ctx.strokeStyle = "rgba(255, 90, 180, 0.9)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(x - w, 4, w, ch - 8);
      ctx.setLineDash([]);
    }
  }, [tick, spectrogram, bins, cols, anomaly]);

  return (
    <div className="relative h-full w-full">
      <canvas ref={ref} className="h-full w-full rounded-md" />
      <div className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-inset ring-white/5" />
    </div>
  );
}
