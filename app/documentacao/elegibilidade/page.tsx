"use client";

// /documentacao/elegibilidade — Certificado de Elegibilidade (COE). A página
// É o formulário (Wilson, 29/out/2026: "nenhuma informação deve ficar fora
// dos formulários"): o que é, valores, o que está incluso, como funciona,
// garantidor, prazos e termos ficam dentro das etapas — ver
// SolicitacaoOnline.tsx e InfoSolicitacao.tsx. Banner: foto do certificado
// escurecida em verde no fundo + foto quadrada da consultora à direita.

import { CabecalhoAjisai, RodapeAjisai, HeroServico, Secao } from "../componentes";
import { SolicitacaoOnline } from "../SolicitacaoOnline";

export default function ElegibilidadePage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white text-black">
      <CabecalhoAjisai />
      <HeroServico
        kicker="Documentação · Elegibilidade"
        titulo="Certificado de Elegibilidade"
        subtitulo="O documento emitido pela imigração do Japão que libera o visto específico em cerca de 2 semanas. Cuidamos do processo no Japão, com despachante credenciado na imigração e atendimento em português. Solicitação e pagamento 100% online."
        fundo="/images/documentacao-elegibilidade-banner.webp"
        imagem="/images/documentacao-elegibilidade.webp"
        alt="Consultora preenchendo o formulário do certificado com a cliente"
        cta={{ href: "#solicitar", rotulo: "Começar a solicitação" }}
      />
      <Secao kicker="Solicitação 100% online" titulo="Solicite o seu certificado" cinza id="solicitar">
        <SolicitacaoOnline servico="elegibilidade" />
      </Secao>
      <RodapeAjisai />
    </main>
  );
}
