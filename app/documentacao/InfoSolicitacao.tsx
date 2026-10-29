"use client";

// Informações de cada serviço DENTRO do formulário (Wilson, 29/out/2026:
// "nenhuma informação deve ficar fora dos formulários ... as páginas, elas
// são formulários"). Cada etapa mostra só o que importa para a decisão
// daquela etapa: quem pode pedir, valores, o que está incluso, como
// funciona, prazos, raças não aceitas e termos.

import Image from "next/image";
import type { ReactNode } from "react";
import { Etapas, ListaCheck, NaoIncluso, Prazos, Termos, VERDE, display } from "./componentes";
import { formatBRL, formatJPY } from "../hooks/useCambioUSD";
import {
  COE_FAMILIA_JPY, COE_INDIVIDUAL_JPY, EXPERIENCIA, PRECO_PET_BRL, RACAS_RESTRITAS_CAES, RACAS_RESTRITAS_GATOS,
  TERMOS_PET, TERMOS_RACAS, TERMOS_VISTO_COE, type RacaRestrita,
} from "./conteudo";

type Servico = "visto" | "elegibilidade" | "pet";

/** Painel de informação dentro de uma etapa (aberto ou recolhível). */
export function Painel({ titulo, children, recolhivel = false, aberto = false, alerta = false }: { titulo: string; children: ReactNode; recolhivel?: boolean; aberto?: boolean; alerta?: boolean }) {
  // Faixa vermelha com letras brancas no título (Wilson, 29/out/2026: raças não aceitas).
  if (alerta) {
    return (
      <section className="overflow-hidden rounded-2xl border border-[#B42318]/30 bg-[#F6F7F5]">
        <p className="bg-[#B42318] px-5 py-3 text-sm font-semibold text-white">{titulo}</p>
        <div className="p-5">{children}</div>
      </section>
    );
  }
  if (recolhivel) {
    return (
      <details open={aberto} className="group rounded-2xl border border-black/10 bg-[#F6F7F5] p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-black">
          {titulo}
          <span className="text-xs font-normal group-open:hidden" style={{ color: VERDE }}>Ver</span>
          <span className="hidden text-xs font-normal group-open:inline" style={{ color: VERDE }}>Fechar</span>
        </summary>
        <div className="mt-4">{children}</div>
      </details>
    );
  }
  return (
    <section className="rounded-2xl border border-black/10 bg-[#F6F7F5] p-5">
      <p className="text-sm font-semibold text-black">{titulo}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

const TERMOS_COE: [string, string][] = [...TERMOS_VISTO_COE, ["Validade do certificado", "O certificado tem validade de 90 dias e não garante a emissão do visto, embora aumente muito as chances."]];

function GradeRacas({ titulo, racas }: { titulo: string; racas: RacaRestrita[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-black">{titulo}</p>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {racas.map((r) => (
          <li key={r.nome} className="overflow-hidden rounded-xl border border-black/10 bg-white">
            <Image src={`/images/racas/${r.foto}`} alt={r.nome} width={640} height={640} sizes="(min-width: 1024px) 160px, (min-width: 640px) 30vw, 45vw" className="block aspect-square h-auto w-full object-cover" />
            <div className="px-3 py-2.5">
              <p className="text-[13px] font-medium leading-tight text-black">{r.nome}</p>
              {r.nota && <p className="mt-0.5 text-[11px] leading-tight text-black/50">{r.nota}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RacasNaoAceitas() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-50/60 p-4 text-sm leading-6 text-black/70">
        <p className="font-medium text-black">Por que a raça importa tanto</p>
        <p className="mt-1">
          A cabine do avião é pressurizada como se estivesse a 2 ou 3 mil metros de altitude, por muitas horas. Raças de focinho curto (braquicefálicas) já
          respiram com dificuldade ao nível do mar — no voo, o risco é alto. Por isso as companhias aéreas não embarcam essas raças para o Japão, mesmo com
          toda a documentação pronta.
        </p>
      </div>
      <GradeRacas titulo="Cães" racas={RACAS_RESTRITAS_CAES} />
      <GradeRacas titulo="Gatos" racas={RACAS_RESTRITAS_GATOS} />
      <p className="text-xs leading-5 text-black/50">Cruzamentos dessas raças também não são aceitos, nem raças do tipo “pit bull”, Tosa, Dogo Argentino e similares.</p>
      <div className="space-y-2 text-xs leading-5 text-black/65">
        <p className="text-sm font-medium text-black">Termos de aceite de animais no transporte aéreo internacional</p>
        {TERMOS_RACAS.map(([t, txt], i) => (
          <p key={t}><strong className="font-medium text-black">{i + 1}. {t}.</strong> {txt}</p>
        ))}
      </div>
    </div>
  );
}

/** Informações mostradas no topo de cada etapa do formulário. */
export function InfoEtapa({ servico, passo }: { servico: Servico; passo: string }) {
  // ── Visto específico ──
  if (servico === "visto") {
    if (passo === "perfil")
      return (
        <Painel titulo="Quem pode pedir">
          <ListaCheck itens={["Nisseis e sanseis — descendentes de japoneses até a 3ª geração", "Cônjuges de nisseis e sanseis", "Filhos dependentes legais, até 18 anos", "Cônjuges e filhos de residentes permanentes no Japão — não precisa ter ascendência japonesa"]} />
          <p className="mt-3 text-xs leading-5 text-black/55">
            Não emitimos visto de estudante, trabalho, religioso ou de outras categorias. Para turismo de curta duração, brasileiros estão isentos de visto até 2029.
            Yonsei (4ª geração) ou outra situação familiar? Alguns casos passam pelo Certificado de Elegibilidade.
          </p>
        </Painel>
      );
    if (passo === "valor")
      return (
        <div className="space-y-4">
          <Painel titulo="O que está incluso" recolhivel>
            <ListaCheck
              itens={[
                "Lista de documentos e orientação para reunir cada um",
                "Preparo do processo antes da entrada no consulado",
                "Entrada presencial no consulado por um profissional autorizado — você não precisa ir nem enfrentar fila",
                "Acompanhamento dos pedidos do consulado",
                "Atendimento da equipe Ajisai em português em todas as etapas",
                "Envio do passaporte com o visto para o seu endereço",
              ]}
            />
            <NaoIncluso className="mt-4" itens={["Traduções simples (não juramentadas): R$ 90 por documento", "Elaboração de declarações: R$ 90 por declaração", "Apostila de Haia (apostilamento em cartório), quando exigida", "Valor da postagem dos documentos até a Ajisai (Correios/Sedex)"]} />
          </Painel>
        </div>
      );
    if (passo === "dados")
      return (
        <div className="space-y-4">
          <Painel titulo="Como funciona, depois do pagamento" recolhivel>
            <Etapas
              itens={[
                { titulo: "Conferência", texto: "Revisamos tudo e pedimos o que faltar." },
                { titulo: "Preparo", texto: "Montamos o processo. Traduções (R$ 90 cada) e declarações (R$ 90 cada), se necessárias, à parte." },
                { titulo: "Entrada no consulado", texto: "Nosso profissional protocola o pedido." },
                { titulo: "Visto em casa", texto: "Acompanhamos a emissão e enviamos o passaporte." },
              ]}
            />
          </Painel>
          <Painel titulo="Prazos estimados" recolhivel>
            <Prazos
              itens={[
                { etapa: "Preparo da documentação", prazo: "1 a 3 semanas (média de 2)" },
                { etapa: "Logística dos documentos", prazo: "1 a 2 semanas (média de 1)" },
                { etapa: "Consulado, com Certificado de Elegibilidade", prazo: "cerca de 2 semanas" },
                { etapa: "Consulado, sem Certificado de Elegibilidade", prazo: "cerca de 3 meses" },
              ]}
              nota="Prazos estimados — dependem do consulado, dos correios e de outros órgãos."
            />
          </Painel>
          <Termos clausulas={TERMOS_VISTO_COE} />
        </div>
      );
    return null;
  }

  // ── Certificado de Elegibilidade ──
  if (servico === "elegibilidade") {
    if (passo === "perfil")
      return (
        <Painel titulo="O que é o Certificado de Elegibilidade">
          <p className="text-sm leading-6 text-black/70">
            <strong className="font-semibold text-black">O Certificado de Elegibilidade (COE) não é o visto.</strong> O COE é pedido na imigração do Japão — não no consulado. Um parente ou responsável que mora no Japão, o garantidor, vai patrocinar o solicitante, ou seja, é o responsável pelas questões financeiras e migratórias dele perante a imigração. Com o certificado em mãos no Brasil, você pode solicitar o visto específico no consulado, que sai em cerca de 2 semanas.
          </p>
          <p className="mt-3 rounded-xl border border-[#B42318]/25 bg-white px-4 py-3 text-sm leading-6 text-black/75">
            <strong className="font-semibold text-[#B42318]">O visto específico não está incluso neste serviço.</strong> Ele é um segundo pedido, feito no
            consulado depois que o COE é emitido — e pode ser contratado com a Ajisai à parte.
          </p>
          <p className="mt-4 text-sm font-medium text-black">Normalmente precisa do certificado quem:</p>
          <ListaCheck
            className="mt-2"
            itens={["Mora fora da região do Consulado de São Paulo (SP, MS e Triângulo Mineiro)", "Não tem contrato de trabalho no Japão", "Vai como cônjuge ou como filho dependente", "É cônjuge ou filho(a) de residente permanente no Japão"]}
          />
        </Painel>
      );
    if (passo === "valor")
      return (
        <div className="space-y-4">
          <Painel titulo="O que está incluso" recolhivel>
            <ListaCheck
              itens={[
                "Orientação dos documentos para você e para o garantidor no Japão",
                "Traduções e elaboração de declarações",
                "Entrada do pedido por despachante credenciado na imigração ou pelo sistema online, quando elegível — o garantidor não precisa faltar no trabalho",
                "Acompanhamento das solicitações da imigração",
                "Emissão do koseki tohon no Japão (é necessário ter uma cópia do Kouseki Touhon)",
                "Postagem expressa Japão ⇄ Brasil (DHL ou UPS) pelo malote da Ajisai",
                "Atendimento da equipe Ajisai em todas as etapas",
              ]}
            />
            <NaoIncluso className="mt-4" itens={["Apostila de Haia (apostilamento em cartório), quando exigida", "Valor da postagem dos documentos dentro do Brasil (Correios/Sedex)", "O visto específico — pedido à parte no consulado, depois de o COE ser emitido"]} />
          </Painel>
        </div>
      );
    if (passo === "dados")
      return (
        <div className="space-y-4">
          <Painel titulo="Como funciona, depois do pagamento" recolhivel>
            <Etapas
              itens={[
                { titulo: "Documentos no Japão", texto: "Conferência e traduções, para você e o garantidor." },
                { titulo: "Entrada na imigração", texto: "Segundos 50% antes do protocolo." },
                { titulo: "Emissão do certificado", texto: "Acompanhamento até a decisão." },
                { titulo: "Envio para o Brasil", texto: "Pronto para pedir o visto específico." },
              ]}
            />
          </Painel>
          <Painel titulo="Prazos estimados" recolhivel>
            <Prazos
              itens={[
                { etapa: "Preparo da documentação", prazo: "3 a 6 semanas (média de 4)" },
                { etapa: "Envio dos documentos para o Japão", prazo: "1 a 2 semanas" },
                { etapa: "Imigração, da entrada até a emissão", prazo: "cerca de 3 meses, em média" },
              ]}
              nota="A imigração não trabalha com prazo definido — os prazos são estimativas."
            />
          </Painel>
          <Termos clausulas={TERMOS_COE} />
        </div>
      );
    if (passo === "garantidor")
      return (
        <Painel titulo="O que aumenta as chances de aprovação">
          <ListaCheck
            itens={[
              "Garantidor com mais de 3 meses de residência no Japão, legalmente e com status de residente de longo prazo ou permanente",
              "Parentesco o mais próximo possível (pai, mãe, irmão ou irmã)",
              "Garantidor trabalhando, de preferência há mais de 3 meses, com holerites sem descontos de financiamento",
              "Renda acima de ¥200 mil brutos por mês",
              "Sem auxílio do governo japonês por invalidez, sem impostos atrasados na prefeitura e sem antecedentes criminais no Japão",
            ]}
          />
          <p className="mt-3 text-xs leading-5 text-black/50">Mais de 2 solicitantes sem parentes próximos no Japão são casos de risco maior e passam por uma análise mais cuidadosa.</p>
        </Painel>
      );
    return null;
  }

  // ── Exportação de pet ──
  if (passo === "pet")
    return (
      <div className="space-y-4">
        <Painel titulo="Antes de começar: um processo longo, que exige planejamento">
          <p className="text-sm leading-6 text-black/70">
            O Japão é um dos países mais rigorosos na entrada de animais. O processo leva em média 9 meses, porque a sorologia — o exame que comprova a vacina
            contra a raiva — é feita num laboratório nos Estados Unidos, o único autorizado para a América Latina, e depois dela é preciso esperar 180 dias.
            Começar cedo é o que evita que o seu pet fique em quarentena no aeroporto.
          </p>
          <ListaCheck className="mt-3" itens={["Somente cães e gatos", "Somente Brasil → Japão", "Raças aceitas pelas companhias aéreas"]} />
          <p className="mt-3 text-xs leading-5 text-black/50">
            Não atendemos aves, répteis ou outros animais, nem a documentação para trazer um pet do Japão ao Brasil. {EXPERIENCIA.pets} pets já levados ao Japão.
          </p>
        </Painel>
        {/* Sempre aberta (Wilson, 29/out/2026: "tem que ser um item obrigatório") — a declaração fica logo abaixo, no formulário. */}
        <Painel titulo="Raças NÃO aceitas no transporte aéreo — confira antes de seguir" alerta>
          <RacasNaoAceitas />
        </Painel>
      </div>
    );
  if (passo === "dados")
    return (
      <div className="space-y-4">
        <Painel titulo="Pacote completo" recolhivel>
          <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
            <div className="rounded-2xl p-5 text-white" style={{ background: VERDE }}>
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/60">Exportação de pet</p>
              <p className={`${display.className} mt-2 text-2xl`}>{PRECO_PET_BRL ? formatBRL(PRECO_PET_BRL) : "Sob consulta"}</p>
              <p className="mt-2 text-xs leading-5 text-white/70">Valor por pet, com pagamento de 100% na contratação.</p>
            </div>
            <ListaCheck
              itens={[
                "Consulta veterinária e microchip",
                "Vacinação antirrábica — 2 doses",
                "Sorologia com envio refrigerado ao laboratório nos EUA",
                "Import Permit junto à quarentena animal do Japão",
                "Consulta final e Certificado Veterinário Internacional (CVI)",
                "Acompanhamento da equipe Ajisai em todas as etapas",
              ]}
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-black/50">Taxas da companhia aérea para o transporte do pet e a caixa transportadora não estão inclusas.</p>
        </Painel>
        <Painel titulo="Como funciona" recolhivel>
          <Etapas
            itens={[
              { titulo: "Microchip", texto: "Padrão ISO 11784/11785, o primeiro passo do processo." },
              { titulo: "Vacina da raiva", texto: "Duas doses de vacina inativada, com 30 dias entre elas, por veterinário credenciado." },
              { titulo: "Sorologia", texto: "Coleta em São Paulo, envio refrigerado e análise nos EUA. Depois, 180 dias de espera." },
              { titulo: "Import Permit", texto: "Notificação à quarentena do aeroporto de chegada, pelo menos 40 dias antes. Feita pela Ajisai." },
              { titulo: "Certificado Brasil (CVI)", texto: "Exame clínico até 10 dias antes do embarque e emissão do Certificado Veterinário Internacional." },
            ]}
          />
        </Painel>
        <Painel titulo="Prazos estimados — cerca de 9 meses no total" recolhivel>
          <Prazos
            itens={[
              { etapa: "Microchip, vacinas e sorologia (inclui os 180 dias de espera)", prazo: "cerca de 8 meses" },
              { etapa: "Import Permit", prazo: "1 a 2 semanas" },
              { etapa: "Exames finais e emissão do CVI", prazo: "2 a 4 semanas (média de 3)" },
            ]}
            nota="Se a sorologia já foi feita, o prazo pode ser bem menor."
          />
        </Painel>
        <Termos clausulas={TERMOS_PET} />
      </div>
    );
  return null;
}
