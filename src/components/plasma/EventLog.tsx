import { usePlasmaStore } from "@/lib/plasma/store";
import { cn } from "@/lib/utils";

export function EventLog() {
  const events = usePlasmaStore((s) => s.events);
  if (!events.length) {
    return <div className="px-3 py-6 text-center text-xs text-muted-foreground font-mono">awaiting detections…</div>;
  }
  return (
    <div className="max-h-[260px] overflow-y-auto pr-1">
      <table className="w-full text-left text-xs font-mono">
        <thead className="sticky top-0 bg-[color:var(--background)]/80 backdrop-blur">
          <tr className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground font-display">
            <th className="px-2 py-2 font-normal">Time</th>
            <th className="px-2 py-2 font-normal">Size</th>
            <th className="px-2 py-2 font-normal">Vel</th>
            <th className="px-2 py-2 font-normal">Conf</th>
            <th className="px-2 py-2 font-normal">Risk</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => {
            const t = new Date(e.timestamp);
            const time = t.toLocaleTimeString([], { hour12: false });
            const riskColor =
              e.risk.level === "High" ? "text-[color:var(--danger-glow)]"
              : e.risk.level === "Medium" ? "text-[color:var(--amber-glow)]"
              : "text-[color:var(--emerald-glow)]";
            return (
              <tr key={e.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-2 py-1.5 text-muted-foreground">{time}</td>
                <td className="px-2 py-1.5 neon-text-cyan">{e.classification.size}</td>
                <td className="px-2 py-1.5">{e.classification.velocity.toFixed(2)} km/s</td>
                <td className="px-2 py-1.5">{(e.classification.confidence * 100).toFixed(0)}%</td>
                <td className={cn("px-2 py-1.5 font-display", riskColor)}>{e.risk.level}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
