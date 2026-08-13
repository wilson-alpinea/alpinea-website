"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bodoni_Moda } from "next/font/google";
import { useCart, type CartItem } from "./CartContext";
import type { PackageVariant } from "./packageTypes";
import { PrecoPacote } from "./PrecoPacote";
import { useCambioUSD, brlParaUSDLabel } from "../hooks/useCambioUSD";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Vale para todos os pacotes de Caravana e Individual — mesma lista usada
// antes na seção global "O que está incluso", agora dentro do detalhe de
// cada pacote.
// Fluxo de cidades por duração — mesmo padrão visual (bolinhas + etiqueta)
// usado no TripDashboard da página de roteiros.
type ItinerarioStop = { city: string; dias: number; bateVolta?: boolean };

const ITINERARIO_CITY_BORDER: Record<string, string> = {
  Tokyo: "rgba(255,255,255,0.16)",
  Osaka: "rgba(196,148,110,0.45)",
  Kyoto: "rgba(118,150,168,0.45)",
  Nara: "rgba(150,172,120,0.45)",
  Nachikatsuura: "rgba(150,172,120,0.45)",
  "Fujiyoshida/Fujikawaguchiko": "rgba(110,195,217,0.45)",
};

const ITINERARIOS: Record<string, ItinerarioStop[]> = {
  "7d": [
    { city: "Tokyo", dias: 3 },
    { city: "Kyoto", dias: 3 },
    { city: "Tokyo", dias: 1 },
  ],
  "15d": [
    { city: "Tokyo", dias: 6 },
    { city: "Kyoto", dias: 3 },
    { city: "Osaka", dias: 2 },
    { city: "Nara", dias: 1, bateVolta: true },
    { city: "Nachikatsuura", dias: 1, bateVolta: true },
    { city: "Fujiyoshida/Fujikawaguchiko", dias: 2 },
  ],
};

// Roteiro dia a dia — consistente com o fluxo de cidades acima. ATENÇÃO:
// atrações e ordem dos dias são um exemplo de referência (mesmo nível de
// detalhe de um roteiro real), precisam ser revisados e confirmados por
// você antes de publicar — datas exatas só são atribuídas na reserva.
// cidade usa as mesmas chaves de ITINERARIO_CITY_BORDER, pra colorir a
// bolinha do dia com a mesma cor da cidade no fluxo "Cidades" acima.
type DiaRoteiro = { dia: number; titulo: string; texto: string; cidade: string };

const ROTEIRO_7D: DiaRoteiro[] = [
  {
    dia: 1,
    titulo: "Chegada em Tóquio",
    texto: "Desembarque no Aeroporto de Narita ou Haneda e traslado ao hotel. Restante do dia livre para descanso.",
    cidade: "Tokyo",
  },
  {
    dia: 2,
    titulo: "Tóquio — Asakusa & Skytree",
    texto: "Templo Senso-ji e a tradicional Nakamise-dori, seguido de subida à Tokyo Skytree para uma vista panorâmica da cidade.",
    cidade: "Tokyo",
  },
  {
    dia: 3,
    titulo: "Tóquio — Harajuku & Shibuya",
    texto: "Santuário Meiji, passeio por Takeshita-dori em Harajuku e passagem pelo icônico cruzamento de Shibuya.",
    cidade: "Tokyo",
  },
  {
    dia: 4,
    titulo: "Tóquio → Kyoto",
    texto: "Deslocamento em trem-bala (Shinkansen) até Kyoto. Chegada e caminhada noturna pelo distrito histórico de Gion.",
    cidade: "Kyoto",
  },
  {
    dia: 5,
    titulo: "Kyoto — Fushimi Inari & Kinkaku-ji",
    texto: "Santuário Fushimi Inari Taisha, famoso pelos milhares de portais vermelhos, e Kinkaku-ji, o Pavilhão Dourado.",
    cidade: "Kyoto",
  },
  {
    dia: 6,
    titulo: "Kyoto — Kiyomizu-dera & Arashiyama",
    texto: "Templo Kiyomizu-dera, com vista elevada sobre a cidade, e o Bosque de Bambu de Arashiyama.",
    cidade: "Kyoto",
  },
  {
    dia: 7,
    titulo: "Retorno a Tóquio & embarque",
    texto: "Deslocamento de volta a Tóquio, tempo livre para compras e traslado ao aeroporto para o voo de retorno.",
    cidade: "Tokyo",
  },
];

