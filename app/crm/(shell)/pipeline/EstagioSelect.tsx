"use client";

import { useState } from "react";

type OpcaoEstagio = { valor: string; label: string };

// Pedido do Wilson, 19/set/2026 ("falta deixar campo de data obrigatorio ao
// mudar cada etapa"): antes o <select> submetia sozinho ao trocar de valor
// (onChange -> requestSubmit). Agora, ao escolher uma etapa diferente da
// atual, revela (exposição progressiva) um campo de data obrigatório +
// botão "Confirmar" — só aí o form é de fato enviado. O <input required>
// bloqueia o envio via validação nativa do HTML5 se a data ficar vazia.
// Generalizado (prop `estagios`) para servir tanto o funil de vendas
// quanto o novo fluxograma de entrega — mesmo componente, listas
// diferentes.
export function EstagioSelect({
  action,
  estagios,
  estagioAtual,
  className,
}: {
  action: (formData: FormData) => void;
  estagios: OpcaoEstagio[];
  estagioAtual: string;
  className?: string;
}) {
  const [selecionado, setSelecionado] = useState(estagioAtual);
  const mudou = selecionado !== estagioAtual;

  const selectClass =
    className ??
    "w-full rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs text-black/70 outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10";

  return (
    <form action={action} className="space-y-2">
      <select
        name="estagio"
        value={selecionado}
        onChange={(e) => setSelecionado(e.target.value)}
        className={selectClass}
      >
        {estagios.map((e) => (
          <option key={e.valor} value={e.valor}>
            {e.label}
          </option>
        ))}
      </select>

      {mudou && (
        <div className="flex items-center gap-1.5 rounded-lg border border-[#1C3A5E]/15 bg-[#1C3A5E]/[0.04] p-1.5">
          <input
            type="date"
            name="data"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="min-w-0 flex-1 rounded-md border border-black/10 bg-white px-2 py-1 text-xs text-black outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10"
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-[#1C3A5E] px-2.5 py-1 text-xs font-medium text-white transition hover:bg-[#254a73]"
          >
            Confirmar
          </button>
          <button
            type="button"
            onClick={() => setSelecionado(estagioAtual)}
            title="Cancelar"
            aria-label="Cancelar"
            className="shrink-0 px-1 text-sm leading-none text-black/30 transition hover:text-black/60"
          >
            ×
          </button>
        </div>
      )}
    </form>
  );
}
