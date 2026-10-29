"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Colunas por dia com uma ou mais séries (Visões gerais de Seguro e
// Documentação, Wilson 29/out/2026). `empilhar` soma as séries numa coluna
// só (ex.: cadastros por serviço); sem ele, as colunas ficam lado a lado.
const fmtDia = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export type SerieGrafico = { chave: string; rotulo: string; cor: string };

export function GraficoDiario({ dados, series, empilhar = false, altura = 200 }: { dados: Record<string, string | number>[]; series: SerieGrafico[]; empilhar?: boolean; altura?: number }) {
  const maximo = Math.max(
    1,
    ...dados.map((d) => (empilhar ? series.reduce((s, x) => s + Number(d[x.chave] ?? 0), 0) : Math.max(...series.map((x) => Number(d[x.chave] ?? 0))))),
  );
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart data={dados} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barGap={2}>
        <CartesianGrid stroke="#EEF0F2" vertical={false} />
        <XAxis dataKey="dia" tickFormatter={fmtDia} tick={{ fill: "#626B75", fontSize: 12 }} axisLine={{ stroke: "#D5DAE0" }} tickLine={false} interval="preserveStartEnd" minTickGap={18} />
        <YAxis allowDecimals={false} domain={[0, maximo]} tick={{ fill: "#626B75", fontSize: 12 }} axisLine={false} tickLine={false} width={34} />
        <Tooltip
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
          labelFormatter={(v) => {
            const s = String(v);
            return `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}`;
          }}
          contentStyle={{ background: "#fff", border: "1px solid #E6E9ED", borderRadius: 10, fontSize: 13, color: "#20252B" }}
          labelStyle={{ color: "#626B75" }}
        />
        {series.length > 1 && <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 13, color: "#626B75", paddingTop: 6 }} />}
        {series.map((s, i) => (
          <Bar
            key={s.chave}
            dataKey={s.chave}
            name={s.rotulo}
            fill={s.cor}
            stackId={empilhar ? "a" : undefined}
            radius={empilhar ? (i === series.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]) : [3, 3, 0, 0]}
            maxBarSize={empilhar ? 22 : 14}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
