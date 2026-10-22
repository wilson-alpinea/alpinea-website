"use client";

import { useFormStatus } from "react-dom";

// Botão de envio com estado "salvando" — o cadastro leva alguns segundos e
// sem retorno parecia que nada acontecia (Wilson, 21/out/2026).
export function BotaoSalvar({
  rotulo,
  className,
  rotuloPendente,
}: {
  rotulo: string;
  className: string;
  rotuloPendente?: string;
}) {
  const { pending } = useFormStatus();
  const pendente = rotuloPendente ?? (rotulo.startsWith("Cadastrar") ? "Cadastrando…" : "Salvando…");
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${className} disabled:cursor-wait disabled:opacity-70`}>
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
          {pendente}
        </span>
      ) : (
        rotulo
      )}
    </button>
  );
}
