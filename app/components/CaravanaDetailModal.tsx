"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { useCart, type CartItem } from "./CartContext";
import type { PackageVariant } from "./packageTypes";
import { useCambioUSD, brlParaUSDLabel, formatBRL, formatUSD } from "../hooks/useCambioUSD";
import {
  ITINERARIO_CITY_BORDER,
  CIDADE_IMAGEM,
  ITINERARIOS,
  ROTEIROS_DETALHADOS,
  INCLUSOES_PADRAO,
  FAQ_PADRAO,
  tagsDoRoteiro,
  IconCheck,
  IconX,
  IconChevron,
  IconTicket,
  IconZoom,
  type ItinerarioStop,
  type DiaRoteiro,
} from "./PackageDetailModal";

// Versão enxuta do PackageDetailModal, exclusiva para Pacotes de Caravana —
// reaproveita os dados de roteiro/inclusões/FAQ do modal padrão (import
// acima), mas com estrutura em 3 níveis pensada pra decisão de compra:
// "isso é pra mim?" (hero) → "o que vou viver?" (visão geral do roteiro,
// com o dia a dia em accordion) → "quero conferir os detalhes" (inclusões
// compactas + FAQ, complexidade só aparece se o usuário procurar).
// Pacotes Individuais/Personalizados continuam no PackageDetailModal
// original (ver isCaravana em PackageCard.tsx).

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const CIDADE_LABEL_PT: Record<string, string> = {
  Tokyo: "Tóquio",
  Kyoto: "Kyoto",
  Osaka: "Osaka",
  Nara: "Nara",
  Nachikatsuura: "Nachikatsuura",
  "Fujiyoshida/Fujikawaguchiko": "Monte Fuji",
};

function cidadeLabel(city: string): string {
  return CIDADE_LABEL_PT[city] ?? city;
}

// "Tóquio • Kyoto • Osaka" — cidades únicas do roteiro, na ordem em que
// aparecem, pra linha curta do hero.
function cidadesLinha(stops: ItinerarioStop[]): string {
  const vistas: string[] = [];
  for (const s of stops) {
    const label = cidadeLabel(s.city);
    if (!vistas.includes(label)) vistas.push(label);
  }
  return vistas.join(" • ");
}

// "Dia 1–3 Tóquio → Dia 4–5 Kyoto → Dia 6 Osaka → Dia 7 Tóquio" — resumo do
// roteiro completo em uma linha, calculado a partir dos dias por cidade.
function resumoRoteiro(stops: ItinerarioStop[]): string {
  let dia = 1;
  const partes: string[] = [];
  for (const s of stops) {
    const inicio = dia;
    const fim = dia + s.dias - 1;
    const faixa = fim > inicio ? `Dia ${inicio}–${fim}` : `Dia ${inicio}`;
    partes.push(`${faixa} ${cidadeLabel(s.city)}`);
    dia = fim + 1;
  }
  return partes.join(" → ");
}

// Título do dia sem o prefixo de cidade (já mostrado à parte no cabeçalho
// do accordion) — "Tóquio — Sensoji, Skytree & Solamachi" vira só "Sensoji,
// Skytree & Solamachi".
function tituloSemCidade(titulo: string): string {
  const partes = titulo.split(" — ");
  return partes.length > 1 ? partes[partes.length - 1] : titulo;
}

// Preço em destaque do bloco de compra — sempre em dólar (Caravana usa
// preço fixo em USD, ver variantesUSD em /pacotes).
function precoPrincipal(variante: PackageVariant): string {
  if (variante.precoUSD != null) return formatUSD(variante.precoUSD);
  if (variante.precoBRL != null) return "…";
  return variante.precoLabel;
}

