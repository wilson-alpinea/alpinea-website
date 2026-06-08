"use client";

import { useEffect, useState } from "react";

const sections = [
  ["introducao", "01", "Introdução"],
  ["controladora", "02", "Controladora de dados"],
  ["dados-coletados", "03", "Dados coletados"],
  ["bases-legais", "04", "Bases legais"],
  ["finalidades", "05", "Finalidades do tratamento"],
  ["compartilhamento", "06", "Compartilhamento de dados"],
  ["retencao", "07", "Retenção e exclusão"],
  ["seguranca", "08", "Segurança dos dados"],
  ["cookies", "09", "Cookies e rastreamento"],
  ["direitos", "10", "Direitos do titular"],
  ["menores", "11", "Menores de idade"],
  ["transferencias", "12", "Transferências internacionais"],
  ["atualizacoes", "13", "Atualizações desta Política"],
  ["contato", "14", "Contato e DPO"],
];

const content = [
  {
    id: "introducao",
    number: "01",
    title: "Introdução",
    paragraphs: [
      "A Alpinea Agências de Viagens LTDA ('Alpinea', 'nós', 'nosso') valoriza a privacidade de seus clientes e parceiros e está comprometida com a proteção dos dados pessoais que coleta e trata no exercício de suas atividades.",
      "Esta Política de Privacidade descreve como a Alpinea coleta, utiliza, armazena, compartilha e protege os dados pessoais dos titulares que interagem com seus serviços, site e canais de atendimento, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD), Lei nº 13.709/2018.",
      "Ao contratar os serviços da Alpinea, acessar nosso site ou fornecer seus dados por qualquer canal, o titular declara ter lido e compreendido esta Política de Privacidade.",
    ],
  },
  {
    id: "controladora",
    number: "02",
    title: "Controladora de dados",
    paragraphs: [
      "A controladora responsável pelo tratamento dos dados pessoais é:",
      "Alpinea Agências de Viagens LTDA, inscrita no CNPJ sob o nº 66.491.067/0001-84, com sede em São Paulo/SP.",
      "Para exercer seus direitos ou obter informações sobre o tratamento de seus dados, o titular poderá entrar em contato pelo e-mail wilson@alpinea.io ou pelo WhatsApp +55 11 99669-1818.",
    ],
  },
  {
    id: "dados-coletados",
    number: "03",
    title: "Dados coletados",
    paragraphs: [
      "A Alpinea coleta exclusivamente os dados necessários à prestação dos serviços contratados e ao cumprimento de obrigações legais. Os dados poderão ser coletados diretamente com o titular (por formulários, e-mail, WhatsApp, videochamada ou outros canais de atendimento) ou, quando aplicável, por meio de terceiros autorizados.",
      "Dados de identificação e contato: nome completo, CPF, número de passaporte, data de nascimento, nacionalidade, endereço de e-mail, número de telefone e endereço.",
      "Dados de viagem: datas previstas, cidades de interesse, estilo de viagem, número de acompanhantes, preferências de hospedagem, preferências gastronômicas, lista de restaurantes e experiências de interesse.",
      "Dados sensíveis: restrições alimentares e informações de saúde diretamente relevantes para o planejamento da viagem (ex.: alergias alimentares, necessidades de acessibilidade). Esses dados são coletados exclusivamente mediante consentimento expresso do titular e utilizados somente para as finalidades a que se destinam.",
      "Dados de pagamento: processados por plataformas de pagamento certificadas (PCI-DSS). A Alpinea não armazena dados completos de cartão de crédito.",
      "Dados de navegação: ao acessar o site alpinea.io, poderão ser coletados automaticamente dados como endereço IP, tipo de navegador, páginas visitadas, tempo de permanência e origem do acesso, para fins analíticos e de melhoria da experiência.",
    ],
  },
  {
    id: "bases-legais",
    number: "04",
    title: "Bases legais",
    paragraphs: [
      "O tratamento de dados pessoais pela Alpinea é realizado com fundamento nas seguintes hipóteses legais previstas na LGPD:",
      "Execução de contrato (art. 7º, V): tratamento necessário para prestação dos serviços contratados pelo titular.",
      "Cumprimento de obrigação legal ou regulatória (art. 7º, II): tratamento necessário para cumprir exigências de autoridades públicas, fiscais ou regulatórias.",
      "Legítimo interesse (art. 7º, IX): tratamento para fins analíticos, de segurança e melhoria dos serviços, desde que não prevaleçam sobre os interesses ou direitos fundamentais do titular.",
      "Consentimento (art. 7º, I e art. 11, I): para o tratamento de dados sensíveis e para o envio de comunicações comerciais não relacionadas ao contrato vigente, o tratamento é realizado mediante consentimento expresso do titular, que pode ser revogado a qualquer momento.",
    ],
  },
  {
    id: "finalidades",
    number: "05",
    title: "Finalidades do tratamento",
    paragraphs: [
      "Os dados pessoais coletados pela Alpinea são utilizados exclusivamente para as seguintes finalidades:",
      "Prestação dos serviços contratados: planejamento de roteiro, curadoria gastronômica, reservas em restaurantes e hotéis, organização de logística e demais atividades previstas na proposta comercial.",
      "Comunicação sobre a viagem: envio de materiais, roteiros, confirmações, atualizações, orientações pré-viagem e suporte durante a estadia.",
      "Cumprimento de obrigações legais: atendimento a exigências fiscais, contábeis, regulatórias e de autoridades governamentais.",
      "Melhoria dos serviços: análise de feedback, avaliação da qualidade do atendimento e aprimoramento contínuo das entregas da Alpinea.",
      "Comunicações comerciais: envio de novidades, conteúdos sobre o Japão e informações sobre serviços da Alpinea, exclusivamente mediante consentimento prévio do titular.",
    ],
  },
  {
    id: "compartilhamento",
    number: "06",
    title: "Compartilhamento de dados",
    paragraphs: [
      "A Alpinea não vende, aluga nem comercializa dados pessoais de seus clientes. O compartilhamento de dados ocorre apenas nas situações estritamente necessárias à execução dos serviços ou ao cumprimento de obrigações legais.",
      "Fornecedores de viagem: restaurantes, hotéis, ryokans, transportadoras, guias e demais prestadores de serviços envolvidos na viagem do cliente poderão receber os dados necessários à realização das reservas e prestação dos serviços (ex.: nome, passaporte, restrições alimentares). Esses fornecedores atuam como controladores ou operadores independentes e possuem suas próprias políticas de privacidade.",
      "Plataformas de pagamento: dados de pagamento são processados por plataformas certificadas, que atuam como operadoras sob padrões internacionais de segurança.",
      "Autoridades públicas: dados poderão ser fornecidos a autoridades governamentais, judiciais ou regulatórias quando exigido por lei ou ordem judicial.",
      "Ferramentas operacionais: a Alpinea poderá utilizar ferramentas de gestão, comunicação e armazenamento em nuvem (ex.: Google Workspace, ferramentas de CRM). Esses fornecedores de tecnologia estão contratualmente vinculados a padrões adequados de proteção de dados.",
    ],
  },
  {
    id: "retencao",
    number: "07",
    title: "Retenção e exclusão",
    paragraphs: [
      "Os dados pessoais são mantidos pelo período estritamente necessário ao cumprimento das finalidades para as quais foram coletados.",
      "Durante a vigência do contrato de serviços: todos os dados necessários à execução e suporte da viagem são mantidos ativos.",
      "Após o encerramento do contrato: os dados são mantidos por 5 (cinco) anos para cumprimento de obrigações legais, contratuais e fiscais, salvo prazo diverso exigido por legislação específica.",
      "Dados de comunicações comerciais: mantidos até a revogação do consentimento pelo titular.",
      "Após o encerramento do prazo de retenção aplicável, os dados serão eliminados ou anonimizados de forma segura, salvo obrigação legal que exija sua manutenção.",
    ],
  },
  {
    id: "seguranca",
    number: "08",
    title: "Segurança dos dados",
    paragraphs: [
      "A Alpinea adota medidas técnicas e organizacionais adequadas para proteger os dados pessoais contra acesso não autorizado, perda, alteração, divulgação indevida ou destruição.",
      "As medidas incluem controle de acesso restrito a dados pessoais, uso de ferramentas com criptografia em trânsito e em repouso, armazenamento em plataformas com certificações de segurança reconhecidas e treinamento e conscientização de colaboradores e prestadores de serviços.",
      "Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, a Alpinea comunicará a Autoridade Nacional de Proteção de Dados (ANPD) e os titulares afetados nos prazos e condições previstos pela LGPD.",
    ],
  },
  {
    id: "cookies",
    number: "09",
    title: "Cookies e rastreamento",
    paragraphs: [
      "O site alpinea.io poderá utilizar cookies e tecnologias similares para melhorar a experiência de navegação, analisar o tráfego e personalizar conteúdo.",
      "Cookies essenciais: necessários ao funcionamento básico do site. Não podem ser desativados.",
      "Cookies analíticos: coletam informações sobre como os visitantes utilizam o site (ex.: Google Analytics), de forma agregada e anonimizada. Utilizados somente com o consentimento do usuário.",
      "Cookies de marketing: utilizados para personalizar comunicações e rastrear a eficácia de campanhas. Utilizados somente com o consentimento do usuário.",
      "O titular pode gerenciar suas preferências de cookies por meio das configurações do navegador ou pelo painel de consentimento disponível no site. A desativação de determinados cookies poderá impactar funcionalidades do site.",
    ],
  },
  {
    id: "direitos",
    number: "10",
    title: "Direitos do titular",
    paragraphs: [
      "Nos termos da LGPD, o titular dos dados pessoais possui os seguintes direitos, que podem ser exercidos a qualquer momento mediante solicitação à Alpinea:",
      "Confirmação e acesso: obter confirmação de que seus dados são tratados e ter acesso aos dados mantidos pela Alpinea.",
      "Correção: solicitar a correção de dados incompletos, inexatos ou desatualizados.",
      "Anonimização, bloqueio ou eliminação: solicitar a anonimização, o bloqueio ou a eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD.",
      "Portabilidade: solicitar a portabilidade dos seus dados a outro fornecedor de serviço ou produto.",
      "Informação sobre compartilhamento: obter informações sobre com quem a Alpinea compartilhou seus dados.",
      "Revogação do consentimento: revogar consentimentos previamente concedidos, sem prejuízo da licitude do tratamento realizado antes da revogação.",
      "Oposição: opor-se ao tratamento realizado com fundamento em outras bases legais que não o consentimento, em caso de descumprimento da LGPD.",
      "Solicitações devem ser encaminhadas ao e-mail wilson@alpinea.io com o assunto 'Direitos LGPD', com identificação do titular. A Alpinea responderá em até 15 (quinze) dias úteis.",
    ],
  },
  {
    id: "menores",
    number: "11",
    title: "Menores de idade",
    paragraphs: [
      "Os serviços da Alpinea são direcionados a adultos. A Alpinea não coleta dados pessoais de menores de 18 anos de forma intencional sem o consentimento de seus responsáveis legais.",
      "Quando crianças ou adolescentes fizerem parte de uma viagem planejada pela Alpinea, os dados eventualmente necessários serão coletados diretamente dos responsáveis legais, para as finalidades exclusivas de execução dos serviços.",
    ],
  },
  {
    id: "transferencias",
    number: "12",
    title: "Transferências internacionais",
    paragraphs: [
      "Em razão da natureza dos serviços prestados, a execução da viagem ao Japão implica o compartilhamento de dados com fornecedores localizados no exterior, especialmente no Japão.",
      "Nesses casos, a Alpinea adota as salvaguardas cabíveis, incluindo cláusulas contratuais específicas de proteção de dados com os fornecedores envolvidos, quando aplicável.",
      "O titular declara ciência de que, ao contratar serviços que envolvam reservas ou operações no exterior, seus dados poderão ser transferidos a fornecedores internacionais sujeitos à legislação local de seus países.",
    ],
  },
  {
    id: "atualizacoes",
    number: "13",
    title: "Atualizações desta Política",
    paragraphs: [
      "Esta Política de Privacidade poderá ser atualizada periodicamente para refletir mudanças nas práticas da Alpinea, nas legislações aplicáveis ou nos serviços oferecidos.",
      "A versão vigente estará sempre disponível no site alpinea.io, com indicação da data da última atualização.",
      "Em caso de alterações relevantes que impactem os direitos dos titulares, a Alpinea comunicará os clientes ativos pelos canais disponíveis.",
    ],
  },
  {
    id: "contato",
    number: "14",
    title: "Contato e DPO",
    paragraphs: [
      "Para dúvidas, solicitações ou reclamações relacionadas ao tratamento de dados pessoais pela Alpinea, o titular poderá contatar:",
      "Encarregado de Proteção de Dados (DPO): Wilson Kageyama — wilson@alpinea.io",
      "O titular também poderá apresentar reclamação diretamente à Autoridade Nacional de Proteção de Dados (ANPD), por meio dos canais oficiais disponíveis em gov.br/anpd.",
    ],
  },
];

