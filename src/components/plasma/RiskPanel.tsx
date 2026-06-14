import { usePlasmaStore } from "@/lib/plasma/store";
import { cn } from "@/lib/utils";

export function RiskPanel() {
  const r = usePlasmaStore((s) => s.liveRisk);
  const level = r?.level ?? "Low";
  const isHigh = level === "High";

  const colorClass =
    level === "High" ? "neon-text-danger" : level === "Medium" ? "text-[color:var(--amber-glow)]" : "neon-text-emerald";

  return (
    <div className={cn("rounded-lg border border-white/5 p-3 transition-all", isHigh && "animate-pulse-danger")}>
      <div className="flex items-center justify-between">
        <div className="text-[9px] uppercase tracking-[0.14em] font-display text-muted-foreground">Collision Risk</div>
        <div className={cn("data-value text-sm font-display", colorClass)}>{level.toUpperCase()}</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground font-display">Closest Appr.</div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="data-value text-base">{r ? r.closestApproachKm.toFixed(1) : "—"}</span>
            <span className="text-[9px] text-muted-foreground font-mono shrink-0">km</span>
          </div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground font-display">Probability</div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="data-value text-base">{r ? (r.probability * 100).toFixed(1) : "—"}</span>
            <span className="text-[9px] text-muted-foreground font-mono shrink-0">%</span>
          </div>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full"
          style={{
            width: r ? `${Math.min(100, r.probability * 100)}%` : "0%",
            background: "var(--gradient-risk)",
            transition: "width 600ms ease",
          }}
        />
      </div>
    </div>
  );
}
