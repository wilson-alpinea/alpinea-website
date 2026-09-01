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
  JR_PASS_PRECO_USD,
  DIARIA_WIFI_USD_PAX,
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
import { ContactCTA } from "../components/ContactCTA";
import { useCambioUSD, formatBRL, formatUSD } from "../hooks/useCambioUSD";
import { CambioLabel } from "../components/CambioLabel";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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
};

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

  const multiplicadorCidade = CIDADE_MULTIPLICADOR_HOTEL[cidade];

  const resultado = useMemo(() => {
    const precoRoteiro =
      ROTEIRO_PRECO_BASE + Math.max(0, dias - ROTEIRO_BASE_DIAS) * ROTEIRO_PRECO_DIA_EXTRA;
    const precoAereoEconomy = PRECO_AEREO_ECONOMY_BRL * pessoas;
    const precoAereoBusiness = Math.round(PRECO_AEREO_BUSINESS_USD * cambioCotacao * pessoas);
    const precoAereoFirst = Math.round(PRECO_AEREO_FIRST_USD * cambioCotacao * pessoas);

    function precoHotel(categoria: (typeof CATEGORIAS_HOTEL)[number]) {
      return Math.round(
        DIARIA_HOTEL[categoria] * dias * FATOR_QUARTO[tipoQuarto] * multiplicadorCidade,
      );
    }

    const incluidos: ItemPacote[] = [
      {
        label: "Roteiro Personalizado",
        detalhe: "Painel digital Ajisai com o roteiro sob medida do grupo",
        precoBRL: precoRoteiro,
      },
      {
        label: "Aéreo — Economy",
        detalhe: `Passagem internacional ida e volta para ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`,
        precoBRL: precoAereoEconomy,
      },
      {
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

    // 1) Upgrade de hotel, categoria por categoria (não pula nível)
    for (const categoria of ["4 estrelas", "5 estrelas", "Elite"] as const) {
      const precoAtual = precoHotel(categoriaHotelFinal);
      const precoNovo = precoHotel(categoria);
      const diferenca = precoNovo - precoAtual;
      if (cabe(diferenca)) {
        gasto += diferenca;
        categoriaHotelFinal = categoria;
      } else break;
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

    const precoSeguro = DIARIA_SEGURO_VIAGEM * dias;
    if (cabe(precoSeguro)) {
      gasto += precoSeguro;
      incluidos.push({
        label: "Seguro Viagem",
        detalhe: `Cobertura médica e assistência — ${dias} dias`,
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

    // 3) JR Pass (faixa de 7 dias como referência)
    const precoJrPass = Math.round(JR_PASS_PRECO_USD[7] * cambioCotacao * pessoas);
    if (cabe(precoJrPass)) {
      gasto += precoJrPass;
      incluidos.push({
        label: "JR Pass — 7 dias",
        detalhe: `Passe ferroviário com trem-bala ilimitado, por pessoa`,
        precoBRL: precoJrPass,
      });
    }

    // 4) Wi-fi
    const precoWifi = Math.round(DIARIA_WIFI_USD_PAX * dias * pessoas * cambioCotacao);
    if (cabe(precoWifi)) {
      gasto += precoWifi;
      incluidos.push({
        label: "Wi-fi",
        detalhe: `Conexão disponível durante todo o roteiro, para o grupo`,
        precoBRL: precoWifi,
      });
    }

    // 5) Upgrade de classe do voo
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
      label: `Aéreo — ${classeAereoFinal}`,
      detalhe: `Passagem internacional ida e volta para ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`,
      precoBRL:
        classeAereoFinal === "Economy"
          ? precoAereoEconomy
          : classeAereoFinal === "Business"
            ? precoAereoBusiness
            : precoAereoFirst,
    };
    incluidos[2] = {
      label: `Hotel — ${categoriaHotelFinal}`,
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
  }, [orcamento, dias, pessoas, tipoQuarto, cidade, multiplicadorCidade, cambioCotacao]);

  const pacoteSugeridoLabel = `Hotel ${resultado.categoriaHotelFinal} · Aéreo ${resultado.classeAereoFinal} · ${dias} dias · ${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"} · orçamento ${formatBRL(orcamento)}`;

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-[#0A2540] sm:px-8 md:px-16 md:py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/produtos"
          className="text-[10px] uppercase tracking-[0.2em] text-black/40 underline underline-offset-4 transition hover:text-black"
        >
          ← Voltar para Produtos
        </Link>

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

              <div className="mt-6 space-y-2.5">
                {resultado.incluidos.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-4 border-b border-black/10 pb-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="mt-0.5 text-xs text-black/50">{item.detalhe}</p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-semibold">
                      {formatBRL(item.precoBRL)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-black/10 pt-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                    Total do pacote sugerido
                  </p>
                  <p className={`${display.className} mt-1 text-4xl font-medium text-[#2f80c9]`}>
                    {formatBRL(resultado.gasto)}
                  </p>
                  <CambioLabel cambio={cambio} className="mt-1 text-[11px] text-black/30" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                    Saldo restante do orçamento
                  </p>
                  <p
                    className={`${display.className} mt-1 text-2xl font-medium ${
                      resultado.saldo > 0 ? "text-black" : "text-black/40"
                    }`}
                  >
                    {formatBRL(resultado.saldo)}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-black/40">
                Itens sem preço fixo (concierge, experiências sob medida, transfer de ônibus,
                reservas de restaurantes fora do pacote high-end) não entram nesse cálculo —
                cotados à parte, sob consulta. Valor final sujeito a confirmação da Ajisai.
              </p>

              <ContactCTA
                mode="single"
                channel="whatsapp"
                whatsappNumber="5511930300101"
                brand="Ajisai"
                label="Falar sobre esse pacote"
                buttonClassName="mt-7 block w-full rounded-full bg-[#2f80c9] px-6 py-4 text-center text-xs font-medium uppercase tracking-[0.25em] text-white transition hover:bg-[#3b91dc] sm:w-auto"
                packageOptions={[pacoteSugeridoLabel]}
                defaultPackage={pacoteSugeridoLabel}
              />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
