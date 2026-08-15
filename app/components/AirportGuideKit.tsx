import type { ReactElement } from "react";
import Image from "next/image";

// ── Kit visual compartilhado pelas páginas do banco de conteúdo (guias de
// aeroporto, e futuramente câmbio, logística, shinkansen, parques etc.).
// Mesma linguagem visual do roteiro-exemplo (app/ajisairoteiros/page.tsx),
// mas sem dependências de marketing (CTA, depoimentos, header de venda).

export function IconPlane({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 12 22 3l-9 20-2-9-9-2z" />
    </svg>
  );
}

export function IconPlaneLanding({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 21h20" />
      <path d="M3.5 15.5 8 13l2.2-5.8a1 1 0 0 1 1.9.1L13 13l4.2 1.7a1.6 1.6 0 0 1 1 1.5v.8L13 15.7 9.6 17 6 15.9v-.9z" />
    </svg>
  );
}

export function IconPlaneTakeoff({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 21h20" />
      <path d="M6.5 17 9 12.3 3.8 10.6a1 1 0 0 1 .3-1.9l2.3.4L11 11l4.9-4.3a1.7 1.7 0 0 1 2.6 1.9L15.8 14l2.2 4.2" />
    </svg>
  );
}

export function IconTrain({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="3" width="14" height="14" rx="4" />
      <line x1="12" y1="3" x2="12" y2="11" />
      <line x1="5" y1="11" x2="19" y2="11" />
      <circle cx="9" cy="20" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="20" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconCar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 16V11l2-5h12l2 5v5" />
      <path d="M2 16h20" />
      <path d="M5 16v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2" />
      <path d="M16 16v2a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2" />
      <circle cx="7.5" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="13.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconLuggage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <line x1="4" y1="13" x2="20" y2="13" />
    </svg>
  );
}

export function IconCard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

export function IconExchange({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 7h12M14 3l4 4-4 4" />
      <path d="M18 17H6m4 4-4-4 4-4" />
    </svg>
  );
}

export function IconWifi({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3.5 9a13 13 0 0 1 17 0" />
      <path d="M6.5 12.5a8.5 8.5 0 0 1 11 0" />
      <path d="M9.7 16a4 4 0 0 1 4.6 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconDocument({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

export function IconClock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function IconBulb({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.7v.5h5.6v-.5c0-.7.3-1.3.8-1.7A6 6 0 0 0 12 3Z" />
    </svg>
  );
}

export function IconFork({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 2v7a2 2 0 0 0 4 0V2" />
      <line x1="9" y1="2" x2="9" y2="22" />
      <path d="M16 2c-1.4 0-2 2.5-2 4.5S14.6 11 16 11" />
      <line x1="16" y1="2" x2="16" y2="22" />
    </svg>
  );
}

export function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

export function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function IconMap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z" />
      <path d="M9 3v16" />
      <path d="M15 5v16" />
    </svg>
  );
}

export function IconZoom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.2" y2="16.2" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

// ── Blocos de layout ──

