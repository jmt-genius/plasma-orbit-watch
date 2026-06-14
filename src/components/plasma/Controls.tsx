import { usePlasmaStore, type SizeClass } from "@/lib/plasma/store";
import { cn } from "@/lib/utils";

const SIZES: SizeClass[] = ["1cm", "3cm", "5cm", "10cm"];

export function Controls() {
  const { selectedSize, selectedVelocity, setSize, setVelocity, injectEvent, autoMode, toggleAuto, anomaly } =
    usePlasmaStore();
  const busy = !!anomaly?.active;

  return (
    <div className="space-y-4">
      <div>
        <div className="section-title mb-2">Object Size</div>
        <div className="grid grid-cols-4 gap-1">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={cn(
                "rounded-md border px-2 py-1.5 text-xs font-mono transition-all",
                selectedSize === s
                  ? "border-[var(--cyan-glow)]/70 bg-[var(--cyan-glow)]/10 text-[color:var(--cyan-glow)] shadow-[0_0_18px_-4px_var(--cyan-glow)]"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="section-title">Velocity</span>
          <span className="data-value text-xs neon-text-purple">{selectedVelocity.toFixed(2)} km/s</span>
        </div>
        <input
          type="range"
          min={5.5}
          max={11.2}
          step={0.05}
          value={selectedVelocity}
          onChange={(e) => setVelocity(parseFloat(e.target.value))}
          className="w-full accent-[color:var(--cyan-glow)]"
        />
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={injectEvent}
          disabled={busy}
          className={cn(
            "group relative w-full rounded-md border px-3 py-2.5 text-xs font-display uppercase tracking-[0.18em] transition-all",
            "border-[var(--cyan-glow)]/60 bg-gradient-to-r from-[var(--cyan-glow)]/15 to-[var(--purple-glow)]/15",
            "hover:from-[var(--cyan-glow)]/30 hover:to-[var(--purple-glow)]/30",
            "disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_24px_-6px_var(--cyan-glow)]",
          )}
        >
          {busy ? "● Detecting…" : "⚡ Simulate Debris Event"}
        </button>
        <label className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs">
          <span className="font-display uppercase tracking-[0.18em] text-muted-foreground">Auto Demo</span>
          <button
            onClick={toggleAuto}
            className={cn(
              "relative h-5 w-9 rounded-full border transition-colors",
              autoMode ? "border-[var(--cyan-glow)]/60 bg-[var(--cyan-glow)]/30" : "border-white/15 bg-white/5",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform",
                autoMode ? "translate-x-4" : "translate-x-0.5",
              )}
            />
          </button>
        </label>
      </div>
    </div>
  );
}
