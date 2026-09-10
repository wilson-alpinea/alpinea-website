"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Bodoni_Moda } from "next/font/google";
import {
  NumberStepper,
  LabelNumerado,
  DESTINOS,
  CIDADE_MULTIPLICADOR_HOTEL,
  CATEGORIAS_HOTEL,
  TIPOS_QUARTO,
  TIPO_QUARTO_LABEL,
  FATOR_QUARTO,
  DIARIA_HOTEL,
  CLASSES_AEREO,
  PRECO_AEREO_ECONOMY_BRL,
  PRECO_AEREO_PREMIUM_ECONOMY_USD,
  PRECO_AEREO_BUSINESS_USD,
  PRECO_AEREO_FIRST_USD,
  DIARIA_SEGURO_VIAGEM,
  ROTEIRO_BASE_DIAS,
  ROTEIRO_PRECO_BASE,
  ROTEIRO_PRECO_DIA_EXTRA,
} from "../components/CustomPackageCard";
import { useCambioUSD, formatBRL } from "../hooks/useCambioUSD";

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

// Página pública, self-service: o cliente estima a própria viagem sem
// depender de um vendedor pra rodar a Calculadora Reversa interna
// (/calculadora_reversa). De propósito, só cobre o essencial — Roteiro +
// Aéreo + Hotel + Seguro — pra não sobrecarregar quem está apenas
// pesquisando. Itens vendidos à parte (JR Pass, guia, motorista, wi-fi,
// ingressos, extensões internacionais) ficam pra conversa com a equipe
// depois que o lead cai no CRM — ver app/api/viagem-personalizada-selfservice.
const MIN_DIAS = 5;
const MAX_DIAS = 30;
const MIN_PESSOAS = 1;
const MAX_PESSOAS = 12;
const MIN_ORCAMENTO = 20000;
const MAX_ORCAMENTO = 1000000;
const MAX_CIDADES = 4;

type DestinoKey = (typeof DESTINOS)[number]["key"];
type CategoriaHotel = (typeof CATEGORIAS_HOTEL)[number];
type ClasseAereo = (typeof CLASSES_AEREO)[number];
type TipoQuarto = (typeof TIPOS_QUARTO)[number];

// Subconjunto de DESTINOS oferecido nessa página — os destinos mais
// procurados, pra não expor as ~30 cidades da Calculadora Reversa interna
// (a maioria delas só existe ali pra cobrir os "Temas" do vendedor).
const CIDADES_OFERECIDAS: DestinoKey[] = [
  "tokyo",
  "kyoto",
  "osaka",
  "hakone",
  "nara",
  "hiroshima",
  "nagoya",
  "kanazawa",
  "hokkaido",
  "okinawa",
];

function precoRoteiro(dias: number) {
  return ROTEIRO_PRECO_BASE + Math.max(0, dias - ROTEIRO_BASE_DIAS) * ROTEIRO_PRECO_DIA_EXTRA;
}

function multiplicadorCidades(cidades: DestinoKey[]) {
  if (cidades.length === 0) return 1;
  const soma = cidades.reduce((s, c) => s + (CIDADE_MULTIPLICADOR_HOTEL[c] ?? 1), 0);
  return soma / cidades.length;
}

function precoHotelCalc(
  categoria: CategoriaHotel,
  dias: number,
  pessoas: number,
  tipoQuarto: TipoQuarto,
  multCidade: number,
) {
  return Math.round(DIARIA_HOTEL[categoria] * dias * FATOR_QUARTO[tipoQuarto] * multCidade * pessoas);
}

function precoAereoCalc(classe: ClasseAereo, pessoas: number, cambioCotacao: number) {
  if (classe === "First Class") return Math.round(PRECO_AEREO_FIRST_USD * cambioCotacao * pessoas);
  if (classe === "Business") return Math.round(PRECO_AEREO_BUSINESS_USD * cambioCotacao * pessoas);
  if (classe === "Premium Economy")
    return Math.round(PRECO_AEREO_PREMIUM_ECONOMY_USD * cambioCotacao * pessoas);
  return PRECO_AEREO_ECONOMY_BRL * pessoas;
}

type Resultado = {
  categoriaHotel: CategoriaHotel;
  classeAereo: ClasseAereo;
  precoRoteiro: number;
  precoHotel: number;
  precoAereo: number;
  precoSeguro: number;
  total: number;
  coube: boolean;
};

