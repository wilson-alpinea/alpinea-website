import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { TIPOS_INTERACAO, TIPO_INTERACAO_LABEL } from "@/lib/crm/interacoes";
import { TIPOS_ARQUIVO, TIPO_ARQUIVO_LABEL, type TipoArquivo } from "@/lib/crm/arquivos";
import {
  updateCliente,
  addInteracao,
  moveEstagio,
  deleteInteracao,
  addArquivo,
  deleteArquivo,
} from "../../../actions";
import { ClienteForm } from "../ClienteForm";
import { EstagioSelect } from "../../pipeline/EstagioSelect";
import { ARQUIVO_ICONS } from "../ArquivoIcons";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Cliente — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function ClienteDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const supabase = await createClient();

  const { data: cliente, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) console.error("Erro ao carregar cliente:", error);
  if (!cliente) notFound();

  const { data: interacoes } = await supabase
    .from("interacoes")
    .select("id, tipo, conteudo, created_at, autor_id, perfis(nome, email)")
    .eq("cliente_id", id)
    .order("created_at", { ascending: false });

  const { data: arquivos } = await supabase
    .from("arquivos_cliente")
    .select("id, tipo, label, url, created_at")
    .eq("cliente_id", id)
    .order("created_at", { ascending: true });

  const updateClienteComId = updateCliente.bind(null, id);
  const addInteracaoComId = addInteracao.bind(null, id);
  const moveEstagioComId = moveEstagio.bind(null, id);
  const addArquivoComId = addArquivo.bind(null, id);

  return (
    <div>
      <Link href="/crm/clientes" className="text-xs uppercase tracking-[0.2em] text-black/40 transition hover:text-black">
        ← Clientes
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={`${display.className} text-3xl font-medium text-black md:text-4xl`}>
            {cliente.nome}
          </h1>
        </div>
        <div className="w-48">
          <EstagioSelect
            action={moveEstagioComId}
            estagioAtual={cliente.estagio}
            className="w-full cursor-pointer rounded-full border border-black/15 bg-white px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-black/70 outline-none transition focus:border-black/40"
          />
        </div>
      </div>

      {sp.erro === "1" && (
        <p className="mt-4 text-sm text-red-600">Não foi possível salvar as alterações.</p>
      )}
      {sp.erro === "2" && (
        <p className="mt-4 text-sm text-red-600">Não foi possível registrar a interação.</p>
      )}
      {sp.erro === "3" && (
        <p className="mt-4 text-sm text-red-600">Não foi possível adicionar o arquivo. Preencha rótulo e link.</p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-black/10 bg-[#57534E]/[0.05] p-6 md:p-8 lg:col-span-3">
          <h2 className={`${display.className} mb-6 text-lg font-medium text-black`}>
            Dados do cliente
          </h2>
          <ClienteForm
            action={updateClienteComId}
            cliente={cliente}
            submitLabel="Salvar alterações"
            showEstagio
          />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-black/10 bg-[#57534E]/[0.05] p-6">
            <h2 className={`${display.className} mb-4 text-lg font-medium text-black`}>
              Nova interação
            </h2>
            <form action={addInteracaoComId} className="space-y-4">
              <select
                name="tipo"
                defaultValue="nota"
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-black outline-none transition focus:border-black/40"
              >
                {TIPOS_INTERACAO.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.label}
                  </option>
                ))}
              </select>
              <textarea
                name="conteudo"
                required
                rows={3}
                placeholder="O que foi conversado, enviado ou combinado…"
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-black placeholder-black/30 outline-none transition focus:border-black/40"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-[#1C3A5E] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#254a73]"
              >
                Registrar
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-black/10 bg-[#57534E]/[0.05] p-6">
            <h2 className={`${display.className} mb-4 text-lg font-medium text-black`}>
              Histórico
            </h2>

            {!interacoes || interacoes.length === 0 ? (
              <p className="text-sm text-black/40">Nenhuma interação registrada ainda.</p>
            ) : (
              <ul className="space-y-5">
                {interacoes.map((i) => {
                  const autor = Array.isArray(i.perfis) ? i.perfis[0] : i.perfis;
                  const excluirInteracao = deleteInteracao.bind(null, id, i.id);
                  return (
                    <li key={i.id} className="group border-l border-black/10 pl-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.15em] text-black/40">
                          {TIPO_INTERACAO_LABEL[i.tipo] ?? i.tipo}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-black/30">
                            {new Date(i.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <form action={excluirInteracao}>
                            <button
                              type="submit"
                              title="Excluir interação"
                              aria-label="Excluir interação"
                              className="px-1 text-sm leading-none text-black/20 transition hover:text-red-600"
                            >
                              ×
                            </button>
                          </form>
                        </div>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-black/80 whitespace-pre-wrap">
                        {i.conteudo}
                      </p>
                      {autor?.nome && <p className="mt-1 text-xs text-black/30">— {autor.nome}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 bg-[#57534E]/[0.05] p-6 md:p-8">
        <h2 className={`${display.className} mb-5 text-lg font-medium text-black`}>Arquivos</h2>

        {!arquivos || arquivos.length === 0 ? (
          <p className="text-sm text-black/40">Nenhum arquivo adicionado ainda.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {arquivos.map((a) => {
              const Icon = ARQUIVO_ICONS[a.tipo as TipoArquivo] ?? ARQUIVO_ICONS.outro;
              const excluirArquivo = deleteArquivo.bind(null, id, a.id);
              const externo = a.url.startsWith("http");
              return (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-xl border border-black/10 bg-white p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1C3A5E]/10 text-[#1C3A5E]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black/35">
                      {TIPO_ARQUIVO_LABEL[a.tipo as TipoArquivo] ?? "Arquivo"}
                    </p>
                    <a
                      href={a.url}
                      target={externo ? "_blank" : undefined}
                      rel={externo ? "noopener noreferrer" : undefined}
                      className="mt-0.5 block truncate text-sm font-medium text-black hover:underline"
                    >
                      {a.label}
                    </a>
                  </div>
                  <form action={excluirArquivo}>
                    <button
                      type="submit"
                      title="Remover arquivo"
                      aria-label="Remover arquivo"
                      className="shrink-0 px-1 text-sm leading-none text-black/20 transition hover:text-red-600"
                    >
                      ×
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}

        <form action={addArquivoComId} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <select
            name="tipo"
            defaultValue="roteiro_draft"
            className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-black/40"
          >
            {TIPOS_ARQUIVO.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="label"
            required
            placeholder="Rótulo — ex.: Roteiro Personalizado — Versão 1"
            className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder-black/30 outline-none transition focus:border-black/40"
          />
          <input
            type="text"
            name="url"
            required
            placeholder="Link — ex.: lpfyslh1 ou https://…"
            className="rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black placeholder-black/30 outline-none transition focus:border-black/40"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#1C3A5E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#254a73]"
          >
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}
