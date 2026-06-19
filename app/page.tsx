"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Bodoni_Moda } from "next/font/google";

// Mesma fonte de destaque usada na landing page e na página de Serviços —
// mantém a identidade visual consistente entre as páginas do site.
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Formulário único de contato — idêntico ao usado na landing page (page.tsx),
// pra manter a mesma experiência de qualificação de lead em todas as páginas.
// E-mail: envia via /api/contact (precisa de RESEND_API_KEY configurada).
// WhatsApp: monta a mensagem e abre o wa.me já preenchido.
function ContactModal({
  channel,
  onClose,
}: {
  channel: "email" | "whatsapp";
  onClose: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      dates: String(data.get("dates") || "").trim(),
      travelers: String(data.get("travelers") || "").trim(),
      budget: String(data.get("budget") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };

    if (!payload.name || (channel === "email" && !payload.email)) {
      setStatus("error");
      setErrorMsg("Preencha nome" + (channel === "email" ? " e e-mail" : "") + " para continuar.");
      return;
    }

    if (channel === "whatsapp") {
      const lines = [
        `Olá! Meu nome é ${payload.name}.`,
        payload.phone && `Telefone: ${payload.phone}`,
        payload.dates && `Datas previstas: ${payload.dates}`,
        payload.travelers && `Viajantes: ${payload.travelers}`,
        payload.message && `Sobre a viagem: ${payload.message}`,
      ].filter(Boolean);
      const text = encodeURIComponent(lines.join("\n"));
      window.open(`https://wa.me/5511996691818?text=${text}`, "_blank");
      setStatus("success");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Não foi possível enviar agora. Tente novamente ou escreva para wilson@alpinea.io.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 md:p-8"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-white p-8 text-black md:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="mb-6 block text-xs uppercase tracking-[0.3em] text-black/40 transition hover:text-black"
        >
          Fechar ×
        </button>

        {status === "success" ? (
          <div className="py-6 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.45em] text-black/40">
              {channel === "email" ? "Mensagem enviada" : "WhatsApp aberto"}
            </p>
            <h3 className="text-2xl font-medium leading-tight md:text-3xl">
              {channel === "email" ? "Recebemos sua mensagem." : "Quase lá."}
            </h3>
            <p className="mt-4 text-sm leading-7 text-black/60">
              {channel === "email"
                ? "A Alpinea responde pessoalmente, normalmente em até 1 dia útil."
                : "Finalize o envio da mensagem na aba do WhatsApp que abrimos para você."}
            </p>
            <button
              onClick={onClose}
              className="mt-8 border border-black px-8 py-3 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <p className="mb-3 text-xs uppercase tracking-[0.45em] text-black/40">
              Fale com a Alpinea
            </p>
            <h3 className="text-2xl font-medium leading-tight md:text-3xl">
              {channel === "email" ? "Vamos conversar por e-mail." : "Vamos conversar por WhatsApp."}
            </h3>
            <p className="mt-3 text-sm leading-6 text-black/55">
              Conte um pouco sobre a viagem. Nenhum campo abaixo é obrigatório além do nome
              {channel === "email" ? " e do e-mail" : ""}.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Nome completo
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    E-mail{channel === "email" ? "" : " (opcional)"}
                  </span>
                  <input
                    name="email"
                    type="email"
                    required={channel === "email"}
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Telefone (opcional)
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Datas previstas (opcional)
                  </span>
                  <input
                    name="dates"
                    type="text"
                    placeholder="ex: setembro 2026, ainda flexível"
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none placeholder:text-black/30 focus:border-black"
                  />
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Viajantes (opcional)
                  </span>
                  <select
                    name="travelers"
                    defaultValue=""
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  >
                    <option value=""></option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3-4">3–4</option>
                    <option value="5+">5+</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                    Faixa de investimento (opcional)
                  </span>
                  <select
                    name="budget"
                    defaultValue=""
                    className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none focus:border-black"
                  >
                    <option value=""></option>
                    <option value="Até R$50k">Até R$50k</option>
                    <option value="R$50k–150k">R$50k–150k</option>
                    <option value="R$150k+">R$150k+</option>
                    <option value="Prefiro não informar">Prefiro não informar</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-black/40">
                  Como você imagina essa viagem (opcional)
                </span>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Gastronomia, compras, hospedagem, momentos especiais..."
                  className="w-full border-b border-black/20 bg-transparent py-2 text-sm outline-none placeholder:text-black/30 focus:border-black"
                />
              </label>

              {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 w-full border border-black px-8 py-4 text-xs uppercase tracking-[0.35em] transition hover:bg-black hover:text-white disabled:opacity-50 md:w-auto"
              >
                {status === "loading"
                  ? "Enviando..."
                  : channel === "email"
                  ? "Enviar mensagem"
                  : "Continuar no WhatsApp"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [contactChannel, setContactChannel] = useState<"email" | "whatsapp" | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);



  return (
    <main className="min-h-screen bg-black text-white">
      {contactChannel && (
        <ContactModal channel={contactChannel} onClose={() => setContactChannel(null)} />
      )}
  <section className="relative h-screen overflow-hidden">
    <div className="absolute inset-0">
  <video
    className="hero-video hero-video-0 absolute inset-0 h-full w-full object-cover"
    autoPlay
    muted
    loop
    playsInline
    src="/videos/japan-hero.mp4"
  />

  <video
    className="hero-video hero-video-1 absolute inset-0 h-full w-full object-cover"
    autoPlay
    muted
    loop
    playsInline
    src="/videos/tokyo-station.mp4"
  />

  <video
    className="hero-video hero-video-2 absolute inset-0 h-full w-full object-cover"
    autoPlay
    muted
    loop
    playsInline
    src="/videos/higashiyama.mp4"
  />

  <video
    className="hero-video hero-video-3 absolute inset-0 min-h-full min-w-full object-cover"
    autoPlay
    muted
    loop
    playsInline
    src="/videos/okinawa.mp4"
  />
</div>



    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black" />

<header
  className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 md:px-16 transition-all duration-700 ${
    scrolled
      ? "bg-black/10 backdrop-blur-2xl"
      : "bg-transparent"
  }`}
>
  <a href="/">
    <img
      src="/images/ALPINEA-LOGO-transparent.png"
      alt="Alpinea"
      className="h-8 w-auto object-contain"
    />
  </a>

  <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
    <a href="/" className="transition hover:text-white">
      Início
    </a>

    <a href="/services" className="transition hover:text-white">
      Serviços
    </a>

    <a href="/gastro" className="transition hover:text-white">
      Restaurantes
    </a>

    <a href="/guia" className="transition hover:text-white">
      Compras
    </a>

    <a href="/preview" className="transition hover:text-white">
      Roteiro
    </a>

    <a href="#contact" className="transition hover:text-white">
      Contato
    </a>
  </nav>
</header>

        <div className="relative z-10 flex h-[75vh] flex-col items-center justify-center px-6 text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-white/60">
            Acesso, Execução e Curadoria do Japão
          </p>

          <h1 className={`${display.className} text-6xl font-medium leading-[1.05] tracking-tight text-white md:text-8xl`}>
  Viva o Japão com
  <br />
 <span className="bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] bg-clip-text text-transparent animate-luxury-gradient bg-[length:180%_180%]">
  exclusividade.
  </span>
</h1>

          <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/70 md:text-lg">
            Viagens privadas, gastronomia de excelência, acesso cultural e
            planejamento impecável para clientes que esperam vivenciar o Japão
            com absoluta fluidez.
          </p>

          <a
            href="#contact"
            className="mt-12 border border-white/30 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
          >
            Solicitar Atendimento
          </a>
        </div>
      </section>

<section id="experiences" className="relative overflow-hidden px-6 py-32 md:px-16">
  <div className="mx-auto max-w-7xl">
    <p className="mb-8 text-xs uppercase tracking-[0.45em] text-white/40">
      EXPERIÊNCIAS PERSONALIZADAS
    </p>

    <h2 className={`${display.className} max-w-6xl text-5xl font-medium leading-tight tracking-tight md:text-7xl`}>
      O melhor do Japão, desenhado ao redor do seu estilo.
    </h2>

    <div className="mt-24 grid gap-8 md:grid-cols-3">
      
      {/* ALTA GASTRONOMIA */}
      <a href="#fine-dining" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/sugita.png"
            alt="Alta Gastronomia"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />

          {/* Fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Título */}
          <div className="absolute bottom-0 left-0 z-10 p-8">
            <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
              Alta Gastronomia
            </h3>
          </div>
        </div>
      </a>

      {/* ARTIGOS DE LUXO */}
      <a href="#luxury-goods" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/rolex.png"
            alt="Artigos de Luxo"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />

          {/* Fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Título */}
          <div className="absolute bottom-0 left-0 z-10 p-8">
            <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
              Artigos de Luxo
            </h3>
          </div>
        </div>
      </a>

      {/* EXPERIÊNCIAS */}
      <a href="#japan-experiences" className="group block">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-black">
          <img
            src="/images/fuji.JPG"
            alt="Experiências"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
            style={{ objectPosition: "center center" }}
          />

          {/* Fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/70 to-transparent" />

          {/* Título */}
          <div className="absolute bottom-0 left-0 z-10 p-8">
            <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">
              Experiências
            </h3>
          </div>
        </div>
      </a>

    </div>
  </div>
</section>

<section
  id="fine-dining"
  className="border-y border-white/10 px-6 py-28 md:px-16"
>
  <div className="mx-auto grid max-w-6xl items-center gap-20 md:grid-cols-[1.1fr_380px]">

    {/* TEXTO */}
    <div>
      <p className="mb-6 text-xs uppercase tracking-[0.4em] text-white/40">
        Alta Gastronomia
      </p>

      <h2 className={`${display.className} max-w-3xl text-4xl font-medium leading-tight md:text-6xl`}>
        Reservas quase impossíveis nos melhores restaurantes do Japão
      </h2>

      <div className="mt-12 max-w-2xl space-y-8 text-white/65">
        <p className="text-lg font-light leading-9">
          Nos principais restaurantes do Japão, reservas são extremamente
          limitadas e disputadas com meses — ou até anos — de antecedência.
        </p>

        <p className="text-lg font-light leading-9">
          A Alpinea viabiliza acesso a casas estreladas pelo Guia Michelin,
          referências no Tabelog e endereços quase impossíveis de reservar
          por conta própria, sempre com curadoria privada e atenção absoluta
          aos detalhes.
        </p>

        <p className="text-lg font-light leading-9">
          Mais do que uma reserva, proporcionamos experiências gastronômicas
          exclusivas, construídas através de relacionamento, repertório e
          profundo entendimento da cena culinária japonesa.
        </p>
      </div>
    </div>

    {/* IMAGEM */}
    <div className="flex justify-center md:justify-end">
      <div className="relative w-full max-w-[380px]">

        <img
          src="/images/fine-dining-stack.png"
          alt="Alta Gastronomia Japão"
          className="w-full rounded-[28px] object-cover"
        />

        {/* SAZENKA */}
<div className="absolute bottom-[69%] left-5">
  <p className="text-[16px] font-light tracking-[0.02em] text-white">
    Sazenka
  </p>
</div>

{/* SUSHI ARAI */}
<div className="absolute bottom-[36%] left-5">
  <p className="text-[16px] font-light tracking-[0.02em] text-white">
    Sushi Arai
  </p>
</div>

{/* AO */}
<div className="absolute bottom-5 left-5">
  <p className="text-[16px] font-light tracking-[0.02em] text-white">
    Ao
  </p>
</div>

      </div>
    </div>

  </div>
</section>

{/* RELACIONAMENTOS */}

<section className="bg-black px-8 py-32 md:px-16">
  <div className="mx-auto grid max-w-7xl gap-20 lg:grid-cols-2 lg:items-start">

    {/* TEXTO */}
    <div>
      <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">
        Relacionamentos construídos ao longo de mais de uma década
      </p>

      <h2 className={`${display.className} text-5xl font-medium leading-[1.05] tracking-tight text-white md:text-7xl`}>
        O acesso
        <br />
        começa muito antes
        <br />
        da reserva.
      </h2>

      <div className="mt-12 max-w-xl space-y-8 text-lg font-light leading-10 text-white/75">

        <p>
          Com raízes familiares em Shizuoka e Hiroshima e mais de uma década de presença constante no país, a Alpinea desenvolveu uma compreensão única da cultura japonesa, combinando fluência no idioma, experiência local e relacionamentos construídos ao longo do tempo.

        </p>

        <p>
          Nossa curadoria abrange desde alguns dos mais renomados endereços
          reconhecidos pelo Guia Michelin, Tabelog Awards e Asia&apos;s 50 Best
          Restaurants até restaurantes discretos e pouco conhecidos do público
          internacional, permitindo recomendar não apenas os restaurantes mais
          premiados do Japão, mas também experiências raramente encontradas em
          guias ou rankings internacionais.
        </p>

        <div className="pt-4">
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">
            Alguns dos restaurantes visitados ao longo dos anos
          </p>

          <p className="text-lg leading-10 text-white">
            Harutaka · Sushi Arai · Mizutani · Sawada · Tokami ·
            Sushidokoro Amano · Shunsuke · Ishiyama · Sushi Sho ·
            Nanaido · Mikawa Zezankyo · Fukamachi · Ao
          </p>
        </div>

        <p>
          Porque no Japão, os melhores acessos raramente são construídos através
          de plataformas ou intermediários. São construídos através de confiança
          adquirida ao longo de anos.
        </p>

      </div>
    </div>

    {/* IMAGEM */}
    <div className="flex justify-center lg:justify-end">
      <img
        src="/images/restaurant-cards.png"
        alt="Relacionamentos construídos ao longo de anos na gastronomia japonesa"
        className="w-full max-w-md object-contain"
      />
    </div>

  </div>
</section>


<section
  id="luxury-goods"
  className="border-y border-white/10 px-6 py-28 md:px-16"
>
  <div className="mx-auto grid max-w-6xl items-center gap-20 md:grid-cols-[1.1fr_420px]">
    {/* TEXTO */}
    <div>
      <p className="mb-6 text-xs uppercase tracking-[0.4em] text-white/40">
        Artigos de Luxo
      </p>

      <h2 className={`${display.className} max-w-3xl text-4xl font-medium leading-tight md:text-6xl`}>
        Acesso aos itens mais desejados do Japão
      </h2>

      <div className="mt-12 max-w-2xl space-y-8 text-white/65">
        <p className="text-lg font-light leading-9">
          O Japão abriga algumas das boutiques, relojoarias e lojas de tecnologia
          mais exclusivas do mundo — muitas vezes com edições limitadas,
          disponibilidade extremamente reduzida e atendimento reservado apenas
          para clientes selecionados.
        </p>

        <p className="text-lg font-light leading-9">
          A Alpinea auxilia na curadoria e acesso a artigos de luxo, câmeras,
          relógios, equuipamentos de pesca, itens colecionáveis e produtos difíceis de encontrar,
          sempre com acompanhamento personalizado e discrição absoluta.
        </p>

        <p className="text-lg font-light leading-9">
          Mais do que compras, proporcionamos experiências privadas em boutiques,
          atendimento dedicado e acesso a peças que raramente chegam ao mercado
          internacional com preços competitivos.
        </p>
      </div>
    </div>

    {/* IMAGENS */}
    <div className="flex justify-center md:justify-end">
      <div className="flex w-full max-w-[420px] flex-col gap-16">
        <div>
          <img
            src="/images/nikonz9.png"
            alt="Nikon Z9"
            className="mx-auto w-full max-w-[360px] object-contain"
          />

          <p className="mt-6 text-[16px] font-light tracking-[0.02em] text-white">
            Nikon Z9
          </p>
        </div>

        <div>
          <img
            src="/images/shimano-stella.png"
            alt="Shimano New Stella FK C5000XG"
            className="mx-auto w-full max-w-[360px] object-contain"
          />

          <p className="mt-6 text-[16px] font-light tracking-[0.02em] text-white">
            Shimano New Stella FK C5000XG
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
<section   id="japan-experiences" className="relative overflow-hidden px-6 py-32 md:px-16">
  {/* FUNDO MONTE FUJI */}
  <img
    src="/images/fuji-bg.jpg"
    alt="Monte Fuji"
    className="absolute inset-0 h-full w-full object-cover opacity-25"
  />

  <div className="absolute inset-0 bg-black/65" />
  <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />

  <div className="relative z-10 mx-auto max-w-6xl">
    <p className="mb-6 text-center text-xs uppercase tracking-[0.4em] text-white/40">
      EXPERIÊNCIAS
    </p>

    <h2 className={`${display.className} mx-auto max-w-5xl text-center text-4xl font-medium leading-tight md:text-7xl`}>
      O Japão além dos cartões-postais.
    </h2>

    <p className="mx-auto mt-8 max-w-3xl text-center text-lg leading-8 text-white/60">
      A Alpinea transforma o Japão em uma jornada desenhada ao redor dos seus
      interesses — combinando os principais pontos turísticos do país com acesso,
      conforto, logística impecável e acompanhamento personalizado.
    </p>

    <div className="mt-20 grid gap-6 md:grid-cols-3">
      <div>
        <div className="relative overflow-hidden rounded-[28px]">
          <img
            src="/images/skytree.jpg"
            alt="Tokyo Skytree"
            className="h-[520px] w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="mt-5 px-2">
          <h3 className="text-lg font-light">Tecnologia & Modernidade</h3>
          <p className="mt-2 text-sm leading-7 text-white/55">
            Exploração do Japão contemporâneo através de arquitetura, tecnologia, bairros icônicos e experiências urbanas cuidadosamente selecionadas.
          </p>
        </div>
      </div>

      <div className="md:mt-20">
        <div className="relative overflow-hidden rounded-[28px]">
          <video
            src="/videos/fushimi-inari.mp4"
            className="h-[520px] w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="mt-5 px-2">
          <h3 className="text-lg font-light">Belezas Naturais & Históricas</h3>
          <p className="mt-2 text-sm leading-7 text-white/55">
            Templos históricos como Kiyomizu-dera & Senso-ji, Beleza naturais como Monte Fuji, Niseko e Okinawa.
          </p>
        </div>
      </div>

<div>
  <div className="relative overflow-hidden rounded-[28px]">
    
    <img
      src="/images/samurai.png"
      alt="Samurai em armadura tradicional japonesa"
      className="h-[520px] w-full object-cover"
    />

    {/* Fade para preto */}
    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
  </div>

  <div className="mt-5 px-2">
    <h3 className="text-lg font-light">
      Cultura & Entretenimento Premium
    </h3>

    <p className="mt-2 text-sm leading-7 text-white/55">
      Museus, instalações artísticas, parques temáticos e experiências imersivas cuidadosamente selecionadas para revelar o lado mais contemporâneo e sensorial do Japão.
    </p>
  </div>
</div>
    </div>
  </div>
</section>

      <section
  id="concierge"
  className="relative overflow-hidden bg-black px-6 py-40 text-white md:px-16"
>
  {/* Background Image */}
  <div className="absolute inset-0">
    <img
      src="/images/shira.png"
      alt="Shirakawa-go"
      className="h-full w-full object-cover opacity-35"
    />

    {/* Dark Overlay */}
    <div className="absolute inset-0 bg-black/70" />

    {/* Bottom Fade */}
    <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-black" />
  </div>

  {/* Content */}
  <div className="relative z-10 mx-auto max-w-5xl text-center">
    <p className="mb-8 text-xs uppercase tracking-[0.45em] text-white/55">
      Sua Experiência Alpinea
    </p>

    <h2 className={`${display.className} text-5xl font-medium leading-[1.1] tracking-tight md:text-7xl`}>
      Faça o Japão parecer
      <br />
      exclusivamente seu.
    </h2>

    <p className="mx-auto mt-10 max-w-3xl text-lg leading-relaxed text-white/70">
      Pensado para viajantes que não procuram pacotes turísticos,
      mas acesso, repertório, precisão e execução impecável.
    </p>

    <p className="mx-auto mt-8 max-w-2xl text-sm font-light text-white/40">
      Para manter o padrão de atendimento, a Alpinea aceita um número limitado de novos clientes por temporada.
    </p>
  </div>
</section>

      <section
  id="contact"
  className="bg-white px-6 py-28 text-black md:px-16"
>
  <div className="mx-auto max-w-4xl text-center">
    <p className="mb-6 text-xs uppercase tracking-[0.4em] text-black/40">
      Contato
    </p>

    <h2 className={`${display.className} text-4xl font-medium leading-tight md:text-6xl`}>
      Comece sua jornada no Japão.
    </h2>

    <p className="mx-auto mt-6 max-w-xl text-black/60">
      Compartilhe suas datas, preferências e estilo de viagem.
      A Alpinea cuidará do restante.
    </p>

    <p className="mt-6 text-sm font-light text-black/40">
      Agenda limitada para o segundo semestre de 2026.
    </p>

    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
      
      {/* EMAIL */}
      <button
        type="button"
        onClick={() => setContactChannel("email")}
        className="border border-black px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
      >
        Falar por e-mail
      </button>

      {/* WHATSAPP */}
      <button
        type="button"
        onClick={() => setContactChannel("whatsapp")}
        className="border border-black/20 px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
      >
        WhatsApp
      </button>

    </div>
  </div>
</section>

 <footer className="border-t border-white/10 bg-black px-8 py-16 text-white md:px-16">
  <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:items-end">

    {/* Coluna esquerda */}
    <div className="space-y-6">
      <img
        src="/images/ALPINEA-LOGO-transparent.png"
        alt="Alpinea"
        className="h-7 w-auto object-contain"
      />

      <div className="max-w-md space-y-3">
        <p className="text-sm leading-relaxed text-white/50">
          Curadoria privada de experiências, gastronomia e lifestyle no Japão.
        </p>

        <p className="text-xs text-white/30">
          © 2026 Alpinea Agências de Viagens LTDA — CNPJ 66.491.067/0001-84
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-white/25">
          <a
            href="/legal"
            className="transition hover:text-white/60"
          >
            Termos e Condições
          </a>

          <span>·</span>

          <a
            href="/privacy"
            className="transition hover:text-white/60"
          >
            Política de Privacidade
          </a>
        </div>
      </div>
    </div>

    {/* Coluna direita */}
    <div className="flex items-center gap-8 text-xs uppercase tracking-[0.25em] text-white/40">
      <a
        href="https://www.instagram.com/alpinea.private"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-white"
      >
        Instagram
      </a>

      <a
        href="https://www.youtube.com/@alpinea.private"
        target="_blank"
        rel="noopener noreferrer"
        className="transition hover:text-white"
      >
        YouTube
      </a>

      <a
        href="mailto:wilson@alpinea.io"
        className="transition hover:text-white"
      >
        Contato
      </a>
    </div>

  </div>
</footer>

    </main>
  );
}
