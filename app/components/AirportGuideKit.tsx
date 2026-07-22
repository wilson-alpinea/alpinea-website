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

// ── Blocos de layout ──

// Espaço reservado para um mapa que ainda precisa ser anexado ao guia.
// Usado enquanto a imagem oficial (print/foto do mapa do aeroporto) não
// é fornecida — substituir por <MapImage /> assim que a imagem existir.
export function PendingMap({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-dashed border-white/20 bg-black/30 p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/40">
        <IconMap className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-medium text-white/70">{label}</p>
        <p className="mt-1 text-xs text-white/35">Mapa pendente — anexar imagem</p>
      </div>
    </div>
  );
}

// Mapa já anexado — mesmo padrão visual do MapCard usado no roteiro-exemplo,
// mas com a imagem inline (sem depender de um modal de preview).
export function MapImage({ src, alt, label }: { src: string; alt: string; label?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#5b9bd5]/25 bg-black">
      <Image src={src} alt={alt} width={1600} height={1200} className="h-auto w-full object-contain" />
      {label && (
        <p className="border-t border-white/10 bg-[#0f2340] px-5 py-3 text-xs leading-5 text-white/50">{label}</p>
      )}
    </div>
  );
}

export function SectionMarker({ number, label }: { number: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5b9bd5] text-xs font-semibold text-black">
        {number}
      </span>
      <p className="text-xs uppercase tracking-[0.35em] text-[#5b9bd5]">{label}</p>
    </div>
  );
}

export function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-white/10 pt-8">
      <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">{title}</p>
      <p className="text-sm leading-7 text-white/65 md:text-base md:leading-8">{text}</p>
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
    <div className="grid grid-cols-[34px_1fr] gap-3 rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5b9bd5]/12 text-[#5b9bd5]">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/55">{text}</p>
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
          ? "border-2 border-[#5b9bd5] bg-white/[0.025]"
          : "border border-white/10 bg-white/[0.025]"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/70">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">{label}</p>
          <p className="text-2xl text-white">{value}</p>
        </div>
      </div>
      {tag && (
        <p className="mt-3 inline-block rounded-full border border-[#5b9bd5]/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#5b9bd5]">
          {tag}
        </p>
      )}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="mt-4 space-y-2 text-xs leading-5 text-white/55">
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

export function TerminalCard({
  nome,
  tipo,
  companhias,
}: {
  nome: string;
  tipo: string;
  companhias: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <p className="text-base font-medium text-white md:text-lg">{nome}</p>
      <div className="mt-5 space-y-4 border-t border-white/10 pt-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Tipo</p>
          <p className="mt-1.5 text-sm leading-6 text-white/70">{tipo}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">Companhias aéreas</p>
          <p className="mt-1.5 text-sm leading-6 text-white/70">{companhias}</p>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <p className="text-sm font-medium text-white md:text-base">{name}</p>
      <p className="mt-1 text-xs leading-5 text-[#d9a66d] md:text-sm">{detail}</p>
      <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-5 text-white/45 md:text-xs">
        📍 {location}
      </p>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-6">
      <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#5b9bd5]/12 text-[#5b9bd5]">
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-sm font-medium text-white md:text-base">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
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
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  code?: string;
  displayClassName?: string;
  heroImage?: string;
  heroAlt?: string;
}) {
  return (
    <header className="border-b border-white/10 bg-black">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 md:px-10">
        <a
          href="/database/aeroportos"
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40 transition hover:text-white/70"
        >
          <IconArrowLeft className="h-3.5 w-3.5" />
          Banco de conteúdo
        </a>
        <span className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/35">
          Uso interno · não indexado
        </span>
      </div>

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
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">{eyebrow}</p>
            <div className="mb-5 flex flex-wrap items-end gap-4">
              <h1 className={`${displayClassName} text-4xl font-medium leading-tight text-white md:text-6xl`}>
                {title}
              </h1>
              {code && (
                <span className="mb-1 rounded-full border border-[#5b9bd5]/30 bg-[#5b9bd5]/10 px-3 py-1 text-sm font-medium text-[#5b9bd5]">
                  {code}
                </span>
              )}
            </div>
          </>
        )}
        <p className="max-w-2xl text-base font-light leading-8 text-white/55">{subtitle}</p>
      </div>
    </header>
  );
}
