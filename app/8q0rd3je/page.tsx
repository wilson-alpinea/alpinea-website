import type { Metadata } from "next";
import { bodoniModa } from "@/app/fonts/bodoni";
import { vagasAtivas } from "@/lib/empregos/vagasAtivas";
import { LinkWhatsapp } from "./LinkWhatsapp";

// VERSÃO INTERNA (Wilson, 18/nov/2026): "não pode ser rastreável, somente
// quem tem o link pode acessar". Pasta com 8 caracteres aleatórios =
// privada pelo lib/privacidade.ts (noindex/noai + 404 para robôs, fora do
// robots.txt e do sitemap). Quando for ao ar em ajisaiwork.com.br, mover
// para uma rota pública e tirar o `robots` abaixo.
//
// Nova home da Ajisai (Wilson, 18/nov/2026): "hoje o site tem informação
// demais, é difícil encontrar o que se deseja". Decisões: recriar aqui no
// alpinea-website e depois servir na raiz de ajisaiwork.com.br; remover de vez o portal (notícias, esportes, economia,
// política, clima) e os itens "em breve"; home organizada em 3 portas —
// Viagem, Documentação e Emprego.
//
// Links para os produtos são absolutos (www.alpinea.io): a página roda no
// domínio da Ajisai e as páginas de produto continuam no alpinea.io.

const display = bodoniModa;
const SITE = "https://www.alpinea.io";
const AZUL = "#1c6ea8";
const MARINHO = "#0A2540";

export const revalidate = 3600; // vagas em destaque atualizam de hora em hora

export const metadata: Metadata = {
  title: "Ajisai | Viagem, documentação e emprego no Japão",
  description:
    "Passagens, roteiros e hotéis para o Japão, visto e Certificado de Elegibilidade, e vagas em fábricas no Japão. Escritórios em São Paulo e Kobe.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
  openGraph: {
    title: "Ajisai | Viagem, documentação e emprego no Japão",
    description: "Passagens, roteiros, visto e vagas no Japão — escritórios em São Paulo e Kobe.",
    siteName: "Ajisai",
    images: [{ url: "/images/og-produtos-ajisai.jpg", width: 1200, height: 630, alt: "Ajisai" }],
    locale: "pt_BR",
    type: "website",
  },
};