// Espaço reservado para um mapa que ainda precisa ser anexado ao guia.
// Usado enquanto a imagem oficial (print/foto do mapa do aeroporto) não
// é fornecida — substituir por <MapCard />/<MapModal /> assim que a imagem existir.
export function PendingMap({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-dashed border-[#DDD8CF] bg-[#FDFCF9] p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F8FAF9] text-[#24211D]/66">
        <IconMap className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-medium text-[#24211D]/88">{label}</p>
        <p className="mt-1 text-xs text-[#24211D]/62">Mapa pendente — anexar imagem</p>
      </div>
    </div>
  );
}

// Cartão colapsado de preview — mesmo padrão visual do MapCard usado no
// roteiro-exemplo. Abre o PreviewModal correspondente ao ser clicado, via
// âncora + :target (sem JS). Serve tanto para mapas quanto para documentos
// (formulários, QR codes etc.) — troque o Icon conforme o conteúdo.
export function PreviewCard({
  href,
  label,
  Icon = IconMap,
}: {
  href: string;
  label: string;
  Icon?: (p: { className?: string }) => ReactElement;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-[#173B45]/30 bg-[#173B45]/[0.08] p-5 transition hover:border-[#173B45]/60"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#173B45]/20 text-[#173B45]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-medium text-[#24211D]">{label}</p>
        <p className="text-xs text-[#173B45]/70">Toque para ampliar</p>
      </div>
      <span className="ml-auto text-lg text-[#173B45]/70 transition group-hover:translate-x-0.5">→</span>
    </a>
  );
}

// Modal em tela cheia com a imagem ampliada — acionado pelo PreviewCard
// acima. Deve ser renderizado uma vez por página (ex.: perto do fechamento
// do <main>), com o mesmo `id` usado no `href` do PreviewCard correspondente.
export function PreviewModal({
  id,
  eyebrow = "Mapa",
  label,
  src,
  alt,
}: {
  id: string;
  eyebrow?: string;
  label: string;
  src: string;
  alt: string;
}) {
  return (
    <section
      id={id}
      className="fixed inset-0 z-[90] hidden overflow-y-auto bg-black/95 px-4 py-8 target:block md:px-8"
    >
      <a
        href="#_"
        aria-label="Fechar"
        className="fixed right-4 top-4 z-[110] flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white text-4xl leading-none text-black shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition hover:bg-white/90 md:right-8 md:top-8 md:h-16 md:w-16 md:text-5xl"
      >
        ×
      </a>
      <div className="mx-auto max-w-5xl pt-12 pb-12">
        <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/35">{eyebrow}</p>
        <h3 className="text-2xl font-medium text-white md:text-3xl">{label}</h3>

        <input type="checkbox" id={`${id}-zoom`} className="peer hidden" />
        <label
          htmlFor={`${id}-zoom`}
          className="relative mt-8 block max-h-[70vh] cursor-zoom-in overflow-auto rounded-2xl border border-white/10 bg-white/[0.03] peer-checked:max-h-none peer-checked:cursor-zoom-out peer-checked:[&_img]:h-auto peer-checked:[&_img]:w-auto peer-checked:[&_img]:max-w-none peer-checked:[&_img]:min-w-[1800px]"
        >
          <span className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-xs uppercase tracking-[0.15em] text-white">
            <IconZoom className="h-3.5 w-3.5" />
            Toque para ampliar
          </span>
          <Image src={src} alt={alt} width={1600} height={1200} className="h-auto w-full object-contain" />
        </label>
      </div>
    </section>
  );
}

// Atalhos com os nomes antigos, para manter compatibilidade com páginas
// que já usam MapCard/MapModal especificamente para mapas.
export function MapCard({ href, label }: { href: string; label: string }) {
  return <PreviewCard href={href} label={label} Icon={IconMap} />;
}

export function MapModal(props: { id: string; label: string; src: string; alt: string }) {
  return <PreviewModal eyebrow="Mapa" {...props} />;
}

// Exibe a imagem diretamente no corpo da página (sem o link colapsado
// "toque para ampliar"), com legenda opcional abaixo. Útil para imagens
// pequenas/objetos (cartões, documentos) que ganham em ser vistos direto,
// em vez de escondidos atrás de um modal.
export function ImageCard({
  src,
  alt,
  label,
  sublabel,
  fit = "contain",
  aspect = "aspect-[4/3]",
  zoomHref,
  className = "",
}: {
  src: string;
  alt: string;
  label?: string;
  sublabel?: string;
  fit?: "contain" | "cover";
  aspect?: string;
  zoomHref?: string;
  className?: string;
}) {
  const imageBox = (
    <div className={`relative w-full ${aspect}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className={fit === "cover" ? "object-cover" : "object-contain p-6"}
      />
      {zoomHref && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white">
            <IconZoom className="h-4 w-4" />
          </span>
        </span>
      )}
    </div>
  );

  return (
    <div className={`overflow-hidden rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] ${className}`}>
      {zoomHref ? (
        <a href={zoomHref} className="group block cursor-zoom-in">
          {imageBox}
        </a>
      ) : (
        imageBox
      )}
      {label && (
        <div className="border-t border-[#DDD8CF] px-4 py-3 text-center">
          <p className="text-sm font-medium text-[#24211D]">{label}</p>
          {sublabel && <p className="mt-0.5 text-xs text-[#24211D]/70">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}

// Mostra a imagem "solta" (sem moldura de card), com legenda pequena
// abaixo — para objetos que já têm bordas/design próprios (ex.: IC cards).
export function CaptionedImage({
  src,
  alt,
  caption,
  className = "",
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`}>
      <div className="relative mx-auto h-44 w-full max-w-[300px] sm:h-52">
        <Image src={src} alt={alt} fill sizes="300px" className="object-contain" />
      </div>
      {caption && (
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[#24211D]/66">{caption}</p>
      )}
    </div>
  );
}

// Cabeçalho numerado para passos dentro de uma seção (ex.: "1. Documentos
// de Imigração"). Menor e mais discreto que o SectionMarker, usado para
// organizar sub-etapas de um fluxo.
export function SubStepHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#173B45]/40 text-xs font-medium text-[#173B45]">
        {number}
      </span>
      <p className="text-sm font-medium uppercase tracking-[0.15em] text-[#24211D]">{title}</p>
    </div>
  );
}

// Conteúdo genérico "Meu avião pousou, o que devo fazer?" — igual para
// qualquer aeroporto do Japão (documentos de imigração, entrevista,
// retirada de bagagem). Os PreviewModal dos documentos/QR code/fotos devem
// ser renderizados uma vez por página, com os ids: doc-qr-code,
// doc-disembarkation, doc-customs, foto-kiosk-imigracao, foto-arrivals-placa.
export function ImmigrationArrivalGuide({ displayClassName }: { displayClassName: string }) {
  return (
    <div className="space-y-10">
      <h3 className={`${displayClassName} text-2xl font-medium text-[#24211D] md:text-3xl`}>
        Meu Avião Pousou, o Que Devo Fazer?
      </h3>

      <div className="space-y-4">
        <p className="text-base font-light leading-8 text-[#24211D]/88">
          Ao pousar, siga as placas <span className="text-[#24211D]">Arrivals (到着)</span>{" "}
          até os guichês de imigração.
        </p>
        <a
          href="#foto-arrivals-placa"
          className="group relative mx-auto block aspect-[16/9] w-full max-w-xs cursor-zoom-in overflow-hidden rounded-2xl"
        >
          <Image
            src="/images/visao-nova-placa-arrivals.png"
            alt="Placa de sinalização do aeroporto indicando Arrivals (到着), em japonês, inglês, coreano e chinês"
            fill
            className="object-contain"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white">
              <IconZoom className="h-4 w-4" />
            </span>
          </span>
        </a>
      </div>

      <div className="space-y-5">
        <SubStepHeading number={1} title="Documentos de Imigração" />
        <p className="text-base font-light leading-8 text-[#24211D]/88">
          Todos os não-residentes devem apresentar os documentos de imigração —
          existem duas opções.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#173B45]">Opção A</p>
            <p className="text-sm font-medium text-[#24211D] md:text-base">Apresentar Digitalmente</p>
            <p className="mt-3 text-sm leading-6 text-[#24211D]/80">
              Preencha online a declaração e apresente o QR Code gerado no Visit Japan
              Web (
              <a
                href="https://www.vjw.digital.go.jp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#173B45] underline underline-offset-2"
              >
                vjw.digital.go.jp
              </a>
              ).
            </p>
            <div className="mt-4">
              <PreviewCard href="#doc-qr-code" label="Ver QR Code de exemplo" Icon={IconDocument} />
            </div>
            <div className="mt-3">
              <ImageCard
                src="/images/kiosk-imigracao-qr-code.jpg"
                alt="Quiosque de leitura do QR Code do Visit Japan Web para imigração e alfândega"
                sublabel="Quiosque de leitura do QR Code"
                fit="cover"
                aspect="aspect-[4/5]"
                zoomHref="#foto-kiosk-imigracao"
              />
            </div>

            <div className="mt-5 space-y-3 border-t border-[#DDD8CF] pt-5">
              <p className="text-sm font-medium text-[#24211D]">
                Vá até os quiosques Visit Japan Web
              </p>
              <p className="text-sm leading-6 text-[#24211D]/80">
                Existem diversos totens antes da fila da imigração. No quiosque:
              </p>
              <div className="space-y-3 rounded-xl border border-[#DDD8CF] bg-[#F8FAF9] p-4 text-sm leading-6 text-[#24211D]/80">
                <p>
                  <span className="font-medium text-[#24211D]">a) Selecione o idioma</span> — pode
                  escolher português.
                </p>
                <p>
                  <span className="font-medium text-[#24211D]">b) Escaneie o QR Code</span> — abra o
                  QR Code no celular e escaneie na máquina.
                </p>
                <p>
                  <span className="font-medium text-[#24211D]">c) Escaneie o passaporte</span> —
                  coloque o passaporte no leitor indicado; a máquina lê automaticamente.
                </p>
                <p>
                  <span className="font-medium text-[#24211D]">d) Confirme as informações</span> — na
                  tela aparecerão nome, nacionalidade e número do passaporte; basta confirmar.
                </p>
                <p>
                  <span className="font-medium text-[#24211D]">e) Biometria no quiosque</span> (quando
                  solicitado) — em alguns aeroportos ou períodos, o quiosque já pede uma
                  fotografia e as digitais; em outros casos, isso acontece diretamente no
                  balcão da imigração.
                </p>
              </div>
              <p className="text-sm leading-6 text-[#24211D]/80">
                <span className="font-medium text-[#24211D]">Receba o comprovante</span> — o
                quiosque imprime um pequeno comprovante. Leve-o junto com o passaporte.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
            <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#173B45]">Opção B</p>
            <p className="text-sm font-medium text-[#24211D] md:text-base">Apresentar Manualmente</p>
            <p className="mt-3 text-sm leading-6 text-[#24211D]/80">
              Durante o voo, as companhias aéreas costumam distribuir os formulários
              antes do pouso — ou eles podem ser retirados em balcões espalhados pela
              área de imigração. Dois documentos devem ser preenchidos, frente e verso:
            </p>
            <div className="mt-4 space-y-6">
              <div>
                <ImageCard
                  src="/images/disembarkation-card.png"
                  alt="Formulário Disembarkation Card for Foreigner — Cartão de Imigração para Não-Residente"
                  fit="cover"
                  aspect="aspect-[4/3]"
                  zoomHref="#doc-disembarkation"
                />
                <p className="mt-3 text-center text-sm font-medium text-[#24211D]">
                  Disembarkation Card for Foreigner
                </p>
                <p className="text-center text-xs text-[#24211D]/70">
                  Cartão de imigração — dados pessoais e de estadia
                </p>
              </div>
              <div>
                <ImageCard
                  src="/images/custom-declaration.png"
                  alt="Formulário Customs Declaration — Declaração Aduaneira"
                  fit="cover"
                  aspect="aspect-[4/3]"
                  zoomHref="#doc-customs"
                />
                <p className="mt-3 text-center text-sm font-medium text-[#24211D]">
                  Customs Declaration
                </p>
                <p className="text-center text-xs text-[#24211D]/70">
                  Declaração aduaneira — itens trazidos e valores
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-[#DDD8CF] pt-8">
        <SubStepHeading number={2} title="Entrevista de Imigração" />
        <p className="text-base font-light leading-8 text-[#24211D]/88">
          Com o comprovante do quiosque em mãos — ou os dois documentos preenchidos
          manualmente — entre na fila da imigração, destinada aos visitantes
          estrangeiros. As instruções nos painéis costumam estar disponíveis também
          no seu idioma nativo (português, por exemplo).
        </p>
        <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
          <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#173B45]">
            No guichê da imigração
          </p>
          <p className="text-sm leading-6 text-[#24211D]/80">
            Entregue o passaporte e o comprovante emitido pelo quiosque (ou os
            documentos preenchidos manualmente). O oficial normalmente:
          </p>
          <div className="mt-3 space-y-1.5 text-sm leading-6 text-[#24211D]/80">
            <p>• Verifica o passaporte</p>
            <p>• Confirma sua identidade</p>
            <p>• Coleta as digitais (se ainda não foram coletadas)</p>
            <p>• Tira uma fotografia (se ainda não foi feita)</p>
            <p>• Faz algumas perguntas simples, normalmente em inglês</p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-[#24211D]/58">
            Perguntas mais comuns
          </p>
          <div className="mt-2 space-y-1.5 text-sm leading-6 text-[#24211D]/80">
            <p>• Qual o objetivo da viagem?</p>
            <p>• Quantos dias ficará no Japão?</p>
            <p>• Onde ficará hospedado?</p>
            <p>• É sua primeira visita ao Japão?</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-[#DDD8CF] pt-8">
        <SubStepHeading number={3} title="Retirar Bagagem" />
        <p className="text-base font-light leading-8 text-[#24211D]/88">
          Procure a indicação nos painéis na área das esteiras o número da esteira
          indicado pelo número de voo e companhia aérea. Após pegar as malas, existe uma
          última verificação — nessa etapa, o oficial da alfândega normalmente pede o
          documento Customs Declaration (Manual) ou QR Code (Digital). Após a
          liberação, você chegará à área externa de desembarque, normalmente no
          Terminal 1 ou 2.
        </p>
      </div>
    </div>
  );
}

export function SectionMarker({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#173B45] text-xs font-semibold text-white">
        {number}
      </span>
      <p className="text-xs uppercase tracking-[0.35em] text-[#173B45]">{label}</p>
    </div>
  );
}

// Índice vertical clicável com as seções (1-4) e subseções da página,
// exibido logo abaixo das etiquetas Desembarque/Embarque. Cada item leva
// a um #id âncora dentro da mesma página — sem JS, apenas <a href="#...">.
export function TableOfContents({
  items,
}: {
  items: {
    Icon: (p: { className?: string }) => ReactElement;
    number: number;
    label: string;
    href: string;
    subsections?: { label: string; href: string }[];
    // Rótulo opcional de agrupamento (ex.: "Desembarque" / "Embarque").
    // Quando presente e diferente do item anterior, um cabeçalho de grupo é
    // inserido antes do item — usado para separar visualmente os dois
    // fluxos de um mesmo guia de aeroporto no índice.
    groupLabel?: string;
  }[];
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-6 md:px-10">
      <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-5 md:p-6">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#24211D]/62">Índice</p>
        <ol className="space-y-1">
          {items.map((item, idx) => {
            const showGroupHeader =
              !!item.groupLabel && item.groupLabel !== items[idx - 1]?.groupLabel;
            return (
              <li key={item.href}>
                {showGroupHeader && (
                  <p
                    className={`px-2 pb-1.5 text-[10px] font-medium uppercase tracking-[0.3em] text-[#B96432]/70 ${
                      idx > 0 ? "mt-4 border-t border-[#DDD8CF] pt-4" : ""
                    }`}
                  >
                    {item.groupLabel}
                  </p>
                )}
                <a
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[#F8FAF9]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#173B45]/15 text-[#173B45] transition group-hover:bg-[#173B45]/30">
                    <item.Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-[#24211D]/92 transition group-hover:text-[#24211D]">
                    <span className="mr-1.5 text-[#24211D]/66">{item.number}.</span>
                    {item.label}
                  </span>
                </a>
                {item.subsections && (
                  <ul className="ml-11 space-y-0.5 border-l border-[#DDD8CF] pl-4">
                    {item.subsections.map((sub) => (
                      <li key={sub.href}>
                        <a
                          href={sub.href}
                          className="block py-1 text-xs text-[#24211D]/74 transition hover:text-[#173B45]"
                        >
                          {sub.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

// Divisor de página inteira usado para marcar visualmente a transição entre
// os dois grandes fluxos de um guia de aeroporto (Desembarque → Embarque).
// Renderizar como uma seção própria, fora do <section> do conteúdo anterior.
export function FlowDivider({
  Icon,
  title,
  subtitle,
  displayClassName = "",
}: {
  Icon: (p: { className?: string }) => ReactElement;
  title: string;
  subtitle: string;
  displayClassName?: string;
}) {
  return (
    <div className="border-t border-[#B96432]/20 bg-[#F9F2ED] px-6 py-14 md:px-10 md:py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#B96432]/10 text-[#B96432]">
          <Icon className="h-7 w-7" />
        </span>
        <p className="text-xs uppercase tracking-[0.4em] text-[#B96432]/70">A partir daqui</p>
        <h2 className={`${displayClassName} text-3xl font-medium text-[#24211D] md:text-5xl`}>
          {title}
        </h2>
        <p className="max-w-xl text-base font-light leading-8 text-[#24211D]/80">{subtitle}</p>
      </div>
    </div>
  );
}

export function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-[#DDD8CF] pt-8">
      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#24211D]/58">{title}</p>
      <p className="text-sm leading-7 text-[#24211D]/85 md:text-base md:leading-8">{text}</p>
    </div>
  );
}

export function RecommendationRow({
  Icon,
  title,
  text,
}: {
  Icon: (p: { className?: string }) => ReactElement;
  title: string;
  text: string;
}) {
  return (
    <div className="grid grid-cols-[34px_1fr] gap-3 rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#173B45]/12 text-[#173B45]">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#24211D]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#24211D]/78">{text}</p>
      </div>
    </div>
  );
}

// Card de opção de deslocamento — mesmo padrão dos cards Metrô/Carro/Saída
// usados na seção Tokyo Skytree do roteiro-exemplo.
export function TransportOption({
  Icon,
  label,
  value,
  tag,
  highlight,
  pros = [],
  cons = [],
}: {
  Icon: (p: { className?: string }) => ReactElement;
  label: string;
  value: string;
  tag?: string;
  highlight?: boolean;
  pros?: string[];
  cons?: string[];
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${
        highlight
          ? "border-2 border-[#173B45] bg-[#F8FAF9]"
          : "border border-[#DDD8CF] bg-[#F8FAF9]"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8FAF9] text-[#24211D]/88">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#24211D]/58">{label}</p>
          <p className="text-2xl text-[#24211D]">{value}</p>
        </div>
      </div>
      {tag && (
        <p className="mt-3 inline-block rounded-full border border-[#173B45]/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#173B45]">
          {tag}
        </p>
      )}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="mt-4 space-y-2 text-xs leading-5 text-[#24211D]/78">
          {pros.map((p) => (
            <p key={p}>+ {p}</p>
          ))}
          {cons.map((c) => (
            <p key={c}>− {c}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export function IconStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.6l-5.9 3 1.3-6.6-4.9-4.6 6.6-.8L12 2.5z" />
    </svg>
  );
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <IconStar
          key={i}
          className={`h-4 w-4 ${i < value ? "text-[#B69463]" : "text-[#24211D]/25"}`}
        />
      ))}
    </div>
  );
}

// Tabela-resumo rápida acima das opções de transporte detalhadas — uma
// linha por opção, com nota (1-5 estrelas) para Tempo e Custo e uma
// recomendação curta.
export function TransportSummaryTable({
  rows,
}: {
  rows: { label: string; tempo: number; custo: number; recomendacao: string }[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#DDD8CF]">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#173B45]/40">
            <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.15em] text-[#24211D]">Opção</th>
            <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.15em] text-[#24211D]">Tempo</th>
            <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.15em] text-[#24211D]">Custo</th>
            <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.15em] text-[#24211D]">
              Nossa recomendação
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.label} className={i > 0 ? "border-t border-[#DDD8CF]" : ""}>
              <td className="px-5 py-4 font-medium text-[#24211D]">{r.label}</td>
              <td className="px-5 py-4">
                <StarRating value={r.tempo} />
              </td>
              <td className="px-5 py-4">
                <StarRating value={r.custo} />
              </td>
              <td className="px-5 py-4 text-[#24211D]/88">{r.recomendacao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TerminalCard({
  nome,
  tipo,
  companhias,
  aliancas,
}: {
  nome: string;
  tipo: string;
  companhias?: string;
  aliancas?: { logo?: string; logoAlt?: string; texto: string }[];
}) {
  return (
    <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
      <p className="text-base font-medium text-[#24211D] md:text-lg">{nome}</p>
      <div className="mt-5 space-y-4 border-t border-[#DDD8CF] pt-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#24211D]/58">Tipo</p>
          <p className="mt-1.5 text-sm leading-6 text-[#24211D]/88">{tipo}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#24211D]/58">Companhias aéreas</p>
          {aliancas ? (
            <div className="mt-3 space-y-4">
              {aliancas.map((a, i) => (
                <div key={i}>
                  {a.logo && (
                    <div className="relative mx-auto mb-2 h-14 w-36">
                      <Image src={a.logo} alt={a.logoAlt ?? "Logo da aliança aérea"} fill className="object-contain" />
                    </div>
                  )}
                  <p className="text-sm leading-6 text-[#24211D]/88">{a.texto}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1.5 text-sm leading-6 text-[#24211D]/88">{companhias}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function RestaurantMini({
  name,
  detail,
  location,
}: {
  name: string;
  detail: string;
  location: string;
}) {
  return (
    <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-5">
      <p className="text-sm font-medium text-[#24211D] md:text-base">{name}</p>
      <p className="mt-1 text-xs leading-5 text-[#d9a66d] md:text-sm">{detail}</p>
      <p className="mt-3 border-t border-[#DDD8CF] pt-3 text-[11px] leading-5 text-[#24211D]/70 md:text-xs">
        📍 {location}
      </p>
    </div>
  );
}

// Card compacto para exibir um par label/valor com ícone — usado para
// "Custo" e "Tempo de deslocamento" nas opções de transporte.
export function StatCard({
  Icon,
  label,
  value,
  detail,
  variant = "default",
}: {
  Icon: (p: { className?: string }) => ReactElement;
  label: string;
  value: string;
  detail?: string;
  variant?: "default" | "highlight";
}) {
  if (variant === "highlight") {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-5 text-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#173B45]/12 text-[#173B45]">
          <Icon className="h-4 w-4" />
        </span>
        <p className="text-xs uppercase tracking-[0.25em] text-[#24211D]/62">{label}</p>
        <p className="text-xl font-medium uppercase text-[#24211D] md:text-2xl">{value}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-5 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#173B45]/12 text-[#173B45]">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-[11px] uppercase tracking-[0.25em] text-[#24211D]/58">{label}</p>
      <p className="text-xl font-medium text-[#24211D] md:text-2xl">{value}</p>
      {detail && <p className="text-xs leading-5 text-[#24211D]/70">{detail}</p>}
    </div>
  );
}

export function ActionItem({
  Icon,
  title,
  text,
}: {
  Icon: (p: { className?: string }) => ReactElement;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-[#DDD8CF] bg-[#F8FAF9] p-6">
      <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#173B45]/12 text-[#173B45]">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm font-medium text-[#24211D] md:text-base">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[#24211D]/78">{text}</p>
    </div>
  );
}

// Selo fixo indicando que a página é uma entrada do banco de conteúdo
// interno — não faz parte do que é entregue ao cliente e não deve ser
// referenciada em links públicos do site.
export function InternalGuideHeader({
  eyebrow,
  title,
  subtitle,
  code,
  displayClassName = "",
  heroImage,
  heroAlt,
  internal = true,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  code?: string;
  displayClassName?: string;
  heroImage?: string;
  heroAlt?: string;
  // false quando este conteúdo está embutido no painel do cliente — nesse
  // caso o link "Banco de conteúdo" e o selo "Uso interno" não fazem
  // sentido pro cliente e são ocultados.
  internal?: boolean;
}) {
  return (
    <header className="bg-[#FDFCF9]">
      {internal && (
        <div className="mx-auto flex max-w-5xl items-center justify-between border-b border-[#DDD8CF] px-6 py-5 md:px-10">
          <a
            href="/database/aeroportos"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#24211D]/60 transition hover:text-[#24211D]/85"
          >
            <IconArrowLeft className="h-3.5 w-3.5" />
            Banco de conteúdo
          </a>
          <span className="rounded-full border border-[#DDD8CF] bg-[#F8FAF9] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#24211D]/55">
            Uso interno · não indexado
          </span>
        </div>
      )}

      {heroImage ? (
        <div className="relative h-[280px] min-h-[280px] w-full overflow-hidden md:h-[420px] md:min-h-[420px]">
          <Image
            src={heroImage}
            alt={heroAlt ?? title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-8 md:px-10 md:pb-12">
            <div className="mx-auto max-w-5xl">
              <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/50">{eyebrow}</p>
              <div className="flex flex-wrap items-end gap-4">
                <h1 className={`${displayClassName} text-3xl font-medium leading-tight text-white md:text-5xl`}>
                  {title}
                </h1>
                {code && (
                  <span className="mb-1 rounded-full border border-[#5b9bd5]/40 bg-[#5b9bd5]/15 px-3 py-1 text-sm font-medium text-[#8fc0e8]">
                    {code}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-5xl px-6 pb-12 pt-8 md:px-10 md:pb-16">
        {!heroImage && (
          <>
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-[#24211D]/66">{eyebrow}</p>
            <div className="mb-5 flex flex-wrap items-end gap-4">
              <h1 className={`${displayClassName} text-4xl font-medium leading-tight text-[#24211D] md:text-6xl`}>
                {title}
              </h1>
              {code && (
                <span className="mb-1 rounded-full border border-[#173B45]/30 bg-[#173B45]/10 px-3 py-1 text-sm font-medium text-[#173B45]">
                  {code}
                </span>
              )}
            </div>
          </>
        )}
        <p className="max-w-2xl text-base font-light leading-8 text-[#24211D]/78">{subtitle}</p>
      </div>
    </header>
  );
}

// Etiqueta com ícone usada para marcar se um trecho do guia se refere ao
// fluxo de Desembarque (chegada) ou Embarque (saída) do aeroporto.
export function FlowTag({
  Icon,
  label,
  subtitle,
}: {
  Icon: (p: { className?: string }) => ReactElement;
  label: string;
  subtitle?: string;
}) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-[#B96432]/25 bg-[#F9F2ED] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#B96432]/50 hover:bg-[#F3E4D8] hover:shadow-[0_8px_30px_rgba(185,100,50,0.15)]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#B96432]/12 text-[#B96432] transition duration-300 group-hover:scale-110 group-hover:bg-[#B96432]/22">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-medium text-[#24211D]">{label}</p>
        {subtitle && <p className="text-xs text-[#B96432]/70">{subtitle}</p>}
      </div>
    </div>
  );
}
