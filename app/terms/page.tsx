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

export default function TermosPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 md:px-16 transition-all duration-700 ${
          scrolled ? "bg-black/20 backdrop-blur-2xl" : "bg-transparent"
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

      <section className="relative overflow-hidden px-6 pt-40 pb-32 md:px-16">
        <div className="absolute inset-0">
          <img
            src="/images/fuji-bg.jpg"
            alt="Japão"
            className="h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
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

          <p className="mt-10 max-w-3xl text-lg leading-9 text-white/65">
            Informações importantes sobre a contratação dos serviços da
            Alpinea, incluindo escopo, responsabilidades, reservas,
            alterações, cancelamentos, proteção de dados e demais condições
            aplicáveis.
          </p>

          <div className="mt-12 border-l border-white/20 pl-6">
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">
              Acesso, execução e curadoria do Japão.
            </p>
            <p className="mt-4 text-sm text-white/40">
              Última atualização: Junho de 2026
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-28 text-black md:px-16">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-4">
              {sections.map(([id, number, title]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-xs uppercase tracking-[0.22em] text-black/35 transition hover:text-black"
                >
                  {number} — {title}
                </a>
              ))}
            </div>
          </aside>

          <div className="max-w-4xl space-y-24">
            <LegalSection id="sobre" number="01" title="Sobre a Alpinea">
              <p>
                A Alpinea é uma consultoria especializada em viagens ao Japão,
                dedicada ao planejamento, curadoria, orientação e suporte de
                experiências personalizadas para viajantes que buscam maior
                profundidade, conveniência, repertório e fluidez durante sua
                jornada.
              </p>
              <p>
                Os serviços da Alpinea combinam conhecimento especializado do
                destino, experiência prática, curadoria independente e suporte
                consultivo para auxiliar o cliente antes e, quando contratado,
                durante a viagem.
              </p>
              <p>
                Ao contratar qualquer serviço da Alpinea, o cliente declara ter
                lido, compreendido e aceitado estes Termos e Condições de
                Serviço, que complementam a proposta comercial, o contrato ou
                qualquer outro documento de contratação aplicável.
              </p>
            </LegalSection>

            <LegalSection id="escopo" number="02" title="Escopo dos serviços">
              <p>
                O escopo exato dos serviços será sempre definido pela proposta
                comercial aceita pelo cliente. Dependendo do plano contratado,
                os serviços da Alpinea poderão incluir planejamento
                personalizado, construção de roteiro digital, curadoria de
                hotéis, curadoria gastronômica, recomendações culturais,
                recomendações de compras, planejamento logístico, suporte
                pré-embarque, concierge remoto e assistência para reservas.
              </p>
              <p>
                A Alpinea não atua como operadora direta de companhias aéreas,
                hotéis, restaurantes, atrações, transportadoras, guias,
                seguradoras, autoridades migratórias ou demais fornecedores
                terceiros. Quando houver intermediação, recomendação ou apoio
                operacional, a execução final dependerá das regras,
                disponibilidade e confirmação dos respectivos fornecedores.
              </p>
              <p>
                Serviços não expressamente incluídos na proposta comercial não
                serão considerados parte do escopo contratado e poderão ser
                objeto de cobrança adicional.
              </p>
            </LegalSection>

            <LegalSection id="journey" number="03" title="Alpinea Journey">
              <p>
                O Alpinea Journey é um serviço de consultoria e planejamento
                personalizado de viagem ao Japão. O serviço pode incluir
                entrevista inicial, levantamento de preferências, definição de
                cidades, organização de fluxo da viagem, sugestões de hospedagem,
                recomendações gastronômicas, atrações, experiências, compras,
                deslocamentos e construção de roteiro digital.
              </p>
              <p>
                A Alpinea utiliza seu melhor conhecimento profissional para
                desenvolver cada roteiro, considerando o perfil do cliente,
                orçamento estimado, datas, ritmo de viagem, interesses e
                restrições informadas.
              </p>
              <p>
                O roteiro representa uma recomendação especializada e não uma
                garantia absoluta de disponibilidade, funcionamento,
                confirmação, preço ou acesso a qualquer serviço terceiro
                mencionado no material entregue.
              </p>
            </LegalSection>

            <LegalSection id="private" number="04" title="Alpinea Private">
              <p>
                O Alpinea Private é um serviço de suporte ampliado e concierge
                personalizado, destinado a clientes que desejam maior nível de
                acompanhamento, prioridade operacional e apoio durante etapas
                específicas da viagem.
              </p>
              <p>
                Dependendo do plano contratado, poderá incluir atendimento
                prioritário, suporte remoto durante a viagem, auxílio em
                reservas, ajustes pontuais de itinerário, suporte para compras,
                experiências, restaurantes e recomendações adicionais.
              </p>
              <p>
                O Alpinea Private não substitui assistência médica, jurídica,
                policial, consular, securitária, psicológica, financeira ou
                emergencial. Situações de emergência devem ser direcionadas às
                autoridades locais, consulados, seguradoras, hospitais ou
                prestadores especializados.
              </p>
            </LegalSection>

            <LegalSection id="reservas" number="05" title="Reservas e fornecedores terceiros">
              <p>
                A Alpinea poderá auxiliar na solicitação, organização ou
                acompanhamento de reservas junto a restaurantes, hotéis,
                experiências, atrações, guias, transportes privados e outros
                fornecedores.
              </p>
              <p>
                A confirmação de qualquer reserva depende exclusivamente do
                respectivo fornecedor. A Alpinea não garante disponibilidade,
                confirmação, upgrade, benefício, assento específico, mesa
                específica, balcão, sala privativa, categoria de quarto,
                tratamento especial ou qualquer condição que dependa de decisão
                de terceiros.
              </p>
              <p>
                Fornecedores poderão exigir dados pessoais, cartão de crédito,
                pagamento antecipado, depósito, garantia, política de
                cancelamento, taxa de no-show, horário de chegada, código de
                vestimenta ou outras regras próprias. O cliente é responsável
                pelo cumprimento dessas regras.
              </p>
            </LegalSection>

            <LegalSection id="restaurantes" number="06" title="Reservas de restaurantes">
              <p>
                A Alpinea poderá auxiliar na solicitação de reservas em
                restaurantes no Japão, incluindo restaurantes de alta demanda,
                casas premiadas, restaurantes com poucos assentos, balcões de
                sushi, restaurantes de kaiseki, omakase, tempura, wagyu,
                ryotei, izakayas selecionados e demais experiências
                gastronômicas.
              </p>
              <p>
                Muitos restaurantes no Japão operam com disponibilidade
                extremamente limitada, reservas fechadas com meses de
                antecedência, preferência por clientes recorrentes, sistemas
                internos próprios ou políticas restritivas para novos clientes.
                Por esse motivo, nenhuma solicitação de reserva deve ser
                interpretada como reserva confirmada até que haja confirmação
                expressa do estabelecimento.
              </p>
              <p>
                O cliente reconhece que restaurantes poderão aplicar multa de
                cancelamento, cobrança integral do menu, cobrança por no-show,
                retenção de depósito ou outras penalidades em caso de atraso,
                não comparecimento, redução do número de pessoas, alteração de
                data ou cancelamento fora do prazo permitido.
              </p>
              <p>
                Em restaurantes de alta gastronomia, o cliente também deverá
                respeitar regras de pontualidade, comportamento, alergias
                previamente informadas, restrições alimentares aceitas ou
                recusadas pela casa, uso de perfume, fotografia, filmagem,
                crianças, vestimenta e demais políticas internas.
              </p>
            </LegalSection>

            <LegalSection id="hospedagem" number="07" title="Hospedagem">
              <p>
                A Alpinea poderá recomendar hotéis, ryokans, resorts, hotéis
                boutique, propriedades de luxo, hospedagens tradicionais e
                acomodações alinhadas ao perfil da viagem.
              </p>
              <p>
                As recomendações de hospedagem são realizadas com base em
                critérios como localização, padrão de serviço, reputação,
                conveniência logística, estilo de viagem, sazonalidade,
                orçamento e preferências informadas pelo cliente.
              </p>
              <p>
                A Alpinea não é proprietária, administradora ou operadora dos
                hotéis recomendados. Tarifas, disponibilidade, benefícios,
                categorias, reformas, regras de check-in, check-out, café da
                manhã, taxas locais, cobranças extras e políticas de
                cancelamento são definidas exclusivamente por cada hospedagem.
              </p>
            </LegalSection>

            <LegalSection id="passagens" number="08" title="Passagens aéreas">
              <p>
                A Alpinea poderá auxiliar na análise, recomendação ou seleção de
                voos e itinerários aéreos, quando esse apoio estiver incluído no
                escopo contratado.
              </p>
              <p>
                A operação dos voos é responsabilidade exclusiva das companhias
                aéreas. Horários, conexões, aeronaves, assentos, franquia de
                bagagem, regras tarifárias, cancelamentos, atrasos,
                reacomodações e alterações operacionais são definidos pelas
                companhias aéreas e pela legislação aplicável.
              </p>
              <p>
                O cliente é responsável por conferir nomes, datas, horários,
                aeroportos, conexões, documentos, vistos, regras de trânsito,
                franquia de bagagem e demais informações antes da emissão e
                antes do embarque.
              </p>
            </LegalSection>

            <LegalSection id="experiencias" number="09" title="Experiências, atrações e atividades">
              <p>
                A Alpinea poderá recomendar museus, templos, jardins, tours,
                experiências culturais, eventos, atrações, parques temáticos,
                compras, visitas privadas, guias e atividades diversas.
              </p>
              <p>
                A operação dessas atividades poderá ser realizada por terceiros
                independentes. Datas, horários, funcionamento, disponibilidade,
                lotação, clima, manutenção, regras de entrada, idioma,
                acessibilidade e cancelamentos podem variar sem aviso prévio.
              </p>
              <p>
                Quando houver necessidade de ingresso, voucher, QR code,
                reserva, documento ou horário específico, o cliente deverá
                observar cuidadosamente as instruções fornecidas.
              </p>
            </LegalSection>

            <LegalSection id="concierge" number="10" title="Concierge e suporte durante a viagem">
              <p>
                O suporte durante a viagem estará disponível apenas quando
                contratado e conforme os canais, horários, prazos e condições
                definidos na proposta comercial.
              </p>
              <p>
                O concierge remoto poderá auxiliar com orientações gerais,
                ajustes pontuais, dúvidas sobre deslocamento, recomendações,
                comunicação com fornecedores e apoio em situações ordinárias de
                viagem.
              </p>
              <p>
                O serviço não constitui atendimento de emergência 24 horas,
                serviço médico, serviço de segurança pessoal, representação
                legal, assistência consular ou garantia de resolução imediata de
                problemas causados por terceiros.
              </p>
            </LegalSection>

            <LegalSection id="viajante" number="11" title="Responsabilidades do viajante">
              <p>
                O viajante é responsável por possuir passaporte válido, vistos
                quando aplicáveis, seguro viagem quando desejado ou exigido,
                documentação sanitária quando aplicável, meios de pagamento
                adequados, cartões internacionais, reservas confirmadas e
                condições pessoais compatíveis com a viagem.
              </p>
              <p>
                Também é responsabilidade do viajante cumprir as leis do Japão,
                do Brasil e de qualquer país de conexão ou trânsito, bem como
                observar regras migratórias, alfandegárias, fiscais, sanitárias,
                comportamentais e culturais.
              </p>
              <p>
                A Alpinea não responde por recusa de embarque, recusa
                migratória, deportação, perda de documentos, perda de conexão,
                atraso do cliente, descumprimento de regras locais ou
                impossibilidade de utilização de serviços por falha documental
                ou conduta do viajante.
              </p>
            </LegalSection>

            <LegalSection id="alteracoes" number="12" title="Alterações de roteiro">
              <p>
                Solicitações de alteração realizadas após o início da execução
                do projeto ou após a entrega do roteiro poderão gerar cobrança
                adicional, conforme complexidade, urgência, tempo necessário e
                escopo originalmente contratado.
              </p>
              <p>
                Alterações solicitadas pelo cliente poderão impactar reservas,
                disponibilidade, preços, logística, tempo de deslocamento,
                recomendações anteriores e viabilidade geral do roteiro.
              </p>
              <p>
                A Alpinea reserva-se o direito de recusar alterações que sejam
                incompatíveis com o escopo contratado, inviáveis dentro do prazo
                disponível ou que dependam de condições fora de seu controle.
              </p>
            </LegalSection>

            <LegalSection id="cancelamentos" number="13" title="Cancelamentos e reembolsos">
              <p>
                Os serviços da Alpinea possuem natureza consultiva, intelectual,
                personalizada e operacional. Após o início da execução do
                trabalho, parte ou a totalidade dos valores pagos poderá tornar-se
                não reembolsável, de acordo com o estágio de desenvolvimento do
                projeto, horas investidas, entregas realizadas e condições
                previstas na proposta comercial.
              </p>
              <p>
                Reservas realizadas junto a terceiros estarão sujeitas às
                políticas específicas de cada fornecedor. Hotéis, restaurantes,
                companhias aéreas, atrações, guias, transportes e experiências
                poderão aplicar multas, taxas, retenções, depósitos não
                reembolsáveis ou cobrança integral em caso de cancelamento,
                alteração ou não comparecimento.
              </p>
              <p>
                O cancelamento da viagem pelo cliente não implica,
                automaticamente, reembolso dos serviços já prestados pela
                Alpinea ou de valores cobrados por terceiros.
              </p>
            </LegalSection>

            <LegalSection id="responsabilidade" number="14" title="Limitação de responsabilidade">
              <p>
                A Alpinea atua como consultoria, curadora e facilitadora de
                experiências. Sua responsabilidade limita-se à execução dos
                serviços contratados diretamente com a Alpinea, conforme escopo
                acordado.
              </p>
              <p>
                A Alpinea não será responsável por atrasos, cancelamentos,
                greves, condições climáticas, desastres naturais, pandemias,
                mudanças governamentais, restrições migratórias, falhas
                operacionais de terceiros, overbooking, indisponibilidade,
                alterações de preço, perda de bagagem, acidentes, problemas de
                saúde, perda de documentos ou qualquer evento fora de seu
                controle razoável.
              </p>
              <p>
                Nada nestes Termos e Condições exclui direitos obrigatórios
                previstos na legislação brasileira aplicável ao consumidor.
              </p>
            </LegalSection>

            <LegalSection id="dados" number="15" title="Proteção de dados e LGPD">
              <p>
                A Alpinea poderá coletar e tratar dados pessoais necessários à
                execução dos serviços contratados, incluindo nome, contato,
                preferências de viagem, datas, informações de acompanhantes,
                restrições alimentares, necessidades específicas e demais dados
                relevantes ao planejamento da viagem.
              </p>
              <p>
                Os dados serão tratados em conformidade com a Lei Geral de
                Proteção de Dados, Lei nº 13.709/2018, para fins de prestação
                dos serviços, comunicação com o cliente, execução de reservas,
                cumprimento de obrigações legais e melhoria da experiência.
              </p>
              <p>
                Quando necessário para execução dos serviços, determinados dados
                poderão ser compartilhados com hotéis, restaurantes,
                transportadoras, guias, plataformas de reserva e demais
                fornecedores envolvidos na viagem.
              </p>
            </LegalSection>

            <LegalSection id="propriedade" number="16" title="Propriedade intelectual">
              <p>
                Todos os materiais produzidos pela Alpinea, incluindo roteiros,
                mapas, guias, curadorias, textos, recomendações, documentos,
                apresentações, arquivos digitais, fotografias próprias e
                materiais de apoio são protegidos pela legislação de direitos
                autorais e propriedade intelectual.
              </p>
              <p>
                O cliente recebe licença de uso pessoal e não comercial dos
                materiais entregues. É proibida a reprodução, revenda,
                redistribuição, publicação, adaptação comercial ou utilização dos
                materiais para prestação de serviços a terceiros sem autorização
                expressa da Alpinea.
              </p>
            </LegalSection>

            <LegalSection id="foro" number="17" title="Lei aplicável e foro">
              <p>
                Estes Termos e Condições são regidos pelas leis da República
                Federativa do Brasil.
              </p>
              <p>
                Fica eleito o foro da Comarca de São Paulo/SP para dirimir
                eventuais controvérsias relacionadas à contratação dos serviços
                da Alpinea, salvo quando a legislação aplicável determinar foro
                diverso.
              </p>
            </LegalSection>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-black px-6 py-28 text-white md:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.4em] text-white/40">
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
              className="inline-block border border-white/30 px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-white hover:text-black"
            >
              Entrar em Contato
            </a>

            <a
              href="https://wa.me/5511996691818"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-white/20 px-8 py-4 text-xs uppercase tracking-[0.3em] transition hover:bg-white hover:text-black"
            >
              WhatsApp Concierge
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-6 py-16 text-white md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.45em] text-white/80">
              ALPINEA
            </p>

            <p className="mt-4 text-sm leading-relaxed text-white/50">
              Acesso, execução e curadoria do Japão.
            </p>

            <p className="mt-6 text-xs text-white/30">
              © 2026 Alpinea Agências de Viagens LTDA — CNPJ
              66.491.067/0001-84
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-xs uppercase tracking-[0.25em] text-white/40">
            <a href="/" className="transition hover:text-white">
              Início
            </a>

            <a href="/services" className="transition hover:text-white">
              Serviços
            </a>

            <a href="/preview" className="transition hover:text-white">
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
          </div>
        </div>
      </footer>
    </main>
  );
}

function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-black/10 pt-16">
      <p className="mb-6 text-xs uppercase tracking-[0.35em] text-black/35">
        {number}
      </p>

      <h2 className="text-4xl font-light leading-tight md:text-5xl">
        {title}
      </h2>

      <div className="mt-10 space-y-6 text-lg font-light leading-9 text-black/70">
        {children}
      </div>
    </section>
  );
}