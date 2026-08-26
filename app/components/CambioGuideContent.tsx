import {
  InternalGuideHeader,
  SectionMarker,
  TableOfContents,
  ContentCard,
  IconBulb,
  IconExchange,
  IconMap,
  IconStar,
  IconPin,
  IconDocument,
} from "./AirportGuideKit";

// Conteúdo completo do guia de Câmbio (Tokyo e Kyoto) — casas de câmbio
// recomendadas. Mesmo padrão do NaritaGuideContent/DXBGuideContent/
// OnibusGuideContent: reutilizado tanto na página interna (banco de
// conteúdo, /database/cambio) quanto embutido no painel do cliente
// (app/rf3vk8mp). Editar aqui atualiza os dois lugares.

function ExchangeCard({
  nome,
  bairro,
  local,
  endereco,
  avaliacao,
  numAvaliacoes,
  descricao,
  destaque,
  tag,
  foto,
  fotoAlt,
}: {
  nome: string;
  bairro: string;
  local?: string;
  endereco: string;
  avaliacao: string;
  numAvaliacoes: string;
  descricao: string;
  destaque?: boolean;
  tag?: string;
  foto?: string;
  fotoAlt?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${
        destaque ? "border-[#173B45]/25 bg-[#173B45]/[0.05]" : "border-[#DDD8CF] bg-[#FDFCF9]"
      }`}
    >
      {foto && (
        <div className="mb-4 h-36 w-full overflow-hidden rounded-xl">
          <img
                loading="lazy"
            src={foto}
            alt={fotoAlt ?? nome}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[#24211D]">{nome}</p>
          <p className="mt-0.5 text-sm text-[#24211D]/60">{bairro}</p>
        </div>
        {tag && (
          <span className="shrink-0 rounded-full border border-[#173B45]/25 bg-[#173B45]/[0.08] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#173B45]">
            {tag}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-sm text-[#24211D]/78">
        <IconStar className="h-3.5 w-3.5 text-[#B96432]" />
        <span className="font-semibold text-[#24211D]">{avaliacao}</span>
        <span className="text-[#24211D]/50">· {numAvaliacoes}</span>
      </div>
      {local && <p className="mt-2 text-xs uppercase tracking-[0.08em] text-[#24211D]/50">{local}</p>}
      <p className="mt-3 text-sm leading-6 text-[#24211D]/78">{descricao}</p>
      <p className="mt-3 flex items-start gap-1.5 border-t border-[#DDD8CF] pt-3 text-xs leading-5 text-[#24211D]/60">
        <IconPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>{endereco}</span>
      </p>
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

export function CambioGuideContent({
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
        eyebrow="Anexo com Informação Detalhada - Câmbio"
        title="Onde Trocar Dinheiro"
        subtitle="Casas de câmbio recomendadas em Tokyo e Kyoto — melhores avaliadas e mais convenientes para quem está de passagem."
        internal={internal}
      />

      <TableOfContents
        items={[
          { Icon: IconExchange, number: 1, label: "Tokyo — Ginza", href: "#cambio-secao-1" },
          { Icon: IconExchange, number: 2, label: "Tokyo — Shinjuku", href: "#cambio-secao-2" },
          { Icon: IconMap, number: 3, label: "Kyoto — Kyoto Station", href: "#cambio-secao-3" },
          { Icon: IconDocument, number: 4, label: "Antes de Trocar", href: "#cambio-secao-4" },
        ]}
      />

      <section id="cambio-secao-1" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={1} label="Tokyo — Ginza" />
          <div className="grid gap-4 sm:grid-cols-2">
            <ExchangeCard
              nome="Ginza Exchange"
              bairro="Ginza 8-chome"
              local="Numa rua lateral discreta de Ginza"
              endereco="Sunwood Building 1F, 8-5-18 Ginza, Chuo-ku, Tokyo 104-0061"
              avaliacao="4,7/5"
              numAvaliacoes="mais de 200 avaliações"
              tag="Recomendação principal"
              destaque
              descricao="Indicação principal para câmbio em Ginza — bem avaliada e numa localização discreta, longe do movimento das ruas principais."
              foto="/images/cambio-ginza-exchange.webp"
              fotoAlt="Fachada da Sunwood Building, em Ginza, onde fica a Ginza Exchange"
            />
            <ExchangeCard
              nome="Global Exchange Ginza"
              bairro="Ginza"
              endereco="Kinko Building 1F, 6-12-17 Ginza, Chuo-ku, Tokyo 104-0061"
              avaliacao="4,6/5"
              numAvaliacoes="175 avaliações"
              tag="Alternativa"
              descricao="Boa alternativa em Ginza caso a Ginza Exchange não seja conveniente no momento — mas a Ginza Exchange continua sendo a primeira escolha."
              foto="/images/cambio-global-exchange-ginza.webp"
              fotoAlt="Fachada da Global Exchange, em Ginza"
            />
          </div>
        </div>
      </section>

      <section
        id="cambio-secao-2"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={2} label="Tokyo — Shinjuku" />
          <div className="grid gap-4 sm:grid-cols-2">
            <ExchangeCard
              nome="Interbank / Ninja Money Exchange"
              bairro="Shinjuku"
              local="Na rua Omoide Yokocho, perto da saída oeste da estação"
              endereco="1-2-12 Nishi-Shinjuku, Shinjuku-ku, Tokyo 160-0023"
              avaliacao="4,7/5"
              numAvaliacoes="mais de 1.000 avaliações"
              tag="Excelente alternativa"
              destaque
              descricao="Especializada em câmbio e bastante conhecida por estrangeiros — uma das casas de câmbio mais avaliadas de Shinjuku."
              foto="/images/cambio-ninja-exchange-shinjuku.webp"
              fotoAlt="Fachada da Interbank / Ninja Money Exchange, em Shinjuku"
            />
            <ExchangeCard
              nome="Viewcard Currency Exchange Center"
              bairro="Shinjuku Station"
              local="Dentro da JR Shinjuku Station, junto ao New South Gate"
              endereco="5-24-55 Sendagaya, Shibuya-ku, Tokyo 151-0051 (dentro do JR EAST Travel Service Center)"
              avaliacao="4,7/5"
              numAvaliacoes="mais de 300 avaliações"
              tag="Máxima conveniência"
              descricao="Fica dentro da própria estação de Shinjuku — ótima opção quando a prioridade é não sair do caminho durante a viagem."
              foto="/images/cambio-viewcard-shinjuku.webp"
              fotoAlt="Balcão da Viewcard Currency Exchange Center, dentro da JR Shinjuku Station"
            />
          </div>
        </div>
      </section>

      <section id="cambio-secao-3" className="px-6 py-14 md:px-10 md:py-20">
        <div className="mx-auto max-w-5xl space-y-6">
          <SectionMarker number={3} label="Kyoto — Kyoto Station" />
          <div className="grid gap-4 sm:grid-cols-2">
            <ExchangeCard
              nome="Travelex Kyoto Nishiguchi"
              bairro="Kyoto Station"
              local="Dentro da Kyoto Station, no 2º andar"
              endereco="JR Kyoto Station, corredor norte-sul do 2º andar, Higashishiokojicho, Shimogyo-ku, Kyoto 600-8216"
              avaliacao="4,1/5"
              numAvaliacoes="cerca de 260 avaliações"
              tag="Recomendação principal"
              destaque
              descricao="Indicação mais simples para um cliente estrangeiro em Kyoto — listada pela própria central oficial de turismo da cidade entre as opções de câmbio ao redor da estação."
              foto="/images/cambio-travelex-kyoto.webp"
              fotoAlt="Balcão da Travelex, dentro da Kyoto Station"
            />
          </div>
        </div>
      </section>

      <section
        id="cambio-secao-4"
        className="border-t border-[#DDD8CF] bg-white px-6 py-14 md:px-10 md:py-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <SectionMarker number={4} label="Antes de Trocar" />
          </div>
          <TipBox title="Leve o passaporte">
            <p>
              Casas de câmbio no Japão normalmente pedem o passaporte no momento da troca —
              tenha-o em mãos. Vale também comparar a taxa exibida no painel da casa de câmbio
              no momento, já que ela é ajustada diariamente.
            </p>
          </TipBox>
        </div>
      </section>
    </div>
  );
}
