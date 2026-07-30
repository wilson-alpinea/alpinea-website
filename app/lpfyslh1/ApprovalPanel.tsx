"use client";

import { useState } from "react";

// Painel de aprovação de rascunho — mesma lógica visual do Painel Interativo
// usado em /ajisairoteiros (pílulas, abas de dia, tipografia Bodoni Moda),
// mas em tema claro e sem hero, já que aqui o objetivo é só validação rápida
// das informações principais pelo cliente antes de iniciarmos o painel
// digital completo.

type Poi = {
  category?: string;
  title: string;
  description?: string;
  rating?: number;
};

type Gastronomia = {
  subtitulo?: string;
  itens: { nome: string; descricao?: string }[];
};

type Regiao = {
  nome: string;
  descricao: string;
};

type Period = {
  label?: string;
  regiao?: Regiao;
  atracaoPrincipal: string;
  pois: Poi[];
  gastronomia?: Gastronomia;
};

type DayContent = {
  day: number;
  manha: Period;
  tarde: Period;
};

function genericPeriod(): Period {
  return {
    atracaoPrincipal: "Atração Principal",
    pois: [1, 2, 3, 4].map((n) => ({ title: `Ponto de Interesse ${n}` })),
  };
}

const DAY_1: DayContent = {
  day: 1,
  manha: {
    regiao: {
      nome: "Taito",
      descricao:
        "Taito é um dos bairros mais antigos de Tokyo e já era um dos principais quando a cidade ainda era chamada Edo, a fundação do bairro ocorreu por volta do ano 1600, até hoje é um dos bairros da Tokyo Antiga preservando alguns costumes milenares que já foram abandonados em outras partes da cidade, um dos exemplos é que até hoje existem vendedores de leite em garrafa de vidro que passam de casa em casa antes de amanhecer.",
    },
    atracaoPrincipal: "Templo Sensoji Asakusa",
    pois: [
      {
        category: "Compras",
        title: "Masamoto Sohonten",
        description:
          "Uma das Top5 melhores fabricantes de faca profissional do Japão, também tem equipe dedicada de afiador profissional para facas de alta complexidade",
        rating: 4,
      },
      {
        title: "Nakamise Street",
        description:
          "Rua Dentro do complexo do Templo Sensoji, focado em souvenir e itens de pequeno porte",
        rating: 3,
      },
      {
        title: "Sumida Park",
        description:
          "Parque as margens do Rio Sumida que corta a parte leste da cidade de Tokyo, vista para a Tokyo Sky Tree",
        rating: 3,
      },
      {
        title: "Kappabashi Kitchen Town",
        description:
          "Avenida com lojas que vendem artigos de cozinha desde utensílios domésticos, louças, comida cenográfica",
        rating: 2,
      },
    ],
    gastronomia: {
      subtitulo: "Grande quantidade de lojas que vendem snacks de rua",
      itens: [
        { nome: "Melon Pan" },
        { nome: "Ningyo-yaki" },
        { nome: "Kibi Dango" },
        { nome: "Senbei feito na hora" },
      ],
    },
  },
  tarde: {
    label: "Tarde/Noite",
    regiao: {
      nome: "Sumida + Ryogoku",
      descricao:
        "Sumida é o bairro que abriga a Tokyo Sky Tree (Torre mais alta do Japão) desde 2012, o bairro como o próprio nome diz cresceu as margens do Rio Sumida que antigamente era uma das principais rotas de transporte marítimo de Tokyo. Ryogoku é o bairro onde fica o estádio nacional de sumô Kokugikan e centro do sumô com infraestrutura de gastronomia e temática de sumô nas ruas, também é onde fica um dos maiores museus de Tokyo, Tokyo-Edo Museum, que conta através de maquetes gigantes como foi a transformação de Edo (1603) até Tokyo (1868).",
    },
    atracaoPrincipal: "Tokyo Sky Tree",
    pois: [
      { title: "Tokyo Solamachi", description: "Sumida", rating: 5 },
      { title: "Museu Edo-Tokyo", description: "Ryogoku", rating: 4 },
      {
        title: "Estádio Kokugikan + Área Externa Edo Noren",
        description: "Ryogoku",
        rating: 3,
      },
      { title: "Museu de Espadas", rating: 3 },
      {
        title: "Santuário Nomi-no-Sukune",
        description:
          "Monumento com os nomes de todos os Yokozuna (Título máximo de lutador de Sumô)",
        rating: 2,
      },
    ],
    gastronomia: {
      itens: [
        {
          nome: "Chanko Nabe",
          descricao:
            "Ensopado altamente calórico que os lutadores de Sumô comem diariamente pra conseguir manter o peso",
        },
      ],
    },
  },
};

