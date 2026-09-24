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
  DIARIA_ESIM_USD_PAX,
  PRECO_DISNEY_PREMIER_ACCESS_POR_ATRACAO_USD_PAX,
  PRECO_MALA_INTERMUNICIPAL_USD,
  PRECO_RESTAURANTES_HIGHEND_USD,
  RESTAURANTES_HIGHEND_LIMITE_PESSOAS,
  PRECO_TRANSFER_ONIBUS_USD_PAX,
  PRECO_RESERVA_RESTAURANTE_USD,
  PRECO_EXPERIENCIA_SOB_MEDIDA_USD,
  DIARIA_CONCIERGE_USD,
} from "../components/CustomPackageCard";
import { useCambioUSD, formatBRL } from "../hooks/useCambioUSD";
import {
  INGRESSOS_PUBLICOS,
  USJ_EXPRESS_PASS_PUBLICO,
  SERVICOS_PUBLICOS,
  IDADE_LIMITE_SEGURO,
  multiplicadorSeguroPorIdade,
  type IngressoKey,
  type UsjTierKey,
  type ServicoKey,
} from "../lib/calculadoraCatalogoPublico";

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

type LinhaExtra = { label: string; precoBRL: number };

// Itens opcionais escolhidos pelo cliente (eSIM, ingressos, serviços) +
// seguro por idade. Entram como valor fixo no pacote: o preenchimento por
// orçamento (hotel/voo) só usa o que sobra depois deles.
function calcularExtras(p: {
  dias: number;
  pessoas: number;
  cidadesQtd: number;
  cambioCotacao: number;
  idades: number[];
  esimPessoas: number;
  ingressos: Set<IngressoKey>;
  premierAtracoes: number;
  usjTier: UsjTierKey;
  servicos: Set<ServicoKey>;
}) {
  const { dias, pessoas, cambioCotacao: c } = p;
  const linhas: LinhaExtra[] = [];
  const fora = p.idades.filter((i) => i > IDADE_LIMITE_SEGURO).length;
  const precoSeguro = Math.round(
    p.idades.reduce((soma, idade) => soma + DIARIA_SEGURO_VIAGEM * dias * (multiplicadorSeguroPorIdade(idade) ?? 0), 0),
  );
  const avisoSeguro =
    fora > 0
      ? `${fora} ${fora === 1 ? "passageiro está" : "passageiros estão"} acima do limite de ${IDADE_LIMITE_SEGURO} anos do seguro viagem — não incluído no preço; nossa equipe cota diretamente com a seguradora.`
      : null;

  if (p.esimPessoas > 0) {
    linhas.push({
      label: `eSIM (${p.esimPessoas} ${p.esimPessoas === 1 ? "pessoa" : "pessoas"})`,
      precoBRL: Math.round(DIARIA_ESIM_USD_PAX * dias * p.esimPessoas * c),
    });
  }

  for (const ing of INGRESSOS_PUBLICOS) {
    if (!p.ingressos.has(ing.key)) continue;
    const ehDisney = ing.key === "disneyland" || ing.key === "disneysea";
    let fastUSD = 0;
    let nomeFast = "";
    if (ehDisney && p.premierAtracoes > 0) {
      fastUSD = PRECO_DISNEY_PREMIER_ACCESS_POR_ATRACAO_USD_PAX * p.premierAtracoes;
      nomeFast = `Premier Access (${p.premierAtracoes} ${p.premierAtracoes === 1 ? "atração" : "atrações"})`;
    } else if (ing.key === "usj" && p.usjTier !== "nenhum") {
      const t = USJ_EXPRESS_PASS_PUBLICO.find((x) => x.key === p.usjTier);
      fastUSD = t?.precoUSD ?? 0;
      nomeFast = t?.label ?? "";
    }
    linhas.push({
      label: `Ingresso — ${ing.nome}${nomeFast ? ` + ${nomeFast}` : ""}`,
      precoBRL: Math.round((ing.precoUSD + fastUSD) * pessoas * c),
    });
  }

  if (p.servicos.has("malasIntermunicipal")) {
    const trechos = Math.max(1, p.cidadesQtd - 1);
    linhas.push({
      label: `Transporte de malas inter-municipal (${pessoas} ${pessoas === 1 ? "mala" : "malas"} × ${trechos} ${trechos === 1 ? "trecho" : "trechos"})`,
      precoBRL: Math.round(PRECO_MALA_INTERMUNICIPAL_USD * pessoas * trechos * c),
    });
  }
  if (p.servicos.has("restaurantesHighEnd") && pessoas <= RESTAURANTES_HIGHEND_LIMITE_PESSOAS) {
    linhas.push({ label: "Reserva de restaurantes high-end", precoBRL: Math.round(PRECO_RESTAURANTES_HIGHEND_USD * c) });
  }
  if (p.servicos.has("transferOnibus")) {
    linhas.push({ label: "Transfer de ônibus (Limousine Bus)", precoBRL: Math.round(PRECO_TRANSFER_ONIBUS_USD_PAX * pessoas * c) });
  }
  if (p.servicos.has("reservaRestaurante")) {
    linhas.push({ label: "Reserva de restaurante", precoBRL: Math.round(PRECO_RESERVA_RESTAURANTE_USD * c) });
  }
  if (p.servicos.has("experienciaSobMedida")) {
    linhas.push({ label: "Experiência sob medida (curadoria)", precoBRL: Math.round(PRECO_EXPERIENCIA_SOB_MEDIDA_USD * c) });
  }
  if (p.servicos.has("concierge")) {
    linhas.push({ label: `Concierge dedicado (${dias} dias)`, precoBRL: Math.round(DIARIA_CONCIERGE_USD * dias * c) });
  }

  return { linhas, total: linhas.reduce((s, l) => s + l.precoBRL, 0), precoSeguro, avisoSeguro };
}