// "aprox. R$ 23.576 por pessoa · quarto individual." — uma única linha
// secundária, no lugar das duas linhas separadas que o PrecoPacote padrão
// usa (preço em reais + "Por pessoa · Quarto Individual").
function precoSecundario(
  variante: PackageVariant,
  cambio: ReturnType<typeof useCambioUSD>,
): string {
  if (variante.precoUSD != null) {
    if (!cambio) return "Por pessoa · Quarto individual.";
    return `aprox. ${formatBRL(variante.precoUSD * cambio.cotacao)} por pessoa · quarto individual.`;
  }
  if (variante.precoBRL != null) {
    return `aprox. ${formatBRL(variante.precoBRL)} por pessoa · quarto individual.`;
  }
  return "Por pessoa · Quarto individual.";
}

// Argumentos de venda mostrados como selo, logo antes do CTA — não são
// notas secundárias (ponto 3).
const BENEFICIOS_PRINCIPAIS: { label: string; icone: string | null }[] = [
  { label: "Passagem aérea", icone: "/images/icone-decolagem.png" },
  { label: "Hotel", icone: "/images/icone-hotel2.png" },
  { label: "Guia bilíngue", icone: null },
  { label: "Transportes", icone: "/images/icone-onibus-v2.png" },
];

// FAQ_PADRAO (categoria de hotel) + dúvidas comerciais que hoje ficavam
// espalhadas em "Como reservar" (sinal/saldo, cancelamento, documentos) —
// tudo fechado por padrão, sem destaque especial pra nenhuma pergunta.
const FAQ_CARAVANA = [
  ...FAQ_PADRAO,
  {
    pergunta: "Como funciona o pagamento?",
    resposta:
      "O valor do sinal e do saldo, com seus respectivos vencimentos, é apresentado antes da confirmação da reserva.",
  },
  {
    pergunta: "Posso cancelar minha reserva?",
    resposta:
      "As condições de alteração e cancelamento são informadas por escrito, conforme a tarifa e os fornecedores selecionados para o seu pacote.",
  },
  {
    pergunta: "Qual bagagem está incluída?",
    resposta:
      "1 bagagem despachada de até 23kg e 1 bagagem de mão por pessoa, conforme a companhia aérea selecionada — já incluída no valor da passagem.",
  },
  {
    pergunta: "As refeições estão incluídas?",
    resposta:
      "O café da manhã está incluso no hotel. Almoços e jantares não estão inclusos, salvo indicação pontual no roteiro.",
  },
  {
    pergunta: "Quanto vou caminhar?",
    resposta:
      "Ritmo moderado: alguns dias incluem caminhadas e subida de escadas. Recomendamos condições físicas compatíveis com passeios urbanos regulares.",
  },
  {
    pergunta: "Como funciona o guia?",
    resposta:
      "Guia bilíngue dedicado ao grupo da caravana, acompanhando os pontos previstos no programa e auxiliando com trajetos, horários e orientações locais.",
  },
  {
    pergunta: "Qual companhia aérea?",
    resposta:
      "A Ajisai busca as melhores opções de conexão disponíveis para as datas do roteiro — a companhia é definida conforme disponibilidade. Consulte-nos para a opção da sua data.",
  },
  {
    pergunta: "Quando recebo a confirmação de voos e hotéis?",
    resposta:
      "Confirmações e prazos de documentos, voos e hotéis são enviados pela equipe Ajisai nos próximos passos após a reserva.",
  },
];

