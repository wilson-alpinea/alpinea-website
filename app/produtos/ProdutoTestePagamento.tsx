"use client";

// Produto de TESTE de R$ 1,00 — pedido do Wilson, 30/set/2026: "nas
// paginas que temos checkout de pagamento self-service, crie um produto que
// custe 1 real, para teste deixe claro que esse produto é somente para
// testes e não tem nenhuma relação com os serviços a venda no site".
//
// Só aparece quando a página é aberta com ?teste=1 no endereço (decisão do
// Wilson via AskUserQuestion) — o visitante comum nunca vê. Usado em
// /produtos/jrpass, /produtos/seguro-viagem e /produtos/cambio, as páginas
// que cobram de verdade pela Stone/Pagar.me. O valor (R$ 1,00) é fixo no
// servidor (/api/pagamento-teste) — o navegador não escolhe o preço.

import { useState, useSyncExternalStore } from "react";
import { abrirAbaPagamento, enviarParaPagamento, fecharAba } from "./pagamentoNovaAba";

type ProdutoTeste = "jrpass" | "seguro-viagem" | "cambio";

const NOME_PAGINA: Record<ProdutoTeste, string> = {
  jrpass: "JR Pass",
  "seguro-viagem": "Seguro Viagem",
  cambio: "Câmbio",
};

// Lê ?teste=1 sem useSearchParams (que exigiria Suspense na página) e sem
// setState dentro de efeito.
function assinarNada() {
  return () => {};
}
function lerModoTeste() {
  return new URLSearchParams(window.location.search).get("teste") === "1";
}
function modoTesteNoServidor() {
  return false;
}

/** true quando a página foi aberta com ?teste=1 (pedido de teste com o
 * fluxo completo — JR Pass e Seguro Viagem fictícios, Wilson 06/out/2026). */
export function useModoTeste(): boolean {
  return useSyncExternalStore(assinarNada, lerModoTeste, modoTesteNoServidor);
}

/** Aviso + atalho do pedido FICTÍCIO com o fluxo completo (formulário real,
 * CRM, e-mails, Stone) cobrando R$ 1,00. Só aparece com ?teste=1. */
export function PainelPedidoTeste({
  ativo,
  marcado,
  onMarcar,
  onPreencher,
  nomeProduto,
}: {
  ativo: boolean;
  marcado: boolean;
  onMarcar: (v: boolean) => void;
  onPreencher: () => void;
  nomeProduto: string;
}) {
  if (!ativo) return null;
  return (
    <section aria-label="Pedido fictício de teste" className="mt-4 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 p-5 text-black sm:p-6">
      <p className="inline-block rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
        {nomeProduto} fictício — teste do fluxo completo
      </p>
      <p className="mt-2 text-sm leading-relaxed text-amber-900">
        Com a opção abaixo marcada, o formulário desta página vira um <strong>pedido de teste</strong>: passa por todas as
        etapas reais (registro no CRM marcado como <strong>[TESTE]</strong>, e-mails para a equipe e para o cliente,
        pagamento na Stone e webhook de confirmação), mas a cobrança é sempre de <strong>R$ 1,00</strong>, sem frete, e nada
        é emitido. O valor é fixado no servidor.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2.5">
          <input type="checkbox" checked={marcado} onChange={(e) => onMarcar(e.target.checked)} className="h-5 w-5 rounded border-amber-400" />
          <span className="text-sm font-medium text-amber-950">Enviar como pedido de teste (R$ 1,00)</span>
        </label>
        <button
          type="button"
          onClick={onPreencher}
          className="h-10 rounded-full bg-amber-600 px-5 text-sm font-semibold text-white transition hover:bg-amber-700"
        >
          Preencher com dados fictícios
        </button>
      </div>
      <p className="mt-2 text-xs text-amber-900">Troque o e-mail pelo seu para receber as mensagens do fluxo.</p>
    </section>
  );
}

export function ProdutoTestePagamento({ produto }: { produto: ProdutoTeste }) {
  const ativo = useModoTeste();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [ciente, setCiente] = useState(false);
  const [status, setStatus] = useState<"form" | "enviando" | "erro" | "sem-gateway" | "aberto">("form");
  const [linkPagamento, setLinkPagamento] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  if (!ativo) return null;

  const valido = nome.trim().length >= 3 && /^\S+@\S+\.\S+$/.test(email.trim()) && ciente;

  async function pagar() {
    if (!valido || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    const janelaPagamento = abrirAbaPagamento();
    try {
      const resposta = await fetch("/api/pagamento-teste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produto, nome, email, ciente }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        fecharAba(janelaPagamento);
        setErro(dados.error || "Não foi possível criar o pagamento de teste.");
        setStatus("erro");
        return;
      }
      if (dados.checkoutUrl) {
        if (enviarParaPagamento(janelaPagamento, dados.checkoutUrl)) {
          setLinkPagamento(dados.checkoutUrl);
          setStatus("aberto");
        }
        return;
      }
      fecharAba(janelaPagamento);
      setStatus("sem-gateway");
    } catch {
      fecharAba(janelaPagamento);
      setErro("Não foi possível criar o pagamento de teste.");
      setStatus("erro");
    }
  }

  return (
    <section
      aria-label="Produto de teste"
      className="mt-6 rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50 p-5 text-black sm:p-6"
    >
      <p className="inline-block rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
        Produto de teste
      </p>
      <h2 className="mt-3 text-lg font-semibold text-amber-950">Teste de pagamento — R$ 1,00</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-amber-900">
        Este produto existe <strong>somente para testar o checkout</strong> da página de {NOME_PAGINA[produto]}.{" "}
        <strong>Não tem nenhuma relação com os serviços à venda no site</strong>, não gera pedido de {NOME_PAGINA[produto]} nem
        qualquer outro serviço, e fica registrado no CRM como TESTE.
        {produto === "cambio" ? " Pagamento só por Pix, como no Câmbio." : " Pagamento por Pix ou cartão."}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-amber-900">Nome</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="h-11 w-full rounded-lg border border-amber-300 bg-white px-3 text-sm text-black focus:border-amber-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-amber-900">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-lg border border-amber-300 bg-white px-3 text-sm text-black focus:border-amber-500 focus:outline-none"
          />
        </label>
      </div>
      <label className="mt-3 flex cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={ciente}
          onChange={(e) => setCiente(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-amber-400"
        />
        <span className="text-sm text-amber-950">Entendo que é um pagamento de teste de R$ 1,00, sem nenhum serviço associado.</span>
      </label>

      <button
        type="button"
        onClick={pagar}
        disabled={!valido || status === "enviando"}
        className="mt-4 h-11 rounded-full bg-amber-600 px-6 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "enviando" ? "Criando pagamento…" : "Pagar R$ 1,00 (teste)"}
      </button>
      {status === "aberto" && linkPagamento && (
        <p className="mt-2 text-sm text-amber-900">
          O pagamento de teste abriu em uma nova aba.{" "}
          <a href={linkPagamento} target="_blank" rel="noreferrer" className="font-medium underline">
            Não abriu? Abrir o pagamento
          </a>
        </p>
      )}
      {status === "erro" && <p className="mt-2 text-sm text-red-700">{erro}</p>}
      {status === "sem-gateway" && (
        <p className="mt-2 text-sm text-amber-900">
          Pedido de teste registrado no CRM, mas a Pagar.me não está configurada neste ambiente (PAGARME_SECRET_KEY) — nenhum
          link de pagamento foi criado.
        </p>
      )}
    </section>
  );
}
