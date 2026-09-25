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
                  {/* Selo de capacidade sobre a foto — pedido do Wilson,
                      25/set/2026: "deixar mais visual o numero de lugares,
                      ideal que seja algo mais visual e impactante". Antes
                      era só uma legenda cinza pequena embaixo do card. */}
                  <div className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-[#0A2540] px-2 py-1 text-white shadow-sm">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 shrink-0">
                      <path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4Zm0-2a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
                    </svg>
                    <span className="text-xs font-bold leading-none">{v.assentos}</span>
                  </div>
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
      {/* Redesenhado a pedido do Wilson, 25/set/2026: "refazer essa parte, o
          design está muito ruim, deixar algo mais intuitivo e selecionavel"
          — lista antiga era muito fina/apagada (círculo minusculo, texto
          cinza claro, pouco contraste entre selecionado/não selecionado).
          Trocado por cards maiores com checkbox quadrado bem visível, mais
          respiro, preço em destaque e toda a linha principal clicável. */}
      <div className="mt-5 space-y-7">
        {categorias.map((cat) => {
          const rotasDaCategoria = rotasFiltradas.filter((r) => r.categoria === cat);
          if (rotasDaCategoria.length === 0) return null;
          return (
            <div key={cat}>
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="h-px flex-1 max-w-4 bg-black/15" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/55">
                  {LABEL_CATEGORIA[cat]}
                </p>
                <span className="h-px flex-1 bg-black/15" />
              </div>
              <div className="space-y-2">
                {rotasDaCategoria.map((rota) => {
                  const qtd = quantidadeDe(rota.id);
                  const ativo = qtd > 0;
                  const precoUnitario = rota.precoUSD[selecao.veiculo];
                  return (
                    <div
                      key={rota.id}
                      className={`overflow-hidden rounded-2xl border transition ${
                        ativo
                          ? "border-[#2f80c9] bg-[#2f80c9]/[0.07] shadow-sm shadow-[#2f80c9]/10"
                          : "border-black/10 bg-white hover:border-black/25 hover:bg-black/[0.015]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => ajustarQuantidade(rota.id, ativo ? -qtd : 1)}
                        aria-pressed={ativo}
                        aria-label={ativo ? `Remover ${rota.nome}` : `Adicionar ${rota.nome}`}
                        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                      >
                        <span
                          aria-hidden
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                            ativo ? "border-[#2f80c9] bg-[#2f80c9] text-white" : "border-black/20 bg-white text-transparent"
                          }`}
                        >
                          <IconCheck className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm font-medium leading-tight ${ativo ? "text-[#0A2540]" : "text-black/80"}`}>
                            {rota.nome}
                          </span>
                          {rota.minutosLivres != null && (
                            <span className="mt-1 inline-block rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] font-medium text-black/45">
                              {rota.minutosLivres} min inclusos
                            </span>
                          )}
                        </span>
                        <span className={`shrink-0 text-sm font-bold ${ativo ? "text-[#2f80c9]" : "text-black/55"}`}>
                          {formatUSD(precoUnitario)}
                        </span>
                      </button>
                      {ativo && (
                        <div className="flex items-center justify-between gap-3 border-t border-[#2f80c9]/15 bg-white/60 px-4 py-2.5 pl-[3.25rem]">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => ajustarQuantidade(rota.id, -1)}
                              aria-label="Diminuir quantidade"
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 bg-white text-black/50 transition hover:border-[#2f80c9]/50 hover:text-[#2f80c9]"
                            >
                              <IconMinus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[1.75rem] text-center text-sm font-semibold text-[#0A2540]">{qtd}</span>
                            <button
                              type="button"
                              onClick={() => ajustarQuantidade(rota.id, 1)}
                              aria-label="Aumentar quantidade"
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/15 bg-white text-black/50 transition hover:border-[#2f80c9]/50 hover:text-[#2f80c9]"
                            >
                              <IconPlus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          {qtd > 1 && (
                            <span className="text-xs font-medium text-black/45">
                              {qtd} × {formatUSD(precoUnitario)} = <span className="text-black/70">{formatUSD(precoUnitario * qtd)}</span>
                            </span>
                          )}
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
