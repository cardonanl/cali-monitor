"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot } from "recharts";
import { DayBucket } from "@/lib/stats";

export function WeeklyChart({ data }: { data: DayBucket[] }) {
  if (!data.length) return (
    <p className="text-sm py-6" style={{ color: "var(--ink-muted)" }}>Sin datos aún.</p>
  );

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <XAxis dataKey="date"
          tick={{ fill: "#8C857C", fontSize: 11, fontFamily: "var(--font-mono), monospace" }}
          axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#8C857C", fontSize: 11, fontFamily: "var(--font-mono), monospace" }}
          axisLine={false} tickLine={false} allowDecimals={false} domain={[0, maxCount]} width={28} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#F0EDE6",
            border: "1px solid #D4CFC6",
            borderRadius: 2,
            fontFamily: "var(--font-mono), monospace",
          }}
          labelStyle={{ color: "#1A1814", fontSize: 12 }}
          itemStyle={{ color: "#3333FF", fontSize: 12 }}
          cursor={{ stroke: "#D4CFC6" }}
          formatter={(v) => [v, "noticias"]}
        />
        <Line type="monotone" dataKey="count" stroke="#3333FF" strokeWidth={2}
          dot={<Dot r={3} fill="#3333FF" stroke="#F0EDE6" strokeWidth={1} />}
          activeDot={{ r: 5, fill: "#3333FF" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
