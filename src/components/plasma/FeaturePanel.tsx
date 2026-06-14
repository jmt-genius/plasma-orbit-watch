import { usePlasmaStore } from "@/lib/plasma/store";

function Metric({ label, value, unit, accent = "cyan" }: { label: string; value: string; unit: string; accent?: "cyan" | "purple" | "emerald" }) {
  const color = accent === "purple" ? "neon-text-purple" : accent === "emerald" ? "neon-text-emerald" : "neon-text-cyan";
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-display">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`data-value text-xl ${color}`}>{value}</span>
        <span className="text-[10px] text-muted-foreground font-mono">{unit}</span>
      </div>
    </div>
  );
}

export function FeaturePanel() {
  const f = usePlasmaStore((s) => s.liveFeatures);
  const v = (n: number | undefined, d = 1) => (n == null ? "—" : n.toFixed(d));
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
      <Metric label="Amplitude Drop" value={v(f?.amplitudeDrop, 1)} unit="dB" />
      <Metric label="Doppler Shift" value={v(f?.dopplerShift, 0)} unit="Hz" accent="purple" />
      <Metric label="Duration" value={v(f?.duration, 0)} unit="ms" accent="emerald" />
      <Metric label="SNR" value={v(f?.snr, 1)} unit="dB" />
      <Metric label="Bandwidth" value={v(f?.bandwidth, 0)} unit="Hz" accent="purple" />
    </div>
  );
}
