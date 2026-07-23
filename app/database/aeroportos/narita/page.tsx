import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import {
  InternalGuideHeader,
  SectionMarker,
  RecommendationRow,
  TransportOption,
  TerminalCard,
  MapCard,
  MapModal,
  PreviewCard,
  PreviewModal,
  ImmigrationArrivalGuide,
  SubStepHeading,
  IconTrain,
  IconCar,
  IconCard,
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
  title: "Banco de Conteúdo · Aeroporto de Narita (NRT)",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function NaritaGuidePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <InternalGuideHeader
        displayClassName={display.className}
        eyebrow="Anexo com Informação Detalhada - Aeroportos - Narita (NRT)"
        title="Narita International Airport - 成田国際空港"
        code="NRT"
        heroImage="/images/Narita-hero.png"
        heroAlt="Vista aérea do pátio de aeronaves e terminais do Aeroporto Internacional de Narita"
        subtitle="Aeroporto Internacional de Narita, em Chiba — a cerca de 60 km a leste do centro de Tóquio. Recebe a maior parte dos voos internacionais de longo curso com destino a Tóquio."
      />

      {/* Visão geral */}
      <section className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-10">
          <SectionMarker number={1} label="Visão Geral" />
          <p className="max-w-3xl text-base font-light leading-8 text-white/70">
            Confirme sempre o terminal na confirmação do voo — companhias e alocações
            mudam com frequência.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <TerminalCard
              nome="Terminal 1"
              tipo="Internacional — Ala Norte e Ala Sul. Voos domésticos da ANA e da Peach em área separada, acessada pelo saguão de chegadas da Ala Sul."
              companhias="Ala Sul: Star Alliance (ANA, United, Lufthansa, Air Canada, Thai, Asiana, entre outras). Ala Norte: SkyTeam (Delta, Korean Air, China Airlines, Vietnam Airlines, Garuda Indonesia, entre outras)."
            />
            <TerminalCard
              nome="Terminal 2"
              tipo="Internacional, com voos domésticos da JAL."
              companhias="Oneworld — JAL, British Airways, Finnair, Cathay Pacific, American Airlines, Qatar Airways, Malaysia Airlines, entre outras."
            />
            <TerminalCard
              nome="Terminal 3"
              tipo="Doméstico e internacional — companhias de baixo custo."
              companhias="Jetstar Japan, Spring Airlines Japan, Zipair Tokyo, Air Japan, entre outras."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MapCard href="#mapa-geral-narita" label="Mapa Geral — Terminal 1, 2 e 3" />
            <MapCard href="#mapa-terminal1" label="Planta do Terminal 1" />
          </div>

          <div className="rounded-2xl border border-[#5b9bd5]/15 bg-[#0f2340] p-6 sm:p-8">
            <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#5b9bd5]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Ajisai
            </p>
            <h3 className={`${display.className} text-xl font-medium text-white md:text-2xl`}>
              Errei o Terminal e Agora?
            </h3>

            <div className="mt-5 space-y-4 text-sm leading-7 text-white/70 md:text-base md:leading-8">
              <p>
                Diferente do Aeroporto de Guarulhos, em São Paulo, os três terminais de
                Narita <span className="text-white">não são conectados entre si</span>.
                Apenas o Terminal 2 e o Terminal 3 têm ligação terrestre — mesmo assim, o
                trajeto a pé leva cerca de 10–15 minutos.
              </p>
            </div>
            <div className="mt-5">
              <MapCard href="#mapa-passagem-t2-t3" label="Passagem entre o Terminal 2 e o Terminal 3" />
            </div>

            <div className="mt-8 space-y-4 border-t border-white/10 pt-6 text-sm leading-7 text-white/70 md:text-base md:leading-8">
              <p>
                Se você precisa se deslocar do Terminal 1 para o Terminal 2 ou 3 (ou
                vice-versa), é necessário usar o <span className="text-white">transfer interno</span> —
                essa transferência leva em média 10 minutos.
              </p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <MapCard href="#mapa-shuttle-t1-t2" label="Parada do shuttle T1 → T2 (No. 6)" />
              <MapCard href="#mapa-shuttle-t1-t3" label="Parada do shuttle T1 → T3 (No. 1)" />
            </div>
          </div>
        </div>
      </section>

      <MapModal
        id="mapa-geral-narita"
        label="Mapa Geral — Terminal 1, 2 e 3"
        src="/images/visao-geral-narita-todos-terminais.png"
        alt="Mapa geral do Aeroporto de Narita com Terminal 1, 2 e 3 e estacionamentos"
      />
      <MapModal
        id="mapa-terminal1"
        label="Planta do Terminal 1 — Ala Norte e Ala Sul"
        src="/images/T1-Overview.png"
        alt="Planta do Terminal 1 de Narita, com Ala Norte e Ala Sul"
      />
      <MapModal
        id="mapa-passagem-t2-t3"
        label="Passagem no 3º andar entre o Terminal 2 e o Terminal 3"
        src="/images/passagem-terminal-terrestre.png"
        alt="Passagem no terceiro andar entre o Terminal 2 e o Terminal 3 de Narita"
      />
      <MapModal
        id="mapa-shuttle-t1-t2"
        label="Parada do shuttle T1 → T2 (No. 6 Terminal Shuttle Bus Stop)"
        src="/images/T1-Terminal-Shuttle.png"
        alt="No. 6 Terminal Shuttle Bus Stop, com destino ao Terminal 2, no Terminal 1 de Narita"
      />
      <MapModal
        id="mapa-shuttle-t1-t3"
        label="Parada do shuttle T1 → T3 (No. 1 Terminal Shuttle Bus Stop)"
        src="/images/T3-terminal-shuttle.png"
        alt="No. 1 Terminal Shuttle Bus Stop, com destino ao Terminal 3, no Terminal 1 de Narita"
      />

      {/* Chegada e imigração */}
      <section className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={2} label="Chegada e Imigração" />
          </div>

          <ImmigrationArrivalGuide displayClassName={display.className} />

          <div className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <SubStepHeading number={4} title="O Que Devo Fazer Antes de Sair do Aeroporto?" />
            <p className="text-base font-light leading-8 text-white/70">
              O Aeroporto de Narita fica bem distante de Tóquio — em horários com
              trânsito, pode levar até 2 horas para chegar ao centro da cidade. Por
              isso, existem algumas recomendações gerais.
            </p>

            <div className="space-y-4 pt-2">
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                4.1 — Aluguel de Pocket Wi-Fi ou eSIM 5G
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                Caso ainda não tenha comprado um eSIM 5G, recomendamos que faça o
                aluguel de um wi-fi móvel ou a compra de um eSIM 5G dentro do
                aeroporto.
              </p>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 1</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Máquinas de venda de chip e guichês de pocket Wi-Fi no 1F, tanto na
                    Ala Sul quanto na Ala Norte.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 2</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Guichês de pocket Wi-Fi no lobby de embarque, no 3F. Máquinas de
                    eSIM normalmente no 2F.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 3</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Guichês de pocket Wi-Fi e máquinas de eSIM no 1F.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#5b9bd5]/15 bg-[#0f2340] p-6 sm:p-8">
                <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#5b9bd5]">
                  <IconBulb className="h-3.5 w-3.5" />
                  Recomendação Alpinea
                </p>
                <p className="text-sm leading-7 text-white/70 md:text-base md:leading-8">
                  O método mais conveniente é contratar o eSIM digitalmente em
                  aplicativos como Airalo — nós normalmente usamos a própria Airalo
                  para contratação. A vantagem de usar o pocket wi-fi é que você pode
                  conectar vários aparelhos diferentes nele; a desvantagem é que
                  precisa carregá-lo para qualquer lugar que for.
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                4.2 — Comprar IC Card (JR Suica ou Pasmo)
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                No Japão, o valor do ticket de metrô é definido pela distância — ou
                seja, você precisa definir o trajeto e comprar o valor correto a cada
                viagem. Para evitar isso, recomendamos adquirir um IC Card (cartão
                pré-pago). Existem dois operadores em Tóquio, JR Suica e Pasmo — não
                existe diferença prática entre os dois: o Suica é produzido pela JR e
                o Pasmo pela Tokyo Metro, ambas entre as maiores operadoras de trem do
                Japão.
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                O IC Card também é utilizado e aceito como forma de pagamento em
                lojas de conveniência, pequenas compras e máquinas de bebida na rua.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <PreviewCard href="#doc-suica" label="JR Suica" Icon={IconCard} />
                <PreviewCard href="#doc-pasmo" label="Pasmo" Icon={IconCard} />
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                4.3 — Câmbio
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                Caso planeje fazer uma refeição no aeroporto ou pedir um Uber,
                recomendamos retirar o valor necessário: uma refeição num restaurante
                de sushi de esteira no aeroporto custa, em média, ¥2.000–3.500 por
                pessoa; um Uber de Narita até Shinjuku custa entre ¥26.300 (tarifa
                fixa) e cerca de ¥36.000 (tarifa dinâmica), dependendo do horário.
              </p>
              <p className="text-base font-light leading-8 text-white/70">
                Ao chegar no centro de Tóquio, nossa recomendação é trocar o dinheiro
                numa casa de câmbio como a 銀座エクスチェンジ GINZA EXCHANGE (bairro de
                Ginza), ou em bancos como o Mitsubishi-UFJ, que possuem guichê de
                troca de câmbio.
              </p>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                4.4 — Restaurantes
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 1</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Kaitensushi Misaki (5F), Ramen Ichikakuya (5F), Tonkatsu Shinjuku
                    Saboten (4F) e Tsukiji Sushiiwa (4F). Para comida ocidental:
                    McDonald&apos;s, Starbucks, Shake Shack e Subway (4F).
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 2</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Tokyo Tonkotsu by Ippudo (4F), Sushi Uogashi Nihon-ichi (4F),
                    Sushi-go-round Gansozushi (4F) e Tonkatsu Inaba Wako (4F). Para
                    comida ocidental: Starbucks (4F).
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 3</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    Tatsu Sushi e Freshness Burger (comida ocidental). Vale mais a
                    pena usar a passagem do 3F e comer no Terminal 2 — tem mais
                    opções e de melhor qualidade.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-white/10 pt-6">
              <p className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
                4.5 — Farmácia
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 1</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    4F — Airport Drug e AP American Pharmacy.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm font-medium text-white">Terminal 2</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">
                    4F — Drug Box MediCosme.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PreviewModal
        id="doc-suica"
        eyebrow="IC Card"
        label="JR Suica"
        src="/images/suica-iccard-transparent.png"
        alt="Cartão JR Suica, com o mascote pinguim"
      />
      <PreviewModal
        id="doc-pasmo"
        eyebrow="IC Card"
        label="Pasmo"
        src="/images/pasmo-card.webp"
        alt="Cartão Pasmo, com ícones de trem e ônibus"
      />

      <PreviewModal
        id="doc-qr-code"
        eyebrow="Documento"
        label="QR Code de exemplo — Visit Japan Web"
        src="/images/qr-code.png"
        alt="Tela do Visit Japan Web mostrando o QR Code de exemplo para imigração e declaração aduaneira"
      />
      <PreviewModal
        id="doc-disembarkation"
        eyebrow="Documento"
        label="Disembarkation Card for Foreigner"
        src="/images/disembarkation-card.png"
        alt="Formulário Disembarkation Card for Foreigner — Cartão de Imigração para Não-Residente"
      />
      <PreviewModal
        id="doc-customs"
        eyebrow="Documento"
        label="Customs Declaration"
        src="/images/custom-declaration.png"
        alt="Formulário Customs Declaration — Declaração Aduaneira"
      />

      {/* Deslocamento */}
      <section id="deslocamento" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10">
            <SectionMarker number={3} label="Deslocamento até Tóquio" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <TransportOption
              Icon={IconTrain}
              label="Keisei Skyliner"
              value="36 min"
              tag="Mais rápido"
              highlight
              pros={[
                "Direto até Ueno/Nippori, a cada 20 min",
                "¥2.310 com tarifa promocional para estrangeiros (compra antecipada) · ¥2.780 até Tokyo Station",
              ]}
              cons={["Opera das 07:23 às 23:00 (fins de semana 07:30–23:00)"]}
            />
            <TransportOption
              Icon={IconTrain}
              label="Narita Express (N'EX)"
              value="≈ 60 min"
              pros={[
                "Direto até Tokyo/Shinjuku/Shibuya, sem baldeação",
                "Gratuito com o Japan Rail Pass",
              ]}
              cons={["¥3.140 sem JR Pass — mais caro que o Skyliner"]}
            />
            <TransportOption
              Icon={IconCar}
              label="Táxi"
              value="¥20.000+"
              pros={["Porta a porta, sem carregar bagagem"]}
              cons={["Sujeito a trânsito, 90+ min até o centro", "Custo elevado — recomendado só em casos excepcionais"]}
            />
          </div>

          <div className="mt-6 rounded-2xl border border-[#5b9bd5]/15 bg-[#0f2340] p-6 sm:p-8">
            <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#5b9bd5]">
              <IconBulb className="h-3.5 w-3.5" />
              Recomendação Ajisai
            </p>
            <div className="grid gap-3">
              <RecommendationRow
                Icon={IconDocument}
                title="Visit Japan Web antes do embarque"
                text="Preencher com antecedência garante uso do Joint Kiosk e evita perder tempo em formulários no avião ou no balcão."
              />
              <RecommendationRow
                Icon={IconCheck}
                title="Resolver tudo antes de sair do hall"
                text="IC card, câmbio e eSIM/wifi devem ser resolvidos ainda no hall de chegada — os balcões enchem no meio da tarde, quando vários voos de longo curso chegam juntos."
              />
              <RecommendationRow
                Icon={IconClock}
                title="Ônibus Limousine como alternativa"
                text="Para hotéis fora do eixo das estações de trem, o ônibus Limousine (porta a porta) costuma ser mais prático que somar trem + táxi."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Comentários gerais */}
      <section className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={4} label="Comentários Gerais" />
          </div>
          <p className="text-base font-light leading-8 text-white/60">
            Narita costuma ser a porta de entrada natural para roteiros que iniciam em
            Tóquio com voo de longo curso direto ou com uma conexão. Se o cliente tiver
            hotel com check-in tardio, considerar despachar a mala grande via takkyubin
            diretamente pela recepção, liberando o resto do primeiro dia para a primeira
            atração do roteiro.
          </p>
        </div>
      </section>
    </main>
  );
}
