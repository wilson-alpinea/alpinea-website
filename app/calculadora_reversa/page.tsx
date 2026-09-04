"use client";

import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { useMemo, useState } from "react";
import {
  NumberStepper,
  DESTINOS,
  CIDADE_MULTIPLICADOR_HOTEL,
  CATEGORIAS_HOTEL,
  TIPOS_QUARTO,
  FATOR_QUARTO,
  DIARIA_HOTEL,
  CLASSES_AEREO,
  PRECO_AEREO_ECONOMY_BRL,
  PRECO_AEREO_BUSINESS_USD,
  PRECO_AEREO_FIRST_USD,
  DIARIA_TRANSPORTE,
  DIARIA_GUIA_USD,
  GUIA_TAMANHO_GRUPO,
  DIARIA_SEGURO_VIAGEM,
  JR_PASS_DIAS_OPCOES,
  JR_PASS_PRECO_USD,
  JR_PASS_PRECO_USD_GREEN,
  DIARIA_ESIM_USD_PAX,
  DIARIA_POCKET_WIFI_USD,
  WIFI_TAMANHO_GRUPO,
  PRECO_CAMBIO_BRASIL,
  DIARIA_MOTORISTA_PRIVADO_USD,
  MOTORISTA_TAMANHO_GRUPO,
  PRECO_INGRESSO_DISNEY_UNIVERSAL_USD_PAX,
  PRECO_RESTAURANTES_HIGHEND_USD,
  RESTAURANTES_HIGHEND_LIMITE_PESSOAS,
  ROTEIRO_BASE_DIAS,
  ROTEIRO_PRECO_BASE,
  ROTEIRO_PRECO_DIA_EXTRA,
} from "../components/CustomPackageCard";
import { useCambioUSD, formatBRL, formatUSD } from "../hooks/useCambioUSD";
import { CambioLabel } from "../components/CambioLabel";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Mês/quinzena de referência da tabela de preços do JR Pass usada em
// JR_PASS_PRECO_USD / JR_PASS_PRECO_USD_GREEN (CustomPackageCard.tsx) —
// atualizar aqui junto com os valores toda vez que o fornecedor mandar uma
// tabela nova (tabela é renovada quinzenalmente).
const JR_PASS_TABELA_VALIDADE = "01–15/set/2026";

const MIN_DIAS = 3;
const MAX_DIAS = 30;
const MIN_PESSOAS = 1;
const MAX_PESSOAS = 20;
const MIN_ORCAMENTO_BRL = 5000;
const MAX_ORCAMENTO_BRL = 2000000;

type ItemPacote = {
  label: string;
  detalhe: string;
  precoBRL: number;
  /** Chave estável de identificação do item - usada em vez do label nos
   * controles de selecao e ajuste manual, porque o label de alguns itens
   * muda (categoria de hotel, classe do aereo, dias/classe do JR Pass,
   * tipo de wi-fi) e nao pode servir de chave. Itens com label fixo nao
   * precisam declarar chave (o codigo usa o label como chave nesse caso). */
  chave?: string;
};

function chaveDoItem(item: ItemPacote) {
  return item.chave ?? item.label;
}

