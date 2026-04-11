"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot } from "recharts";
import { DayBucket } from "@/lib/stats";

export function WeeklyChart({ data }: { data: DayBucket[] }) {
  if (!data.length) return (
    <p className="text-base py-6" style={{ color: "var(--yellow)" }}>&gt; SIN DATOS AÚN_</p>
  );

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <XAxis dataKey="date"
          tick={{ fill: "#ffd700", fontSize: 11, fontFamily: "Share Tech Mono, monospace" }}
          axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#ffd700", fontSize: 11, fontFamily: "Share Tech Mono, monospace" }}
          axisLine={false} tickLine={false} allowDecimals={false} domain={[0, maxCount]} width={28} />
        <Tooltip
          contentStyle={{ backgroundColor: "#111111", border: "1px solid #2e2e2e", borderRadius: 0, fontFamily: "Share Tech Mono, monospace" }}
          labelStyle={{ color: "#ffffff", fontSize: 13 }}
          itemStyle={{ color: "#00dd44", fontSize: 13 }}
          cursor={{ stroke: "#2e2e2e" }}
          formatter={(v) => [v, "NOTICIAS"]}
        />
        <Line type="monotone" dataKey="count" stroke="#00dd44" strokeWidth={2}
          dot={<Dot r={3} fill="#00dd44" stroke="#111111" strokeWidth={1} />}
          activeDot={{ r: 5, fill: "#00dd44" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
