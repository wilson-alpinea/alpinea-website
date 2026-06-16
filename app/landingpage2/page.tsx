"use client";

import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    whatsapp: "",
    datas: "",
    pessoas: "",
    cidades: "",
    perfil: "",
    orcamento: "",
    observacoes: "",
  });
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightbox(null);
        setFormOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (formOpen || lightbox) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [formOpen, lightbox]);

  const handleSubmit = () => {
    // Compose WhatsApp message
    const msg = [
      `*Novo contato via alpinea.io*`,
      ``,
      `*Nome:* ${formData.nome}`,
      `*Email:* ${formData.email}`,
      `*WhatsApp:* ${formData.whatsapp}`,
      `*Datas:* ${formData.datas}`,
      `*Pessoas:* ${formData.pessoas}`,
      `*Cidades:* ${formData.cidades}`,
      `*Perfil de viagem:* ${formData.perfil}`,
      `*Orçamento estimado:* ${formData.orcamento}`,
      `*Observações:* ${formData.observacoes || "—"}`,
    ].join("\n");
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/5511996691818?text=${encoded}`, "_blank");
    setFormSent(true);
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 px-5 py-4 text-sm font-light text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition";

  const selectClass =
    "w-full bg-white/5 border border-white/10 px-5 py-4 text-sm font-light text-white focus:outline-none focus:border-white/30 transition appearance-none";

  return (
    <main className="min-h-screen bg-black text-white">

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-6 backdrop-blur-sm cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Visualização ampliada"
            className="max-h-[92vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          />
          <button
            className="absolute right-6 top-6 text-white/50 transition hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Contact Form Modal ── */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}
        >
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#0d0d0d] border border-white/10">
            {/* Close */}
            <button
              className="absolute right-5 top-5 text-white/40 transition hover:text-white z-10"
              onClick={() => { setFormOpen(false); setFormSent(false); setFormStep(1); }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="px-8 py-10">
              {formSent ? (
                <div className="text-center py-8">
                  <p className="text-xs uppercase tracking-[0.45em] text-white/40 mb-6">Enviado</p>
                  <h3 className="text-3xl font-light text-white mb-6">Recebemos sua solicitação.</h3>
                  <p className="text-sm font-light leading-7 text-white/55">
                    A Alpinea entrará em contato em até 48 horas com uma proposta inicial personalizada.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-[0.45em] text-white/40 mb-3">
                    Solicitação de atendimento
                  </p>
                  <h3 className="text-2xl font-light text-white mb-8">
                    Conte-nos sobre sua viagem.
                  </h3>

                  {/* Step indicator */}
                  <div className="flex gap-2 mb-10">
                    {[1, 2, 3].map((s) => (
                      <div
                        key={s}
                        className={`h-px flex-1 transition-all duration-500 ${
                          s <= formStep ? "bg-white/60" : "bg-white/15"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Step 1 — Contato */}
                  {formStep === 1 && (
                    <div className="space-y-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/35 mb-6">
                        Etapa 1 de 3 — Identificação
                      </p>
                      <input
                        className={inputClass}
                        placeholder="Nome completo"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      />
                      <input
                        className={inputClass}
                        placeholder="E-mail"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                      <input
                        className={inputClass}
                        placeholder="WhatsApp (com DDD)"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      />
                      <button
                        onClick={() => setFormStep(2)}
                        disabled={!formData.nome || !formData.email}
                        className="mt-4 w-full border border-white/30 py-4 text-xs uppercase tracking-[0.35em] text-white transition hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Continuar
                      </button>
                    </div>
                  )}

                  {/* Step 2 — Viagem */}
                  {formStep === 2 && (
                    <div className="space-y-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/35 mb-6">
                        Etapa 2 de 3 — Detalhes da viagem
                      </p>
                      <input
                        className={inputClass}
                        placeholder="Datas previstas (ex: 10 a 25 de outubro de 2025)"
                        value={formData.datas}
                        onChange={(e) => setFormData({ ...formData, datas: e.target.value })}
                      />
                      <select
                        className={selectClass}
                        value={formData.pessoas}
                        onChange={(e) => setFormData({ ...formData, pessoas: e.target.value })}
                      >
                        <option value="" disabled>Número de viajantes</option>
                        <option>1 pessoa</option>
                        <option>2 pessoas</option>
                        <option>3 a 4 pessoas</option>
                        <option>5 ou mais pessoas</option>
                      </select>
                      <input
                        className={inputClass}
                        placeholder="Cidades de interesse (ex: Tokyo, Kyoto, Osaka)"
                        value={formData.cidades}
                        onChange={(e) => setFormData({ ...formData, cidades: e.target.value })}
                      />
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => setFormStep(1)}
                          className="flex-1 border border-white/15 py-4 text-xs uppercase tracking-[0.35em] text-white/50 transition hover:border-white/30 hover:text-white"
                        >
                          Voltar
                        </button>
                        <button
                          onClick={() => setFormStep(3)}
                          disabled={!formData.datas || !formData.pessoas}
                          className="flex-1 border border-white/30 py-4 text-xs uppercase tracking-[0.35em] text-white transition hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Continuar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3 — Perfil */}
                  {formStep === 3 && (
                    <div className="space-y-4">
                      <p className="text-xs uppercase tracking-[0.35em] text-white/35 mb-6">
                        Etapa 3 de 3 — Perfil e preferências
                      </p>
                      <select
                        className={selectClass}
                        value={formData.perfil}
                        onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                      >
                        <option value="" disabled>Estilo de viagem</option>
                        <option>Gastronomia e cultura</option>
                        <option>Compras e artesanato</option>
                        <option>Natureza e contemplação</option>
                        <option>Experiência completa (misto)</option>
                        <option>Ainda não sei — quero orientação</option>
                      </select>
                      <select
                        className={selectClass}
                        value={formData.orcamento}
                        onChange={(e) => setFormData({ ...formData, orcamento: e.target.value })}
                      >
                        <option value="" disabled>Orçamento estimado (por pessoa, sem passagem)</option>
                        <option>USD 5.000 – 10.000</option>
                        <option>USD 10.000 – 20.000</option>
                        <option>USD 20.000 – 40.000</option>
                        <option>Acima de USD 40.000</option>
                        <option>Prefiro não informar</option>
                      </select>
                      <textarea
                        className={`${inputClass} resize-none`}
                        rows={3}
                        placeholder="Algo importante que devemos saber? (opcional)"
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      />
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => setFormStep(2)}
                          className="flex-1 border border-white/15 py-4 text-xs uppercase tracking-[0.35em] text-white/50 transition hover:border-white/30 hover:text-white"
                        >
                          Voltar
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={!formData.perfil || !formData.orcamento}
                          className="flex-1 border border-white/30 py-4 text-xs uppercase tracking-[0.35em] text-white transition hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 1. HERO ── */}
      <section className="relative h-[50vh] min-h-[520px] overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="/videos/higashiyama.mp4"
          autoPlay muted loop playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/35 to-black" />

        {/* Header — logo only, no nav */}
        <header
          className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-8 py-5 transition-all duration-700 md:px-16 ${
            scrolled ? "bg-black/20 backdrop-blur-2xl" : "bg-transparent"
          }`}
        >
          <a href="/" className="text-xl tracking-[0.45em]">ALPINEA</a>
        </header>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-20 text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-white/60">
            Viagens privadas e concierge no Japão
          </p>
          <h1 className="max-w-4xl text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
            O Japão que não aparece
            <br />
            <span className="bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A] bg-clip-text text-transparent">
              nos guias.
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-base font-light leading-8 text-white/65 md:text-lg">
            Restaurantes impossíveis de encontrar, artesãos sem presença internacional, hotéis escolhidos pela experiência — não pelo nome.
          </p>
          <button
            onClick={() => setFormOpen(true)}
            className="mt-10 border border-white/30 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
          >
            Solicitar Atendimento
          </button>
        </div>
      </section>

      {/* ── 2. ESTRUTURA ── */}
      <section className="border-b border-white/10 px-8 py-24 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-12 text-xs uppercase tracking-[0.45em] text-white/40">
            Estrutura Alpinea
          </p>
          <div className="grid gap-0 border-y border-white/10 md:grid-cols-4">
            {[
              { title: "+12 anos", text: "Vivência contínua no Japão, entre gastronomia, hotéis, cultura, logística e relações locais." },
              { title: "Idioma japonês", text: "Comunicação direta com restaurantes, artesãos, hotéis e fornecedores locais." },
              { title: "Brasil–Japão", text: "Experiência especializada em uma das rotas internacionais mais relevantes para o cliente brasileiro." },
              { title: "Brasil · Japão", text: "Estrutura empresarial nos dois países, com operação desenhada para o mercado de luxo." },
            ].map((item) => (
              <div key={item.title} className="border-white/10 py-10 md:border-r md:px-10 last:md:border-r-0">
                <h3 className="text-2xl font-light tracking-tight text-white md:text-3xl">{item.title}</h3>
                <p className="mt-6 max-w-[280px] text-sm font-light leading-7 text-white/55">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. PROVA CONCRETA ── */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.45em] text-white/40">Acesso real</p>
              <h2 className="max-w-xl text-4xl font-light leading-tight md:text-5xl">
                Lugares que exigem<br />relação pessoal para existir.
              </h2>
            </div>
            <p className="max-w-sm text-sm font-light leading-7 text-white/50">
              Não operamos por plataformas. Cada reserva, cada acesso, cada experiência abaixo vem de uma relação construída ao longo de anos.
            </p>
          </div>

          <div className="grid gap-px bg-white/[0.06] md:grid-cols-3">
            {[
              {
                category: "Gastronomia · Tokyo",
                name: "Fukamachi",
                note: "Tempura omakase. Sem reservas externas. Lista de espera via relação direta.",
                img: "/images/gastro-hero.jpg",
              },
              {
                category: "Gastronomia · Tokyo",
                name: "Shunsuke",
                note: "Kaiseki contemporâneo. Não aceita reservas internacionais por plataformas.",
                img: "/images/zezankyo.jpg",
              },
              {
                category: "Gastronomia · Tokyo",
                name: "Sushi Arai",
                note: "Sushi omakase de alto nível. Acesso apenas via indicação pessoal.",
                img: "/images/sushi-arai.jpg",
              },
              {
                category: "Hospedagem · Tokyo",
                name: "Aman Tokyo",
                note: "Curadoria de acomodação e experiências exclusivas para hóspedes.",
                img: "/images/amankyoto.jpg",
              },
              {
                category: "Gastronomia · Osaka",
                name: "Niku Kappou Miyata",
                note: "Wagyu kappo de altíssimo nível. Reserva somente via contato direto em japonês.",
                img: "/images/nikufood.jpg",
              },
              {
                category: "Gastronomia · Tokyo",
                name: "Ao",
                note: "Cozinha japonesa contemporânea. Uma das experiências mais difíceis de acessar em Tokyo.",
                img: "/images/ao.jpg",
              },
            ].map((item) => (
              <div key={item.name} className="group relative overflow-hidden bg-black">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:opacity-80 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <p className="mb-1 text-xs uppercase tracking-[0.35em] text-white/40">{item.category}</p>
                  <h3 className="text-2xl font-light text-white">{item.name}</h3>
                  <p className="mt-3 text-sm font-light leading-6 text-white/55 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {item.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. DIFERENCIAIS ── */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">Por que é diferente</p>
            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              Acesso que não existe<br />em nenhuma plataforma.
            </h2>
          </div>
          <div className="space-y-10 text-lg font-light leading-9 text-white/68">
            <p>
              Os restaurantes que definem o topo da gastronomia japonesa não operam por plataformas, não respondem em inglês e não reservam para desconhecidos — nem mesmo para concierge de hotéis. Somente via relação pessoal.
            </p>
            <p>
              Os melhores artesãos e produtos de cada categoria não fazem propaganda. Encontrá-los exige presença, idioma e anos de relação construída.
            </p>
            <p>
              Encontrar o hotel certo para cada perfil exige mais que conhecer nomes famosos. Exige vivência real em cada propriedade.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. CTA INTERMEDIÁRIO — dark gray bg ── */}
      <section className="border-b border-white/10 bg-[#111110] px-8 py-20 md:px-16">
        <div className="mx-auto max-w-7xl flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-light leading-tight md:text-4xl">Pronto para começar?</h2>
            <p className="mt-3 text-base font-light text-white/50">
              Compartilhe suas datas e perfil. A Alpinea estrutura o restante.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <button
              onClick={() => setFormOpen(true)}
              className="border border-white/30 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black"
            >
              Entrar em contato
            </button>
            <a
              href="https://wa.me/5511996691818"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/10 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white/55 transition hover:border-white/30 hover:text-white"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── 6. O PRODUTO — 3 níveis + screenshots ── */}
      <section id="execucao" className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-4xl">
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">O produto</p>
            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              Uma empresa moderna que entrega um nível de execução poucas vezes visto no mercado de luxo.
            </h2>
            <p className="mt-8 max-w-3xl text-lg font-light leading-9 text-white/68">
              Desde o roteiro até a assessoria presencial dedicada, tudo é pensado nos mínimos detalhes.
            </p>
          </div>

          {/* 3 tiers summary */}
          <div className="mb-16 grid gap-px bg-white/[0.06] md:grid-cols-3">
            {[
              {
                tier: "Design",
                label: "Orientação estratégica",
                desc: "Roteiro personalizado e curadoria de destino. O cliente conduz a viagem com uma base Alpinea.",
              },
              {
                tier: "Executive",
                label: "Planejamento completo",
                desc: "Roteiro, hotéis, reservas de restaurantes, logística e concierge remoto durante a estadia.",
              },
              {
                tier: "Private",
                label: "Acompanhamento presencial",
                desc: "Tudo do Executive mais presença local em restaurantes, compras e atrações. Execução dedicada no Japão.",
                highlight: true,
              },
            ].map((t) => (
              <div
                key={t.tier}
                className={`px-8 py-10 ${t.highlight ? "bg-white/[0.04]" : "bg-black"}`}
              >
                <p className="mb-2 text-xs uppercase tracking-[0.45em] text-white/35">{t.label}</p>
                <h3 className="mb-5 text-2xl font-light text-white">Alpinea {t.tier}</h3>
                <p className="text-sm font-light leading-7 text-white/50">{t.desc}</p>
                <a
                  href="/services"
                  className="mt-8 inline-block text-xs uppercase tracking-[0.3em] text-white/35 transition hover:text-white"
                >
                  Ver detalhes →
                </a>
              </div>
            ))}
          </div>

          {/* Screenshots */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ["/images/ss-roteiro.png", "Roteiro privado"],
              ["/images/ss-restaurantes.png", "Reservas gastronômicas"],
              ["/images/ss-rcompras.png", "Assessoria de compras"],
            ].map(([src, title]) => (
              <div key={title} className="group cursor-zoom-in" onClick={() => setLightbox(src)}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-white/5">
                  <img
                    src={src}
                    alt={title}
                    className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20 rounded-[22px]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-xs uppercase tracking-[0.35em] text-white/45">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. ROTEIRO SOB MEDIDA ── */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2">
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">Roteiro sob medida</p>
            <h2 className="text-4xl font-light leading-tight md:text-6xl">
              Um roteiro que vai além de uma lista genérica de lugares.
            </h2>
          </div>
          <div className="space-y-8 text-lg font-light leading-9 text-white/68">
            <p>
              A Alpinea desenha jornadas privadas no Japão com curadoria de hotéis, restaurantes, logística, compras, experiências e acompanhamento presencial quando necessário.
            </p>
            <p>
              Cada detalhe é pensado para reduzir ruído, antecipar problemas e transformar a viagem em uma experiência fluida, precisa e profundamente personalizada.
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. PRESENÇA DIGITAL ── */}
      <section className="border-b border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="md:grid md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:items-start">
            <div className="mb-12 md:mb-0 md:sticky md:top-24">
              <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/45">Presença digital</p>
              <h2 className="text-4xl font-light leading-tight md:text-6xl">
                Conheça mais sobre destinos, hotéis, restaurantes e atrações.
              </h2>
              <p className="mt-8 text-lg font-light leading-9 text-white/68">
                Acompanhe a Alpinea no Instagram e YouTube para ver uma leitura real do Japão: gastronomia, bairros, hotéis, experiências e bastidores de curadoria.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="https://www.instagram.com/alpinea.private"
                  target="_blank" rel="noopener noreferrer"
                  className="border border-white/20 px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/75 transition hover:border-white hover:text-white"
                >
                  Instagram
                </a>
                <a
                  href="https://www.youtube.com/@alpinea.private"
                  target="_blank" rel="noopener noreferrer"
                  className="border border-white/20 px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/75 transition hover:border-white hover:text-white"
                >
                  YouTube
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="overflow-hidden rounded-[22px] bg-white/5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[22px]">
                  <img src="/images/youtube-feed.png" alt="Feed do YouTube Alpinea Private" className="h-full w-full object-cover object-top" />
                </div>
              </div>
              <div className="overflow-hidden rounded-[22px] bg-white/5">
                <div className="relative aspect-[9/16] overflow-hidden rounded-[22px]">
                  <img src="/images/ss-ig.png" alt="Feed do Instagram Alpinea Private" className="h-full w-full object-cover object-top" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. CTA FINAL ── */}
      <section id="contact" className="bg-white px-8 py-28 text-black md:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.45em] text-black/45">Contato</p>
          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Comece sua jornada no Japão.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-black/60 md:text-lg">
            Compartilhe suas datas, preferências e estilo de viagem. A Alpinea cuidará do restante.
          </p>
          <div className="mt-12 flex flex-col justify-center gap-4 md:flex-row">
            <button
              onClick={() => setFormOpen(true)}
              className="border border-black px-10 py-5 text-xs uppercase tracking-[0.35em] transition hover:bg-black hover:text-white"
            >
              Entrar em contato
            </button>
            <a
              href="https://wa.me/5511996691818"
              target="_blank" rel="noopener noreferrer"
              className="border border-black/20 px-10 py-5 text-xs uppercase tracking-[0.35em] transition hover:border-black hover:bg-black hover:text-white"
            >
              Contato por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 bg-black px-8 py-16 text-white md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:items-end">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.45em] text-white/80">Alpinea</p>
            <div className="max-w-md space-y-3">
              <p className="text-sm leading-relaxed text-white/50">
                Curadoria privada de experiências, gastronomia e lifestyle no Japão.
              </p>
              <p className="text-xs text-white/30">
                © 2026 Alpinea Agências de Viagens LTDA — CNPJ 66.491.067/0001-84
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/25">
                <a href="/legal" className="transition hover:text-white/60">Termos e Condições</a>
                <span>·</span>
                <a href="/privacy" className="transition hover:text-white/60">Política de Privacidade</a>
              </div>
            </div>
          </div>
          {/* Nav links moved to footer */}
          <div className="flex flex-wrap items-center gap-8 text-xs uppercase tracking-[0.25em] text-white/40">
            <a href="/" className="transition hover:text-white">Início</a>
            <a href="/services" className="transition hover:text-white">Serviços</a>
            <a href="/gastro" className="transition hover:text-white">Restaurantes</a>
            <a href="/guia" className="transition hover:text-white">Compras</a>
            <a href="/preview" className="transition hover:text-white">Roteiro</a>
            <a href="https://www.instagram.com/alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Instagram</a>
            <a href="https://www.youtube.com/@alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">YouTube</a>
            <a href="mailto:wilson@alpinea.io" className="transition hover:text-white">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
