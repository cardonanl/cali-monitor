"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Dot,
} from "recharts";
import { DayBucket } from "@/lib/stats";

export function WeeklyChart({ data }: { data: DayBucket[] }) {
  if (!data.length) return (
    <p className="text-xs text-center py-6" style={{ color: "var(--text-muted)" }}>
      Sin datos aún
    </p>
  );

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748b", fontSize: 9 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          domain={[0, maxCount]}
          width={28}
        />
        <Tooltip
          contentStyle={{ backgroundColor: "#0d1526", border: "1px solid #1e2f4d", borderRadius: 6 }}
          labelStyle={{ color: "#e2e8f0", fontSize: 12 }}
          itemStyle={{ color: "#38bdf8", fontSize: 11 }}
          cursor={{ stroke: "#1e2f4d" }}
          formatter={(v) => [v, "Noticias"]}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#38bdf8"
          strokeWidth={2}
          dot={<Dot r={3} fill="#38bdf8" stroke="#0d1526" strokeWidth={1} />}
          activeDot={{ r: 5, fill: "#38bdf8" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