// Ordem em que os itens entram no pacote sugerido, depois dos itens fixos
// (Roteiro + Aéreo Economy + Hotel 3 estrelas). Cada passo só é aplicado se
// couber no saldo restante do orçamento — greedy, nessa ordem de prioridade.
// Upgrades de categoria de hotel e classe do voo são os itens de maior
// impacto na experiência (perfil de cliente de alta/altíssima renda), por
// isso entram antes dos complementares.
export default function CalculadoraReversaPage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [orcamento, setOrcamento] = useState(60000);
  const [dias, setDias] = useState(10);
  const [pessoas, setPessoas] = useState(2);
  const [tipoQuarto, setTipoQuarto] =
    useState<(typeof TIPOS_QUARTO)[number]>("Duplo (casal)");
  const [cidade, setCidade] = useState<(typeof DESTINOS)[number]["key"]>("tokyo");

  // Valor manual — sobrescreve o cálculo automático quando o time já tem
  // uma cotação real (hotel negociado, tarifa aérea específica etc.),
  // em vez de usar a tabela de referência de mercado.
  const [hotelManual, setHotelManual] = useState(false);
  const [hotelDiariaManual, setHotelDiariaManual] = useState(0);
  const [aereoManual, setAereoManual] = useState(false);
  const [aereoValorManual, setAereoValorManual] = useState(0);

  // Selecao manual dos itens do pacote sugerido (o vendedor pode tirar um
  // item antes de mandar pro cliente) e o timestamp de quando essa
  // proposta foi montada, pra constar na mensagem enviada.
  const [itensRemovidos, setItensRemovidos] = useState<Set<string>>(new Set());
  const [geradoEm] = useState(() => new Date());

  // Ajuste manual de valor - sobrescreve o preco calculado de um item
  // especifico (ex.: negociacao pontual) sem perder o calculo automatico
  // dos demais, que continua reagindo a orcamento/dias/pessoas. Chave por
  // chaveDoItem(item), nao pelo objeto em si.
  const [itemAjustes, setItemAjustes] = useState<Record<string, number>>({});
  // Ajuste manual do total final - sobrescreve a soma dos itens
  // selecionados quando o vendedor precisa fechar num valor redondo ou
  // negociado, sem precisar editar item por item.
  const [totalManual, setTotalManual] = useState(false);
  const [totalValorManual, setTotalValorManual] = useState(0);

  // JR Pass - faixa de dias e classe (Comum/Green) escolhidas; preco vem
  // da tabela do fornecedor (AjisaiWork), nao escala com ctx.dias.
  const [jrPassDias, setJrPassDias] =
    useState<(typeof JR_PASS_DIAS_OPCOES)[number]>(7);
  const [jrPassClasse, setJrPassClasse] = useState<"comum" | "green">("comum");

  // Wi-fi - eSIM (por pessoa) ou Pocket Wi-Fi (aparelho compartilhado,
  // cobre varias pessoas). Ambos escalam com a quantidade de dias.
  const [wifiTipo, setWifiTipo] = useState<"esim" | "pocket">("esim");

  const multiplicadorCidade = CIDADE_MULTIPLICADOR_HOTEL[cidade];

  const resultado = useMemo(() => {
    const precoRoteiro =
      ROTEIRO_PRECO_BASE + Math.max(0, dias - ROTEIRO_BASE_DIAS) * ROTEIRO_PRECO_DIA_EXTRA;
    const precoAereoEconomy = aereoManual
      ? Math.round(aereoValorManual * pessoas)
      : PRECO_AEREO_ECONOMY_BRL * pessoas;
    const precoAereoBusiness = aereoManual
      ? precoAereoEconomy
      : Math.round(PRECO_AEREO_BUSINESS_USD * cambioCotacao * pessoas);
    const precoAereoFirst = aereoManual
      ? precoAereoEconomy
      : Math.round(PRECO_AEREO_FIRST_USD * cambioCotacao * pessoas);

    function precoHotel(categoria: (typeof CATEGORIAS_HOTEL)[number]) {
      if (hotelManual) return Math.round(hotelDiariaManual * dias);
      return Math.round(
        DIARIA_HOTEL[categoria] * dias * FATOR_QUARTO[tipoQuarto] * multiplicadorCidade,
      );
    }

    const incluidos: ItemPacote[] = [
      {
        chave: "roteiro",
        label: "Roteiro Personalizado",
        detalhe: "Painel digital Ajisai com o roteiro sob medida do grupo",
        precoBRL: precoRoteiro,
      },
      {
        chave: "aereo",
        label: "Aéreo — Economy",
        detalhe: `Passagem internacional ida e volta para ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`,
        precoBRL: precoAereoEconomy,
      },
      {
        chave: "hotel",
        label: "Hotel — 3 estrelas",
        detalhe: `${dias} diárias · ${tipoQuarto} · categoria mínima`,
        precoBRL: precoHotel("3 estrelas"),
      },
    ];

    let gasto = incluidos.reduce((soma, item) => soma + item.precoBRL, 0);
    let categoriaHotelFinal: (typeof CATEGORIAS_HOTEL)[number] = "3 estrelas";
    let classeAereoFinal: (typeof CLASSES_AEREO)[number] = "Economy";

    function cabe(valor: number) {
      return gasto + valor <= orcamento;
    }

    // 1) Upgrade de hotel, categoria por categoria (não pula nível) — pulado
    // quando a diária é manual, já que o valor não varia por categoria.
    if (!hotelManual) {
      for (const categoria of ["4 estrelas", "5 estrelas", "Elite"] as const) {
        const precoAtual = precoHotel(categoriaHotelFinal);
        const precoNovo = precoHotel(categoria);
        const diferenca = precoNovo - precoAtual;
        if (cabe(diferenca)) {
          gasto += diferenca;
          categoriaHotelFinal = categoria;
        } else break;
      }
    }

    // 2) Complementares essenciais (transporte, seguro, guia)
    const precoTransporte = DIARIA_TRANSPORTE * dias;
    if (cabe(precoTransporte)) {
      gasto += precoTransporte;
      incluidos.push({
        label: "Transporte",
        detalhe: `Transfers e deslocamentos do roteiro — ${dias} dias`,
        precoBRL: precoTransporte,
      });
    }

    const precoSeguro = DIARIA_SEGURO_VIAGEM * dias * pessoas;
    if (cabe(precoSeguro)) {
      gasto += precoSeguro;
      incluidos.push({
        label: "Seguro Viagem",
        detalhe: `Cobertura médica e assistência — ${dias} dias · ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`,
        precoBRL: precoSeguro,
      });
    }

    const precoGuia = Math.round(
      DIARIA_GUIA_USD * dias * Math.max(1, Math.ceil(pessoas / GUIA_TAMANHO_GRUPO)) * cambioCotacao,
    );
    if (cabe(precoGuia)) {
      gasto += precoGuia;
      incluidos.push({
        label: "Guia Turístico",
        detalhe: `US$ ${DIARIA_GUIA_USD}/dia a cada ${GUIA_TAMANHO_GRUPO} pessoas`,
        precoBRL: precoGuia,
      });
    }

    // 3) JR Pass — faixa de dias e classe escolhidas pelo vendedor
    const tabelaJrPass = jrPassClasse === "green" ? JR_PASS_PRECO_USD_GREEN : JR_PASS_PRECO_USD;
    const precoJrPass = Math.round(tabelaJrPass[jrPassDias] * cambioCotacao * pessoas);
    if (cabe(precoJrPass)) {
      gasto += precoJrPass;
      incluidos.push({
        chave: "jrpass",
        label: `JR Pass — ${jrPassDias} dias${jrPassClasse === "green" ? " · Green Car" : ""}`,
        detalhe: `Passe ferroviário com trem-bala ilimitado${jrPassClasse === "green" ? ", classe Green Car" : ""}, por pessoa · tabela ${JR_PASS_TABELA_VALIDADE}`,
        precoBRL: precoJrPass,
      });
    }

    // 4) Wi-fi — eSIM (por pessoa) ou Pocket Wi-Fi (aparelho compartilhado)
    const precoWifi =
      wifiTipo === "esim"
        ? Math.round(DIARIA_ESIM_USD_PAX * dias * pessoas * cambioCotacao)
        : Math.round(
            DIARIA_POCKET_WIFI_USD *
              dias *
              Math.max(1, Math.ceil(pessoas / WIFI_TAMANHO_GRUPO)) *
              cambioCotacao,
          );
    if (cabe(precoWifi)) {
      gasto += precoWifi;
      incluidos.push({
        chave: "wifi",
        label: wifiTipo === "esim" ? "eSIM" : "Pocket Wi-Fi",
        detalhe:
          wifiTipo === "esim"
            ? `Conexão 5G direto no celular, por pessoa — ${dias} dias`
            : `Aparelho compartilhado (até ${WIFI_TAMANHO_GRUPO} pessoas por unidade) — ${dias} dias`,
        precoBRL: precoWifi,
      });
    }

    // 5) Upgrade de classe do voo — pulado quando o valor da passagem é manual.
    if (!aereoManual) {
      for (const classe of ["Business", "First Class"] as const) {
        const precoAtual =
          classeAereoFinal === "Economy"
            ? precoAereoEconomy
            : classeAereoFinal === "Business"
              ? precoAereoBusiness
              : precoAereoFirst;
        const precoNovo = classe === "Business" ? precoAereoBusiness : precoAereoFirst;
        const diferenca = precoNovo - precoAtual;
        if (cabe(diferenca)) {
          gasto += diferenca;
          classeAereoFinal = classe;
        } else break;
      }
    }

    // 6) Motorista Privado (upgrade sobre o transporte compartilhado)
    const precoMotorista = Math.round(
      DIARIA_MOTORISTA_PRIVADO_USD *
        dias *
        Math.max(1, Math.ceil(pessoas / MOTORISTA_TAMANHO_GRUPO)) *
        cambioCotacao,
    );
    if (cabe(precoMotorista)) {
      gasto += precoMotorista;
      incluidos.push({
        label: "Motorista Privado",
        detalhe: `US$ ${DIARIA_MOTORISTA_PRIVADO_USD}/dia para até ${MOTORISTA_TAMANHO_GRUPO} pessoas, sem compartilhar veículo`,
        precoBRL: precoMotorista,
      });
    }

    // 7) Câmbio no Brasil
    if (cabe(PRECO_CAMBIO_BRASIL)) {
      gasto += PRECO_CAMBIO_BRASIL;
      incluidos.push({
        label: "Câmbio no Brasil",
        detalhe: "Retirada de ienes com câmbio comercial antes do embarque",
        precoBRL: PRECO_CAMBIO_BRASIL,
      });
    }

    // 8) Ingressos Disney/Universal
    const precoIngressos = Math.round(
      PRECO_INGRESSO_DISNEY_UNIVERSAL_USD_PAX * pessoas * cambioCotacao,
    );
    if (cabe(precoIngressos)) {
      gasto += precoIngressos;
      incluidos.push({
        label: "Ingressos Disney/Universal",
        detalhe: "Ingresso avulso, por pessoa",
        precoBRL: precoIngressos,
      });
    }

    // 9) Reserva de Restaurantes High-End
    if (pessoas <= RESTAURANTES_HIGHEND_LIMITE_PESSOAS) {
      const precoRestaurantes = Math.round(PRECO_RESTAURANTES_HIGHEND_USD * cambioCotacao);
      if (cabe(precoRestaurantes)) {
        gasto += precoRestaurantes;
        incluidos.push({
          label: "Reserva de Restaurantes High-End",
          detalhe: `Pacote fechado — até ${RESTAURANTES_HIGHEND_LIMITE_PESSOAS} pessoas`,
          precoBRL: precoRestaurantes,
        });
      }
    }

    // Atualiza os itens fixos de hotel/aéreo com a categoria/classe final
    incluidos[1] = {
      chave: "aereo",
      label: aereoManual ? "Aéreo — valor manual" : `Aéreo — ${classeAereoFinal}`,
      detalhe: `Passagem internacional ida e volta para ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`,
      precoBRL:
        classeAereoFinal === "Economy"
          ? precoAereoEconomy
          : classeAereoFinal === "Business"
            ? precoAereoBusiness
            : precoAereoFirst,
    };
    incluidos[2] = {
      chave: "hotel",
      label: hotelManual ? "Hotel — valor manual" : `Hotel — ${categoriaHotelFinal}`,
      detalhe: `${dias} diárias · ${tipoQuarto} · ${DESTINOS.find((d) => d.key === cidade)?.nome ?? ""}`,
      precoBRL: precoHotel(categoriaHotelFinal),
    };

    const precoMinimo = precoRoteiro + precoAereoEconomy + precoHotel("3 estrelas");
    const saldo = orcamento - gasto;

    return {
      incluidos,
      gasto,
      saldo,
      categoriaHotelFinal,
      classeAereoFinal,
      cabeNoOrcamento: orcamento >= precoMinimo,
      precoMinimo,
    };
  }, [
    orcamento,
    dias,
    pessoas,
    tipoQuarto,
    cidade,
    multiplicadorCidade,
    cambioCotacao,
    hotelManual,
    hotelDiariaManual,
    aereoManual,
    aereoValorManual,
    jrPassDias,
    jrPassClasse,
    wifiTipo,
  ]);

  const pacoteSugeridoLabel = `Hotel ${resultado.categoriaHotelFinal} · Aéreo ${resultado.classeAereoFinal} · ${dias} dias · ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"} · orçamento ${formatBRL(orcamento)}`;

  function alternarItem(chave: string) {
    setItensRemovidos((atual) => {
      const novo = new Set(atual);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  }

  // Valor efetivo de um item: o ajuste manual, quando existir, sobrescreve
  // o preco calculado automaticamente.
  function valorItem(item: ItemPacote) {
    const ajuste = itemAjustes[chaveDoItem(item)];
    return ajuste ?? item.precoBRL;
  }

  function ajustarValorItem(item: ItemPacote, valor: number) {
    setItemAjustes((atual) => ({ ...atual, [chaveDoItem(item)]: valor }));
  }

  function restaurarValorItem(item: ItemPacote) {
    setItemAjustes((atual) => {
      const novo = { ...atual };
      delete novo[chaveDoItem(item)];
      return novo;
    });
  }

  const itensSelecionados = resultado.incluidos.filter(
    (item) => !itensRemovidos.has(chaveDoItem(item)),
  );
  const totalCalculado = itensSelecionados.reduce((soma, item) => soma + valorItem(item), 0);
  const totalSelecionado = totalManual ? totalValorManual : totalCalculado;
  const saldoSelecionado = orcamento - totalSelecionado;

  const geradoEmLabel = `${geradoEm.toLocaleDateString("pt-BR")} às ${geradoEm.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;

  const mensagemWhatsapp = [
    `Proposta Ajisai — ${pacoteSugeridoLabel}`,
    "",
    ...itensSelecionados.map((item) => `• ${item.label}: ${formatBRL(valorItem(item))}`),
    "",
    `Total: ${formatBRL(totalSelecionado)}${totalManual ? " (ajustado manualmente)" : ""}`,
    cambio
      ? `Câmbio do dia: US$ 1 = R$ ${cambio.cotacao.toFixed(2).replace(".", ",")}${cambio.data ? ` (PTAX Banco Central, ${cambio.data})` : ""}`
      : "",
    `Gerado em ${geradoEmLabel} — Ajisai`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-[#0A2540] sm:px-8 md:px-16 md:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <img
            src="/images/ajisai-group-logo-crop.png"
            alt="Ajisai · Alpinea"
            className="h-9 w-auto object-contain md:h-11"
          />
          <Link
            href="/produtos"
            className="text-[10px] uppercase tracking-[0.2em] text-black/40 underline underline-offset-4 transition hover:text-black"
          >
            ← Voltar para Produtos
          </Link>
        </div>

        <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
          Ferramenta interna — não listada no site
        </p>
        <h1 className={`${display.className} mt-2 text-3xl font-medium md:text-4xl`}>
          Calculadora Reversa
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-light leading-6 text-black/55">
          Informe o orçamento máximo do cliente e a calculadora monta, dentro
          desse valor, a melhor combinação possível de hotel, aéreo e
          serviços — começando pelo essencial e priorizando os upgrades de
          maior impacto na experiência.
        </p>

        {/* ── ENTRADAS ── */}
        <div className="mt-8 grid gap-4 rounded-2xl border border-black/10 bg-black/[0.02] p-6 sm:grid-cols-2 md:p-8">
          <label className="flex h-full flex-col sm:col-span-2">
            <span className="mb-2 text-[10px] uppercase tracking-[0.2em] text-black/50">
              Orçamento máximo (R$)
            </span>
            <input
              type="number"
              min={MIN_ORCAMENTO_BRL}
              max={MAX_ORCAMENTO_BRL}
              step={500}
              value={orcamento}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v)) setOrcamento(v);
              }}
              className="h-12 w-full rounded-lg border border-black/15 bg-black/[0.03] px-4 text-lg font-medium outline-none focus:border-black/30"
            />
            {cambio && (
              <span className="mt-1.5 text-[11px] text-black/40">
                ≈ {formatUSD(orcamento / cambioCotacao)}
              </span>
            )}
          </label>

          <NumberStepper
            label="Quantidade de dias"
            value={dias}
            onChange={setDias}
            min={MIN_DIAS}
            max={MAX_DIAS}
            formatValue={(v) => `${v} dias`}
          />

          <NumberStepper
            label="Número de pessoas"
            value={pessoas}
            onChange={setPessoas}
            min={MIN_PESSOAS}
            max={MAX_PESSOAS}
            formatValue={(v) => `${v} ${v === 1 ? "pessoa" : "pessoas"}`}
          />

          <label className="flex h-full flex-col">
            <span className="mb-2 flex min-h-[2.2em] items-end text-[10px] uppercase leading-tight tracking-[0.2em] text-black/50">
              Tipo de quarto
            </span>
            <select
              value={tipoQuarto}
              onChange={(e) => setTipoQuarto(e.target.value as (typeof TIPOS_QUARTO)[number])}
              className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm outline-none focus:border-black/30"
            >
              {TIPOS_QUARTO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="flex h-full flex-col">
            <span className="mb-2 flex min-h-[2.2em] items-end text-[10px] uppercase leading-tight tracking-[0.2em] text-black/50">
              Cidade principal do roteiro
            </span>
            <select
              value={cidade}
              onChange={(e) => setCidade(e.target.value as (typeof DESTINOS)[number]["key"])}
              className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm outline-none focus:border-black/30"
            >
              {DESTINOS.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.nome}
                </option>
              ))}
            </select>
          </label>

          <div className="sm:col-span-2">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-black/50">
              JR Pass — validade e classe
            </span>
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                {JR_PASS_DIAS_OPCOES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setJrPassDias(d)}
                    className={`h-10 rounded-lg border px-4 text-sm transition ${
                      jrPassDias === d
                        ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                        : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                    }`}
                  >
                    {d} dias
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {(["comum", "green"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setJrPassClasse(c)}
                    className={`h-10 rounded-lg border px-4 text-sm transition ${
                      jrPassClasse === c
                        ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                        : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                    }`}
                  >
                    {c === "comum" ? "Comum (Ordinary)" : "Green Car"}
                  </button>
                ))}
              </div>
            </div>
            <span className="mt-1.5 block text-[11px] text-black/40">
              {formatUSD(
                (jrPassClasse === "green" ? JR_PASS_PRECO_USD_GREEN : JR_PASS_PRECO_USD)[jrPassDias],
              )}{" "}
              por pessoa · tabela do fornecedor válida {JR_PASS_TABELA_VALIDADE}
            </span>
          </div>

          <div className="sm:col-span-2">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-black/50">
              Conexão de internet
            </span>
            <div className="flex gap-2">
              {(["esim", "pocket"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setWifiTipo(t)}
                  className={`h-10 rounded-lg border px-4 text-sm transition ${
                    wifiTipo === t
                      ? "border-[#2f80c9] bg-[#2f80c9]/10 font-medium text-[#2f80c9]"
                      : "border-black/15 bg-black/[0.03] text-black/60 hover:border-black/30"
                  }`}
                >
                  {t === "esim" ? "eSIM (por pessoa)" : "Pocket Wi-Fi (compartilhado)"}
                </button>
              ))}
            </div>
            <span className="mt-1.5 block text-[11px] text-black/40">
              {wifiTipo === "esim"
                ? "Um eSIM por pessoa — tipo Airalo/Holafly, plano ilimitado"
                : `Aparelho compartilhado — até ${WIFI_TAMANHO_GRUPO} pessoas por unidade`}
            </span>
          </div>
        </div>

        {/* ── VALORES MANUAIS (OPCIONAL) ── */}
        <div className="mt-4 grid gap-4 rounded-2xl border border-black/10 bg-black/[0.02] p-6 sm:grid-cols-2 md:p-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/50 sm:col-span-2">
            Valores manuais (opcional) — use quando já tiver uma cotação real de hotel ou aéreo,
            em vez do valor de referência de mercado
          </p>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#0A2540]">
              <input
                type="checkbox"
                checked={hotelManual}
                onChange={(e) => setHotelManual(e.target.checked)}
                className="h-4 w-4 rounded border-black/25 accent-[#2f80c9]"
              />
              Informar diária do hotel manualmente
            </label>
            {hotelManual && (
              <label className="mt-2 flex flex-col">
                <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-black/40">
                  Diária do hotel (R$)
                </span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={hotelDiariaManual}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v)) setHotelDiariaManual(v);
                  }}
                  className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm outline-none focus:border-black/30"
                />
              </label>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#0A2540]">
              <input
                type="checkbox"
                checked={aereoManual}
                onChange={(e) => setAereoManual(e.target.checked)}
                className="h-4 w-4 rounded border-black/25 accent-[#2f80c9]"
              />
              Informar valor da passagem manualmente
            </label>
            {aereoManual && (
              <label className="mt-2 flex flex-col">
                <span className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-black/40">
                  Passagem por pessoa (R$)
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={aereoValorManual}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v)) setAereoValorManual(v);
                  }}
                  className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm outline-none focus:border-black/30"
                />
              </label>
            )}
          </div>
        </div>

        {/* ── RESULTADO ── */}
        <div className="mt-8 rounded-2xl border border-black/10 bg-black/[0.02] p-6 md:p-8">
          {!resultado.cabeNoOrcamento ? (
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-red-700">
                Orçamento insuficiente
              </p>
              <p className={`${display.className} mt-2 text-2xl font-medium`}>
                Itens essenciais mínimos custam {formatBRL(resultado.precoMinimo)}
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm text-black/55">
                Com {formatBRL(orcamento)}, ainda falta {formatBRL(resultado.precoMinimo - orcamento)}{" "}
                para cobrir Roteiro Personalizado + Aéreo Economy + Hotel 3 estrelas para{" "}
                {pessoas} {pessoas === 1 ? "pessoa" : "pessoas"} em {dias} dias. Aumente o
                orçamento ou reduza dias/pessoas.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                Pacote sugerido
              </p>
              <h2 className={`${display.className} mt-2 text-2xl font-medium md:text-3xl`}>
                Hotel {resultado.categoriaHotelFinal} · Aéreo {resultado.classeAereoFinal}
              </h2>
              <p className="mt-1 text-[11px] text-black/35">
                Ajisai · proposta gerada em {geradoEmLabel}
              </p>

              <div className="mt-6 space-y-2.5">
                {resultado.incluidos.map((item) => {
                  const chave = chaveDoItem(item);
                  const removido = itensRemovidos.has(chave);
                  const ajustado = itemAjustes[chave] !== undefined;
                  const valor = valorItem(item);
                  return (
                    <div
                      key={chave}
                      className={`flex items-start justify-between gap-4 border-b border-black/10 pb-2.5 transition ${
                        removido ? "opacity-40" : ""
                      }`}
                    >
                      <label className="flex flex-1 cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={!removido}
                          onChange={() => alternarItem(chave)}
                          className="mt-1 h-4 w-4 shrink-0 rounded border-black/25 accent-[#2f80c9]"
                        />
                        <div>
                          <p className={`text-sm font-medium ${removido ? "line-through" : ""}`}>
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-xs text-black/50">{item.detalhe}</p>
                        </div>
                      </label>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-black/30">R$</span>
                          <input
                            type="number"
                            disabled={removido}
                            value={Math.round(valor)}
                            onChange={(e) => {
                              const v = Number(e.target.value);
                              if (!Number.isNaN(v)) ajustarValorItem(item, v);
                            }}
                            className={`h-8 w-28 rounded-md border px-2 text-right text-sm font-semibold outline-none focus:border-[#2f80c9]/60 disabled:opacity-40 ${
                              removido ? "line-through" : ""
                            } ${ajustado ? "border-[#2f80c9]/50 bg-[#2f80c9]/5" : "border-black/15 bg-transparent"}`}
                          />
                        </div>
                        {ajustado && (
                          <button
                            type="button"
                            onClick={() => restaurarValorItem(item)}
                            className="text-[10px] uppercase tracking-wide text-[#2f80c9] underline underline-offset-2"
                          >
                            restaurar automático
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-black/10 pt-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                    Total do pacote sugerido
                  </p>
                  {totalManual ? (
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`${display.className} text-4xl font-medium text-[#2f80c9]`}>
                        R$
                      </span>
                      <input
                        type="number"
                        value={totalValorManual}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isNaN(v)) setTotalValorManual(v);
                        }}
                        className={`${display.className} h-12 w-44 rounded-lg border border-[#2f80c9]/40 bg-[#2f80c9]/5 px-2 text-3xl font-medium text-[#2f80c9] outline-none`}
                      />
                    </div>
                  ) : (
                    <p className={`${display.className} mt-1 text-4xl font-medium text-[#2f80c9]`}>
                      {formatBRL(totalSelecionado)}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!totalManual) setTotalValorManual(totalCalculado);
                      setTotalManual((v) => !v);
                    }}
                    className="mt-1 text-[10px] uppercase tracking-wide text-black/40 underline underline-offset-2 hover:text-black/60"
                  >
                    {totalManual ? "usar total calculado" : "ajustar total manualmente"}
                  </button>
                  <CambioLabel cambio={cambio} className="mt-1 text-[11px] text-black/30" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                    Saldo restante do orçamento
                  </p>
                  <p
                    className={`${display.className} mt-1 text-2xl font-medium ${
                      saldoSelecionado > 0 ? "text-black" : "text-black/40"
                    }`}
                  >
                    {formatBRL(saldoSelecionado)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-black/40">
                Itens sem preço fixo (concierge, experiências sob medida, transfer de ônibus,
                reservas de restaurantes fora do pacote high-end) não entram nesse cálculo —
                cotados à parte, sob consulta. Valor final sujeito a confirmação da Ajisai.
              </p>

              <button
                type="button"
                onClick={() =>
                  window.open(
                    `https://wa.me/5511930300101?text=${encodeURIComponent(mensagemWhatsapp)}`,
                    "_blank",
                  )
                }
                className="mt-7 block w-full rounded-full bg-[#2f80c9] px-6 py-4 text-center text-xs font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#3b91dc] sm:w-auto"
              >
                Falar sobre esse pacote no WhatsApp
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
