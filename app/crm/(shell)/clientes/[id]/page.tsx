import { ehSelfService, TAG_SELF_SERVICE } from "@/lib/crm/origem";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { TIPOS_INTERACAO, TIPO_INTERACAO_LABEL, TIPO_INTERACAO_COR } from "@/lib/crm/interacoes";
import { TIPOS_ARQUIVO, TIPO_ARQUIVO_LABEL, type TipoArquivo } from "@/lib/crm/arquivos";
import { CAMINHO_DOCUMENTO_JRPASS_REGEX, urlDocumentoJrPassCrm } from "@/lib/supabase/documentosJrPass";
import type { Estagio, EstagioEntrega } from "@/lib/crm/types";
import { ESTAGIOS } from "@/lib/crm/estagios";
import { rotuloOrigem } from "@/lib/crm/canal";
import {
  updateCliente,
  addInteracao,
  moveEstagio,
  moveEstagioEntrega,
  deleteInteracao,
  addArquivo,
  deleteArquivo,
  arquivarCliente,
} from "../../../actions";
import { ClienteForm } from "../ClienteForm";
import { BotaoSalvar } from "../BotaoSalvar";
import { ARQUIVO_ICONS } from "../ArquivoIcons";
import { INTERACAO_ICONS } from "../InteracaoIcons";
import { ProcessoCard } from "./ProcessoCard";
import { ESTAGIOS_ENTREGA } from "@/lib/crm/estagiosEntrega";
import {
  ETAPAS_COMERCIAL,
  ETAPAS_EXECUCAO,
  execucaoIniciada,
  formatarDataCurta,
  resumoComercial,
  resumoExecucao,
  type EventoHistorico,
} from "@/lib/crm/processo";
import { FinanceiroSection } from "./financeiro/FinanceiroSection";
import { carregarFinanceiro } from "./financeiro/carregar";
import { ConfirmacaoCadastro } from "./ConfirmacaoCadastro";
import { UploadArquivoCliente } from "./UploadArquivoCliente";
import { ehArquivoStorage } from "@/lib/crm/arquivosStorage";

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
  searchParams: Promise<{ erro?: string; criado?: string }>;
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
    .select(
      "id, tipo, conteudo, created_at, data_evento, autor_id, estagio_destino, estagio_entrega_destino, perfis(nome, email)",
    )
    .eq("cliente_id", id)
    .order("created_at", { ascending: false });

  // Data em que o cliente entrou em cada estágio — construída a partir do
  // histórico de "mudanca_estagio" (mais recente primeiro, então o primeiro
  // valor encontrado por estágio já é o mais atual). Prefere data_evento
  // (a data "oficial" informada pelo usuário, pedido do Wilson,
  // 19/set/2026) e cai para created_at em registros antigos, sem essa
  // informação.
  const datasPorEstagio: Partial<Record<Estagio, string>> = {};
  const datasPorEstagioEntrega: Partial<Record<EstagioEntrega, string>> = {};
  for (const i of interacoes ?? []) {
    const data = i.data_evento ?? i.created_at;
    if (i.tipo === "mudanca_estagio" && i.estagio_destino) {
      const estagioDestino = i.estagio_destino as Estagio;
      if (!datasPorEstagio[estagioDestino]) {
        datasPorEstagio[estagioDestino] = data;
      }
    }
    if (i.tipo === "mudanca_estagio_entrega" && i.estagio_entrega_destino) {
      const estagioEntregaDestino = i.estagio_entrega_destino as EstagioEntrega;
      if (!datasPorEstagioEntrega[estagioEntregaDestino]) {
        datasPorEstagioEntrega[estagioEntregaDestino] = data;
      }
    }
  }

  const { data: arquivos } = await supabase
    .from("arquivos_cliente")
    .select("id, tipo, label, url, created_at")
    .eq("cliente_id", id)
    .order("created_at", { ascending: true });

  // Leads de JR Pass anteriores a 01/out/2026 só têm o caminho do
  // documento no texto das observações ("(arquivo: ...)") — mostra como
  // card também, sem precisar de migração. Não duplica se já existe.
  const documentosLegados = Array.from(
    String(cliente.observacoes ?? "").matchAll(/\(arquivo: ([^)\s]+)\)/g),
  )
    .map((m) => m[1])
    .filter((c) => CAMINHO_DOCUMENTO_JRPASS_REGEX.test(c))
    .filter((c) => !(arquivos ?? []).some((a) => a.url === urlDocumentoJrPassCrm(c)))
    .map((c) => ({
      id: `legado-${c}`,
      tipo: "outro",
      label: c.includes("/passagem-") ? "Passagem — JR Pass" : "Passaporte — JR Pass",
      url: urlDocumentoJrPassCrm(c),
      created_at: "",
      legado: true,
    }));
  const arquivosExibidos = [
    ...documentosLegados,
    ...(arquivos ?? []).map((a) => ({ ...a, legado: false })),
  ];

  // Financeiro (Wilson, 22/out/2026): parcelas, recebimentos e histórico.
  const financeiro = await carregarFinanceiro(supabase, cliente);

  // Parceiros da agência para atribuição manual do lead (migração 021).
  const { data: parceirosAgencia } = await supabase
    .from("parceiros")
    .select("id, nome, ativo")
    .eq("tipo", "agencia")
    .order("nome");
  const parceiroDoLead = (parceirosAgencia ?? []).find((p) => p.id === cliente.parceiro_id);
  const arquivado = Boolean(cliente.arquivado_em);
  const alternarArquivo = arquivarCliente.bind(null, id, !arquivado);

  // ── Cards "Comercial" e "Execução da viagem" (Wilson, 22/out/2026) ──
  // Tudo vem do status gravado e do histórico de interações; nada é
  // preenchido com dado fictício.
  type LinhaInteracao = NonNullable<typeof interacoes>[number];
  const autorDe = (i: LinhaInteracao) => {
    const p = Array.isArray(i.perfis) ? i.perfis[0] : i.perfis;
    return (p?.nome || p?.email || null) as string | null;
  };
  const mudancasComercial = (interacoes ?? []).filter((i) => i.tipo === "mudanca_estagio" && i.estagio_destino);
  const mudancasExecucao = (interacoes ?? []).filter(
    (i) => i.tipo === "mudanca_estagio_entrega" && i.estagio_entrega_destino,
  );
  const rotuloComercial = (v: string) => ESTAGIOS.find((e) => e.valor === v)?.label ?? v;
  const rotuloExecucao = (v: string) => ESTAGIOS_ENTREGA.find((e) => e.valor === v)?.label ?? v;

  const resumoCom = resumoComercial(
    cliente.estagio as Estagio,
    mudancasComercial.map((i) => String(i.estagio_destino)),
  );
  const iniciouExecucao = execucaoIniciada(
    cliente.estagio_entrega as EstagioEntrega,
    mudancasExecucao.length > 0,
    cliente.estagio as Estagio,
  );
  const resumoExe = resumoExecucao(cliente.estagio_entrega as EstagioEntrega, iniciouExecucao);

  // Data de entrada na etapa atual: só do histórico. Exceção: "Novo lead"
  // usa a data de cadastro do cliente, que é quando ele de fato entrou.
  const dataEntradaComercial =
    datasPorEstagio[cliente.estagio as Estagio] ??
    (cliente.estagio === "novo_lead" ? cliente.created_at : null);
  const dataEntradaExecucao = iniciouExecucao
    ? (datasPorEstagioEntrega[cliente.estagio_entrega as EstagioEntrega] ?? null)
    : null;

  const historicoComercial: EventoHistorico[] = [
    ...mudancasComercial.map((i) => ({
      id: i.id,
      data: i.data_evento ?? i.created_at,
      dataInformada: Boolean(i.data_evento),
      titulo: `→ ${rotuloComercial(String(i.estagio_destino))}`,
      conteudo: i.conteudo,
      autor: autorDe(i),
    })),
    {
      id: "cadastro",
      data: cliente.created_at,
      dataInformada: true,
      titulo: "Lead cadastrado",
      conteudo: null,
      autor: null,
    },
  ];
  const historicoExecucao: EventoHistorico[] = mudancasExecucao.map((i) => ({
    id: i.id,
    data: i.data_evento ?? i.created_at,
    dataInformada: Boolean(i.data_evento),
    titulo: `→ ${rotuloExecucao(String(i.estagio_entrega_destino))}`,
    conteudo: i.conteudo,
    autor: autorDe(i),
  }));

  // Responsável: só aparece se estiver cadastrado no cliente.
  let responsavel: string | null = null;
  if (cliente.responsavel_id) {
    const { data: perfilResp } = await supabase
      .from("perfis")
      .select("nome, email")
      .eq("id", cliente.responsavel_id)
      .maybeSingle();
    responsavel = perfilResp?.nome || perfilResp?.email || null;
  }
  const dataViagem = formatarDataCurta(cliente.data_viagem);

  const updateClienteComId = updateCliente.bind(null, id);
  const addInteracaoComId = addInteracao.bind(null, id);
  const moveEstagioComId = moveEstagio.bind(null, id);
  const moveEstagioEntregaComId = moveEstagioEntrega.bind(null, id);
  const addArquivoComId = addArquivo.bind(null, id);

  return (
    <div>
      {sp.criado === "1" && <ConfirmacaoCadastro nome={cliente.nome} clienteId={id} />}
      <Link href="/crm/clientes" className="text-[13px] text-[#626B75] transition hover:text-[#1C3A5E]">
        ← Clientes
      </Link>


      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[13px] text-[#1C3A5E]/70">Cliente</p>
          <h1 className={`text-3xl font-medium text-[#20252B] md:text-4xl`}>
            {cliente.nome}
          </h1>
          {ehSelfService(cliente.origem) && (
            <span className="mt-1 inline-block rounded-full bg-sky-100 px-2.5 py-0.5 text-[13px] font-semibold text-sky-700">
              {TAG_SELF_SERVICE}
            </span>
          )}
          {(cliente.email || cliente.telefone || dataViagem) && (
            <p className="mt-2 text-sm text-[#626B75]">
              {[cliente.email, cliente.telefone, dataViagem ? `Viagem em ${dataViagem}` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          <p className="mt-1 text-[13px] text-[#626B75]">
            Origem: {rotuloOrigem(cliente.canal, cliente.canal_detalhe)}
            {cliente.utm?.utm_campaign ? ` · campanha ${cliente.utm.utm_campaign}` : ""}
            {cliente.utm?.landing ? ` · entrou por ${cliente.utm.landing}` : ""}
          </p>
          {parceiroDoLead && (
            <span className="ml-2 mt-1 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[13px] font-semibold text-amber-800">
              Parceiro: {parceiroDoLead.nome}
            </span>
          )}
          {arquivado && (
            <span className="ml-2 mt-1 inline-block rounded-full bg-black/10 px-2.5 py-0.5 text-[13px] font-semibold text-[#626B75]">
              Arquivado em {new Date(cliente.arquivado_em!).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}
            </span>
          )}
        </div>
        <form action={alternarArquivo}>
          {/* Mais visível (Wilson, 21/out/2026: "muito difícil de ver"). */}
          <button
            type="submit"
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              arquivado
                ? "border-black bg-black text-white hover:bg-black/80"
                : "border-black bg-white text-[#20252B] hover:bg-black hover:text-white"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="4" rx="1" />
              <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
              <path d="M10 12h4" />
            </svg>
            {arquivado ? "Desarquivar lead" : "Arquivar lead inativo"}
          </button>
        </form>
      </div>

      {/* Dois processos independentes, lado a lado (empilhados no celular). */}
      <div className="mt-6 grid items-stretch gap-4 md:grid-cols-2">
        <ProcessoCard
          titulo="Comercial"
          tema="comercial"
          etapas={ETAPAS_COMERCIAL}
          resumo={resumoCom}
          dataEntrada={dataEntradaComercial}
          extras={responsavel ? [{ rotulo: "Responsável", valor: responsavel }] : []}
          aviso={arquivado ? "Lead arquivado por inatividade." : null}
          historico={historicoComercial}
          action={moveEstagioComId}
          opcoes={ESTAGIOS}
          estagioAtualSelect={cliente.estagio}
        />
        <ProcessoCard
          titulo="Execução da viagem"
          tema="execucao"
          etapas={ETAPAS_EXECUCAO}
          resumo={resumoExe}
          dataEntrada={dataEntradaExecucao}
          extras={dataViagem ? [{ rotulo: "Data da viagem", valor: dataViagem }] : []}
          aviso={
            !iniciouExecucao && cliente.estagio === "fechado_perdido"
              ? "Negócio perdido no comercial."
              : null
          }
          historico={historicoExecucao}
          action={moveEstagioEntregaComId}
          opcoes={ESTAGIOS_ENTREGA}
          estagioAtualSelect={iniciouExecucao ? cliente.estagio_entrega : ""}
          placeholderSelect="Iniciar em…"
        />
      </div>

      {sp.erro === "1" && (
        <p className="mt-4 text-sm text-red-600">Não foi possível salvar as alterações.</p>
      )}
      {sp.erro === "2" && (
        <p className="mt-4 text-sm text-red-600">Não foi possível registrar a interação.</p>
      )}
      {sp.erro === "3" && (
        <p className="mt-4 text-sm text-red-600">Não foi possível adicionar o arquivo. Preencha o link.</p>
      )}
      {sp.erro === "4" && (
        <p className="mt-4 text-sm text-red-600">Não foi possível registrar o pagamento. Preencha o valor.</p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Paleta por grupo (Wilson, 22/out/2026): fundo suave + linha de
            3 px no topo na cor de destaque do grupo. */}
        <div className="rounded-2xl border border-black/[0.06] border-t-[3px] border-t-[#786343] bg-[#FAF7F1] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] p-6 md:p-8 lg:col-span-3">
          <h2 className={`mb-6 text-lg font-medium text-[#786343]`}>
            Dados do cliente
          </h2>
          <ClienteForm
            action={updateClienteComId}
            cliente={cliente}
            submitLabel="Salvar alterações"
            parceiros={parceirosAgencia ?? []}
          />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-black/[0.06] border-t-[3px] border-t-[#665582] bg-[#F5F3FA] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] p-6">
            <h2 className={`mb-4 text-lg font-medium text-[#665582]`}>
              Nova interação
            </h2>
            <form action={addInteracaoComId} className="space-y-4">
              <select
                name="tipo"
                defaultValue="nota"
                className="w-full rounded-xl border border-[#D5DAE0] bg-white px-4 py-2.5 text-sm text-[#20252B] outline-none transition focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/25"
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
                className="w-full rounded-xl border border-[#D5DAE0] bg-white px-4 py-2.5 text-sm text-[#20252B] placeholder-[#9AA2AB] outline-none transition focus:border-[#24476B] focus:ring-2 focus:ring-[#24476B]/25"
              />
              {/* Trava contra cliques repetidos (Wilson, 22/out/2026): o botão
                  fica desabilitado enquanto o envio está em andamento. */}
              <BotaoSalvar
                rotulo="Registrar"
                rotuloPendente="Registrando…"
                className="w-full rounded-xl bg-[#24476B] px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-[#24476B]/25 outline-none transition hover:bg-[#2C5480] hover:shadow-md hover:shadow-[#24476B]/30 focus-visible:ring-2 focus-visible:ring-[#24476B]/40 focus-visible:ring-offset-2"
              />
            </form>
          </div>

          <div className="rounded-2xl border border-black/[0.06] border-t-[3px] border-t-[#59636F] bg-[#F5F6F7] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] p-6">
            <h2 className={`mb-4 text-lg font-medium text-[#59636F]`}>
              Histórico
            </h2>

            {!interacoes || interacoes.length === 0 ? (
              <p className="text-sm text-[#626B75]">Nenhuma interação registrada ainda.</p>
            ) : (
              <ul className="space-y-5">
                {interacoes.map((i) => {
                  const autor = Array.isArray(i.perfis) ? i.perfis[0] : i.perfis;
                  const excluirInteracao = deleteInteracao.bind(null, id, i.id);
                  const cor = TIPO_INTERACAO_COR[i.tipo] ?? "#57534E";
                  const Icon = INTERACAO_ICONS[i.tipo];
                  return (
                    <li key={i.id} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[#20252B]">
                        {Icon && <Icon className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1 border-l border-black/10 pl-4">
                        <div className="flex items-center justify-between gap-3">
                          <span
                            className="text-[13px] font-medium"
                            style={{ color: cor }}
                          >
                            {TIPO_INTERACAO_LABEL[i.tipo] ?? i.tipo}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] text-[#626B75]">
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
                        <p className="mt-1.5 text-sm leading-normal text-[#20252B] whitespace-pre-wrap">
                          {i.conteudo}
                        </p>
                        {autor?.email && <p className="mt-1 text-[13px] text-[#626B75]">— {autor.email}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <FinanceiroSection clienteId={id} {...financeiro} />
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] p-6 md:p-8">
        <h2 className={`mb-5 text-lg font-medium text-[#20252B]`}>Arquivos</h2>

        {arquivosExibidos.length === 0 ? (
          <p className="text-sm text-[#626B75]">Nenhum arquivo adicionado ainda.</p>
        ) : (
          // Wilson, 22/out/2026: arquivos em formato de lista, com o nome
          // completo (antes eram cards em grade com o nome truncado).
          <ul className="divide-y divide-black/5 overflow-hidden rounded-xl border border-black/5">
            {arquivosExibidos.map((a) => {
              const Icon = ARQUIVO_ICONS[a.tipo as TipoArquivo] ?? ARQUIVO_ICONS.outro;
              const excluirArquivo = deleteArquivo.bind(null, id, a.id);
              const doStorage = ehArquivoStorage(a.url);
              const href = doStorage ? `/crm/arquivo-cliente?id=${a.id}` : a.url;
              const externo = doStorage || a.url.startsWith("http") || a.url.startsWith("/crm/documento-jrpass");
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 bg-white px-4 py-3 transition hover:bg-[#FAF9F6]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#20252B]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <a
                    href={href}
                    target={externo ? "_blank" : undefined}
                    rel={externo ? "noopener noreferrer" : undefined}
                    className="min-w-0 flex-1 break-words text-sm font-medium text-[#20252B] hover:underline"
                  >
                    {a.label}
                  </a>
                  <span className="hidden shrink-0 text-[13px] text-[#626B75] sm:inline">
                    {TIPO_ARQUIVO_LABEL[a.tipo as TipoArquivo] ?? "Arquivo"}
                  </span>
                  {!a.legado && (
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
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <UploadArquivoCliente clienteId={id} tipos={TIPOS_ARQUIVO} />

        <p className="mt-6 text-[13px] text-[#626B75]">Ou adicionar um link</p>
        <form action={addArquivoComId} className="mt-2 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <select
            name="tipo"
            defaultValue="roteiro_draft"
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#20252B] outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10"
          >
            {TIPOS_ARQUIVO.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.label}
              </option>
            ))}
          </select>
          {/* Pedido do Wilson, 18/set/2026 ("porque esse campo rotulo
              existe?"): não é mais obrigatório — em branco, a action
              addArquivo usa o nome do tipo escolhido como rótulo. Só
              precisa ser preenchido pra diferenciar dois arquivos do
              mesmo tipo (ex.: duas propostas). */}
          <input
            type="text"
            name="label"
            placeholder="Rótulo (opcional) — só p/ diferenciar do mesmo tipo"
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#20252B] placeholder-black/30 outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10"
          />
          <input
            type="text"
            name="url"
            required
            placeholder="Link — ex.: lpfyslh1 ou https://…"
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#20252B] placeholder-black/30 outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#1C3A5E] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#1C3A5E]/25 transition hover:bg-[#254a73] hover:shadow-md hover:shadow-[#1C3A5E]/30"
          >
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}
