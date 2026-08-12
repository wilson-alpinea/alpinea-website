"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { useCart } from "./CartContext";

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

function formatBRL(valor: number): string {
  return `R$ ${Math.round(valor).toLocaleString("pt-BR")}`;
}

const CATEGORIAS_HOTEL = ["3 estrelas", "4 estrelas", "5 estrelas"] as const;
const TIPOS_QUARTO = [
  "Individual",
  "Duplo (casal)",
  "Duplo (compartilhado)",
  "Triplo",
] as const;

type PrecoCtx = {
  dias: number;
  categoriaHotel: (typeof CATEGORIAS_HOTEL)[number];
  tipoQuarto: (typeof TIPOS_QUARTO)[number];
};

// Diária de hotel por categoria — usada pra calcular o total do pacote
// conforme categoria do hotel, tipo de quarto e quantidade de dias.
// ATENÇÃO: valores fictícios, precisam ser confirmados/ajustados por você
// antes de publicar (mesmo aviso que já vale pros preços fixos de
// Caravana/Individual).
const DIARIA_HOTEL: Record<(typeof CATEGORIAS_HOTEL)[number], number> = {
  "3 estrelas": 250,
  "4 estrelas": 400,
  "5 estrelas": 700,
};

// Fator por tipo de quarto — quarto compartilhado dilui o custo por pessoa.
const FATOR_QUARTO: Record<(typeof TIPOS_QUARTO)[number], number> = {
  Individual: 1,
  "Duplo (casal)": 0.65,
  "Duplo (compartilhado)": 0.65,
  Triplo: 0.5,
};

const DIARIA_TRANSPORTE = 150;
const DIARIA_GUIA = 300;
const DIARIA_JR_PASS = 180;
const DIARIA_SEGURO_VIAGEM = 35;
const DIARIA_MOTORISTA_PRIVADO = 350;
const PRECO_CAMBIO_BRASIL = 150;

// Preços por item — aéreo, câmbio e serviços adicionais têm valor fixo por
// viagem; hotel, transporte, guia, JR Pass, seguro viagem e motorista
// privado variam conforme categoria do hotel, tipo de quarto e quantidade
// de dias selecionados acima.
const OPCOES = [
  {
    key: "aereo",
    label: "Aéreo",
    icone: "✈️",
    descricao: "Passagem internacional ida e volta",
    calcPreco: () => 8000,
  },
  {
    key: "hotel",
    label: "Hotel",
    icone: "🏨",
    descricao: "Hospedagem selecionada durante toda a viagem",
    calcPreco: (ctx: PrecoCtx) =>
      Math.round(DIARIA_HOTEL[ctx.categoriaHotel] * ctx.dias * FATOR_QUARTO[ctx.tipoQuarto]),
  },
  {
    key: "transporte",
    label: "Transporte",
    icone: "🚐",
    descricao: "Transfers e deslocamentos do roteiro",
    calcPreco: (ctx: PrecoCtx) => DIARIA_TRANSPORTE * ctx.dias,
  },
  {
    key: "guia",
    label: "Guia",
    icone: "🧭",
    descricao: "Guia turístico acompanhando o roteiro",
    calcPreco: (ctx: PrecoCtx) => DIARIA_GUIA * ctx.dias,
  },
  {
    key: "jrpass",
    label: "JR Pass",
    icone: "🚄",
    descricao: "Passe ferroviário com deslocamentos ilimitados de trem-bala",
    calcPreco: (ctx: PrecoCtx) => DIARIA_JR_PASS * ctx.dias,
  },
  {
    key: "seguro",
    label: "Seguro Viagem",
    icone: "🛡️",
    descricao: "Cobertura médica e assistência durante toda a viagem",
    calcPreco: (ctx: PrecoCtx) => DIARIA_SEGURO_VIAGEM * ctx.dias,
  },
  {
    key: "cambio",
    label: "Câmbio no Brasil",
    icone: "💴",
    descricao: "Retirada de ienes com câmbio comercial antes do embarque",
    calcPreco: () => PRECO_CAMBIO_BRASIL,
  },
  {
    key: "motorista",
    label: "Transfer com Motorista Privado",
    icone: "🚗",
    descricao: "Traslados exclusivos, sem compartilhar veículo com outros grupos",
    calcPreco: (ctx: PrecoCtx) => DIARIA_MOTORISTA_PRIVADO * ctx.dias,
  },
  {
    key: "servicos",
    label: "Serviços Adicionais",
    icone: "✨",
    descricao: "Reservas, concierge e experiências sob medida",
    calcPreco: () => 2500,
  },
] as const;

