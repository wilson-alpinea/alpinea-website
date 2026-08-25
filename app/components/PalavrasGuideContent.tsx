import {
  InternalGuideHeader,
  SectionMarker,
  TableOfContents,
  ContentCard,
  IconBulb,
  IconMap,
  IconClock,
  IconCheck,
  IconFork,
  IconCard,
  IconWarning,
  IconDocument,
} from "./AirportGuideKit";

// Conteúdo completo do guia de Japonês de Sobrevivência / Palavras Comuns —
// mesmo padrão do NaritaGuideContent/TremGuideContent/CostumesGuideContent:
// reutilizado tanto na página interna (banco de conteúdo, /database/palavras)
// quanto embutido no painel do cliente (app/rf3vk8mp). Editar aqui atualiza
// os dois lugares.

function PhraseCard({
  japones,
  romaji,
  traducao,
  nota,
  destaque,
}: {
  japones: string;
  romaji: string;
  traducao: string;
  nota?: string;
  destaque?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        destaque ? "border-[#173B45]/25 bg-[#173B45]/[0.05]" : "border-[#DDD8CF] bg-[#FDFCF9]"
      }`}
    >
      <p className="text-lg font-medium text-[#24211D]">{japones}</p>
      <p className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] text-[#B96432]">
        {romaji}
      </p>
      <p className="mt-2 text-sm leading-6 text-[#24211D]/85">{traducao}</p>
      {nota && <p className="mt-2 text-xs leading-5 text-[#24211D]/60">{nota}</p>}
    </div>
  );
}

function TipBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <ContentCard variant="success" icon={IconBulb} eyebrow="Recomendação Ajisai" headline={title} size="sm">
      {children}
    </ContentCard>
  );
}

function ChecklistCard({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-start gap-3 rounded-xl border border-[#DDD8CF] bg-[#FDFCF9] px-4 py-3"
        >
          <span className="mt-0.5 text-[#173B45]">
            <IconCheck className="h-4 w-4" />
          </span>
          <p className="text-sm leading-6 text-[#24211D]/85">{item}</p>
        </div>
      ))}
    </div>
  );
}

function WordChip({ japones, romaji, traducao }: { japones: string; romaji: string; traducao: string }) {
  return (
    <div className="rounded-xl border border-[#DDD8CF] bg-white px-4 py-3">
      <p className="text-base text-[#24211D]">{japones}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.06em] text-[#B96432]">
        {romaji}
      </p>
      <p className="mt-1 text-xs leading-5 text-[#24211D]/70">{traducao}</p>
    </div>
  );
}

export function PalavrasGuideContent({
  displayClassName,
  internal = true,
}: {
  displayClassName: string;
  internal?: boolean;
}) {
  return (
    <div className="bg-[#FDFCF9] text-[#24211D]">
      <InternalGuideHeader
        displayClassName={displayClassName}
        eyebrow="Anexo com Informação Detalhada - Japonês de Sobrevivência"
        title="Palavras e Expressões Úteis"
        subtitle="Você não precisa falar japonês para viajar pelo Japão — mas algumas palavras aparecem constantemente e tornam as interações muito mais fáceis."
        internal={internal}
      />

      <TableOfContents
        items={[
          { Icon: IconBulb, number: 1, label: "As 5 Mais Importantes", href: "#palavras-secao-1" },
          { Icon: IconCheck, number: 2, label: "Para Pedir Alguma Coisa", href: "#palavras-secao-2" },
          { Icon: IconFork, number: 3, label: "Restaurantes", href: "#palavras-secao-3" },
          { Icon: IconMap, number: 4, label: "Estações e Transporte", href: "#palavras-secao-4" },
          { Icon: IconCard, number: 5, label: "Compras", href: "#palavras-secao-5" },
          { Icon: IconDocument, number: 6, label: "Hotel e Documentos", href: "#palavras-secao-6" },
          { Icon: IconBulb, number: 7, label: "Comunicação e Mal-Entendidos", href: "#palavras-secao-7" },
          { Icon: IconWarning, number: 8, label: "Placas, Avisos e Emergência", href: "#palavras-secao-8" },
          { Icon: IconClock, number: 9, label: "Números Mais Úteis", href: "#palavras-secao-9" },
          { Icon: IconCheck, number: 10, label: "10 Palavras para Memorizar", href: "#palavras-secao-10" },
          { Icon: IconBulb, number: 11, label: "Para Lembrar", href: "#palavras-secao-11" },
        ]}
      />

      <section id="palavras-secao-1" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={1} label="As 5 Mais Importantes" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Nas principais cidades há bastante sinalização em inglês, e aplicativos de tradução
            ajudam quando necessário. Ainda assim, algumas palavras aparecem o tempo todo — e
            conhecê-las torna as interações muito mais fáceis.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PhraseCard
              japones="すみません"
              romaji="Sumimasen"
              traducao="Com licença / desculpe / por favor"
              nota="Provavelmente a palavra mais útil da viagem — serve para chamar um funcionário, pedir licença, chamar o garçom, pedir ajuda ou se desculpar. Se aprender só uma palavra, é esta."
              destaque
            />
            <PhraseCard
              japones="ありがとうございます"
              romaji="Arigatou gozaimasu"
              traducao="Muito obrigado"
              nota="Forma educada de agradecer — usada o tempo todo em hotéis, restaurantes, lojas, táxis e estações."
            />
            <PhraseCard
              japones="お願いします"
              romaji="Onegaishimasu"
              traducao="Por favor"
              nota="Muito útil ao fazer um pedido — aponte para algo e diga: Kore, onegaishimasu (Este, por favor)."
            />
            <PhraseCard
              japones="はい"
              romaji="Hai"
              traducao="Sim"
            />
            <PhraseCard
              japones="いいえ"
              romaji="Iie"
              traducao="Não"
              nota="Na prática, japoneses costumam usar formas mais indiretas para negar algo — você poderá ouvir outras expressões também."
            />
          </div>
        </div>
      </section>

      <section
        id="palavras-secao-2"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={2} label="Para Pedir Alguma Coisa" />
          <div className="grid gap-4 sm:grid-cols-3">
            <PhraseCard
              japones="これ"
              romaji="Kore"
              traducao="Isto / este"
              nota="Aponte para algo e diga: Kore, onegaishimasu — funciona muito bem em restaurantes e lojas."
            />
            <PhraseCard
              japones="それ"
              romaji="Sore"
              traducao="Isso / esse"
              nota="Refere-se a algo próximo da outra pessoa."
            />
            <PhraseCard
              japones="ください"
              romaji="Kudasai"
              traducao="Por favor / me dê"
              nota="Aparece depois do objeto desejado: Mizu kudasai (Água, por favor)."
            />
          </div>
        </div>
      </section>

      <section id="palavras-secao-3" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={3} label="Restaurantes" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PhraseCard japones="水" romaji="Mizu" traducao="Água" nota="Mizu, onegaishimasu." />
            <PhraseCard japones="メニュー" romaji="Menyū" traducao="Menu" nota="Menyū, onegaishimasu." />
            <PhraseCard
              japones="おすすめ"
              romaji="Osusume"
              traducao="Recomendação"
              nota="Uma palavra excelente em restaurantes: Osusume? (O que você recomenda?)"
            />
            <PhraseCard japones="おいしい" romaji="Oishii" traducao="Delicioso / gostoso" />
            <PhraseCard
              japones="大丈夫"
              romaji="Daijoubu"
              traducao="Tudo bem / estou bem / não precisa"
              nota="Você vai ouvir essa palavra constantemente — o contexto indica o significado."
            />
            <PhraseCard
              japones="お会計お願いします"
              romaji="Okaikei onegaishimasu"
              traducao="A conta, por favor"
            />
          </div>
          <TipBox title="“Quantas pessoas?”">
            <p>
              Ao entrar em um restaurante, você provavelmente ouvirá 何名様ですか？
              (Nanmei-sama desu ka?) — não precisa memorizar a frase, basta reconhecer que
              estão perguntando o tamanho do grupo. Pode responder mostrando o número com os
              dedos, ou dizendo <strong>Hitori</strong> (uma pessoa) ou <strong>Futari desu</strong>{" "}
              (somos dois). Se tiver reserva: <strong>Yoyaku arimasu</strong> (tenho uma reserva),
              e mostre o nome ou a confirmação no celular.
            </p>
          </TipBox>
        </div>
      </section>

      <section
        id="palavras-secao-4"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={4} label="Estações e Transporte" />
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <WordChip japones="駅" romaji="Eki" traducao="Estação (ex.: Tokyo-eki)" />
            <WordChip japones="電車" romaji="Densha" traducao="Trem" />
            <WordChip japones="地下鉄" romaji="Chikatetsu" traducao="Metrô" />
            <WordChip japones="バス" romaji="Basu" traducao="Ônibus" />
            <WordChip japones="タクシー" romaji="Takushī" traducao="Táxi" />
            <WordChip japones="入口" romaji="Iriguchi" traducao="Entrada" />
            <WordChip japones="出口" romaji="Deguchi" traducao="Saída" />
            <WordChip japones="どこですか？" romaji="Doko desu ka?" traducao="Onde fica?" />
            <WordChip japones="トイレ" romaji="Toire" traducao="Banheiro" />
            <WordChip japones="ここ" romaji="Koko" traducao="Aqui" />
            <WordChip japones="あそこ" romaji="Asoko" traducao="Ali / lá" />
            <WordChip japones="右" romaji="Migi" traducao="Direita" />
            <WordChip japones="左" romaji="Hidari" traducao="Esquerda" />
            <WordChip japones="まっすぐ" romaji="Massugu" traducao="Siga reto" />
          </div>
          <TipBox title="Saídas por ponto cardeal">
            <p>
              Estações grandes têm saídas nomeadas por direção: 東口 Higashi-guchi (Leste),
              西口 Nishi-guchi (Oeste), 南口 Minami-guchi (Sul), 北口 Kita-guchi (Norte).
              Por isso <strong>Shinjuku Nishiguchi</strong> significa "Shinjuku West Exit" — vale
              reconhecer esse padrão ao seguir a sinalização até a saída certa.
            </p>
          </TipBox>
        </div>
      </section>

      <section id="palavras-secao-5" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={5} label="Compras" />
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <WordChip japones="いくらですか？" romaji="Ikura desu ka?" traducao="Quanto custa?" />
            <WordChip japones="円" romaji="En" traducao="Iene (ex.: 1,000円 = ¥1.000)" />
            <WordChip japones="カード" romaji="Kādo" traducao="Cartão" />
            <WordChip japones="現金" romaji="Genkin" traducao="Dinheiro em espécie" />
            <WordChip japones="現金のみ" romaji="Genkin nomi" traducao="Somente dinheiro" />
            <WordChip japones="袋" romaji="Fukuro" traducao="Sacola" />
          </div>
        </div>
      </section>

      <section
        id="palavras-secao-6"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={6} label="Hotel e Documentos" />
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <WordChip japones="ホテル" romaji="Hoteru" traducao="Hotel" />
            <WordChip japones="チェックイン" romaji="Chekku-in" traducao="Check-in" />
            <WordChip japones="チェックアウト" romaji="Chekku-auto" traducao="Check-out" />
            <WordChip japones="パスポート" romaji="Pasupōto" traducao="Passaporte" />
          </div>
          <p className="max-w-3xl text-sm leading-6 text-[#24211D]/70">
            Essas palavras são praticamente iguais ao inglês — fáceis de reconhecer de ouvido.
          </p>
        </div>
      </section>

      <section id="palavras-secao-7" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={7} label="Comunicação e Mal-Entendidos" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PhraseCard
              japones="わかりません"
              romaji="Wakarimasen"
              traducao="Não entendo / não sei"
              nota="Muito útil quando alguém começar a falar rapidamente em japonês."
            />
            <PhraseCard japones="わかります" romaji="Wakarimasu" traducao="Entendo" />
            <PhraseCard
              japones="英語"
              romaji="Eigo"
              traducao="Inglês"
              nota="Para perguntar: Eigo? — normalmente é suficiente para indicar “Inglês?”"
            />
            <PhraseCard
              japones="すみません、日本語がわかりません。"
              romaji="Sumimasen, nihongo ga wakarimasen"
              traducao="Desculpe, não entendo japonês"
              nota="Frase mais completa, opcional — não é necessário decorar."
            />
            <PhraseCard
              japones="大丈夫です"
              romaji="Daijoubu desu"
              traducao="Tudo bem / estou bem / não precisa"
              nota="Aparece o tempo todo — o contexto indica o significado."
            />
            <PhraseCard
              japones="ちょっと待ってください"
              romaji="Chotto matte kudasai"
              traducao="Um momento, por favor"
              nota="Versão curta: Chotto matte (Espere um pouco)."
            />
          </div>
          <TipBox title="Atenção a esta palavra: Chotto...">
            <p>
              Literalmente significa "um pouco...", mas no cotidiano japonês também é uma forma
              educada e indireta de dizer "isso será difícil..." ou simplesmente "não". Se você
              perguntar se algo é possível e receber um <strong>"Chotto..."</strong> acompanhado
              de hesitação, provavelmente significa que não será possível.
            </p>
          </TipBox>
        </div>
      </section>

      <section
        id="palavras-secao-8"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={8} label="Placas, Avisos e Emergência" />
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <WordChip japones="営業中" romaji="Eigyou-chuu" traducao="Aberto / em funcionamento" />
            <WordChip japones="休み" romaji="Yasumi" traducao="Fechado / folga" />
            <WordChip japones="売り切れ" romaji="Urikire" traducao="Esgotado" />
            <WordChip japones="立入禁止" romaji="Tachiiri kinshi" traducao="Entrada proibida" />
            <WordChip japones="禁煙" romaji="Kin'en" traducao="Proibido fumar" />
            <WordChip japones="喫煙所" romaji="Kitsuenjo" traducao="Área para fumantes" />
          </div>
          <TipBox title="Em caso de emergência">
            <p>
              助けてください (Tasukete kudasai) — "Ajude-me, por favor". 病院 (Byouin) é
              hospital, e 警察 (Keisatsu) é polícia. São palavras que vale reconhecer mesmo sem
              nunca precisar usá-las.
            </p>
          </TipBox>
        </div>
      </section>

      <section id="palavras-secao-9" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={9} label="Números Mais Úteis" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Não é necessário decorá-los para viajar, mas você os ouvirá frequentemente.
          </p>
          <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
            {[
              ["1", "Ichi"],
              ["2", "Ni"],
              ["3", "San"],
              ["4", "Yon"],
              ["5", "Go"],
              ["6", "Roku"],
              ["7", "Nana"],
              ["8", "Hachi"],
              ["9", "Kyuu"],
              ["10", "Juu"],
            ].map(([numero, romaji]) => (
              <div
                key={numero}
                className="rounded-xl border border-[#DDD8CF] bg-[#FDFCF9] px-2 py-3 text-center"
              >
                <p className="text-lg font-semibold text-[#24211D]">{numero}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.05em] text-[#B96432]">
                  {romaji}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="palavras-secao-10"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={10} label="10 Palavras para Memorizar" />
          <p className="max-w-3xl text-base font-light leading-8 text-[#24211D]/88">
            Se quiser aprender apenas o essencial, e as frases prontas que resolvem a maior
            parte das situações do dia a dia:
          </p>
          <ChecklistCard
            items={[
              "Sumimasen — Com licença / desculpe",
              "Arigatou gozaimasu — Muito obrigado",
              "Onegaishimasu — Por favor",
              "Kore — Este / isto",
              "Daijoubu — Tudo bem / não precisa",
              "Toire — Banheiro",
              "Eki — Estação",
              "Deguchi — Saída",
              "Doko — Onde",
              "Wakarimasen — Não entendo",
            ]}
          />
          <p className="mb-2 mt-8 text-sm font-semibold uppercase tracking-[0.15em] text-[#24211D]/60">
            Frases de sobrevivência
          </p>
          <ChecklistCard
            items={[
              "Sumimasen. — Com licença.",
              "Arigatou gozaimasu. — Muito obrigado.",
              "Kore, onegaishimasu. — Este, por favor.",
              "Toire, doko desu ka? — Onde fica o banheiro?",
              "Okaikei, onegaishimasu. — A conta, por favor.",
              "Futari desu. — Somos dois.",
              "Yoyaku arimasu. — Tenho uma reserva.",
              "Daijoubu desu. — Tudo bem / não precisa.",
              "Wakarimasen. — Não entendo.",
            ]}
          />
        </div>
      </section>

      <section id="palavras-secao-11" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <SectionMarker number={11} label="Para Lembrar" />
          </div>
          <TipBox title="Sumimasen + uma palavra + Onegaishimasu resolve muita coisa">
            <p>
              Você não precisa formar frases perfeitas em japonês. Por exemplo:{" "}
              <strong>"Sumimasen. Toire?"</strong> (Com licença. Banheiro?),{" "}
              <strong>"Sumimasen. Kyoto-eki?"</strong> (Com licença. Kyoto Station?), ou{" "}
              <strong>"Kore, onegaishimasu."</strong> (Este, por favor). Não se preocupe com a
              pronúncia perfeita — uma tentativa educada de usar algumas palavras em japonês,
              acompanhada de um sorriso e cordialidade, já torna a comunicação muito mais fácil.
            </p>
          </TipBox>
        </div>
      </section>
    </div>
  );
}
