"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Novos clientes por dia (Visão geral, 22/out/2026): colunas simples,
// contagens inteiras, eixo numérico e tooltip.
const fmtDia = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export function NovosClientesChart({ dados }: { dados: { dia: string; total: number }[] }) {
  const maximo = Math.max(1, ...dados.map((d) => d.total));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={dados} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="#EEF0F2" vertical={false} />
        <XAxis
          dataKey="dia"
          tickFormatter={fmtDia}
          tick={{ fill: "#626B75", fontSize: 12 }}
          axisLine={{ stroke: "#D5DAE0" }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={18}
        />
        <YAxis allowDecimals={false} domain={[0, maximo]} tick={{ fill: "#626B75", fontSize: 12 }} axisLine={false} tickLine={false} width={34} />
        <Tooltip
          cursor={{ fill: "rgba(36,71,107,0.06)" }}
          labelFormatter={(v) => {
            const s = String(v);
            return `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}`;
          }}
          formatter={(v) => [`${v} ${Number(v) === 1 ? "cliente" : "clientes"}`, "Novos"]}
          contentStyle={{ background: "#fff", border: "1px solid #E6E9ED", borderRadius: 10, fontSize: 13, color: "#20252B" }}
          labelStyle={{ color: "#626B75" }}
        />
        <Bar dataKey="total" fill="#24476B" radius={[3, 3, 0, 0]} maxBarSize={22} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
