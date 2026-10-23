"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import type { ConfigAgenda } from "@/app/lib/agendaEntrevista";
import { AREA_EMPREGOS } from "@/lib/crm/temaEmpregos";
import { adicionarHorarios, editarHorario, removerBloqueio, removerHorario, salvarBloqueio, salvarRegras, type EntrevistaAfetada } from "../../../agendaActions";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Painel, Spinner } from "../../clientes/[id]/financeiro/ui";
import { FUSO, rotuloDia, somarDias, type BloqueioGrupo, type HorarioPrevia, type JanelaAgenda } from "./AgendaPagina";

// Aba "Disponibilidade e regras" (redesenho 23/out/2026).
const SOMBRA = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const CAMPO =
  "w-full rounded-xl border border-[#DEE6E2] bg-white px-3.5 py-2.5 text-base text-[#202B28] outline-none transition focus:border-[#27675B] focus:ring-2 focus:ring-[#27675B]/25";
const LABEL = "mb-1.5 block text-[13px] font-medium text-[#626E69]";
const DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0];
const hm = (t: string | null) => (t ? t.slice(0, 5) : "");
const dataBR = (d: string) => d.split("-").reverse().join("/");

function Card({ titulo, descricao, cor, fundo, acao, children }: { titulo: string; descricao?: string; cor: string; fundo: string; acao?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={`rounded-2xl border border-t-[3px] border-[#DEE6E2] p-5 ${SOMBRA}`} style={{ backgroundColor: fundo, borderTopColor: cor }}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 style={{ color: cor }}>{titulo}</h2>
          {descricao && <p className="text-sm text-[#626E69]">{descricao}</p>}
        </div>
        {acao}
      </div>
      {children}
    </section>
  );
}

