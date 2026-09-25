"use client";

import { useState } from "react";
import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "./ContactCTA";
import { useCambioUSD, formatUSD, formatBRL } from "../hooks/useCambioUSD";
import { CambioLabel } from "./CambioLabel";
import { MotoristaPrivadoPicker } from "./MotoristaPrivadoPicker";
import {
  SELECAO_MOTORISTA_VAZIA,
  calcularTotalMotoristaUSD,
  resumoSelecaoMotorista,
  contarItensMotorista,
  POLITICA_CANCELAMENTO_MOTORISTA,
  ADICIONAL_MEET_GREET_USD,
  ADICIONAL_CADEIRINHA_USD,
  type SelecaoMotorista,
} from "../lib/motoristaPrivadoRotas";
import { ROTEIRO_PRECO_BASE } from "./CustomPackageCard";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

// Pedido do Wilson, 25/set/2026: "enriquecer nossa pagina de motorista
// privado tanto na /produtos quanto calculadora reversa e self-service,
// colocar mesma margem que já usamos hoje, os preços na tabela anexa são
// preço de custo" + "adicionar coaster na /produtos". Depois de
// perguntado, Wilson confirmou trocar o antigo modelo de "diária fixa
// por cidade" (US$700/dia genérico, Hiace ou Alphard só) pelo catálogo
// de rotas exatas do fornecedor DAIKICHI/HK TOURIST — agora com Alphard,
// Hiace (10 e 14 lugares) e Coaster (18/21/29 lugares), preço exato por
// rota/tour (ver app/lib/motoristaPrivadoRotas.ts). O antigo modelo por
// cidades/dias saiu daqui; quem ainda usa a diária genérica é só o
// builder completo de pacote em /viagem-personalizada
// (CustomPackageCard.tsx, não tocado neste pedido).
export function TransportePrivadoCalculator({ onClose }: { onClose: () => void }) {
  const cambio = useCambioUSD();
  const [selecao, setSelecao] = useState<SelecaoMotorista>(SELECAO_MOTORISTA_VAZIA);

  const cambioCotacao = cambio?.cotacao ?? 5.3;
  const quantidadeItens = contarItensMotorista(selecao);
  const motoristaUSD = calcularTotalMotoristaUSD(selecao);

  // "Transporte Privado" exige Roteiro Personalizado (ver requisito no
  // card em /produtos) — mesma regra do modelo antigo, só que agora o
  // roteiro nasce em reais (ROTEIRO_PRECO_BASE) e é somado convertido em
  // dólar, sem o adicional por dia extra (esse cálculo dependia de "dias
  // de roteiro", que não existe mais nesse modelo por rota/tour — pra
  // roteiros mais longos, a Calculadora Reversa segue sendo a ferramenta
  // certa). Só entra quando há pelo menos 1 serviço selecionado.
  const roteiroUSD = quantidadeItens > 0 ? ROTEIRO_PRECO_BASE / cambioCotacao : 0;
  const totalUSD = motoristaUSD + roteiroUSD;
  const totalBRL = totalUSD * cambioCotacao;
  const totalUSDLabel = cambio == null ? "…" : formatUSD(totalUSD);
  const totalBRLLabel = cambio == null ? "…" : formatBRL(totalBRL);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/85 px-4 pb-4 pt-10 backdrop-blur-sm md:items-center md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transporte-privado-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-3xl border border-black/10 bg-white sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar calculadora de transporte privado"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white text-lg text-black/60 transition hover:border-black/40 hover:text-black"
        >
          <IconX className="h-4 w-4" />
        </button>

        {/* ── CORPO ROLÁVEL ──
            Pedido do Wilson, 16/set/2026: "o valor final deve estar fixo
            na pagina, ao mudar variaveis" — o modal virou um flex-col com
            só este bloco rolando; o total fica num rodapé fixo abaixo,
            sempre visível enquanto veículo/rotas são ajustados. */}
        <div className="overflow-y-auto p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-[#6ec3d9]">Calculadora</p>
          <h3
            id="transporte-privado-title"
            className={`${display.className} mt-2 text-2xl font-medium text-black md:text-3xl`}
          >
            Transporte Privado
          </h3>
          <p className="mt-2 text-sm font-light leading-6 text-black/55">
            Motorista particular, sem compartilhar veículo com outros grupos —
            escolha o veículo e as rotas/tours que precisa e veja o investimento exato,
            direto da tabela do nosso fornecedor no Japão.
          </p>

          <div className="mt-7">
            <MotoristaPrivadoPicker selecao={selecao} onChange={setSelecao} cambioCotacao={cambioCotacao} />
          </div>

          {/* ── DISCLAIMER: TRÂNSITO INTER-MUNICIPAL ── */}
          <div className="mt-6 rounded-xl border border-black/15 bg-black/[0.03] p-4">
            <p className="text-xs leading-5 text-black/60">
              <span className="font-semibold text-black/80">Não incluso:</span> trânsito
              inter-municipal de longa distância entre regiões (ex.: Tóquio↔Kansai por estrada).
              Os valores acima já incluem imposto, estacionamento, pedágio (ETC) e combustível.
            </p>
          </div>

          {/* ── ADICIONAIS OPCIONAIS ── */}
          <div className="mt-4 rounded-xl border border-black/15 bg-black/[0.03] p-4">
            <p className="text-xs leading-5 text-black/60">
              <span className="font-semibold text-black/80">Adicionais opcionais</span> (sob
              consulta, cobrados à parte): recepção com placa de identificação (Meet &amp; Greet) —{" "}
              {formatUSD(ADICIONAL_MEET_GREET_USD)}; cadeirinha infantil — {formatUSD(ADICIONAL_CADEIRINHA_USD)}.
            </p>
          </div>

          {/* ── POLÍTICA DE CANCELAMENTO ── */}
          <div className="mt-4 rounded-xl border border-black/15 bg-black/[0.03] p-4">
            <p className="text-xs leading-5 text-black/60">
              <span className="font-semibold text-black/80">Cancelamento:</span> {POLITICA_CANCELAMENTO_MOTORISTA}
            </p>
          </div>

          {/* ── DISCLAIMER: MOTORISTA BILÍNGUE ── */}
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/60 p-4">
            <p className="text-xs leading-5 text-amber-800">
              <span className="font-semibold text-amber-900">
                Motorista bilíngue (português/inglês):
              </span>{" "}
              disponível mediante consulta, com valor adicional — a disponibilidade desse perfil é
              bem menor que a de motoristas sem esse requisito. Recomendamos solicitar com grande
              antecedência, idealmente 70 dias antes da viagem.
            </p>
          </div>
        </div>

        {/* ── RODAPÉ FIXO: TOTAL + CTA ── */}
        <div className="shrink-0 border-t border-black/10 bg-white p-6 text-center sm:p-8 sm:pt-6">
          {quantidadeItens === 0 ? (
            <p className="text-sm font-light text-black/45">
              Selecione ao menos uma rota ou tour para calcular o investimento.
            </p>
          ) : (
            <>
              <p className="text-sm font-light text-black/50">
                Investimento estimado — Roteiro Personalizado + Transporte Privado
              </p>
              <p
                className={`${display.className} mt-2 text-5xl font-medium leading-none text-[#b79ce6] md:text-6xl`}
              >
                {totalUSDLabel}
              </p>
              <p className="mt-1 text-sm font-medium text-black/50">ou {totalBRLLabel}</p>
              <CambioLabel cambio={cambio} className="mt-2 text-[11px] text-black/30" />
              <p className="mt-3 text-xs text-black/30">
                {resumoSelecaoMotorista(selecao)}. Valor final pode variar conforme adicionais e
                logística real do roteiro.
              </p>
            </>
          )}

          <ContactCTA
            mode="single"
            channel="whatsapp"
            whatsappNumber="5511930300101"
            brand="Ajisai"
            label="Falar sobre meu transporte privado"
            buttonClassName="mt-5 block w-full rounded-full bg-[#2f80c9] px-6 py-4 text-center text-xs font-medium uppercase tracking-[0.25em] text-black transition hover:bg-[#3b91dc]"
          />
        </div>
      </div>
    </div>
  );
}
