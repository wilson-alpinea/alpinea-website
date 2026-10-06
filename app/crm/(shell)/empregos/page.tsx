import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CLASSIFICACOES, STATUS_CANDIDATURA, isClassificacao } from "@/lib/crm/empregos";

// Área de Empregos do CRM — pedido do Wilson, 06/out/2026: "ao preencher o
// screening isso alimente o CRM e crie 3 tipos de candidato: eliminados,
// aprovados com score acima de 80 e abaixo". Cada candidatura de /empregos
// cai aqui já classificada (ver app/api/empregos-candidatura).

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Empregos — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

type Linha = {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  vaga_id: string;
  vaga_titulo: string;
  vaga_empresa: string;
  pontuacao: number | null;
  classificacao: string;
  motivos_eliminacao: string[] | null;
  pontos_revisar: string[] | null;
  status: string;
  etapa: string;
  ficha_enviada_em?: string | null;
  created_at: string;
};

export default async function EmpregosCrmPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; q?: string; vaga?: string }>;
}) {
  const params = await searchParams;
  const tipo = params.tipo && isClassificacao(params.tipo) ? params.tipo : "aprovado_alto";
  const busca = (params.q ?? "").trim();
  const vagaFiltro = params.vaga ?? "";

  const supabase = await createClient();

  // Contagem por tipo (para as abas) — uma consulta leve só das colunas
  // necessárias.
  const { data: todas, error: erroContagem } = await supabase
    .from("candidaturas_vagas")
    .select("classificacao, vaga_id, vaga_titulo, vaga_empresa");
  if (erroContagem) console.error("Erro ao contar candidaturas:", erroContagem);
  const contagem: Record<string, number> = {};
  const vagas = new Map<string, string>();
  for (const c of todas ?? []) {
    contagem[c.classificacao] = (contagem[c.classificacao] ?? 0) + 1;
    vagas.set(c.vaga_id, `${c.vaga_empresa} — ${c.vaga_titulo}`);
  }

  let query = supabase
    .from("candidaturas_vagas")
    // "*" pra funcionar antes e depois da migração 016 (ficha_enviada_em).
    .select("*")
    .eq("classificacao", tipo)
    .order("pontuacao", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(300);
  if (busca) {
    const b = busca.replace(/[%,()]/g, " ");
    query = query.or(`nome.ilike.%${b}%,sobrenome.ilike.%${b}%,email.ilike.%${b}%,telefone.ilike.%${b}%`);
  }
  if (vagaFiltro) query = query.eq("vaga_id", vagaFiltro);

  const { data, error } = await query;
  if (error) console.error("Erro ao carregar candidaturas:", error);
  const lista = (data ?? []) as Linha[];
  const tipoAtual = CLASSIFICACOES.find((c) => c.valor === tipo)!;
  const statusLabel = (s: string) => STATUS_CANDIDATURA.find((x) => x.valor === s)?.label ?? s;

  const qs = (t: string) => {
    const u = new URLSearchParams();
    u.set("tipo", t);
    if (busca) u.set("q", busca);
    if (vagaFiltro) u.set("vaga", vagaFiltro);
    return `/crm/empregos?${u.toString()}`;
  };

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/40">
        {(todas ?? []).length} {(todas ?? []).length === 1 ? "candidatura" : "candidaturas"}
      </p>
      <h1 className={`${display.className} text-3xl font-medium text-black md:text-4xl`}>Empregos</h1>

      {error && (
        <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Não foi possível carregar as candidaturas. Se a migração 015 ainda não foi rodada no Supabase, rode
          supabase/migrations/015_candidaturas_classificacao.sql.
        </p>
      )}

      {/* Os 3 tipos de candidato */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {CLASSIFICACOES.map((c) => {
          const ativo = c.valor === tipo;
          return (
            <Link
              key={c.valor}
              href={qs(c.valor)}
              className={`rounded-2xl border p-5 transition ${ativo ? "bg-white shadow-sm" : "border-black/10 bg-white/60 hover:bg-white"}`}
              style={ativo ? { borderColor: c.cor } : undefined}
            >
              <p className="text-xs font-medium uppercase tracking-[0.12em]" style={{ color: c.cor }}>
                {c.label}
              </p>
              <p className={`${display.className} mt-2 text-4xl font-medium text-black`}>{contagem[c.valor] ?? 0}</p>
              <p className="mt-1 text-xs leading-5 text-black/45">{c.descricao}</p>
            </Link>
          );
        })}
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input type="hidden" name="tipo" value={tipo} />
        <input
          type="text"
          name="q"
          defaultValue={busca}
          placeholder="Buscar por nome, e-mail ou telefone…"
          className="min-w-[240px] flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-black placeholder-black/30 outline-none focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10"
        />
        <select
          name="vaga"
          defaultValue={vagaFiltro}
          className="max-w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-black outline-none focus:border-[#1C3A5E]"
        >
          <option value="">Todas as vagas</option>
          {Array.from(vagas.entries())
            .sort((a, b) => a[1].localeCompare(b[1], "pt-BR"))
            .map(([id, nome]) => (
              <option key={id} value={id}>
                {nome}
              </option>
            ))}
        </select>
        <button type="submit" className="rounded-xl bg-[#1C3A5E] px-5 py-2.5 text-sm font-medium text-white">
          Filtrar
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-black/10 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-black/10 text-[11px] uppercase tracking-[0.12em] text-black/40">
            <tr>
              <th className="px-5 py-3 font-medium">Candidato</th>
              <th className="px-5 py-3 font-medium">Vaga</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">{tipo === "eliminado" ? "Motivo" : "Revisar"}</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.06]">
            {lista.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-black/40">
                  Nenhum candidato em “{tipoAtual.label}” com esses filtros.
                </td>
              </tr>
            )}
            {lista.map((c) => {
              const etiquetas = tipo === "eliminado" ? c.motivos_eliminacao ?? [] : c.pontos_revisar ?? [];
              return (
                <tr key={c.id} className="align-top transition hover:bg-black/[0.015]">
                  <td className="px-5 py-3.5">
                    <Link href={`/crm/empregos/${c.id}`} className="font-medium text-black hover:underline">
                      {c.nome} {c.sobrenome}
                    </Link>
                    <p className="text-xs text-black/45">{c.telefone}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-black/80">{c.vaga_empresa}</p>
                    <p className="text-xs text-black/45">{c.vaga_titulo}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/[0.07]">
                        <div className="h-full rounded-full" style={{ width: `${c.pontuacao ?? 0}%`, background: tipoAtual.cor }} />
                      </div>
                      <span className="tabular-nums text-black/75">{c.pontuacao ?? "—"}</span>
                    </div>
                    {c.ficha_enviada_em && <p className="mt-1 text-[11px] text-black/45">Ficha enviada{c.etapa === "concluida" ? " · foto" : ""}</p>}
                  </td>
                  <td className="max-w-[260px] px-5 py-3.5">
                    {etiquetas.length === 0 ? (
                      <span className="text-xs text-black/30">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {etiquetas.slice(0, 3).map((e) => (
                          <span
                            key={e}
                            className="rounded-full px-2 py-0.5 text-[11px]"
                            style={{ background: tipo === "eliminado" ? CLASSIFICACOES[2].fundo : "rgba(201,160,58,0.12)", color: tipo === "eliminado" ? CLASSIFICACOES[2].cor : "#8a6a1c" }}
                          >
                            {e.length > 60 ? `${e.slice(0, 57)}…` : e}
                          </span>
                        ))}
                        {etiquetas.length > 3 && <span className="text-[11px] text-black/40">+{etiquetas.length - 3}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-black/60">{statusLabel(c.status)}</td>
                  <td className="px-5 py-3.5 text-xs text-black/45">
                    {new Date(c.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