// Ordem dos dias segue a mesma sequência de cidades de ITINERARIOS["15d"]
// (Tóquio → Kyoto → Osaka → Nara → Nachikatsuura → Fujiyoshida), pra bater
// com o fluxo "Cidades" mostrado acima — o Monte Fuji fica no fim da
// viagem, a caminho do embarque, e não logo depois de Tóquio.
const ROTEIRO_15D: DiaRoteiro[] = [
  {
    dia: 1,
    titulo: "Chegada em Tóquio",
    texto: "Desembarque no Aeroporto de Narita ou Haneda e traslado ao hotel. Restante do dia livre para descanso.",
    cidade: "Tokyo",
  },
  {
    dia: 2,
    titulo: "Tóquio — Asakusa & Skytree",
    texto: "Templo Senso-ji e a tradicional Nakamise-dori, seguido de subida à Tokyo Skytree para uma vista panorâmica da cidade.",
    cidade: "Tokyo",
  },
  {
    dia: 3,
    titulo: "Tóquio — Harajuku & Shibuya",
    texto: "Santuário Meiji, passeio por Takeshita-dori em Harajuku e passagem pelo icônico cruzamento de Shibuya.",
    cidade: "Tokyo",
  },
  {
    dia: 4,
    titulo: "Tóquio — Palácio Imperial & Ginza",
    texto: "Jardins do Palácio Imperial, Estação de Tóquio e tempo livre para compras em Ginza e Akihabara.",
    cidade: "Tokyo",
  },
  {
    dia: 5,
    titulo: "Tóquio — dia livre",
    texto: "Dia livre com sugestões de passeio: Odaiba, TeamLab, Tokyo Disney Resort ou compras em Shinjuku.",
    cidade: "Tokyo",
  },
  {
    dia: 6,
    titulo: "Tóquio → Kyoto",
    texto: "Deslocamento em trem-bala (Shinkansen) até Kyoto. Chegada e caminhada noturna pelo distrito histórico de Gion.",
    cidade: "Kyoto",
  },
  {
    dia: 7,
    titulo: "Kyoto — Fushimi Inari & Kinkaku-ji",
    texto: "Santuário Fushimi Inari Taisha, famoso pelos milhares de portais vermelhos, e Kinkaku-ji, o Pavilhão Dourado.",
    cidade: "Kyoto",
  },
  {
    dia: 8,
    titulo: "Kyoto — Kiyomizu-dera & Arashiyama",
    texto: "Templo Kiyomizu-dera, com vista elevada sobre a cidade, e o Bosque de Bambu de Arashiyama.",
    cidade: "Kyoto",
  },
  {
    dia: 9,
    titulo: "Kyoto → Osaka",
    texto: "Deslocamento até Osaka. Castelo de Osaka e seu jardim, seguido de Dotombori, região de compras e gastronomia.",
    cidade: "Osaka",
  },
  {
    dia: 10,
    titulo: "Osaka — Aquário & tempo livre",
    texto: "Aquário Kaiyukan e tempo livre para explorar a cidade — Universal Studios Japan como sugestão opcional.",
    cidade: "Osaka",
  },
  {
    dia: 11,
    titulo: "Bate-volta a Nara",
    texto: "Parque de Nara, com seus cervos sagrados, e o Templo Todai-ji, que abriga o grande Buda de bronze. Retorno a Osaka.",
    cidade: "Nara",
  },
  {
    dia: 12,
    titulo: "Bate-volta a Nachikatsuura",
    texto: "Cachoeira Nachi e o Santuário Kumano Nachi Taisha, na região de Kumano. Retorno a Osaka.",
    cidade: "Nachikatsuura",
  },
  {
    dia: 13,
    titulo: "Osaka → Fujiyoshida/Kawaguchiko",
    texto: "Deslocamento até a região do Monte Fuji. Vila de Oshino Hakkai, com suas lagoas alimentadas pelo degelo da montanha.",
    cidade: "Fujiyoshida/Fujikawaguchiko",
  },
  {
    dia: 14,
    titulo: "Fujiyoshida/Kawaguchiko — Monte Fuji",
    texto: "Manhã no Lago Kawaguchi, com vista panorâmica do Monte Fuji; tarde livre na região.",
    cidade: "Fujiyoshida/Fujikawaguchiko",
  },
  {
    dia: 15,
    titulo: "Embarque de volta",
    texto: "Traslado ao aeroporto e embarque no voo de retorno ao Brasil.",
    cidade: "Fujiyoshida/Fujikawaguchiko",
  },
];

