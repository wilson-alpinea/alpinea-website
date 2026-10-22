"use client";

import { useCallback, useState } from "react";
import {
  formatarBRL,
  formatarData,
  formatarDataHora,
  nomeParcela,
  type EventoFinanceiro,
  type Lancamento,
  type ParcelaCalculada,
  type ResumoFinanceiro,
} from "@/lib/crm/financeiro";
import { TIPO_PAGAMENTO_LABEL, type TipoPagamento } from "@/lib/crm/pagamentos";
import { FormParcela, type OpcaoServico } from "./FormParcela";
import { FormSinalSaldo } from "./FormSinalSaldo";
import { FormRecebimento } from "./FormRecebimento";
import { ConfirmarParcela, DetalhesParcela, FormReembolso, FormValorContratado, SeloSituacao } from "./Paineis";
import { Aviso, BOTAO_PRIMARIO, BOTAO_SECUNDARIO } from "./ui";

// Seção Financeiro da ficha do cliente (Wilson, 22/out/2026).
// Separa o que é COBRADO (parcelas) do que foi RECEBIDO (lançamentos).
// Os números chegam calculados do servidor (lib/crm/financeiro.ts).

type Filtro = "todas" | "abertas" | "vencidas" | "recebidas";
type PainelAberto =
  | { tipo: "nova" }
  | { tipo: "editar"; parcela: ParcelaCalculada }
  | { tipo: "sinal" }
  | { tipo: "contrato" }
  | { tipo: "contrato_para_sinal" }
  | { tipo: "receber"; parcela: ParcelaCalculada }
  | { tipo: "detalhes"; parcela: ParcelaCalculada }
  | { tipo: "cancelar"; parcela: ParcelaCalculada }
  | { tipo: "excluir"; parcela: ParcelaCalculada }
  | { tipo: "reembolso" }
  | null;