function DiaAccordionRow({
  dia,
  aberta,
  onToggle,
}: {
  dia: DiaRoteiro;
  aberta: boolean;
  onToggle: () => void;
}) {
  const foto = CIDADE_IMAGEM[dia.cidade];
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/20">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={aberta}
        className="flex w-full items-center gap-3 p-3.5 text-left"
      >
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: ITINERARIO_CITY_BORDER[dia.cidade] ?? "#2f80c9" }}
        >
          {dia.dia}
        </span>
        {foto && (
          <div className="relative hidden h-10 w-10 shrink-0 overflow-hidden rounded-lg sm:block">
            <Image src={foto} alt="" fill sizes="40px" className="object-cover" />
          </div>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] uppercase tracking-[0.15em] text-white/40">
            Dia {dia.dia} · {cidadeLabel(dia.cidade)}
          </span>
          <span className="block truncate text-sm font-medium text-white">
            {tituloSemCidade(dia.titulo)}
          </span>
        </span>
        <IconChevron
          className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${
            aberta ? "rotate-180" : ""
          }`}
        />
      </button>
      {aberta && (
        <div className="px-3.5 pb-3.5 pl-14">
          <p className="text-xs font-light leading-5 text-white/55">{dia.texto}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tagsDoRoteiro(dia).map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/60"
              >
                <span aria-hidden>{tag.icon}</span>
                {tag.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CaravanaDetailModal({
  divisao,
  categoria,
  nome,
  tagline,
  imagem,
  selo,
  variantes,
  varianteInicialId,
  rodape,
  onClose,
}: {
  divisao: CartItem["divisao"];
  categoria: string;
  nome: string;
  tagline: string;
  imagem: string;
  selo?: string;
  variantes: PackageVariant[];
  varianteInicialId?: string;
  rodape?: string;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const cambio = useCambioUSD();
  const [selecionada, setSelecionada] = useState(varianteInicialId ?? variantes[0]?.id ?? "");
  const [adicionado, setAdicionado] = useState(false);
  const [inclusaoAberta, setInclusaoAberta] = useState<(typeof INCLUSOES_PADRAO)[number] | null>(
    null,
  );
  const [faqAberta, setFaqAberta] = useState<string | null>(null);
  const [faqSecaoAberta, setFaqSecaoAberta] = useState(false);
  const [roteiroImagemZoom, setRoteiroImagemZoom] = useState(false);
  const [roteiroAberto, setRoteiroAberto] = useState(false);
  const [diasAbertos, setDiasAbertos] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLButtonElement>(null);
  // Barra fixa do rodapé só aparece depois que o CTA principal (no bloco
  // de preço do hero) sai da área visível — nunca os dois ao mesmo tempo.
  const [heroCtaVisible, setHeroCtaVisible] = useState(true);

  function selecionarVariante(id: string) {
    setSelecionada(id);
    setRoteiroAberto(false);
    setDiasAbertos(new Set());
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleDia(dia: number) {
    setDiasAbertos((atual) => {
      const proximo = new Set(atual);
      if (proximo.has(dia)) proximo.delete(dia);
      else proximo.add(dia);
      return proximo;
    });
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (roteiroImagemZoom) {
        setRoteiroImagemZoom(false);
        return;
      }
      if (inclusaoAberta) {
        setInclusaoAberta(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, inclusaoAberta, roteiroImagemZoom]);

  useEffect(() => {
    const root = scrollRef.current;
    const target = heroCtaRef.current;
    if (!root || !target) return;
    const observer = new IntersectionObserver(([entry]) => setHeroCtaVisible(entry.isIntersecting), {
      root,
      threshold: 0,
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const variante = variantes.find((v) => v.id === selecionada) ?? variantes[0];
  const stops = variante ? ITINERARIOS[variante.id] : undefined;
  const diasRoteiro = variante ? ROTEIROS_DETALHADOS[variante.id] : undefined;

  // Guia e transfer vêm inclusos por padrão na Caravana (grupo fechado) —
  // mesma regra do PackageDetailModal, só que aqui isCaravana é sempre
  // verdadeiro (este modal só é usado para essa divisão).
  const inclusoes = INCLUSOES_PADRAO.map((item) => {
    if (item.title === "Guia Turístico") {
      return {
        ...item,
        title: "Guia bilíngue",
        text: "Guia bilíngue acompanhando a caravana nos pontos previstos do roteiro.",
        detalhe:
          "Guia bilíngue dedicado ao grupo da caravana, acompanhando os pontos previstos no programa e auxiliando com trajetos, horários e orientações locais.",
        opcional: false,
      };
    }
    if (item.title === "Transfer") {
      return {
        ...item,
        title: "Transportes previstos no roteiro",
        text: "Deslocamentos coletivos exclusivos da caravana nos trechos previstos no programa.",
        detalhe:
          "Transportes organizados para a caravana nos deslocamentos previstos no roteiro. O veículo atende o grupo da viagem e não corresponde a transporte privativo individual.",
        opcional: false,
      };
    }
    return { ...item, opcional: false };
  });

  function handleAdd() {
    if (!variante) return;
    addItem({
      divisao,
      nome,
      variante: `${variante.label} · ${variante.datas}`,
      duracao: variante.label,
      periodo: variante.datas,
      viajantes: "1 adulto",
      acomodacao: "Quarto individual",
      itens: [
        { icone: "✈️", texto: "Passagem aérea incluída" },
        { icone: "🏨", texto: "Hospedagem incluída" },
        { icone: "📱", texto: "Roteiro Digital Ajisai incluído" },
      ],
      precoLabel:
        variante.precoBRL != null ? brlParaUSDLabel(variante.precoBRL, cambio) : variante.precoLabel,
      precoSufixo: "por pessoa",
      imagem,
    });
    setAdicionado(true);
    window.setTimeout(() => {
      setAdicionado(false);
      onClose();
    }, 1200);
  }

  if (typeof document === "undefined") return null;

  return (
    <>
      {createPortal(
        <div
          className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-sm md:flex md:items-center md:justify-center md:p-6"
          onClick={onClose}
        >
      <div
        className="relative flex h-[100dvh] w-full flex-col overflow-x-hidden bg-[#0a0a0a] text-white md:h-auto md:max-h-[92vh] md:max-w-4xl md:overflow-hidden md:rounded-[28px] md:border md:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0a0a0a]/95 px-5 py-4 backdrop-blur-sm md:px-8">
          <div className="flex items-center gap-2.5">
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "#6ec3d9" }}>
              {categoria}
            </p>
            {selo && (
              <span
                className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white"
                style={{ backgroundColor: "#2f80c9" }}
              >
                {selo}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-x-hidden overflow-y-auto px-5 py-6 md:px-8 md:py-8"
        >
          {/* ── NÍVEL 1 · "ISSO É PARA MIM?" ── */}
          <div className="relative -mx-5 -mt-6 aspect-[9/4] w-[calc(100%+2.5rem)] overflow-hidden md:-mx-8 md:-mt-8 md:w-[calc(100%+4rem)]">
            <Image
              src={imagem}
              alt={nome}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover object-[center_85%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-5 md:px-8 md:pb-7">
              <h2 className={`${display.className} text-2xl font-medium text-white drop-shadow md:text-3xl`}>
                {nome}
              </h2>
              <p className="mt-1.5 text-sm font-light leading-6 text-white/80 drop-shadow">{tagline}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
            {variantes.length > 1 && (
              <>
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  Escolha a duração
                </p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {variantes.map((v) => {
                    const ativo = v.id === selecionada;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => selecionarVariante(v.id)}
                        className={`rounded-full border px-5 py-2 text-sm font-semibold uppercase tracking-[0.08em] transition-all duration-200 ease-out hover:-translate-y-0.5 active:scale-95 ${
                          ativo
                            ? "border-transparent text-white shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
                            : "border-white/20 text-white/60 hover:border-white/50 hover:text-white"
                        }`}
                        style={ativo ? { backgroundColor: "#2f80c9" } : undefined}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {variante && (
              <div className="mt-4 text-center">
                <p className="text-sm font-semibold text-white/90">
                  {variante.label} · {variante.datas}
                </p>
                {stops && (
                  <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/40">
                    {cidadesLinha(stops)}
                  </p>
                )}
                <p className={`${display.className} mt-3 text-3xl font-semibold text-white`}>
                  {precoPrincipal(variante)}
                </p>
                <p className="mt-1 text-xs font-medium text-white/45">
                  {precoSecundario(variante, cambio)}
                </p>
                {rodape && <p className="mt-2 text-[10px] leading-4 text-white/25">{rodape}</p>}
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {BENEFICIOS_PRINCIPAIS.map(({ label, icone }) => (
                <div
                  key={label}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.07] px-2.5 py-2 text-center text-xs font-semibold text-white"
                >
                  {icone ? (
                    <img src={icone} alt="" className="h-3.5 w-3.5 shrink-0 object-contain invert" />
                  ) : (
                    <IconCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                  )}
                  {label}
                </div>
              ))}
            </div>

            <button
              ref={heroCtaRef}
              type="button"
              onClick={handleAdd}
              disabled={variante?.precoBRL != null && !cambio}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#2f80c9] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#3b91dc] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IconTicket className="h-4 w-4" /> Solicitar minha vaga
            </button>
          </div>

          {/* ── NÍVEL 2 · "O QUE VOU VIVER?" ── */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className={`${display.className} text-lg font-medium text-white`}>
              Visão geral do roteiro
            </h3>

            {(nome.startsWith("Primavera 1") || nome.startsWith("Primavera 2")) && (
              <button
                type="button"
                onClick={() => setRoteiroImagemZoom(true)}
                aria-label="Ampliar roteiro ilustrado"
                className="group relative mt-5 block w-full overflow-hidden rounded-2xl border border-white/10"
              >
                <Image
                  src={
                    variante?.id === "15d"
                      ? "/images/pacote-14-dias.jpg"
                      : "/images/pacote-7-dias-v2.jpg"
                  }
                  alt={`Roteiro ilustrado dia a dia — ${nome} — ${variante?.label ?? ""}`}
                  width={variante?.id === "15d" ? 1184 : 1694}
                  height={variante?.id === "15d" ? 3556 : 2528}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="h-auto w-full"
                />
                <span className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition group-hover:bg-black/85">
                  <IconZoom className="h-4 w-4" />
                </span>
              </button>
            )}

            {stops && (
              <p className="mx-auto mt-5 max-w-md text-center text-sm font-light leading-6 text-white/60">
                {resumoRoteiro(stops)}
              </p>
            )}

            {diasRoteiro && (
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => setRoteiroAberto((v) => !v)}
                  aria-expanded={roteiroAberto}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  {roteiroAberto ? "Ocultar roteiro completo" : "Ver roteiro completo"}
                  <IconChevron
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      roteiroAberto ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            )}

            {roteiroAberto && diasRoteiro && (
              <div className="mt-5 space-y-2.5">
                {diasRoteiro.map((d) => (
                  <DiaAccordionRow
                    key={d.dia}
                    dia={d}
                    aberta={diasAbertos.has(d.dia)}
                    onToggle={() => toggleDia(d.dia)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── NÍVEL 3 · "QUERO CONFERIR OS DETALHES" ── */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className={`${display.className} text-lg font-medium text-white`}>
              O que está incluso
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {inclusoes.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setInclusaoAberta(item)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-left transition hover:border-white/25 hover:bg-white/[0.06]"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm text-white">
                    <IconCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span className="truncate">{item.title}</span>
                  </span>
                  <IconChevron className="h-3.5 w-3.5 shrink-0 -rotate-90 text-white/30" />
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs font-light leading-5 text-white/35">
              <span className="font-medium text-white/45">Não incluído:</span> refeições não
              mencionadas no roteiro, despesas pessoais e passeios fora do itinerário previsto.
            </p>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className={`${display.className} text-lg font-medium text-white`}>
              Antes de viajar
            </h3>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">
                🚶 Ritmo moderado
              </p>
              <p className="mt-1.5 text-xs font-light leading-5 text-white/55">
                Alguns dias incluem caminhadas e escadas. Recomendamos condições físicas
                compatíveis com passeios urbanos regulares.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className={`${display.className} text-lg font-medium text-white`}>
              Como reservar
            </h3>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 text-center text-sm font-semibold text-white/85">
              <span>① Escolha a duração</span>
              <span className="text-white/25">→</span>
              <span>② Solicite sua vaga</span>
              <span className="text-white/25">→</span>
              <span>③ Receba a confirmação com valores definitivos</span>
            </div>
            <p className="mx-auto mt-3 max-w-md text-center text-xs font-light leading-5 text-white/45">
              Após o pedido, nossa equipe confirma disponibilidade, valores definitivos,
              condições de pagamento e documentação.
            </p>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <button
              type="button"
              onClick={() => setFaqSecaoAberta((v) => !v)}
              aria-expanded={faqSecaoAberta}
              className="flex w-full items-center justify-between gap-3"
            >
              <h3 className={`${display.className} text-lg font-medium text-white`}>
                Perguntas frequentes
              </h3>
              <IconChevron
                className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${
                  faqSecaoAberta ? "rotate-180" : ""
                }`}
              />
            </button>
            {faqSecaoAberta && (
              <div className="mt-4 space-y-2.5">
                {FAQ_CARAVANA.map((item) => {
                  const aberta = faqAberta === item.pergunta;
                  return (
                    <div
                      key={item.pergunta}
                      className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/25 hover:bg-white/[0.06]"
                    >
                      <button
                        type="button"
                        onClick={() => setFaqAberta(aberta ? null : item.pergunta)}
                        aria-expanded={aberta}
                        className="flex w-full items-center justify-between gap-3 p-3.5 text-left"
                      >
                        <p className="text-sm font-medium text-white">{item.pergunta}</p>
                        <IconChevron
                          className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${
                            aberta ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {aberta && (
                        <p className="px-3.5 pb-3.5 text-xs font-light leading-5 text-white/50">
                          {item.resposta}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── CTA sticky: só aparece depois que o botão do hero sai da
             tela (ver heroCtaVisible/IntersectionObserver acima) — nunca os
             dois "Solicitar minha vaga" visíveis ao mesmo tempo (ponto 10) ── */}
        {!heroCtaVisible && (
          <div className="flex shrink-0 items-center gap-4 border-t border-white/10 bg-[#0a0a0a] px-5 py-4 md:px-8">
            {variante && (
              <div className="hidden shrink-0 sm:block">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/35">
                  {variante.label}
                </p>
                <p className={`${display.className} text-xl font-semibold text-[#6ec3d9]`}>
                  {variante.precoLabel}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={handleAdd}
              disabled={variante?.precoBRL != null && !cambio}
              className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              style={{ backgroundColor: adicionado ? "#2f9e6e" : "#2f80c9" }}
            >
              {adicionado ? (
                <>
                  <IconCheck className="h-4 w-4" /> Solicitação enviada
                </>
              ) : (
                <>
                  <IconTicket className="h-4 w-4" /> Solicitar minha vaga
                </>
              )}
            </button>
          </div>
        )}
      </div>
        </div>,
        document.body,
      )}

      {inclusaoAberta &&
        createPortal(
          <div
            className="fixed inset-0 z-[140] flex items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
            onClick={() => setInclusaoAberta(null)}
          >
            <div
              className="relative w-full max-w-md rounded-[24px] border border-white/10 bg-[#0a0a0a] p-6 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setInclusaoAberta(null)}
                aria-label="Fechar"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white"
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
              <p className="flex items-center gap-2 pr-8 text-base font-medium text-white">
                {inclusaoAberta.title}
              </p>
              <p className="mt-3 whitespace-pre-line text-sm font-light leading-6 text-white/65">
                {inclusaoAberta.detalhe}
              </p>
            </div>
          </div>,
          document.body,
        )}

      {roteiroImagemZoom &&
        createPortal(
          <div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm md:p-10"
            onClick={() => setRoteiroImagemZoom(false)}
          >
            <button
              type="button"
              onClick={() => setRoteiroImagemZoom(false)}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
            >
              <IconX className="h-4 w-4" />
            </button>
            <div className="relative max-h-full max-w-full overflow-auto" onClick={(e) => e.stopPropagation()}>
              <Image
                src={
                  variante?.id === "15d"
                    ? "/images/pacote-14-dias.jpg"
                    : "/images/pacote-7-dias-v2.jpg"
                }
                alt={`Roteiro ilustrado dia a dia — ${nome} — ${variante?.label ?? ""}`}
                width={variante?.id === "15d" ? 1184 : 1694}
                height={variante?.id === "15d" ? 3556 : 2528}
                sizes="100vw"
                className="h-auto w-full rounded-xl md:w-auto md:max-w-none"
              />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
