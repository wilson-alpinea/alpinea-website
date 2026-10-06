import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  adicionarBloqueioAgenda,
  adicionarJanelaAgenda,
  atualizarStatusEntrevista,
  removerBloqueioAgenda,
  removerJanelaAgenda,
  salvarConfigAgenda,
} from "@/app/crm/actions";
import { CONFIG_PADRAO, DIAS_SEMANA, gerarHorarios, hojeBrasilia, type Bloqueio, type ConfigAgenda, type Janela } from "@/app/lib/agendaEntrevista";

// Agenda da pré-entrevista (etapa 4) — página interna do CRM onde a equipe
// define quando atende e bloqueia horários (Wilson, 06/out/2026).

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Agenda de pré-entrevistas — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

const input = "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none focus:border-[#1C3A5E]";
const botao = "rounded-xl bg-[#1C3A5E] px-4 py-2 text-sm font-medium text-white";
const hm = (t: string | null) => (t ? t.slice(0, 5) : "");

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ salvo?: string; erro?: string }> }) {
  const { salvo, erro } = await searchParams;
  const supabase = await createClient();
  const hoje = hojeBrasilia();
  const [{ data: cfg, error: erroCfg }, { data: janelas }, { data: bloqueios }, { data: entrevistas }] = await Promise.all([
    supabase.from("entrevista_config").select("*").eq("id", 1).maybeSingle(),
    supabase.from("entrevista_janelas").select("*").order("dia_semana").order("inicio"),
    supabase.from("entrevista_bloqueios").select("*").gte("data", hoje).order("data").order("inicio"),
    supabase
      .from("entrevistas_agendadas")
      .select("id, inicio, status, candidatura_id, candidaturas_vagas(nome, sobrenome, vaga_titulo, vaga_empresa, telefone)")
      .gte("inicio", new Date(new Date(`${hoje}T00:00:00-03:00`).getTime() - 7 * 86400000).toISOString())
      .order("inicio"),
  ]);
  const config: ConfigAgenda = { ...CONFIG_PADRAO, ...(cfg ?? {}) };
  const livres = gerarHorarios({
    config,
    janelas: (janelas ?? []) as Janela[],
    bloqueios: (bloqueios ?? []) as Bloqueio[],
    ocupados: (entrevistas ?? []).filter((e) => e.status === "agendada").map((e) => e.inicio as string),
  });
  const livresPorDia = livres.reduce<Record<string, string[]>>((acc, h) => ((acc[h.data] ??= []).push(h.hora), acc), {});

  return (
    <div>
      <Link href="/crm/empregos" className="text-xs uppercase tracking-[0.2em] text-black/40 hover:text-black">
        ← Empregos
      </Link>
      <h1 className={`${display.className} mt-3 text-3xl font-medium text-black md:text-4xl`}>Agenda de pré-entrevistas</h1>
      <p className="mt-2 max-w-2xl text-sm text-black/55">
        Defina quando a equipe atende e bloqueie datas ou horários. O candidato só vê os horários livres que sobram — tudo em
        horário de Brasília.
      </p>
      {erroCfg && (
        <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Rode supabase/migrations/017_empregos_financiamento_entrevista.sql no Supabase para ativar a agenda.
        </p>
      )}
      {salvo && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Salvo.</p>}
      {erro && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="text-sm font-medium text-black">Horários de atendimento (toda semana)</h2>
          <ul className="mt-3 divide-y divide-black/[0.06] text-sm">
            {(janelas ?? []).length === 0 && <li className="py-2 text-black/40">Nenhum horário cadastrado — o candidato não verá opções.</li>}
            {(janelas ?? []).map((j) => (
              <li key={j.id} className="flex items-center justify-between py-2">
                <span>
                  <strong className="font-medium">{DIAS_SEMANA[j.dia_semana]}</strong> · {hm(j.inicio)}–{hm(j.fim)}
                </span>
                <form action={removerJanelaAgenda.bind(null, j.id)}>
                  <button className="text-xs text-red-500 hover:underline">Remover</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={adicionarJanelaAgenda} className="mt-4 space-y-3 border-t border-black/[0.06] pt-4">
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map((d, i) => (
                <label key={d} className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1 text-xs">
                  <input type="checkbox" name="dia_semana" value={i} defaultChecked={i >= 1 && i <= 5} />
                  {d.slice(0, 3)}
                </label>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <input type="time" name="inicio" defaultValue="09:00" className={input} required />
              <span className="text-black/40">até</span>
              <input type="time" name="fim" defaultValue="12:00" className={input} required />
              <button className={botao}>Adicionar</button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="text-sm font-medium text-black">Restrições (datas/horários bloqueados)</h2>
          <ul className="mt-3 divide-y divide-black/[0.06] text-sm">
            {(bloqueios ?? []).length === 0 && <li className="py-2 text-black/40">Nenhuma restrição futura.</li>}
            {(bloqueios ?? []).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-2">
                <span>
                  <strong className="font-medium">{b.data.split("-").reverse().join("/")}</strong> · {b.inicio ? `${hm(b.inicio)}–${hm(b.fim)}` : "dia inteiro"}
                  {b.motivo && <span className="text-black/45"> · {b.motivo}</span>}
                </span>
                <form action={removerBloqueioAgenda.bind(null, b.id)}>
                  <button className="text-xs text-red-500 hover:underline">Remover</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={adicionarBloqueioAgenda} className="mt-4 space-y-3 border-t border-black/[0.06] pt-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <input type="date" name="data" min={hoje} className={input} required />
              <span className="text-black/40">até</span>
              <input type="date" name="data_fim" min={hoje} className={input} />
              <label className="flex items-center gap-1.5 text-xs text-black/60">
                <input type="checkbox" name="dia_inteiro" defaultChecked /> dia inteiro
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input type="time" name="inicio" className={input} />
              <span className="text-black/40">até</span>
              <input type="time" name="fim" className={input} />
              <input type="text" name="motivo" placeholder="Motivo (opcional)" className={`${input} min-w-[160px] flex-1`} />
              <button className={botao}>Bloquear</button>
            </div>
            <p className="text-[11px] text-black/40">Para bloquear só um trecho, desmarque &quot;dia inteiro&quot; e informe o horário.</p>
          </form>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="text-sm font-medium text-black">Regras</h2>
          <form action={salvarConfigAgenda} className="mt-3 grid grid-cols-2 gap-3 text-xs text-black/55">
            <label>
              Duração (min)
              <input type="number" name="duracao_min" defaultValue={config.duracao_min} min={10} max={180} className={`${input} mt-1 w-full`} />
            </label>
            <label>
              Intervalo entre entrevistas (min)
              <input type="number" name="intervalo_min" defaultValue={config.intervalo_min} min={0} max={120} className={`${input} mt-1 w-full`} />
            </label>
            <label>
              Antecedência mínima (horas)
              <input type="number" name="antecedencia_horas" defaultValue={config.antecedencia_horas} min={0} max={720} className={`${input} mt-1 w-full`} />
            </label>
            <label>
              Abrir agenda para os próximos (dias)
              <input type="number" name="horizonte_dias" defaultValue={config.horizonte_dias} min={1} max={120} className={`${input} mt-1 w-full`} />
            </label>
            <label>
              Candidatos por horário
              <input type="number" name="vagas_por_horario" defaultValue={config.vagas_por_horario} min={1} max={20} className={`${input} mt-1 w-full`} />
            </label>
            <label className="col-span-2">
              Link fixo da reunião (Meet/Zoom — opcional)
              <input type="url" name="link_reuniao" defaultValue={config.link_reuniao ?? ""} placeholder="https://meet.google.com/…" className={`${input} mt-1 w-full`} />
            </label>
            <div className="col-span-2">
              <button className={botao}>Salvar regras</button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-5">
          <h2 className="text-sm font-medium text-black">O que o candidato vê agora ({livres.length} horários livres)</h2>
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto text-xs">
            {Object.keys(livresPorDia).length === 0 && <p className="text-black/40">Nenhum horário livre.</p>}
            {Object.entries(livresPorDia).map(([data, horas]) => (
              <div key={data}>
                <p className="font-medium text-black/70">
                  {new Date(`${data}T12:00:00Z`).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" })}
                </p>
                <p className="mt-0.5 text-black/50">{horas.join(" · ")}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="text-sm font-medium text-black">Pré-entrevistas</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              <tr>
                <th className="py-2 font-medium">Quando (Brasília)</th>
                <th className="py-2 font-medium">Candidato</th>
                <th className="py-2 font-medium">Vaga</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {(entrevistas ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-black/40">
                    Nenhuma pré-entrevista.
                  </td>
                </tr>
              )}
              {(entrevistas ?? []).map((e) => {
                const c = (Array.isArray(e.candidaturas_vagas) ? e.candidaturas_vagas[0] : e.candidaturas_vagas) as
                  | { nome: string; sobrenome: string; vaga_titulo: string; vaga_empresa: string; telefone: string }
                  | null;
                return (
                  <tr key={e.id}>
                    <td className="py-2.5">
                      {new Date(e.inicio).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-2.5">
                      <Link href={`/crm/empregos/${e.candidatura_id}`} className="font-medium hover:underline">
                        {c ? `${c.nome} ${c.sobrenome}` : "—"}
                      </Link>
                      <p className="text-xs text-black/45">{c?.telefone}</p>
                    </td>
                    <td className="py-2.5 text-xs text-black/60">{c ? `${c.vaga_empresa} — ${c.vaga_titulo}` : ""}</td>
                    <td className="py-2.5">
                      <form action={atualizarStatusEntrevista.bind(null, e.id)} className="flex items-center gap-2">
                        <select name="status" defaultValue={e.status} className={`${input} py-1 text-xs`}>
                          <option value="agendada">Agendada</option>
                          <option value="realizada">Realizada</option>
                          <option value="faltou">Faltou</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                        <button className="text-xs text-[#1C3A5E] underline">Salvar</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
