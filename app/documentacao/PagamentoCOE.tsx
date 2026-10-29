"use client";

// Escolha da forma de pagamento do Certificado de Elegibilidade (Wilson,
// 29/out/2026): reais (Stone, checkout automático da 1ª parcela de 50%) ou
// ienes (depósito na conta da Ajisai Japan, prazo de 2 dias; um consultor
// entra em contato). Usado na solicitação online e no portal do processo.

import { useState } from "react";
import { VERDE, display } from "./componentes";
import { PagarStone, type InfoPagamento } from "./processo/[id]/PortalProcesso";

export const CONTA_JAPAO = {
  empresa: "AJISAI JAPAN株式会社",
  empresaKana: "アジサイジヤパン（カ",
  banco: "ドコモSMTBネット銀行 (Docomo SMTB Net Bank)",
  codigoBanco: "0038",
  agencia: "106 — 法人第一支店",
  conta: "2495885 — 普通 (conta comum)",
  beneficiario: "アジサイジヤパン（カ",
};

const iene = (v: number) => `¥${Math.round(v).toLocaleString("ja-JP")}`;

export function PagamentoCOE({ id, token, totalJPY, info, zap }: { id: string; token: string; totalJPY: number | null; info: InfoPagamento; zap: string }) {
  const [forma, setForma] = useState<"" | "reais" | "ienes">("");
  const [enviando, setEnviando] = useState(false);
  const [prazo, setPrazo] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const parcela = totalJPY ? totalJPY / 2 : null;

  async function escolherIenes() {
    setErro(null);
    setEnviando(true);
    const r = await fetch("/api/documentacao-processo/pagamento-iene", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, token }) }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    setEnviando(false);
    if (!r?.ok) setErro(d?.error || "Não foi possível registrar agora. Tente novamente.");
    else setPrazo(d.prazo);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5 text-white" style={{ background: VERDE }}>
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/60">Agora: 1ª parcela (50%)</p>
        <p className={`${display.className} mt-1 text-3xl`}>{parcela ? iene(parcela) : "50% do valor"}</p>
        <p className="mt-1 text-sm text-white/75">
          {totalJPY ? `de ${iene(totalJPY)} no total. ` : ""}Os outros 50% são pagos antes da entrada do pedido na imigração.
        </p>
      </div>

      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/70">Como você quer pagar?</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            { v: "reais" as const, t: "Em reais", d: "Cartão de crédito ou Pix, pela Stone, na hora. O valor em reais é calculado pela PTAX do dia." },
            { v: "ienes" as const, t: "Em ienes", d: "Depósito na conta da Ajisai Japan, no Japão, em até 2 dias." },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              aria-pressed={forma === o.v}
              onClick={() => setForma(o.v)}
              className={`rounded-2xl border p-4 text-left transition ${forma === o.v ? "border-transparent text-white" : "border-black/15 bg-white hover:border-black/35"}`}
              style={forma === o.v ? { background: VERDE } : undefined}
            >
              <span className="block text-sm font-semibold">{o.t}</span>
              <span className={`mt-1 block text-xs leading-5 ${forma === o.v ? "text-white/80" : "text-black/55"}`}>{o.d}</span>
            </button>
          ))}
        </div>
      </div>

      {forma === "reais" && <PagarStone id={id} token={token} info={info} zap={zap} />}

      {forma === "ienes" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
            <p className="border-b border-black/10 px-5 py-3 text-sm font-semibold text-black">Dados para depósito — Bank Account Details</p>
            <dl className="divide-y divide-black/5 text-sm">
              {[
                ["Empresa (oficial)", CONTA_JAPAO.empresa],
                ["Empresa (katakana)", CONTA_JAPAO.empresaKana],
                ["Banco", CONTA_JAPAO.banco],
                ["Código do banco (金融機関コード)", CONTA_JAPAO.codigoBanco],
                ["Agência (支店コード)", CONTA_JAPAO.agencia],
                ["Conta (口座番号)", CONTA_JAPAO.conta],
                ["Beneficiário (口座名義人)", CONTA_JAPAO.beneficiario],
                ["Valor", parcela ? `${iene(parcela)} (1ª parcela, 50%)` : "50% do valor"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[minmax(0,45%)_1fr] gap-3 px-5 py-2.5">
                  <dt className="text-black/55">{k}</dt>
                  <dd className="font-medium text-black">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          {prazo ? (
            <p className="rounded-2xl p-4 text-sm leading-6 text-black/75" style={{ background: `${VERDE}0D` }}>
              Registrado. Faça o depósito até <strong>{prazo}</strong>. Um consultor da Ajisai vai entrar em contato para ajudar e confirmar o recebimento — seu processo começa assim que o depósito for confirmado.
            </p>
          ) : (
            <>
              <p className="text-xs leading-5 text-black/55">Prazo de 2 dias para o depósito. Depois de confirmar, um consultor entra em contato para auxiliar.</p>
              <button type="button" onClick={() => void escolherIenes()} disabled={enviando} className="flex min-h-[52px] w-full max-w-md items-center justify-center rounded-full px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white disabled:opacity-50" style={{ background: VERDE }}>
                {enviando ? "Registrando…" : "Vou pagar em ienes por depósito"}
              </button>
            </>
          )}
          {erro && <p role="alert" className="text-xs text-red-600">{erro}</p>}
        </div>
      )}
    </div>
  );
}
