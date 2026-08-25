import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import {
  InternalGuideHeader,
  SectionMarker,
  TableOfContents,
  SubStepHeading,
  StatCard,
  TrainTypeCard,
  WarningBox,
  DarkTipBox,
  ActionItem,
  IconBulb,
  IconClock,
  IconCard,
  IconExchange,
  IconMap,
  IconTrain,
  IconRoute,
  IconDocument,
  IconCheck,
} from "../../components/AirportGuideKit";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Banco de Conteúdo · Metrô e Trens no Japão",
  description: "Conteúdo interno Ajisai — não indexado.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function GuiaTremPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <InternalGuideHeader
        displayClassName={display.className}
        eyebrow="Anexo com Informação Detalhada - Transporte - Metrô e Trens"
        title="Metrô e Trens no Japão"
        subtitle="Tokyo · Kyoto · Osaka — o sistema ferroviário japonês pode parecer complicado à primeira vista, mas para o visitante ele funciona de maneira bastante simples."
      />

      {/* As 4 informações essenciais */}
      <div className="mx-auto max-w-5xl px-6 pb-4 pt-8 md:px-10">
        <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/40">
          Você precisa prestar atenção principalmente a 4 informações
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { n: 1, label: "Linha" },
            { n: 2, label: "Direção" },
            { n: 3, label: "Plataforma" },
            { n: 4, label: "Tipo de trem" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5b9bd5]/15 text-sm font-medium text-[#8fc0e8]">
                {item.n}
              </span>
              <p className="text-sm text-white/85">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <TableOfContents
        items={[
          { Icon: IconTrain, number: 1, label: "Metrô, JR e Trem: Qual a Diferença?", href: "#secao-1" },
          { Icon: IconRoute, number: 2, label: "Como Saber Qual Trem Pegar", href: "#secao-2" },
          { Icon: IconCheck, number: 3, label: "A Regra Mais Importante", href: "#secao-3" },
          {
            Icon: IconCard,
            number: 4,
            label: "IC Card, Tarifas e Ajustes",
            href: "#secao-4",
            subsections: [
              { label: "Suica, PASMO ou ICOCA", href: "#secao-4-1" },
              { label: "Saldo insuficiente", href: "#secao-4-2" },
              { label: "Comprei o bilhete errado", href: "#secao-4-3" },
            ],
          },
          {
            Icon: IconBulb,
            number: 5,
            label: "Se Algo Der Errado",
            href: "#secao-5",
            subsections: [
              { label: "Errei a estação / passei do destino", href: "#secao-5-1" },
              { label: "A catraca não abriu", href: "#secao-5-2" },
            ],
          },
          { Icon: IconMap, number: 6, label: "Transferências e Sinalização", href: "#secao-6" },
          { Icon: IconClock, number: 7, label: "Google Maps e Horários", href: "#secao-7" },
          { Icon: IconDocument, number: 8, label: "Etiqueta no Trem", href: "#secao-8" },
          { Icon: IconTrain, number: 9, label: "Último Trem e Limited Express", href: "#secao-9" },
          { Icon: IconMap, number: 10, label: "Particularidades de Kyoto, Osaka e Tokyo", href: "#secao-10" },
          { Icon: IconBulb, number: 11, label: "Se Você Se Perder", href: "#secao-11" },
        ]}
      />

      {/* 1. Metrô, JR e Trem */}
      <section id="secao-1" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-10">
          <SectionMarker number={1} label="Metrô, JR e Trem: Qual é a Diferença?" />
          <p className="max-w-3xl text-base font-light leading-8 text-white/70">
            Nas grandes cidades japonesas, diferentes empresas operam diferentes linhas.
            Para o turista, não é necessário decorar as empresas — siga a rota indicada
            no aplicativo e confira o nome da linha antes de entrar.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
              <p className="text-base font-medium text-[#24211D]">🚇 Subway / Metro</p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/75">
                Trens urbanos que circulam principalmente dentro da cidade.
              </p>
              <div className="mt-5 space-y-3 border-t border-[#DDD8CF] pt-5 text-sm leading-6 text-[#24211D]/85">
                <p><span className="font-medium text-[#24211D]">Tokyo:</span> Tokyo Metro, Toei Subway</p>
                <p><span className="font-medium text-[#24211D]">Osaka:</span> Osaka Metro</p>
                <p><span className="font-medium text-[#24211D]">Kyoto:</span> Kyoto City Subway</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
              <p className="text-base font-medium text-[#24211D]">🚆 JR</p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/75">
                A JR opera diversas linhas urbanas e interurbanas — algumas das mais
                úteis para turistas:
              </p>
              <div className="mt-5 space-y-3 border-t border-[#DDD8CF] pt-5 text-sm leading-6 text-[#24211D]/85">
                <p>
                  <span className="font-medium text-[#24211D]">Tokyo:</span> Yamanote
                  Line, Chuo Line, Keihin-Tohoku Line
                </p>
                <p>
                  <span className="font-medium text-[#24211D]">Kyoto / Osaka:</span>{" "}
                  Kyoto Line, Kobe Line, Osaka Loop Line, Nara Line
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
              <p className="text-base font-medium text-[#24211D]">🚉 Ferrovias Privadas</p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/75">
                Diversas empresas privadas também operam linhas próprias, entre elas:
              </p>
              <p className="mt-5 border-t border-[#DDD8CF] pt-5 text-sm leading-6 text-[#24211D]/85">
                Hankyu, Hanshin, Keihan, Kintetsu, Tokyu, Keio, Odakyu, Tobu, Seibu
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Tipos de Trem */}
      <section id="secao-2" className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-10">
          <SectionMarker number={2} label="Como Saber Qual Trem Pegar" />
          <p className="max-w-3xl text-base font-light leading-8 text-white/70">
            Encontrar a linha correta não significa necessariamente que qualquer trem
            naquela plataforma servirá — uma mesma linha pode possuir diferentes tipos
            de serviço.
          </p>

          <div>
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.25em] text-white/50">
              Tipos de Trem
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <TrainTypeCard
                nome="Local"
                japones="普通"
                descricao="Para em todas as estações. A opção mais simples — se sua estação estiver na linha, o Local normalmente para nela."
              />
              <TrainTypeCard
                nome="Rapid"
                japones="快速"
                descricao="Pula algumas estações menores, mais rápido que o Local. Confirme se seu destino está entre as paradas antes de embarcar."
              />
              <TrainTypeCard
                nome="Special Rapid"
                japones="新快速"
                descricao="Muito comum em Kyoto–Osaka–Kobe. Para só nas estações mais importantes — bem mais conveniente que o Local nesse trecho."
              />
              <TrainTypeCard
                nome="Express"
                japones="急行"
                descricao="Para em menos estações, comum nas ferrovias privadas. Seu destino pode estar na linha, mas o Express pode não parar nele."
              />
              <TrainTypeCard
                nome="Limited Express"
                japones="特急"
                tag="Pode ter taxa extra"
                descricao="Serviço ainda mais rápido, com poucas paradas. Pode exigir bilhete ou tarifa adicional — Suica/PASMO/ICOCA sozinho nem sempre é suficiente."
              />
              <TrainTypeCard
                nome="Shinkansen"
                japones="新幹線"
                tag="Bilhete próprio"
                destaque
                descricao="Trem-bala para viagens entre cidades (Tokyo ↔ Kyoto ↔ Osaka). Possui sistema próprio de bilhetes — não deve ser tratado como um metrô comum."
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#173B45]">Exemplo</p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/85">
                Kyoto → Osaka: um <span className="font-medium text-[#24211D]">Special
                Rapid</span> normalmente é muito mais conveniente que um Local.
              </p>
            </div>
            <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[#173B45]">Exemplos de Shinkansen</p>
              <p className="mt-2 text-sm leading-6 text-[#24211D]/85">
                Tokyo → Kyoto · Kyoto → Osaka · Tokyo → Osaka
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Regra mais importante */}
      <section id="secao-3" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl space-y-8">
          <SectionMarker number={3} label="A Regra Mais Importante" />
          <h2 className={`${display.className} text-2xl font-medium text-white md:text-3xl`}>
            Estar na Plataforma Certa Não é Suficiente
          </h2>
          <p className="text-base font-light leading-8 text-white/70">
            Antes de entrar no trem, confira:
          </p>
          <div className="space-y-3">
            {[
              "Nome da linha",
              "Direção / destino final do trem",
              "Plataforma",
              "Tipo de serviço — Local? Rapid? Express? Limited Express?",
              "Se o trem realmente para na sua estação",
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#173B45]/40 text-xs font-medium text-white">
                  {i + 1}
                </span>
                <p className="text-sm text-white/85">{item}</p>
              </div>
            ))}
          </div>
          <DarkTipBox text="Essa última confirmação — se o trem realmente para na sua estação — evita grande parte dos erros cometidos por visitantes." />
        </div>
      </section>

      {/* 4. IC Card, tarifas e ajustes */}
      <section id="secao-4" className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={4} label="IC Card, Tarifas e Ajustes" />
          </div>

          <div className="space-y-5">
            <p id="secao-4-1" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
              4.1 — Como Usar Suica, PASMO ou ICOCA
            </p>
            <p className="text-base font-light leading-8 text-white/70">
              Para a maioria dos visitantes, um IC Card é a maneira mais simples de
              utilizar o transporte público. Os principais são o{" "}
              <span className="text-white">Suica / PASMO</span> (associados
              principalmente a Tokyo) e o{" "}
              <span className="text-white">ICOCA</span> (associado principalmente à
              região de Kyoto e Osaka) — na prática, eles são amplamente
              interoperáveis nessas cidades.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard Icon={IconCard} label="Para entrar" value="TAP → entre" detail="Aproxime o cartão ou celular do leitor da catraca" />
              <StatCard Icon={IconCard} label="Para sair" value="TAP → saia" detail="Na estação de destino — a tarifa é calculada automaticamente" />
            </div>
            <p className="text-sm leading-6 text-white/55">
              Você não precisa calcular previamente quanto custa a viagem.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
            <p id="secao-4-2" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
              4.2 — Saldo Insuficiente
            </p>
            <p className="text-base font-light leading-8 text-white/70">
              Se não houver saldo suficiente, a catraca pode impedir sua saída. Não há
              problema — procure uma máquina próxima às catracas com indicações como{" "}
              <span className="text-white">Fare Adjustment / 精算</span>, recarregue
              ou pague a diferença necessária e tente passar novamente. Também é
              possível pedir ajuda ao funcionário da estação.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
            <p id="secao-4-3" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
              4.3 — Comprei o Bilhete com o Valor Errado
            </p>
            <p className="text-base font-light leading-8 text-white/70">
              Se estiver utilizando um bilhete físico e tiver comprado uma tarifa
              menor que a necessária, você não precisa voltar para a estação de
              origem. Ao chegar ao destino:
            </p>
            <div className="space-y-3">
              {[
                "Não tente forçar a saída",
                "Procure \"Fare Adjustment / 精算\"",
                "Insira o bilhete",
                "A máquina calculará a diferença",
                "Pague o valor indicado",
                "Utilize o bilhete ajustado para sair",
              ].map((item, i) => (
                <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#173B45]/40 text-xs font-medium text-white">
                    {i + 1}
                  </span>
                  <p className="text-sm text-white/85">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-sm leading-6 text-white/55">
              Se tiver dificuldades, procure a cabine do funcionário ao lado das
              catracas.
            </p>
            <DarkTipBox
              title="E se eu tiver pago a mais?"
              text="Normalmente, pagar uma tarifa maior em um bilhete comum não gera devolução automática da diferença. Por isso, o IC Card é muito mais simples para o visitante."
            />
          </div>
        </div>
      </section>

      {/* 5. Se algo der errado */}
      <section id="secao-5" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={5} label="Se Algo Der Errado" />
          </div>

          <div className="space-y-4">
            <p id="secao-5-1" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
              5.1 — Errei a Estação ou Passei do Meu Destino
            </p>
            <p className="text-base font-light leading-8 text-white/70">
              Não saia pela catraca. Permaneça dentro da área ferroviária e procure a
              plataforma no sentido contrário — pegue o trem de volta até a estação
              correta. Se tiver qualquer problema com o bilhete ou IC Card, procure um
              funcionário.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
            <p id="secao-5-2" className="text-sm font-medium uppercase tracking-[0.15em] text-white/70">
              5.2 — A Catraca Não Abriu
            </p>
            <p className="text-base font-light leading-8 text-white/70">
              Não tente passar atrás de outra pessoa. Olhe para o visor da catraca —
              os problemas mais comuns são:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Saldo insuficiente",
                "Leitura incorreta do cartão",
                "Entrada anterior não registrada corretamente",
                "Problema com o bilhete",
                "Percurso que exige algum ajuste",
              ].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-sm text-white/80">{item}</p>
                </div>
              ))}
            </div>
            <p className="text-base font-light leading-8 text-white/70">
              Procure: <span className="text-white">Fare Adjustment / 精算</span> ou{" "}
              <span className="text-white">Station Staff / funcionário da estação</span>.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Transferências e sinalização */}
      <section id="secao-6" className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={6} label="Transferências e Sinalização" />
          </div>

          <div className="space-y-5">
            <SubStepHeading number={1} title="Transferências" />
            <p className="text-base font-light leading-8 text-white/70">
              Uma transferência pode significar apenas trocar de plataforma... ou
              caminhar vários minutos dentro de uma estação enorme. Em estações como{" "}
              <span className="text-white">Shinjuku, Tokyo, Shibuya e Umeda/Osaka</span>,
              reserve alguns minutos adicionais. Siga sempre as placas indicando{" "}
              <span className="text-white">Transfer / 乗り換え</span> e procure a cor e
              o código da próxima linha.
            </p>
          </div>

          <div className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <SubStepHeading number={2} title="Não Confie Apenas na Cor" />
            <p className="text-base font-light leading-8 text-white/70">
              As linhas japonesas possuem cores para facilitar a identificação, mas
              utilize também <span className="text-white">nome + código da linha +
              estação</span>. As estações também recebem números.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard Icon={IconRoute} label="Ginza Line" value="G" />
              <StatCard Icon={IconRoute} label="Marunouchi Line" value="M" />
              <StatCard Icon={IconRoute} label="Hibiya Line" value="H" />
            </div>
            <p className="text-sm leading-6 text-white/55">
              Por exemplo: G09 — especialmente útil para quem não consegue memorizar
              nomes japoneses.
            </p>
          </div>

          <div className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <SubStepHeading number={3} title="Preste Atenção ao Sentido" />
            <p className="text-base font-light leading-8 text-white/70">
              Depois de encontrar a linha, você ainda precisa escolher para qual lado
              viajar. As placas normalmente indicam algo como{" "}
              <span className="text-white">for Shibuya</span> ou{" "}
              <span className="text-white">for Asakusa</span> — o nome mostrado
              geralmente corresponde a uma estação importante ou ao destino daquele
              serviço.
            </p>
            <DarkTipBox text="Não escolha a plataforma apenas pelo nome da linha. Confira a direção indicada pelo aplicativo." />
          </div>
        </div>
      </section>

      {/* 7. Google Maps e horários */}
      <section id="secao-7" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={7} label="Google Maps e Horários" />
          </div>

          <h2 className={`${display.className} mb-6 text-2xl font-medium text-white md:text-3xl`}>
            Google Maps: O Que Realmente Importa
          </h2>
          <p className="mb-6 text-base font-light leading-8 text-white/70">
            Ao abrir uma rota de transporte público, procure, nessa ordem:
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/85">
            {["Linha", "Estação de embarque", "Plataforma", "Horário", "Destino/direção", "Tipo de serviço", "Nº de paradas", "Estação de desembarque"].map((item, i, arr) => (
              <span key={item} className="flex items-center gap-2">
                <span className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5">{item}</span>
                {i < arr.length - 1 && <span className="text-white/30">↓</span>}
              </span>
            ))}
          </div>
          <WarningBox
            text={'Não olhe apenas algo como "Pegue a Chuo Line." Pode haver mais de um tipo de trem circulando pela mesma linha.'}
          />

          <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
            <SubStepHeading number={2} title="O Horário Importa" />
            <p className="text-base font-light leading-8 text-white/70">
              No Japão, os horários exibidos nos aplicativos são muito úteis para
              identificar o trem correto. Se o aplicativo indicar{" "}
              <span className="text-white">14:32 — Rapid</span> e houver um{" "}
              <span className="text-white">14:29 — Local</span>, não entre
              automaticamente no primeiro trem que aparecer — pode ser outro serviço
              com outras paradas.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Etiqueta no trem */}
      <section id="secao-8" className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={8} label="Etiqueta no Trem" />
          </div>

          <div className="space-y-5">
            <SubStepHeading number={1} title="Filas na Plataforma" />
            <p className="text-base font-light leading-8 text-white/70">
              No chão da plataforma existem marcações indicando onde as portas irão
              abrir. Espere dentro das filas. Regra simples: primeiro deixe todos
              saírem, depois entre. Não bloqueie as portas.
            </p>
          </div>

          <div className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <SubStepHeading number={2} title="Dentro do Trem" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Fale baixo",
                "Coloque o celular no silencioso",
                "Evite chamadas telefônicas",
                "Não bloqueie as portas",
                "Retire mochilas grandes das costas em trens cheios",
                "Respeite os assentos prioritários",
                "Mantenha malas sob controle",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="text-[#5b9bd5]"><IconCheck className="h-4 w-4" /></span>
                  <p className="text-sm text-white/80">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
            <SubStepHeading number={3} title="Horário de Pico" />
            <p className="text-base font-light leading-8 text-white/70">
              Quando possível, evite os períodos de maior movimento nos dias úteis,
              especialmente entre <span className="text-white">07:30–09:30</span> e{" "}
              <span className="text-white">17:00–19:30</span>. Em Tokyo, algumas
              linhas podem ficar extremamente cheias.
            </p>
            <p className="text-sm leading-6 text-white/55">
              Para quem está viajando com malas, idosos ou crianças, sair um pouco
              mais tarde pode tornar a viagem muito mais confortável.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Último trem e limited express */}
      <section id="secao-9" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={9} label="Último Trem e Limited Express" />
          </div>

          <div className="space-y-4">
            <SubStepHeading number={1} title="Último Trem" />
            <p className="text-base font-light leading-8 text-white/70">
              Os sistemas de metrô e trem não funcionam 24 horas. Os últimos serviços
              geralmente acontecem perto da meia-noite, dependendo da linha e do
              trajeto. Se estiver saindo à noite, confira o horário do último trem
              antes de sair — perdê-lo pode significar precisar utilizar táxi até o
              hotel.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
            <SubStepHeading number={2} title="Cuidado com Limited Express" />
            <p className="text-base font-light leading-8 text-white/70">
              Esta é uma das situações que mais merecem atenção. Se aparecer{" "}
              <span className="text-white">LIMITED EXPRESS / 特急</span>, confirme
              antes de embarcar se aquele serviço exige{" "}
              <span className="text-white">Basic Fare + Limited Express Ticket</span>.
            </p>
            <WarningBox text="Alguns serviços possuem cobrança adicional ou reserva de assento. Se tiver dúvida, utilize o serviço indicado pelo aplicativo ou pergunte a um funcionário." />
          </div>
        </div>
      </section>

      {/* 10. Particularidades por cidade */}
      <section id="secao-10" className="border-t border-white/10 bg-white/[0.02] px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={10} label="Particularidades de Kyoto, Osaka e Tokyo" />
          </div>

          <div className="space-y-5">
            <SubStepHeading number={1} title="Kyoto Tem Uma Particularidade" />
            <p className="text-base font-light leading-8 text-white/70">
              Diferentemente de Tokyo e Osaka, nem todos os principais pontos
              turísticos de Kyoto são convenientemente atendidos pelo metrô.
              Dependendo do destino, você poderá utilizar:
            </p>
            <div className="flex flex-wrap gap-2">
              {["🚇 Subway", "🚆 JR", "🚉 Hankyu / Keihan / Kintetsu", "🚌 Ônibus", "🚕 Táxi"].map((item) => (
                <span key={item} className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-sm text-white/80">
                  {item}
                </span>
              ))}
            </div>
            <p className="text-sm leading-6 text-white/55">
              Não tente necessariamente encontrar uma estação de metrô para cada
              atração — siga o meio de transporte indicado para aquele trajeto.
            </p>
          </div>

          <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
            <SubStepHeading number={2} title='Osaka: "Osaka" e "Umeda"' />
            <p className="text-base font-light leading-8 text-white/70">
              Um detalhe que confunde muitos visitantes: JR Osaka Station e Umeda
              ficam essencialmente no mesmo grande complexo/região. Dependendo da
              empresa utilizada, o aplicativo pode mandar você para Osaka,
              Osaka-Umeda, Umeda, Higashi-Umeda ou Nishi-Umeda — são estações
              diferentes, mas conectadas ou muito próximas dentro da mesma área.
            </p>
            <DarkTipBox text="Reserve tempo adicional para fazer conexões na região de Umeda." />
          </div>

          <div className="mt-10 space-y-4 border-t border-white/10 pt-8">
            <SubStepHeading number={3} title="Tokyo: Estações Podem Ser Enormes" />
            <p className="text-base font-light leading-8 text-white/70">
              Em grandes estações, chegar à estação correta não significa que você já
              chegou ao destino. Estações como Shinjuku, Shibuya e Tokyo possuem
              muitas saídas. Procure no aplicativo ou nas placas algo como{" "}
              <span className="text-white">Exit A4</span>,{" "}
              <span className="text-white">Exit B2</span>,{" "}
              <span className="text-white">East Exit</span> ou{" "}
              <span className="text-white">West Exit</span> — escolher a saída
              correta pode economizar uma caminhada considerável.
            </p>
          </div>
        </div>
      </section>

      {/* 11. Se você se perder */}
      <section id="secao-11" className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <SectionMarker number={11} label="Se Você Se Perder" />
          </div>
          <p className="mb-6 text-base font-light leading-8 text-white/70">
            Não entre em pânico e não tente adivinhar. Faça nesta ordem:
          </p>
          <div className="space-y-3">
            {[
              "Pare e confira o aplicativo",
              "Procure o código/nome da estação",
              "Confira a linha",
              "Confira a direção",
              "Procure as placas em inglês",
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#173B45]/40 text-xs font-medium text-white">
                  {i + 1}
                </span>
                <p className="text-sm text-white/85">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <DarkTipBox
              title="Se ainda houver dúvida"
              text={'Pergunte a um funcionário da estação. Uma frase simples funciona: "Sumimasen, ___ eki?" — ou simplesmente mostre o destino no celular.'}
            />
          </div>
        </div>
      </section>

      {/* Regra de Ouro */}
      <div className="border-t border-[#B96432]/20 bg-[#F9F2ED] px-6 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#B96432]/70">
            Regra de Ouro
          </p>
          <h2 className={`${display.className} mb-8 text-3xl font-medium text-[#24211D] md:text-5xl`}>
            Para praticamente qualquer viagem de trem no Japão
          </h2>
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            {["Linha", "Direção", "Plataforma", "Tipo de trem", "Confirme se ele para no seu destino"].map((item, i, arr) => (
              <div key={item} className="w-full">
                <span className="block rounded-full border border-[#173B45]/30 bg-white px-5 py-3 text-sm font-medium uppercase tracking-[0.1em] text-[#173B45]">
                  {item}
                </span>
                {i < arr.length - 1 && <span className="mt-3 block text-[#B96432]/50">↓</span>}
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-xl text-base font-light leading-8 text-[#24211D]/75">
            Se essas cinco informações estiverem corretas, você provavelmente está
            entrando no trem certo.
          </p>
        </div>
      </div>

      {/* Resumo rápido */}
      <section className="border-t border-white/10 px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Resumo Rápido</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ActionItem Icon={IconTrain} title="Local" text="Para em todas as estações." />
            <ActionItem Icon={IconTrain} title="Rapid" text="Pula algumas estações." />
            <ActionItem Icon={IconTrain} title="Special Rapid" text="Mais rápido, comum na região Kyoto–Osaka–Kobe." />
            <ActionItem Icon={IconTrain} title="Express" text="Poucas paradas. Confira seu destino." />
            <ActionItem Icon={IconTrain} title="Limited Express" text="Poucas paradas e pode exigir tarifa adicional." />
            <ActionItem Icon={IconTrain} title="Shinkansen" text="Trem-bala para viagens de longa distância." />
            <ActionItem Icon={IconCard} title="Suica / PASMO / ICOCA" text="Encoste para entrar e sair; a tarifa comum é calculada automaticamente." />
            <ActionItem Icon={IconExchange} title="Fare Adjustment / 精算" text="Use quando precisar corrigir tarifa ou resolver saldo insuficiente." />
          </div>
          <p className="mt-10 text-center text-sm font-light leading-7 text-white/55">
            Na dúvida, não embarque até confirmar: linha + direção + tipo de trem +
            parada no destino.
          </p>
        </div>
      </section>
    </main>
  );
}