export function FinanceiroSection({
  clienteId,
  hoje,
  propostaC,
  parcelas,
  resumo,
  reembolsos,
  eventos,
  servicos,
  bloqueado,
  abrirRecebimento = null,
}: {
  clienteId: string;
  hoje: string;
  propostaC: number | null;
  parcelas: ParcelaCalculada[];
  resumo: ResumoFinanceiro;
  reembolsos: Lancamento[];
  eventos: EventoFinanceiro[];
  servicos: OpcaoServico[];
  bloqueado: boolean;
  // Vindo da Visão geral / Recebimentos (?receber=<parcela>): abre o
  // formulário de recebimento dessa parcela.
  abrirRecebimento?: string | null;
}) {
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [painel, setPainel] = useState<PainelAberto>(() => {
    const alvo = !bloqueado && abrirRecebimento ? parcelas.find((p) => p.id === abrirRecebimento && p.saldoC > 0 && p.situacao !== "cancelada") : null;
    return alvo ? { tipo: "receber", parcela: alvo } : null;
  });
  const [menu, setMenu] = useState<string | null>(null);
  const fechar = useCallback(() => setPainel(null), []);
  const servicoLabel = (v: string | null) => (v ? servicos.find((s) => s.valor === v)?.label ?? v : null);
  // Os painéis recebem a parcela "viva" (recalculada a cada atualização).
  const viva = (p: ParcelaCalculada) => parcelas.find((x) => x.id === p.id) ?? p;

  const filtros: { id: Filtro; label: string; teste: (p: ParcelaCalculada) => boolean }[] = [
    { id: "todas", label: "Todas", teste: () => true },
    { id: "abertas", label: "Em aberto", teste: (p) => p.saldoC > 0 && p.situacao !== "cancelada" },
    { id: "vencidas", label: "Vencidas", teste: (p) => p.atrasada },
    { id: "recebidas", label: "Recebidas", teste: (p) => p.situacao === "recebida" },
  ];
  const visiveis = parcelas.filter(filtros.find((f) => f.id === filtro)!.teste);
  const disponivelC = resumo.naoDistribuidoC;
  const liquidoC = resumo.recebidoC - resumo.reembolsadoC;

  function abrirSinal() {
    setPainel(resumo.contratadoC === null ? { tipo: "contrato_para_sinal" } : { tipo: "sinal" });
  }

  const botoesTopo = (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={BOTAO_PRIMARIO} onClick={() => setPainel({ tipo: "nova" })} disabled={bloqueado}>
        + Adicionar parcela
      </button>
      <button type="button" className={BOTAO_SECUNDARIO} onClick={abrirSinal} disabled={bloqueado}>
        Criar sinal + saldo
      </button>
    </div>
  );

  return (
    <section id="financeiro" className="scroll-mt-28 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] md:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[#20252B]">Financeiro</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {resumo.contratadoC !== null && (
            <button type="button" className="font-medium text-[#24476B] hover:underline disabled:opacity-50" onClick={() => setPainel({ tipo: "contrato" })} disabled={bloqueado}>
              Alterar valor contratado
            </button>
          )}
          {liquidoC > 0 && (
            <button type="button" className="font-medium text-[#24476B] hover:underline disabled:opacity-50" onClick={() => setPainel({ tipo: "reembolso" })} disabled={bloqueado}>
              Registrar reembolso
            </button>
          )}
        </div>
      </div>

      {bloqueado && (
        <div className="mb-5">
          <Aviso>
            O novo Financeiro precisa da migração <strong>023</strong> no Supabase. Até ela rodar, os dados abaixo são só leitura (recebimentos lidos do status antigo “pago”).
          </Aviso>
        </div>
      )}

      {/* 1. Resumo */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador titulo="Total contratado" cor="#24476B" fundo="#F2F6FC">
          {resumo.contratadoC === null ? (
            <>
              <p className="text-base font-semibold text-[#626B75]">Não definido</p>
              <button type="button" className="mt-1 text-[13px] font-medium text-[#24476B] hover:underline disabled:opacity-50" onClick={() => setPainel({ tipo: "contrato" })} disabled={bloqueado}>
                Definir valor
              </button>
            </>
          ) : (
            <Valor c={resumo.contratadoC} cor="#24476B" />
          )}
        </Indicador>
        <Indicador titulo="Recebido" cor="#28665D" fundo="#F0F7F5">
          <Valor c={resumo.recebidoC} cor="#28665D" />
          {resumo.reembolsadoC > 0 && <p className="mt-1 text-[13px] tabular-nums text-[#626B75]">Reembolsado: {formatarBRL(resumo.reembolsadoC)}</p>}
        </Indicador>
        <Indicador titulo="A receber" cor="#946200" fundo="#FFF8EA">
          <Valor c={resumo.aReceberC} cor="#946200" />
          {resumo.aReceberBaseParcelas && parcelas.length > 0 && <p className="mt-1 text-[13px] text-[#626B75]">Soma das parcelas em aberto</p>}
        </Indicador>
        <Indicador titulo="Em atraso" cor={resumo.emAtrasoC > 0 ? "#B42318" : "#626B75"} fundo={resumo.emAtrasoC > 0 ? "#FDF1EF" : "#F5F6F7"}>
          <Valor c={resumo.emAtrasoC} cor={resumo.emAtrasoC > 0 ? "#B42318" : "#626B75"} />
          <p className="mt-1 text-[13px] text-[#626B75]">Incluído em “A receber”</p>
        </Indicador>
      </div>

      {disponivelC !== null && disponivelC > 0 && parcelas.length > 0 && (
        <div className="mt-3">
          <Aviso>
            <span className="tabular-nums font-semibold">{formatarBRL(disponivelC)}</span> ainda não distribuídos em parcelas.
          </Aviso>
        </div>
      )}
      {disponivelC !== null && disponivelC < 0 && (
        <div className="mt-3">
          <Aviso>
            As parcelas somam <span className="tabular-nums font-semibold">{formatarBRL(-disponivelC)}</span> a mais que o valor contratado.
          </Aviso>
        </div>
      )}

      {/* 2. Parcelas */}
      {parcelas.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-[#D5DAE0] px-5 py-8 text-center">
          <p className="text-base font-semibold text-[#20252B]">Nenhuma parcela cadastrada</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-[#626B75]">Adicione o sinal e o saldo final para acompanhar os vencimentos e recebimentos.</p>
          {resumo.contratadoC === null && (
            <p className="mx-auto mt-2 max-w-md text-[13px] text-[#626B75]">
              O valor contratado ainda não foi definido.{" "}
              <button type="button" className="font-medium text-[#24476B] hover:underline" onClick={() => setPainel({ tipo: "contrato" })} disabled={bloqueado}>
                Definir agora
              </button>
            </p>
          )}
          <div className="mt-4 flex justify-center">{botoesTopo}</div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            {botoesTopo}
            <div className="inline-flex flex-wrap rounded-xl border border-[#D5DAE0] bg-white p-1" role="tablist" aria-label="Filtrar parcelas">
              {filtros.map((f) => {
                const qtd = parcelas.filter(f.teste).length;
                const ativo = filtro === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    role="tab"
                    aria-selected={ativo}
                    onClick={() => setFiltro(f.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm tabular-nums transition ${ativo ? "bg-[#24476B] text-white" : "text-[#626B75] hover:text-[#20252B]"}`}
                  >
                    {f.label} <span className={ativo ? "text-white/75" : "text-[#8A929B]"}>{qtd}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {visiveis.length === 0 ? (
            <p className="rounded-xl bg-[#F5F6F7] px-4 py-6 text-center text-sm text-[#626B75]">Nenhuma parcela neste filtro.</p>
          ) : (
            <>
              {/* Desktop: tabela */}
              <div className="hidden overflow-visible rounded-xl border border-[#E6E9ED] lg:block">
                <table className="w-full text-sm">
                  <thead className="bg-[#F5F6F7] text-left text-[13px] text-[#626B75]">
                    <tr>
                      <th className="px-3 py-2.5 font-medium">Descrição</th>
                      <th className="px-3 py-2.5 font-medium">Serviço</th>
                      <th className="px-3 py-2.5 font-medium">Vencimento</th>
                      <th className="px-3 py-2.5 text-right font-medium">Valor</th>
                      <th className="px-3 py-2.5 text-right font-medium">Recebido</th>
                      <th className="px-3 py-2.5 text-right font-medium">Saldo</th>
                      <th className="px-3 py-2.5 font-medium">Situação</th>
                      <th className="px-3 py-2.5 text-right font-medium">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E9ED]">
                    {visiveis.map((p) => (
                      <tr key={p.id} className={p.situacao === "cancelada" ? "text-[#8A929B]" : "text-[#20252B]"}>
                        <td className="px-3 py-3">
                          <span className={p.situacao === "cancelada" ? "line-through" : "font-medium"}>{nomeParcela(p)}</span>
                        </td>
                        <td className="px-3 py-3 text-[#626B75]">{servicoLabel(p.servico) ?? "—"}</td>
                        <td className="whitespace-nowrap px-3 py-3 tabular-nums">{formatarData(p.data_vencimento)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">{formatarBRL(p.valorC)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-[#28665D]">{p.recebidoC ? formatarBRL(p.recebidoC) : "—"}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums">{p.situacao === "cancelada" ? "—" : formatarBRL(p.saldoC)}</td>
                        <td className="px-3 py-3">
                          <SeloSituacao parcela={p} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <Acoes parcela={p} bloqueado={bloqueado} menuAberto={menu === p.id} setMenu={setMenu} setPainel={setPainel} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Celular: um card por parcela */}
              <ul className="space-y-3 lg:hidden">
                {visiveis.map((p) => (
                  <li key={p.id} className="rounded-xl border border-[#E6E9ED] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`font-medium ${p.situacao === "cancelada" ? "text-[#8A929B] line-through" : "text-[#20252B]"}`}>{nomeParcela(p)}</p>
                        <p className="text-[13px] tabular-nums text-[#626B75]">
                          Vence {formatarData(p.data_vencimento)}
                          {p.servico && ` · ${servicoLabel(p.servico)}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] text-[#626B75]">Saldo</p>
                        <p className="text-lg font-semibold tabular-nums text-[#20252B]">{p.situacao === "cancelada" ? "—" : formatarBRL(p.saldoC)}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <SeloSituacao parcela={p} />
                    </div>
                    <p className="mt-2 text-[13px] tabular-nums text-[#626B75]">
                      Valor {formatarBRL(p.valorC)} · Recebido {formatarBRL(p.recebidoC)}
                    </p>
                    <div className="mt-3">
                      <Acoes parcela={p} bloqueado={bloqueado} menuAberto={menu === `m-${p.id}`} menuId={`m-${p.id}`} setMenu={setMenu} setPainel={setPainel} largo />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Reembolsos */}
      {reembolsos.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-[#20252B]">Reembolsos ao cliente</h3>
          <ul className="divide-y divide-[#E6E9ED] rounded-xl border border-[#E6E9ED] text-sm">
            {reembolsos.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div>
                  <p className="tabular-nums text-[#20252B]">
                    {formatarData(r.data)} · {r.forma_pagamento ? TIPO_PAGAMENTO_LABEL[r.forma_pagamento as TipoPagamento] ?? r.forma_pagamento : "—"}
                  </p>
                  {r.motivo && <p className="text-[13px] text-[#626B75]">Motivo: {r.motivo}</p>}
                </div>
                <span className="font-semibold tabular-nums text-[#B42318]">− {formatarBRL(Math.round(r.valor * 100))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Histórico de alterações */}
      {eventos.length > 0 && (
        <details className="group mt-6 rounded-xl border border-[#E6E9ED]">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-[#20252B] marker:hidden">
            <span className="inline-block transition group-open:rotate-90">›</span> Histórico de alterações ({eventos.length})
          </summary>
          <ol className="divide-y divide-[#E6E9ED] border-t border-[#E6E9ED]">
            {eventos.map((e) => (
              <li key={e.id} className="px-4 py-3 text-sm">
                <p className="text-[#20252B]">{e.descricao}</p>
                {e.motivo && <p className="text-[13px] text-[#20252B]">Motivo: {e.motivo}</p>}
                <p className="text-[13px] tabular-nums text-[#626B75]">
                  {formatarDataHora(e.created_at)}
                  {e.autor && ` · ${e.autor}`}
                </p>
              </li>
            ))}
          </ol>
        </details>
      )}

      {/* Painéis */}
      {painel?.tipo === "nova" && <FormParcela clienteId={clienteId} servicos={servicos} disponivelC={disponivelC} hoje={hoje} onFechar={fechar} />}
      {painel?.tipo === "editar" && <FormParcela clienteId={clienteId} servicos={servicos} disponivelC={disponivelC} hoje={hoje} parcela={viva(painel.parcela)} onFechar={fechar} />}
      {(painel?.tipo === "sinal" || (painel?.tipo === "contrato_para_sinal" && resumo.contratadoC !== null)) && (
        <FormSinalSaldo clienteId={clienteId} contratadoC={resumo.contratadoC!} distribuidoC={resumo.distribuidoC} onFechar={fechar} />
      )}
      {(painel?.tipo === "contrato" || (painel?.tipo === "contrato_para_sinal" && resumo.contratadoC === null)) && (
        <FormValorContratado
          clienteId={clienteId}
          atualC={resumo.contratadoC}
          propostaC={propostaC}
          onFechar={fechar}
          // No atalho, depois de salvar o valor o painel de sinal + saldo abre sozinho.
          onSalvo={painel.tipo === "contrato_para_sinal" ? () => undefined : fechar}
        />
      )}
      {painel?.tipo === "receber" && <FormRecebimento clienteId={clienteId} parcela={viva(painel.parcela)} hoje={hoje} onFechar={fechar} />}
      {painel?.tipo === "detalhes" && (
        <DetalhesParcela
          clienteId={clienteId}
          parcela={viva(painel.parcela)}
          servicoLabel={servicoLabel(painel.parcela.servico)}
          bloqueado={bloqueado}
          onFechar={fechar}
          onRegistrar={() => setPainel({ tipo: "receber", parcela: painel.parcela })}
        />
      )}
      {(painel?.tipo === "cancelar" || painel?.tipo === "excluir") && (
        <ConfirmarParcela clienteId={clienteId} parcela={viva(painel.parcela)} acao={painel.tipo} onFechar={fechar} />
      )}
      {painel?.tipo === "reembolso" && <FormReembolso clienteId={clienteId} hoje={hoje} liquidoC={liquidoC} onFechar={fechar} />}
    </section>
  );
}

function Indicador({ titulo, cor, fundo, children }: { titulo: string; cor: string; fundo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-l-[3px] p-4" style={{ backgroundColor: fundo, borderLeftColor: cor }}>
      <p className="text-[13px] font-medium text-[#626B75]">{titulo}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Valor({ c, cor }: { c: number; cor: string }) {
  return (
    <p className="text-[20px] font-semibold leading-tight tabular-nums sm:text-[24px]" style={{ color: cor }}>
      {formatarBRL(c)}
    </p>
  );
}

function Acoes({
  parcela,
  bloqueado,
  menuAberto,
  menuId,
  setMenu,
  setPainel,
  largo,
}: {
  parcela: ParcelaCalculada;
  bloqueado: boolean;
  menuAberto: boolean;
  menuId?: string;
  setMenu: (id: string | null) => void;
  setPainel: (p: PainelAberto) => void;
  largo?: boolean;
}) {
  const aberta = parcela.saldoC > 0 && parcela.situacao !== "cancelada";
  const id = menuId ?? parcela.id;
  const itens: { label: string; acao: () => void; perigo?: boolean; oculto?: boolean }[] = [
    { label: "Ver detalhes", acao: () => setPainel({ tipo: "detalhes", parcela }), oculto: !aberta },
    { label: "Editar parcela", acao: () => setPainel({ tipo: "editar", parcela }), oculto: bloqueado || parcela.situacao === "cancelada" },
    { label: "Cancelar parcela", acao: () => setPainel({ tipo: "cancelar", parcela }), perigo: true, oculto: bloqueado || parcela.situacao === "cancelada" },
    { label: "Excluir parcela", acao: () => setPainel({ tipo: "excluir", parcela }), perigo: true, oculto: bloqueado },
  ];
  const visiveis = itens.filter((i) => !i.oculto);

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${largo ? "w-full" : ""}`}>
      {aberta && !bloqueado ? (
        <button
          type="button"
          onClick={() => setPainel({ tipo: "receber", parcela })}
          className={`rounded-lg bg-[#24476B] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#2C5480] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/40 ${largo ? "flex-1 py-2" : ""}`}
        >
          Registrar recebimento
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setPainel({ tipo: "detalhes", parcela })}
          className={`rounded-lg border border-[#D5DAE0] bg-white px-3 py-1.5 text-sm font-medium text-[#20252B] transition hover:border-[#24476B]/50 ${largo ? "flex-1 py-2" : ""}`}
        >
          Ver detalhes
        </button>
      )}
      {visiveis.length > 0 && (
        <>
          <button
            type="button"
            aria-label="Mais opções"
            aria-haspopup="menu"
            aria-expanded={menuAberto}
            onClick={() => setMenu(menuAberto ? null : id)}
            className="crm-livre rounded-lg border border-[#D5DAE0] bg-white px-2.5 py-1.5 text-base leading-none text-[#626B75] transition hover:text-[#20252B]"
          >
            ⋯
          </button>
          {menuAberto && (
            <>
              <button type="button" aria-label="Fechar menu" className="crm-livre fixed inset-0 z-20 cursor-default" onClick={() => setMenu(null)} />
              <div role="menu" className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl border border-[#E6E9ED] bg-white py-1 text-left shadow-lg">
                {visiveis.map((i) => (
                  <button
                    key={i.label}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenu(null);
                      i.acao();
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#F5F6F7] ${i.perigo ? "text-[#B42318]" : "text-[#20252B]"}`}
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
