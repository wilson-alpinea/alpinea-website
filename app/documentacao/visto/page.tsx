"use client";

// /documentacao/visto — visto específico (Wilson, 29/out/2026: "o único visto
// que a gente oferece hoje é visto para quem é sansei, nisei, ou cônjuge de
// sansei de nisei, ou dos dependentes legais"). O filtro de perfil vem antes
// do preço e do cadastro para quem precisa de outro visto não perder tempo.

import { useState } from "react";
import Link from "next/link";
import { formatBRL } from "../../hooks/useCambioUSD";
import { CabecalhoAjisai, HeroServico, Secao, ListaCheck, Etapas, Prazos, Termos, Pilulas, FormularioDocumentacao, VERDE, display } from "../componentes";
import { CONSULADOS, PRAZO_VISTO, PERGUNTAS_VISTO, TERMOS_VISTO_COE } from "../conteudo";
import { Campo, classeInput } from "../../components/transporte/compartilhado";

const PERFIS = [
  "Sou nissei (filho de japonês)",
  "Sou sansei (neto de japonês)",
  "Sou cônjuge de nissei ou sansei",
  "Sou filho(a) dependente, até 18 anos",
  "Nenhuma das opções",
] as const;
const PERFIL_FORA = "Nenhuma das opções";

export default function VistoPage() {
  const [perfil, setPerfil] = useState("");
  const [consuladoId, setConsuladoId] = useState("");
  const [temCOE, setTemCOE] = useState("");
  const [pessoas, setPessoas] = useState(1);

  const consulado = CONSULADOS.find((c) => c.id === consuladoId) ?? null;
  const porPessoa = consulado && temCOE ? (temCOE === "Sim" ? consulado.comCOE : consulado.semCOE) : null;
  const total = porPessoa ? porPessoa * pessoas : null;
  const liberado = perfil !== "" && perfil !== PERFIL_FORA;

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-black">
      <CabecalhoAjisai />
      <HeroServico
        kicker="Documentação · Visto"
        titulo="Visto específico para o Japão"
        subtitulo="O visto para descendentes de japoneses e suas famílias. Preparamos a documentação, damos entrada no consulado e enviamos o passaporte com o visto para a sua casa."
        imagem="/images/documentacao-visto.webp"
        alt="Consultora entregando o passaporte com o visto"
      />

      {/* QUEM PODE */}
      <Secao kicker="Passo 1" titulo="Este visto é para você?">
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
          </p>
        </div>

        <div className="mt-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/70">Qual é o seu perfil?</p>
          <div className="mt-3">
            <Pilulas opcoes={[...PERFIS]} valor={perfil} onChange={setPerfil} nome="Perfil do solicitante" />
          </div>
          {perfil === PERFIL_FORA && (
            <div className="mt-5 rounded-2xl border border-black/10 bg-[#F6F7F5] p-5 text-sm leading-6 text-black/70">
              Hoje trabalhamos só com o visto específico, por isso não conseguimos ajudar com o seu caso.
              Se você é yonsei (4ª geração) ou tem uma situação familiar diferente, fale com a gente — alguns casos passam pelo{" "}
              <Link href="/documentacao/elegibilidade" className="underline" style={{ color: VERDE }}>Certificado de Elegibilidade</Link>.
            </div>
          )}
          {liberado && <p className="mt-4 text-sm" style={{ color: VERDE }}>Ótimo — você está no grupo atendido. Veja o valor abaixo.</p>}
        </div>
      </Secao>

      {/* PREÇO */}
      {liberado && (
        <Secao kicker="Passo 2" titulo="Valor final por consulado" cinza id="valor">
          <div className="grid gap-5 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-3 md:p-7">
            <Campo rotulo="Consulado" ajuda={consulado?.dica ?? "O consulado responsável pela região onde você mora."}>
              <select value={consuladoId} onChange={(e) => setConsuladoId(e.target.value)} className={classeInput(false)}>
                <option value="">Selecione</option>
                {CONSULADOS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </Campo>
            <Campo rotulo="Solicitantes">
              <select value={pessoas} onChange={(e) => setPessoas(Number(e.target.value))} className={classeInput(false)}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? "pessoa" : "pessoas"}</option>)}
              </select>
            </Campo>
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/70">Já tem o Certificado de Elegibilidade emitido?</span>
              <Pilulas opcoes={["Sim", "Não"]} valor={temCOE} onChange={setTemCOE} nome="Certificado de Elegibilidade" />
            </div>
          </div>

          <div className="mt-5 rounded-2xl p-6 text-white md:p-8" style={{ background: VERDE }}>
            {total ? (
              <>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/60">Total para {pessoas} {pessoas === 1 ? "pessoa" : "pessoas"}</p>
                <p className={`${display.className} mt-2 text-4xl`}>{formatBRL(total)}</p>
                <p className="mt-2 text-sm text-white/70">
                  {formatBRL(porPessoa!)} por pessoa · taxa consular inclusa · prazo no consulado de {temCOE === "Sim" ? PRAZO_VISTO.comCOE : PRAZO_VISTO.semCOE}
                </p>
                {temCOE === "Sim" && consulado?.id === "sao-paulo" && (
                  <p className="mt-2 text-xs text-white/60">Em São Paulo, o valor com elegibilidade vale para quem já tem o COE emitido e o koseki.</p>
                )}
              </>
            ) : (
              <p className="text-sm text-white/75">Escolha o consulado e responda se já tem o certificado para ver o valor.</p>
            )}
          </div>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-black/10 bg-white">
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
                  <tr key={c.id} className={`border-t border-black/5 ${c.id === consuladoId ? "bg-[#0B3D30]/[0.06]" : ""}`}>
                    <td className="px-5 py-3 text-black/75">{c.nome}</td>
                    <td className="px-5 py-3">{formatBRL(c.comCOE)}</td>
                    <td className="px-5 py-3">{formatBRL(c.semCOE)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-black/50">
            Valores por pessoa. A diferença entre com e sem elegibilidade é o prazo: com o certificado, o consulado emite em cerca de 2 semanas; sem, em cerca de 3 meses.
            Ainda não tem o certificado? <Link href="/documentacao/elegibilidade" className="underline" style={{ color: VERDE }}>Veja o Certificado de Elegibilidade</Link>.
          </p>
        </Secao>
      )}

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
            { titulo: "Cadastro e análise", texto: "Você preenche o cadastro e confirmamos o seu caso." },
            { titulo: "Contratação", texto: "Valor final e pagamento de 100% na contratação." },
            { titulo: "Lista de documentos", texto: "Enviamos o que reunir, com orientação." },
            { titulo: "Recebimento", texto: "Conferimos toda a documentação antes do consulado." },
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

      {liberado ? (
        <Secao kicker="Passo 3" titulo="Cadastro do visto" cinza id="cadastro">
          <p className="mb-6 text-sm leading-6 text-black/60">Todas as perguntas são obrigatórias. Com elas, a equipe confirma o seu caso e o valor final.</p>
          <FormularioDocumentacao
            servico="visto"
            grupos={[{ titulo: "Sobre o visto", perguntas: PERGUNTAS_VISTO }]}
            respostasIniciais={{ qtd: String(pessoas) }}
            valorReferenciaBRL={total}
            camposExtras={{ perfil, consulado: consulado?.nome ?? "", temCOE }}
            contexto={[
              ["Perfil informado no filtro", perfil],
              ["Consulado (simulação)", consulado?.nome ?? "Não escolhido"],
              ["Já tem Certificado de Elegibilidade (simulação)", temCOE || "Não respondeu"],
              ["Valor de referência mostrado", total ? `${formatBRL(total)} (${pessoas} pessoa(s))` : "Não calculado"],
            ]}
            aceites={[
              { id: "termos", resumo: "Li e aceito os termos e condições do serviço", texto: "Li e aceito os termos e condições do serviço (seção “Quanto tempo leva”)." },
              { id: "garantia", resumo: "Ciente: pagamento e documentos não garantem aprovação; serviço não reembolsável", texto: "Entendo que o pagamento e o envio dos documentos não garantem a aprovação do visto — a decisão é do consulado japonês — e que o serviço não é reembolsável, inclusive em caso de negativa." },
            ]}
          />
        </Secao>
      ) : (
        <section className="bg-[#F6F7F5]">
          <div className="mx-auto max-w-5xl px-5 py-10 text-center text-sm text-black/55 md:px-8">
            Responda o seu perfil no Passo 1 para ver o valor e fazer o cadastro.{" "}
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="underline" style={{ color: VERDE }}>Voltar ao topo</a>
          </div>
        </section>
      )}
    </main>
  );
}
