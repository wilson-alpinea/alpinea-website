"use client";

// /documentacao/elegibilidade — Certificado de Elegibilidade (COE), Wilson,
// 29/out/2026. Valor final em ienes (pacote fechado, nunca aberto por item);
// referência em reais pela PTAX do dia ("pode usar PTAX para o câmbio em
// real ... para o check out em reais"). Pagamento 50% + 50%.

import Link from "next/link";
import { formatJPY } from "../../hooks/useCambioUSD";
import { CabecalhoAjisai, RodapeAjisai, HeroServico, Secao, ListaCheck, Etapas, Prazos, Termos, VERDE } from "../componentes";
import { TERMOS_VISTO_COE, COE_FAMILIA_JPY, COE_INDIVIDUAL_JPY } from "../conteudo";
import { SolicitacaoOnline } from "../SolicitacaoOnline";

// Solicitação 100% online (Wilson, 29/out/2026): passos numerados como a
// candidatura de /empregos, 50% pela Stone na contratação e registro no CRM
// de Documentação — ver SolicitacaoOnline.tsx. Banner com a foto do
// certificado e degradê verde-escuro.

export default function ElegibilidadePage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white text-black">
      <CabecalhoAjisai />
      <HeroServico
        kicker="Documentação · Elegibilidade"
        titulo="Certificado de Elegibilidade"
        subtitulo="O documento emitido pela imigração do Japão que libera o visto específico em cerca de 2 semanas. Cuidamos do processo no Japão, com advogado de imigração e atendimento em português. Solicitação e pagamento 100% online."
        fundo="/images/documentacao-elegibilidade-banner.webp"
        cta={{ href: "#solicitar", rotulo: "Solicitar online" }}
      />

      {/* Formulário logo depois do banner (Wilson, 29/out/2026: "quantidade de pré-etapas é gigante, elas devem ser etapa 1"). */}
      <Secao kicker="Solicitação 100% online" titulo="Solicite o seu certificado" cinza id="solicitar">
        <SolicitacaoOnline servico="elegibilidade" />
      </Secao>

      <Secao kicker="O que é" titulo="Um garantidor no Japão, oficializado pela imigração">
        <div className="grid gap-6 md:grid-cols-2">
          <p className="text-sm leading-7 text-black/70">
            O Certificado de Elegibilidade (COE) é pedido na imigração do Japão — não no consulado. Um parente ou responsável que mora no Japão, o
            garantidor, declara que vai responder pelo solicitante perante a imigração. Com o certificado em mãos no Brasil, o consulado emite o visto em
            cerca de 2 semanas.
          </p>
          <div className="rounded-2xl border border-black/10 bg-[#F6F7F5] p-5">
            <p className="text-sm font-medium text-black">Normalmente precisa do certificado quem:</p>
            <ListaCheck
              className="mt-3"
              itens={[
                "Mora fora da região do Consulado de São Paulo (SP, MS e Triângulo Mineiro)",
                "Não tem contrato de trabalho no Japão",
                "Vai como cônjuge ou como filho dependente",
              ]}
            />
          </div>
        </div>
      </Secao>

      <Secao kicker="Valores" titulo="Valor final do pacote" cinza id="valor">
        <p className="text-sm leading-6 text-black/65">
          O certificado é a etapa do visto específico — exclusivo para descendentes até a 3ª geração, cônjuges e dependentes. Valor fechado, em ienes, cobrado em
          reais pela PTAX do dia de cada pagamento: 50% na contratação e 50% antes da entrada na imigração.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["1 descendente", COE_INDIVIDUAL_JPY.descendente],
            ["1 cônjuge", COE_INDIVIDUAL_JPY.conjuge],
            ...Object.entries(COE_FAMILIA_JPY).map(([n, v]) => [`${n} pessoas`, v] as [string, number]),
          ].map(([rotulo, valor]) => (
            <div key={rotulo as string} className="rounded-xl border border-black/10 bg-white p-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.15em] text-black/45">{rotulo}</p>
              <p className="mt-1 text-sm font-medium text-black">{formatJPY(valor as number)}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-black/50">Para 6 pessoas ou mais, o valor é sob consulta.</p>
      </Secao>

      <Secao kicker="O que está incluso" titulo="Do Brasil à imigração do Japão — e de volta" cinza>
        <ListaCheck
          itens={[
            "Orientação dos documentos para você e para o garantidor no Japão",
            "Traduções oficiais e elaboração de declarações",
            "Advogado de imigração cadastrado para dar entrada presencial — o garantidor não precisa faltar no trabalho",
            "Acompanhamento das solicitações da imigração, traduzidas para o português",
            "Busca e emissão do koseki tohon no Japão",
            "Postagem expressa Japão ⇄ Brasil (DHL ou UPS) pelo malote da Ajisai",
            "Atendimento da equipe Ajisai em todas as etapas",
          ]}
        />
        <p className="mt-4 text-xs text-black/45">Não inclui o envio por Sedex dentro do Brasil.</p>
      </Secao>

      <Secao kicker="Como funciona" titulo="Etapas até o certificado no Brasil">
        <Etapas
          itens={[
            { titulo: "Solicitação online", texto: "Cadastro, garantidor, ficha e documentos, aqui no site." },
            { titulo: "Contrato e pagamento", texto: "Aceite eletrônico e primeiros 50% pela Stone." },
            { titulo: "Lista de documentos", texto: "Para você e para o garantidor." },
            { titulo: "Documentos no Japão", texto: "Conferência e traduções." },
            { titulo: "Entrada na imigração", texto: "Segundos 50% antes do protocolo." },
            { titulo: "Emissão do certificado", texto: "Acompanhamento até a decisão." },
            { titulo: "Envio para o Brasil", texto: "Pronto para pedir o visto." },
          ]}
        />
        <p className="mt-5 text-sm text-black/60">
          Com o certificado em mãos, o próximo passo é o <Link href="/documentacao/visto" className="underline" style={{ color: VERDE }}>visto específico</Link>.
        </p>
      </Secao>

      <Secao kicker="O garantidor" titulo="O que aumenta as chances de aprovação" cinza>
        <ListaCheck
          itens={[
            "Garantidor com mais de 3 meses de residência no Japão, legalmente e com status de residente de longo prazo ou permanente",
            "Parentesco o mais próximo possível (pai, mãe, irmão ou irmã)",
            "Garantidor trabalhando, de preferência há mais de 3 meses, com holerites sem descontos de financiamento",
            "Renda acima de ¥200 mil brutos por mês",
            "Sem auxílio do governo japonês por invalidez, sem impostos atrasados na prefeitura e sem antecedentes criminais no Japão",
          ]}
        />
        <p className="mt-4 text-xs leading-5 text-black/50">Mais de 2 solicitantes sem parentes próximos no Japão são casos de risco maior e passam por uma análise mais cuidadosa.</p>
      </Secao>

      <Secao kicker="Prazos estimados" titulo="Quanto tempo leva">
        <Prazos
          itens={[
            { etapa: "Preparo da documentação", prazo: "3 a 6 semanas (média de 4)" },
            { etapa: "Envio dos documentos para o Japão", prazo: "1 a 2 semanas" },
            { etapa: "Imigração, da entrada até a emissão", prazo: "cerca de 3 meses, em média" },
          ]}
          nota="A imigração não trabalha com prazo definido — os prazos são estimativas."
        />
        <div className="mt-6">
          <Termos
            clausulas={[
              ...TERMOS_VISTO_COE,
              ["Validade do certificado", "O certificado tem validade de 90 dias e não garante a emissão do visto, embora aumente muito as chances."],
            ]}
          />
        </div>
      </Secao>

      <RodapeAjisai />
    </main>
  );
}
