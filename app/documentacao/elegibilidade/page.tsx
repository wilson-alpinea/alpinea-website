"use client";

// /documentacao/elegibilidade — Certificado de Elegibilidade (COE), Wilson,
// 29/out/2026. Valor final em ienes (pacote fechado, nunca aberto por item);
// referência em reais pela PTAX do dia ("pode usar PTAX para o câmbio em
// real ... para o check out em reais"). Pagamento 50% + 50%.

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatBRL, formatJPY } from "../../hooks/useCambioUSD";
import { CabecalhoAjisai, RodapeAjisai, HeroServico, Secao, ListaCheck, Etapas, Prazos, Termos, Pilulas, FormularioDocumentacao, VERDE, display } from "../componentes";
import { PERGUNTAS_VISTO, PERGUNTAS_GARANTIDOR, TERMOS_VISTO_COE, COE_FAMILIA_JPY, COE_INDIVIDUAL_JPY, COE_MAX_PESSOAS_SITE, precoCOEJPY } from "../conteudo";
import { Campo, classeInput } from "../../components/transporte/compartilhado";

type Ptax = { brlPorJPY: number; data: string | null; fallback: boolean };

const PERFIS = [
  "Sou nissei (filho de japonês)",
  "Sou sansei (neto de japonês)",
  "Sou cônjuge de nissei ou sansei",
  "Sou filho(a) dependente, até 18 anos",
  "Nenhuma das opções",
] as const;
const PERFIL_FORA = "Nenhuma das opções";

