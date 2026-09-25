"use client";

// Seletor de motorista privado por rota exata — compartilhado entre
// /produtos (TransportePrivadoCalculator), calculadora_reversa e
// viagem_personalizada_selfservice. Pedido do Wilson, 25/set/2026:
// "enriquecer nossa pagina de motorista privado tanto na /produtos
// quanto calculadora reversa e self-service [...] os preços na tabela
// anexa são preço de custo" + "adicionar coaster na /produtos" — depois
// de perguntado, Wilson confirmou trocar o antigo modelo de "diária fixa
// por cidade" pelo catálogo de rotas exatas da DAIKICHI/HK TOURIST (ver
// app/lib/motoristaPrivadoRotas.ts).
//
// Componente controlado: o pai guarda o estado (`SelecaoMotorista`) e
// passa `onChange`. Um único veículo vale pra toda a seleção (o
// fornecedor cota por veículo dedicado, não por trecho isolado); o
// cliente/vendedor soma quantas rotas/tours quiser.

import { useState } from "react";
import Image from "next/image";
import {
  VEICULOS_MOTORISTA,
  ROTAS_MOTORISTA,
  REGIOES_MOTORISTA,
  encontrarRotaMotorista,
  calcularTotalMotoristaUSD,
  type VeiculoMotoristaId,
  type RegiaoRotaMotorista,
  type SelecaoMotorista,
} from "../lib/motoristaPrivadoRotas";
import { formatUSD } from "../lib/currency";

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

function IconMinus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

const LABEL_CATEGORIA: Record<string, string> = {
  "transfer-aeroporto": "Transfers de aeroporto",
  "dentro-cidade": "Dentro da cidade",
  "tour-dia-inteiro": "Tours de dia inteiro (10h)",
};

