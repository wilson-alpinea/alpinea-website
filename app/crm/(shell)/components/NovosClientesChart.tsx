"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function NovosClientesChart({ dados }: { dados: { data: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={dados} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="novosClientesGradiente" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5b9bd5" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#5b9bd5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="data"
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          cursor={{ stroke: "rgba(255,255,255,0.15)" }}
          contentStyle={{
            background: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            fontSize: 12,
            color: "#fff",
          }}
          labelStyle={{ color: "rgba(255,255,255,0.5)" }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#5b9bd5"
          strokeWidth={2}
          fill="url(#novosClientesGradiente)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
