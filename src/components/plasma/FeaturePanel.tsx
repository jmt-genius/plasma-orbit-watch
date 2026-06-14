import { usePlasmaStore } from "@/lib/plasma/store";

function Metric({ label, value, unit, accent = "cyan" }: { label: string; value: string; unit: string; accent?: "cyan" | "purple" | "emerald" }) {
  const color = accent === "purple" ? "neon-text-purple" : accent === "emerald" ? "neon-text-emerald" : "neon-text-cyan";
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground font-display truncate" title={label}>{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`data-value text-lg leading-tight ${color}`}>{value}</span>
        <span className="text-[9px] text-muted-foreground font-mono shrink-0">{unit}</span>
      </div>
    </div>
  );
}

export function FeaturePanel() {
  const f = usePlasmaStore((s) => s.liveFeatures);
  const v = (n: number | undefined, d = 1) => (n == null ? "—" : n.toFixed(d));
  return (
    <div className="space-y-2">
      {/* First row: 2 columns */}
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Amp Drop" value={v(f?.amplitudeDrop, 1)} unit="dB" />
        <Metric label="Doppler" value={v(f?.dopplerShift, 0)} unit="Hz" accent="purple" />
      </div>
      {/* Second row: 3 columns */}
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Duration" value={v(f?.duration, 0)} unit="ms" accent="emerald" />
        <Metric label="SNR" value={v(f?.snr, 1)} unit="dB" />
        <Metric label="BW" value={v(f?.bandwidth, 0)} unit="Hz" accent="purple" />
      </div>
    </div>
  );
}
