import Image from "next/image";

export const metadata = {
  title: "Alpinea | Assessoria de Compras — Facas de Cozinha",
  description:
    "Curadoria Alpinea para aquisição de facas de cozinha profissionais no Japão: Masamoto, Aritsugu e Kikumori.",
};

export default function GuiaFacasPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-black/10 px-8 py-5 backdrop-blur-2xl md:px-16">
        <a href="/" className="text-xl tracking-[0.45em]">
          ALPINEA
        </a>
        <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
          <a href="/" className="transition hover:text-white">Início</a>
          <a href="/services" className="transition hover:text-white">Serviços</a>
          <a href="/preview" className="transition hover:text-white">Roteiro</a>
          <a href="#contact" className="transition hover:text-white">Contato</a>
        </nav>
      </header>

      {/* Hero — fullscreen com imagem de fundo, igual /gastro */}
      <section className="relative min-h-screen flex flex-col justify-end pb-20 md:pb-28">
        {/* Imagem de fundo */}
        <div className="absolute inset-0">
          <Image
            src="/images/blacksmith.png"
            alt="Artesão forjando faca japonesa"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        </div>

        {/* Conteúdo sobreposto */}
        <div className="relative px-8 md:px-16">
          <div className="mx-auto max-w-7xl">
            <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/40">
              Assessoria de Compras · Alpinea Private
            </p>
            <h1 className="text-5xl font-light leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Curadoria<br />de Aquisição
            </h1>
            <p className="mt-8 max-w-lg text-base font-light leading-8 text-white/55">
              Produtos de elite no Japão — identificados, selecionados e adquiridos com acesso direto aos artesãos.
            </p>
          </div>
        </div>
      </section>

      {/* O Mercado — vídeo grande à esquerda, stats à direita */}
      <section className="mt-0">
        <div className="grid lg:grid-cols-2 lg:min-h-[700px]">
          {/* Esquerda — vídeo */}
          <div className="relative min-h-[400px] overflow-hidden lg:min-h-full">
            <video
              src="/videos/kiku-graving.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
          </div>

          {/* Direita — label, título, stats */}
          <div className="flex flex-col justify-center bg-black px-8 py-20 md:px-14">
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">O Mercado</p>
            <h2 className="text-3xl font-light text-white leading-snug md:text-4xl">
              Comprar bem no Japão<br />é um ofício à parte.
            </h2>

            <div className="mt-12 space-y-0">
              <div className="border-t border-white/10 py-8 grid gap-6 grid-cols-[100px_1fr] items-start">
                <p className="text-3xl font-light text-white/20 tabular-nums leading-none pt-0.5">+1.000</p>
                <div>
                  <p className="text-white font-light text-sm leading-6">fabricantes de facas no Japão</p>
                  <p className="mt-2 text-xs leading-6 text-white/45">
                    A grande maioria produz para o mercado de consumo ou para o circuito turístico — onde a aparência da tradição substitui a tradição real.
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 py-8 grid gap-6 grid-cols-[100px_1fr] items-start">
                <p className="text-3xl font-light text-white/20 tabular-nums leading-none pt-0.5">~30</p>
                <div>
                  <p className="text-white font-light text-sm leading-6">fabricantes de elite com acesso real</p>
                  <p className="mt-2 text-xs leading-6 text-white/45">
                    Menos de 3% opera no nível de aço, forja e acabamento que os melhores chefs do Japão utilizam. Identificá-los exige anos de relação direta com cozinhas de referência.
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 py-8 grid gap-6 grid-cols-[100px_1fr] items-start">
                <div className="leading-none pt-0.5">
                  <p className="text-3xl font-light text-white/20 tabular-nums leading-none">2</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/20 mt-1">anos</p>
                </div>
                <div>
                  <p className="text-white font-light text-sm leading-6">fila nos artesãos mais procurados</p>
                  <p className="mt-2 text-xs leading-6 text-white/45">
                    Artesãos como Futaba Shokai operam com fila superior a dois anos. Acesso direto sem intermediação qualificada é simplesmente impossível.
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-8">
                <p className="text-xs leading-6 text-white/30 italic">
                  A assessoria Alpinea existe para eliminar esse atrito — e para garantir que o cliente chegue à loja certa, com o artesão certo, no momento em que o instrumento está disponível.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Briefing do cliente */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">Caso Executado</p>
              <h2 className="text-3xl font-light text-white md:text-4xl">Perfil do cliente</h2>
            </div>
            <div className="space-y-6 text-base font-light leading-9 text-white/60">
              <p>
                Colecionador e praticante de cozinha japonesa com mais de uma década de ofício. Conhece os instrumentos, domina as técnicas — mas chegou ao limite do que o mercado brasileiro e as plataformas de importação conseguem oferecer.
              </p>
              <p>
                Diante da densidade de marcas de segunda linha em pontos turísticos e do volume de propaganda direcionada a estrangeiros, o cliente optou por não comprar sem orientação especializada — e sem garantia de acesso direto ao fabricante.
              </p>
              <div className="border-t border-white/10 pt-8">
                <p className="mb-5 text-xs uppercase tracking-[0.25em] text-white/30">Escopo da assessoria</p>
                <div className="space-y-3 text-sm leading-7 text-white/55">
                  <p>1. Adquirir três facas de uso profissional distinto, com acesso direto aos fabricantes</p>
                  <p>2. Afiar uma faca artesanal em uso, com artesão selecionado pela Alpinea</p>
                  <p>3. Garantir disponibilidade imediata — sem filas, sem intermediários comerciais</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Execução */}
      <section className="border-t border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">Execução</p>
              <h2 className="text-3xl font-light text-white md:text-4xl">Seleção</h2>
              <p className="mt-6 text-sm font-light leading-8 text-white/45">
                Com base em 12 anos de relação direta com os chefs dos restaurantes líderes no Japão — sushi, contemporâneo e kaiseki — identificamos três fabricantes com disponibilidade imediata de peças e presença confirmada nas melhores cozinhas do país.
              </p>
              <p className="mt-4 text-sm font-light leading-8 text-white/35">
                Nenhum dos três vende para distribuidores. O acesso é feito por relação pessoal com os artesãos.
              </p>

              <div className="mt-10 border-t border-white/10 pt-10">
                <p className="mb-4 text-xs uppercase tracking-[0.35em] text-white/35">Afiação</p>
                <h3 className="text-xl font-light text-white">Faca artesanal</h3>
                <div className="mt-4 space-y-4 text-sm font-light leading-8 text-white/50">
                  <p>
                    A faca artesanal em uso no ateliê do cliente será entregue no primeiro dia de viagem ao afiador da Masamoto em Tokyo — um dos poucos artesãos que ainda pratica a afiação manual tradicional com pedras d'água de diferentes granulometrias.
                  </p>
                  <p>
                    O prazo necessário para afiação pelo artesão é de <span className="text-white/80">14 dias</span>. A faca será retirada no último dia de viagem, antes do retorno ao Brasil.
                  </p>
                </div>
              </div>
            </div>

            {/* Direita — facas */}
            <div className="space-y-0">
              <p className="mb-10 text-xs uppercase tracking-[0.35em] text-white/35">Seleção recomendada</p>

              <div className="border-t border-white/10 py-10 grid gap-8 sm:grid-cols-[1fr_1.2fr] items-center">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Uso geral</p>
                  <h3 className="text-2xl font-light text-white">Gyuto <span className="text-white/30 text-base ml-2">牛刀</span></h3>
                  <p className="mt-4 text-sm leading-7 text-white/55">
                    Faca versátil de uso cotidiano. Adaptada da tradição francesa pelo Japão, executa cortes precisos em carnes, vegetais e peixes com a mesma eficiência.
                  </p>
                </div>
                <div className="relative">
                  <Image
                    src="/images/gyuto.png"
                    alt="Gyuto — Masamoto"
                    width={700}
                    height={420}
                    className="w-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 py-10 grid gap-8 sm:grid-cols-[1fr_1.2fr] items-center">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Corte de peixe</p>
                  <h3 className="text-2xl font-light text-white">Yanagiba <span className="text-white/30 text-base ml-2">柳刃</span></h3>
                  <p className="mt-4 text-sm leading-7 text-white/55">
                    Lâmina longa e fina para corte de sashimi. Projetada para movimento único — do calcanhar à ponta — com mínima fricção e máxima precisão no corte.
                  </p>
                </div>
                <div className="relative">
                  <Image
                    src="/images/yanagiba.png"
                    alt="Yanagiba — Aritsugu"
                    width={700}
                    height={420}
                    className="w-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>

              <div className="border-t border-white/10 py-10 grid gap-8 sm:grid-cols-[1fr_1.2fr] items-center">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/30">Trabalho pesado</p>
                  <h3 className="text-2xl font-light text-white">Deba <span className="text-white/30 text-base ml-2">出刃</span></h3>
                  <p className="mt-4 text-sm leading-7 text-white/55">
                    Faca robusta para desossagem de peixes inteiros. Espessura da espinha permite extrair partes com corte único sem comprometer o fio.
                  </p>
                </div>
                <div className="relative">
                  <Image
                    src="/images/deba.png"
                    alt="Deba — Kikumori"
                    width={700}
                    height={420}
                    className="w-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roteiro */}
      <section className="border-t border-white/10 bg-white/[0.02] px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="mb-12 text-xs uppercase tracking-[0.35em] text-white/35">Roteiro de Compras</p>

          <div className="mb-16 grid grid-cols-3 gap-6">
            <div className="aspect-square flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <Image
                src="/images/masamoto-logo.png"
                alt="Gravação Masamoto na lâmina"
                width={420}
                height={420}
                className="h-full w-full object-cover rounded-xl"
              />
            </div>
            <div className="aspect-square flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <Image
                src="/images/aritsugu-logo.png"
                alt="Gravação Aritsugu na lâmina"
                width={420}
                height={420}
                className="h-full w-full object-cover rounded-xl"
              />
            </div>
            <div className="aspect-square flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-8">
              <Image
                src="/images/kikumori-logo.png"
                alt="Gravação Kikumori na lâmina"
                width={420}
                height={420}
                className="h-full w-full object-cover rounded-xl"
              />
            </div>
          </div>
          <div className="mb-16 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-light text-white/60">正本</p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/25">Masamoto</p>
            </div>
            <div>
              <p className="text-2xl font-light text-white/60">有次</p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/25">Aritsugu</p>
            </div>
            <div>
              <p className="text-2xl font-light text-white/60">菊守</p>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/25">Kikumori</p>
            </div>
          </div>

          <div className="space-y-0">
            <div className="grid gap-10 border-t border-white/10 py-10 lg:grid-cols-[180px_1fr] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/25">Dia 1</p>
                <p className="mt-1 text-sm text-white/50">Tokyo</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-white font-light text-lg">Masamoto</p>
                  <p className="mt-2 text-sm leading-7 text-white/55">
                    Visita à loja principal da Masamoto em Tokyo. Seleção e aquisição da Gyuto. Entrega da faca artesanal para afiação ao artesão da casa — retirada programada para o dia 14.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-3 border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/35">
                    <span>Gyuto</span>
                    <span className="text-white/15">·</span>
                    <span>Afiação entregue</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-10 border-t border-white/10 py-10 lg:grid-cols-[180px_1fr] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/25">Dia 8</p>
                <p className="mt-1 text-sm text-white/50">Kyoto</p>
              </div>
              <div>
                <p className="text-white font-light text-lg">Aritsugu</p>
                <p className="mt-2 text-sm leading-7 text-white/55">
                  Visita à loja histórica da Aritsugu no Mercado Nishiki. Fundada em 1560 para fornecer instrumentos à corte imperial, a casa permanece sob a mesma família há mais de quatro séculos. Seleção e aquisição da Yanagiba com acompanhamento direto do artesão na escolha do aço.
                </p>
                <div className="mt-5 inline-flex items-center gap-3 border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/35">
                  <span>Yanagiba</span>
                </div>
              </div>
            </div>

            <div className="grid gap-10 border-t border-white/10 py-10 lg:grid-cols-[180px_1fr] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/25">Dia 10</p>
                <p className="mt-1 text-sm text-white/50">Sakai</p>
              </div>
              <div>
                <p className="text-white font-light text-lg">Kikumori</p>
                <p className="mt-2 text-sm leading-7 text-white/55">
                  Visita à Kikumori em Sakai — origem de mais de 90% das facas utilizadas por chefs profissionais no Japão. A casa não opera canais de venda para o público externo; o acesso é feito exclusivamente por meio de relação direta com os artesãos. Seleção e aquisição da Deba.
                </p>
                <div className="mt-5 inline-flex items-center gap-3 border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/35">
                  <span>Deba</span>
                </div>
              </div>
            </div>

            <div className="grid gap-10 border-t border-white/10 py-10 lg:grid-cols-[180px_1fr] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/25">Dia 14</p>
                <p className="mt-1 text-sm text-white/50">Tokyo</p>
              </div>
              <div>
                <p className="text-white font-light text-lg">Masamoto · Retirada</p>
                <p className="mt-2 text-sm leading-7 text-white/55">
                  Retirada da faca artesanal após afiação completa. Inspeção do fio junto ao artesão antes do retorno ao Brasil.
                </p>
                <div className="mt-5 inline-flex items-center gap-3 border border-white/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-white/35">
                  <span>Afiação retirada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Investimento */}
      <section className="border-t border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-20 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">Investimento</p>
              <h2 className="text-3xl font-light text-white md:text-4xl">Projeção</h2>
              <p className="mt-6 text-sm font-light leading-8 text-white/40">
                Valores estimados para modelos de entrada profissional de cada fabricante. Peças com aço superior (Shirogami Nº1, Aogami Super) ou acabamentos especiais têm preços significativamente mais elevados e disponibilidade ainda mais restrita.
              </p>
              <p className="mt-4 text-xs leading-6 text-white/25">
                Câmbio de referência: ¥1 = R$ 0,037 · Jun/2026
              </p>
            </div>

            <div>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-5 text-xs uppercase tracking-[0.3em] text-white/30 font-normal">Faca</th>
                    <th className="pb-5 text-xs uppercase tracking-[0.3em] text-white/30 font-normal">Fabricante</th>
                    <th className="pb-5 text-right text-xs uppercase tracking-[0.3em] text-white/30 font-normal">Ienes</th>
                    <th className="pb-5 text-right text-xs uppercase tracking-[0.3em] text-white/30 font-normal">Reais</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-light leading-9 text-white/65">
                  <tr className="border-b border-white/[0.07]">
                    <td className="py-5">
                      Gyuto
                      <span className="block text-xs text-white/30">240mm · Hagane</span>
                    </td>
                    <td className="py-5 text-white/40">Masamoto</td>
                    <td className="py-5 text-right text-white">¥ 35.000 – 55.000</td>
                    <td className="py-5 text-right text-white">R$ 1.295 – 2.035</td>
                  </tr>
                  <tr className="border-b border-white/[0.07]">
                    <td className="py-5">
                      Yanagiba
                      <span className="block text-xs text-white/30">270mm · Shirogami</span>
                    </td>
                    <td className="py-5 text-white/40">Aritsugu</td>
                    <td className="py-5 text-right text-white">¥ 45.000 – 80.000</td>
                    <td className="py-5 text-right text-white">R$ 1.665 – 2.960</td>
                  </tr>
                  <tr className="border-b border-white/[0.07]">
                    <td className="py-5">
                      Deba
                      <span className="block text-xs text-white/30">180mm · Hagane</span>
                    </td>
                    <td className="py-5 text-white/40">Kikumori</td>
                    <td className="py-5 text-right text-white">¥ 30.000 – 50.000</td>
                    <td className="py-5 text-right text-white">R$ 1.110 – 1.850</td>
                  </tr>
                  <tr className="border-b border-white/[0.07]">
                    <td className="py-5">
                      Afiação artesanal
                      <span className="block text-xs text-white/30">Pedra d'água · 14 dias</span>
                    </td>
                    <td className="py-5 text-white/40">Masamoto</td>
                    <td className="py-5 text-right text-white">¥ 8.000 – 15.000</td>
                    <td className="py-5 text-right text-white">R$ 296 – 555</td>
                  </tr>
                  <tr>
                    <td className="pt-8 pb-4 text-white/80" colSpan={2}>
                      Total estimado
                      <span className="block text-xs text-white/30 mt-1">Sem honorários Alpinea</span>
                    </td>
                    <td className="pt-8 pb-4 text-right text-white font-light">¥ 118.000 – 200.000</td>
                    <td className="pt-8 pb-4 text-right text-white font-light">R$ 4.366 – 7.400</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-10 border border-white/10 bg-white/[0.025] p-8">
                <p className="mb-3 text-xs uppercase tracking-[0.3em] text-white/30">Nota sobre imposto de importação</p>
                <p className="text-sm leading-7 text-white/50">
                  Facas de cozinha para uso profissional estão sujeitas à tributação na entrada no Brasil. A Alpinea orienta o cliente sobre a melhor forma de documentação e declaração antes do retorno. Valores de impostos não estão incluídos na projeção acima.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conclusão */}
      <section className="border-t border-white/10 px-8 py-28 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[1fr_420px] lg:items-start">
            <div>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-white/35">Resultado</p>
              <h2 className="text-3xl font-light text-white md:text-4xl">O que não estava no roteiro</h2>

              <div className="mt-10 space-y-6 text-base font-light leading-9 text-white/60">
                <p>
                  A visita à Kikumori em Sakai foi planejada para a aquisição de uma única Deba. O cliente chegou à oficina sem expectativa além do escopo original.
                </p>
                <p>
                  No ateliê, o artesão apresentou uma linha recém-lançada de acabamento espelhado — o <span className="text-white/90">Choyo</span> — ainda sem distribuição fora do Japão e não documentada em nenhum canal internacional. O polimento é executado manualmente em múltiplas etapas, resultando em uma superfície que reflete como aço cirúrgico, mantendo o núcleo de Aogami Super intacto.
                </p>
                <p>
                  O cliente, ao ver e segurar as peças pela primeira vez, decidiu ampliar a compra no ato.
                </p>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-px border border-white/10">
                <div className="bg-white/[0.03] px-6 py-8">
                  <p className="text-2xl font-light text-white">1</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/30">faca planejada</p>
                </div>
                <div className="bg-white/[0.03] px-6 py-8">
                  <p className="text-2xl font-light text-white">3</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/30">facas adquiridas</p>
                </div>
                <div className="bg-white/[0.03] px-6 py-8">
                  <p className="text-2xl font-light text-white">Choyo</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/30">acabamento inédito</p>
                </div>
              </div>

              <p className="mt-10 text-sm leading-7 text-white/35 italic">
                Esse tipo de descoberta — um lançamento ainda sem nome fora do Japão, acessado no dia em que está disponível — é o que diferencia uma visita guiada de uma compra por conta própria.
              </p>
            </div>

            <div className="lg:sticky lg:top-32">
              <div className="overflow-hidden rounded-2xl">
                <Image
                  src="/images/kikufinal.jpeg"
                  alt="Três facas Kikumori Choyo adquiridas pelo cliente em Sakai"
                  width={840}
                  height={1120}
                  className="w-full object-cover"
                />
              </div>
              <p className="mt-4 text-xs leading-6 text-white/25 text-center">
                As três peças Kikumori · Acabamento Choyo · Sakai, Osaka
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="scroll-mt-32 border-t border-white/10 bg-white px-8 py-28 text-black md:px-16"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-black/35">
            Próximo passo
          </p>
          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Pronto para iniciar a assessoria?
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-base leading-9 text-black/50">
            Entre em contato para alinhar datas, escopo de viagem e detalhes da seleção.
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
              className="border border-black/15 px-8 py-4 text-xs uppercase tracking-[0.3em] text-black/50 transition hover:border-black hover:text-black"
            >
              WhatsApp Concierge
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-8 py-16 text-white md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:items-end">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.45em] text-white/70">Alpinea</p>
            <div className="max-w-md space-y-3">
              <p className="text-sm leading-relaxed text-white/40">
                Curadoria privada de experiências, gastronomia e lifestyle no Japão.
              </p>
              <p className="text-xs text-white/25">
                © 2026 Alpinea Agências de Viagens LTDA — CNPJ 66.491.067/0001-84
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/20">
                <a href="/legal" className="transition hover:text-white/50">Termos e Condições</a>
                <span>·</span>
                <a href="/privacy" className="transition hover:text-white/50">Política de Privacidade</a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-8 text-xs uppercase tracking-[0.25em] text-white/35">
            <a href="https://www.instagram.com/alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">Instagram</a>
            <a href="https://www.youtube.com/@alpinea.private" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">YouTube</a>
            <a href="mailto:wilson@alpinea.io" className="transition hover:text-white">Contato</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
