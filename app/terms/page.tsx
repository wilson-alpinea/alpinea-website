"use client";

import { useEffect, useState } from "react";

const sections = [
  ["sobre", "01", "Sobre a Alpinea"],
  ["escopo", "02", "Escopo dos serviços"],
  ["journey", "03", "Alpinea Journey"],
  ["private", "04", "Alpinea Private"],
  ["reservas", "05", "Reservas"],
  ["restaurantes", "06", "Restaurantes"],
  ["hospedagem", "07", "Hospedagem"],
  ["passagens", "08", "Passagens aéreas"],
  ["experiencias", "09", "Experiências"],
  ["concierge", "10", "Concierge"],
  ["viajante", "11", "Responsabilidades do viajante"],
  ["alteracoes", "12", "Alterações"],
  ["cancelamentos", "13", "Cancelamentos"],
  ["responsabilidade", "14", "Limitação de responsabilidade"],
  ["dados", "15", "Proteção de dados"],
  ["propriedade", "16", "Propriedade intelectual"],
  ["foro", "17", "Lei aplicável e foro"],
];

const content = [
  {
    id: "sobre",
    number: "01",
    title: "Sobre a Alpinea",
    paragraphs: [
      "A Alpinea é uma consultoria especializada em viagens ao Japão, dedicada ao planejamento, curadoria, orientação e suporte de experiências personalizadas para viajantes que buscam maior profundidade, conveniência, repertório e fluidez durante sua jornada.",
      "Os serviços da Alpinea combinam conhecimento especializado do destino, experiência prática, curadoria independente e suporte consultivo para auxiliar o cliente antes e, quando contratado, durante a viagem.",
      "Ao contratar qualquer serviço da Alpinea, o cliente declara ter lido, compreendido e aceitado estes Termos e Condições de Serviço, que complementam a proposta comercial, o contrato ou qualquer outro documento de contratação aplicável.",
    ],
  },
  {
    id: "escopo",
    number: "02",
    title: "Escopo dos serviços",
    paragraphs: [
      "O escopo exato dos serviços será sempre definido pela proposta comercial aceita pelo cliente. Dependendo do plano contratado, os serviços da Alpinea poderão incluir planejamento personalizado, construção de roteiro digital, curadoria de hotéis, curadoria gastronômica, recomendações culturais, recomendações de compras, planejamento logístico, suporte pré-embarque, concierge remoto e assistência para reservas.",
      "A Alpinea não atua como operadora direta de companhias aéreas, hotéis, restaurantes, atrações, transportadoras, guias, seguradoras, autoridades migratórias ou demais fornecedores terceiros.",
      "Serviços não expressamente incluídos na proposta comercial não serão considerados parte do escopo contratado e poderão ser objeto de cobrança adicional.",
    ],
  },
  {
    id: "journey",
    number: "03",
    title: "Alpinea Journey",
    paragraphs: [
      "O Alpinea Journey é um serviço de consultoria e planejamento personalizado de viagem ao Japão. O serviço pode incluir entrevista inicial, levantamento de preferências, definição de cidades, organização de fluxo da viagem, sugestões de hospedagem, recomendações gastronômicas, atrações, experiências, compras, deslocamentos e construção de roteiro digital.",
      "A Alpinea utiliza seu melhor conhecimento profissional para desenvolver cada roteiro, considerando o perfil do cliente, orçamento estimado, datas, ritmo de viagem, interesses e restrições informadas.",
      "O roteiro representa uma recomendação especializada e não uma garantia absoluta de disponibilidade, funcionamento, confirmação, preço ou acesso a qualquer serviço terceiro mencionado no material entregue.",
    ],
  },
  {
    id: "private",
    number: "04",
    title: "Alpinea Private",
    paragraphs: [
      "O Alpinea Private é um serviço de suporte ampliado e concierge personalizado, destinado a clientes que desejam maior nível de acompanhamento, prioridade operacional e apoio durante etapas específicas da viagem.",
      "Dependendo do plano contratado, poderá incluir atendimento prioritário, suporte remoto durante a viagem, auxílio em reservas, ajustes pontuais de itinerário, suporte para compras, experiências, restaurantes e recomendações adicionais.",
      "O Alpinea Private não substitui assistência médica, jurídica, policial, consular, securitária, psicológica, financeira ou emergencial.",
    ],
  },
  {
    id: "reservas",
    number: "05",
    title: "Reservas e fornecedores terceiros",
    paragraphs: [
      "A Alpinea poderá auxiliar na solicitação, organização ou acompanhamento de reservas junto a restaurantes, hotéis, experiências, atrações, guias, transportes privados e outros fornecedores.",
      "A confirmação de qualquer reserva depende exclusivamente do respectivo fornecedor. A Alpinea não garante disponibilidade, confirmação, upgrade, benefício, assento específico, mesa específica, balcão, sala privativa, categoria de quarto ou qualquer condição que dependa de decisão de terceiros.",
      "Fornecedores poderão exigir dados pessoais, cartão de crédito, pagamento antecipado, depósito, garantia, política de cancelamento, taxa de no-show, horário de chegada, código de vestimenta ou outras regras próprias.",
    ],
  },  {
    id: "restaurantes",
    number: "06",
    title: "Reservas de restaurantes",
    paragraphs: [
      "A Alpinea poderá auxiliar na solicitação de reservas em restaurantes no Japão, incluindo restaurantes de alta demanda, casas premiadas, restaurantes com poucos assentos, balcões de sushi, restaurantes de kaiseki, omakase, tempura, wagyu, ryotei, izakayas selecionados e demais experiências gastronômicas.",
      "Muitos restaurantes no Japão operam com disponibilidade extremamente limitada, reservas fechadas com meses de antecedência, preferência por clientes recorrentes, sistemas internos próprios ou políticas restritivas para novos clientes.",
      "O cliente reconhece que restaurantes poderão aplicar multa de cancelamento, cobrança integral do menu, cobrança por no-show, retenção de depósito ou outras penalidades em caso de atraso, não comparecimento, redução do número de pessoas, alteração de data ou cancelamento fora do prazo permitido.",
    ],
  },
  {
    id: "hospedagem",
    number: "07",
    title: "Hospedagem",
    paragraphs: [
      "A Alpinea poderá recomendar hotéis, ryokans, resorts, hotéis boutique, propriedades de luxo, hospedagens tradicionais e acomodações alinhadas ao perfil da viagem.",
      "As recomendações de hospedagem são realizadas com base em critérios como localização, padrão de serviço, reputação, conveniência logística, estilo de viagem, sazonalidade, orçamento e preferências informadas pelo cliente.",
      "A Alpinea não é proprietária, administradora ou operadora dos hotéis recomendados.",
    ],
  },
  {
    id: "passagens",
    number: "08",
    title: "Passagens aéreas",
    paragraphs: [
      "A Alpinea poderá auxiliar na análise, recomendação ou seleção de voos e itinerários aéreos, quando esse apoio estiver incluído no escopo contratado.",
      "A operação dos voos é responsabilidade exclusiva das companhias aéreas.",
      "O cliente é responsável por conferir nomes, datas, horários, aeroportos, conexões, documentos, vistos, regras de trânsito, franquia de bagagem e demais informações antes da emissão e antes do embarque.",
    ],
  },
  {
    id: "experiencias",
    number: "09",
    title: "Experiências, atrações e atividades",
    paragraphs: [
      "A Alpinea poderá recomendar museus, templos, jardins, tours, experiências culturais, eventos, atrações, parques temáticos, compras, visitas privadas, guias e atividades diversas.",
      "A operação dessas atividades poderá ser realizada por terceiros independentes.",
      "Quando houver necessidade de ingresso, voucher, QR code, reserva, documento ou horário específico, o cliente deverá observar cuidadosamente as instruções fornecidas.",
    ],
  },
  {
    id: "concierge",
    number: "10",
    title: "Concierge e suporte durante a viagem",
    paragraphs: [
      "O suporte durante a viagem estará disponível apenas quando contratado e conforme os canais, horários, prazos e condições definidos na proposta comercial.",
      "O concierge remoto poderá auxiliar com orientações gerais, ajustes pontuais, dúvidas sobre deslocamento, recomendações, comunicação com fornecedores e apoio em situações ordinárias de viagem.",
      "O serviço não constitui atendimento de emergência 24 horas.",
    ],
  },
  {
    id: "viajante",
    number: "11",
    title: "Responsabilidades do viajante",
    paragraphs: [
      "O viajante é responsável por possuir passaporte válido, vistos quando aplicáveis, seguro viagem quando desejado ou exigido, documentação sanitária quando aplicável, meios de pagamento adequados, cartões internacionais, reservas confirmadas e condições pessoais compatíveis com a viagem.",
      "Também é responsabilidade do viajante cumprir as leis do Japão, do Brasil e de qualquer país de conexão ou trânsito.",
      "A Alpinea não responde por recusa de embarque, recusa migratória, deportação, perda de documentos, perda de conexão, atraso do cliente ou descumprimento de regras locais.",
    ],
  },
  {
    id: "alteracoes",
    number: "12",
    title: "Alterações de roteiro",
    paragraphs: [
      "Solicitações de alteração realizadas após o início da execução do projeto ou após a entrega do roteiro poderão gerar cobrança adicional.",
      "Alterações solicitadas pelo cliente poderão impactar reservas, disponibilidade, preços, logística e viabilidade geral do roteiro.",
      "A Alpinea reserva-se o direito de recusar alterações incompatíveis com o escopo contratado.",
    ],
  },
  {
    id: "cancelamentos",
    number: "13",
    title: "Cancelamentos e reembolsos",
    paragraphs: [
      "Os serviços da Alpinea possuem natureza consultiva, intelectual, personalizada e operacional.",
      "Após o início da execução do trabalho, parte ou a totalidade dos valores pagos poderá tornar-se não reembolsável.",
      "Reservas realizadas junto a terceiros estarão sujeitas às políticas específicas de cada fornecedor.",
    ],
  },
  {
    id: "responsabilidade",
    number: "14",
    title: "Limitação de responsabilidade",
    paragraphs: [
      "A Alpinea atua como consultoria, curadora e facilitadora de experiências.",
      "A Alpinea não será responsável por atrasos, cancelamentos, greves, condições climáticas, desastres naturais, pandemias, mudanças governamentais ou falhas operacionais de terceiros.",
      "Nada nestes Termos e Condições exclui direitos obrigatórios previstos na legislação brasileira aplicável ao consumidor.",
    ],
  },
  {
    id: "dados",
    number: "15",
    title: "Proteção de dados e LGPD",
    paragraphs: [
      "A Alpinea poderá coletar e tratar dados pessoais necessários à execução dos serviços contratados.",
      "Os dados serão tratados em conformidade com a Lei Geral de Proteção de Dados, Lei nº 13.709/2018.",
      "Quando necessário para execução dos serviços, determinados dados poderão ser compartilhados com fornecedores envolvidos na viagem.",
    ],
  },
  {
    id: "propriedade",
    number: "16",
    title: "Propriedade intelectual",
    paragraphs: [
      "Todos os materiais produzidos pela Alpinea são protegidos pela legislação de direitos autorais e propriedade intelectual.",
      "O cliente recebe licença de uso pessoal e não comercial dos materiais entregues.",
    ],
  },
  {
    id: "foro",
    number: "17",
    title: "Lei aplicável e foro",
    paragraphs: [
      "Estes Termos e Condições são regidos pelas leis da República Federativa do Brasil.",
      "Fica eleito o foro da Comarca de São Paulo/SP para dirimir eventuais controvérsias relacionadas à contratação dos serviços da Alpinea.",
    ],
  },
];

