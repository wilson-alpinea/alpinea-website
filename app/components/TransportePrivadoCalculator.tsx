"use client";

import { useState } from "react";
import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "./ContactCTA";
import { useCambioUSD, formatUSD, formatBRL } from "../hooks/useCambioUSD";
import { CambioLabel } from "./CambioLabel";
import {
  comMargemEImposto,
  DIARIA_MOTORISTA_PRIVADO_USD,
  MOTORISTA_TAMANHO_GRUPO,
  ROTEIRO_BASE_DIAS,
  ROTEIRO_PRECO_BASE,
  ROTEIRO_PRECO_DIA_EXTRA,
  DESTINOS,
  NumberStepper,
} from "./CustomPackageCard";

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

function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" />
    </svg>
  );
}

// As 10 cidades mais procuradas do Japão pra turismo — mesma lista (e
// mesma ordem de relevância) usada como referência em CustomPackageCard.tsx
// (DESTINOS), só limitada às 10 primeiras pra não sobrecarregar o
// seletor. Um campo "Outra cidade" cobre o restante sob demanda.
const CIDADES_TOP10 = DESTINOS.slice(0, 10);

const DIAS_PADRAO_POR_CIDADE = 2;
const MIN_DIAS_CIDADE = 1;
const MAX_DIAS_CIDADE = 14;

// Adicional de custo da Alphard sobre a Hiace, por dia — pesquisa de
// mercado (set/2026): charter privado de dia inteiro (~10h) em Tóquio
// varia de JPY 40.000 a JPY 80.000 conforme veículo e trajeto (fonte:
// mir768.com/en/post/how-much-does-a-private-car-cost-in-japan);
// hirecarjapan.com cota a Alphard em ¥70.000–80.000/10h dentro de Tóquio;
// já a tokyo-car-service.com cobra US$97/hora na Alphard contra US$107/
// hora numa Hiace "Grand Cabin" — ou seja, o mercado NÃO tem um padrão
// único de "Alphard sempre mais cara que a Hiace", varia por fornecedor e
// configuração do veículo.
//
// Adotado adicional de custo de US$150/dia sobre a Hiace (≈21% acima do
// custo-base de US$700/dia já usado no motorista privado da Viagem
// Personalizada) — reflete o posicionamento que a própria Ajisai já usa no
// texto do item "Transporte Privado" do calculador do Personalizado: a
// Alphard é a categoria superior em conforto (bancos reclináveis tipo
// poltrona, cabine mais silenciosa, acabamento premium), mesmo carregando
// menos bagagem que a Hiace. Ajuste esta constante se houver tabela de
// fornecedor mais precisa. Mesma fórmula de imposto+margem do resto do
// site (ver comMargemEImposto, em CustomPackageCard.tsx).
const ADICIONAL_ALPHARD_USD = comMargemEImposto(150);

const CATEGORIAS_CARRO = [
  {
    id: "hiace" as const,
    nome: "Toyota Hiace",
    foto: "/images/carro-hiace.webp",
    tagline: "Bagageiro amplo — ideal para grupos com mais bagagem",
    precoDiaUSD: DIARIA_MOTORISTA_PRIVADO_USD,
  },
  {
    id: "alphard" as const,
    nome: "Toyota Alphard",
    foto: "/images/carro-alphard.webp",
    tagline: "Minivan premium — bancos reclináveis, cabine mais silenciosa",
    precoDiaUSD: DIARIA_MOTORISTA_PRIVADO_USD + ADICIONAL_ALPHARD_USD,
  },
];

type CategoriaId = (typeof CATEGORIAS_CARRO)[number]["id"];

