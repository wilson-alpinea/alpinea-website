import Image from "next/image";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { metaEmpregos } from "@/lib/empregos/metaCompartilhamento";
import { WHATSAPP_AJISAI_NUMERO } from "@/lib/email/templateCliente";

// /trabalhar-no-japao — página institucional da Ajisai Empregos para a
// campanha do ChatGPT Ads (Wilson, 27/out/2026). A política de anúncios da
// OpenAI proíbe anunciar vagas individuais, mas permite levar a plataformas
// de vagas desde que a página e o criativo não citem uma vaga específica.
// Por isso aqui NÃO há vaga, empresa contratante, cidade ou salário — só
// quem é a Ajisai, como funciona e o botão "Explorar oportunidades", que
// leva ao catálogo em /empregos. Conteúdo derivado de /empregos.

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = metaEmpregos({
  titulo: "Trabalhar no Japão com apoio em português — Ajisai",
  descricao:
    "Conheça a Ajisai: há mais de 12 anos no Japão, apoiando brasileiros que buscam emprego formal no país, com atendimento em português do primeiro contato à mudança.",
  url: "https://www.alpinea.io/trabalhar-no-japao",
});

const CATALOGO = "/empregos#vagas";
const whatsapp = `https://wa.me/${WHATSAPP_AJISAI_NUMERO}?text=${encodeURIComponent("Olá! Conheci a Ajisai pela página Trabalhar no Japão e queria saber mais.")}`;

const PUBLICOS = [
  {
    titulo: "Para quem está no Brasil",
    texto: "Você quer um emprego formal no Japão, com contrato e o processo de mudança organizado do início ao fim.",
    imagem: "/images/empregos-publico-brasil.jpg",
  },
  {
    titulo: "Para quem já está no Japão",
    texto: "Você já mora e trabalha no Japão e quer uma nova oportunidade — mais perto de casa, em outro setor ou com melhores condições.",
    imagem: "/images/empregos-publico-japao.jpg",
  },
];

const ETAPAS = [
  { titulo: "Explore as oportunidades", texto: "Consulte o catálogo no site, filtre por região e setor e escolha o que combina com você." },
  { titulo: "Cadastro e análise de perfil", texto: "Você faz um cadastro online. Comparamos seu perfil com o que cada empresa procura e você recebe o resultado na hora." },
  { titulo: "Ficha e testes", texto: "Quando há compatibilidade, você preenche a ficha pedida pela empresa e faz as etapas exigidas, como testes online." },
  { titulo: "Pré-entrevista e entrevista", texto: "Você agenda uma conversa online com a nossa equipe, que depois apresenta seu perfil à empresa." },
  { titulo: "Documentação e mudança", texto: "Damos suporte com documentação, visto e passagem até o seu primeiro dia de trabalho." },
];

const SETORES = [
  { nome: "Automobilístico", texto: "Linhas de montagem, componentes e logística para o setor automotivo.", icone: "/images/icon-setor-automotivo.png" },
  { nome: "Componentes eletrônicos", texto: "Fabricação, montagem e controle de qualidade de componentes eletrônicos.", icone: "/images/icon-setor-eletronicos.png" },
  { nome: "Alimentício", texto: "Produção, embalagem e logística em fábricas de alimentos e bebidas.", icone: "/images/icon-setor-alimenticio.png" },
  { nome: "Materiais industriais", texto: "Produção de peças e materiais industriais — vidro, borracha, plástico e afins.", icone: "/images/icon-setor-materiais.png" },
];

const DIFERENCIAIS = [
  { titulo: "Mais de 12 anos no Japão", texto: "Operação própria e equipe local, com experiência real no mercado de trabalho japonês." },
  { titulo: "Atendimento em português", texto: "Suporte por WhatsApp e e-mail durante toda a jornada, antes e depois da chegada ao Japão." },
  { titulo: "Relação direta com as empresas", texto: "Trabalhamos com empresas dos setores automotivo, eletrônico, alimentício e de materiais." },
  { titulo: "Transparência em cada etapa", texto: "Você acompanha pelo site em que etapa está e quais são os prazos médios de cada fase." },
];