export function MotoristaPrivadoPicker({
  selecao,
  onChange,
  cambioCotacao,
}: {
  selecao: SelecaoMotorista;
  onChange: (novaSelecao: SelecaoMotorista) => void;
  // Cotação do dia (reais por dólar) — só pra mostrar "ou R$ X" ao lado do
  // total em dólar. Sem ela, mostra só o valor em dólar.
  cambioCotacao?: number | null;
}) {
  const [regiaoFiltro, setRegiaoFiltro] = useState<RegiaoRotaMotorista | "todas">("todas");

  function setVeiculo(veiculo: VeiculoMotoristaId) {
    onChange({ ...selecao, veiculo });
  }

  function quantidadeDe(rotaId: string): number {
    return selecao.itens.find((i) => i.rotaId === rotaId)?.quantidade ?? 0;
  }

  function ajustarQuantidade(rotaId: string, delta: number) {
    const atual = quantidadeDe(rotaId);
    const nova = Math.max(0, Math.min(20, atual + delta));
    if (nova === 0) {
      onChange({ ...selecao, itens: selecao.itens.filter((i) => i.rotaId !== rotaId) });
      return;
    }
    if (atual === 0) {
      onChange({ ...selecao, itens: [...selecao.itens, { rotaId, quantidade: nova }] });
      return;
    }
    onChange({
      ...selecao,
      itens: selecao.itens.map((i) => (i.rotaId === rotaId ? { ...i, quantidade: nova } : i)),
    });
  }

  const rotasFiltradas =
    regiaoFiltro === "todas" ? ROTAS_MOTORISTA : ROTAS_MOTORISTA.filter((r) => r.regiao === regiaoFiltro);

  // Agrupa por categoria, na ordem transfer → dentro da cidade → tour,
  // preservando a ordem original da tabela do fornecedor dentro de cada
  // grupo.
  const categorias = ["transfer-aeroporto", "dentro-cidade", "tour-dia-inteiro"] as const;

  const totalUSD = calcularTotalMotoristaUSD(selecao);
  const totalBRL = cambioCotacao ? Math.round(totalUSD * cambioCotacao) : null;

  return (
    <div>
      {/* ── VEÍCULO ── */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Veículo</p>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {VEICULOS_MOTORISTA.map((v) => {
            const ativo = v.id === selecao.veiculo;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setVeiculo(v.id)}
                aria-pressed={ativo}
                className={`flex flex-col overflow-hidden rounded-xl border text-left transition ${
                  ativo ? "border-[#2f80c9]/60 bg-[#2f80c9]/10" : "border-black/10 bg-black/[0.02] hover:border-black/25"
                }`}
              >
                <div className="relative aspect-[3/2] w-full bg-white">
                  <Image src={v.foto} alt={v.nome} fill sizes="200px" className="object-contain p-2" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-black">{v.nome}</p>
                  <p className="mt-0.5 text-[10px] leading-4 text-black/45">{v.tagline}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/35">
                    até {v.assentos} lugares
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── FILTRO DE REGIÃO ── */}
      <div className="mt-6 flex flex-wrap gap-2 border-t border-black/10 pt-5">
        <button
          type="button"
          onClick={() => setRegiaoFiltro("todas")}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
            regiaoFiltro === "todas" ? "bg-[#2f80c9] text-white" : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08]"
          }`}
        >
          Todas as regiões
        </button>
        {REGIOES_MOTORISTA.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRegiaoFiltro(r.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              regiaoFiltro === r.key ? "bg-[#2f80c9] text-white" : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08]"
            }`}
          >
            {r.nome}
          </button>
        ))}
      </div>

      {/* ── ROTAS/TOURS, AGRUPADOS POR CATEGORIA ── */}
      <div className="mt-4 space-y-6">
        {categorias.map((cat) => {
          const rotasDaCategoria = rotasFiltradas.filter((r) => r.categoria === cat);
          if (rotasDaCategoria.length === 0) return null;
          return (
            <div key={cat}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">{LABEL_CATEGORIA[cat]}</p>
              <div className="mt-2 space-y-1.5">
                {rotasDaCategoria.map((rota) => {
                  const qtd = quantidadeDe(rota.id);
                  const ativo = qtd > 0;
                  const precoUnitario = rota.precoUSD[selecao.veiculo];
                  return (
                    <div
                      key={rota.id}
                      className={`rounded-xl border px-3.5 py-2.5 transition ${
                        ativo ? "border-[#2f80c9]/50 bg-[#2f80c9]/10" : "border-black/10 bg-black/[0.02]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => ajustarQuantidade(rota.id, ativo ? -qtd : 1)}
                          aria-pressed={ativo}
                          aria-label={ativo ? `Remover ${rota.nome}` : `Adicionar ${rota.nome}`}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition ${
                            ativo ? "border-[#2f80c9] bg-[#2f80c9] text-white" : "border-black/25 text-transparent"
                          }`}
                        >
                          <IconCheck className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => ajustarQuantidade(rota.id, ativo ? -qtd : 1)}
                          className="flex-1 text-left text-sm text-black"
                        >
                          {rota.nome}
                          {rota.minutosLivres != null && (
                            <span className="ml-1.5 text-[10px] font-normal text-black/35">
                              ({rota.minutosLivres} min inclusos)
                            </span>
                          )}
                        </button>
                        <span className="shrink-0 text-xs font-semibold text-black/60">{formatUSD(precoUnitario)}</span>
                      </div>
                      {ativo && (
                        <div className="mt-2.5 flex items-center gap-3 pl-8">
                          <button
                            type="button"
                            onClick={() => ajustarQuantidade(rota.id, -1)}
                            aria-label="Diminuir quantidade"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-black/15 text-black/50 transition hover:border-black/35 hover:text-black"
                          >
                            <IconMinus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-[1.5rem] text-center text-sm font-medium text-black">{qtd}</span>
                          <button
                            type="button"
                            onClick={() => ajustarQuantidade(rota.id, 1)}
                            aria-label="Aumentar quantidade"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-black/15 text-black/50 transition hover:border-black/35 hover:text-black"
                          >
                            <IconPlus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs text-black/40">
                            {qtd > 1 ? `${qtd} × ${formatUSD(precoUnitario)} = ${formatUSD(precoUnitario * qtd)}` : "unidade"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── RESUMO ── */}
      <div className="mt-6 border-t border-black/10 pt-5">
        {selecao.itens.length === 0 ? (
          <p className="text-sm font-light text-black/45">
            Selecione ao menos uma rota ou tour para ver o investimento.
          </p>
        ) : (
          <>
            <p className="text-xs text-black/50">
              {selecao.itens.reduce((s, i) => s + i.quantidade, 0)}{" "}
              {selecao.itens.reduce((s, i) => s + i.quantidade, 0) === 1 ? "serviço selecionado" : "serviços selecionados"}
            </p>
            <p className="mt-1 text-2xl font-semibold text-black">
              {formatUSD(totalUSD)}
              {totalBRL != null && <span className="ml-2 text-sm font-medium text-black/45">ou R$ {totalBRL.toLocaleString("pt-BR")}</span>}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export { encontrarRotaMotorista };
