import { usePlasmaStore } from "@/lib/plasma/store";

export function ClassificationPanel() {
  const c = usePlasmaStore((s) => s.liveClassification);
  const conf = c ? Math.round(c.confidence * 100) : 0;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-white/5 bg-white/[0.02] p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-display">Size Class</div>
          <div className="mt-1 data-value text-2xl neon-text-cyan">{c?.size ?? "—"}</div>
        </div>
        <div className="rounded-md border border-white/5 bg-white/[0.02] p-3">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-display">Velocity</div>
          <div className="mt-1 data-value text-2xl neon-text-purple">
            {c ? c.velocity.toFixed(2) : "—"}
            <span className="ml-1 text-[10px] text-muted-foreground font-mono">km/s</span>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-display">
          <span>Confidence</span>
          <span className="data-value text-foreground">{conf}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${conf}%`,
              background: "linear-gradient(90deg, var(--cyan-glow), var(--purple-glow))",
              boxShadow: "0 0 12px color-mix(in oklab, var(--cyan-glow) 60%, transparent)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