type OpcaoKey = (typeof OPCOES)[number]["key"];

// Itens essenciais vêm pré-selecionados; os complementares (JR Pass, seguro
// viagem, câmbio, motorista privado) ficam disponíveis pra adicionar sob
// demanda.
const ITENS_PADRAO: OpcaoKey[] = ["aereo", "hotel", "transporte", "guia", "servicos"];

// Fotos ainda faltando pra Okinawa e Hiroshima na biblioteca de imagens —
// os cards seguem funcionais (fundo sólido com o nome da cidade) até você
// subir as fotos reais dessas duas.
const DESTINOS = [
  { key: "tokyo", nome: "Tokyo", imagem: "/images/tokyo.jpg" },
  { key: "osaka", nome: "Osaka", imagem: "/images/osaka-castle.png" },
  { key: "kyoto", nome: "Kyoto", imagem: "/images/kyoto-maiko-street.png" },
  { key: "okinawa", nome: "Okinawa", imagem: null },
  { key: "hiroshima", nome: "Hiroshima", imagem: null },
  { key: "hakone", nome: "Hakone", imagem: "/images/fuji.JPG" },
] as const;

type DestinoKey = (typeof DESTINOS)[number]["key"];

const MIN_DIAS = 3;
const MAX_DIAS = 30;

