import Image from "next/image";

export const metadata = {
  title: "Alpinea | Dia 8 — Kyoto",
  description:
    "Dia 8 do roteiro Alpinea Private: Kinkaku-ji, almoço no Niku Kappou Miyata e Gion Matsuri.",
};

export default function Day8Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/" className="text-xl tracking-[0.45em]">
          ALPINEA
        </a>
        <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
          <a href="/" className="transition hover:text-white">Início</a>
          <a href="/services" className="transition hover:text-white">Serviços</a>
          <a href="/preview" className="transition text-white">Roteiro</a>
          <a href="#contact" className="transition hover:text-white">Contato</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative min-h-[720px] overflow-hidden border-b border-white/10">
        <Image
          src="/images/ginzan-onsen.jpg"
          alt="Alpinea Preview"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black" />
        <div className="relative z-10 mx-auto flex min-h-[720px] max-w-7xl items-center px-8 md:px-16">
          <div className="max-w-4xl">
            <p className="mb-10 text-xs uppercase tracking-[0.45em] text-white/45">
              ROTEIRO ALPINEA
            </p>
            <h1 className="text-5xl font-light leading-[1.05] tracking-tight md:text-7xl">
              Um exemplo real
              <br />
              de uma jornada Alpinea.
            </h1>
            <p className="mt-10 max-w-2xl text-xl font-light leading-10 text-white/65">
              Uma prévia simplificada da forma como estruturamos roteiros:
              contexto, ritmo, logística, atrações, horários recomendados,
              restaurantes e oportunidades de compras.
            </p>
          </div>
        </div>
      </section>

      {/* Perfil */}
      <section className="border-t border-white/10 bg-white/[0.025] px-8 py-24 md:px-16">
        <div className="mx-auto max-w-5xl space-y-10 text-lg font-light leading-9 text-white/70">
          <PreviewItem title="Perfil do viajante" text="Casal com 2 filhos maiores de 12 anos" />
          <PreviewItem title="Cidade" text="Kyoto" />
          <PreviewItem title="Estilo de curadoria" text="Alpinea Private" />
          <PreviewItem
            title="Dinâmica do dia"
            text="Motorista privado porta a porta, visita ao Templo do Pavilhão de Ouro pela manhã, Almoço num restaurante menu degustação de wagyu e a noite ir ao festival de Gion."
          />
        </div>
      </section>

      {/* Card do Dia */}
      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="border border-white/10 bg-white/[0.035] px-8 py-8 md:px-10">
            <p className="mb-5 text-xs uppercase tracking-[0.45em] text-white/45">Dia 8</p>
            <h2 className="text-4xl font-light tracking-tight text-white md:text-6xl">Kyoto</h2>
            <p className="mt-6 max-w-3xl text-lg font-light leading-9 text-white/60">
              Pela manhã visita ao Templo do Pavilhão de Ouro (Kinkaku-ji), almoço no Niku Kappou Miyata (Menu Degustação de Wagyu) e a tarde/noite ir até o Gion Matsuri — Saki Matsuri.
            </p>

            {/* Hospedagem */}
            <div className="mt-10 border-t border-white/10 pt-10">
              <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Hospedagem</p>
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.25fr_0.95fr] lg:items-center">
                <div className="flex min-h-40 items-center justify-center px-8 py-10">
                  <Image
                    src="/images/amankyoto.png"
                    alt="Aman Kyoto"
                    width={520}
                    height={260}
                    className="mx-auto h-auto w-full max-w-[260px] object-contain"
                  />
                </div>
                <div>
                  <p className="text-3xl font-light text-white md:text-4xl">Aman Kyoto</p>
                  <p className="mt-5 max-w-2xl text-lg font-light leading-8 text-white/60">
                    1 Okitayama Washimine-cho, Kita Ward, Kyoto, 603-8458, Japão
                  </p>
                </div>
                <div className="grid gap-6 text-base leading-7 text-white/60 sm:grid-cols-2 lg:grid-cols-1">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/35">Noite</p>
                    <p className="text-lg text-white">Primeiro dia em Kyoto</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/35">Código da Reserva</p>
                    <p className="text-sm text-white/45">FS-KYT-4821</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESUMO DO DIA ── */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-16 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="border border-white/10 bg-white/[0.03] p-10">
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">Resumo do Dia 8</p>
            <div className="space-y-6 text-base leading-8 text-white/65">
              <div className="flex items-start gap-6">
                <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">07:30</span>
                <p className="text-white">Café da manhã · The Living Pavilion by Aman</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.07] pt-5">
                <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">08:30</span>
                <p>Motorista Tanaka busca no Aman Kyoto · Toyota Alphard Preto</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.07] pt-5">
                <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">09:00</span>
                <p>Kinkaku-ji · Entrada com assessor · Percurso pelo jardim</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.07] pt-5">
                <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">10:30</span>
                <p>Retorno ao veículo · Deslocamento para o restaurante</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.07] pt-5">
                <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">12:00</span>
                <p className="text-white">Almoço · Niku Kappou Miyata · Menu Degustação de Wagyu</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.07] pt-5">
                <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">14:00</span>
                <p>Retorno ao Aman Kyoto · Descanso</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.07] pt-5">
                <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">18:30</span>
                <p>Motorista privado para o Gion Matsuri</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.07] pt-5">
                <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">19:00</span>
                <p className="text-white">Gion Matsuri · Saki Matsuri · Yatai · Yamaboko iluminadas</p>
              </div>
              <div className="flex items-start gap-6 border-t border-white/[0.07] pt-5">
                <span className="mt-1 shrink-0 text-xs uppercase tracking-[0.25em] text-white/30 w-14">21:30</span>
                <p>Motorista privado — retorno ao Aman Kyoto</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border border-white/10 bg-white/[0.03] p-10">
            <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">Alpinea Private · Suporte no dia</p>
            <p className="text-base leading-8 text-white/60">
              No plano Alpinea Private, um representante da Alpinea estará presente em todos os deslocamentos e atrações, coordenando logística, compra de ingressos, orientação local e comunicação com os estabelecimentos. Suporte de concierge disponível das 08:00 às 22:00 pelo canal de atendimento dedicado.
            </p>
          </div>
        </div>
      </section>

      {/* ── CAFÉ DA MANHÃ — THE LIVING PAVILION ── */}
      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-start">
            {/* Coluna esquerda — detalhes */}
            <div className="space-y-12 text-lg font-light leading-9 text-white/70">
              <div>
                <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Manhã · Café da Manhã</p>
                <h3 className="text-3xl font-light text-white md:text-4xl">The Living Pavilion by Aman</h3>
              </div>

              <div className="border-t border-white/10 pt-10">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Horário</p>
                    <p className="text-white">07:00 às 11:30</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Último acesso</p>
                    <p className="text-white">11:00</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Opções disponíveis</p>
                    <p className="text-white">Japonesa · Ocidental</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Horário sugerido</p>
                    <p className="text-white">07:30 – 08:15</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10 space-y-8">
                <div>
                  <p className="text-white">Comentários</p>
                  <p className="mt-2">
                    O café da manhã pode ser realizado no próprio hotel no restaurante The Living Pavilion by Aman, o restaurante conta com opções tanto ocidentais quanto orientais, caso seja sua primeira vez, importante ressaltar que os japoneses encaram o café da manhã como uma refeição igual o almoço, ou seja, você vai encontrar até peixe grelhado com arroz para comer, como iremos no menu degustação de wagyu no almoço, recomendo realizar uma refeição mais leve.
                  </p>
                  <p className="mt-6">
                    O restaurante conta com boas opções de sobremesa, durante a nossa visita ao pavilhão de ouro (Kinkaku-ji) existem lojas dentro do complexo que vendem sorvetes de macha caso tenha interesse de experimentar.
                  </p>
                </div>
              </div>
            </div>

            {/* Coluna direita — duas fotos + menu como imagem clicável */}
            <div className="lg:sticky lg:top-28 space-y-6">
              <Image
                src="/images/amancafe.jpg"
                alt="Café da manhã — The Living Pavilion by Aman Kyoto"
                width={900}
                height={760}
                priority
                className="w-full rounded-2xl border border-white/10 object-cover"
                style={{ maxHeight: "460px", objectFit: "cover" }}
              />
              <Image
                src="/images/amancafe2.jpg"
                alt="Sobremesa de melão — The Living Pavilion by Aman Kyoto"
                width={900}
                height={760}
                className="w-full rounded-2xl border border-white/10 object-cover"
                style={{ maxHeight: "460px", objectFit: "cover" }}
              />
              <p className="text-xs uppercase tracking-[0.35em] text-white/35">
                The Living Pavilion by Aman · Aman Kyoto
              </p>

              {/* Menu como imagem clicável com zoom */}
              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">Breakfast Menu</p>
                <a href="/images/aman-breakfast.png" target="_blank" rel="noopener noreferrer" className="block">
                  <Image
                    src="/images/aman-breakfast.png"
                    alt="Breakfast Menu — The Living Pavilion by Aman Kyoto"
                    width={900}
                    height={1200}
                    className="w-full cursor-zoom-in rounded-2xl border border-white/10 object-contain bg-white/[0.03] transition hover:opacity-85"
                  />
                </a>
                <p className="mt-3 text-sm leading-7 text-white/45">
                  Menu completo do café da manhã do The Living Pavilion by Aman Kyoto — clique para ampliar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSPORTE PRIVADO ── */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-center">
            {/* Coluna esquerda — detalhes */}
            <div className="space-y-12 text-lg font-light leading-9 text-white/70">
              <div>
                <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Transporte Privado</p>
                <h3 className="text-3xl font-light text-white md:text-4xl">Motorista Dedicado</h3>
              </div>

              <p className="max-w-xl">
                Toda a logística do dia é coordenada pela Alpinea com motorista privado exclusivo para a família. O veículo aguarda na porta do hotel em todos os deslocamentos — sem espera, sem aplicativo, sem imprevisto.
              </p>

              <div className="border-t border-white/10 pt-10">
                <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Dados do Veículo</p>
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Modelo</p>
                    <p className="text-white">Toyota Alphard 2025</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Cor</p>
                    <p className="text-white">Preto Ônix</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Placa</p>
                    <p className="text-white">京都 300 · す 4817</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Motorista</p>
                    <p className="text-white">Tanaka Hiroshi</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Contato direto</p>
                    <p className="text-white/60">+81 75-xxx-xxxx</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Idiomas</p>
                    <p className="text-white/60">Japonês · Inglês básico</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Coluna direita — nameplate + exterior + interior */}
            <div className="lg:sticky lg:top-28 space-y-6">
              {/* Nameplate acima */}
              <Image
                src="/images/asphard-nameplate.png"
                alt="Toyota Alphard — Nameplate"
                width={1320}
                height={440}
                className="w-full object-contain"
              />

              {/* Exterior */}
              <Image
                src="/images/limo.png"
                alt="Toyota Alphard 2025 — Transporte Privado Alpinea"
                width={1320}
                height={880}
                priority
                className="w-full object-contain"
              />

              {/* Interior */}
              <Image
                src="/images/asphard-interior.png"
                alt="Toyota Alphard 2025 — Interior"
                width={1320}
                height={880}
                className="w-full rounded-2xl border border-white/10 object-cover"
              />

              <p className="text-xs uppercase tracking-[0.35em] text-white/35">
                Toyota Alphard 2025 · Preto Ônix · Placa 京都 300 す 4817
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── KINKAKU-JI — MANHÃ ── */}
      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-start">
            {/* Coluna esquerda — detalhes da atração */}
            <div className="space-y-12 text-lg font-light leading-9 text-white/70">
              <div>
                <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Manhã · Atração</p>
                <h3 className="text-3xl font-light text-white md:text-4xl">Kinkaku-ji</h3>
                <p className="mt-3 text-base uppercase tracking-[0.2em] text-white/35">Templo do Pavilhão de Ouro</p>
              </div>

              <p className="max-w-xl">
                Um dos monumentos mais icônicos do Japão e Patrimônio Mundial da UNESCO. O pavilhão de três andares, revestido por folhas de ouro puro, reflete-se sobre o lago Kyōkochi num dos mais fotogênicos cenários do país.
              </p>

              <div className="border-t border-white/10 pt-10">
                <div className="grid gap-8 sm:grid-cols-3">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Chegada sugerida</p>
                    <p className="text-white">09:00</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Tempo estimado</p>
                    <p className="text-white">1h – 1h30</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Ingresso</p>
                    <p className="text-white">¥500 / pessoa</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10">
                <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">Horário de Funcionamento</p>
                <p>09:00 às 17:00 · Todos os dias</p>
              </div>

              <div className="border-t border-white/10 pt-10 space-y-8">
                <InfoBlock
                  title="Por que chegar às 09:00"
                  text="Os ônibus turísticos chegam em volume a partir das 09:30. Nos primeiros 30 minutos há movimento reduzido — é quando a luz da manhã ainda está baixa e o reflexo do pavilhão sobre o lago é mais nítido. Uma diferença visível nas fotos e na experiência geral."
                />
                <InfoBlock
                  title="Percurso dentro do templo"
                  text="O circuito segue um caminho fixo em torno do lago, com o pavilhão sempre à vista. O jardim é do período Muromachi (século XIV) e inclui pedras, pinheiros e ilhotas cuidadosamente posicionados. A saída leva à loja de amuletos (omamori) — vale parar."
                />
                <InfoBlock
                  title="Acesso pela Alpinea"
                  text="O assessor acompanha a família desde a chegada, adquire os ingressos na bilheteria e conduz até a entrada do percurso. Não há filas para compra de ingresso com o assessor na frente."
                />
              </div>
            </div>

            {/* Coluna direita sticky — foto do templo + mapa */}
            <div className="lg:sticky lg:top-28 space-y-10">
              <div>
                <Image
                  src="/images/kinka.jpeg"
                  alt="Kinkaku-ji — Templo do Pavilhão de Ouro, Kyoto"
                  width={900}
                  height={1200}
                  priority
                  className="w-full rounded-2xl border border-white/10 object-cover"
                  style={{ maxHeight: "780px", objectPosition: "center" }}
                />
                <p className="mt-4 text-xs uppercase tracking-[0.35em] text-white/35">
                  Kinkaku-ji · Kita Ward · Kyoto
                </p>
              </div>
              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">Mapa do Templo</p>
                <a href="/images/kinkamap.jpg" target="_blank" rel="noopener noreferrer" className="block">
                  <Image
                    src="/images/kinkamap.jpg"
                    alt="Mapa do Kinkaku-ji"
                    width={1200}
                    height={800}
                    className="w-full cursor-zoom-in rounded-2xl border border-white/10 object-contain bg-white/[0.03] p-2 transition hover:opacity-85"
                  />
                </a>
                <p className="mt-3 text-sm leading-7 text-white/45">
                  Mapa completo do complexo Kinkaku-ji com todas as áreas: Pavilhão de Ouro (Shariden Kinkaku), jardim Muromachi, lago Kyōkochi, casa de chá Sekkatei e portão principal Somon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manhã — Deslocamento (texto curto de transição) */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-20 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Deslocamento</p>
          <div className="max-w-4xl space-y-6 text-lg font-light leading-9 text-white/70">
            <p>
              Após o Kinkaku-ji, o motorista Tanaka aguarda no ponto de desembarque designado. Trajeto até o restaurante é de aproximadamente <span className="text-white">15–20 minutos</span> — tempo suficiente para descanso antes do almoço.
            </p>
          </div>
        </div>
      </section>

      {/* ── ALMOÇO — NIKU KAPPOU MIYATA ── */}
      <section className="border-t border-white/10 px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-start">
            {/* Coluna esquerda — detalhes */}
            <div className="space-y-12 text-lg font-light leading-9 text-white/70">
              <div>
                <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Almoço · Menu Degustação</p>
                <h3 className="text-3xl font-light text-white md:text-4xl">Niku Kappou Miyata</h3>
                <p className="mt-3 text-base uppercase tracking-[0.2em] text-white/35">肉割烹 宮田</p>
              </div>

              <div className="border-t border-white/10 pt-10">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Horário da Reserva</p>
                    <p className="text-white text-xl">12:00</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Formato</p>
                    <p className="text-white">Menu Degustação · Kappou</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Reserva</p>
                    <p className="text-white">Confirmada · Alpinea Private</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Código</p>
                    <p className="text-sm text-white/45">NKM-KYT-0712</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Duração estimada</p>
                    <p className="text-white">Aproximadamente 1h30–2h</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10 space-y-4">
                <p className="text-white">Comentários</p>
                <p>
                  Um dos poucos restaurantes de menu degustação de wagyu no Japão, o chef raramente interage com os clientes preferindo se concentrar no preparo dos pratos, alguns clientes gostam de pedir um whisky japonês como The Chita ou The Yamazaki da Suntory para acompanhar, os pratos na sua grande maioria são porções pequenas, o último prato é um wagyu em pedaços com arroz japonês cozido no próprio calor do arroz, a porção é grande e serve para que o cliente esteja satisfeito ao final da refeição, nossa próxima refeição será somente no jantar durante o festival, então aqui recomendo comer até ficar satisfeito.
                </p>
              </div>
            </div>

            {/* Coluna direita sticky — foto dos cortes */}
            <div className="lg:sticky lg:top-28 space-y-6">
              <Image
                src="/images/niku.png"
                alt="Menu Degustação de Wagyu — Niku Kappou Miyata"
                width={900}
                height={760}
                priority
                className="w-full rounded-2xl border border-white/10 object-cover"
                style={{ maxHeight: "680px", objectPosition: "center" }}
              />
              <Image
                src="/images/nikufood.jpeg"
                alt="Prato do Menu Degustação — Niku Kappou Miyata"
                width={900}
                height={760}
                className="w-full rounded-2xl border border-white/10 object-cover"
                style={{ maxHeight: "500px", objectFit: "cover", objectPosition: "center" }}
              />
              <p className="text-xs uppercase tracking-[0.35em] text-white/35">
                Niku Kappou Miyata · Menu Degustação de Wagyu · Kyoto
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── YOIYAMA, SAKIMATSURI — GION MATSURI ── */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-32 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-start">
            {/* Coluna esquerda — detalhes */}
            <div className="space-y-12 text-lg font-light leading-9 text-white/70">
              <div>
                <p className="mb-8 text-xs uppercase tracking-[0.35em] text-white/40">Tarde · Noite · Festival</p>
                <h3 className="text-3xl font-light text-white md:text-4xl">Yoiyama, Sakimatsuri</h3>
                <p className="mt-3 text-base uppercase tracking-[0.2em] text-white/35">祇園祭 · Gion Matsuri</p>
              </div>

              <div className="border-t border-white/10 pt-10">
                <div className="grid gap-8 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Data</p>
                    <p className="text-white">10 de Julho</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Período</p>
                    <p className="text-white">Saki Matsuri</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Chegada sugerida</p>
                    <p className="text-white">17:00</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/35">Ingresso</p>
                    <p className="text-white">Acesso livre</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-10 space-y-8">
                <InfoBlock
                  title="Visão Geral do Festival"
                  text="O Gion Matsuri, é o maior festival do Japão e dura quase 1 mês desde o momento de preparação o festival é dividido em três etapas Sakimatsuri, Yamahoko Junko e Atomatsuri que basicamente significa respectivamente pré-desfile, desfile e pós-desfile, na minha opinião o ápice do festival não é o dia do desfile em si, mas o dia anterior ao desfile na qual os Hoko (Decorações em forma de lanternas e carros alegóricos) espalhados por todos os quarteirões na frente do templo Yasaka, esse dia é chamado Yoiyama, e é onde iremos essa noite."
                />
                <InfoBlock
                  title="Programação"
                  text="Sairemos do hotel as 17:00 e iremos até a rua mais próxima do complexo e seguiremos a pé até o primeiro Hoko, chamado Niwatori-Hoko, depois seguiremos para o Ayasaka-Hoko e por último iremos ao Funahoko, cada um dos Hokos está localizado em quarteirões diferentes e devido ao alto número de pessoas iremos nos deslocar devagar fazendo paradas para comer nas barracas que servem comida de rua."
                />
                <InfoBlock
                  title="Circuito opcional"
                  text="Caso queiram podemos visitar também Iwatoyama após o circuito dos hokos, os demais hokos são muito parecidos com esses e estão espalhados ao longo dos quarteirões, estamos visitando a noite, pois esse é o horário que as lanternas ficam acessas."
                />
                <InfoBlock
                  title="Logística"
                  text="O motorista Tanaka aguarda em ponto combinado nos arredores do festival. A região central fica fechada para veículos durante o período noturno — o acesso à área é sempre a pé a partir de um ponto próximo designado pela Alpinea."
                />
              </div>

              <div className="border-t border-white/10 pt-10">
                <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/40">Retorno ao hotel</p>
                <p>Motorista privado busca a família por volta das <span className="text-white">21:30 – 22:00</span> no ponto combinado. Tempo de trajeto ao Aman Kyoto: aproximadamente <span className="text-white">20 minutos</span>.</p>
              </div>
            </div>

            {/* Coluna direita sticky — logo + foto do festival + mapa com zoom */}
            <div className="lg:sticky lg:top-28 space-y-6">
              {/* Logo do festival */}
              <Image
                src="/images/logomatsuri.png"
                alt="Gion Matsuri — Logo"
                width={760}
                height={400}
                className="w-full object-contain"
              />

              {/* Foto do festival */}
              <Image
                src="/images/gionmatsuri2.png"
                alt="Gion Matsuri — Yoiyama, Sakimatsuri, Kyoto"
                width={760}
                height={1140}
                priority
                className="w-full rounded-2xl border border-white/10 object-cover"
                style={{ maxHeight: "820px", objectPosition: "center top" }}
              />
              <p className="text-xs uppercase tracking-[0.35em] text-white/35">
                Gion Matsuri · Yoiyama · Sakimatsuri · Shijo · Kyoto · Julho
              </p>

              {/* Mapa da procissão com zoom */}
              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/40">Rota da Procissão Yamahoko</p>
                <a href="/images/masturiroute.png" target="_blank" rel="noopener noreferrer" className="block">
                  <Image
                    src="/images/masturiroute.png"
                    alt="Mapa da rota da procissão Yamahoko — Gion Matsuri"
                    width={800}
                    height={1100}
                    className="w-full cursor-zoom-in rounded-2xl border border-white/10 object-contain bg-white/[0.03] p-2 transition hover:opacity-85"
                  />
                </a>
                <p className="mt-3 text-sm leading-7 text-white/45">
                  Mapa histórico das rotas da procissão Yamahoko Float — Gion Matsuri · Clique para ampliar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="scroll-mt-32 bg-white px-8 py-28 text-black md:px-16"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-black/40">
            Próximo passo
          </p>
          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Uma viagem excepcional começa com uma curadoria excepcional.
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-black/60">
            Compartilhe suas datas, preferências e estilo de viagem. A Alpinea
            estrutura o roteiro a partir do seu perfil.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:wilson@alpinea.io"
              className="border border-black px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-black hover:text-white"
            >
              Entrar em Contato
            </a>
            <a
              href="https://wa.me/5511996691818"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-black/20 px-8 py-4 text-xs uppercase tracking-[0.3em] text-black/70 transition hover:border-black hover:text-black"
            >
              WhatsApp Concierge
            </a>
          </div>
        </div>
      </section>

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
          <div className="flex items-center gap-8 text-xs uppercase tracking-[0.25em] text-white/40">
            <a href="https://www.instagram.com/alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Instagram</a>
            <a href="https://www.youtube.com/@alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">YouTube</a>
            <a href="mailto:wilson@alpinea.io" className="transition hover:text-white">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function PreviewItem({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/40">{title}</p>
      <p>{text}</p>
    </div>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-white">{title}</p>
      <p className="mt-2">{text}</p>
    </div>
  );
}
