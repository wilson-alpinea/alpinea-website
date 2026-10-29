"use client";

// /documentacao/visto — visto específico. A página É o formulário (Wilson,
// 29/out/2026: "nenhuma informação deve ficar fora dos formulários ... as
// páginas, elas são formulários"): quem pode pedir, valores, o que está
// incluso, como funciona, prazos e termos ficam dentro das etapas — ver
// SolicitacaoOnline.tsx e InfoSolicitacao.tsx. Banner: foto do visto
// escurecida em verde no fundo + foto quadrada à direita.

import { CabecalhoAjisai, RodapeAjisai, HeroServico, Secao } from "../componentes";
import { SolicitacaoOnline } from "../SolicitacaoOnline";

export default function VistoPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white text-black">
      <CabecalhoAjisai />
      <HeroServico
        kicker="Documentação · Visto"
        titulo="Visto específico para o Japão"
        subtitulo="O visto para descendentes de japoneses e suas famílias. Preparamos a documentação, damos entrada no consulado e enviamos o passaporte com o visto para a sua casa. Solicitação e pagamento 100% online."
        fundo="/images/documentacao-visto-banner.webp"
        imagem="/images/documentacao-visto.webp"
        alt="Consultora entregando o passaporte com o visto"
        cta={{ href: "#solicitar", rotulo: "Começar a solicitação" }}
      />
      <Secao kicker="Solicitação 100% online" titulo="Solicite o seu visto" cinza id="solicitar">
        <SolicitacaoOnline servico="visto" />
      </Secao>
      <RodapeAjisai />
    </main>
  );
}