const PERGUNTAS = [
  {
    p: "Quem pode se candidatar?",
    r: "Brasileiros que estão no Brasil e querem trabalhar no Japão, e quem já mora no Japão e busca uma nova oportunidade. Os requisitos de cada oportunidade aparecem no catálogo.",
  },
  {
    p: "Preciso falar japonês?",
    r: "Depende da oportunidade — o nível exigido está descrito em cada uma. Todo o nosso atendimento é em português.",
  },
  {
    p: "Como acompanho o andamento?",
    r: "Depois do cadastro, você recebe por e-mail os próximos passos e pode ver no site em que etapa está e os prazos médios de cada fase.",
  },
  {
    p: "Como falo com a equipe?",
    r: "Pelo WhatsApp, em português. Também respondemos pelo e-mail informado no cadastro.",
  },
];

function Botao({ href, children, claro = false }: { href: string; children: React.ReactNode; claro?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
        claro ? "bg-white text-[#0A2540] hover:bg-white/90" : "bg-[#2f80c9] text-white hover:bg-[#3b91dc]"
      }`}
    >
      {children}
    </Link>
  );
}

export default function TrabalharNoJapaoPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-black">
      {/* Cabeçalho */}
      <header className="absolute left-0 right-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 md:px-16">
          <Link href="/trabalhar-no-japao" aria-label="Ajisai — Trabalhar no Japão">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-9 w-auto object-contain md:h-11" />
          </Link>
          <Link href={CATALOGO} className="rounded-full border border-white/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-[#0A2540]">
            Explorar oportunidades
          </Link>
        </div>
      </header>

      {/* Hero — mesma colagem de /empregos, limitada a 1400 px no widescreen */}
      <section className="relative overflow-hidden bg-[#0A2540]">
        <div className="absolute inset-0 hidden min-[1400px]:block" aria-hidden="true">
          <Image src="/images/empregos-hero-colagem.jpg" alt="" fill sizes="100vw" className="scale-110 object-cover blur-2xl" />
        </div>
        <div className="absolute inset-y-0 left-1/2 w-full max-w-[1400px] -translate-x-1/2 min-[1400px]:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <Image
            src="/images/empregos-hero-colagem.jpg"
            alt="Profissionais trabalhando em fábricas no Japão"
            fill
            priority
            sizes="(min-width: 1400px) 1400px, 100vw"
            className="object-cover object-top"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] from-20% via-[#0A2540]/80 via-50% to-[#0A2540]/25" />
        <div className="relative flex min-h-[560px] flex-col justify-end px-6 pb-12 pt-32 md:min-h-[660px] md:px-10 md:pb-16">
          <div className="mx-auto w-full max-w-3xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6ec3d9]">Ajisai Empregos</p>
            <h1 className={`${display.className} mt-4 text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.1] text-white`}>
              Trabalhe no Japão com apoio em português
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base font-light leading-7 text-white/75">
              Explore oportunidades de emprego formal no Japão e conte com uma equipe que acompanha você do primeiro contato até a mudança.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Botao href={CATALOGO}>Explorar oportunidades</Botao>
              <a href="#como-funciona" className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70 underline decoration-white/30 underline-offset-4 hover:text-white">
                Como funciona
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quem somos */}
      <section className="border-b border-black/10 px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Quem somos</p>
            <h2 className={`${display.className} mt-3 text-3xl font-medium text-black md:text-4xl`}>A Ajisai conecta brasileiros a empregos formais no Japão</h2>
          </div>
          <div className="space-y-4 text-[15px] font-light leading-7 text-black/65">
            <p>
              Há mais de 12 anos com presença no Japão, a Ajisai apoia brasileiros que buscam trabalho formal no país — tanto quem está no Brasil quanto quem já vive no Japão.
            </p>
            <p>
              Nossa plataforma reúne oportunidades em fábricas de diferentes setores. Você consulta o catálogo, faz um cadastro online e é acompanhado por uma equipe que fala português em cada etapa do processo.
            </p>
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section className="border-b border-black/10 bg-black/[0.02] px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Para quem é</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>Dois caminhos, o mesmo cuidado</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {PUBLICOS.map((p) => (
              <div key={p.titulo} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                <div className="relative aspect-[16/10] w-full bg-black/5">
                  <Image src={p.imagem} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                </div>
                <div className="p-7">
                  <h3 className={`${display.className} text-xl font-medium text-black`}>{p.titulo}</h3>
                  <p className="mt-3 text-sm font-light leading-6 text-black/60">{p.texto}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="scroll-mt-6 border-b border-black/10 px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Como funciona</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>Do cadastro ao primeiro dia de trabalho</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {ETAPAS.map((e, i) => (
              <li key={e.titulo} className="rounded-2xl border border-black/10 bg-black/[0.02] p-5">
                <span className={`${display.className} text-2xl font-medium text-[#2f80c9]`}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-sm font-semibold text-black">{e.titulo}</h3>
                <p className="mt-2 text-[13px] font-light leading-5 text-black/60">{e.texto}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Botao href={CATALOGO}>Explorar oportunidades</Botao>
          </div>
        </div>
      </section>

      {/* Setores */}
      <section className="border-b border-black/10 bg-black/[0.02] px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Setores</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>Onde estão as oportunidades</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SETORES.map((s) => (
              <div key={s.nome} className="flex flex-col items-center rounded-2xl border border-black/10 bg-white p-7 text-center">
                <span
                  aria-hidden="true"
                  className="h-14 w-14 bg-[#2f80c9]"
                  style={{ maskImage: `url(${s.icone})`, WebkitMaskImage: `url(${s.icone})`, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center" }}
                />
                <h3 className={`${display.className} mt-4 text-lg font-medium text-black`}>{s.nome}</h3>
                <p className="mt-2 text-[13px] font-light leading-5 text-black/60">{s.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="border-b border-black/10 px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Por que a Ajisai</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>Apoio de quem conhece o Japão</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIFERENCIAIS.map((d) => (
              <div key={d.titulo} className="rounded-2xl border border-black/10 bg-black/[0.02] p-6">
                <h3 className="text-sm font-semibold text-black">{d.titulo}</h3>
                <p className="mt-2 text-[13px] font-light leading-5 text-black/60">{d.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perguntas frequentes */}
      <section className="border-b border-black/10 bg-black/[0.02] px-6 py-16 md:px-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Dúvidas</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>Perguntas frequentes</h2>
          <div className="mt-8 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
            {PERGUNTAS.map((q) => (
              <details key={q.p} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-black">
                  {q.p}
                  <span aria-hidden="true" className="text-lg font-light text-black/40 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm font-light leading-6 text-black/60">{q.r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#0A2540] px-6 py-16 text-center md:px-16 md:py-24">
        <h2 className={`${display.className} text-2xl font-medium text-white md:text-4xl`}>Explore oportunidades e conte com apoio em português</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm font-light leading-6 text-white/65">
          Veja as oportunidades disponíveis no nosso catálogo e faça seu cadastro online.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Botao href={CATALOGO} claro>
            Explorar oportunidades
          </Botao>
          <a href={whatsapp} target="_blank" rel="noreferrer" className="text-xs text-[#6ec3d9] underline decoration-white/20 underline-offset-4 hover:text-white">
            Falar com a Ajisai no WhatsApp
          </a>
        </div>
      </section>

      {/* Rodapé — identificação da empresa */}
      <footer className="bg-white px-8 pb-16 pt-14 text-center md:px-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="mx-auto h-10 w-auto object-contain invert" />
        <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-black/50">
          Empregos formais no Japão para brasileiros — do primeiro contato até a mudança.
        </p>
        <p className="mt-4 text-[11px] leading-relaxed text-black/30">
          © 2026 AJISAIWORK JAPAN AGENCIA DE VIAGENS LTDA — CNPJ 43.544.605/0001-56
        </p>
      </footer>
    </main>
  );
}