// ── Ícones (traço preto, sem fundo colorido — padrão do /produtos) ──
function Icone({ d, className = "h-6 w-6" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}
const ICONE_AVIAO = "M2.5 19h19M3.8 12.6l3 1 3.4-1.6L6.4 6.3l2-.9 6.2 4.4 4.3-2a1.7 1.7 0 0 1 1.4 3.1l-12.8 5.9-4.4-3.1z";
const ICONE_DOC = "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4";
const ICONE_MALETA = "M4 8h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18";
const ICONE_SETA = "M5 12h14M13 6l6 6-6 6";

const PORTAS = [
  {
    id: "viagem",
    icone: ICONE_AVIAO,
    titulo: "Viagem",
    texto: "Passagens, roteiro, hotéis, JR Pass, seguro e tudo o que a viagem ao Japão precisa.",
  },
  {
    id: "documentacao",
    icone: ICONE_DOC,
    titulo: "Documentação",
    texto: "Visto japonês, Certificado de Elegibilidade (COE), Koseki Tohon e exportação de pet.",
  },
  {
    id: "emprego",
    icone: ICONE_MALETA,
    titulo: "Emprego",
    texto: "Vagas em fábricas no Japão com passagem paga, visto incluso e apoio até o embarque.",
  },
];

const COMECE_AQUI = [
  { titulo: "Passagem aérea", texto: "Cotação pelo WhatsApp, com as melhores rotas entre Brasil e Japão.", whatsapp: "Olá! Quero cotar uma passagem para o Japão." },
  { titulo: "Roteiro Personalizado", texto: "Seu itinerário dia a dia num painel digital, pronto para usar na viagem.", href: `${SITE}/produtos/roteiro-personalizado` },
  { titulo: "Viagem Personalizada", texto: "Viagem completa montada para você — simule o orçamento online.", href: `${SITE}/produtos/viagem-personalizada` },
  { titulo: "Hotéis", texto: "Curadoria de hotéis de acordo com o seu perfil e o seu roteiro.", href: `${SITE}/produtos/hoteis` },
];

const COMPLETE_VIAGEM = [
  { titulo: "JR Pass", href: `${SITE}/produtos/jrpass` },
  { titulo: "Seguro viagem", href: `${SITE}/produtos/seguro-viagem` },
  { titulo: "eSIM", href: `${SITE}/produtos/esim` },
  { titulo: "Câmbio", href: `${SITE}/produtos/cambio` },
  { titulo: "Transfer do aeroporto", href: `${SITE}/produtos/transfer-aeroporto` },
  { titulo: "Guia turístico", href: `${SITE}/produtos/guia-turistico` },
  { titulo: "Transporte privado", href: `${SITE}/produtos/transporte-privado` },
];

const DOCUMENTACAO = [
  { titulo: "Visto japonês", texto: "Visto para descendentes (nissei e sansei), cônjuges e dependentes.", href: `${SITE}/documentacao/visto` },
  { titulo: "Certificado de Elegibilidade", texto: "Solicitação do COE junto à imigração japonesa.", href: `${SITE}/documentacao/elegibilidade` },
  { titulo: "Koseki Tohon", texto: "Registro de família japonês — solicitação pelo WhatsApp.", whatsapp: "Olá! Quero solicitar o Koseki Tohon." },
  { titulo: "Exportação de pet", texto: "Documentação para levar seu cão ou gato do Brasil para o Japão.", href: `${SITE}/documentacao/pet` },
];

const BENEFICIOS_EMPREGO = ["Passagem paga", "Visto incluso", "Seguro viagem pago", "Apoio até o embarque"];

const PROVAS = [
  { valor: "4,8", rotulo: "no Google · 182 avaliações", href: "https://www.google.com/maps/place/AjisaiWork+Ag%C3%AAncia+de+Viagens+Jap%C3%A3o/@-23.5667413,-46.6506418,17z/data=!4m8!3m7!1s0x94ce59e1cb3e07b9:0xbab829bc13e27b39!8m2!3d-23.5667413!4d-46.6506418!9m1!1b1!16s%2Fg%2F11ry7w0mx5" },
  { valor: "0", rotulo: "reclamações no Reclame Aqui (6 meses)", href: "https://www.reclameaqui.com.br/empresa/ajisaiwork-japan-agencia-de-viagens/" },
  { valor: "2021", rotulo: "empresa ativa desde", href: "https://www.jusbrasil.com.br/nome/ajisaiwork-japan/cnpj-1wpQbLnP0FT" },
  { valor: "Cadastur", rotulo: "registro no Ministério do Turismo", href: "https://cadastur.turismo.gov.br/" },
];

const NAV = [
  { href: "#viagem", rotulo: "Viagem" },
  { href: "#documentacao", rotulo: "Documentação" },
  { href: "#emprego", rotulo: "Emprego" },
  { href: "#quem-somos", rotulo: "Quem somos" },
  { href: "#contato", rotulo: "Contato" },
];

function TituloSecao({ id, sobre, titulo, texto }: { id: string; sobre: string; titulo: string; texto?: string }) {
  return (
    <div id={id} className="scroll-mt-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: AZUL }}>
        {sobre}
      </p>
      <h2 className={`${display.className} mt-2 text-3xl font-normal leading-tight md:text-4xl`} style={{ color: MARINHO }}>
        {titulo}
      </h2>
      {texto && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#475569]">{texto}</p>}
    </div>
  );
}

const classeCard =
  "group flex h-full flex-col rounded-2xl border border-black/10 bg-white p-5 transition hover:border-black/30 hover:shadow-[0_12px_30px_-18px_rgba(10,37,64,0.35)] md:p-6";

function CardServico({ titulo, texto, href, whatsapp, origem }: { titulo: string; texto: string; href?: string; whatsapp?: string; origem: string }) {
  const corpo = (
    <>
      <h3 className={`${display.className} text-xl font-medium`} style={{ color: MARINHO }}>
        {titulo}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#475569]">{texto}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: AZUL }}>
        {whatsapp ? "Falar no WhatsApp" : "Ver detalhes"}
        <Icone d={ICONE_SETA} className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </>
  );
  return whatsapp ? (
    <LinkWhatsapp mensagem={whatsapp} origem={origem} className={classeCard}>
      {corpo}
    </LinkWhatsapp>
  ) : (
    <a href={href} className={classeCard}>
      {corpo}
    </a>
  );
}

export default async function AjisaiHome() {
  // Vagas abertas mais recentes (editáveis no CRM de Empregos).
  const vagas = (await vagasAtivas().catch(() => []))
    .filter((v) => v.status === "aberta")
    .sort((a, b) => b.publicadaEm.localeCompare(a.publicadaEm))
    .slice(0, 3);

  return (
    <main id="inicio" className="min-h-screen overflow-x-hidden bg-white text-black">
      {/* ── CABEÇALHO ── */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 md:px-8 md:py-4">
          <a href="#inicio" aria-label="Ajisai — início">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-9 w-auto object-contain invert md:h-10" />
          </a>
          <nav className="hidden items-center gap-7 text-sm text-[#334155] lg:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="transition hover:text-black">
                {n.rotulo}
              </a>
            ))}
          </nav>
          <LinkWhatsapp
            origem="cabecalho"
            style={{ background: MARINHO }}
            className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            WhatsApp
          </LinkWhatsapp>
        </div>
      </header>

      {/* ── HERO + 3 PORTAS ── */}
      <section className="bg-[#f5f5f7] px-5 pb-14 pt-12 md:px-8 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <h1 className={`${display.className} max-w-3xl text-[clamp(2.1rem,6vw,4rem)] font-normal leading-[1.05] tracking-[-0.015em]`} style={{ color: MARINHO }}>
            O Japão, do jeito certo.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#475569] md:text-lg">
            Viagem, documentação e emprego no Japão — com escritórios em São Paulo e Kobe. Por onde você quer começar?
          </p>

          <div className="mt-8 grid gap-3 md:mt-10 md:grid-cols-3 md:gap-4">
            {PORTAS.map((p) => (
              <a
                key={p.id}
                href={`#${p.id}`}
                className="group flex items-start gap-4 rounded-2xl border border-black/10 bg-white p-5 transition hover:border-black/30 hover:shadow-[0_12px_30px_-18px_rgba(10,37,64,0.35)] md:flex-col md:p-7"
              >
                <span className="text-black">
                  <Icone d={p.icone} className="h-7 w-7 md:h-8 md:w-8" />
                </span>
                <span className="flex-1">
                  <span className={`${display.className} flex items-center justify-between text-2xl`} style={{ color: MARINHO }}>
                    {p.titulo}
                    <Icone d={ICONE_SETA} className="h-5 w-5 text-[#94a3b8] transition group-hover:translate-x-0.5 group-hover:text-black" />
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-[#475569]">{p.texto}</span>
                </span>
              </a>
            ))}
          </div>

          <p className="mt-6 text-sm text-[#475569]">
            Já é cliente?{" "}
            <LinkWhatsapp origem="ja_sou_cliente" mensagem="Olá! Já sou cliente da Ajisai." className="font-semibold underline underline-offset-4" >
              Fale com a sua equipe no WhatsApp
            </LinkWhatsapp>
          </p>
        </div>
      </section>

      {/* ── PROVAS DE CONFIANÇA ── */}
      <section className="border-b border-black/10 px-5 py-8 md:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
          {PROVAS.map((p) => (
            <a key={p.rotulo} href={p.href} target="_blank" rel="noopener noreferrer" className="group">
              <span className={`${display.className} block text-2xl md:text-3xl`} style={{ color: MARINHO }}>
                {p.valor}
              </span>
              <span className="mt-1 block text-[13px] leading-snug text-[#64748b] group-hover:text-black">{p.rotulo}</span>
            </a>
          ))}
        </div>
      </section>

      {/* ── VIAGEM ── */}
      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <TituloSecao id="viagem" sobre="Viagem" titulo="Comece pela sua viagem" texto="Escolha como você quer viajar. Depois, complete com o que faltar." />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
            {COMECE_AQUI.map((s) => (
              <CardServico key={s.titulo} {...s} origem="viagem" />
            ))}
          </div>

          <h3 className="mt-12 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#64748b]">Complete sua viagem</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {COMPLETE_VIAGEM.map((s) => (
              <a
                key={s.titulo}
                href={s.href}
                className="rounded-full border border-black/15 px-4 py-2 text-sm text-[#1e293b] transition hover:border-black hover:bg-black hover:text-white"
              >
                {s.titulo}
              </a>
            ))}
          </div>
          <a href={`${SITE}/produtos`} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: AZUL }}>
            Ver todos os produtos e preços <Icone d={ICONE_SETA} className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ── DOCUMENTAÇÃO ── */}
      <section className="bg-[#f5f5f7] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <TituloSecao id="documentacao" sobre="Documentação" titulo="Seus documentos para o Japão" texto="Solicitação online, com acompanhamento da equipe Ajisai em cada etapa." />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
            {DOCUMENTACAO.map((s) => (
              <CardServico key={s.titulo} {...s} origem="documentacao" />
            ))}
          </div>
        </div>
      </section>

      {/* ── EMPREGO ── */}
      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <TituloSecao
            id="emprego"
            sobre="Emprego"
            titulo="Trabalhe no Japão"
            texto="Vagas em fábricas no Japão, para quem está no Brasil ou já mora lá. Você se candidata online e a equipe Ajisai acompanha até o embarque."
          />
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#1e293b]">
            {BENEFICIOS_EMPREGO.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Icone d="M5 12.5l4.5 4.5L19 7.5" className="h-4 w-4 text-black" />
                {b}
              </li>
            ))}
          </ul>

          {vagas.length > 0 && (
            <div className="mt-8 grid gap-3 md:grid-cols-3 md:gap-4">
              {vagas.map((v) => (
                <a key={v.id} href={`${SITE}/empregos/vagas/${v.id}`} className={classeCard}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#64748b]">
                    {v.cidade}, {v.regiao}
                  </p>
                  <h3 className={`${display.className} mt-2 text-xl font-medium`} style={{ color: MARINHO }}>
                    {v.titulo}
                  </h3>
                  <p className="mt-1 text-sm text-[#475569]">{v.empresa}</p>
                  <p className="mt-3 flex-1 text-sm font-semibold text-[#1e293b]">{v.salario}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: AZUL }}>
                    Ver vaga <Icone d={ICONE_SETA} className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </a>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={`${SITE}/empregos`} className="rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90" style={{ background: MARINHO }}>
              Ver todas as vagas
            </a>
            <LinkWhatsapp origem="emprego" mensagem="Olá! Quero saber sobre as vagas de emprego no Japão." className="rounded-full border border-black/20 px-6 py-3 text-sm font-semibold text-[#1e293b] transition hover:border-black">
              Tirar dúvidas no WhatsApp
            </LinkWhatsapp>
          </div>

          <p className="mt-8 max-w-3xl text-[13px] leading-relaxed text-[#64748b]">
            Empreiteiras parceiras: Fujiarte, Avance Authent, Brexa e UT Sumi-emu, com vagas em fábricas de empresas como Murata,
            Yamaha, Sony, Panasonic, Yokohama Tyres, Mitsubishi Electric, Fujifilm, Aisin e Subaru.
          </p>
        </div>
      </section>

      {/* ── QUEM SOMOS ── */}
      <section className="bg-[#f5f5f7] px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <TituloSecao id="quem-somos" sobre="Quem somos" titulo="Uma equipe no Brasil e no Japão" />
          <div className="mt-8 grid gap-3 md:grid-cols-2 md:gap-4">
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <h3 className={`${display.className} text-xl`} style={{ color: MARINHO }}>São Paulo</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                Av. Paulista, 777 · Bela Vista
                <br />
                AJISAIWORK JAPAN AGENCIA DE VIAGENS LTDA · desde 2021
              </p>
              <p className="mt-4 text-sm text-[#1e293b]">
                <strong>Kahori Motoshima</strong> — General Manager no Brasil
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <h3 className={`${display.className} text-xl`} style={{ color: MARINHO }}>Kobe</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                Kasabella Building C&amp;M 403, Isogami-dori 8-1-29, Chuo-ku, Kobe
                <br />
                AJISAI JAPAN株式会社 · desde 2024
              </p>
              <p className="mt-4 text-sm text-[#1e293b]">
                <strong>Yui Fujiwara</strong> — General Manager no Japão
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-3 md:mt-4 md:grid-cols-2 md:gap-4">
            <a href="https://www.linkedin.com/in/viniciusbraz/" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-black/10 bg-white p-6 transition hover:border-black/30">
              <p className="text-sm font-semibold text-[#1e293b]">Vinicius Braz</p>
              <p className="mt-1 text-sm text-[#475569]">Founder &amp; CEO da Ajisai, em Kobe. Passou por Aon, Accenture, Citi e Bradesco.</p>
            </a>
            <a href="https://www.linkedin.com/in/wilsonbraz/" target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-black/10 bg-white p-6 transition hover:border-black/30">
              <p className="text-sm font-semibold text-[#1e293b]">Wilson Braz</p>
              <p className="mt-1 text-sm text-[#475569]">Founder &amp; CEO da Alpinea, operadora parceira, em São Paulo. Passou por Amazon, TikTok, Criteo e Google.</p>
            </a>
          </div>
        </div>
      </section>

      {/* ── CONTATO + RODAPÉ ── */}
      <footer id="contato" className="scroll-mt-24 px-5 pb-12 pt-16 text-white md:px-8 md:pt-20" style={{ background: MARINHO }}>
        <div className="mx-auto max-w-6xl">
          <h2 className={`${display.className} text-3xl md:text-4xl`}>Fale com a Ajisai</h2>
          <p className="mt-2 text-sm text-white/70">Atendimento somente por WhatsApp. Seg. a sex., 8h–18h · sáb., dom. e feriados, 9h–16h.</p>
          <div className="mt-8 grid gap-3 md:grid-cols-2 md:gap-4">
            <LinkWhatsapp origem="contato_brasil" className="rounded-2xl border border-white/20 p-6 transition hover:border-white/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Brasil · São Paulo</p>
              <p className="mt-2 text-xl">(11) 93030-0101</p>
              <p className="mt-1 text-sm text-white/70">atendimento@ajisaiwork.com.br</p>
            </LinkWhatsapp>
            <LinkWhatsapp numero="817090198826" origem="contato_japao" className="rounded-2xl border border-white/20 p-6 transition hover:border-white/60">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">Japão · Kobe</p>
              <p className="mt-2 text-xl">070-9019-8826</p>
              <p className="mt-1 text-sm text-white/70">contact@ajisai-japan.jp</p>
            </LinkWhatsapp>
          </div>
          <p className="mt-4 text-[13px] text-white/60">Imprensa e parcerias comerciais: somente por e-mail.</p>

          <div className="mt-12 flex flex-col gap-6 border-t border-white/15 pt-8 md:flex-row md:items-center md:justify-between">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-10 w-auto self-start object-contain" />
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
              <a href="https://www.instagram.com/ajisaiworkjapan/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a>
              <a href="https://www.facebook.com/ajisaiwork" target="_blank" rel="noopener noreferrer" className="hover:text-white">Facebook</a>
              <a href="https://www.youtube.com/@TudoSobreJap%C3%A3oNot%C3%ADcias" target="_blank" rel="noopener noreferrer" className="hover:text-white">YouTube</a>
              <a href="https://www.alpinea.io" className="hover:text-white">Alpinea</a>
            </div>
          </div>
          <p className="mt-6 text-[11px] leading-relaxed text-white/45">
            © 2026 AJISAIWORK JAPAN AGENCIA DE VIAGENS LTDA · CNPJ 43.544.605/0001-56
            <br />
            AJISAI JAPAN株式会社 · Kobe, Japão
          </p>
        </div>
      </footer>
    </main>
  );
}
