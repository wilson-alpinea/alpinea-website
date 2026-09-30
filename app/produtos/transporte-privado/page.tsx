"use client";

// Transporte Privado — configurador em 4 etapas.
//
// Redesenho de UX pedido pelo Wilson em 29/set/2026 ("Melhore
// profundamente a UX desta página de contratação de Transporte Privado,
// sem descaracterizar o visual premium/silent luxury atual [...] a
// experiência deve deixar de parecer 'um formulário longo com várias
// opções' e passar a parecer 'um configurador premium de transporte
// privado em quatro etapas'"). O que mudou em relação à versão anterior
// (que ainda era o antigo TransporteModal esticado numa página):
// - Hero mais baixo, frase objetiva e "Como funciona" compacto numa linha.
// - Fluxo progressivo 1 Veículo → 2 Trajeto → 3 Dados → 4 Revisão, com
//   stepper fixo no topo (etapa atual em azul) — só uma etapa aparece por
//   vez, em vez de veículos + todas as rotas + formulário + termos juntos.
// - Veículos com capacidade em destaque ("Até 10 passageiros") e uma
//   diferenciação curta; selecionado com borda azul, fundo azul claro e
//   check. Rotas separadas em abas (Aeroporto | Cidade | Passeios 10h) +
//   filtro de região, cada rota como card selecionável com preço em
//   destaque; várias rotas podem ser somadas ao mesmo pedido.
// - Resumo do pedido sempre visível (painel lateral fixo no desktop,
//   barra inferior compacta e expansível no celular), com o total
//   "piscando" a cada mudança, e um CTA que muda conforme a etapa.
// - Nada de lista "Faltam N itens": validação ao lado de cada campo e,
//   no resumo, só uma frase do que falta.
// - Incluído / Não incluído / Opcionais perto da escolha das rotas, com
//   "Ver regras e adicionais" num modal; motorista bilíngue virou um
//   opcional (checkbox), não um alerta amarelo.
// - Termos: checkbox + "Ler Termos e Condições" em modal — acabou a caixa
//   com rolagem obrigatória até o fim.
// - Data do serviço, horário aproximado e número do voo em campos
//   próprios; etapa final de revisão antes de enviar.
// Sem pagamento automático (decisão do Wilson para este produto): o envio
// registra o pedido no CRM (/api/transporte-privado-selfservice) e a
// equipe fecha logística e pagamento pelo WhatsApp. Preços, veículos e
// rotas continuam vindo de app/lib/motoristaPrivadoRotas.ts (mesma fonte
// da Calculadora Reversa e do self-service).

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Inter } from "next/font/google";
import Link from "next/link";
import { formatBRL, formatUSD, useCambioUSD } from "../../hooks/useCambioUSD";
import { ROTEIRO_PRECO_BASE } from "../../components/CustomPackageCard";
import {
  VEICULOS_MOTORISTA,
  ROTAS_MOTORISTA,
  REGIOES_MOTORISTA,
  SELECAO_MOTORISTA_VAZIA,
  calcularTotalMotoristaUSD,
  contarItensMotorista,
  encontrarRotaMotorista,
  encontrarVeiculoMotorista,
  resumoSelecaoMotorista,
  POLITICA_CANCELAMENTO_MOTORISTA,
  ADICIONAL_MEET_GREET_USD,
  ADICIONAL_CADEIRINHA_USD,
  type RegiaoRotaMotorista,
  type SelecaoMotorista,
  type VeiculoMotoristaId,
} from "../../lib/motoristaPrivadoRotas";
import { display, WHATSAPP_NUMBER, hojeISO } from "../page";

const inter = Inter({ subsets: ["latin"], weight: ["500", "600", "700"] });

// Nome curto + diferenciação curta por veículo (só nesta página — os
// nomes completos de motoristaPrivadoRotas.ts continuam valendo no
// resumo do CRM e na Calculadora Reversa). Pedido do Wilson: "Alphard —
// conforto premium · Hiace 10 — grupos pequenos · Hiace 14 — grupos
// médios · Coaster 18/21/29 — grupos grandes".
const VEICULO_CURTO: Record<VeiculoMotoristaId, { nome: string; perfil: string }> = {
  alphard8: { nome: "Toyota Alphard", perfil: "Conforto premium" },
  hiace10: { nome: "Toyota Hiace 10", perfil: "Grupos pequenos com bagagem" },
  hiace14: { nome: "Toyota Hiace 14", perfil: "Grupos médios" },
  coaster18: { nome: "Toyota Coaster 18", perfil: "Grupos grandes" },
  coaster21: { nome: "Toyota Coaster 21", perfil: "Grupos grandes" },
  coaster29: { nome: "Toyota Coaster 29", perfil: "Grupos grandes" },
};

// Menor preço de trajeto por veículo — mostrado como "a partir de" no
// passo 1 e no resumo enquanto nenhuma rota foi escolhida.
const PRECO_MINIMO_VEICULO = Object.fromEntries(
  VEICULOS_MOTORISTA.map((v) => [v.id, Math.min(...ROTAS_MOTORISTA.map((r) => r.precoUSD[v.id]))]),
) as Record<VeiculoMotoristaId, number>;

// Passo 2 em formato "origem → destino": cada par aponta pra uma rota do
// catálogo (motoristaPrivadoRotas.ts). Origem = destino significa
// deslocamento dentro da cidade. Kyoto → Osaka usa a mesma rota de
// "Dentro de Kyoto" (o fornecedor cota igual).
type LocalId = "narita" | "haneda" | "kix" | "tokyo" | "osaka" | "kyoto";
const LOCAIS: { id: LocalId; nome: string; aeroporto: boolean }[] = [
  { id: "narita", nome: "Aeroporto de Narita", aeroporto: true },
  { id: "haneda", nome: "Aeroporto de Haneda", aeroporto: true },
  { id: "kix", nome: "Aeroporto de Kansai", aeroporto: true },
  { id: "tokyo", nome: "Tóquio", aeroporto: false },
  { id: "osaka", nome: "Osaka", aeroporto: false },
  { id: "kyoto", nome: "Kyoto", aeroporto: false },
];
const TRECHOS: { de: LocalId; para: LocalId; rotaId: string }[] = [
  { de: "narita", para: "tokyo", rotaId: "narita-tokyo" },
  { de: "haneda", para: "tokyo", rotaId: "haneda-tokyo" },
  { de: "kix", para: "osaka", rotaId: "kansai-osaka" },
  { de: "kix", para: "kyoto", rotaId: "kansai-kyoto" },
  { de: "tokyo", para: "narita", rotaId: "tokyo-narita" },
  { de: "tokyo", para: "haneda", rotaId: "tokyo-haneda" },
  { de: "tokyo", para: "tokyo", rotaId: "dentro-tokyo" },
  { de: "osaka", para: "kix", rotaId: "osaka-kansai" },
  { de: "osaka", para: "osaka", rotaId: "dentro-osaka" },
  { de: "kyoto", para: "kix", rotaId: "kyoto-kansai" },
  { de: "kyoto", para: "kyoto", rotaId: "dentro-kyoto-ou-kyoto-osaka" },
  { de: "kyoto", para: "osaka", rotaId: "dentro-kyoto-ou-kyoto-osaka" },
];
const nomeLocal = (id: LocalId) => LOCAIS.find((l) => l.id === id)?.nome ?? id;
const TOURS = ROTAS_MOTORISTA.filter((r) => r.categoria === "tour-dia-inteiro");