// Preenchimento automático por orçamento, versão simplificada da mesma
// lógica da Calculadora Reversa interna (app/calculadora_reversa/page.tsx):
// sobe a categoria do hotel enquanto couber (com aéreo Economy fixo) e, no
// que sobrar, sobe a classe do aéreo. Sem downgrade de dias/pessoas — se
// não couber nem no básico, devolve a configuração mais barata mesmo
// assim, com `coube: false`, pra a pessoa ver o tamanho do gap.
function simular(params: {
  orcamento: number;
  dias: number;
  pessoas: number;
  tipoQuarto: TipoQuarto;
  cidades: DestinoKey[];
  cambioCotacao: number;
}): Resultado {
  const { orcamento, dias, pessoas, tipoQuarto, cidades, cambioCotacao } = params;
  const multCidade = multiplicadorCidades(cidades);
  const roteiro = precoRoteiro(dias);
  const seguro = DIARIA_SEGURO_VIAGEM * dias * pessoas;

  let categoriaHotel: CategoriaHotel = CATEGORIAS_HOTEL[0];
  for (const cat of CATEGORIAS_HOTEL) {
    const hotel = precoHotelCalc(cat, dias, pessoas, tipoQuarto, multCidade);
    const aereo = precoAereoCalc("Economy", pessoas, cambioCotacao);
    if (roteiro + seguro + hotel + aereo <= orcamento) {
      categoriaHotel = cat;
    } else {
      break;
    }
  }

  const hotelEscolhido = precoHotelCalc(categoriaHotel, dias, pessoas, tipoQuarto, multCidade);
  let classeAereo: ClasseAereo = CLASSES_AEREO[0];
  for (const classe of CLASSES_AEREO) {
    const aereo = precoAereoCalc(classe, pessoas, cambioCotacao);
    if (roteiro + seguro + hotelEscolhido + aereo <= orcamento) {
      classeAereo = classe;
    } else {
      break;
    }
  }

  const aereoEscolhido = precoAereoCalc(classeAereo, pessoas, cambioCotacao);
  const total = roteiro + seguro + hotelEscolhido + aereoEscolhido;

  return {
    categoriaHotel,
    classeAereo,
    precoRoteiro: roteiro,
    precoHotel: hotelEscolhido,
    precoAereo: aereoEscolhido,
    precoSeguro: seguro,
    total,
    coube: total <= orcamento,
  };
}