export default function LegalPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 md:px-16 transition-all duration-700 ${
          scrolled
            ? "bg-black/10 backdrop-blur-2xl"
            : "bg-transparent"
        }`}
      >
        <a href="/" className="text-xl tracking-[0.45em]">
          ALPINEA
        </a>

        <nav className="hidden gap-8 text-xs uppercase tracking-[0.25em] text-white/70 md:flex">
          <a href="/" className="transition hover:text-white">
            Início
          </a>

          <a href="/services" className="transition hover:text-white">
            Serviços
          </a>

          <a href="/preview" className="transition hover:text-white">
            Roteiro
          </a>

          <a href="#contact" className="transition hover:text-white">
            Contato
          </a>
        </nav>
      </header>

      <section className="relative overflow-hidden px-6 pt-40 pb-28 md:px-16">
        <div className="absolute inset-0">
          <img
            src="/images/fuji-bg.jpg"
            alt="Japão"
            className="h-full w-full object-cover opacity-20"
          />

          <div className="absolute inset-0 bg-black/80" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="mb-8 text-xs uppercase tracking-[0.45em] text-white/50">
            ALPINEA
          </p>

          <h1 className="max-w-5xl text-5xl font-light leading-tight md:text-7xl">
            Termos e
            <br />
            Condições de Serviço
          </h1>

          <div className="mt-12 border-l border-white/20 pl-6">
            <p className="text-sm text-white/45">
              Última atualização: Junho de 2026
            </p>
          </div>
        </div>
      </section>      <section className="bg-black px-6 py-28 text-white md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4 border-r border-white/10 pr-10">
              {sections.map(([id, number, title]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-xs uppercase tracking-[0.22em] text-white/45 transition hover:text-white"
                >
                  {number} — {title}
                </a>
              ))}
            </div>
          </aside>

          <div className="max-w-4xl space-y-20">
            {content.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-32 border-t border-white/10 pt-12"
              >
                <p className="mb-5 text-xs uppercase tracking-[0.35em] text-white/40">
                  {section.number}
                </p>

                <h2 className="text-4xl font-light leading-tight text-white md:text-5xl">
                  {section.title}
                </h2>

                <div className="mt-8 space-y-6 text-lg leading-9 text-white/75">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* CONTATO */}

      <section
        id="contact"
        className="border-t border-white/10 bg-black px-8 py-32 md:px-16"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.45em] text-white/40">
            Contato
          </p>

          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Precisa de ajuda?
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/60">
            Nossa equipe terá prazer em esclarecer dúvidas sobre contratação,
            reservas, suporte ou serviços da Alpinea.
          </p>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:wilson@alpinea.io"
              className="border border-white/20 px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-white hover:text-black"
            >
              Entrar em Contato
            </a>

            <a
              href="https://wa.me/5511996691818"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/10 px-8 py-4 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:bg-white hover:text-black"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER IGUAL HOME */}

      <footer className="border-t border-white/10 px-8 py-16 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-12 md:flex-row md:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-white/80">
              ALPINEA
            </p>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/45">
              Curadoria privada de experiências, gastronomia e lifestyle no
              Japão.
            </p>

            <p className="mt-6 text-xs text-white/25">
              © 2026 Alpinea Agências de Viagens LTDA
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs uppercase tracking-[0.25em] text-white/40">
            <a
              href="/"
              className="transition hover:text-white"
            >
              Início
            </a>

            <a
              href="/services"
              className="transition hover:text-white"
            >
              Serviços
            </a>

            <a
              href="/preview"
              className="transition hover:text-white"
            >
              Roteiro
            </a>

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