const ROTEIROS_DETALHADOS: Record<string, DiaRoteiro[]> = {
  "7d": ROTEIRO_7D,
  "15d": ROTEIRO_15D,
};

// Resumo de refeições inclusas — estimativa por duração, mesma ressalva do
// roteiro acima (revisar antes de publicar).
const REFEICOES_INCLUSAS: Record<string, { cafe: number; almoco: number; jantar: number }> = {
  "7d": { cafe: 6, almoco: 4, jantar: 1 },
  "15d": { cafe: 14, almoco: 10, jantar: 2 },
};

function ItinerarioFlow({ stops }: { stops: ItinerarioStop[] }) {
  const circleSize = 56;
  const arrowWidth = 28;
  const labelWidth = 96;

  return (
    // Cada parada (círculo + rótulo) fica num único bloco flex, pra não
    // quebrar linha separadamente — antes o círculo e o texto viviam em
    // duas linhas flex-wrap independentes e podiam desalinhar quando o
    // rótulo era mais largo que o círculo (nomes de cidade compostos).
    <div className="flex flex-wrap items-start justify-center gap-y-8">
      {stops.map((stop, i) => (
        <div key={i} className="flex items-start">
          <div className="flex flex-col items-center" style={{ width: labelWidth }}>
            <div
              className="shrink-0 rounded-full border"
              style={{
                width: circleSize,
                height: circleSize,
                borderColor: ITINERARIO_CITY_BORDER[stop.city] ?? "rgba(255,255,255,0.3)",
                backgroundColor: ITINERARIO_CITY_BORDER[stop.city] ?? "rgba(255,255,255,0.3)",
              }}
            />
            <div className="mt-3 text-center">
              <p className="break-words text-[9px] uppercase leading-tight tracking-[0.02em] text-white/70">
                {stop.city.split("/").map((part, idx, arr) => (
                  <span key={idx}>
                    {part}
                    {idx < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
              <p className="text-[11px] text-white/35">
                {stop.dias} {stop.dias === 1 ? "dia" : "dias"}
              </p>
              {stop.bateVolta && (
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.08em] text-white/25">
                  Bate e volta
                </p>
              )}
            </div>
          </div>
          {i < stops.length - 1 && (
            <svg
              width={arrowWidth}
              height="10"
              viewBox="0 0 28 10"
              fill="none"
              className="mx-1 mt-6 shrink-0"
              style={{ marginTop: circleSize / 2 - 5 }}
            >
              <line x1="0" y1="5" x2="20" y2="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
              <path d="M18 1 L26 5 L18 9" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}

const INCLUSOES_PADRAO = [
  {
    title: "Roteiro Digital",
    text: "Itinerário dia a dia, com atrações, deslocamento, refeições e aeroportos, acessível durante toda a viagem.",
  },
  {
    title: "Hotel",
    text: "Hospedagem selecionada, em localizações estratégicas para o roteiro.",
  },
  {
    title: "Passagem Aérea",
    text: "Ida e volta, com as melhores opções de conexão para o Japão.",
  },
  {
    title: "Seguro Viagem",
    text: "Cobertura médico-hospitalar de US$ 60 mil, para toda a duração da viagem. Passageiros a partir de 85 anos, sob consulta.",
  },
  {
    title: "Bagagem",
    text: "1 bagagem despachada de até 23kg e 1 bagagem de mão por pessoa, conforme a companhia aérea selecionada.",
  },
  {
    title: "Pocket Wi-Fi ou eSIM 5G",
    text: "Conexão disponível durante todo o roteiro.",
  },
  {
    title: "Guia Turístico",
    text: "Acompanhamento local em pontos-chave do roteiro.",
    opcional: true,
  },
  {
    title: "Transfer",
    text: "Translados aeroporto-hotel e hotel-aeroporto.",
    opcional: true,
  },
];

// Respostas padrão para as dúvidas comerciais mais comuns. ATENÇÃO: valores
// de referência — precisam ser confirmados/ajustados por você antes de
// publicar, igual combinamos com os preços.
const FAQ_PADRAO = [
  {
    pergunta: "Qual categoria de hotel?",
    resposta: "Acomodação de 3 a 4 estrelas, selecionada por localização e conforto — sempre com curadoria Ajisai. Exemplo: Daiwa Roynet.",
  },
  {
    pergunta: "O que é um hotel 4 estrelas?",
    resposta: "Hotéis de categoria superior, com padrão internacional de conforto: quartos bem equipados, café da manhã incluso, localização estratégica e serviços como recepção 24h — sem o luxo e as amenidades adicionais (spa, múltiplos restaurantes) de um 5 estrelas.",
  },
  {
    pergunta: "Quarto individual ou duplo?",
    resposta: "Preço padrão por pessoa em quarto individual. Quarto duplo (compartilhado) disponível mediante consulta.",
  },
  {
    pergunta: "Bagagem está incluída na passagem?",
    resposta: "Sim — 1 bagagem despachada e 1 de mão por pessoa, conforme a companhia aérea selecionada.",
  },
  {
    pergunta: "Café da manhã?",
    resposta: "Incluído em todos os hotéis do roteiro.",
  },
  {
    pergunta: "Shinkansen?",
    resposta: "Trechos de trem-bala previstos no roteiro estão inclusos.",
  },
  {
    pergunta: "Ingressos das atrações?",
    resposta: "Ingressos das atrações previstas no roteiro estão inclusos.",
  },
  {
    pergunta: "Refeições?",
    resposta: "Café da manhã incluso; almoços e jantares não inclusos, salvo indicação no roteiro.",
  },
];

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

function IconCart({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2.2l1.8 11a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6l1.4-7.4H6.1" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export function PackageDetailModal({
  divisao,
  categoria,
  nome,
  tagline,
  descricao,
  destaques,
  imagem,
  selo,
  variantes,
  varianteHint = "Selecionar duração",
  varianteInicialId,
  rodape,
  onClose,
}: {
  divisao: CartItem["divisao"];
  categoria: string;
  nome: string;
  tagline: string;
  descricao: string;
  destaques: string[];
  imagem: string;
  selo?: string;
  variantes: PackageVariant[];
  varianteHint?: string;
  /** Variante já escolhida no card, antes de abrir o detalhe — abre o modal com essa selecionada. */
  varianteInicialId?: string;
  rodape?: string;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const cambio = useCambioUSD();
  const [selecionada, setSelecionada] = useState(varianteInicialId ?? variantes[0]?.id ?? "");
  const [adicionado, setAdicionado] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function selecionarVariante(id: string) {
    setSelecionada(id);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const variante = variantes.find((v) => v.id === selecionada) ?? variantes[0];

  // Guia e transfer são padrão (não opcionais) nos Pacotes de Caravana —
  // já vêm inclusos no grupo fechado, ao contrário das demais divisões.
  const inclusoes =
    divisao === "Pacotes de Caravana"
      ? INCLUSOES_PADRAO.map((item) => ({ ...item, opcional: false }))
      : INCLUSOES_PADRAO;

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

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-sm md:flex md:items-center md:justify-center md:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex h-[100dvh] w-full flex-col overflow-x-hidden bg-[#0a0a0a] text-white md:h-auto md:max-h-[88vh] md:max-w-2xl md:overflow-hidden md:rounded-[28px] md:border md:border-white/10"
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
          <h2 className={`${display.className} text-2xl font-medium text-white md:text-3xl`}>
            {nome}
          </h2>
          <p className="mt-1.5 text-sm font-light leading-6 text-white/55">{tagline}</p>
          <p className="mt-4 text-sm font-light leading-6 text-white/65">{descricao}</p>

          <ul className="mt-5 space-y-2.5">
            {destaques.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-5 text-white/70">
                <span className="mt-0.5 shrink-0" style={{ color: "#6ec3d9" }}>
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className={`${display.className} text-lg font-medium text-white`}>Itinerário</h3>

            {variante && ITINERARIOS[variante.id] && (
              <div className="mt-5">
                <p className="mb-5 text-center">
                  <span className="inline-block rounded-full border border-white/25 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70">
                    Roteiro de {variante.label}
                  </span>
                </p>
                <p className="mb-5 text-center text-xs uppercase tracking-[0.35em] text-white/40">
                  Cidades
                </p>
                <ItinerarioFlow stops={ITINERARIOS[variante.id]} />
              </div>
            )}

            {variante && ROTEIROS_DETALHADOS[variante.id] && (
              <div className="mt-8">
                <p className="mb-4 text-center text-xs uppercase tracking-[0.35em] text-white/40">
                  Roteiro dia a dia
                </p>
                <div className="space-y-3">
                  {ROTEIROS_DETALHADOS[variante.id].map((d) => (
                    <div
                      key={d.dia}
                      className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5"
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: ITINERARIO_CITY_BORDER[d.cidade] ?? "#2f80c9" }}
                      >
                        {d.dia}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{d.titulo}</p>
                        <p className="mt-1 text-xs font-light leading-5 text-white/50">
                          {d.texto}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {REFEICOES_INCLUSAS[variante.id] && (
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                      <p className="text-lg">☕</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {REFEICOES_INCLUSAS[variante.id].cafe}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-white/40">
                        Café da manhã
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                      <p className="text-lg">🍽️</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {REFEICOES_INCLUSAS[variante.id].almoco}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-white/40">
                        Almoço
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
                      <p className="text-lg">🍶</p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {REFEICOES_INCLUSAS[variante.id].jantar}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-white/40">
                        Jantar
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="mt-6 text-sm font-light leading-6 text-white/60">
              Assim que a reserva é confirmada, você recebe o Roteiro Digital
              Ajisai: a versão completa da programação dia a dia, com
              hospedagem, deslocamentos e os principais pontos de cada data,
              disponível pelo celular durante toda a viagem.
            </p>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className={`${display.className} text-lg font-medium text-white`}>
              O que está incluso
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {inclusoes.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-white/25 hover:bg-white/[0.06]"
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-white">
                    {item.title}
                    {item.opcional && (
                      <span className="rounded-full bg-[#6ec3d9]/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[#6ec3d9]">
                        Opcional
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-xs font-light leading-5 text-white/50">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.05] p-3.5">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-300">
                Notas importantes
              </p>
              <p className="mt-1.5 text-xs font-light leading-5 text-white/55">
                Há passeios com longas caminhadas e subida de escadas, que
                exigem esforço físico relativo — recomendamos que os
                participantes estejam em condições físicas adequadas para
                melhor aproveitamento da viagem.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <h3 className={`${display.className} text-lg font-medium text-white`}>
              Perguntas frequentes
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FAQ_PADRAO.map((item) => {
                const destaque = item.pergunta === "O que é um hotel 4 estrelas?";
                return (
                  <div
                    key={item.pergunta}
                    className={
                      destaque
                        ? "rounded-xl border p-3.5 transition"
                        : "rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-white/25 hover:bg-white/[0.06]"
                    }
                    style={
                      destaque
                        ? { borderColor: "rgba(234,179,8,0.4)", backgroundColor: "rgba(234,179,8,0.08)" }
                        : undefined
                    }
                  >
                    <p
                      className="text-sm font-medium text-white"
                      style={destaque ? { color: "#eab308" } : undefined}
                    >
                      {item.pergunta}
                    </p>
                    <p className="mt-1 text-xs font-light leading-5 text-white/50">{item.resposta}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            {variantes.length > 1 && (
              <>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                  {varianteHint}
                </p>
                <div className="flex flex-wrap gap-3">
                  {variantes.map((v) => {
                    const ativo = v.id === selecionada;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => selecionarVariante(v.id)}
                        className={`rounded-full border px-7 py-3.5 text-base font-semibold uppercase tracking-[0.1em] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.06] active:scale-95 ${
                          ativo
                            ? "border-transparent text-white shadow-[0_10px_26px_rgba(0,0,0,0.4)]"
                            : "border-white/20 text-white/60 hover:border-white/50 hover:text-white hover:shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
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
              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-white/45">
                  {variante.datas}
                </p>
                <PrecoPacote
                  variante={variante}
                  precoClassName={`${display.className} mt-1 text-3xl font-medium text-white`}
                />
              </div>
            )}
            {rodape && <p className="mt-2 text-[11px] leading-5 text-white/40">{rodape}</p>}
          </div>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-[#0a0a0a] px-5 py-4 md:px-8">
          <button
            type="button"
            onClick={handleAdd}
            disabled={variante?.precoBRL != null && !cambio}
            className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            style={{ backgroundColor: adicionado ? "#2f9e6e" : "#2f80c9" }}
          >
            {adicionado ? (
              <>
                <IconCheck className="h-4 w-4" /> Adicionado ao carrinho
              </>
            ) : (
              <>
                <IconCart className="h-4 w-4" /> Adicionar ao carrinho
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
