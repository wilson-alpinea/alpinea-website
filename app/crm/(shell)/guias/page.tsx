import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { obterAcesso } from "@/lib/crm/acesso";
import { CIDADES_GUIA_CRM, IDIOMAS_GUIA, TIPOS_GUIA, formatarDiaria, iniciaisGuia, rotuloTipoGuia, type Guia } from "@/lib/crm/guias";
import { excluirGuia, salvarGuia } from "@/app/crm/guiasActions";
import { SOMBRA } from "../components/PainelUi";

// Guia Turístico (Wilson, 27/nov/2026): painel de cadastro dos nossos guias,
// só no CRM de Turismo — não é acompanhamento de venda. A oportunidade que
// contrata guia escolhe um guia daqui (campo "Guia Turístico" no cliente).

export const metadata: Metadata = {
  title: "Guia Turístico — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

const CAMPO = "w-full rounded-xl border border-[#D5DAE0] bg-white px-3.5 py-2.5 text-sm text-[#20252B] placeholder-[#9AA2AB] outline-none transition focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/25";
const ROTULO = "mb-1 block text-[13px] text-[#626B75]";
const CARTAO = `rounded-2xl border border-black/[0.06] bg-white ${SOMBRA}`;
const COR = "#28665D";

function Chips({ itens, vazio }: { itens: string[]; vazio: string }) {
  if (!itens.length) return <span className="text-[13px] text-[#8A929B]">{vazio}</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {itens.map((i) => (
        <span key={i} className="rounded-full bg-[#F0F7F5] px-2.5 py-0.5 text-[12px] font-medium text-[#28665D]">
          {i}
        </span>
      ))}
    </span>
  );
}

// Miniatura circular (migração 045); sem foto, as iniciais do nome.
function FotoGuia({ guia, tamanho = "h-14 w-14 text-base" }: { guia: Pick<Guia, "nome" | "foto_url">; tamanho?: string }) {
  return guia.foto_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={guia.foto_url} alt={`Foto de ${guia.nome}`} className={`${tamanho} shrink-0 rounded-full object-cover ring-2 ring-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]`} />
  ) : (
    <span aria-hidden="true" className={`${tamanho} flex shrink-0 items-center justify-center rounded-full bg-[#F0F7F5] font-semibold text-[#28665D] ring-2 ring-white`}>
      {iniciaisGuia(guia.nome)}
    </span>
  );
}

