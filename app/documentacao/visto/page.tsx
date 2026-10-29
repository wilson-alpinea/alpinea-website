"use client";

// /documentacao/visto — visto específico (Wilson, 29/out/2026: "o único visto
// que a gente oferece hoje é visto para quem é sansei, nisei, ou cônjuge de
// sansei de nisei, ou dos dependentes legais").
// Solicitação 100% online (Wilson, 29/out/2026): passos numerados como a
// candidatura de /empregos, pagamento pela Stone e registro no CRM de
// Documentação — ver SolicitacaoOnline.tsx. Banner com a foto do visto e
// degradê verde-escuro.

import Link from "next/link";
import { formatBRL } from "../../hooks/useCambioUSD";
import { CabecalhoAjisai, RodapeAjisai, HeroServico, Secao, ListaCheck, Etapas, Prazos, Termos, VERDE } from "../componentes";
import { CONSULADOS, TERMOS_VISTO_COE } from "../conteudo";
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
        cta={{ href: "#solicitar", rotulo: "Solicitar online" }}
      />

      <Secao kicker="Quem pode pedir" titulo="Este visto é para você?">
        <div className="rounded-2xl border p-5 md:p-7" style={{ borderColor: `${VERDE}33`, background: `${VERDE}08` }}>
          <p className="text-sm font-medium text-black">Atendemos exclusivamente o visto específico, para:</p>
          <ListaCheck
            className="mt-4"
            itens={[
              "Nisseis e sanseis — descendentes de japoneses até a 3ª geração",
              "Cônjuges de nisseis e sanseis",
              "Filhos dependentes legais, até 18 anos",
            ]}
          />
          <p className="mt-4 text-xs leading-5 text-black/55">
            Não emitimos visto de estudante, trabalho, religioso ou de outras categorias. Para turismo de curta duração, brasileiros estão isentos de visto até 2029.
            Yonsei (4ª geração) ou outra situação familiar? Alguns casos passam pelo{" "}
            <Link href="/documentacao/elegibilidade" className="underline" style={{ color: VERDE }}>Certificado de Elegibilidade</Link>.
          </p>
        </div>
      </Secao>

      <Secao kicker="Valores" titulo="Valor final por consulado" cinza id="valor">
        <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.15em] text-black/45">
                <th className="px-5 py-3 font-medium">Consulado</th>
                <th className="px-5 py-3 font-medium">Com elegibilidade</th>
                <th className="px-5 py-3 font-medium">Sem elegibilidade</th>
              </tr>
            </thead>
            <tbody>
              {CONSULADOS.map((c) => (
                <tr key={c.id} className="border-t border-black/5">
                  <td className="px-5 py-3 text-black/75">
                    {c.nome}
                    {c.dica && <span className="block text-xs text-black/45">{c.dica}</span>}
                  </td>
                  <td className="px-5 py-3">{formatBRL(c.comCOE)}</td>
                  <td className="px-5 py-3">{formatBRL(c.semCOE)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-black/50">
          Valores por pessoa, com a taxa consular inclusa. A diferença entre com e sem elegibilidade é o prazo: com o certificado, o consulado emite em cerca de 2 semanas; sem, em cerca de 3 meses.
          Ainda não tem o certificado? <Link href="/documentacao/elegibilidade" className="underline" style={{ color: VERDE }}>Veja o Certificado de Elegibilidade</Link>.
        </p>
      </Secao>

      <Secao kicker="O que está incluso" titulo="Cuidamos do processo inteiro">
        <ListaCheck
          itens={[
            "Lista de documentos e orientação para reunir cada um",
            "Traduções oficiais e elaboração de declarações",
            "Preparo do processo antes da entrada no consulado",
            "Entrada presencial no consulado por um profissional autorizado — você não precisa ir nem enfrentar fila",
            "Acompanhamento dos pedidos do consulado, traduzidos para você",
            "Atendimento da equipe Ajisai em português em todas as etapas",
            "Envio do passaporte com o visto para o seu endereço",
          ]}
        />
      </Secao>

      <Secao kicker="Como funciona" titulo="Etapas até o visto" cinza>
        <Etapas
          itens={[
            { titulo: "Solicitação online", texto: "Cadastro, ficha e documentos, aqui no site." },
            { titulo: "Contrato e pagamento", texto: "Aceite eletrônico e 100% pela Stone (cartão ou Pix)." },
            { titulo: "Conferência", texto: "Revisamos tudo e pedimos o que faltar." },
            { titulo: "Traduções", texto: "Traduções oficiais e declarações." },
            { titulo: "Entrada no consulado", texto: "Nosso profissional protocola o pedido." },
            { titulo: "Emissão do visto", texto: "Acompanhamos até a aprovação." },
            { titulo: "Envio para você", texto: "Passaporte com o visto no seu endereço." },
          ]}
        />
      </Secao>

      <Secao kicker="Prazos estimados" titulo="Quanto tempo leva">
        <Prazos
          itens={[
            { etapa: "Preparo da documentação", prazo: "1 a 3 semanas (média de 2)" },
            { etapa: "Logística dos documentos", prazo: "1 a 2 semanas (média de 1)" },
            { etapa: "Consulado, com Certificado de Elegibilidade", prazo: "cerca de 2 semanas" },
            { etapa: "Consulado, sem Certificado de Elegibilidade", prazo: "cerca de 3 meses" },
          ]}
          nota="Prazos estimados — dependem do consulado, dos correios e de outros órgãos."
        />
        <div className="mt-6">
          <Termos clausulas={TERMOS_VISTO_COE} />
        </div>
      </Secao>

      <Secao kicker="Solicitação 100% online" titulo="Solicite o seu visto" cinza id="solicitar">
        <SolicitacaoOnline servico="visto" />
      </Secao>
      <RodapeAjisai />
    </main>
  );
}
