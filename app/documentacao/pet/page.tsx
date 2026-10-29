"use client";

// /documentacao/pet — exportação de pet Brasil → Japão. A página É o
// formulário (Wilson, 29/out/2026: "nenhuma informação deve ficar fora dos
// formulários"): antes de começar, raças não aceitas, pacote, como
// funciona, prazos e termos ficam dentro das etapas — ver
// SolicitacaoOnline.tsx e InfoSolicitacao.tsx.

import { CabecalhoAjisai, RodapeAjisai, HeroServico, Secao } from "../componentes";
import { SolicitacaoOnline } from "../SolicitacaoOnline";

export default function PetPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white text-black">
      <CabecalhoAjisai />
      <HeroServico
        kicker="Ajisai Pet · Exportação"
        titulo="Seu cão ou gato no Japão, com toda a documentação"
        subtitulo="Microchip, vacinas, sorologia, Import Permit e certificado veterinário internacional — o processo inteiro, com clínicas parceiras em São Paulo, para o seu pet chegar ao Japão sem quarentena. Solicitação 100% online."
        imagem="/images/documentacao-pet.webp"
        alt="Tutora com um cavalier king charles ao lado da caixa de transporte no aeroporto"
        cta={{ href: "#solicitar", rotulo: "Começar a solicitação" }}
      />
      <Secao kicker="Solicitação 100% online" titulo="Comece pelo seu pet" cinza id="solicitar">
        <SolicitacaoOnline servico="pet" />
      </Secao>
      <RodapeAjisai />
    </main>
  );
}