export function CustomPackageCard() {
  const { addItem } = useCart();
  const [data, setData] = useState("");
  const [dias, setDias] = useState(10);
  const [categoriaHotel, setCategoriaHotel] =
    useState<(typeof CATEGORIAS_HOTEL)[number]>("4 estrelas");
  const [tipoQuarto, setTipoQuarto] =
    useState<(typeof TIPOS_QUARTO)[number]>("Individual");
  const [selecionados, setSelecionados] = useState<Set<OpcaoKey>>(
    () => new Set(ITENS_PADRAO),
  );
  const [destinosSelecionados, setDestinosSelecionados] = useState<Set<DestinoKey>>(
    () => new Set(),
  );
  const [observacoes, setObservacoes] = useState("");
  const [adicionado, setAdicionado] = useState(false);

  const precoCtx = useMemo<PrecoCtx>(
    () => ({ dias, categoriaHotel, tipoQuarto }),
    [dias, categoriaHotel, tipoQuarto],
  );

  const itensSelecionados = useMemo(
    () => OPCOES.filter((o) => selecionados.has(o.key)),
    [selecionados],
  );
  const total = useMemo(
    () => itensSelecionados.reduce((soma, o) => soma + o.calcPreco(precoCtx), 0),
    [itensSelecionados, precoCtx],
  );

  function toggleOpcao(key: OpcaoKey) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function toggleDestino(key: DestinoKey) {
    setDestinosSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const nomesDestinos = useMemo(
    () => DESTINOS.filter((d) => destinosSelecionados.has(d.key)).map((d) => d.nome),
    [destinosSelecionados],
  );

  const detalhesPacote = useMemo(() => {
    const linhas: string[] = [];
    if (nomesDestinos.length) linhas.push(`Destinos: ${nomesDestinos.join(", ")}`);
    if (observacoes) linhas.push(`Preferências: ${observacoes}`);
    return linhas;
  }, [nomesDestinos, observacoes]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const dataFormatada = data
      ? new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Data a combinar";

    addItem({
      divisao: "Personalizado",
      nome: "Pacote Personalizado",
      variante: `Data solicitada: ${dataFormatada}`,
      duracao: `${dias} dias`,
      periodo: dataFormatada,
      acomodacao: `${tipoQuarto} · Hotel ${categoriaHotel}`,
      itens: itensSelecionados.map((o) =>
        o.key === "hotel"
          ? { icone: o.icone, texto: `${o.label} — ${categoriaHotel}` }
          : { icone: o.icone, texto: o.label },
      ),
      detalhes: detalhesPacote.length > 0 ? detalhesPacote : undefined,
      precoLabel: total > 0 ? formatBRL(total) : "Sob consulta",
      precoSufixo: total > 0 ? "estimativa, sujeita a confirmação" : undefined,
      imagem: "/images/personalizado-hero.png",
    });

    setAdicionado(true);
    window.setTimeout(() => setAdicionado(false), 2200);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:rounded-[2rem] md:p-8">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#e0916a]">
        Sob medida
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
              Data preferida
            </span>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark] focus:border-white/40"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
              Quantidade de dias
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDias((d) => Math.max(MIN_DIAS, d - 1))}
                aria-label="Diminuir um dia"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white transition hover:border-white/40"
              >
                −
              </button>
              <span className="flex-1 rounded-lg border border-white/15 bg-black/30 py-2.5 text-center text-sm text-white">
                {dias} {dias === 1 ? "dia" : "dias"}
              </span>
              <button
                type="button"
                onClick={() => setDias((d) => Math.min(MAX_DIAS, d + 1))}
                aria-label="Aumentar um dia"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white transition hover:border-white/40"
              >
                +
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
              Categoria do hotel
            </span>
            <select
              value={categoriaHotel}
              onChange={(e) =>
                setCategoriaHotel(e.target.value as (typeof CATEGORIAS_HOTEL)[number])
              }
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/40"
            >
              {CATEGORIAS_HOTEL.map((c) => (
                <option key={c} value={c} className="bg-black">
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
              Tipo de quarto
            </span>
            <select
              value={tipoQuarto}
              onChange={(e) => setTipoQuarto(e.target.value as (typeof TIPOS_QUARTO)[number])}
              className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/40"
            >
              {TIPOS_QUARTO.map((t) => (
                <option key={t} value={t} className="bg-black">
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
            Monte seu pacote
          </span>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {OPCOES.map((opcao) => {
              const ativo = selecionados.has(opcao.key);
              return (
                <button
                  key={opcao.key}
                  type="button"
                  onClick={() => toggleOpcao(opcao.key)}
                  aria-pressed={ativo}
                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    ativo
                      ? "border-[#2f80c9]/50 bg-[#2f80c9]/10"
                      : "border-white/10 bg-black/20 hover:border-white/25"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition ${
                      ativo
                        ? "border-[#2f80c9] bg-[#2f80c9] text-white"
                        : "border-white/25 text-transparent"
                    }`}
                  >
                    <IconCheck className="h-3 w-3" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-sm font-medium text-white">
                      {opcao.icone} {opcao.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-white/40">
                      {opcao.descricao}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
            Destinos
          </span>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {DESTINOS.map((destino) => {
              const ativo = destinosSelecionados.has(destino.key);
              return (
                <button
                  key={destino.key}
                  type="button"
                  onClick={() => toggleDestino(destino.key)}
                  aria-pressed={ativo}
                  className={`group relative aspect-square overflow-hidden rounded-xl border text-left transition ${
                    ativo
                      ? "border-[#2f80c9] shadow-[0_0_0_1px_rgba(47,128,201,0.5)]"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  {destino.imagem ? (
                    <Image
                      src={destino.imagem}
                      alt={destino.nome}
                      fill
                      sizes="140px"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1c2b45] to-[#0a0f1c]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 right-2 text-xs font-medium leading-tight text-white">
                    {destino.nome}
                  </span>
                  <span
                    className={`absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] transition ${
                      ativo
                        ? "border-[#2f80c9] bg-[#2f80c9] text-white"
                        : "border-white/40 bg-black/30 text-transparent"
                    }`}
                  >
                    <IconCheck className="h-3 w-3" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
            O que você gostaria de incluir? (opcional)
          </span>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            placeholder="Ex: passeio noturno em Ginza, compras em Ginza, jantar especial..."
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
              Total estimado
            </p>
            <p className="mt-1 text-2xl font-semibold text-white">
              {total > 0 ? formatBRL(total) : "Sob consulta"}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-white/40">
              Valor calculado conforme os itens selecionados acima — a Ajisai
              confirma o preço final por consulta.
            </p>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-0.5 sm:px-8"
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
      </form>
    </div>
  );
}