const DAYS: DayContent[] = Array.from({ length: 7 }, (_, i) =>
  i === 0
    ? DAY_1
    : {
        day: i + 1,
        manha: genericPeriod(),
        tarde: genericPeriod(),
      },
);

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-xs tracking-tight text-[#2f5aa8]" aria-label={`${rating} de 5 estrelas`}>
      {"★".repeat(rating)}
      <span className="text-[#2f5aa8]/25">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function PoiCard({ index, poi }: { index: number; poi: Poi }) {
  return (
    <div className="flex gap-3 rounded-2xl border-2 border-[#2f5aa8] bg-[#eef3fb] px-4 py-3.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2f5aa8] text-xs font-bold text-white">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {poi.category && (
            <span className="rounded-full bg-[#2f5aa8]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#2f5aa8]">
              {poi.category}
            </span>
          )}
          <span className="text-sm font-semibold text-[#2f5aa8]">
            {poi.title}
          </span>
          {typeof poi.rating === "number" && <Stars rating={poi.rating} />}
        </div>
        {poi.description && (
          <p className="mt-1 text-xs leading-5 text-[#2f5aa8]/70">
            {poi.description}
          </p>
        )}
      </div>
    </div>
  );
}

function GastronomiaBlock({ gastronomia }: { gastronomia: Gastronomia }) {
  return (
    <div className="mt-6 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
        Gastronomia
        {gastronomia.subtitulo && (
          <span className="ml-2 font-normal normal-case tracking-normal text-black/40">
            ({gastronomia.subtitulo})
          </span>
        )}
      </p>
      <ul className="mt-3 space-y-1.5">
        {gastronomia.itens.map((item) => (
          <li key={item.nome} className="text-sm leading-6 text-black/65">
            <span className="font-semibold text-black/80">{item.nome}</span>
            {item.descricao && (
              <span className="text-black/55"> — {item.descricao}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PeriodBlock({
  label,
  period,
  displayClassName,
}: {
  label: string;
  period: Period;
  displayClassName: string;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A]" />
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-black/40">
          {period.label ?? label}
        </span>
      </div>

      {period.regiao && (
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-black/45">
            Região: {period.regiao.nome}
          </p>
          <p className="mt-1.5 text-sm leading-6 text-black/60">
            {period.regiao.descricao}
          </p>
        </div>
      )}

      <h3
        className={`${displayClassName} mb-1 text-xl font-medium text-black md:text-2xl`}
      >
        {period.atracaoPrincipal}
      </h3>
      <p className="mb-5 text-xs text-black/40">
        Pontos de interesse propostos para o período
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {period.pois.map((poi, index) => (
          <PoiCard key={poi.title + index} index={index} poi={poi} />
        ))}
      </div>

      {period.gastronomia && (
        <GastronomiaBlock gastronomia={period.gastronomia} />
      )}
    </div>
  );
}

export function ApprovalPanel({
  displayClassName,
  approvalKey,
}: {
  displayClassName: string;
  approvalKey: string;
}) {
  const [activeDay, setActiveDay] = useState(0);
  const [showAdjustBox, setShowAdjustBox] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "aprovado" | "ajustes" | "error"
  >("idle");

  const current = DAYS[activeDay];

  async function sendResponse(action: "aprovado" | "ajustes") {
    setStatus("submitting");
    try {
      const res = await fetch("/api/aprovacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: approvalKey, action, mensagem }),
      });
      if (!res.ok) throw new Error();
      setStatus(action);
    } catch {
      setStatus("error");
    }
  }

  if (status === "aprovado") {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-10 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#2f5aa8]">
          Roteiro aprovado
        </p>
        <h3
          className={`${displayClassName} mt-4 text-2xl font-medium text-black md:text-3xl`}
        >
          Obrigado pela confirmação
        </h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/55">
          A elaboração do seu painel digital personalizado foi iniciada. Em
          breve você receberá o acesso completo pelo WhatsApp.
        </p>
      </div>
    );
  }

  if (status === "ajustes") {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-10 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem]">
        <p className="text-xs uppercase tracking-[0.3em] text-[#2f5aa8]">
          Ajustes solicitados
        </p>
        <h3
          className={`${displayClassName} mt-4 text-2xl font-medium text-black md:text-3xl`}
        >
          Recebemos sua solicitação
        </h3>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-black/55">
          Nossa equipe vai revisar os pontos indicados e retornar em breve
          pelo WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <img
          src="/images/goku-bw.png"
          alt="Goku"
          className="absolute bottom-full right-6 z-20 h-24 w-24 object-contain sm:right-8 sm:h-28 sm:w-28"
        />
        <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem]">
        <div className="border-b border-black/10 px-6 py-7 text-center sm:px-10">
          <p className="mx-auto mb-5 inline-block rounded-full border border-black/15 px-5 py-2 text-xs uppercase tracking-[0.3em] text-black/65">
            Roteiro de 7 dias
          </p>
          <h2 className={`${displayClassName} text-2xl font-medium text-black md:text-3xl`}>
            Painel Interativo · Rascunho
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-black/50">
            Selecione um dia para revisar a atração principal e os pontos de
            interesse propostos para a manhã e a tarde.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-black/10 px-6 py-5 sm:px-10 [&::-webkit-scrollbar]:hidden">
          {DAYS.map((d, index) => (
            <button
              key={d.day}
              type="button"
              onClick={() => setActiveDay(index)}
              className={`shrink-0 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                index === activeDay
                  ? "border-black bg-black text-white"
                  : "border-black/15 text-black/50 hover:border-[#2f5aa8]/50 hover:text-black"
              }`}
            >
              Dia {d.day}
            </button>
          ))}
        </div>

        <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
          <PeriodBlock
            label="Manhã"
            period={current.manha}
            displayClassName={displayClassName}
          />
          <PeriodBlock
            label="Tarde"
            period={current.tarde}
            displayClassName={displayClassName}
          />
        </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-black/10 bg-white p-8 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem] sm:p-10">
        <h3 className={`${displayClassName} text-xl font-medium text-black md:text-2xl`}>
          Está tudo certo com o roteiro?
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55">
          Sua aprovação confirma as informações principais acima e dá início à
          elaboração do painel digital completo do seu roteiro personalizado.
        </p>

        {showAdjustBox && (
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Conte rapidamente o que gostaria de ajustar"
            rows={3}
            className="mt-6 w-full resize-none rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/30 outline-none transition focus:border-[#2f5aa8]/60"
          />
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={status === "submitting"}
            onClick={() => sendResponse("aprovado")}
            className="rounded-full bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {status === "submitting" ? "Enviando..." : "Aprovar Roteiro"}
          </button>
          <button
            type="button"
            disabled={status === "submitting"}
            onClick={() =>
              showAdjustBox ? sendResponse("ajustes") : setShowAdjustBox(true)
            }
            className="rounded-full border border-black/15 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black/70 transition hover:border-black/40 disabled:opacity-50"
          >
            {showAdjustBox ? "Enviar Ajustes" : "Solicitar Ajustes"}
          </button>
        </div>

        {status === "error" && (
          <p className="mt-5 rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-600">
            Não foi possível enviar sua resposta. Tente novamente ou fale com
            a Ajisai pelo WhatsApp.
          </p>
        )}
      </div>
    </>
  );
}
