"use client";

import { useState } from "react";
import { Bodoni_Moda } from "next/font/google";
import { ContactCTA } from "./ContactCTA";
import { useCambioUSD, formatUSD, formatBRL } from "../hooks/useCambioUSD";
import { CambioLabel } from "./CambioLabel";
import {
  CATEGORIAS_HOTEL,
  TIPOS_QUARTO,
  TIPO_QUARTO_LABEL,
  CAPACIDADE_QUARTO,
  DIARIA_HOTEL,
  CIDADE_MULTIPLICADOR_HOTEL,
  CIDADES_HOTEL_EXEMPLO,
  EXEMPLOS_HOTEIS_POR_CIDADE,
  INFO_CATEGORIA_HOTEL,
  FATOR_QUARTO,
  DESTINOS,
  NumberStepper,
} from "./CustomPackageCard";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const MIN_NOITES = 1;
const MAX_NOITES = 30;
const MIN_QUARTOS = 1;
const MAX_QUARTOS = 10;

// Pedido do Wilson, 16/set/2026: "melhorar a parte de hotéis [...] quero
// algo similar a uma empresa que aluga hotéis como SIXT, o cliente escolhe
// a categoria, e precisa deixar opção pra escolher número de noites, datas
// e cidades e tipo de quarto para poder gerar orçamento inicial
// provisório" — depois, mesma data: "adicionar [...] quantidade de
// quartos e tipo de quarto [...] adicionar também no card de hotéis da
// página de produtos".
//
// A fórmula de preço reaproveita exatamente a mesma conta já usada no
// motor de preço da Calculadora Reversa e da Viagem Personalizada
// (DIARIA_HOTEL × CIDADE_MULTIPLICADOR_HOTEL × FATOR_QUARTO × pessoas ×
// dias) — só que aqui "pessoas" vem de quantidadeQuartos ×
// CAPACIDADE_QUARTO[tipoQuarto] (quartos cheios), em vez do vendedor
// digitar pessoas diretamente. Mesmo preço final pra a mesma composição de
// quartos, sem inventar uma segunda fórmula.
// Sem wrapper de modal próprio — pensado pra ser inserido dentro do modal
// "Hotéis" que já existe em /produtos (mesmo overlay, mesmo botão de
// fechar), em vez de abrir um modal por cima de outro modal.
export function HotelQuoteCalculator() {
  const cambio = useCambioUSD();
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS_HOTEL)[number]>("4 estrelas");
  const [cidade, setCidade] = useState<(typeof CIDADES_HOTEL_EXEMPLO)[number]>("tokyo");
  const [tipoQuarto, setTipoQuarto] = useState<(typeof TIPOS_QUARTO)[number]>("Duplo (casal)");
  const [quantidadeQuartos, setQuantidadeQuartos] = useState(1);
  const [noites, setNoites] = useState(5);
  const [dataCheckin, setDataCheckin] = useState("");

  const cambioCotacao = cambio?.cotacao ?? 5.3;
  const exemplos = EXEMPLOS_HOTEIS_POR_CIDADE[cidade][categoria];
  const nomeCidade = DESTINOS.find((d) => d.key === cidade)?.nome ?? cidade;

  // Preço por quarto/noite (room-only) — mesmos fatores do motor de preço
  // principal, só que aqui "pessoas" é derivado da quantidade de quartos
  // (quarto cheio), não digitado à parte.
  const precoQuartoNoiteBRL = Math.round(
    DIARIA_HOTEL[categoria] *
      CIDADE_MULTIPLICADOR_HOTEL[cidade] *
      FATOR_QUARTO[tipoQuarto] *
      CAPACIDADE_QUARTO[tipoQuarto],
  );
  const totalBRL = precoQuartoNoiteBRL * quantidadeQuartos * noites;
  const totalUSD = totalBRL / cambioCotacao;
  const totalUSDLabel = cambio == null ? "…" : formatUSD(totalUSD);
  const totalBRLLabel = formatBRL(totalBRL);

  const dataCheckoutLabel = (() => {
    if (!dataCheckin) return null;
    const inicio = new Date(`${dataCheckin}T00:00:00`);
    if (Number.isNaN(inicio.getTime())) return null;
    const fim = new Date(inicio);
    fim.setDate(fim.getDate() + noites);
    return fim.toLocaleDateString("pt-BR");
  })();

  const dataCheckinLabel = (() => {
    if (!dataCheckin) return null;
    const inicio = new Date(`${dataCheckin}T00:00:00`);
    if (Number.isNaN(inicio.getTime())) return null;
    return inicio.toLocaleDateString("pt-BR");
  })();

  const resumoParaContato = [
    `Hotel ${categoria}`,
    nomeCidade,
    tipoQuarto,
    `${quantidadeQuartos} ${quantidadeQuartos === 1 ? "quarto" : "quartos"}`,
    `${noites} ${noites === 1 ? "noite" : "noites"}`,
    dataCheckinLabel ? `a partir de ${dataCheckinLabel}` : null,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <div className="rounded-2xl border border-[#2f80c9]/20 bg-[#2f80c9]/[0.03] p-5 md:p-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#2f80c9]">
        Monte um orçamento provisório
      </p>
      <p className="mt-1.5 text-sm leading-6 text-black/55">
        Escolha a categoria, a cidade e a configuração dos quartos — veja um valor estimado na
        hora, antes de falar com um especialista.
      </p>

      {/* ── CATEGORIA ── */}
        <div className="mt-7">
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Categoria do hotel</p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CATEGORIAS_HOTEL.map((cat) => {
              const ativo = cat === categoria;
              const infoCat = INFO_CATEGORIA_HOTEL[cat];
              const precoMedio = Math.round(DIARIA_HOTEL[cat] * CIDADE_MULTIPLICADOR_HOTEL[cidade]);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoria(cat)}
                  aria-pressed={ativo}
                  className={`rounded-2xl border p-4 text-left transition ${
                    ativo
                      ? "border-[#2f80c9] bg-[#2f80c9]/[0.08]"
                      : "border-black/10 bg-black/[0.02] hover:border-black/25"
                  }`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-black">
                    {cat}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-black/50">{infoCat.tipoQuarto}</p>
                  <p className="mt-2 text-xs font-semibold text-[#2f80c9]">
                    {formatBRL(precoMedio)} / noite (média)
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CIDADE ── */}
        <div className="mt-7 border-t border-black/10 pt-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.2em] text-black/40">Cidade</span>
            <select
              value={cidade}
              onChange={(e) => setCidade(e.target.value as (typeof CIDADES_HOTEL_EXEMPLO)[number])}
              className="h-11 w-full max-w-xs rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm text-black outline-none focus:border-[#2f80c9]/60"
            >
              {CIDADES_HOTEL_EXEMPLO.map((key) => (
                <option key={key} value={key}>
                  {DESTINOS.find((d) => d.key === key)?.nome ?? key}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-[11px] leading-4 text-black/40">
            Exemplos de propriedade nessa cidade e categoria: {exemplos.join(" · ")}
          </p>
        </div>

        {/* ── TIPO DE QUARTO E QUANTIDADE ── */}
        <div className="mt-7 border-t border-black/10 pt-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
            Tipo de quarto e quantidade
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {TIPOS_QUARTO.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipoQuarto(t)}
                aria-pressed={tipoQuarto === t}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  tipoQuarto === t
                    ? "border-[#2f80c9] bg-[#2f80c9] text-white"
                    : "border-black/15 bg-white text-black/55 hover:border-black/30"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] leading-4 text-black/40">
            {TIPO_QUARTO_LABEL[tipoQuarto]}
          </p>
          <div className="mt-3 max-w-[220px]">
            <NumberStepper
              label="Quantidade de quartos"
              value={quantidadeQuartos}
              onChange={setQuantidadeQuartos}
              min={MIN_QUARTOS}
              max={MAX_QUARTOS}
              formatValue={(v) => `${v} ${v === 1 ? "quarto" : "quartos"}`}
            />
          </div>
          <p className="mt-1.5 text-[11px] leading-4 text-black/40">
            → acomoda até {quantidadeQuartos * CAPACIDADE_QUARTO[tipoQuarto]} pessoas
          </p>
        </div>

        {/* ── NOITES E DATA ── */}
        <div className="mt-7 border-t border-black/10 pt-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">Noites e data</p>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <div className="max-w-[220px]">
              <NumberStepper
                label="Quantidade de noites"
                value={noites}
                onChange={setNoites}
                min={MIN_NOITES}
                max={MAX_NOITES}
                formatValue={(v) => `${v} ${v === 1 ? "noite" : "noites"}`}
              />
            </div>
            <label className="flex flex-col">
              <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-black/40">
                Check-in (opcional)
              </span>
              <input
                type="date"
                value={dataCheckin}
                onChange={(e) => setDataCheckin(e.target.value)}
                className="h-10 rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm text-black outline-none focus:border-[#2f80c9]/60"
              />
            </label>
          </div>
          {dataCheckinLabel && dataCheckoutLabel && (
            <p className="mt-2 text-[11px] leading-4 text-black/40">
              {dataCheckinLabel} → {dataCheckoutLabel}
            </p>
          )}
        </div>

        {/* ── TOTAL ── */}
        <div className="mt-6 border-t border-black/10 pt-6 text-center">
          <p className="text-sm font-light text-black/50">Orçamento inicial provisório</p>
          <p
            className={`${display.className} mt-2 text-5xl font-medium leading-none text-[#2f80c9] md:text-6xl`}
          >
            {totalBRLLabel}
          </p>
          <p className="mt-1 text-sm font-medium text-black/50">ou {totalUSDLabel}</p>
          <CambioLabel cambio={cambio} className="mt-2 text-[11px] text-black/35" />
          <p className="mt-3 text-xs text-black/35">
            Estimativa para {categoria}, {tipoQuarto.toLowerCase()} ({quantidadeQuartos}{" "}
            {quantidadeQuartos === 1 ? "quarto" : "quartos"}), {noites}{" "}
            {noites === 1 ? "noite" : "noites"} em {nomeCidade}. Preço médio de mercado — o valor
            final é confirmado na curadoria, conforme disponibilidade real da propriedade nas
            datas escolhidas.
          </p>
        </div>

        <ContactCTA
          mode="single"
          channel="whatsapp"
          whatsappNumber="5511930300101"
          brand="Ajisai"
          label="Falar sobre esse hotel"
          buttonClassName="mt-7 block w-full rounded-full bg-[#2f80c9] px-6 py-4 text-center text-xs font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#3b91dc]"
          packageOptions={[resumoParaContato]}
          defaultPackage={resumoParaContato}
        />
    </div>
  );
}