function FormGuia({ guia }: { guia?: Guia }) {
  const outrosIdiomas = (guia?.idiomas ?? []).filter((i) => !(IDIOMAS_GUIA as readonly string[]).includes(i));
  const outrasCidades = (guia?.cidades ?? []).filter((c) => !(CIDADES_GUIA_CRM as readonly string[]).includes(c));
  const sufixo = guia?.id ?? "novo";
  return (
    <form action={salvarGuia} className="grid gap-4 sm:grid-cols-2">
      {guia && <input type="hidden" name="id" value={guia.id} />}
      <div className="flex items-center gap-4 sm:col-span-2">
        {guia ? <FotoGuia guia={guia} tamanho="h-16 w-16 text-lg" /> : <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-[#B8C0C8] text-[11px] text-[#8A929B]">Foto</span>}
        <div className="min-w-0 flex-1">
          <label className={ROTULO} htmlFor={`foto-${sufixo}`}>
            Foto (JPG, PNG ou WebP, até 2 MB — aparece em círculo)
          </label>
          <input
            id={`foto-${sufixo}`}
            type="file"
            name="foto"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-[13px] text-[#626B75] file:mr-3 file:rounded-full file:border-0 file:bg-[#F0F7F5] file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-[#28665D] hover:file:bg-[#E2F0EC]"
          />
          {guia?.foto_url && (
            <label className="mt-1.5 flex items-center gap-2 text-[13px] text-[#626B75]">
              <input type="checkbox" name="remover_foto" className="h-3.5 w-3.5 accent-[#B42318]" />
              Remover foto
            </label>
          )}
        </div>
      </div>

      <label className="sm:col-span-2">
        <span className={ROTULO}>Nome</span>
        <input name="nome" required maxLength={160} defaultValue={guia?.nome ?? ""} className={CAMPO} placeholder="Nome completo do guia" />
      </label>

      <fieldset className="sm:col-span-2">
        <legend className={ROTULO}>Tipo</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {TIPOS_GUIA.map((t) => (
            <label key={t.valor} className="flex cursor-pointer gap-2.5 rounded-xl border border-[#D5DAE0] bg-white p-3 text-sm has-[:checked]:border-[#28665D] has-[:checked]:bg-[#F0F7F5]">
              <input type="radio" name="tipo" value={t.valor} defaultChecked={(guia?.tipo ?? "brasileiro") === t.valor} className="mt-0.5 h-4 w-4 accent-[#28665D]" />
              <span>
                <span className="block font-medium text-[#20252B]">{t.label}</span>
                <span className="block text-[12px] text-[#626B75]">{t.detalhe}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={ROTULO}>Idiomas</legend>
        <div className="flex flex-wrap gap-2">
          {IDIOMAS_GUIA.map((i) => (
            <label key={i} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D5DAE0] bg-white px-3 py-1 text-[13px] has-[:checked]:border-[#28665D] has-[:checked]:bg-[#F0F7F5]">
              <input type="checkbox" name="idiomas" value={i} defaultChecked={guia?.idiomas.includes(i) ?? i === "Português"} className="h-3.5 w-3.5 accent-[#28665D]" />
              {i}
            </label>
          ))}
        </div>
        <input name="outros_idiomas" defaultValue={outrosIdiomas.join(", ")} maxLength={200} className={`mt-2 ${CAMPO}`} placeholder="Outros idiomas, separados por vírgula" />
      </fieldset>

      <fieldset>
        <legend className={ROTULO}>Cidades que atende</legend>
        <div className="flex flex-wrap gap-2">
          {CIDADES_GUIA_CRM.map((c) => (
            <label key={c} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#D5DAE0] bg-white px-3 py-1 text-[13px] has-[:checked]:border-[#28665D] has-[:checked]:bg-[#F0F7F5]">
              <input type="checkbox" name="cidades" value={c} defaultChecked={guia?.cidades.includes(c) ?? false} className="h-3.5 w-3.5 accent-[#28665D]" />
              {c}
            </label>
          ))}
        </div>
        <input name="outras_cidades" defaultValue={outrasCidades.join(", ")} maxLength={300} className={`mt-2 ${CAMPO}`} placeholder="Outras cidades, separadas por vírgula" />
      </fieldset>

      <label>
        <span className={ROTULO}>Cidade onde mora</span>
        <input name="base_cidade" defaultValue={guia?.base_cidade ?? ""} maxLength={120} className={CAMPO} placeholder="Ex.: Tóquio" />
      </label>
      <label>
        <span className={ROTULO}>Diária (¥)</span>
        <input name="diaria_jpy" inputMode="numeric" defaultValue={guia?.diaria_jpy ?? ""} className={CAMPO} placeholder="Ex.: 35000" />
      </label>
      <label>
        <span className={ROTULO}>WhatsApp / telefone</span>
        <input name="telefone" defaultValue={guia?.telefone ?? ""} maxLength={60} className={CAMPO} placeholder="+81 90-0000-0000" />
      </label>
      <label>
        <span className={ROTULO}>E-mail</span>
        <input name="email" type="email" defaultValue={guia?.email ?? ""} maxLength={200} className={CAMPO} />
      </label>
      <label>
        <span className={ROTULO}>LINE ID</span>
        <input name="line_id" defaultValue={guia?.line_id ?? ""} maxLength={80} className={CAMPO} />
      </label>
      <div className="flex flex-col justify-end gap-2 pb-1">
        <label className="flex items-center gap-2 text-sm text-[#20252B]">
          <input type="checkbox" name="licenciado" defaultChecked={guia?.licenciado ?? false} className="h-4 w-4 accent-[#28665D]" />
          Guia licenciado (通訳案内士)
        </label>
        {guia && (
          <label className="flex items-center gap-2 text-sm text-[#20252B]">
            <input type="checkbox" name="ativo" defaultChecked={guia.ativo} className="h-4 w-4 accent-[#28665D]" />
            Ativo (aparece nas oportunidades)
          </label>
        )}
      </div>
      <label className="sm:col-span-2">
        <span className={ROTULO}>Observações</span>
        <textarea name="observacoes" rows={3} defaultValue={guia?.observacoes ?? ""} maxLength={4000} className={CAMPO} placeholder="Especialidades, forma de pagamento, disponibilidade…" />
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2" id={`acoes-${sufixo}`}>
        <button type="submit" className="rounded-xl bg-[#1C3A5E] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#254a73]">
          {guia ? "Salvar alterações" : "Cadastrar guia"}
        </button>
        {guia && (
          <span className="text-[12px] text-[#8A929B]">
            Última alteração {new Date(guia.updated_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}
            {guia.updated_by_email ? ` · ${guia.updated_by_email}` : ""}
          </span>
        )}
      </div>
    </form>
  );
}

export default async function GuiasPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const { ok, erro } = await searchParams;
  const acesso = await obterAcesso();
  const podeExcluir = acesso?.papel === "admin" || !!acesso?.permissoes?.deletar;
  const admin = createAdminClient();
  const [rGuias, rCli] = await Promise.all([
    admin.from("guias").select("*").order("ativo", { ascending: false }).order("nome"),
    admin.from("clientes").select("id, nome, data_viagem, guia_id").not("guia_id", "is", null).order("data_viagem", { ascending: false }).limit(2000),
  ]);
  const semTabela = !!rGuias.error;
  const guias = (rGuias.data ?? []) as Guia[];
  const porGuia = new Map<string, { id: string; nome: string; data_viagem: string | null }[]>();
  for (const c of rCli.data ?? []) porGuia.set(c.guia_id as string, [...(porGuia.get(c.guia_id as string) ?? []), c as { id: string; nome: string; data_viagem: string | null }]);
  const ativos = guias.filter((g) => g.ativo);

  return (
    <div>
      <p className="mb-2 text-[13px] text-[#626B75]">Turismo</p>
      <h1 className="text-3xl font-medium md:text-4xl">Guia Turístico</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#626B75]">
        Cadastro dos nossos guias. Na oportunidade que contrata guia, o campo “Guia Turístico” mostra os guias ativos daqui.
      </p>

      {ok && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">{ok}</p>}
      {erro && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{erro}</p>}
      {semTabela && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">Rode a migração 044 no Supabase para usar o cadastro de guias.</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Guias ativos", ativos.length],
          ["Brasileiros", ativos.filter((g) => g.tipo === "brasileiro").length],
          ["Locais", ativos.filter((g) => g.tipo === "local").length],
          ["Licenciados", ativos.filter((g) => g.licenciado).length],
        ].map(([r, v]) => (
          <div key={r} className="rounded-xl border border-black/5 bg-white p-4">
            <p className="text-[13px] text-[#626B75]">{r}</p>
            <p className="mt-1 text-2xl font-medium tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <details className={`mt-6 ${CARTAO} border-t-[3px] p-5 md:p-6`} style={{ borderTopColor: COR }} open={!semTabela && guias.length === 0}>
        <summary className="cursor-pointer text-base font-medium text-[#20252B]">+ Novo guia</summary>
        <div className="mt-5">
          <FormGuia />
        </div>
      </details>

      <ul className="mt-6 space-y-3">
        {guias.map((g) => {
          const oportunidades = porGuia.get(g.id) ?? [];
          return (
            <li key={g.id} id={`guia-${g.id}`} className={`scroll-mt-32 ${CARTAO} p-5 md:p-6 ${g.ativo ? "" : "opacity-70"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-4">
                  <FotoGuia guia={g} />
                  <div className="min-w-0">
                  <p className="text-lg font-medium text-[#20252B]">{g.nome}</p>
                  <p className="mt-0.5 text-[13px] text-[#626B75]">
                    {rotuloTipoGuia(g.tipo)}
                    {g.base_cidade ? ` · mora em ${g.base_cidade}` : ""}
                    {g.licenciado ? " · licenciado" : ""} · {formatarDiaria(g.diaria_jpy)}
                  </p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${g.ativo ? "bg-[#F0F7F5] text-[#28665D]" : "bg-black/[0.05] text-[#626B75]"}`}>{g.ativo ? "Ativo" : "Inativo"}</span>
              </div>

              <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                <div>
                  <p className="mb-1 text-[12px] text-[#626B75]">Idiomas</p>
                  <Chips itens={g.idiomas} vazio="Não informado" />
                </div>
                <div>
                  <p className="mb-1 text-[12px] text-[#626B75]">Cidades</p>
                  <Chips itens={g.cidades} vazio="Não informado" />
                </div>
                <div className="space-y-0.5 text-[13px]">
                  <p className="mb-1 text-[12px] text-[#626B75]">Contato</p>
                  {g.telefone && (
                    <p>
                      <a href={`https://wa.me/${g.telefone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-[#24476B] hover:underline">
                        {g.telefone}
                      </a>
                    </p>
                  )}
                  {g.email && (
                    <p>
                      <a href={`mailto:${g.email}`} className="text-[#24476B] hover:underline">
                        {g.email}
                      </a>
                    </p>
                  )}
                  {g.line_id && <p className="text-[#20252B]">LINE: {g.line_id}</p>}
                  {!g.telefone && !g.email && !g.line_id && <p className="text-[#8A929B]">Não informado</p>}
                </div>
              </div>

              {g.observacoes && <p className="mt-3 whitespace-pre-line text-[13px] text-[#626B75]">{g.observacoes}</p>}

              <p className="mt-3 text-[13px] text-[#626B75]">
                {oportunidades.length ? `${oportunidades.length} oportunidade(s): ` : "Nenhuma oportunidade com este guia."}
                {oportunidades.slice(0, 8).map((o, k) => (
                  <span key={o.id}>
                    {k > 0 && ", "}
                    <Link href={`/crm/clientes/${o.id}`} className="text-[#24476B] hover:underline">
                      {o.nome}
                    </Link>
                  </span>
                ))}
                {oportunidades.length > 8 && ` e mais ${oportunidades.length - 8}`}
              </p>

              <details className="mt-4 border-t border-black/5 pt-3">
                <summary className="cursor-pointer text-sm font-medium text-[#24476B]">Editar</summary>
                <div className="mt-4">
                  <FormGuia guia={g} />
                </div>
                {podeExcluir && (
                  <form action={excluirGuia.bind(null, g.id)} className="mt-3">
                    <button type="submit" className="text-[13px] text-red-700 underline underline-offset-2 hover:text-red-800">
                      Excluir guia
                    </button>
                  </form>
                )}
              </details>
            </li>
          );
        })}
      </ul>
      {!semTabela && guias.length === 0 && <p className="mt-6 text-center text-sm text-[#626B75]">Nenhum guia cadastrado ainda.</p>}
    </div>
  );
}
