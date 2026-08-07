"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function NovosClientesChart({ dados }: { dados: { data: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={dados} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="novosClientesGradiente" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f5aa8" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#2f5aa8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
        <XAxis
          dataKey="data"
          tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 11 }}
          axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          cursor={{ stroke: "rgba(0,0,0,0.15)" }}
          contentStyle={{
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.12)",
            borderRadius: 12,
            fontSize: 12,
            color: "#000",
            boxShadow: "0 12px 30px -12px rgba(0,0,0,0.25)",
          }}
          labelStyle={{ color: "rgba(0,0,0,0.5)" }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#2f5aa8"
          strokeWidth={2}
          fill="url(#novosClientesGradiente)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