export default function PrivacyPage() {
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
          scrolled ? "bg-black/10 backdrop-blur-2xl" : "bg-transparent"
        }`}
      >
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

      <section className="relative overflow-hidden px-6 pt-40 pb-28 md:px-16">
        <div className="absolute inset-0 bg-black" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="mb-8 text-xs uppercase tracking-[0.45em] text-white/50">
            ALPINEA
          </p>
          <h1 className="max-w-5xl text-5xl font-light leading-tight md:text-7xl">
            Política de
            <br />
            Privacidade
          </h1>
          <div className="mt-12 border-l border-white/20 pl-6">
            <p className="text-sm text-white/45">
              Última atualização: Junho de 2026
            </p>
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-28 text-white md:px-16">
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

      <section
        id="contact"
        className="border-t border-black/10 bg-white px-8 py-32 text-black md:px-16"
      >
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.45em] text-black/40">
            Contato
          </p>
          <h2 className="text-4xl font-light leading-tight md:text-6xl">
            Precisa de ajuda?
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-black/60">
            Para dúvidas sobre privacidade, exercício de direitos LGPD ou
            qualquer questão relacionada ao tratamento de seus dados pessoais.
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
              WhatsApp
            </a>
          </div>
        </div>
      </section>
 <footer className="border-t border-white/10 bg-black px-8 py-16 text-white md:px-16">
  <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:items-end">

    {/* Coluna esquerda */}
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.45em] text-white/80">
        Alpinea
      </p>

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