export default function ViagemPersonalizadaSelfServicePage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [dataViagem, setDataViagem] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [orcamento, setOrcamento] = useState(80000);
  const [dias, setDias] = useState(10);
  const [pessoas, setPessoas] = useState(2);
  const [tipoQuarto, setTipoQuarto] = useState<TipoQuarto>("Duplo (casal)");
  const [cidades, setCidades] = useState<DestinoKey[]>(["tokyo", "kyoto"]);

  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);

  function alternarCidade(key: DestinoKey) {
    setCidades((atual) => {
      if (atual.includes(key)) return atual.filter((c) => c !== key);
      if (atual.length >= MAX_CIDADES) return atual;
      return [...atual, key];
    });
  }

  const nomesCidadesSelecionadas = useMemo(
    () => cidades.map((c) => DESTINOS.find((d) => d.key === c)?.nome ?? c),
    [cidades],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !whatsapp.trim()) return;

    const resultadoCalculado = simular({ orcamento, dias, pessoas, tipoQuarto, cidades, cambioCotacao });
    setResultado(resultadoCalculado);
    setStatus("enviando");
    setErro("");

    try {
      const res = await fetch("/api/viagem-personalizada-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          whatsapp,
          dataViagem,
          observacoes,
          orcamento,
          dias,
          pessoas,
          tipoQuarto,
          cidades: nomesCidadesSelecionadas,
          categoriaHotel: resultadoCalculado.categoriaHotel,
          classeAereo: resultadoCalculado.classeAereo,
          valorEstimado: resultadoCalculado.total,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Não foi possível enviar.");
      setStatus("enviado");
    } catch (err) {
      setStatus("erro");
      setErro(err instanceof Error ? err.message : "Erro ao enviar.");
    }
  }

  if (status === "enviado" && resultado) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white md:px-16 md:py-24">
        <div className="mx-auto max-w-xl text-center">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/AJISAI-LOGO.avif"
              alt="Ajisai"
              className="mx-auto h-11 w-auto object-contain"
            />
          </Link>
          <h1 className={`${display.className} mt-8 text-3xl font-medium md:text-4xl`}>
            Sua simulação está pronta
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/60">
            Recebemos seus dados — nossa equipe já pode acompanhar sua simulação e vai entrar em
            contato pelo WhatsApp em breve.
          </p>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-left md:p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Sugestão inicial</p>
            <p className={`${display.className} mt-2 text-2xl font-medium text-[#6ec3d9]`}>
              Hotel {resultado.categoriaHotel} · Aéreo {resultado.classeAereo}
            </p>
            <p className="mt-1 text-xs text-white/50">
              {dias} dias · {pessoas} {pessoas === 1 ? "pessoa" : "pessoas"}
              {nomesCidadesSelecionadas.length > 0 ? ` · ${nomesCidadesSelecionadas.join(", ")}` : ""}
            </p>

            <div className="mt-6 space-y-2 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Roteiro</span>
                <span>{formatBRL(resultado.precoRoteiro)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Aéreo ({resultado.classeAereo})</span>
                <span>{formatBRL(resultado.precoAereo)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Hotel ({resultado.categoriaHotel})</span>
                <span>{formatBRL(resultado.precoHotel)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Seguro viagem</span>
                <span>{formatBRL(resultado.precoSeguro)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-medium text-white">
                <span>Total estimado</span>
                <span>{formatBRL(resultado.total)}</span>
              </div>
            </div>

            {!resultado.coube && (
              <p className="mt-4 text-xs leading-5 text-amber-400/90">
                Esse é o pacote mais simples que oferecemos e ainda assim passa um pouco do
                orçamento informado — nossa equipe pode ajudar a ajustar dias, pessoas ou destinos
                pra caber melhor.
              </p>
            )}

            <p className="mt-6 text-[11px] leading-5 text-white/35">
              Estimativa automática, não uma proposta fechada — os valores finais dependem de
              datas, disponibilidade e curadoria da nossa equipe.
            </p>
          </div>

          <a
            href="https://wa.me/5511930300101"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#279E52] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#1f7d41]"
          >
            Falar agora no WhatsApp
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white md:px-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex justify-center">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/AJISAI-LOGO.avif"
              alt="Ajisai"
              className="h-10 w-auto object-contain md:h-11"
            />
          </Link>
        </div>

        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            Simulador de viagem personalizada
          </p>
          <h1 className={`${display.className} mt-3 text-3xl font-medium leading-tight md:text-4xl`}>
            Monte uma estimativa da sua viagem ao Japão
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/55">
            Diga seu orçamento e o formato da viagem — mostramos, na hora, até onde ele rende em
            hotel e classe do voo. Depois é só confirmar seus dados que nossa equipe assume dali.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-2 md:p-8">
            <label className="flex flex-col sm:col-span-2">
              <span className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="1. Orçamento máximo (R$)" />
              </span>
              <input
                type="number"
                min={MIN_ORCAMENTO}
                max={MAX_ORCAMENTO}
                step={500}
                value={orcamento}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (!Number.isNaN(v)) setOrcamento(v);
                }}
                className="h-12 w-full rounded-lg border border-white/15 bg-white/[0.04] px-4 text-lg font-medium text-white outline-none focus:border-white/40"
              />
            </label>

            <NumberStepper
              label="2. Quantidade de dias"
              value={dias}
              onChange={setDias}
              min={MIN_DIAS}
              max={MAX_DIAS}
              formatValue={(v) => `${v} dias`}
            />

            <NumberStepper
              label="3. Número de pessoas"
              value={pessoas}
              onChange={setPessoas}
              min={MIN_PESSOAS}
              max={MAX_PESSOAS}
              formatValue={(v) => `${v} ${v === 1 ? "pessoa" : "pessoas"}`}
            />

            <label className="flex flex-col sm:col-span-2">
              <span className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="4. Tipo de quarto" />
              </span>
              <select
                value={tipoQuarto}
                onChange={(e) => setTipoQuarto(e.target.value as TipoQuarto)}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
              >
                {TIPOS_QUARTO.map((t) => (
                  <option key={t} value={t} className="bg-black">
                    {TIPO_QUARTO_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="5. Cidades do roteiro" />{" "}
                <span className="normal-case tracking-normal text-white/35">
                  (até {MAX_CIDADES}, opcional)
                </span>
              </span>
              <div className="flex flex-wrap gap-2">
                {CIDADES_OFERECIDAS.map((key) => {
                  const destino = DESTINOS.find((d) => d.key === key);
                  const marcado = cidades.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => alternarCidade(key)}
                      aria-pressed={marcado}
                      className={`rounded-full border px-4 py-2 text-xs transition ${
                        marcado
                          ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                          : "border-white/15 text-white/60 hover:border-white/30"
                      }`}
                    >
                      {destino?.nome ?? key}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex flex-col sm:col-span-2">
              <span className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="6. Data prevista da viagem" />{" "}
                <span className="normal-case tracking-normal text-white/35">(opcional)</span>
              </span>
              <input
                type="date"
                value={dataViagem}
                onChange={(e) => setDataViagem(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40 [color-scheme:dark]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:grid-cols-2 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 sm:col-span-2">
              Seus dados, pra receber a simulação
            </p>

            <label className="flex flex-col">
              <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Nome completo
              </span>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
              />
            </label>

            <label className="flex flex-col">
              <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                WhatsApp
              </span>
              <input
                type="tel"
                required
                placeholder="+55 11 91234-5678"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
              />
            </label>

            <label className="flex flex-col sm:col-span-2">
              <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                E-mail (opcional)
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
              />
            </label>

            <label className="flex flex-col sm:col-span-2">
              <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                Observações (opcional)
              </span>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/40"
              />
            </label>
          </div>

          {status === "erro" && (
            <p className="text-center text-sm text-red-400">{erro}</p>
          )}

          <button
            type="submit"
            disabled={status === "enviando"}
            className="w-full rounded-full bg-white px-8 py-3.5 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
          >
            {status === "enviando" ? "Calculando…" : "Ver minha simulação"}
          </button>
        </form>
      </div>
    </main>
  );
}
