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
  IconCar,
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
  title: "Banco de Conteúdo · Aeroporto de Haneda (HND)",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function HanedaGuidePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <InternalGuideHeader
        displayClassName={display.className}
        eyebrow="Guia de Aeroportos · Chegada"
        title="Haneda"
        code="HND"
        subtitle="Aeroporto Internacional de Haneda — a cerca de 30 minutos do centro de Tóquio. O terminal internacional é o T3, conectado ao Haneda Airport Garden."
      />

      {/* Visão geral */}
      <section className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl space-y-9 text-base font-light leading-8 text-white/70">
          <SectionMarker number={1} label="Visão Geral" />
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Terminal internacional</p>
              <p className="text-white">T3</p>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Distância ao centro</p>
              <p className="text-white">≈ 30 min</p>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Conectado a</p>
              <p className="text-white">Haneda Airport Garden</p>
            </div>
          </div>
          <p>
            Por estar mais perto do centro, Haneda costuma ser a opção mais prática para
            chegadas noturnas ou para roteiros com pouco tempo de deslocamento até o
            hotel no primeiro dia. Uma passarela liga o hall de chegada do T3 diretamente
            ao Haneda Airport Garden, com lojas, restaurantes e hotéis.
          </p>
        </div>
      </section>

      {/* Chegada e imigração */}
      <section className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl space-y-8 text-base font-light leading-8 text-white/70">
          <SectionMarker number={2} label="Chegada e Imigração" />
          <InfoBlock
            title="Visit Japan Web"
            text="Assim como em Narita e Kansai, Haneda conta com o Joint Kiosk desde 2026 — leitura do QR code do Visit Japan Web e do passaporte em uma única etapa, com economia de 20–30 minutos na imigração."
          />
          <InfoBlock
            title="Saída do hall de chegada"
            text="Ao sair do hall de chegada (2º andar) do T3, o monotrilho fica à esquerda e o acesso ao Keikyu fica à direita."
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
              title="IC Card (Suica/Pasmo)"
              text="Compre assim que sair da alfândega — máquinas e balcões no hall internacional. Carregue ¥3.000–5.000; funciona tanto no Keikyu quanto no monotrilho e no resto da viagem."
            />
            <ActionItem
              Icon={IconExchange}
              title="Câmbio"
              text="Balcões de câmbio no hall de chegada internacional do T3."
            />
            <ActionItem
              Icon={IconWifi}
              title="eSIM / Pocket WiFi"
              text="Balcão JAL ABC no Salão de Chegada da Ala Sul (1F), das 06:30 até 1h após o último voo internacional do dia. Global WiFi tem balcão no 2º andar do hall de chegada, perto do acesso ao Keikyu, com caixa de devolução noturna (23:45–06:30)."
            />
            <ActionItem
              Icon={IconLuggage}
              title="Despacho de bagagem (Takkyubin)"
              text="Balcões Yamato/JAL ABC no hall de chegada, mesmos valores de referência de Narita para a região de Tóquio (Kanto) — entrega geralmente no dia seguinte."
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
              name="Setagaya (Edo Koji)"
              detail="Ramen — caldo de peixe seco e ossos de porco. Aberto 24h"
              location="T3 · 4º andar"
            />
            <RestaurantMini
              name="Dining 24 · Wa-Cafeteria"
              detail="Culinária japonesa variada, boa opção com crianças"
              location="T3 · 4º andar"
            />
            <RestaurantMini
              name="Onigiri Konga"
              detail="Onigiris — opção rápida"
              location="T3 · 4º andar"
            />
            <RestaurantMini
              name="Honolu Premier Air"
              detail="Opções veganas — frango e unagi vegetais"
              location="T3 · 4º andar, antes da segurança"
            />
          </div>
          <p className="mt-6 text-sm leading-6 text-white/45">
            Mais opções no Haneda Airport Garden, acessível por passarela direta a partir
            do hall de chegada do T3.
          </p>
        </div>
      </section>

      {/* Deslocamento */}
      <section id="deslocamento" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <SectionMarker number={5} label="Deslocamento até Tóquio" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <TransportOption
              Icon={IconTrain}
              label="Keikyu Line"
              value="≈ 30 min"
              tag="Mais barato"
              highlight
              pros={["¥310 até Shinagawa (13 min) · ¥540 até Tokyo Station via Shinagawa"]}
              cons={["Pode exigir baldeação dependendo do destino final"]}
            />
            <TransportOption
              Icon={IconTrain}
              label="Tokyo Monorail"
              value="18 min"
              pros={["Direto até Hamamatsucho, ¥500", "Conexão fácil com a linha Yamanote"]}
            />
            <TransportOption
              Icon={IconCar}
              label="Táxi"
              value="≈ 30–40 min"
              pros={["Porta a porta — boa opção em chegadas de madrugada"]}
              cons={["Sujeito a trânsito em horário de pico"]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-[#b79ce6]/15 bg-[#120a1f] p-6 sm:p-8">
            <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#b79ce6]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Ajisai
            </p>
            <div className="grid gap-3">
              <RecommendationRow
                Icon={IconDocument}
                title="Visit Japan Web antes do embarque"
                text="Mesmo benefício do Joint Kiosk que em Narita e Kansai — vale preencher com antecedência."
              />
              <RecommendationRow
                Icon={IconCheck}
                title="Suica logo na chegada"
                text="Comprar o IC card ainda no hall evita ter que parar de novo já dentro da estação."
              />
              <RecommendationRow
                Icon={IconClock}
                title="Melhor opção para chegadas noturnas"
                text="Por estar mais perto do centro, Haneda reduz o tempo até o hotel em voos que chegam à noite — considerar essa vantagem ao montar o roteiro."
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
            Haneda é preferível a Narita sempre que a companhia aérea oferecer as duas
            opções, especialmente em chegadas após o fim da tarde — o ganho de ~30
            minutos a menos de deslocamento pode significar chegar ao hotel ainda a
            tempo de jantar fora no primeiro dia.
          </p>
        </div>
      </section>
    </main>
  );
}
