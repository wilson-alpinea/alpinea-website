"use client";

// /documentacao/pet — exportação de pet Brasil → Japão (Wilson, 29/out/2026).
// Unidade de negócio à parte, com clínicas parceiras em São Paulo. Só cães e
// gatos, origem obrigatoriamente Brasil, pagamento 100% no ato. Valor sob
// consulta até o Wilson confirmar o preço atual (ver PRECO_PET_BRL).

import Image from "next/image";
import { CabecalhoAjisai, RodapeAjisai, HeroServico, Secao, ListaCheck, Etapas, Prazos, Termos, FormularioDocumentacao, VERDE, display } from "../componentes";
import { formatBRL } from "../../hooks/useCambioUSD";
import {
  TERMOS_PET, EXPERIENCIA, PALAVRAS_RACA_RESTRITA, PERGUNTAS_PET, PERGUNTAS_PET_TUTOR, PRECO_PET_BRL,
  RACAS_RESTRITAS_CAES, RACAS_RESTRITAS_GATOS, TERMOS_RACAS, type RacaRestrita,
} from "../conteudo";

function racaRestrita(raca: string) {
  const r = raca.toLowerCase();
  return r.length >= 3 && PALAVRAS_RACA_RESTRITA.some((p) => r.includes(p));
}

function GradeRacas({ titulo, racas }: { titulo: string; racas: RacaRestrita[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-black">{titulo}</p>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {racas.map((r) => (
          <li key={r.nome} className="overflow-hidden rounded-xl border border-black/10 bg-white">
            <Image src={`/images/racas/${r.foto}`} alt={r.nome} width={640} height={640} sizes="(min-width: 1024px) 180px, (min-width: 640px) 30vw, 45vw" className="block aspect-square h-auto w-full object-cover" />
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

function ListaRacas() {
  return (
    <div className="space-y-8">
      <GradeRacas titulo="Cães" racas={RACAS_RESTRITAS_CAES} />
      <GradeRacas titulo="Gatos" racas={RACAS_RESTRITAS_GATOS} />
      <p className="text-xs leading-5 text-black/50">
        Cruzamentos dessas raças também não são aceitos. Também não aceitamos raças do tipo “pit bull”, Tosa, Dogo Argentino e similares.
      </p>
    </div>
  );
}

export default function PetPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white text-black">
      <CabecalhoAjisai />
      <HeroServico
        kicker="Ajisai Pet · Exportação"
        titulo="Seu cão ou gato no Japão, com toda a documentação"
        subtitulo="Microchip, vacinas, sorologia, Import Permit e certificado veterinário internacional — o processo inteiro, com clínicas parceiras em São Paulo, para o seu pet chegar ao Japão sem quarentena."
        imagem="/images/documentacao-pet.webp"
        alt="Tutora com um cavalier king charles ao lado da caixa de transporte no aeroporto"
      />

      <Secao kicker="Antes de começar" titulo="Um processo longo, que exige planejamento">
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <p className="text-sm leading-7 text-black/70">
            O Japão é um dos países mais rigorosos na entrada de animais. O processo leva em média 9 meses, porque a sorologia — o exame que comprova a
            vacina contra a raiva — é feita num laboratório nos Estados Unidos, o único autorizado para a América Latina, e depois dela é preciso
            esperar 180 dias. Começar cedo é o que evita que o seu pet fique em quarentena no aeroporto.
          </p>
          <div className="rounded-2xl border border-black/10 bg-[#F6F7F5] p-5">
            <p className="text-sm font-medium text-black">Atendemos</p>
            <ListaCheck className="mt-3" itens={["Somente cães e gatos", "Somente Brasil → Japão", "Raças aceitas pelas companhias aéreas"]} />
            <p className="mt-3 text-xs leading-5 text-black/50">Não atendemos aves, répteis ou outros animais, nem a documentação para trazer um pet do Japão ao Brasil.</p>
            <p className="mt-4 text-xs text-black/50">{EXPERIENCIA.pets} pets já levados ao Japão.</p>
          </div>
        </div>
      </Secao>

      <Secao kicker="Como funciona" titulo="Etapas da exportação" cinza>
        <Etapas
          itens={[
            { titulo: "Cadastro e proposta", texto: "Analisamos o seu pet e a data da viagem." },
            { titulo: "Contratação", texto: "Pagamento de 100% na contratação." },
            { titulo: "Microchip", texto: "Padrão ISO 11784/11785, o primeiro passo do processo." },
            { titulo: "Vacina da raiva", texto: "Duas doses de vacina inativada, com 30 dias entre elas, por veterinário credenciado." },
            { titulo: "Sorologia", texto: "Coleta em São Paulo, envio refrigerado e análise em laboratório nos EUA. Depois, 180 dias de espera." },
            { titulo: "Import Permit", texto: "Notificação à quarentena do aeroporto de chegada, pelo menos 40 dias antes. Feita pela Ajisai." },
            { titulo: "Certificado Brasil (CVI)", texto: "Exame clínico até 10 dias antes do embarque e emissão do Certificado Veterinário Internacional." },
          ]}
        />
      </Secao>

      <Secao kicker="Prazos estimados" titulo="Cerca de 9 meses no total">
        <Prazos
          itens={[
            { etapa: "Microchip, vacinas e sorologia (inclui os 180 dias de espera)", prazo: "cerca de 8 meses" },
            { etapa: "Import Permit", prazo: "1 a 2 semanas" },
            { etapa: "Exames finais e emissão do CVI", prazo: "2 a 4 semanas (média de 3)" },
          ]}
          nota="Se a sorologia já foi feita, o prazo pode ser bem menor — informe no cadastro."
        />
      </Secao>

      <Secao kicker="Valor" titulo="Pacote completo" cinza>
        <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl p-6 text-white md:p-8" style={{ background: VERDE }}>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/60">Exportação de pet</p>
            <p className={`${display.className} mt-2 text-3xl`}>{PRECO_PET_BRL ? formatBRL(PRECO_PET_BRL) : "Sob consulta"}</p>
            <p className="mt-3 text-sm leading-6 text-white/70">Valor por pet, com pagamento de 100% na contratação.</p>
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
        <p className="mt-4 text-xs leading-5 text-black/50">Taxas da companhia aérea para o transporte do pet e a caixa transportadora não estão inclusas.</p>
      </Secao>

      <Secao kicker="Transporte aéreo" titulo="Raças NÃO aceitas">
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-50/60 p-5 text-sm leading-6 text-black/70 md:p-6">
          <p className="font-medium text-black">Por que a raça importa tanto</p>
          <p className="mt-2">
            A cabine do avião é pressurizada como se estivesse a 2 ou 3 mil metros de altitude, por muitas horas. Raças de focinho curto (braquicefálicas)
            já têm vias respiratórias estreitas e respiram com dificuldade até ao nível do mar — no voo, o risco é alto. Por isso, as companhias aéreas não
            embarcam essas raças para o Japão, mesmo com toda a documentação pronta. Essas raças não são aceitas. Confira a lista antes de contratar.
          </p>
        </div>
        <ListaRacas />
        <div className="mt-8 space-y-3 rounded-2xl border border-black/10 bg-[#F6F7F5] p-5 text-xs leading-5 text-black/65 md:p-6">
          <p className="text-sm font-medium text-black">Termos de aceite de animais no transporte aéreo internacional</p>
          {TERMOS_RACAS.map(([t, txt], i) => (
            <p key={t}><strong className="font-medium text-black">{i + 1}. {t}.</strong> {txt}</p>
          ))}
        </div>
      </Secao>

      <Secao kicker="Cadastro" titulo="Cadastro do tutor e do pet" cinza id="cadastro">
        <p className="mb-6 text-sm leading-6 text-black/60">Todas as perguntas são obrigatórias. Para mais de um pet, envie um cadastro por animal.</p>
        <FormularioDocumentacao
          servico="pet"
          grupos={[
            { titulo: "Sobre o tutor", perguntas: PERGUNTAS_PET_TUTOR },
            { titulo: "Sobre o pet", perguntas: PERGUNTAS_PET },
          ]}
          contexto={[["País de origem do passageiro e do pet", "Brasil (confirmado no cadastro)"]]}
          bloqueio={(r) =>
            r.p_racaRestrita === "Sim, está na lista"
              ? "Infelizmente não conseguimos atender: as companhias aéreas não embarcam essas raças para o Japão, mesmo com toda a documentação pronta."
              : r.p_racaRestrita === "Não sei"
                ? "Confira a lista de raças NÃO aceitas na seção “Transporte aéreo” desta página antes de enviar. Se tiver dúvida sobre o cruzamento, fale com a equipe pelo WhatsApp."
                : null
          }
          aviso={(r) =>
            racaRestrita(r.p_raca ?? "") && r.p_racaRestrita !== "Sim, está na lista" ? (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
                A raça informada parece estar na lista de raças NÃO aceitas. Confira a lista antes de enviar: essas raças não podem ser contratadas, e declarar a raça de forma incorreta tira o direito a qualquer reembolso.
              </div>
            ) : null
          }
          aceites={[
            { id: "origem", resumo: "Confirmou origem Brasil", texto: "Confirmo que o passageiro e o pet vão sair do Brasil." },
            {
              id: "racas",
              resumo: "Leu e aceitou as restrições de raças no transporte aéreo",
              texto: "Li e aceito os termos de aceite de animais no transporte aéreo internacional e a lista de raças NÃO aceitas, na seção “Transporte aéreo” acima.",
            },
            { id: "termos", resumo: "Li e aceito os termos e condições do serviço (não reembolsável)", texto: "Li e aceito os termos e condições do serviço abaixo, incluindo que não há cancelamento com reembolso e que, se a raça for omitida ou declarada de forma incorreta, não há reembolso em nenhuma hipótese." },
          ]}
        />
        <div className="mt-8">
          <Termos clausulas={TERMOS_PET} />
        </div>
      </Secao>
      <RodapeAjisai />
    </main>
  );
}