type Resultado = {
  extras: LinhaExtra[];
  avisoSeguro: string | null;
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
  precoSeguro: number;
  avisoSeguro: string | null;
  extras: LinhaExtra[];
}): Resultado {
  const { orcamento, dias, pessoas, tipoQuarto, cidades, cambioCotacao } = params;
  const extrasTotal = params.extras.reduce((s, l) => s + l.precoBRL, 0);
  const multCidade = multiplicadorCidades(cidades);
  const roteiro = precoRoteiro(dias);
  const seguro = params.precoSeguro;

  let categoriaHotel: CategoriaHotel = CATEGORIAS_HOTEL[0];
  for (const cat of CATEGORIAS_HOTEL) {
    const hotel = precoHotelCalc(cat, dias, pessoas, tipoQuarto, multCidade);
    const aereo = precoAereoCalc("Economy", pessoas, cambioCotacao);
    if (roteiro + seguro + extrasTotal + hotel + aereo <= orcamento) {
      categoriaHotel = cat;
    } else {
      break;
    }
  }

  const hotelEscolhido = precoHotelCalc(categoriaHotel, dias, pessoas, tipoQuarto, multCidade);
  let classeAereo: ClasseAereo = CLASSES_AEREO[0];
  for (const classe of CLASSES_AEREO) {
    const aereo = precoAereoCalc(classe, pessoas, cambioCotacao);
    if (roteiro + seguro + extrasTotal + hotelEscolhido + aereo <= orcamento) {
      classeAereo = classe;
    } else {
      break;
    }
  }

  const aereoEscolhido = precoAereoCalc(classeAereo, pessoas, cambioCotacao);
  const total = roteiro + seguro + extrasTotal + hotelEscolhido + aereoEscolhido;

  return {
    categoriaHotel,
    classeAereo,
    precoRoteiro: roteiro,
    precoHotel: hotelEscolhido,
    precoAereo: aereoEscolhido,
    precoSeguro: seguro,
    extras: params.extras,
    avisoSeguro: params.avisoSeguro,
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

  const [idades, setIdades] = useState<number[]>([]);
  const [esimSelecionado, setEsimSelecionado] = useState<number | null>(null);
  const [ingressos, setIngressos] = useState<Set<IngressoKey>>(new Set());
  const [premierAtracoes, setPremierAtracoes] = useState(0);
  const [usjTier, setUsjTier] = useState<UsjTierKey>("nenhum");
  const [servicos, setServicos] = useState<Set<ServicoKey>>(new Set());

  const idadesConsideradas = Array.from({ length: pessoas }, (_, i) => idades[i] ?? 35);
  const esimPessoas = Math.min(esimSelecionado ?? pessoas, pessoas);

  function definirIdade(i: number, valor: number) {
    setIdades((atual) => {
      const novo = [...atual];
      while (novo.length <= i) novo.push(35);
      novo[i] = Math.max(0, Math.min(120, valor));
      return novo;
    });
  }
  function alternarIngresso(k: IngressoKey) {
    setIngressos((a) => {
      const n = new Set(a);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  }
  function alternarServico(k: ServicoKey) {
    setServicos((a) => {
      const n = new Set(a);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });
  }
  const rotuloUSD = (usd: number) => formatBRL(Math.round(usd * cambioCotacao));

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
    if (!nome.trim()) return;
    if (!whatsapp.trim() && !email.trim()) {
      setStatus("erro");
      setErro("Informe pelo menos o WhatsApp ou o e-mail para receber a simulação.");
      return;
    }

    const extrasCalculados = calcularExtras({
      dias,
      pessoas,
      cidadesQtd: cidades.length,
      cambioCotacao,
      idades: idadesConsideradas,
      esimPessoas,
      ingressos,
      premierAtracoes,
      usjTier,
      servicos,
    });
    const resultadoCalculado = simular({
      orcamento,
      dias,
      pessoas,
      tipoQuarto,
      cidades,
      cambioCotacao,
      precoSeguro: extrasCalculados.precoSeguro,
      avisoSeguro: extrasCalculados.avisoSeguro,
      extras: extrasCalculados.linhas,
    });
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
          idades: idadesConsideradas,
          extras: resultadoCalculado.extras,
          interesses: SERVICOS_PUBLICOS.filter((sv) => sv.sobConsulta && servicos.has(sv.key)).map((sv) => sv.nome),
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
              {resultado.extras.map((l) => (
                <div key={l.label} className="flex justify-between gap-4 text-white/60">
                  <span>{l.label}</span>
                  <span className="shrink-0">{formatBRL(l.precoBRL)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-medium text-white">
                <span>Total estimado</span>
                <span>{formatBRL(resultado.total)}</span>
              </div>
            </div>

            {resultado.avisoSeguro && (
              <p className="mt-4 text-xs leading-5 text-amber-400/90">{resultado.avisoSeguro}</p>
            )}

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

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="7. Seguro viagem — idade dos passageiros" />
              </span>
              <div className="flex flex-wrap gap-2">
                {idadesConsideradas.map((idade, i) => (
                  <div key={i} className="w-36 rounded-lg border border-white/15 bg-white/[0.04] p-3">
                    <p className="text-[10px] uppercase tracking-wide text-white/40">Passageiro {i + 1}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={idade}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isNaN(v)) definirIdade(i, v);
                        }}
                        className="h-9 w-16 rounded-md border border-white/15 bg-white/[0.06] px-2 text-sm text-white outline-none focus:border-white/40"
                      />
                      <span className="text-xs text-white/50">anos</span>
                    </div>
                    <p className="mt-1.5 text-[10px] leading-4 text-white/35">
                      {idade > IDADE_LIMITE_SEGURO
                        ? `Acima de ${IDADE_LIMITE_SEGURO} anos — sob consulta`
                        : (multiplicadorSeguroPorIdade(idade) ?? 1) > 1
                          ? "Valor ajustado pela idade"
                          : "Valor padrão"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="sm:col-span-2 sm:max-w-xs">
              <NumberStepper
                label="8. Conexão de internet — eSIM"
                value={esimPessoas}
                onChange={setEsimSelecionado}
                min={0}
                max={pessoas}
                formatValue={(v) => `${v} de ${pessoas} viajante${pessoas === 1 ? "" : "s"}`}
              />
              <p className="mt-1.5 text-[11px] text-white/35">Um eSIM por pessoa, plano ilimitado.</p>
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="9. Ingressos e experiências" />{" "}
                <span className="normal-case tracking-normal text-white/35">(opcional)</span>
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,8rem)] gap-2">
                {INGRESSOS_PUBLICOS.map((ing) => {
                  const marcado = ingressos.has(ing.key);
                  return (
                    <label
                      key={ing.key}
                      className={`flex h-[13.5rem] w-32 cursor-pointer flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                        marcado
                          ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                          : "border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                      }`}
                    >
                      <input type="checkbox" checked={marcado} onChange={() => alternarIngresso(ing.key)} className="sr-only" />
                      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
                        <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-md bg-white/90 p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={ing.icone} alt="" className="max-h-16 w-auto max-w-full object-contain" />
                        </div>
                        <span className="flex min-h-[2rem] w-full items-center justify-center leading-tight">{ing.nome}</span>
                      </div>
                      <span className="flex min-h-[2.5rem] w-full items-center justify-center rounded-md bg-[#6ec3d9]/10 px-2 py-1 text-[11px] font-semibold leading-tight text-[#6ec3d9]">
                        {rotuloUSD(ing.precoUSD)}/pessoa
                      </span>
                    </label>
                  );
                })}
              </div>

              {(ingressos.has("disneyland") || ingressos.has("disneysea")) && (
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs font-medium text-white/80">+ Disney Premier Access (fast pass pago)</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-white/40">
                    Vendido por atração, conforme a popularidade — escolha quantas quiser.
                  </p>
                  <div className="mt-2 max-w-xs">
                    <NumberStepper
                      label="Quantidade de atrações"
                      value={premierAtracoes}
                      onChange={setPremierAtracoes}
                      min={0}
                      max={8}
                      formatValue={(v) =>
                        v === 0
                          ? "Sem Premier Access"
                          : `${v} ${v === 1 ? "atração" : "atrações"} · ${rotuloUSD(v * PRECO_DISNEY_PREMIER_ACCESS_POR_ATRACAO_USD_PAX)}/pessoa`
                      }
                    />
                  </div>
                </div>
              )}

              {ingressos.has("usj") && (
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs font-medium text-white/80">+ USJ Express Pass (fast pass pago)</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-white/40">
                    Fura-fila em um número variável de atrações; o combo exato varia por temporada e nossa equipe
                    confirma com você antes de fechar.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {USJ_EXPRESS_PASS_PUBLICO.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setUsjTier(t.key)}
                        aria-pressed={usjTier === t.key}
                        className={`rounded-lg border px-3 py-2 text-center text-xs transition ${
                          usjTier === t.key
                            ? "border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                            : "border-white/15 text-white/60 hover:border-white/30"
                        }`}
                      >
                        <span className="block">{t.label}</span>
                        {t.precoUSD > 0 && <span className="block text-[10px] opacity-70">{rotuloUSD(t.precoUSD)}/pessoa</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-white/40">
                <LabelNumerado texto="10. Serviços adicionais" />{" "}
                <span className="normal-case tracking-normal text-white/35">(opcional)</span>
              </span>
              <div className="grid grid-cols-[repeat(auto-fill,8rem)] gap-2">
                {SERVICOS_PUBLICOS.map((sv) => {
                  const marcado = servicos.has(sv.key);
                  const desabilitado = sv.key === "restaurantesHighEnd" && pessoas > RESTAURANTES_HIGHEND_LIMITE_PESSOAS;
                  const precoLabel =
                    sv.sobConsulta
                      ? "Sob consulta"
                      : sv.key === "malasIntermunicipal"
                        ? `*${rotuloUSD(PRECO_MALA_INTERMUNICIPAL_USD)}/mala/trecho`
                        : sv.key === "restaurantesHighEnd"
                          ? `*${rotuloUSD(PRECO_RESTAURANTES_HIGHEND_USD)} · até ${RESTAURANTES_HIGHEND_LIMITE_PESSOAS} pessoas`
                          : sv.key === "transferOnibus"
                            ? `*${rotuloUSD(PRECO_TRANSFER_ONIBUS_USD_PAX)}/pessoa · ida e volta`
                            : sv.key === "reservaRestaurante"
                              ? `*${rotuloUSD(PRECO_RESERVA_RESTAURANTE_USD)}/reserva`
                              : sv.key === "experienciaSobMedida"
                                ? `*${rotuloUSD(PRECO_EXPERIENCIA_SOB_MEDIDA_USD)}/experiência`
                                : `*${rotuloUSD(DIARIA_CONCIERGE_USD)}/dia`;
                  return (
                    <label
                      key={sv.key}
                      className={`flex h-[13.5rem] w-32 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-center text-xs transition ${
                        desabilitado
                          ? "cursor-not-allowed border-white/10 bg-white/[0.02] text-white/30"
                          : marcado
                            ? "cursor-pointer border-[#6ec3d9] bg-[#6ec3d9]/15 font-medium text-[#6ec3d9]"
                            : "cursor-pointer border-white/15 bg-white/[0.04] text-white/60 hover:border-white/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={marcado && !desabilitado}
                        disabled={desabilitado}
                        onChange={() => alternarServico(sv.key)}
                        className="sr-only"
                      />
                      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2">
                        <div className="flex h-20 w-full shrink-0 items-center justify-center rounded-md bg-white/90 p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={sv.icone} alt="" className={`h-16 w-16 object-contain ${desabilitado ? "opacity-40" : ""}`} />
                        </div>
                        <span className="flex min-h-[2rem] w-full items-center justify-center leading-tight">{sv.nome}</span>
                      </div>
                      <span
                        className={`flex min-h-[2.5rem] w-full items-center justify-center rounded-md px-2 py-1 text-[11px] font-semibold leading-tight ${
                          desabilitado ? "bg-white/5 text-white/30" : "bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {precoLabel}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] leading-4 text-white/35">
                * preço inicial — pode variar conforme grupo, trecho e disponibilidade. Itens “sob consulta” são
                cotados pela nossa equipe.
              </p>
            </div>
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
                WhatsApp (ou e-mail abaixo)
              </span>
              <input
                type="tel"
                placeholder="+55 11 91234-5678"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 text-sm text-white outline-none focus:border-white/40"
              />
            </label>

            <label className="flex flex-col sm:col-span-2">
              <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                E-mail (ou WhatsApp ao lado)
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
