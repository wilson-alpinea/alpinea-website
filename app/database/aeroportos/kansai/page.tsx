import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import {
  InternalGuideHeader,
  SectionMarker,
  InfoBlock,
  RecommendationRow,
  TransportOption,
  RestaurantMini,
  ActionItem,
  IconTrain,
  IconCard,
  IconExchange,
  IconWifi,
  IconLuggage,
  IconBulb,
  IconClock,
  IconDocument,
  IconCheck,
} from "../../../components/AirportGuideKit";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Banco de Conteúdo · Aeroporto de Kansai (KIX)",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function KansaiGuidePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <InternalGuideHeader
        displayClassName={display.className}
        eyebrow="Guia de Aeroportos · Chegada"
        title="Kansai"
        code="KIX"
        subtitle="Aeroporto Internacional de Kansai, construído sobre uma ilha artificial na baía de Osaka. Porta de entrada para Osaka, Kyoto, Kobe e toda a região de Kansai."
      />

      {/* Visão geral */}
      <section className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl space-y-9 text-base font-light leading-8 text-white/70">
          <SectionMarker number={1} label="Visão Geral" />
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Terminal principal</p>
              <p className="text-white">T1</p>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Serve</p>
              <p className="text-white">Osaka · Kyoto · Kobe</p>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Trem</p>
              <p className="text-white">1F, junto às plataformas</p>
            </div>
          </div>
          <p>
            Aeroporto de uso natural para roteiros que iniciam por Osaka ou Kyoto. T1
            concentra a maior parte dos voos internacionais, com retirada de bagagem e
            alfândega no 1F.
          </p>
        </div>
      </section>

      {/* Chegada e imigração */}
      <section className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl space-y-8 text-base font-light leading-8 text-white/70">
          <SectionMarker number={2} label="Chegada e Imigração" />
          <InfoBlock
            title="Visit Japan Web"
            text="Kansai também opera o Joint Kiosk desde 2026, com leitura conjunta do QR code do Visit Japan Web e do passaporte — mesma economia de tempo relatada em Narita e Haneda."
          />
        </div>
      </section>

      {/* Bagagem e ações obrigatórias */}
      <section className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <SectionMarker number={3} label="Bagagem e Ações Antes de Sair do Aeroporto" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <ActionItem
              Icon={IconCard}
              title="IC Card (Icoca)"
              text="Equivalente regional do Suica. Compre em máquinas ou balcões no hall de chegada, no 1F."
            />
            <ActionItem
              Icon={IconExchange}
              title="Câmbio"
              text="Balcões de câmbio no hall de chegada, no 1F."
            />
            <ActionItem
              Icon={IconWifi}
              title="eSIM / Pocket WiFi"
              text="Balcão Global WiFi no hall de chegada (1F), logo após a retirada de bagagem."
            />
            <ActionItem
              Icon={IconLuggage}
              title="Despacho de bagagem (Takkyubin)"
              text="Balcões no hall de chegada. Média de ¥3.730 para malas de até 30 kg, com entrega em hotéis nas áreas centrais de Osaka e Kyoto — geralmente no dia seguinte."
            />
          </div>
        </div>
      </section>

      {/* Restaurantes */}
      <section id="restaurantes" className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <SectionMarker number={4} label="Restaurantes no Aeroporto" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <RestaurantMini
              name="Machiya Koji Dining Court / Area 24 / Gourmet Avenue"
              detail="Praças de alimentação com opções variadas e acessíveis"
              location="T1 · 2º andar"
            />
            <RestaurantMini
              name="KIX Beer"
              detail="Cervejaria com petiscos"
              location="T1 · 1F"
            />
            <RestaurantMini
              name="COCO'S Airport Dining"
              detail="Ocidental e japonês — hambúrgueres, café da manhã, sobremesas"
              location="T1 · 1F"
            />
            <RestaurantMini
              name="Ganko Sushi · 551 Horai"
              detail="Sushi e culinária de Osaka, perto do portão de embarque"
              location="T1"
            />
          </div>
        </div>
      </section>

      {/* Deslocamento */}
      <section id="deslocamento" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <SectionMarker number={5} label="Deslocamento até Osaka e Kyoto" />
          </div>

          <p className="mb-6 text-xs uppercase tracking-[0.25em] text-white/35">Para Osaka (Namba)</p>
          <div className="grid gap-4 md:grid-cols-3">
            <TransportOption
              Icon={IconTrain}
              label="Nankai Rapi:t"
              value="35–40 min"
              tag="Recomendado"
              highlight
              pros={["¥1.520 (e-ticket) / ¥1.670 (papel)"]}
              cons={["Reserva de assento obrigatória"]}
            />
            <TransportOption
              Icon={IconTrain}
              label="Nankai Airport Express"
              value="≈ 45 min"
              pros={["¥970 — sem reserva"]}
              cons={["Mais lento que o Rapi:t"]}
            />
            <TransportOption
              Icon={IconTrain}
              label="JR Kansai Rapid Service"
              value="≈ 1h15"
              pros={["Direto até Osaka Station"]}
              cons={["Trajeto mais longo"]}
            />
          </div>

          <p className="mb-6 mt-10 text-xs uppercase tracking-[0.25em] text-white/35">Para Kyoto</p>
          <div className="grid gap-4 md:grid-cols-2">
            <TransportOption
              Icon={IconTrain}
              label="JR Limited Express Haruka"
              value="80–90 min"
              tag="Recomendado"
              highlight
              pros={["Direto até Kyoto Station", "¥3.060 (sem reserva) / ¥3.590 (com reserva)"]}
            />
            <TransportOption
              Icon={IconTrain}
              label="Trens locais (rota econômica)"
              value="≈ 2h"
              pros={["¥1.230–1.600 — opção mais barata"]}
              cons={["2 ou mais baldeações"]}
            />
          </div>
          <p className="mt-6 text-sm leading-6 text-white/45">
            Para Shin-Osaka, o Haruka também é a opção mais direta: ≈ 50 min, ¥2.380.
          </p>

          <div className="mt-8 rounded-2xl border border-[#5b9bd5]/15 bg-[#0f2340] p-6 sm:p-8">
            <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#5b9bd5]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Ajisai
            </p>
            <div className="grid gap-3">
              <RecommendationRow
                Icon={IconDocument}
                title="Visit Japan Web antes do embarque"
                text="Mesma vantagem do Joint Kiosk relatada em Narita e Haneda."
              />
              <RecommendationRow
                Icon={IconCheck}
                title="Reservar o Haruka com antecedência em alta temporada"
                text="Nos horários de pico (cerejeiras, feriados), os assentos reservados do Haruka esgotam — vale reservar no Visit Japan Web ou pelo site da JR West antes da viagem."
              />
              <RecommendationRow
                Icon={IconClock}
                title="Kansai como base para Kyoto"
                text="Para roteiros que começam em Kyoto, o Haruka direto costuma valer mais a pena que combinar trem + táxi a partir de Osaka."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Comentários gerais */}
      <section className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={6} label="Comentários Gerais" />
          </div>
          <p className="text-base font-light leading-8 text-white/60">
            Kansai é o ponto natural de entrada para roteiros que começam pela região
            de Kansai (Osaka, Kyoto ou Kobe) em vez de Tóquio. Vale confirmar se o
            cliente prefere iniciar por Osaka (mais opções de trem, gastronomia) ou
            seguir direto a Kyoto via Haruka.
          </p>
        </div>
      </section>
    </main>
  );
}