export default function ElegibilidadePage() {
  const [perfil, setPerfil] = useState("");
  const [pessoas, setPessoas] = useState(1);
  const [ptax, setPtax] = useState<Ptax | null>(null);

  useEffect(() => {
    fetch("/api/cambio-iene-ptax")
      .then((r) => r.json())
      .then((d: Ptax) => setPtax(d))
      .catch(() => setPtax(null));
  }, []);

  const liberado = perfil !== "" && perfil !== PERFIL_FORA;
  const individual = perfil.includes("cônjuge") ? "conjuge" : "descendente";
  const totalJPY = precoCOEJPY(pessoas, individual);
  const totalBRL = totalJPY && ptax ? Math.round(totalJPY * ptax.brlPorJPY * 100) / 100 : null;

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-black">
      <CabecalhoAjisai />
      <HeroServico
        kicker="Documentação · Elegibilidade"
        titulo="Certificado de Elegibilidade"
        subtitulo="O documento emitido pela imigração do Japão que libera o visto específico em cerca de 2 semanas. Cuidamos do processo no Japão, com advogado de imigração e atendimento em português."
        imagem="/images/documentacao-elegibilidade.webp"
        alt="Consultora preenchendo o formulário do certificado com a cliente"
      />

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

      <Secao kicker="Passo 1" titulo="Este serviço é para você?" cinza>
        <p className="text-sm leading-6 text-black/65">O certificado é a etapa do visto específico — exclusivo para descendentes até a 3ª geração, cônjuges e dependentes.</p>
        <div className="mt-5">
          <Pilulas opcoes={[...PERFIS]} valor={perfil} onChange={setPerfil} nome="Perfil do solicitante" />
        </div>
        {perfil === PERFIL_FORA && (
          <div className="mt-5 rounded-2xl border border-black/10 bg-white p-5 text-sm leading-6 text-black/70">
            Hoje trabalhamos só com o visto específico e o certificado ligado a ele, por isso não conseguimos ajudar com o seu caso. Se a sua situação
            familiar é diferente, fale com a gente pelo WhatsApp antes de desistir.
          </div>
        )}
      </Secao>

      {liberado && (
        <Secao kicker="Passo 2" titulo="Valor final do pacote" id="valor">
          <div className="grid gap-5 rounded-2xl border border-black/10 p-5 md:grid-cols-2 md:p-7">
            <Campo rotulo="Quantas pessoas vão pedir o certificado?" ajuda="Família no mesmo processo tem desconto.">
              <select value={pessoas} onChange={(e) => setPessoas(Number(e.target.value))} className={classeInput(false)}>
                {Array.from({ length: COE_MAX_PESSOAS_SITE + 1 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n > COE_MAX_PESSOAS_SITE ? `${COE_MAX_PESSOAS_SITE + 1} ou mais` : `${n} ${n === 1 ? "pessoa" : "pessoas"}`}</option>
                ))}
              </select>
            </Campo>
          </div>

          <div className="mt-5 rounded-2xl p-6 text-white md:p-8" style={{ background: VERDE }}>
            {totalJPY ? (
              <>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/60">Total para {pessoas} {pessoas === 1 ? "pessoa" : "pessoas"}</p>
                <p className={`${display.className} mt-2 text-4xl`}>{formatJPY(totalJPY)}</p>
                <p className="mt-2 text-sm text-white/75">
                  {totalBRL ? `≈ ${formatBRL(totalBRL)} pela PTAX ${ptax?.data ? `de ${ptax.data}` : "do dia"}` : "Carregando a cotação…"}
                  {ptax?.fallback && " (estimativa — cotação do Banco Central indisponível agora)"}
                </p>
                <p className="mt-3 text-xs leading-5 text-white/60">
                  O valor em reais é calculado pela PTAX do dia de cada pagamento. 50% antes de iniciar o serviço e 50% antes da entrada na imigração, por Pix ou TED no Brasil ou transferência no Japão.
                </p>
              </>
            ) : (
              <p className="text-sm text-white/80">Para {COE_MAX_PESSOAS_SITE + 1} pessoas ou mais, o valor é sob consulta — faça o cadastro e a equipe envia a proposta.</p>
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["1 descendente", COE_INDIVIDUAL_JPY.descendente],
              ["1 cônjuge", COE_INDIVIDUAL_JPY.conjuge],
              ...Object.entries(COE_FAMILIA_JPY).map(([n, v]) => [`${n} pessoas`, v] as [string, number]),
            ].map(([rotulo, valor]) => (
              <div key={rotulo as string} className="rounded-xl border border-black/10 p-3 text-center">
                <p className="text-[10px] uppercase tracking-[0.15em] text-black/45">{rotulo}</p>
                <p className="mt-1 text-sm font-medium text-black">{formatJPY(valor as number)}</p>
              </div>
            ))}
          </div>
        </Secao>
      )}

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
            { titulo: "Cadastro e análise", texto: "Avaliamos o seu caso e o do garantidor." },
            { titulo: "Contratação", texto: "Primeiros 50% do valor." },
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

      {liberado ? (
        <Secao kicker="Passo 3" titulo="Cadastro do certificado" cinza id="cadastro">
          <p className="mb-6 text-sm leading-6 text-black/60">
            Todas as perguntas são obrigatórias — incluindo as do garantidor. Se não souber alguma resposta, confirme com ele antes de enviar.
          </p>
          <FormularioDocumentacao
            servico="elegibilidade"
            grupos={[
              { titulo: "Sobre o solicitante", perguntas: PERGUNTAS_VISTO },
              { titulo: "Sobre o garantidor no Japão", perguntas: PERGUNTAS_GARANTIDOR },
            ]}
            respostasIniciais={{ qtd: String(pessoas) }}
            valorReferenciaBRL={totalBRL}
            camposExtras={{ perfil, valorJPY: totalJPY ? String(totalJPY) : "" }}
            contexto={[
              ["Perfil informado no filtro", perfil],
              ["Pessoas (simulação)", String(pessoas)],
              ["Valor mostrado", totalJPY ? `${formatJPY(totalJPY)}${totalBRL ? ` ≈ ${formatBRL(totalBRL)} (PTAX ${ptax?.data ?? "estimada"})` : ""}` : "Sob consulta"],
            ]}
            aceites={[
              { id: "termos", resumo: "Li e aceito os termos e condições do serviço", texto: "Li e aceito os termos e condições do serviço (seção “Quanto tempo leva”)." },
              { id: "garantia", resumo: "Ciente: pagamento e documentos não garantem aprovação; serviço não reembolsável", texto: "Entendo que o pagamento, o envio dos documentos e a pré-aprovação do cadastro não garantem a emissão do certificado — a decisão é da imigração do Japão — e que o serviço não é reembolsável, inclusive em caso de negativa." },
            ]}
          />
        </Secao>
      ) : (
        <section className="bg-[#F6F7F5]">
          <div className="mx-auto max-w-5xl px-5 py-10 text-center text-sm text-black/55 md:px-8">Responda o seu perfil no Passo 1 para ver o valor e fazer o cadastro.</div>
        </section>
      )}
      <RodapeAjisai />
    </main>
  );
}