export function TransportePrivadoCalculator({ onClose }: { onClose: () => void }) {
  const cambio = useCambioUSD();
  const [categoria, setCategoria] = useState<CategoriaId>("hiace");
  const [cidadesSelecionadas, setCidadesSelecionadas] = useState<Record<string, number>>(
    () => ({ tokyo: 3, kyoto: 2 }),
  );
  const [outroAtivo, setOutroAtivo] = useState(false);
  const [outroNome, setOutroNome] = useState("");
  const [outroDias, setOutroDias] = useState(DIAS_PADRAO_POR_CIDADE);

  function toggleCidade(key: string) {
    setCidadesSelecionadas((prev) => {
      const next = { ...prev };
      if (key in next) {
        delete next[key];
      } else {
        next[key] = DIAS_PADRAO_POR_CIDADE;
      }
      return next;
    });
  }

  function setDiasCidade(key: string, dias: number) {
    setCidadesSelecionadas((prev) => ({ ...prev, [key]: dias }));
  }

  // "Quantidade de cidades" e "quantidade de diárias de motorista" são
  // derivadas direto do seletor abaixo, em vez de campos separados — assim
  // não há como o total de diárias destoar da soma dos dias por cidade.
  const quantidadeCidades =
    Object.keys(cidadesSelecionadas).length + (outroAtivo && outroNome.trim() ? 1 : 0);

  const quantidadeDiarias =
    Object.values(cidadesSelecionadas).reduce((soma, d) => soma + d, 0) +
    (outroAtivo ? outroDias : 0);

  const categoriaEscolhida = CATEGORIAS_CARRO.find((c) => c.id === categoria)!;
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  // Motorista particular — mesma regra de preço da calculadora da Viagem
  // Personalizada (categoria Hiace = DIARIA_MOTORISTA_PRIVADO_USD, em
  // CustomPackageCard.tsx). Assumido 1 veículo, até MOTORISTA_TAMANHO_GRUPO
  // pessoas — sem seletor de passageiros aqui, consistente com a descrição
  // já usada no site pro serviço ("Para até 4 pessoas").
  const motoristaUSD = categoriaEscolhida.precoDiaUSD * quantidadeDiarias;

  // Roteiro Personalizado — mesma regra de preço da calculadora da Viagem
  // Personalizada (ROTEIRO_BASE_DIAS / ROTEIRO_PRECO_BASE /
  // ROTEIRO_PRECO_DIA_EXTRA). O Transporte Privado exige Roteiro
  // Personalizado (ver card "Transporte Privado" em /produtos), então o
  // valor já vem embutido aqui em vez de cobrado à parte.
  const roteiroBRL =
    quantidadeDiarias > 0
      ? ROTEIRO_PRECO_BASE +
        Math.max(0, quantidadeDiarias - ROTEIRO_BASE_DIAS) * ROTEIRO_PRECO_DIA_EXTRA
      : 0;

  // Roteiro nasce em reais, motorista nasce em dólar — mesmo padrão de
  // conversão usado em PriceCalculator.tsx.
  const totalUSD = roteiroBRL / cambioCotacao + motoristaUSD;
  const totalBRL = roteiroBRL + motoristaUSD * cambioCotacao;

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
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0a0a0a] p-6 sm:rounded-[2rem] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar calculadora de transporte privado"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-lg text-white/60 transition hover:border-white/40 hover:text-white"
        >
          <IconX className="h-4 w-4" />
        </button>

        <p className="text-xs uppercase tracking-[0.3em] text-[#6ec3d9]">Calculadora</p>
        <h3
          id="transporte-privado-title"
          className={`${display.className} mt-2 text-2xl font-medium text-white md:text-3xl`}
        >
          Transporte Privado
        </h3>
        <p className="mt-2 text-sm font-light leading-6 text-white/55">
          Motorista particular, sem compartilhar veículo com outros grupos —
          monte a logística da sua viagem e veja o investimento estimado, já
          com o Roteiro Personalizado incluso.
        </p>

        {/* ── CATEGORIA DE CARRO ── */}
        <div className="mt-7">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Categoria do carro
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CATEGORIAS_CARRO.map((c) => {
              const ativo = c.id === categoria;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoria(c.id)}
                  aria-pressed={ativo}
                  className={`flex flex-col overflow-hidden rounded-2xl border text-left transition ${
                    ativo
                      ? "border-[#2f80c9]/60 bg-[#2f80c9]/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/25"
                  }`}
                >
                  <div className="relative aspect-[3/2] w-full bg-white">
                    <Image
                      src={c.foto}
                      alt={c.nome}
                      fill
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="p-3.5">
                    <p className="text-sm font-medium text-white">{c.nome}</p>
                    <p className="mt-1 text-xs leading-5 text-white/50">{c.tagline}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#9fd4ee]">
                      {formatUSD(c.precoDiaUSD)}/dia
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-white/35">
            Para até {MOTORISTA_TAMANHO_GRUPO} pessoas por veículo.
          </p>
        </div>

        {/* ── CIDADES E DIAS COM MOTORISTA ── */}
        <div className="mt-7 border-t border-white/10 pt-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            Cidades do roteiro e dias com motorista
          </p>
          <div className="mt-3 space-y-2">
            {CIDADES_TOP10.map((d) => {
              const ativo = d.key in cidadesSelecionadas;
              return (
                <div
                  key={d.key}
                  className={`rounded-xl border px-3.5 py-2.5 transition ${
                    ativo ? "border-[#2f80c9]/50 bg-[#2f80c9]/10" : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleCidade(d.key)}
                    aria-pressed={ativo}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition ${
                        ativo
                          ? "border-[#2f80c9] bg-[#2f80c9] text-white"
                          : "border-white/25 text-transparent"
                      }`}
                    >
                      <IconCheck className="h-3 w-3" />
                    </span>
                    <span className="flex-1 text-sm text-white">{d.nome}</span>
                    {ativo && (
                      <span className="text-xs text-white/50">
                        {cidadesSelecionadas[d.key]}{" "}
                        {cidadesSelecionadas[d.key] === 1 ? "dia" : "dias"}
                      </span>
                    )}
                  </button>
                  {ativo && (
                    <div className="mt-3 max-w-[200px] pl-8">
                      <NumberStepper
                        label={`Dias em ${d.nome}`}
                        value={cidadesSelecionadas[d.key]}
                        onChange={(v) => setDiasCidade(d.key, v)}
                        min={MIN_DIAS_CIDADE}
                        max={MAX_DIAS_CIDADE}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Outra cidade — cobre o restante fora do top 10 */}
            <div
              className={`rounded-xl border px-3.5 py-2.5 transition ${
                outroAtivo ? "border-[#2f80c9]/50 bg-[#2f80c9]/10" : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <button
                type="button"
                onClick={() => setOutroAtivo((v) => !v)}
                aria-pressed={outroAtivo}
                className="flex w-full items-center gap-3 text-left"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition ${
                    outroAtivo
                      ? "border-[#2f80c9] bg-[#2f80c9] text-white"
                      : "border-white/25 text-transparent"
                  }`}
                >
                  <IconCheck className="h-3 w-3" />
                </span>
                <span className="flex-1 text-sm text-white">Outra cidade</span>
              </button>
              {outroAtivo && (
                <div className="mt-3 space-y-3 pl-8">
                  <label className="block max-w-xs">
                    <span className="mb-1.5 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Qual cidade?
                    </span>
                    <input
                      type="text"
                      value={outroNome}
                      onChange={(e) => setOutroNome(e.target.value)}
                      placeholder="Ex.: Hokkaido, Beppu…"
                      className="w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-[#2f80c9]/60"
                    />
                  </label>
                  <div className="max-w-[200px]">
                    <NumberStepper
                      label="Dias"
                      value={outroDias}
                      onChange={setOutroDias}
                      min={MIN_DIAS_CIDADE}
                      max={MAX_DIAS_CIDADE}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RESUMO: CIDADES + DIÁRIAS ── */}
        <div className="mt-6 flex justify-center gap-6 border-t border-white/10 pt-6 text-center">
          <div>
            <p className={`${display.className} text-3xl font-medium text-white`}>
              {quantidadeCidades}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-white/40">
              {quantidadeCidades === 1 ? "cidade" : "cidades"}
            </p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className={`${display.className} text-3xl font-medium text-white`}>
              {quantidadeDiarias}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-white/40">
              {quantidadeDiarias === 1 ? "diária de motorista" : "diárias de motorista"}
            </p>
          </div>
        </div>

        {/* ── TOTAL ── */}
        <div className="mt-6 border-t border-white/10 pt-6 text-center">
          {quantidadeDiarias === 0 ? (
            <p className="text-sm font-light text-white/45">
              Selecione ao menos uma cidade para calcular o investimento.
            </p>
          ) : (
            <>
              <p className="text-sm font-light text-white/50">
                Investimento estimado — Roteiro Personalizado + Transporte Privado
              </p>
              <p
                className={`${display.className} mt-2 text-5xl font-medium leading-none text-[#b79ce6] md:text-6xl`}
              >
                {totalUSDLabel}
              </p>
              <p className="mt-1 text-sm font-medium text-white/50">ou {totalBRLLabel}</p>
              <CambioLabel cambio={cambio} className="mt-2 text-[11px] text-white/30" />
              <p className="mt-3 text-xs text-white/30">
                Estimativa para {categoriaEscolhida.nome}, {quantidadeDiarias}{" "}
                {quantidadeDiarias === 1 ? "diária" : "diárias"} de motorista em{" "}
                {quantidadeCidades} {quantidadeCidades === 1 ? "cidade" : "cidades"}. Valor final
                pode variar conforme a logística real do roteiro.
              </p>
            </>
          )}
        </div>

        {/* ── DISCLAIMER: MOTORISTA BILÍNGUE ── */}
        <div className="mt-6 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-4">
          <p className="text-xs leading-5 text-amber-200/80">
            <span className="font-semibold text-amber-200">
              Motorista bilíngue (português/inglês):
            </span>{" "}
            disponível mediante consulta, com valor adicional — a disponibilidade desse perfil é
            bem menor que a de motoristas sem esse requisito. Recomendamos solicitar com grande
            antecedência, idealmente 70 dias antes da viagem.
          </p>
        </div>

        <ContactCTA
          mode="single"
          channel="whatsapp"
          whatsappNumber="5511930300101"
          brand="Ajisai"
          label="Falar sobre meu transporte privado"
          buttonClassName="mt-7 block w-full rounded-full bg-white px-6 py-4 text-center text-xs font-medium uppercase tracking-[0.25em] text-black transition hover:bg-white/90"
        />
      </div>
    </div>
  );
}