function Erro({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-lg border border-[#B42318]/20 bg-[#FDECEA] px-3 py-2 text-sm text-[#B42318]">
      {children}
    </p>
  );
}

export function Disponibilidade({
  hoje,
  config,
  janelas,
  bloqueios,
  previa,
  erros,
}: {
  hoje: string;
  config: ConfigAgenda;
  janelas: JanelaAgenda[];
  bloqueios: BloqueioGrupo[];
  previa: HorarioPrevia[] | null;
  erros: { janelas: boolean; bloqueios: boolean };
}) {
  const [painel, setPainel] = useState<null | { tipo: "novo_horario" } | { tipo: "editar_horario"; janela: JanelaAgenda } | { tipo: "bloqueio" }>(null);
  const fechar = useCallback(() => setPainel(null), []);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const [, iniciar] = useTransition();

  function remover(acao: () => Promise<{ ok: boolean; mensagem?: string; erro?: string }>, pergunta: string) {
    if (!window.confirm(pergunta)) return;
    iniciar(async () => {
      const r = await acao();
      setAviso(r.ok ? { ok: true, texto: r.mensagem ?? "Removido." } : { ok: false, texto: r.erro ?? "Não foi possível remover." });
    });
  }

  return (
    <div className="space-y-4">
      {aviso && (
        <p role="status" className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm ${aviso.ok ? "border-[#27675B]/20 bg-[#EEF6F3] text-[#1F5248]" : "border-[#B42318]/20 bg-[#FDECEA] text-[#B42318]"}`}>
          {aviso.texto}
          <button type="button" aria-label="Fechar aviso" onClick={() => setAviso(null)} className="crm-livre text-lg leading-none">
            ×
          </button>
        </p>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {/* Horários semanais */}
          <Card
            titulo="Horários de atendimento"
            descricao="Defina os períodos de atendimento que se repetem toda semana."
            {...AREA_EMPREGOS.principal}
            acao={
              <button type="button" onClick={() => setPainel({ tipo: "novo_horario" })} className="rounded-xl bg-[#27675B] px-4 py-2 text-sm font-medium text-white hover:bg-[#20564C]">
                + Adicionar horários
              </button>
            }
          >
            {erros.janelas ? (
              <Erro>Não foi possível carregar os horários.</Erro>
            ) : (
              <ul className="divide-y divide-[#27675B]/10 rounded-xl bg-white">
                {ORDEM_DIAS.map((d) => {
                  const doDia = janelas.filter((j) => j.dia_semana === d).sort((a, b) => a.inicio.localeCompare(b.inicio));
                  return (
                    <li key={d} className="grid gap-2 px-4 py-3 sm:grid-cols-[9rem_1fr] sm:items-start">
                      <span className="text-sm font-medium text-[#202B28]">{DIAS[d]}</span>
                      {doDia.length === 0 ? (
                        <span className="text-sm text-[#8A9792]">Sem atendimento</span>
                      ) : (
                        <span className="flex flex-wrap gap-2">
                          {doDia.map((j) => (
                            <span key={j.id} className="inline-flex items-center gap-1 rounded-lg border border-[#DEE6E2] bg-[#F8FAF9] py-1 pl-2.5 pr-1 text-sm tabular-nums text-[#202B28]">
                              {hm(j.inicio)}–{hm(j.fim)}
                              <button type="button" onClick={() => setPainel({ tipo: "editar_horario", janela: j })} aria-label={`Editar ${DIAS[d]} ${hm(j.inicio)}–${hm(j.fim)}`} className="crm-livre rounded px-1.5 text-[13px] text-[#27675B] hover:bg-[#EEF6F3]">
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => remover(() => removerHorario(j.id), `Remover ${DIAS[d]} ${hm(j.inicio)}–${hm(j.fim)}? Entrevistas já marcadas não são afetadas.`)}
                                aria-label={`Remover ${DIAS[d]} ${hm(j.inicio)}–${hm(j.fim)}`}
                                className="crm-livre rounded px-1.5 text-base leading-none text-[#8A9792] hover:text-[#B42318]"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Bloqueios */}
          <Card
            titulo="Bloqueios e indisponibilidades"
            {...AREA_EMPREGOS.agenda}
            acao={
              <button type="button" onClick={() => setPainel({ tipo: "bloqueio" })} className="rounded-xl border border-[#93703D]/40 bg-white px-4 py-2 text-sm font-medium text-[#93703D] hover:border-[#93703D]">
                + Bloquear período
              </button>
            }
          >
            {erros.bloqueios ? (
              <Erro>Não foi possível carregar os bloqueios.</Erro>
            ) : bloqueios.length === 0 ? (
              <div className="rounded-xl bg-white/70 px-4 py-6 text-center">
                <p className="text-sm font-medium text-[#202B28]">Nenhum bloqueio futuro.</p>
                <p className="text-[13px] text-[#626E69]">Use bloqueios para feriados, férias ou indisponibilidades pontuais.</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#93703D]/10 rounded-xl bg-white">
                {bloqueios.map((b) => (
                  <li key={b.ids[0]} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium tabular-nums text-[#202B28]">{b.de === b.ate ? dataBR(b.de) : `${dataBR(b.de)} a ${dataBR(b.ate)}`}</p>
                      <p className="text-[13px] text-[#626E69]">
                        {b.inicio ? `${hm(b.inicio)}–${hm(b.fim)}${b.de !== b.ate ? " em cada dia" : ""}` : "Dia inteiro"}
                        {b.motivo && ` · ${b.motivo}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remover(() => removerBloqueio(b.ids), "Remover este bloqueio? Os horários voltam a ficar disponíveis para os candidatos.")}
                      className="rounded-lg px-2.5 py-1 text-[13px] font-medium text-[#B42318] hover:bg-[#FDECEA]"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[13px] text-[#626E69]">Para alterar um bloqueio, remova-o e cadastre de novo.</p>
          </Card>
        </div>

        <div className="space-y-6">
          <Regras config={config} onSalvo={(t) => setAviso({ ok: true, texto: t })} />
          <Previa hoje={hoje} config={config} previa={previa} />
        </div>
      </div>

      {painel?.tipo === "novo_horario" && <PainelHorario onFechar={fechar} onSalvo={(t) => setAviso({ ok: true, texto: t })} />}
      {painel?.tipo === "editar_horario" && <PainelHorario janela={painel.janela} onFechar={fechar} onSalvo={(t) => setAviso({ ok: true, texto: t })} />}
      {painel?.tipo === "bloqueio" && <PainelBloqueio hoje={hoje} onFechar={fechar} onSalvo={(t) => setAviso({ ok: true, texto: t })} />}
    </div>
  );
}

function PainelHorario({ janela, onFechar, onSalvo }: { janela?: JanelaAgenda; onFechar: () => void; onSalvo: (t: string) => void }) {
  const [dias, setDias] = useState<number[]>(janela ? [janela.dia_semana] : [1, 2, 3, 4, 5]);
  const [inicio, setInicio] = useState(janela ? hm(janela.inicio) : "09:00");
  const [fim, setFim] = useState(janela ? hm(janela.fim) : "12:00");
  const [erro, setErro] = useState<{ texto: string; campo?: string } | null>(null);
  const [pendente, iniciar] = useTransition();
  const invalido = !!inicio && !!fim && fim <= inicio;
  return (
    <Painel
      titulo={janela ? "Editar horário" : "Adicionar horários"}
      subtitulo={janela ? DIAS[janela.dia_semana] : "Os horários se repetem toda semana (horário de Brasília)."}
      onFechar={onFechar}
      largura="max-w-md"
      rodape={
        <>
          <button type="button" className={BOTAO_SECUNDARIO} onClick={onFechar} disabled={pendente}>
            Cancelar
          </button>
          <button
            type="button"
            className={BOTAO_PRIMARIO}
            disabled={pendente || invalido || (!janela && dias.length === 0)}
            onClick={() =>
              iniciar(async () => {
                const r = janela ? await editarHorario(janela.id, inicio, fim) : await adicionarHorarios(dias, inicio, fim);
                if (r.ok) {
                  onSalvo(r.mensagem);
                  onFechar();
                } else setErro({ texto: r.erro, campo: r.campo });
              })
            }
          >
            {pendente && <Spinner />}
            {janela ? "Salvar horário" : "Adicionar horários"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {!janela && (
          <fieldset>
            <legend className={LABEL}>Dias da semana</legend>
            <div className="flex flex-wrap gap-2">
              {ORDEM_DIAS.map((d) => (
                <label key={d} className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${dias.includes(d) ? "border-[#27675B] bg-[#EEF6F3] text-[#27675B]" : "border-[#DEE6E2] bg-white text-[#202B28]"}`}>
                  <input type="checkbox" className="sr-only" checked={dias.includes(d)} onChange={() => setDias((a) => (a.includes(d) ? a.filter((x) => x !== d) : [...a, d]))} />
                  {DIAS[d].slice(0, 3)}
                </label>
              ))}
            </div>
            {erro?.campo === "dias" && <p className="mt-1 text-[13px] text-[#B42318]">{erro.texto}</p>}
          </fieldset>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL} htmlFor="h-ini">
              Início
            </label>
            <input id="h-ini" type="time" value={inicio} onChange={(e) => setInicio(e.target.value)} className={CAMPO} />
          </div>
          <div>
            <label className={LABEL} htmlFor="h-fim">
              Término
            </label>
            <input id="h-fim" type="time" value={fim} onChange={(e) => setFim(e.target.value)} className={CAMPO} aria-invalid={invalido} />
          </div>
        </div>
        {invalido && <p className="text-[13px] text-[#B42318]">O término precisa ser depois do início.</p>}
        {erro && erro.campo !== "dias" && <Erro>{erro.texto}</Erro>}
        <p className="text-[13px] text-[#626E69]">Horários que se sobrepõem a outros já cadastrados no mesmo dia não são aceitos. Entrevistas já marcadas não mudam.</p>
      </div>
    </Painel>
  );
}

function PainelBloqueio({ hoje, onFechar, onSalvo }: { hoje: string; onFechar: () => void; onSalvo: (t: string) => void }) {
  const [dataInicio, setDataInicio] = useState(hoje);
  const [dataFim, setDataFim] = useState("");
  const [diaInteiro, setDiaInteiro] = useState(true);
  const [inicio, setInicio] = useState("09:00");
  const [fim, setFim] = useState("12:00");
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [afetadas, setAfetadas] = useState<EntrevistaAfetada[] | null>(null);
  const [pendente, iniciar] = useTransition();
  const varios = !!dataFim && dataFim > dataInicio;

  function enviar(confirmar: boolean) {
    iniciar(async () => {
      const r = await salvarBloqueio({ dataInicio, dataFim, diaInteiro, inicio, fim, motivo }, confirmar);
      if (r.ok) {
        onSalvo(r.mensagem);
        onFechar();
      } else if (r.precisaConfirmar && r.afetadas) {
        setAfetadas(r.afetadas);
        setErro(r.erro);
      } else {
        setAfetadas(null);
        setErro(r.erro);
      }
    });
  }
  return (
    <Painel
      titulo="Bloquear período"
      subtitulo="Os horários bloqueados deixam de aparecer para os candidatos."
      onFechar={onFechar}
      largura="max-w-md"
      rodape={
        <>
          <button type="button" className={BOTAO_SECUNDARIO} onClick={onFechar} disabled={pendente}>
            Cancelar
          </button>
          <button type="button" className={BOTAO_PRIMARIO} disabled={pendente} onClick={() => enviar(!!afetadas)}>
            {pendente && <Spinner />}
            {afetadas ? "Salvar mesmo assim" : "Salvar bloqueio"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL} htmlFor="b-ini">
              Data inicial
            </label>
            <input id="b-ini" type="date" min={hoje} value={dataInicio} onChange={(e) => { setDataInicio(e.target.value); setAfetadas(null); }} className={CAMPO} />
          </div>
          <div>
            <label className={LABEL} htmlFor="b-fim">
              Data final
            </label>
            <input id="b-fim" type="date" min={dataInicio || hoje} value={dataFim} onChange={(e) => { setDataFim(e.target.value); setAfetadas(null); }} className={CAMPO} />
            <p className="mt-1 text-[13px] text-[#626E69]">Opcional — vazio bloqueia só a data inicial.</p>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[#202B28]">
          <input type="checkbox" checked={diaInteiro} onChange={(e) => { setDiaInteiro(e.target.checked); setAfetadas(null); }} className="h-4 w-4 accent-[#27675B]" />
          Dia inteiro
        </label>
        {!diaInteiro && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL} htmlFor="b-hi">
                  Das
                </label>
                <input id="b-hi" type="time" value={inicio} onChange={(e) => { setInicio(e.target.value); setAfetadas(null); }} className={CAMPO} />
              </div>
              <div>
                <label className={LABEL} htmlFor="b-hf">
                  Às
                </label>
                <input id="b-hf" type="time" value={fim} onChange={(e) => { setFim(e.target.value); setAfetadas(null); }} className={CAMPO} />
              </div>
            </div>
            {varios && (
              <p className="rounded-lg bg-[#FAF5EB] px-3 py-2 text-[13px] text-[#6E5430]">
                Com várias datas, o horário {inicio}–{fim} fica bloqueado em <strong>cada um dos dias</strong> do período (não é um bloqueio contínuo de uma data à outra).
              </p>
            )}
          </>
        )}
        <div>
          <label className={LABEL} htmlFor="b-mot">
            Motivo (opcional)
          </label>
          <input id="b-mot" value={motivo} onChange={(e) => setMotivo(e.target.value)} maxLength={200} placeholder="Ex.: feriado, férias da equipe" className={CAMPO} />
        </div>
        {erro && <Erro>{erro}</Erro>}
        {afetadas && (
          <ul className="space-y-1 rounded-xl border border-[#DEE6E2] p-3 text-sm">
            {afetadas.map((a) => (
              <li key={a.id} className="flex justify-between gap-3">
                <span className="text-[#202B28]">{a.candidato}</span>
                <span className="tabular-nums text-[#626E69]">
                  {new Date(a.inicio).toLocaleString("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Painel>
  );
}

const CAMPOS_REGRAS = [
  { k: "duracao_min", rotulo: "Duração da entrevista", ajuda: "Tempo reservado para cada entrevista", unidade: "minutos", min: 10, max: 180 },
  { k: "intervalo_min", rotulo: "Intervalo entre entrevistas", ajuda: "Pausa entre um atendimento e outro", unidade: "minutos", min: 0, max: 120 },
  { k: "antecedencia_horas", rotulo: "Antecedência mínima", ajuda: "Tempo mínimo para o candidato agendar", unidade: "horas", min: 0, max: 720 },
  { k: "horizonte_dias", rotulo: "Disponibilidade futura", ajuda: "Quantos dias à frente ficam abertos", unidade: "dias", min: 1, max: 120 },
  { k: "vagas_por_horario", rotulo: "Candidatos por horário", ajuda: "Capacidade máxima de cada horário", unidade: "candidatos", min: 1, max: 20 },
] as const;
type ChaveRegra = (typeof CAMPOS_REGRAS)[number]["k"];

function Regras({ config, onSalvo }: { config: ConfigAgenda; onSalvo: (t: string) => void }) {
  const inicial = useMemo(
    () => ({
      duracao_min: String(config.duracao_min),
      intervalo_min: String(config.intervalo_min),
      antecedencia_horas: String(config.antecedencia_horas),
      horizonte_dias: String(config.horizonte_dias),
      vagas_por_horario: String(config.vagas_por_horario),
      link_reuniao: config.link_reuniao ?? "",
    }),
    [config],
  );
  const [v, setV] = useState(inicial);
  const [base, setBase] = useState(inicial);
  const [erro, setErro] = useState<{ texto: string; campo?: string; confirmar?: boolean } | null>(null);
  const [ok, setOk] = useState(false);
  const [pendente, iniciar] = useTransition();
  const alterado = JSON.stringify(v) !== JSON.stringify(base);

  function salvar(confirmar: boolean) {
    setOk(false);
    iniciar(async () => {
      const r = await salvarRegras(
        {
          duracao_min: Number(v.duracao_min),
          intervalo_min: Number(v.intervalo_min),
          antecedencia_horas: Number(v.antecedencia_horas),
          horizonte_dias: Number(v.horizonte_dias),
          vagas_por_horario: Number(v.vagas_por_horario),
          link_reuniao: v.link_reuniao,
        },
        confirmar,
      );
      if (r.ok) {
        setBase(v);
        setErro(null);
        setOk(true);
        onSalvo(r.mensagem);
      } else setErro({ texto: r.erro, campo: r.campo, confirmar: r.precisaConfirmar });
    });
  }

  return (
    <Card titulo="Regras de agendamento" {...AREA_EMPREGOS.proposta}>
      <div className="space-y-4">
        {CAMPOS_REGRAS.map((c) => (
          <div key={c.k}>
            <label className={LABEL} htmlFor={`r-${c.k}`}>
              {c.rotulo}
            </label>
            <div className="flex items-center gap-2">
              <input
                id={`r-${c.k}`}
                type="number"
                inputMode="numeric"
                min={c.min}
                max={c.max}
                step={1}
                value={v[c.k as ChaveRegra]}
                onChange={(e) => setV({ ...v, [c.k]: e.target.value })}
                className={`${CAMPO} max-w-[8rem] text-right tabular-nums`}
                aria-describedby={`r-${c.k}-ajuda`}
                aria-invalid={erro?.campo === c.k}
              />
              <span className="text-sm text-[#626E69]">{c.unidade}</span>
            </div>
            <p id={`r-${c.k}-ajuda`} className={erro?.campo === c.k ? "mt-1 text-[13px] text-[#B42318]" : "mt-1 text-[13px] text-[#626E69]"}>
              {erro?.campo === c.k ? erro.texto : `${c.ajuda} (${c.min} a ${c.max}).`}
            </p>
          </div>
        ))}
        <fieldset className="border-t border-[#75608B]/15 pt-4">
          <legend className="mb-2 text-base font-semibold text-[#202B28]">Reunião online</legend>
          <label className={LABEL} htmlFor="r-link">
            Link da reunião
          </label>
          <input id="r-link" type="url" value={v.link_reuniao} onChange={(e) => setV({ ...v, link_reuniao: e.target.value })} placeholder="https://meet.google.com/…" className={CAMPO} aria-invalid={erro?.campo === "link_reuniao"} />
          <p className={erro?.campo === "link_reuniao" ? "mt-1 text-[13px] text-[#B42318]" : "mt-1 text-[13px] text-[#626E69]"}>
            {erro?.campo === "link_reuniao" ? erro.texto : "Opcional. É o mesmo link para todas as entrevistas — o sistema não gera links individuais."}
          </p>
        </fieldset>
        {erro && !CAMPOS_REGRAS.some((c) => c.k === erro.campo) && erro.campo !== "link_reuniao" && <Erro>{erro.texto}</Erro>}
        {erro?.confirmar && erro.campo === "vagas_por_horario" && (
          <button type="button" onClick={() => salvar(true)} className="text-sm font-medium text-[#B42318] hover:underline">
            Salvar mesmo assim (as entrevistas existentes continuam marcadas)
          </button>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#75608B]/15 pt-4">
          <span className="text-[13px]" aria-live="polite">
            {alterado ? <span className="font-medium text-[#93703D]">Alterações não salvas</span> : ok ? <span className="text-[#27675B]">Regras salvas</span> : <span className="text-[#626E69]">Sem alterações</span>}
          </span>
          <button type="button" onClick={() => salvar(false)} disabled={pendente || !alterado} className="inline-flex items-center gap-2 rounded-xl bg-[#27675B] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#20564C] disabled:opacity-50">
            {pendente && <Spinner />}
            Salvar regras
          </button>
        </div>
      </div>
    </Card>
  );
}

function Previa({ hoje, config, previa }: { hoje: string; config: ConfigAgenda; previa: HorarioPrevia[] | null }) {
  const [verTodos, setVerTodos] = useState(false);
  const dias = useMemo(() => {
    const m = new Map<string, HorarioPrevia[]>();
    for (const h of previa ?? []) (m.get(h.data) ?? m.set(h.data, []).get(h.data)!).push(h);
    return [...m.entries()];
  }, [previa]);
  const fimPeriodo = somarDias(hoje, config.horizonte_dias);
  const capacidade = config.vagas_por_horario;
  const vagasRestantes = (previa ?? []).reduce((s, h) => s + Math.max(0, h.restantes), 0);
  const visiveis = verTodos ? dias : dias.slice(0, 4);
  return (
    <section className={`rounded-2xl border border-t-[3px] border-[#DEE6E2] border-t-[#42658A] bg-white p-5 ${SOMBRA}`}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[#42658A]">Horários disponíveis para candidatos</h2>
        {previa && <span className="rounded-full bg-[#EFF4FA] px-2.5 py-0.5 text-[13px] font-semibold tabular-nums text-[#42658A]">{previa.length} {previa.length === 1 ? "horário" : "horários"}</span>}
      </div>
      <p className="text-[13px] text-[#626E69]">
        Prévia do que o candidato vê de {rotuloDia(hoje, hoje).split(" · ")[1]} a {rotuloDia(fimPeriodo, hoje).split(" · ")[1]}, com as regras salvas. Clicar não reserva nada.
        {capacidade > 1 && ` Cada horário aceita até ${capacidade} candidatos · ${vagasRestantes} vagas restantes no total.`}
      </p>
      {!previa ? (
        <div className="mt-3">
          <Erro>Não foi possível calcular a prévia.</Erro>
        </div>
      ) : dias.length === 0 ? (
        <p className="mt-3 rounded-xl bg-[#F3F5F5] px-4 py-5 text-center text-sm text-[#626E69]">Nenhum horário livre no período. Confira os horários semanais e os bloqueios.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {visiveis.map(([data, horas]) => (
            <div key={data}>
              <p className="mb-1.5 text-sm font-medium text-[#202B28]">{rotuloDia(data, hoje)}</p>
              <div className="flex flex-wrap gap-1.5">
                {horas.map((h) => (
                  <span key={h.hora} className="rounded-lg border border-[#DEE6E2] bg-[#F8FAF9] px-2 py-1 text-[13px] tabular-nums text-[#202B28]" title={capacidade > 1 ? `${h.restantes} de ${capacidade} vagas restantes` : undefined}>
                    {h.hora}
                    {capacidade > 1 && <span className="ml-1 text-[#626E69]">· {h.restantes}</span>}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {dias.length > 4 && (
            <button type="button" onClick={() => setVerTodos((v) => !v)} className="text-sm font-medium text-[#42658A] hover:underline">
              {verTodos ? "Mostrar menos" : `Ver mais datas (${dias.length - 4})`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
