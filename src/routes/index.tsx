import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Spectrogram } from "@/components/plasma/Spectrogram";
import { SignalChart } from "@/components/plasma/SignalChart";
import { Pipeline } from "@/components/plasma/Pipeline";
import { FeaturePanel } from "@/components/plasma/FeaturePanel";
import { ClassificationPanel } from "@/components/plasma/ClassificationPanel";
import { RiskPanel } from "@/components/plasma/RiskPanel";
import { EventLog } from "@/components/plasma/EventLog";
import { Controls } from "@/components/plasma/Controls";
import { OrbitGlobe } from "@/components/plasma/OrbitGlobe";
import { usePlasmaStore } from "@/lib/plasma/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PlasmaPing · Mission Control" },
      { name: "description", content: "Live simulated debris detection: signal processing, classification, orbital tracking, collision risk." },
      { property: "og:title", content: "PlasmaPing · Mission Control" },
      { property: "og:description", content: "Live simulated debris detection dashboard." },
    ],
  }),
  component: Dashboard,
});

function Panel({ title, accent = "cyan", children, className = "" }: { title: string; accent?: "cyan" | "purple" | "emerald"; children: React.ReactNode; className?: string }) {
  const dot =
    accent === "purple" ? "bg-[color:var(--purple-glow)] shadow-[0_0_8px_var(--purple-glow)]"
    : accent === "emerald" ? "bg-[color:var(--emerald-glow)] shadow-[0_0_8px_var(--emerald-glow)]"
    : "bg-[color:var(--cyan-glow)] shadow-[0_0_8px_var(--cyan-glow)]";
  return (
    <section className={`glass-panel flex flex-col overflow-hidden ${className}`}>
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
          <h2 className="section-title whitespace-nowrap">{title}</h2>
        </div>
      </header>
      <div className="flex-1 p-4 min-h-0">{children}</div>
    </section>
  );
}

function Clock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const update = () => setNow(new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC");
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="data-value text-xs text-muted-foreground">{now}</span>;
}

function Dashboard() {
  const start = usePlasmaStore((s) => s.start);
  const stop = usePlasmaStore((s) => s.stop);
  const running = usePlasmaStore((s) => s.running);
  const events = usePlasmaStore((s) => s.events);
  const anomaly = usePlasmaStore((s) => s.anomaly);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  return (
    <>
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col gap-3 p-4 md:p-6">
        {/* Header */}
        <header className="glass-panel flex flex-col gap-3 px-5 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="h-8 w-8 rounded-sm border border-[var(--cyan-glow)]/40 bg-[var(--cyan-glow)]/10" />
              <span className="absolute inset-0 m-auto block h-1.5 w-1.5 rounded-full bg-[color:var(--cyan-glow)]" />
            </div>
            <div>
              <h1 className="text-base leading-tight font-display tracking-[0.12em] text-foreground">PLASMAPING</h1>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-display">Disturbance-Based Debris Detection · CubeSat Mission Control</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5">
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${running ? "bg-[color:var(--emerald-glow)] shadow-[0_0_8px_var(--emerald-glow)] animate-pulse" : "bg-muted-foreground"}`} />
              <span className="text-[10px] uppercase tracking-[0.18em] font-display text-muted-foreground">{running ? "Telemetry Online" : "Offline"}</span>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] font-display text-muted-foreground">Mission Time</span>
              <Clock />
            </div>
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5">
              <span className="text-[10px] uppercase tracking-[0.18em] font-display text-muted-foreground">Detections</span>
              <span className="data-value neon-text-cyan">{events.length.toString().padStart(3, "0")}</span>
            </div>
          </div>
        </header>

        {/* Pipeline */}
        <div className="glass-panel px-5 py-3">
          <Pipeline />
        </div>

        {/* Main grid */}
        <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Left column */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <Panel title="Sensor Control" accent="cyan">
              <Controls />
            </Panel>
            <Panel title="Feature Extraction" accent="emerald" className="flex-1">
              <FeaturePanel />
            </Panel>
          </div>

          {/* Center column */}
          <div className="flex flex-col gap-3 lg:col-span-6">
            <Panel title="Live Spectrogram · RF Forward-Scatter" accent="cyan" className="spectrogram-panel">
              <Spectrogram />
            </Panel>
            <Panel title="Signal Stream · Amplitude / Doppler" accent="purple" className="signal-panel">
              <SignalChart />
            </Panel>
            <Panel title="Orbital Tracking · LEO Trajectory" accent="purple" className="flex-1 min-h-[380px]">
              <OrbitGlobe />
            </Panel>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <Panel title="Classification" accent="cyan">
              <ClassificationPanel />
            </Panel>
            <Panel title="Collision Risk" accent={anomaly?.active ? "purple" : "emerald"}>
              <RiskPanel />
            </Panel>
            <Panel title="Detection Log" accent="emerald" className="flex-1">
              <EventLog />
            </Panel>
          </div>
        </div>

        <footer className="flex items-center justify-between px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 font-display">
          <span>PlasmaPing v0.9 · Simulation Mode</span>
          <span>Orbit Altitude ~400km · Inc 51.6° · RF Forward-Scatter Analog</span>
        </footer>
      </div>
    </>
  );
}
