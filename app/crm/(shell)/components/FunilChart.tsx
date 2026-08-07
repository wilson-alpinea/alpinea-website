"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export function FunilChart({
  dados,
}: {
  dados: { estagio: string; label: string; total: number; cor: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={dados} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 10 }}
          axisLine={{ stroke: "rgba(0,0,0,0.1)" }}
          tickLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={50}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: "rgba(0,0,0,0.4)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
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
        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
          {dados.map((d) => (
            <Cell key={d.estagio} fill={d.cor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
