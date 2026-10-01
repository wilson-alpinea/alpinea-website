"use client";

// Aviso mostrado quando o cliente volta da página de pagamento da Stone
// (?pagamento=concluido, ver urlSucesso nas rotas *-selfservice) — pedido
// do Wilson, 01/out/2026. O retorno não prova que o pagamento foi
// aprovado (o Pix pode ainda estar sendo processado): a confirmação real
// vem do webhook da Pagar.me, por e-mail. Por isso o texto fala em
// "recebemos" e "confirmação por e-mail", não em "pago".

import { useState, useSyncExternalStore } from "react";

function assinarNada() {
  return () => {};
}
function lerRetorno() {
  return new URLSearchParams(window.location.search).get("pagamento") === "concluido";
}
function retornoNoServidor() {
  return false;
}

export function AvisoPagamentoConcluido() {
  const voltouDoPagamento = useSyncExternalStore(assinarNada, lerRetorno, retornoNoServidor);
  const [fechado, setFechado] = useState(false);
  if (!voltouDoPagamento || fechado) return null;

  return (
    <div role="status" className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-black sm:p-6">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-emerald-950">Pagamento recebido — obrigado!</p>
        <p className="mt-1 text-sm leading-relaxed text-emerald-900">
          Assim que a Stone confirmar, você recebe a confirmação por e-mail e nossa equipe segue com o seu pedido pelo
          WhatsApp. No Pix, a confirmação costuma levar só alguns minutos.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setFechado(true)}
        aria-label="Fechar aviso"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl leading-none text-emerald-800 transition hover:bg-emerald-100"
      >
        ×
      </button>
    </div>
  );
}
