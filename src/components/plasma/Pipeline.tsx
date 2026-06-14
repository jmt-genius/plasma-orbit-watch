import { usePlasmaStore, type Stage } from "@/lib/plasma/store";
import { cn } from "@/lib/utils";

const STAGES: { id: Stage; label: string }[] = [
  { id: "sensor", label: "Sensor" },
  { id: "signal", label: "Signal DSP" },
  { id: "anomaly", label: "Anomaly" },
  { id: "features", label: "Features" },
  { id: "classifier", label: "Classifier" },
  { id: "orbit", label: "Orbit" },
  { id: "viz", label: "Telemetry" },
];

export function Pipeline() {
  const active = usePlasmaStore((s) => s.activeStage);
  const anomaly = usePlasmaStore((s) => s.anomaly);
  const flowing = !!anomaly?.active;
  const activeIdx = STAGES.findIndex((s) => s.id === active);

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      {STAGES.map((s, i) => {
        const isActive = i <= activeIdx;
        const isCurrent = s.id === active;
        return (
          <div key={s.id} className="flex items-center gap-2 shrink-0">
            <div
              className={cn(
                "rounded-md border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] font-display transition-all",
                isActive
                  ? "border-[var(--cyan-glow)]/60 bg-[var(--cyan-glow)]/10 text-[color:var(--cyan-glow)]"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground",
                isCurrent && "animate-pulse-glow",
              )}
            >
              {s.label}
            </div>
            {i < STAGES.length - 1 && (
              <svg width="28" height="10" viewBox="0 0 28 10" className="shrink-0">
                <line
                  x1="0" y1="5" x2="28" y2="5"
                  stroke={isActive ? "oklch(0.82 0.18 200)" : "rgba(255,255,255,0.12)"}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className={flowing && i <= activeIdx ? "animate-flow-dash" : ""}
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
