"use client";

import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Página de dúvidas frequentes — pedido do Wilson, 16/set/2026, em 3
// pedidos separados que convergem pro mesmo lugar: link de bagagem na
// seção Aéreo, link de termos/elegibilidade no JR Pass, e link de
// apólice/condições no Seguro Viagem — todos linkados a partir do PDF/
// Word da proposta (ver PacotePdf.tsx, EXPLICACOES_ITEM). Em vez de 3
// PDFs soltos e sem conteúdo, uma única página com âncoras por assunto —
// mais fácil de manter e de linkar.
//
// Conteúdo de bagagem e elegibilidade do JR Pass é informação geral
// (pesquisa set/2026, fontes: japanrailpass.net/en/about_jrp/riyou,
// jrailpass.com/eligibility) — francia de bagagem varia por companhia
// aérea/tarifa, então o texto orienta a sempre confirmar com a companhia
// antes de embarcar. A seção de Seguro Viagem ainda não tem a apólice
// completa anexada — Wilson vai enviar o documento real da seguradora;
// até lá, fica descrita a cobertura padrão já usada no site.
export default function DuvidasFrequentesPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4 md:px-10">
          <Link href="/produtos">
            <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-9 w-auto object-contain invert md:h-10" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-20">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Ajisai</p>
        <h1 className={`${display.className} mt-3 text-3xl font-medium leading-tight text-black md:text-4xl`}>
          Dúvidas frequentes
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-light leading-6 text-black/55">
          Respostas rápidas sobre bagagem, JR Pass e seguro viagem — os itens da sua proposta que
          mais geram dúvida antes da viagem.
        </p>

        <nav className="mt-8 flex flex-wrap gap-2 border-y border-black/10 py-4 text-xs">
          <a href="#bagagem" className="rounded-full border border-black/15 px-3.5 py-1.5 text-black/60 transition hover:border-black/30">
            Bagagem
          </a>
          <a href="#jr-pass" className="rounded-full border border-black/15 px-3.5 py-1.5 text-black/60 transition hover:border-black/30">
            JR Pass — termos e elegibilidade
          </a>
          <a href="#seguro-viagem" className="rounded-full border border-black/15 px-3.5 py-1.5 text-black/60 transition hover:border-black/30">
            Seguro viagem
          </a>
        </nav>

        {/* ── BAGAGEM ── */}
        <div id="bagagem" className="mt-10 scroll-mt-24 border-t border-black/10 pt-8">
          <h2 className={`${display.className} text-xl font-medium text-black md:text-2xl`}>
            Bagagem — tamanhos e o que pode levar
          </h2>
          <p className="mt-3 text-sm leading-6 text-black/60">
            As franquias abaixo são a referência padrão do mercado em voos internacionais de
            longo curso — cada companhia aérea tem sua própria política, então o time Ajisai
            sempre confirma os limites exatos assim que a passagem é emitida.
          </p>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-black/70">
            Bagagem despachada
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/60">
            Em geral, até 23 kg por mala em Economy/Premium Economy (podendo chegar a 32 kg em
            Business/First, conforme a companhia), com a soma das três dimensões (altura + largura
            + profundidade) não passando de aproximadamente 158 cm. Malas ou itens acima do peso ou
            do tamanho da franquia costumam gerar taxa extra — por isso o campo &quot;Bagagem&quot;
            na proposta já estima esse custo quando o cliente pede 2 malas ou item grande/especial.
          </p>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-black/70">
            Bagagem de mão
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/60">
            Normalmente 1 mala de até 10 kg (dimensões próximas de 55 × 40 × 20 cm) mais 1 item
            pessoal menor (mochila, bolsa ou notebook). Líquidos na bagagem de mão seguem a regra
            internacional de recipientes de até 100 ml, todos dentro de 1 saco transparente.
          </p>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-black/70">
            O que não pode levar
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/60">
            Itens perfurocortantes, armas, inflamáveis, explosivos e a maioria dos objetos com
            bateria de lítio solta (power banks, baterias reserva) só podem ir na bagagem de mão,
            nunca na despachada — e sempre com limite de capacidade. Em caso de dúvida sobre um
            item específico, o time Ajisai confirma direto com a companhia aérea antes do embarque.
          </p>
        </div>

        {/* ── JR PASS ── */}
        <div id="jr-pass" className="mt-10 scroll-mt-24 border-t border-black/10 pt-8">
          <h2 className={`${display.className} text-xl font-medium text-black md:text-2xl`}>
            JR Pass — termos e condições de elegibilidade
          </h2>
          <p className="mt-3 text-sm leading-6 text-black/60">
            O Japan Rail Pass é vendido só para quem se enquadra nas regras oficiais da JR — vale
            a pena confirmar antes de incluir o item na proposta.
          </p>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-black/70">
            Turistas estrangeiros
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/60">
            É preciso entrar no Japão com status de &quot;Temporary Visitor&quot; (turista de curta
            estadia) carimbado no passaporte. Outros vistos — trabalho, estágio, entretenimento
            etc. — não dão direito ao passe. Importante: quem passa pelo portão automático de
            imigração não recebe o carimbo automaticamente — é preciso pedir o carimbo manual no
            balcão pra ter o comprovante exigido na retirada do passe.
          </p>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-black/70">
            Japoneses residentes no exterior
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/60">
            Cidadãos japoneses que moram fora do Japão também podem comprar o passe, mas só pela
            modalidade &quot;Purchase Overseas&quot; (compra antecipada fora do Japão) e mediante
            comprovação de residência no exterior nos últimos 6 meses — documentação específica,
            avaliada caso a caso.
          </p>

          <h3 className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-black/70">
            Não elegíveis
          </h3>
          <p className="mt-2 text-sm leading-6 text-black/60">
            Cidadãos japoneses residentes no Japão não têm direito ao passe — ele é exclusivo para
            visitantes vindos de fora do país.
          </p>

          <p className="mt-4 text-[11px] leading-5 text-black/35">
            Regras conforme o site oficial do Japan Rail Pass (japanrailpass.net), consultado em
            setembro de 2026 — sujeitas a alteração pela JR sem aviso prévio. O time Ajisai
            confirma a elegibilidade de cada passageiro antes da emissão.
          </p>
        </div>

        {/* ── SEGURO VIAGEM ── */}
        <div id="seguro-viagem" className="mt-10 scroll-mt-24 border-t border-black/10 pt-8">
          <h2 className={`${display.className} text-xl font-medium text-black md:text-2xl`}>
            Seguro viagem — apólice padrão e condições de uso
          </h2>
          <p className="mt-3 text-sm leading-6 text-black/60">
            Cobertura médico-hospitalar (mínimo de US$ 30 mil, com opção de upgrade para US$ 60
            mil), bagagem extraviada ou danificada (mínimo de US$ 750), cancelamento de viagem e
            assistência 24 horas em português por telefone ou WhatsApp — item obrigatório em todos
            os pacotes Ajisai.
          </p>
          {/* Placeholder — pedido do Wilson, 16/set/2026: "adicionar link
              para apólice padrão e condições de uso (depois envio os
              documentos, deixar placeholder)". Substituir este aviso por
              um link real (<Link href="/documentos/apolice-padrao-seguro-viagem.pdf">)
              assim que o Wilson enviar o PDF da apólice da seguradora. */}
          <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50/60 p-4 text-xs leading-5 text-amber-800">
            O documento completo da apólice (condições gerais da seguradora) está sendo preparado
            e será publicado aqui em breve. Enquanto isso, o time Ajisai envia o PDF da apólice
            diretamente ao cliente antes da emissão do seguro.
          </p>
        </div>
      </section>
    </main>
  );
}
