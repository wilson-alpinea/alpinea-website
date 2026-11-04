import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { donoObrigatorio, obterAcesso } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { dataHoraSP } from "@/lib/crm/andamentoManual";
import type { EntradaBlacklist } from "@/lib/empregos/blacklist";
import { adicionarBlacklist, removerBlacklist } from "@/app/crm/empregosExtrasActions";

// Blacklist de candidatos (Wilson, 04/nov/2026 — migração 037): por nome
// completo, CPF, e-mail ou telefone. Quem bate tem as candidaturas anuladas
// (atuais e futuras) e não é processado como ativo.

export const metadata: Metadata = {
  title: "Blacklist — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

const CARTAO = "rounded-2xl border border-[#DEE6E2] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]";
const CAMPO = "mt-1 block w-full rounded-xl border border-[#DEE6E2] bg-white px-3 py-2 text-sm text-[#202B28] outline-none focus:border-[#27675B]";
const cpfFmt = (d: string) => d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

export default async function BlacklistPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  // Consultor não vê a blacklist (dados de outros candidatos).
  if (donoObrigatorio(await obterAcesso())) notFound();
  const { ok, erro } = await searchParams;
  const admin = createAdminClient();
  const { data, error } = await admin.from("empregos_blacklist").select("*").order("created_at", { ascending: false }).limit(2000);
  const entradas = (data ?? []) as EntradaBlacklist[];
  const ativas = entradas.filter((e) => !e.removido_em);
  const removidas = entradas.filter((e) => e.removido_em).slice(0, 30);
  const { data: anuladas } = error
    ? { data: [] }
    : await admin.from("candidaturas_vagas").select("id, nome, sobrenome, vaga_empresa, vaga_titulo, blacklist_id, anulada_em").not("anulada_em", "is", null).order("anulada_em", { ascending: false }).limit(1000);
  const porEntrada = new Map<string, { id: string; nome: string; vaga: string }[]>();
  for (const c of anuladas ?? []) {
    const k = String(c.blacklist_id ?? "");
    porEntrada.set(k, [...(porEntrada.get(k) ?? []), { id: c.id, nome: `${c.nome ?? ""} ${c.sobrenome ?? ""}`.trim(), vaga: [c.vaga_empresa, c.vaga_titulo].filter(Boolean).join(" — ") }]);
  }

  return (
    <div>
      <Link href="/crm/empregos" className="text-[13px] text-[#626E69] hover:text-[#27675B]">
        ← Candidatos
      </Link>
      <h1 className="mt-3 text-[#202B28]">Blacklist de candidatos</h1>
      <p className="mt-0.5 max-w-2xl text-sm text-[#626E69]">
        Quem está aqui tem as candidaturas anuladas — as atuais e as que chegarem — e não aparece como ativo, no portal da empreiteira nem nas notificações.
        Basta um dado bater: nome completo (sem acento), CPF, e-mail ou telefone.
      </p>

      {ok && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{ok}</p>}
      {erro && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}
      {error && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Rode a migração 037 no Supabase para usar a blacklist.</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className={CARTAO}>
          <h2 className="text-[#202B28]">Na blacklist ({ativas.length})</h2>
          {ativas.length === 0 ? (
            <p className="mt-2 text-sm text-[#626E69]">Ninguém na blacklist.</p>
          ) : (
            <ul className="mt-3 divide-y divide-black/[0.06]">
              {ativas.map((e) => {
                const cands = porEntrada.get(e.id) ?? [];
                return (
                  <li key={e.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                    <div className="min-w-0 text-sm">
                      <p className="font-medium text-[#202B28]">{e.nome_completo || e.email || (e.cpf ? cpfFmt(e.cpf) : e.telefone)}</p>
                      <p className="mt-0.5 text-[13px] text-[#626E69]">
                        {[e.cpf && `CPF ${cpfFmt(e.cpf)}`, e.email, e.telefone && `Tel. ${e.telefone}`].filter(Boolean).join(" · ") || "Só pelo nome"}
                      </p>
                      <p className="mt-1 text-[13px] text-[#20252B]">Motivo: {e.motivo}</p>
                      <p className="mt-0.5 text-[12px] text-[#626E69]">
                        {e.created_by_email ?? "equipe"} · {dataHoraSP(e.created_at)}
                      </p>
                      {cands.length > 0 && (
                        <p className="mt-1 text-[12px] text-[#626E69]">
                          Candidaturas anuladas:{" "}
                          {cands.map((c, i) => (
                            <span key={c.id}>
                              {i > 0 && ", "}
                              <Link href={`/crm/empregos/${c.id}`} className="text-[#1C3A5E] underline underline-offset-2" title={c.vaga}>
                                {c.vaga || c.nome}
                              </Link>
                            </span>
                          ))}
                        </p>
                      )}
                    </div>
                    <form action={removerBlacklist.bind(null, e.id)}>
                      <button type="submit" className="rounded-lg border border-black/15 px-3 py-1.5 text-[13px] text-[#20252B] hover:border-black/40">
                        Remover
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
          {removidas.length > 0 && (
            <details className="mt-4 border-t border-black/10 pt-3">
              <summary className="cursor-pointer text-[13px] text-[#626E69]">Removidos recentemente ({removidas.length})</summary>
              <ul className="mt-2 space-y-1 text-[13px] text-[#626E69]">
                {removidas.map((e) => (
                  <li key={e.id}>
                    {e.nome_completo || e.email || e.cpf || e.telefone} — removido por {e.removido_por ?? "equipe"} em {dataHoraSP(e.removido_em!)}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <form action={adicionarBlacklist} className={`${CARTAO} h-fit space-y-3`}>
          <h2 className="text-[#202B28]">Adicionar</h2>
          <p className="text-[13px] text-[#626E69]">Preencha pelo menos um dado. Pela tela do candidato dá para incluir com os dados dele.</p>
          <label className="block text-[13px] text-[#626E69]">
            Nome completo
            <input name="nome" maxLength={160} className={CAMPO} />
          </label>
          <label className="block text-[13px] text-[#626E69]">
            CPF
            <input name="cpf" inputMode="numeric" maxLength={14} placeholder="000.000.000-00" className={CAMPO} />
          </label>
          <label className="block text-[13px] text-[#626E69]">
            E-mail
            <input name="email" type="email" maxLength={160} className={CAMPO} />
          </label>
          <label className="block text-[13px] text-[#626E69]">
            Telefone (com DDD)
            <input name="telefone" maxLength={30} className={CAMPO} />
          </label>
          <label className="block text-[13px] text-[#626E69]">
            Motivo
            <textarea name="motivo" required rows={3} maxLength={1000} className={CAMPO} />
          </label>
          <button type="submit" className="w-full rounded-xl bg-[#B42318] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#9A1E14]">
            Adicionar à blacklist
          </button>
        </form>
      </div>
    </div>
  );
}
