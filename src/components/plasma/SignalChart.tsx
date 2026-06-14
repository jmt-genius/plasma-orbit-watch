import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, ReferenceLine } from "recharts";
import { usePlasmaStore } from "@/lib/plasma/store";

export function SignalChart() {
  const samples = usePlasmaStore((s) => s.samples);
  const data = samples.map((s) => ({ t: s.t, amp: s.amp, freq: s.freq / 100 }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
        <XAxis dataKey="t" hide />
        <YAxis domain={[-30, 6]} tick={{ fill: "rgba(180,200,230,0.5)", fontSize: 10, fontFamily: "JetBrains Mono" }} width={32} axisLine={false} tickLine={false} />
        <ReferenceLine y={0} stroke="rgba(120,220,255,0.15)" />
        <Line type="monotone" dataKey="amp" stroke="oklch(0.82 0.18 200)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        <Line type="monotone" dataKey="freq" stroke="oklch(0.70 0.24 295)" strokeWidth={1} dot={false} isAnimationActive={false} opacity={0.7} />
      </LineChart>
    </ResponsiveContainer>
  );
}