const CLASSE_SELECT =
  "h-12 w-full appearance-none rounded-xl border border-black/15 bg-white pl-4 pr-10 text-base text-black transition focus:border-[#2f80c9] focus:outline-none focus:ring-1 focus:ring-[#2f80c9] disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-black/35 md:text-[15px]";

const REGIAO_CURTA: Record<RegiaoRotaMotorista, string> = {
  kanto: "Tóquio",
  kansai: "Osaka/Kyoto",
  hiroshima: "Hiroshima",
};

const ETAPAS = ["Veículo", "Trajeto", "Dados", "Revisão"] as const;
type Etapa = 1 | 2 | 3 | 4;

const COMO_FUNCIONA = ["Escolha o veículo", "Escolha o trajeto", "Confirmamos", "Motorista te espera"];

// Máscara de WhatsApp: formato brasileiro por padrão; se começar com "+",
// aceita número internacional sem forçar o formato.
function mascararWhatsapp(valor: string): string {
  const t = valor.trimStart();
  if (t.startsWith("+")) return "+" + t.slice(1).replace(/[^\d ]/g, "").slice(0, 20);
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatarDataExtensa(iso: string): string {
  if (!iso) return "";
  const data = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(data.getTime())) return iso;
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function IconeCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

// Modal simples via portal (evita o bug de `fixed` do Safari iOS dentro de
// containers com transform/backdrop — ver learnings do projeto).
function Modal({ aberto, titulo, onFechar, children }: { aberto: boolean; titulo: string; onFechar: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", tecla);
    };
  }, [aberto, onFechar]);
  if (!aberto || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 md:items-center md:p-6" onClick={onFechar} role="dialog" aria-modal="true" aria-label={titulo}>
      <div
        className="flex max-h-[88svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <p className={`${display.className} text-lg font-medium text-black`}>{titulo}</p>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none text-black/60 transition hover:bg-black/5 hover:text-black"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 text-sm leading-6 text-black/75">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

function Campo({
  rotulo,
  erro,
  ajuda,
  children,
}: {
  rotulo: string;
  erro?: string | null;
  ajuda?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/70">{rotulo}</span>
      {children}
      {erro ? (
        <span className="text-xs text-red-600">{erro}</span>
      ) : ajuda ? (
        <span className="text-xs text-black/50">{ajuda}</span>
      ) : null}
    </label>
  );
}

function classeInput(temErro: boolean) {
  return `h-12 w-full min-w-0 rounded-lg border bg-white px-3.5 text-sm text-black transition focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/20 ${
    temErro ? "border-red-400 focus:border-red-500" : "border-black/15 focus:border-[#2f80c9]"
  }`;
}

function IconeSeta() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function TransportePrivadoPage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [etapa, setEtapa] = useState<Etapa>(1);
  // Veículo só conta como "escolhido" depois do clique do cliente — o
  // SELECAO_MOTORISTA_VAZIA já traz um veículo padrão (hiace10), mas aqui o
  // passo 1 precisa de uma escolha explícita.
  const [veiculoEscolhido, setVeiculoEscolhido] = useState(false);
  const [selecao, setSelecao] = useState<SelecaoMotorista>(SELECAO_MOTORISTA_VAZIA);
  const [tipoServico, setTipoServico] = useState<"transfer" | "passeio">("transfer");
  const [origem, setOrigem] = useState<LocalId | "">("");
  const [destino, setDestino] = useState<LocalId | "">("");
  const [tourId, setTourId] = useState("");
  const [ultimoAdicionado, setUltimoAdicionado] = useState<string | null>(null);

  const [opcionalMeetGreet, setOpcionalMeetGreet] = useState(false);
  const [opcionalCadeirinha, setOpcionalCadeirinha] = useState(false);
  const [opcionalBilingue, setOpcionalBilingue] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [dataServico, setDataServico] = useState("");
  const [horario, setHorario] = useState("");
  const [numeroVoo, setNumeroVoo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [tentouAvancarDados, setTentouAvancarDados] = useState(false);

  const [termosAceitos, setTermosAceitos] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [modalTermos, setModalTermos] = useState(false);
  const [modalRegras, setModalRegras] = useState(false);
  const [resumoAbertoMobile, setResumoAbertoMobile] = useState(false);

  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  const stepperRef = useRef<HTMLDivElement | null>(null);

  const veiculo = encontrarVeiculoMotorista(selecao.veiculo);
  const veiculoCurto = VEICULO_CURTO[selecao.veiculo];
  const quantidadeItens = contarItensMotorista(selecao);
  const motoristaUSD = calcularTotalMotoristaUSD(selecao);
  // Roteiro Personalizado incluso (mesma regra de sempre do Transporte
  // Privado) — só entra com pelo menos 1 serviço selecionado.
  const roteiroUSD = quantidadeItens > 0 ? ROTEIRO_PRECO_BASE / cambioCotacao : 0;
  const totalUSD = motoristaUSD + roteiroUSD;
  const totalBRL = totalUSD * cambioCotacao;
  const resumoSelecao = resumoSelecaoMotorista(selecao);

  // ── Validação por campo (mostrada ao lado de cada campo) ──
  const digitosWhatsapp = whatsapp.replace(/\D/g, "").length;
  const errosDados: Record<string, string | null> = {
    nome: nome.trim().length < 3 ? "Informe seu nome completo." : null,
    email: /^\S+@\S+\.\S+$/.test(email.trim()) ? null : "Informe um e-mail válido.",
    whatsapp: digitosWhatsapp >= 10 ? null : "Informe um WhatsApp com DDD.",
    dataServico: !dataServico ? "Informe a data do serviço." : dataServico < hojeISO() ? "A data precisa ser hoje ou depois." : null,
  };
  const dadosValidos = Object.values(errosDados).every((e) => e === null);
  const mostrarErro = (campo: string) => (tocados[campo] || tentouAvancarDados ? errosDados[campo] : null);
  const tocar = (campo: string) => setTocados((t) => ({ ...t, [campo]: true }));

  const etapa1Ok = veiculoEscolhido;
  const etapa2Ok = quantidadeItens > 0;
  const etapa3Ok = dadosValidos;
  const podeEnviar = etapa1Ok && etapa2Ok && etapa3Ok && termosAceitos;

  function irPara(nova: Etapa) {
    setEtapa(nova);
    setResumoAbertoMobile(false);
    // Volta pro topo do configurador (logo abaixo do hero), pra etapa nova
    // começar sempre no mesmo lugar.
    const alvo = stepperRef.current;
    if (alvo) {
      const topo = alvo.getBoundingClientRect().top + window.scrollY - 56 + 24;
      if (window.scrollY > topo) window.scrollTo({ top: topo, behavior: "smooth" });
    }
  }

  function escolherVeiculo(id: VeiculoMotoristaId) {
    setSelecao((s) => ({ ...s, veiculo: id }));
    setVeiculoEscolhido(true);
  }

  function quantidadeDe(rotaId: string): number {
    return selecao.itens.find((i) => i.rotaId === rotaId)?.quantidade ?? 0;
  }

  function ajustarQuantidade(rotaId: string, nova: number) {
    const q = Math.max(0, Math.min(20, nova));
    setSelecao((s) => {
      const existe = s.itens.some((i) => i.rotaId === rotaId);
      if (q === 0) return { ...s, itens: s.itens.filter((i) => i.rotaId !== rotaId) };
      if (!existe) return { ...s, itens: [...s.itens, { rotaId, quantidade: q }] };
      return { ...s, itens: s.itens.map((i) => (i.rotaId === rotaId ? { ...i, quantidade: q } : i)) };
    });
  }

  // CTA principal — muda de rótulo conforme a etapa (o que fazer no
  // clique fica em acionarCta, fora do render).
  const cta: { rotulo: string; ativo: boolean; falta: string | null } =
    etapa === 1
      ? etapa1Ok
        ? { rotulo: "Continuar", ativo: true, falta: null }
        : { rotulo: "Escolha um veículo", ativo: false, falta: "Escolha um veículo para continuar" }
      : etapa === 2
        ? etapa2Ok
          ? { rotulo: "Continuar", ativo: true, falta: null }
          : { rotulo: "Escolha uma rota", ativo: false, falta: "Escolha ao menos uma rota para continuar" }
        : etapa === 3
          ? { rotulo: "Continuar", ativo: etapa3Ok, falta: etapa3Ok ? null : "Complete seus dados para continuar" }
          : {
              rotulo: status === "enviando" ? "Enviando…" : "Solicitar transporte",
              ativo: podeEnviar && status !== "enviando",
              falta: termosAceitos ? null : "Aceite os Termos e Condições para solicitar",
            };

  function acionarCta() {
    if (etapa === 1) {
      if (etapa1Ok) irPara(2);
      return;
    }
    if (etapa === 2) {
      if (etapa2Ok) irPara(3);
      return;
    }
    if (etapa === 3) {
      if (etapa3Ok) irPara(4);
      else setTentouAvancarDados(true);
      return;
    }
    if (!termosAceitos) {
      setTentouEnviar(true);
      return;
    }
    void enviar();
  }

  const etapasFaltando = [etapa1Ok, etapa2Ok, etapa3Ok].filter((ok) => !ok).length;

  async function enviar() {
    if (!podeEnviar || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    const opcionais = [
      opcionalMeetGreet ? "Meet & Greet (placa de recepção)" : null,
      opcionalCadeirinha ? "Cadeirinha infantil" : null,
      opcionalBilingue ? "Motorista bilíngue português/inglês" : null,
    ].filter(Boolean) as string[];
    try {
      const resposta = await fetch("/api/transporte-privado-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          veiculo: selecao.veiculo,
          itens: selecao.itens,
          resumo: resumoSelecao,
          motoristaUSD,
          roteiroUSD,
          totalUSD,
          totalBRL,
          formaPagamento: null,
          nome,
          email,
          whatsapp,
          dataServico,
          horario,
          numeroVoo,
          opcionais,
          observacoes,
          termosAceitos,
        }),
      });
      const dadosResposta = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dadosResposta.error || "Não foi possível registrar seu pedido agora. Tente de novo.");
        setStatus("erro");
        return;
      }
      setStatus("enviado");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErro("Não foi possível registrar seu pedido agora. Tente de novo.");
      setStatus("erro");
    }
  }

  const mensagemWhatsapp = `Olá! Acabei de solicitar meu transporte privado pelo site da Ajisai — ${resumoSelecao}.${
    nome ? ` Meu nome é ${nome}.` : ""
  }`;

  const destinosPossiveis = origem ? TRECHOS.filter((t) => t.de === origem) : [];
  const rotaEscolhida =
    tipoServico === "transfer"
      ? encontrarRotaMotorista(TRECHOS.find((t) => t.de === origem && t.para === destino)?.rotaId ?? "")
      : encontrarRotaMotorista(tourId);

  function adicionarRotaEscolhida() {
    if (!rotaEscolhida) return;
    ajustarQuantidade(rotaEscolhida.id, quantidadeDe(rotaEscolhida.id) + 1);
    setUltimoAdicionado(rotaEscolhida.id);
    setOrigem("");
    setDestino("");
    setTourId("");
  }

  // Conteúdo do resumo — o mesmo no painel lateral (desktop) e na gaveta
  // da barra inferior (celular).
  const conteudoResumo = (
    <div>
      <p className={`${display.className} text-lg font-medium text-[#0A2540]`}>Seu transporte</p>
      {veiculoEscolhido ? (
        <p className="mt-2 text-sm text-black/80">
          {veiculoCurto.nome} <span className="text-black/50">· até {veiculo.assentos} passageiros</span>
        </p>
      ) : (
        <p className="mt-2 text-sm text-black/45">Nenhum veículo escolhido</p>
      )}
      <div className="mt-4 space-y-2.5 border-t border-black/10 pt-4">
        {selecao.itens.length === 0 ? (
          <p className="text-sm text-black/45">Nenhuma rota escolhida</p>
        ) : (
          <>
            {selecao.itens.map((item) => {
              const rota = encontrarRotaMotorista(item.rotaId);
              if (!rota) return null;
              const q = Math.max(1, item.quantidade);
              return (
                <div key={item.rotaId} className="flex items-start justify-between gap-3 text-sm">
                  <span className="min-w-0 text-black/80">
                    {q > 1 && <span className="text-black/50">{q}× </span>}
                    {rota.nome}
                  </span>
                  <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>
                    {formatUSD(rota.precoUSD[selecao.veiculo] * q)}
                  </span>
                </div>
              );
            })}
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="text-black/55">Roteiro Personalizado (incluso)</span>
              <span className={`${inter.className} shrink-0 tabular-nums text-black/70`}>{formatUSD(roteiroUSD)}</span>
            </div>
          </>
        )}
      </div>
      <div className="mt-4 border-t border-black/10 pt-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-black/50">Total estimado</p>
        {/* `key` no total: a cada mudança o elemento remonta e a animação
            de destaque roda de novo — feedback imediato do preço. */}
        <p
          key={Math.round(totalUSD)}
          className={`${inter.className} mt-0.5 rounded-md text-3xl font-bold tabular-nums tracking-[-0.02em] text-[#0A2540]`}
          style={quantidadeItens > 0 ? { animation: "ajisai-destaque-preco 0.9s ease-out" } : undefined}
        >
          {quantidadeItens > 0 ? formatUSD(totalUSD) : veiculoEscolhido ? formatUSD(PRECO_MINIMO_VEICULO[selecao.veiculo]) : "—"}
        </p>
        {quantidadeItens === 0 && veiculoEscolhido && (
          <p className="text-xs text-black/50">a partir de, por trajeto · valor final após escolher a rota</p>
        )}
        {quantidadeItens > 0 && (
          <p className={`${inter.className} text-xs tabular-nums text-black/50`}>≈ {formatBRL(totalBRL)} na cotação do dia</p>
        )}
      </div>
    </div>
  );

  const botaoCta = (classeExtra = "") => (
    <button
      type="button"
      onClick={acionarCta}
      aria-disabled={!cta.ativo}
      className={`flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold uppercase tracking-[0.08em] transition-colors ${
        cta.ativo ? "bg-[#1f6fb8] text-white shadow-sm hover:bg-[#2f80c9]" : "cursor-default bg-[#dce6ef] text-[#5b7a95]"
      } ${classeExtra}`}
    >
      {cta.rotulo}
    </button>
  );

  const textoStatus =
    cta.falta ?? (etapa < 4 && etapasFaltando > 0 ? (etapasFaltando === 1 ? "Falta 1 etapa" : `Faltam ${etapasFaltando} etapas`) : null);

  return (
    <main className="min-h-screen overflow-x-clip bg-white pb-40 pt-14 text-black lg:pb-16 [&_input:not([type=checkbox])]:text-base [&_textarea]:text-base md:[&_input:not([type=checkbox])]:text-sm md:[&_textarea]:text-sm">
      <style>{`@keyframes ajisai-destaque-preco { 0% { background-color: rgba(47,128,201,0.16); } 100% { background-color: transparent; } }`}</style>

      <div className="fixed inset-x-0 top-0 z-50 flex h-14 shrink-0 items-center gap-3 bg-[#0A2540] px-4 md:px-8">
        <Link
          href="/produtos"
          className="flex min-h-[44px] items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/70 transition hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </Link>
        <span className="h-4 w-px bg-white/20" aria-hidden="true" />
        <p className={`${display.className} text-lg font-medium text-white md:text-xl`}>Transporte Privado</p>
        <div className="flex-1" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
      </div>

      {status === "enviado" ? (
        <div className="mx-auto max-w-xl px-5 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2f80c9]/10 text-[#2f80c9]">
            <IconeCheck className="h-6 w-6" />
          </span>
          <h1 className={`${display.className} mt-5 text-2xl font-medium text-black md:text-3xl`}>Recebemos seu pedido</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/70">
            Nossa equipe confirma horários, logística e forma de pagamento com você pelo WhatsApp — em geral no mesmo
            dia útil.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemWhatsapp)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#1f6fb8] px-7 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#2f80c9]"
          >
            Continuar no WhatsApp
          </a>
        </div>
      ) : (
        <>
          <div className="mx-auto max-w-6xl px-5 pt-5 md:px-8 md:pt-8">
            {/* Hero — mais baixo que antes (pedido do Wilson: "reduzir
                levemente a altura do Hero"), mesma foto e headline. */}
            <section className="relative -mx-5 overflow-hidden bg-[#0A2540] sm:mx-0 sm:rounded-2xl">
              <div className="relative h-48 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[64%]">
                <Image
                  src="/images/produtos/transporte-privado-header.jpg"
                  alt="Família sendo recebida pelo motorista particular ao lado da van, em frente a um templo no Japão"
                  fill
                  priority
                  sizes="(min-width: 640px) 700px, 100vw"
                  className="object-cover object-[40%_45%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
                />
              </div>
              <div className="relative -mt-10 px-5 pb-6 sm:mt-0 sm:flex sm:min-h-[260px] sm:max-w-[38%] sm:flex-col sm:justify-center sm:px-10 sm:py-10 md:min-h-[290px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Transporte Privado</p>
                <h1 className={`${display.className} mt-3 text-[28px] font-medium leading-tight text-white md:text-4xl`}>
                  Motorista particular, sem compartilhar veículo
                </h1>
              </div>
            </section>
            <p className="mt-5 text-sm leading-relaxed text-black/70 md:text-base">
              Escolha seu veículo e trajeto para consultar o valor e solicitar o transporte.
            </p>

            {/* Como funciona — compacto, numa linha, sem competir com a
                seleção (pedido do Wilson). */}
            <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-black/55">
              {COMO_FUNCIONA.map((passo, i) => (
                <li key={passo} className="flex items-center gap-2">
                  <span className="text-black/35">{i + 1}</span>
                  <span>{passo}</span>
                  {i < COMO_FUNCIONA.length - 1 && <span className="text-black/25" aria-hidden="true">→</span>}
                </li>
              ))}
            </ol>
          </div>

          {/* Stepper — fixo logo abaixo da barra do topo enquanto rola. */}
          {/* Âncora fora do elemento sticky — ao trocar de etapa, a página
              rola até aqui (a posição do próprio stepper não serve, porque
              quando ele está "grudado" no topo o getBoundingClientRect
              devolve sempre a posição grudada). */}
          <div ref={stepperRef} aria-hidden="true" />
          <div className="sticky top-14 z-40 mt-6 bg-[#1f6fb8] shadow-[0_4px_16px_rgba(10,37,64,0.12)]">
            {/* w-fit + mx-auto: centralizado; max-w-full + overflow-x-auto:
                se não couber no celular, rola na horizontal sem cortar. */}
            <nav aria-label="Etapas" className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto px-5 py-3 md:gap-3 md:px-8">
              {ETAPAS.map((nomeEtapa, i) => {
                const numero = (i + 1) as Etapa;
                const atual = etapa === numero;
                const concluida = numero < etapa || (numero === 1 && etapa1Ok && etapa > 1) || (numero === 2 && etapa2Ok && etapa > 2) || (numero === 3 && etapa3Ok && etapa > 3);
                // Pode voltar pra qualquer etapa anterior; pra frente, só
                // se as anteriores estiverem completas.
                const liberada =
                  numero <= etapa ||
                  (numero === 2 && etapa1Ok) ||
                  (numero === 3 && etapa1Ok && etapa2Ok) ||
                  (numero === 4 && etapa1Ok && etapa2Ok && etapa3Ok);
                return (
                  <div key={nomeEtapa} className="flex shrink-0 items-center gap-1 md:gap-3">
                    <button
                      type="button"
                      onClick={() => liberada && irPara(numero)}
                      disabled={!liberada}
                      aria-current={atual ? "step" : undefined}
                      className={`flex min-h-[44px] items-center gap-2 rounded-full px-2 text-sm transition md:px-3 ${
                        atual ? "text-white" : concluida ? "text-white/85 hover:text-white" : "text-white/50"
                      } ${liberada && !atual ? "cursor-pointer" : ""}`}
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          atual
                            ? "bg-white text-[#1f6fb8]"
                            : concluida
                              ? "bg-white/20 text-white"
                              : "border border-white/40 text-white/60"
                        }`}
                      >
                        {concluida && !atual ? <IconeCheck className="h-3.5 w-3.5" /> : numero}
                      </span>
                      <span className={`${atual ? "font-semibold" : "font-medium"} ${atual ? "" : "hidden sm:inline"}`}>{nomeEtapa}</span>
                    </button>
                    {i < ETAPAS.length - 1 && <span className="h-px w-4 bg-white/30 md:w-10" aria-hidden="true" />}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              {/* ── ETAPA 1 — VEÍCULO ── */}
              {etapa === 1 && (
                <section aria-labelledby="titulo-etapa-1">
                  <h2 id="titulo-etapa-1" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Escolha o veículo
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">O valor de cada trajeto depende do veículo escolhido.</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {VEICULOS_MOTORISTA.map((v) => {
                      const ativo = veiculoEscolhido && selecao.veiculo === v.id;
                      const curto = VEICULO_CURTO[v.id];
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => escolherVeiculo(v.id)}
                          aria-pressed={ativo}
                          className={`relative flex items-center gap-4 overflow-hidden rounded-xl border p-3 text-left transition sm:flex-col sm:items-stretch sm:gap-0 sm:p-0 ${
                            ativo
                              ? "border-[#2f80c9] bg-[#2f80c9]/[0.05] ring-1 ring-[#2f80c9]"
                              : "border-black/10 bg-white hover:border-black/25"
                          }`}
                        >
                          <span className="relative block h-20 w-28 shrink-0 sm:aspect-[3/2] sm:h-auto sm:w-full">
                            <Image src={v.foto} alt="" fill sizes="(min-width: 640px) 260px, 112px" className="object-contain p-2 sm:p-4" />
                          </span>
                          <span className="block min-w-0 sm:border-t sm:border-black/[0.06] sm:p-4">
                            <span className="block text-[15px] font-medium text-black">{curto.nome}</span>
                            <span className="mt-0.5 block text-sm font-semibold text-[#0A2540]">Até {v.assentos} passageiros</span>
                            <span className="mt-0.5 block text-xs text-black/55">{curto.perfil}</span>
                            <span className={`${inter.className} mt-2 block text-xs text-black/55`}>
                              a partir de{" "}
                              <span className="text-sm font-semibold tabular-nums text-[#0A2540]">{formatUSD(PRECO_MINIMO_VEICULO[v.id])}</span>
                              <span className="text-black/45"> / trajeto</span>
                            </span>
                          </span>
                          {ativo && (
                            <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#2f80c9] text-white">
                              <IconeCheck className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {veiculoEscolhido && (
                    <p className="mt-5 flex items-center gap-2 text-sm text-[#1f6fb8]">
                      <IconeCheck className="h-4 w-4" />
                      {veiculoCurto.nome} · Até {veiculo.assentos} passageiros selecionado
                    </p>
                  )}
                </section>
              )}

              {/* ── ETAPA 2 — TRAJETO ── */}
              {etapa === 2 && (
                <section aria-labelledby="titulo-etapa-2">
                  <h2 id="titulo-etapa-2" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Escolha uma ou mais rotas
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">
                    Informe de onde sai e para onde vai. Preços para{" "}
                    <button type="button" onClick={() => irPara(1)} className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                      {veiculoCurto.nome}
                    </button>
                    .
                  </p>

                  <div className="mt-6 rounded-2xl border border-black/10 p-4 sm:p-5">
                    {/* Tipo: transfer (origem → destino) ou passeio de 10h */}
                    <div role="radiogroup" aria-label="Tipo de serviço" className="grid grid-cols-2 gap-1 rounded-xl bg-black/[0.04] p-1">
                      {(
                        [
                          { key: "transfer", nome: "Transfer" },
                          { key: "passeio", nome: "Passeio de 10h" },
                        ] as const
                      ).map((t) => {
                        const ativo = tipoServico === t.key;
                        return (
                          <button
                            key={t.key}
                            type="button"
                            role="radio"
                            aria-checked={ativo}
                            onClick={() => setTipoServico(t.key)}
                            className={`min-h-[44px] rounded-lg text-sm transition ${
                              ativo ? "bg-white font-semibold text-[#0A2540] shadow-sm" : "font-medium text-black/55 hover:text-black"
                            }`}
                          >
                            {t.nome}
                          </button>
                        );
                      })}
                    </div>

                    {tipoServico === "transfer" ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-medium text-black/60">Saindo de</span>
                          <span className="relative block">
                            <select
                              value={origem}
                              onChange={(e) => {
                                const nova = e.target.value as LocalId | "";
                                setOrigem(nova);
                                // Se só há um destino possível, já preenche.
                                const opcoes = TRECHOS.filter((t) => t.de === nova);
                                setDestino(opcoes.length === 1 ? opcoes[0].para : "");
                              }}
                              className={CLASSE_SELECT}
                            >
                              <option value="">Escolha a origem</option>
                              <optgroup label="Aeroportos">
                                {LOCAIS.filter((l) => l.aeroporto).map((l) => (
                                  <option key={l.id} value={l.id}>{l.nome}</option>
                                ))}
                              </optgroup>
                              <optgroup label="Cidades">
                                {LOCAIS.filter((l) => !l.aeroporto).map((l) => (
                                  <option key={l.id} value={l.id}>{l.nome}</option>
                                ))}
                              </optgroup>
                            </select>
                            <IconeSeta />
                          </span>
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-medium text-black/60">Indo para</span>
                          <span className="relative block">
                            <select
                              value={destino}
                              disabled={!origem}
                              onChange={(e) => setDestino(e.target.value as LocalId | "")}
                              className={CLASSE_SELECT}
                            >
                              <option value="">{origem ? "Escolha o destino" : "Escolha a origem primeiro"}</option>
                              {destinosPossiveis.map((t) => (
                                <option key={t.para} value={t.para}>
                                  {t.para === t.de ? `${nomeLocal(t.para)} (dentro da cidade)` : nomeLocal(t.para)}
                                </option>
                              ))}
                            </select>
                            <IconeSeta />
                          </span>
                        </label>
                      </div>
                    ) : (
                      <label className="mt-4 block">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Qual passeio?</span>
                        <span className="relative block">
                          <select value={tourId} onChange={(e) => setTourId(e.target.value)} className={CLASSE_SELECT}>
                            <option value="">Escolha o passeio</option>
                            {REGIOES_MOTORISTA.map((r) => (
                              <optgroup key={r.key} label={REGIAO_CURTA[r.key]}>
                                {TOURS.filter((t) => t.regiao === r.key).map((t) => (
                                  <option key={t.id} value={t.id}>{t.nome.replace(/ — 10 horas$/, "")}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          <IconeSeta />
                        </span>
                      </label>
                    )}

                    {/* Resultado: preço do trecho + adicionar */}
                    <div className="mt-4 flex min-h-[64px] items-center justify-between gap-4 border-t border-black/[0.08] pt-4">
                      {rotaEscolhida ? (
                        <>
                          <div className="min-w-0">
                            <p className={`${inter.className} text-2xl font-bold tabular-nums text-[#0A2540]`}>
                              {formatUSD(rotaEscolhida.precoUSD[selecao.veiculo])}
                            </p>
                            <p className="text-xs text-black/55">
                              {rotaEscolhida.minutosLivres != null ? `Até ${rotaEscolhida.minutosLivres} min incluídos` : "10 horas com motorista"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={adicionarRotaEscolhida}
                            className="h-11 shrink-0 rounded-full bg-[#1f6fb8] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f80c9]"
                          >
                            Adicionar
                          </button>
                        </>
                      ) : (
                        <p className="text-sm text-black/45">
                          {tipoServico === "transfer" ? "Escolha origem e destino para ver o valor." : "Escolha um passeio para ver o valor."}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* O que já foi adicionado ao pedido */}
                  {selecao.itens.length > 0 && (
                    <div className="mt-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">No seu pedido</p>
                      <ul className="mt-2 divide-y divide-black/[0.06] rounded-xl border border-black/10">
                        {selecao.itens.map((item) => {
                          const rota = encontrarRotaMotorista(item.rotaId);
                          if (!rota) return null;
                          const q = Math.max(1, item.quantidade);
                          return (
                            <li
                              key={item.rotaId}
                              className={`flex items-center gap-3 px-4 py-3 ${ultimoAdicionado === item.rotaId ? "bg-[#2f80c9]/[0.05]" : ""}`}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-black/85">{rota.nome}</p>
                                <p className={`${inter.className} text-xs tabular-nums text-black/50`}>
                                  {q > 1 ? `${q} × ${formatUSD(rota.precoUSD[selecao.veiculo])} = ` : ""}
                                  {formatUSD(rota.precoUSD[selecao.veiculo] * q)}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => ajustarQuantidade(item.rotaId, q - 1)}
                                  aria-label={q === 1 ? `Remover ${rota.nome}` : "Diminuir quantidade"}
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-base text-black/60 transition hover:border-black/30"
                                >
                                  {q === 1 ? "×" : "−"}
                                </button>
                                <span className={`${inter.className} w-6 text-center text-sm font-semibold tabular-nums text-[#0A2540]`}>{q}</span>
                                <button
                                  type="button"
                                  onClick={() => ajustarQuantidade(item.rotaId, q + 1)}
                                  aria-label="Adicionar mais um (outro dia)"
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-base text-black/60 transition hover:border-black/30"
                                >
                                  +
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <p className="mt-2 text-xs text-black/45">Use + para repetir o mesmo trajeto em outro dia.</p>
                    </div>
                  )}

                  {/* Incluído / Não incluído / Opcionais — perto da decisão,
                      no lugar do antigo bloco "IMPORTANTE". */}
                  <div className="mt-8 grid gap-5 border-t border-black/10 pt-6 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Incluído</p>
                      <p className="mt-1.5 text-sm text-black/65">Impostos, combustível, pedágios e estacionamento.</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Não incluído</p>
                      <p className="mt-1.5 text-sm text-black/65">Deslocamentos intermunicipais fora das rotas contratadas.</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Opcionais</p>
                    <div className="mt-2 divide-y divide-black/[0.06]">
                      {[
                        {
                          marcado: opcionalMeetGreet,
                          alternar: () => setOpcionalMeetGreet((v) => !v),
                          titulo: "Meet & Greet — recepção com placa de identificação",
                          detalhe: `${formatUSD(ADICIONAL_MEET_GREET_USD)}, confirmado pela nossa equipe`,
                        },
                        {
                          marcado: opcionalCadeirinha,
                          alternar: () => setOpcionalCadeirinha((v) => !v),
                          titulo: "Cadeirinha infantil",
                          detalhe: `${formatUSD(ADICIONAL_CADEIRINHA_USD)} por cadeirinha, confirmado pela nossa equipe`,
                        },
                        {
                          marcado: opcionalBilingue,
                          alternar: () => setOpcionalBilingue((v) => !v),
                          titulo: "Solicitar motorista bilíngue português/inglês",
                          detalhe: "Sujeito à disponibilidade e valor adicional. Recomendamos solicitar com antecedência.",
                          aviso: true,
                        },
                      ].map((op) => (
                        <label key={op.titulo} className="flex min-h-[52px] cursor-pointer items-start gap-3 py-3">
                          <input
                            type="checkbox"
                            checked={op.marcado}
                            onChange={op.alternar}
                            className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                          />
                          <span className="min-w-0">
                            <span className="block text-sm text-black/85">{op.titulo}</span>
                            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-black/50">
                              {op.aviso && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />}
                              {op.detalhe}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalRegras(true)}
                      className="mt-2 min-h-[44px] text-sm font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2"
                    >
                      Ver regras e adicionais
                    </button>
                  </div>
                </section>
              )}

              {/* ── ETAPA 3 — DADOS ── */}
              {etapa === 3 && (
                <section aria-labelledby="titulo-etapa-3">
                  <h2 id="titulo-etapa-3" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Seus dados
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Usamos esses dados só para confirmar o seu transporte.</p>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Campo rotulo="Nome completo" erro={mostrarErro("nome")}>
                        <input
                          type="text"
                          autoComplete="name"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          onBlur={() => tocar("nome")}
                          className={classeInput(!!mostrarErro("nome"))}
                        />
                      </Campo>
                    </div>
                    <Campo rotulo="E-mail" erro={mostrarErro("email")}>
                      <input
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => tocar("email")}
                        className={classeInput(!!mostrarErro("email"))}
                      />
                    </Campo>
                    <Campo rotulo="WhatsApp" erro={mostrarErro("whatsapp")} ajuda="Com DDD. Para número de fora do Brasil, comece com +.">
                      <input
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(mascararWhatsapp(e.target.value))}
                        onBlur={() => tocar("whatsapp")}
                        placeholder="(11) 99999-9999"
                        className={classeInput(!!mostrarErro("whatsapp"))}
                      />
                    </Campo>
                    <Campo
                      rotulo="Data do serviço"
                      erro={mostrarErro("dataServico")}
                      ajuda={quantidadeItens > 1 ? "Com mais de um serviço, informe a data do primeiro — as demais combinamos pelo WhatsApp." : undefined}
                    >
                      <input
                        type="date"
                        min={hojeISO()}
                        value={dataServico}
                        onChange={(e) => setDataServico(e.target.value)}
                        onBlur={() => tocar("dataServico")}
                        className={`${classeInput(!!mostrarErro("dataServico"))} block appearance-none text-left`}
                      />
                    </Campo>
                    <Campo rotulo="Horário aproximado (opcional)">
                      <input
                        type="time"
                        value={horario}
                        onChange={(e) => setHorario(e.target.value)}
                        className={`${classeInput(false)} block appearance-none text-left`}
                      />
                    </Campo>
                    <Campo rotulo="Número do voo (opcional)">
                      <input
                        type="text"
                        value={numeroVoo}
                        onChange={(e) => setNumeroVoo(e.target.value.toUpperCase())}
                        placeholder="ex.: JL 34"
                        className={classeInput(false)}
                      />
                    </Campo>
                    <div className="sm:col-span-2">
                      <Campo rotulo="Observações (opcional)">
                        <textarea
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          rows={3}
                          placeholder="Datas da viagem, número do voo, quantidade de bagagem ou solicitações especiais."
                          className="w-full min-w-0 rounded-lg border border-black/15 bg-white px-3.5 py-3 text-sm text-black focus:border-[#2f80c9] focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/20"
                        />
                      </Campo>
                    </div>
                  </div>
                </section>
              )}

              {/* ── ETAPA 4 — REVISÃO ── */}
              {etapa === 4 && (
                <section aria-labelledby="titulo-etapa-4">
                  <h2 id="titulo-etapa-4" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Revise seu pedido
                  </h2>
                  <dl className="mt-6 divide-y divide-black/[0.07] border-y border-black/[0.07]">
                    {[
                      {
                        rotulo: "Veículo",
                        voltar: 1 as Etapa,
                        conteudo: (
                          <>
                            {veiculoCurto.nome} <span className="text-black/50">· até {veiculo.assentos} passageiros</span>
                          </>
                        ),
                      },
                      {
                        rotulo: "Serviços",
                        voltar: 2 as Etapa,
                        conteudo: (
                          <div className="space-y-1">
                            {selecao.itens.map((item) => {
                              const rota = encontrarRotaMotorista(item.rotaId);
                              if (!rota) return null;
                              const q = Math.max(1, item.quantidade);
                              return (
                                <p key={item.rotaId}>
                                  {q > 1 && <span className="text-black/50">{q}× </span>}
                                  {rota.nome}
                                </p>
                              );
                            })}
                            {(opcionalMeetGreet || opcionalCadeirinha || opcionalBilingue) && (
                              <p className="text-black/55">
                                Opcionais:{" "}
                                {[
                                  opcionalMeetGreet && "Meet & Greet",
                                  opcionalCadeirinha && "cadeirinha infantil",
                                  opcionalBilingue && "motorista bilíngue",
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                        ),
                      },
                      {
                        rotulo: "Data",
                        voltar: 3 as Etapa,
                        conteudo: (
                          <>
                            {formatarDataExtensa(dataServico)}
                            {horario && <span className="text-black/50"> · por volta das {horario}</span>}
                            {numeroVoo && <span className="text-black/50"> · voo {numeroVoo}</span>}
                          </>
                        ),
                      },
                      {
                        rotulo: "Dados do passageiro",
                        voltar: 3 as Etapa,
                        conteudo: (
                          <div className="space-y-0.5">
                            <p>{nome}</p>
                            <p className="text-black/60">{whatsapp}</p>
                            <p className="text-black/60">{email}</p>
                          </div>
                        ),
                      },
                    ].map((linha) => (
                      <div key={linha.rotulo} className="grid gap-1 py-4 sm:grid-cols-[170px_minmax(0,1fr)_auto] sm:gap-4">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55 sm:pt-0.5">{linha.rotulo}</dt>
                        <dd className="min-w-0 text-sm text-black/85">{linha.conteudo}</dd>
                        <button
                          type="button"
                          onClick={() => irPara(linha.voltar)}
                          className="justify-self-start text-sm font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2 sm:justify-self-end"
                        >
                          Editar
                        </button>
                      </div>
                    ))}
                    <div className="grid gap-1 py-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55 sm:pt-1.5">Total estimado</dt>
                      <dd>
                        <span className={`${inter.className} text-2xl font-bold tabular-nums text-[#0A2540]`}>{formatUSD(totalUSD)}</span>
                        <span className={`${inter.className} ml-2 text-sm tabular-nums text-black/50`}>≈ {formatBRL(totalBRL)}</span>
                      </dd>
                    </div>
                  </dl>

                  <label className="mt-6 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termosAceitos}
                      onChange={(e) => setTermosAceitos(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                    />
                    <span className="text-sm text-black/85">
                      Li e aceito os{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setModalTermos(true);
                        }}
                        className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2"
                      >
                        Termos e Condições
                      </button>{" "}
                      do transporte privado.
                    </span>
                  </label>
                  {tentouEnviar && !termosAceitos && (
                    <p className="ml-8 text-xs text-red-600">Aceite os Termos e Condições para solicitar o transporte.</p>
                  )}
                  <p className="mt-4 text-xs leading-5 text-black/50">
                    Nenhum valor é cobrado agora. Nossa equipe confirma disponibilidade, horários e forma de pagamento com
                    você pelo WhatsApp.
                  </p>
                  {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
                </section>
              )}

              {etapa > 1 && (
                <button
                  type="button"
                  onClick={() => irPara((etapa - 1) as Etapa)}
                  className="mt-8 flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-black"
                >
                  <span aria-hidden="true">←</span> Voltar para {ETAPAS[etapa - 2].toLowerCase()}
                </button>
              )}
            </div>

            {/* Resumo fixo — desktop. */}
            <aside className="hidden lg:block" aria-label="Resumo do pedido">
              <div className="sticky top-[8.5rem] rounded-2xl border border-black/10 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(10,37,64,0.35)]">
                {conteudoResumo}
                <div className="mt-6">{botaoCta()}</div>
                {textoStatus && <p className="mt-2.5 text-center text-xs text-black/55">{textoStatus}</p>}
              </div>
            </aside>
          </div>

          {/* Resumo compacto — celular/tablet: total sempre visível + CTA
              quase na largura toda; toque no total abre o detalhe. */}
          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_rgba(10,37,64,0.08)] lg:hidden">
            {resumoAbertoMobile && <div className="max-h-[50svh] overflow-y-auto border-b border-black/10 pb-4 pt-1">{conteudoResumo}</div>}
            <button
              type="button"
              onClick={() => setResumoAbertoMobile((v) => !v)}
              aria-expanded={resumoAbertoMobile}
              className="flex min-h-[44px] w-full items-center justify-between gap-3 text-left"
            >
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-[0.14em] text-black/50">
                  {quantidadeItens > 0
                    ? `${quantidadeItens} ${quantidadeItens === 1 ? "serviço" : "serviços"} · ${veiculoCurto.nome}`
                    : veiculoEscolhido
                      ? `${veiculoCurto.nome} · a partir de`
                      : "Total estimado"}
                </span>
                <span
                  key={Math.round(totalUSD)}
                  className={`${inter.className} block rounded text-xl font-bold tabular-nums text-[#0A2540]`}
                  style={quantidadeItens > 0 ? { animation: "ajisai-destaque-preco 0.9s ease-out" } : undefined}
                >
                  {quantidadeItens > 0 ? formatUSD(totalUSD) : veiculoEscolhido ? formatUSD(PRECO_MINIMO_VEICULO[selecao.veiculo]) : "—"}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#1f6fb8]">
                {resumoAbertoMobile ? "Fechar" : "Ver resumo"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 transition-transform ${resumoAbertoMobile ? "" : "rotate-180"}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div className="mt-2">{botaoCta()}</div>
            {textoStatus && <p className="mt-1.5 text-center text-[11px] text-black/55">{textoStatus}</p>}
          </div>
        </>
      )}

      <Modal aberto={modalRegras} titulo="Regras e adicionais" onFechar={() => setModalRegras(false)}>
        <p className="font-medium text-black">Incluído no valor</p>
        <p className="mt-1">
          Impostos, estacionamento, pedágios (ETC) e combustível. Cada rota tem um tempo incluído — normalmente 90 min
          nos trechos de chegada, 30 min nos trechos de partida, ou as 10 horas inteiras nos passeios de dia inteiro.
        </p>
        <p className="mt-4 font-medium text-black">Hora extra</p>
        <p className="mt-1">
          Uso além do tempo incluído é cobrado à parte, em blocos de 30 minutos (sempre arredondado pra cima), com
          tarifa por veículo e rota.
        </p>
        <p className="mt-4 font-medium text-black">Não incluído</p>
        <p className="mt-1">
          Trânsito intermunicipal de longa distância entre regiões (ex.: Tóquio↔Kansai por estrada).
        </p>
        <p className="mt-4 font-medium text-black">Adicionais</p>
        <p className="mt-1">
          Meet &amp; Greet (recepção com placa de identificação) — {formatUSD(ADICIONAL_MEET_GREET_USD)}. Cadeirinha
          infantil — {formatUSD(ADICIONAL_CADEIRINHA_USD)}. Motorista bilíngue português/inglês — sob consulta, com valor
          adicional e disponibilidade limitada; recomendamos solicitar com grande antecedência (idealmente 70 dias antes
          da viagem). Sem essa solicitação, o motorista fala japonês.
        </p>
        <p className="mt-4 font-medium text-black">Cancelamento</p>
        <p className="mt-1">{POLITICA_CANCELAMENTO_MOTORISTA}</p>
      </Modal>

      <Modal aberto={modalTermos} titulo="Termos e Condições" onFechar={() => setModalTermos(false)}>
        <div className="text-[13px] leading-6">
                  <p className="font-medium text-black/80">Fornecimento do serviço</p>
                  <p className="mt-1">
                    O motorista e o veículo são fornecidos por um parceiro especializado no Japão
                    — a Alpinea atua como intermediária entre o cliente e esse fornecedor. O veículo
                    é exclusivo do grupo contratante, sem compartilhamento com outros passageiros.
                  </p>
                  <p className="mt-3 font-medium text-black/80">O que está incluído</p>
                  <p className="mt-1">
                    Os valores já incluem imposto, estacionamento, pedágio (ETC) e combustível. Cada
                    rota tem um tempo livre incluso (normalmente 90 min no trecho de chegada/pickup,
                    30 min no trecho de partida, ou as 10 horas inteiras nos tours de dia inteiro) —
                    ver detalhe de cada rota na etapa Trajeto.
                  </p>
                  <p className="mt-3 font-medium text-black/80">Hora extra</p>
                  <p className="mt-1">
                    Tempo de uso além do período já incluso na rota escolhida é cobrado em blocos de
                    30 minutos (sempre arredondado pra cima), com tarifa específica por veículo e
                    rota, cobrado à parte.
                  </p>
                  <p className="mt-3 font-medium text-black/80">Adicionais opcionais</p>
                  <p className="mt-1">
                    Recepção com placa de identificação (Meet &amp; Greet) e cadeirinha infantil
                    estão disponíveis mediante consulta, com valor adicional — não estão incluídos
                    no preço-base da rota.
                  </p>
                  <p className="mt-3 font-medium text-black/80">Motorista bilíngue</p>
                  <p className="mt-1">
                    Motorista com português ou inglês está disponível mediante consulta e valor
                    adicional — disponibilidade limitada, recomendamos solicitar com grande
                    antecedência (idealmente 70 dias antes da viagem). Sem essa solicitação expressa,
                    o motorista fornecido fala japonês.
                  </p>
                  <p className="mt-3 font-medium text-black/80">Não incluído</p>
                  <p className="mt-1">
                    Trânsito inter-municipal de longa distância entre regiões (ex.: Tóquio↔Kansai
                    por estrada) não está coberto pelas rotas/tours listados acima.
                  </p>
                  <p className="mt-3 font-medium text-black/80">Cancelamento</p>
                  <p className="mt-1">{POLITICA_CANCELAMENTO_MOTORISTA}</p>
                  <p className="mt-3 font-medium text-black/80">Pagamento e responsabilidade dos dados</p>
                  <p className="mt-1">
                    O valor final em reais é convertido pela cotação de câmbio do dia da confirmação.
                    A exatidão dos dados informados (nome, telefone/WhatsApp, horários de voo e locais
                    de embarque) é de responsabilidade do cliente — divergências podem prejudicar o
                    pickup e não são de responsabilidade da Alpinea nem do fornecedor. Isso não
                    confirma pagamento — nossa equipe entra em contato pelo WhatsApp pra fechar a
                    logística antes de qualquer cobrança.
                  </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setTermosAceitos(true);
            setModalTermos(false);
          }}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-[#1f6fb8] text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#2f80c9]"
        >
          Li e aceito
        </button>
      </Modal>
    </main>
  );
}
