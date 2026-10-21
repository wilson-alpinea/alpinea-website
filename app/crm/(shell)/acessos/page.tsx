import { Bodoni_Moda } from "next/font/google";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { exigirAdmin } from "@/lib/crm/acesso";
import { PAPEL_LABEL, isPapelCrm } from "@/lib/crm/unidades";
import { VAGAS } from "@/app/lib/vagasCatalogo";
import { alternarParceiroAtivo } from "../../acessosActions";
import { EditarUsuario, NovoParceiroForm, NovoUsuarioForm, VagaEmpreiteiraSelect, type ParceiroOpcao } from "./FormulariosAcesso";

// Acessos do CRM (Wilson, 21/out/2026): parceiros da agência veem só os
// leads deles, empreiteiras veem só os candidatos das vagas delas, admin vê
// tudo.

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Acessos — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

const cartao = "rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] sm:p-6";

export default async function AcessosPage() {
  const acesso = await exigirAdmin();
  const supabase = await createClient();

  const [{ data: parceirosBrutos }, { data: perfis }, { data: vinculos }] = await Promise.all([
    supabase.from("parceiros").select("id, nome, slug, tipo, ativo, created_at").order("nome"),
    supabase.from("perfis").select("id, nome, email, papel, parceiro_id, created_at").order("created_at"),
    supabase.from("vagas_empreiteira").select("vaga_id, parceiro_id"),
  ]);
  const parceiros = (parceirosBrutos ?? []) as (ParceiroOpcao & { slug: string })[];
  const nomeParceiro = new Map(parceiros.map((p) => [p.id, p.nome]));
  const empreiteiras = parceiros.filter((p) => p.tipo === "empreiteira");
  const vagaParaEmpreiteira = new Map((vinculos ?? []).map((v) => [v.vaga_id as string, v.parceiro_id as string]));
  const usuariosPorParceiro = new Map<string, number>();
  for (const p of perfis ?? []) if (p.parceiro_id) usuariosPorParceiro.set(p.parceiro_id, (usuariosPorParceiro.get(p.parceiro_id) ?? 0) + 1);

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/40">Agência e empregos</p>
        <h1 className={`${display.className} text-3xl font-medium text-black md:text-4xl`}>Acessos</h1>
        <p className="mt-2 max-w-2xl text-sm text-black/55">
          Parceiros da agência entram no CRM e veem só os leads que eles geraram (pelo link de indicação ou atribuídos aqui na ficha
          do cliente). Empreiteiras veem só o pipeline dos candidatos das vagas delas. Ninguém de fora edita nada.
        </p>
      </div>

      <section className={cartao}>
        <h2 className="text-sm font-medium text-black">Parceiros e empreiteiras</h2>
        <div className="mt-4">
          <NovoParceiroForm />
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-black/45">
              <tr>
                <th className="py-2 pr-3 font-medium">Empresa</th>
                <th className="py-2 pr-3 font-medium">Tipo</th>
                <th className="py-2 pr-3 font-medium">Link de indicação</th>
                <th className="py-2 pr-3 font-medium">Usuários</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {parceiros.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-xs text-black/40">Nenhum parceiro cadastrado.</td>
                </tr>
              )}
              {parceiros.map((p) => (
                <tr key={p.id} className="border-t border-black/5 align-top">
                  <td className="py-2 pr-3 text-black/85">{p.nome}</td>
                  <td className="py-2 pr-3 text-black/60">{p.tipo === "agencia" ? "Parceiro da agência" : "Empreiteira"}</td>
                  <td className="py-2 pr-3">
                    {p.tipo === "agencia" ? (
                      <code className="break-all rounded bg-black/[0.04] px-1.5 py-0.5 text-xs">https://www.alpinea.io/?parceiro={p.slug}</code>
                    ) : (
                      <span className="text-xs text-black/35">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 tabular-nums text-black/60">{usuariosPorParceiro.get(p.id) ?? 0}</td>
                  <td className="py-2">
                    <form action={alternarParceiroAtivo.bind(null, p.id, !p.ativo)}>
                      <button type="submit" className={`rounded-full px-2.5 py-0.5 text-xs ${p.ativo ? "bg-emerald-100 text-emerald-800" : "bg-black/10 text-black/55"}`}>
                        {p.ativo ? "Ativo" : "Inativo"} · {p.ativo ? "desativar" : "ativar"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-black/45">
          O link de indicação funciona em qualquer página do site (ex.: <code>alpinea.io/produtos/jrpass?parceiro=codigo</code>) e
          vale por 30 dias no navegador do cliente. Parceiro inativo perde o acesso e deixa de receber novos leads.
        </p>
      </section>

      <section className={cartao}>
        <h2 className="text-sm font-medium text-black">Usuários</h2>
        <div className="mt-4">
          <NovoUsuarioForm parceiros={parceiros} />
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-black/45">
              <tr>
                <th className="py-2 pr-3 font-medium">Pessoa</th>
                <th className="py-2 pr-3 font-medium">Acesso</th>
                <th className="py-2 pr-3 font-medium">Empresa</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {(perfis ?? []).map((u) => (
                <tr key={u.id} className="border-t border-black/5 align-top">
                  <td className="py-2 pr-3">
                    <span className="block text-black/85">{u.nome || "—"}</span>
                    <span className="block text-xs text-black/45">{u.email}</span>
                  </td>
                  <td className="py-2 pr-3 text-black/70">{isPapelCrm(u.papel) ? PAPEL_LABEL[u.papel] : <span className="text-red-700">Sem acesso</span>}</td>
                  <td className="py-2 pr-3 text-black/60">{u.parceiro_id ? nomeParceiro.get(u.parceiro_id) ?? "—" : "—"}</td>
                  <td className="py-2">
                    <EditarUsuario userId={u.id} papel={u.papel} parceiroId={u.parceiro_id} parceiros={parceiros} ehVoce={u.id === acesso.userId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-black/45">
          Usuário criado direto no painel do Supabase entra como &quot;Sem acesso&quot; até ser liberado aqui.
        </p>
      </section>

      <section className={cartao}>
        <h2 className="text-sm font-medium text-black">Vagas de cada empreiteira</h2>
        <p className="mt-1 text-xs text-black/50">A empreiteira vê os candidatos das vagas ligadas a ela. Salva na hora.</p>
        {empreiteiras.length === 0 ? (
          <p className="mt-4 text-sm text-black/45">Cadastre uma empreiteira acima para vincular vagas.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs text-black/45">
                <tr>
                  <th className="py-2 pr-3 font-medium">Vaga</th>
                  <th className="py-2 pr-3 font-medium">Fábrica / cidade</th>
                  <th className="w-64 py-2 font-medium">Empreiteira</th>
                </tr>
              </thead>
              <tbody>
                {VAGAS.map((v) => (
                  <tr key={v.id} className="border-t border-black/5">
                    <td className="py-2 pr-3">
                      <span className="block text-black/85">{v.titulo}</span>
                      <span className="block text-xs text-black/40">{v.codigo}</span>
                    </td>
                    <td className="py-2 pr-3 text-xs text-black/60">
                      {v.empresa} · {v.cidade}
                    </td>
                    <td className="py-2">
                      <VagaEmpreiteiraSelect vagaId={v.id} atual={vagaParaEmpreiteira.get(v.id) ?? null} empreiteiras={empreiteiras} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
