"use client";

// Transfer Aeroporto — produto próprio, separado do Transporte Privado
// (motorista à disposição). Pedido do Wilson, 30/set/2026: "motorista
// particular e transfer hotel-aeroporto/aeroporto-hotel tem que ser
// serviços diferentes" — confirmado via AskUserQuestion: duas páginas, e no
// transfer o cliente escolhe Ida e volta / Só chegada / Só volta (aeroporto
// + cidade do hotel), e o sistema monta os trechos nas datas de chegada e
// de partida.
//
// Mesmo visual, veículos, preços (motoristaPrivadoRotas.ts), termos e
// endpoint de CRM do Transporte Privado (/api/transporte-privado-selfservice,
// com produto = "transfer-aeroporto"). Um veículo para os dois trechos (é o
// mesmo grupo e a mesma bagagem). Sem Roteiro Personalizado incluso — o
// transfer é vendido avulso (ver INCLUI_ROTEIRO abaixo).
//
// 4 etapas: 1 Viagem (tipo, aeroporto, cidade do hotel, datas,
// passageiros — no estilo da SIXT) → 2 Veículo (+ opcionais) → 3 Dados
// (voos, hotel) → 4 Revisão (termos numa caixa na página).

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBRL, formatUSD, useCambioUSD } from "../../hooks/useCambioUSD";
import { ROTEIRO_PRECO_BASE } from "../../components/CustomPackageCard";
import {
  VEICULOS_MOTORISTA,
  encontrarRotaMotorista,
  encontrarVeiculoMotorista,
  POLITICA_CANCELAMENTO_MOTORISTA,
  ADICIONAL_MEET_GREET_USD,
  ADICIONAL_CADEIRINHA_USD,
  type RotaMotorista,
  type VeiculoMotoristaId,
} from "../../lib/motoristaPrivadoRotas";
import { display, WHATSAPP_NUMBER, hojeISO } from "../page";
import {
  inter,
  VEICULO_CURTO,
  LOCAIS,
  nomeLocal,
  TRECHOS_TRANSFER,
  IconeResumo,
  MAX_PASSAGEIROS,
  diasEntre,
  formatarDataCurta,
  formatarDiaMes,
  mascararWhatsapp,
  IconeCheck,
  Modal,
  Campo,
  classeInput,
  BlocoAvisos,
  IconeSeta,
  TextoTermosTransporte,
  type LocalId,
} from "../../components/transporte/compartilhado";

// O transfer não inclui o Roteiro Personalizado (o Transporte Privado
// inclui). Se o Wilson quiser incluir, basta trocar para true.
const INCLUI_ROTEIRO = false;

const ETAPAS = ["Viagem", "Veículo", "Dados", "Revisão"] as const;
type Etapa = 1 | 2 | 3 | 4;

type Modo = "ida-volta" | "chegada" | "volta";
const MODOS: { key: Modo; nome: string }[] = [
  { key: "ida-volta", nome: "Ida e volta" },
  { key: "chegada", nome: "Só chegada" },
  { key: "volta", nome: "Só volta" },
];

// Trechos de chegada (aeroporto → cidade) e de volta (cidade → aeroporto).
const CHEGADAS = TRECHOS_TRANSFER.filter((t) => LOCAIS.find((l) => l.id === t.de)?.aeroporto);
const VOLTAS = TRECHOS_TRANSFER.filter((t) => LOCAIS.find((l) => l.id === t.para)?.aeroporto);
const AEROPORTOS_CHEGADA = LOCAIS.filter((l) => CHEGADAS.some((t) => t.de === l.id));
const CIDADES_VOLTA = LOCAIS.filter((l) => VOLTAS.some((t) => t.de === l.id));
const MAX_DIAS = 90;

const rotaDe = (de: LocalId | "", para: LocalId | "", lista: typeof TRECHOS_TRANSFER): RotaMotorista | null =>
  de && para ? encontrarRotaMotorista(lista.find((t) => t.de === de && t.para === para)?.rotaId ?? "") : null;

// Rótulos de uma caixa de trecho (mesma grade das três células).
function RotulosTrecho({ nomes }: { nomes: [string, string, string] }) {
  return (
    <div className="mb-1.5 hidden grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.95fr)] text-xs font-medium text-black/60 sm:grid">
      <span>{nomes[0]}</span>
      <span className="pl-3">{nomes[1]}</span>
      <span className="pl-3">{nomes[2]}</span>
    </div>
  );
}

export default function TransferAeroportoPage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [etapa, setEtapa] = useState<Etapa>(1);
  const [modo, setModo] = useState<Modo>("ida-volta");
  const [aeroportoChegada, setAeroportoChegada] = useState<LocalId | "">("");
  const [cidadeChegada, setCidadeChegada] = useState<LocalId | "">("");
  const [dataChegada, setDataChegada] = useState("");
  const [cidadeVolta, setCidadeVolta] = useState<LocalId | "">("");
  const [aeroportoVolta, setAeroportoVolta] = useState<LocalId | "">("");
  const [dataPartida, setDataPartida] = useState("");
  const [passageiros, setPassageiros] = useState(1);

  const [veiculoEscolhido, setVeiculoEscolhido] = useState(false);
  const [veiculoId, setVeiculoId] = useState<VeiculoMotoristaId>("hiace10");

  const [opcionalMeetGreet, setOpcionalMeetGreet] = useState(false);
  const [opcionalCadeirinha, setOpcionalCadeirinha] = useState(false);
  const [qtdCadeirinhas, setQtdCadeirinhas] = useState(1);
  const [opcionalBilingue, setOpcionalBilingue] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [vooChegada, setVooChegada] = useState("");
  const [horarioPouso, setHorarioPouso] = useState("");
  const [vooPartida, setVooPartida] = useState("");
  const [horarioDecolagem, setHorarioDecolagem] = useState("");
  const [hotel, setHotel] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [tentouAvancarViagem, setTentouAvancarViagem] = useState(false);
  const [tentouAvancarDados, setTentouAvancarDados] = useState(false);
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [modalRegras, setModalRegras] = useState(false);
  const [resumoAbertoMobile, setResumoAbertoMobile] = useState(false);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  const stepperRef = useRef<HTMLDivElement | null>(null);

  const temChegada = modo !== "volta";
  const temVolta = modo !== "chegada";

  const cidadesChegada = aeroportoChegada ? CHEGADAS.filter((t) => t.de === aeroportoChegada).map((t) => t.para) : [];
  const aeroportosVolta = cidadeVolta ? VOLTAS.filter((t) => t.de === cidadeVolta).map((t) => t.para) : [];
  const rotaChegada = temChegada ? rotaDe(aeroportoChegada, cidadeChegada, CHEGADAS) : null;
  const rotaVolta = temVolta ? rotaDe(cidadeVolta, aeroportoVolta, VOLTAS) : null;

  // ── Validação da etapa 1 ──
  const errosViagem: Record<string, string | null> = {
    aeroportoChegada: temChegada && !aeroportoChegada ? "Escolha o aeroporto de chegada." : null,
    cidadeChegada: temChegada && !cidadeChegada ? "Escolha a cidade do hotel." : null,
    dataChegada: !temChegada
      ? null
      : !dataChegada
        ? "Informe a data de chegada."
        : dataChegada < hojeISO()
          ? "A chegada precisa ser hoje ou depois."
          : null,
    cidadeVolta: temVolta && !cidadeVolta ? "Escolha a cidade do hotel." : null,
    aeroportoVolta: temVolta && !aeroportoVolta ? "Escolha o aeroporto de partida." : null,
    dataPartida: !temVolta
      ? null
      : !dataPartida
        ? "Informe a data de partida."
        : dataPartida < hojeISO()
          ? "A partida precisa ser hoje ou depois."
          : temChegada && dataChegada && dataPartida < dataChegada
            ? "A partida precisa ser no dia da chegada ou depois."
            : temChegada && dataChegada && diasEntre(dataChegada, dataPartida).length > MAX_DIAS
              ? `Para viagens com mais de ${MAX_DIAS} dias, fale com a nossa equipe.`
              : null,
  };
  const viagemValida = Object.values(errosViagem).every((e) => e === null);

  const digitosWhatsapp = whatsapp.replace(/\D/g, "").length;
  const errosDados: Record<string, string | null> = {
    nome: nome.trim().length < 3 ? "Informe seu nome completo." : null,
    email: /^\S+@\S+\.\S+$/.test(email.trim()) ? null : "Informe um e-mail válido.",
    whatsapp: digitosWhatsapp >= 10 ? null : "Informe um WhatsApp com DDD.",
  };
  const dadosValidos = Object.values(errosDados).every((e) => e === null);
  const mostrarErro = (campo: string) =>
    campo in errosViagem
      ? tocados[campo] || tentouAvancarViagem
        ? errosViagem[campo]
        : null
      : tocados[campo] || tentouAvancarDados
        ? errosDados[campo]
        : null;
  const tocar = (campo: string) => setTocados((t) => ({ ...t, [campo]: true }));

  // ── Trechos e preço ──
  const veiculo = encontrarVeiculoMotorista(veiculoId);
  const veiculoCurto = VEICULO_CURTO[veiculoId];
  const veiculoComporta = (assentos: number) => assentos >= passageiros;
  const trechos: { chave: "chegada" | "volta"; rota: RotaMotorista; data: string }[] = [
    ...(rotaChegada ? [{ chave: "chegada" as const, rota: rotaChegada, data: dataChegada }] : []),
    ...(rotaVolta ? [{ chave: "volta" as const, rota: rotaVolta, data: dataPartida }] : []),
  ];
  const precoTrechos = (id: VeiculoMotoristaId) => trechos.reduce((s, t) => s + t.rota.precoUSD[id], 0);
  const motoristaUSD = veiculoEscolhido ? precoTrechos(veiculoId) : 0;
  const roteiroUSD = INCLUI_ROTEIRO && motoristaUSD > 0 ? ROTEIRO_PRECO_BASE / cambioCotacao : 0;
  const meetGreetUSD = opcionalMeetGreet ? ADICIONAL_MEET_GREET_USD : 0;
  const cadeirinhaUSD = opcionalCadeirinha ? ADICIONAL_CADEIRINHA_USD * qtdCadeirinhas : 0;
  const adicionaisUSD = meetGreetUSD + cadeirinhaUSD;
  const totalUSD = motoristaUSD + roteiroUSD + adicionaisUSD;
  const totalBRL = totalUSD * cambioCotacao;

  // Avisos (só informam — mesma regra do Transporte Privado).
  const avisos: string[] = [];
  if (viagemValida && modo === "chegada") avisos.push("Você contratou só a chegada — o transfer de volta ao aeroporto não está incluído.");
  if (viagemValida && modo === "volta") avisos.push("Você contratou só a volta — o transfer de chegada do aeroporto não está incluído.");
  if (viagemValida && modo === "ida-volta" && cidadeChegada && cidadeVolta && cidadeChegada !== cidadeVolta) {
    avisos.push(
      `Chegada com hotel em ${nomeLocal(cidadeChegada)} e volta saindo de ${nomeLocal(cidadeVolta)} — o deslocamento entre as cidades não está incluído.`,
    );
  }
  if (opcionalMeetGreet && !temChegada) avisos.push("Meet & Greet é a recepção no desembarque — sem o transfer de chegada, confirmamos com você pelo WhatsApp.");

  const etapa1Ok = viagemValida && passageiros >= 1;
  const etapa2Ok = veiculoEscolhido && veiculoComporta(veiculo.assentos);
  const etapa3Ok = dadosValidos;
  const etapasOk = [etapa1Ok, etapa2Ok, etapa3Ok];
  const podeEnviar = etapa1Ok && etapa2Ok && etapa3Ok && termosAceitos;

  const textoTrecho = (t: (typeof trechos)[number]) => `${nomeLocal(t.chave === "chegada" ? aeroportoChegada as LocalId : cidadeVolta as LocalId)} → ${nomeLocal(t.chave === "chegada" ? cidadeChegada as LocalId : aeroportoVolta as LocalId)}`;

  function irPara(nova: Etapa) {
    setEtapa(nova);
    setResumoAbertoMobile(false);
    const alvo = stepperRef.current;
    if (alvo) {
      const topo = alvo.getBoundingClientRect().top + window.scrollY - 56 + 24;
      if (window.scrollY > topo) window.scrollTo({ top: topo, behavior: "smooth" });
    }
  }

  function ajustarPassageiros(novo: number) {
    const n = Math.max(1, Math.min(MAX_PASSAGEIROS, novo));
    setPassageiros(n);
    if (veiculoEscolhido && veiculo.assentos < n) setVeiculoEscolhido(false);
  }

  // Ao escolher a chegada, a volta já vem espelhada (mesma cidade e mesmo
  // aeroporto, se existir a rota) — o cliente pode mudar.
  function escolherAeroportoChegada(id: LocalId | "") {
    setAeroportoChegada(id);
    const cidades = id ? CHEGADAS.filter((t) => t.de === id).map((t) => t.para) : [];
    const cidade = cidades.length === 1 ? cidades[0] : "";
    setCidadeChegada(cidade);
    if (id && cidade) espelharVolta(id, cidade);
  }
  function escolherCidadeChegada(id: LocalId | "") {
    setCidadeChegada(id);
    if (id && aeroportoChegada) espelharVolta(aeroportoChegada, id);
  }
  function espelharVolta(aeroporto: LocalId, cidade: LocalId) {
    if (cidadeVolta || aeroportoVolta) return;
    if (VOLTAS.some((t) => t.de === cidade)) {
      setCidadeVolta(cidade);
      if (VOLTAS.some((t) => t.de === cidade && t.para === aeroporto)) setAeroportoVolta(aeroporto);
    }
  }
  function escolherCidadeVolta(id: LocalId | "") {
    setCidadeVolta(id);
    const aeroportos = id ? VOLTAS.filter((t) => t.de === id).map((t) => t.para) : [];
    setAeroportoVolta(aeroportos.length === 1 ? aeroportos[0] : aeroportos.includes(aeroportoChegada as LocalId) ? (aeroportoChegada as LocalId) : "");
  }

  const cta: { rotulo: string; ativo: boolean; falta: string | null } =
    etapa === 1
      ? { rotulo: "Ver veículos", ativo: true, falta: etapa1Ok ? null : "Preencha os trechos e as datas para continuar" }
      : etapa === 2
        ? etapa2Ok
          ? { rotulo: "Continuar", ativo: true, falta: null }
          : { rotulo: "Escolha um veículo", ativo: false, falta: "Escolha um veículo para continuar" }
        : etapa === 3
          ? { rotulo: "Continuar", ativo: etapa3Ok, falta: etapa3Ok ? null : "Complete seus dados para continuar" }
          : {
              rotulo: status === "enviando" ? "Enviando…" : "Solicitar transfer",
              ativo: podeEnviar && status !== "enviando",
              falta: termosAceitos ? null : "Aceite os Termos e Condições para solicitar",
            };

  function acionarCta() {
    if (etapa === 1) {
      if (etapa1Ok) irPara(2);
      else setTentouAvancarViagem(true);
      return;
    }
    if (etapa === 2) {
      if (etapa2Ok) irPara(3);
      return;
    }
    if (etapa === 3) {
      if (etapa3Ok) irPara(4);
      else setTentouAvancarDados(true);
      return;
    }
    if (!termosAceitos) {
      setTentouEnviar(true);
      return;
    }
    void enviar();
  }

  const etapasFaltando = etapasOk.filter((ok) => !ok).length;

  const resumoTrechos = trechos
    .map((t) => `${t.chave === "chegada" ? "Chegada" : "Volta"} ${formatarDataCurta(t.data)} — ${textoTrecho(t)} (${veiculo.nome})`)
    .join("; ");

  async function enviar() {
    if (!podeEnviar || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    const opcionais = [
      opcionalMeetGreet ? "Meet & Greet (placa de recepção)" : null,
      opcionalCadeirinha ? `Cadeirinha infantil (${qtdCadeirinhas}×)` : null,
      opcionalBilingue ? "Motorista bilíngue português/inglês (sob consulta)" : null,
    ].filter(Boolean) as string[];
    const voos = [
      temChegada ? `Chegada: ${vooChegada || "voo não informado"}${horarioPouso ? `, pouso ${horarioPouso}` : ""}` : null,
      temVolta ? `Partida: ${vooPartida || "voo não informado"}${horarioDecolagem ? `, decolagem ${horarioDecolagem}` : ""}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
    try {
      const resposta = await fetch("/api/transporte-privado-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          produto: "transfer-aeroporto",
          veiculo: veiculo.nome,
          itens: trechos.map((t) => ({ rotaId: t.rota.id, veiculo: veiculoId, data: t.data, quantidade: 1 })),
          resumo: `${MODOS.find((m) => m.key === modo)?.nome} — ${resumoTrechos}`,
          motoristaUSD,
          roteiroUSD,
          adicionaisUSD,
          totalUSD,
          totalBRL,
          formaPagamento: null,
          nome,
          email,
          whatsapp,
          dataServico: temChegada ? dataChegada : dataPartida,
          dataChegada: temChegada ? dataChegada : "",
          dataPartida: temVolta ? dataPartida : "",
          passageiros,
          numeroVoo: voos,
          opcionais,
          avisos,
          observacoes: [hotel ? `Hotel: ${hotel}` : "", observacoes].filter(Boolean).join("\n"),
          termosAceitos,
        }),
      });
      const dadosResposta = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dadosResposta.error || "Não foi possível registrar seu pedido agora. Tente de novo.");
        setStatus("erro");
        return;
      }
      setStatus("enviado");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErro("Não foi possível registrar seu pedido agora. Tente de novo.");
      setStatus("erro");
    }
  }

  const mensagemWhatsapp = `Olá! Acabei de solicitar meu transfer de aeroporto pelo site da Ajisai — ${resumoTrechos}.${nome ? ` Meu nome é ${nome}.` : ""}`;

  // Sem veículo: "a partir de" do trajeto com o menor veículo que comporta
  // o grupo; com veículo: total real.
  const menorVeiculo = VEICULOS_MOTORISTA.find((v) => veiculoComporta(v.assentos));
  const totalExibidoUSD: number | null = veiculoEscolhido
    ? trechos.length > 0
      ? totalUSD
      : null
    : trechos.length > 0 && menorVeiculo
      ? precoTrechos(menorVeiculo.id) + adicionaisUSD
      : null;

  const linhaData = (
    <>
      {temChegada && dataChegada && !errosViagem.dataChegada && formatarDiaMes(dataChegada)}
      {temChegada && temVolta && dataChegada && dataPartida && !errosViagem.dataChegada && !errosViagem.dataPartida && " a "}
      {temVolta && dataPartida && !errosViagem.dataPartida && formatarDiaMes(dataPartida)}
    </>
  );

  const conteudoResumo = (
    <div>
      <p className={`${display.className} text-lg font-medium text-[#0A2540]`}>Seu transfer</p>
      <p className="mt-2 text-sm text-black/80">
        {MODOS.find((m) => m.key === modo)?.nome}
        <span className="text-black/50">
          {" "}
          · {passageiros} {passageiros === 1 ? "passageiro" : "passageiros"}
        </span>
      </p>
      {veiculoEscolhido ? (
        <p className="mt-1 text-sm text-black/80">
          {veiculoCurto.nome} <span className="text-black/50">· até {veiculo.assentos} passageiros</span>
        </p>
      ) : (
        <p className="mt-1 text-sm text-black/45">Nenhum veículo escolhido</p>
      )}
      <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
        {trechos.length === 0 ? (
          <p className="text-sm text-black/45">Nenhum trecho escolhido</p>
        ) : (
          trechos.map((t) => (
            <div key={t.chave} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2.5 text-black/80">
                <IconeResumo src="/images/icone-transfer-aeroporto.png" />
                <span className="min-w-0">
                  <span className="block">{textoTrecho(t)}</span>
                  <span className="block text-xs text-black/50">
                    {t.chave === "chegada" ? "Chegada" : "Volta"}
                    {t.data && ` · ${formatarDataCurta(t.data)}`}
                  </span>
                </span>
              </span>
              <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>
                {veiculoEscolhido ? formatUSD(t.rota.precoUSD[veiculoId]) : ""}
              </span>
            </div>
          ))
        )}
        {roteiroUSD > 0 && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5 text-black/55">
              <IconeResumo src="/images/icone-servico-experiencia-sob-medida.png" />
              Roteiro Personalizado (incluso)
            </span>
            <span className={`${inter.className} shrink-0 tabular-nums text-black/70`}>{formatUSD(roteiroUSD)}</span>
          </div>
        )}
        {meetGreetUSD > 0 && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5 text-black/80">
              <IconeResumo src="/images/icone-meet-greet.png" />
              Meet &amp; Greet
            </span>
            <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>{formatUSD(meetGreetUSD)}</span>
          </div>
        )}
        {cadeirinhaUSD > 0 && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5 text-black/80">
              <IconeResumo src="/images/icone-cadeirinha.png" />
              <span>
                {qtdCadeirinhas > 1 && <span className="text-black/50">{qtdCadeirinhas}× </span>}
                Cadeirinha infantil
              </span>
            </span>
            <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>{formatUSD(cadeirinhaUSD)}</span>
          </div>
        )}
        {opcionalBilingue && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2.5 text-black/80">
              <IconeResumo src="/images/icone-motorista-bilingue.png" />
              Motorista bilíngue
            </span>
            <span className="shrink-0 text-xs text-black/50">sob consulta</span>
          </div>
        )}
      </div>
      {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-4" />}
      <div className="mt-4 border-t border-black/10 pt-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-black/50">Total estimado</p>
        <p
          key={Math.round(totalExibidoUSD ?? 0)}
          className={`${inter.className} mt-0.5 rounded-md text-3xl font-bold tabular-nums tracking-[-0.02em] text-[#0A2540]`}
          style={totalExibidoUSD !== null ? { animation: "ajisai-destaque-preco 0.9s ease-out" } : undefined}
        >
          {totalExibidoUSD !== null ? formatUSD(totalExibidoUSD) : "—"}
        </p>
        {totalExibidoUSD !== null && !veiculoEscolhido && <p className="text-xs text-black/50">a partir de · valor final após escolher o veículo</p>}
        {totalExibidoUSD !== null && veiculoEscolhido && (
          <p className={`${inter.className} text-xs tabular-nums text-black/50`}>≈ {formatBRL(totalBRL)} na cotação do dia</p>
        )}
      </div>
    </div>
  );

  const botaoCta = () => (
    <button
      type="button"
      onClick={acionarCta}
      aria-disabled={!cta.ativo}
      className={`flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold uppercase tracking-[0.08em] transition-colors ${
        cta.ativo ? "bg-[#1f6fb8] text-white shadow-sm hover:bg-[#2f80c9]" : "cursor-default bg-[#dce6ef] text-[#5b7a95]"
      }`}
    >
      {cta.rotulo}
    </button>
  );

  const textoStatus =
    cta.falta ?? (etapa < 4 && etapasFaltando > 0 ? (etapasFaltando === 1 ? "Falta 1 etapa" : `Faltam ${etapasFaltando} etapas`) : null);

  // Caixa de um trecho na etapa 1 (estilo SIXT): três campos lado a lado
  // numa caixa só, com rótulos na mesma grade.
  const classeCaixa = (erroAlgum: boolean) =>
    `grid grid-cols-1 overflow-hidden rounded-xl border bg-white sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.95fr)] ${
      erroAlgum ? "border-red-400" : "border-black/15"
    } focus-within:border-[#2f80c9] focus-within:ring-1 focus-within:ring-[#2f80c9]`;
  // No celular as células empilham e os rótulos de cima somem — cada
  // célula ganha um rótulo pequeno interno (sm:hidden).
  const classeSelectCaixa =
    "h-14 w-full min-w-0 appearance-none bg-transparent pl-3 pr-9 pt-4 text-base text-black focus:outline-none disabled:text-black/35 sm:h-12 sm:pt-0 md:text-[15px]";
  const classeDataCaixa =
    "h-14 w-full min-w-0 appearance-none bg-transparent px-3 pt-4 text-base text-black focus:outline-none sm:h-12 sm:pt-0 md:text-[15px]";
  const rotuloMobile = "pointer-events-none absolute left-3 top-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-black/45 sm:hidden";
  const celula = "relative block min-w-0 border-t border-black/10 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0";


  const erroChegada = mostrarErro("aeroportoChegada") || mostrarErro("cidadeChegada") || mostrarErro("dataChegada");
  const erroVolta = mostrarErro("cidadeVolta") || mostrarErro("aeroportoVolta") || mostrarErro("dataPartida");

  return (
    <main className="min-h-screen overflow-x-clip bg-white pb-40 pt-14 text-black lg:pb-16 [&_input:not([type=checkbox])]:text-base [&_textarea]:text-base md:[&_input:not([type=checkbox])]:text-sm md:[&_textarea]:text-sm">
      <style>{`@keyframes ajisai-destaque-preco { 0% { background-color: rgba(47,128,201,0.16); } 100% { background-color: transparent; } }`}</style>

      <div className="fixed inset-x-0 top-0 z-50 flex h-14 shrink-0 items-center gap-3 bg-[#0A2540] px-4 md:px-8">
        <Link
          href="/produtos"
          className="flex min-h-[44px] items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-white/70 transition hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Voltar
        </Link>
        <span className="h-4 w-px bg-white/20" aria-hidden="true" />
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>Transfer Aeroporto</p>
        <div className="flex-1" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-6 w-auto object-contain md:h-7" />
      </div>

      {status === "enviado" ? (
        <div className="mx-auto max-w-xl px-5 py-16 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2f80c9]/10 text-[#2f80c9]">
            <IconeCheck className="h-6 w-6" />
          </span>
          <h1 className={`${display.className} mt-5 text-2xl font-medium text-black md:text-3xl`}>Recebemos seu pedido</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/70">
            Nossa equipe confirma horários, logística e forma de pagamento com você pelo WhatsApp — em geral no mesmo
            dia útil.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagemWhatsapp)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#1f6fb8] px-7 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#2f80c9]"
          >
            Continuar no WhatsApp
          </a>
        </div>
      ) : (
        <>
          <div className="mx-auto max-w-6xl px-5 pt-5 md:px-8 md:pt-8">
            <section className="relative -mx-5 overflow-hidden bg-[#0A2540] sm:mx-0 sm:rounded-2xl">
              <div className="relative h-48 sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[64%]">
                <Image
                  src="/images/produtos/transfer-aeroporto-header.jpg"
                  alt="Família com malas sendo recebida pelo motorista ao lado da van, na área de embarque do aeroporto"
                  fill
                  priority
                  sizes="(min-width: 640px) 700px, 100vw"
                  className="object-cover object-[45%_40%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
                />
              </div>
              <div className="relative -mt-10 px-5 pb-6 sm:mt-0 sm:flex sm:min-h-[260px] sm:max-w-[38%] sm:flex-col sm:justify-center sm:px-10 sm:py-10 md:min-h-[290px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Transfer Aeroporto</p>
                <h1 className={`${display.className} mt-3 text-[28px] font-medium leading-tight text-white md:text-4xl`}>
                  Do aeroporto ao hotel, sem espera
                </h1>
              </div>
            </section>
          </div>

          <div ref={stepperRef} aria-hidden="true" />
          <div className="sticky top-14 z-40 mt-6 bg-[#1f6fb8] shadow-[0_4px_16px_rgba(10,37,64,0.12)]">
            <nav aria-label="Etapas" className="mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto px-5 py-3 md:gap-3 md:px-8">
              {ETAPAS.map((nomeEtapa, i) => {
                const numero = (i + 1) as Etapa;
                const atual = etapa === numero;
                const concluida = numero < etapa && etapasOk[numero - 1];
                const liberada = numero <= etapa || etapasOk.slice(0, numero - 1).every(Boolean);
                return (
                  <div key={nomeEtapa} className="flex shrink-0 items-center gap-1 md:gap-3">
                    <button
                      type="button"
                      onClick={() => liberada && irPara(numero)}
                      disabled={!liberada}
                      aria-current={atual ? "step" : undefined}
                      className={`flex min-h-[44px] items-center gap-2 rounded-full px-2 text-sm transition md:px-3 ${
                        atual ? "text-white" : concluida ? "text-white/85 hover:text-white" : "text-white/50"
                      } ${liberada && !atual ? "cursor-pointer" : ""}`}
                    >
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                          atual ? "bg-white text-[#1f6fb8]" : concluida ? "bg-white/20 text-white" : "border border-white/40 text-white/60"
                        }`}
                      >
                        {concluida && !atual ? <IconeCheck className="h-3.5 w-3.5" /> : numero}
                      </span>
                      <span className={`${atual ? "font-semibold" : "font-medium"} ${atual ? "" : "hidden sm:inline"}`}>{nomeEtapa}</span>
                    </button>
                    {i < ETAPAS.length - 1 && <span className="h-px w-4 bg-white/30 md:w-10" aria-hidden="true" />}
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="mx-auto grid max-w-6xl gap-10 px-5 pt-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0">
              {/* ── ETAPA 1 — VIAGEM ── */}
              {etapa === 1 && (
                <section aria-labelledby="titulo-etapa-1">
                  <h2 id="titulo-etapa-1" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Onde e quando?
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">
                    Escolha o aeroporto e a cidade do hotel. Precisa de motorista durante a viagem? Veja{" "}
                    <Link href="/produtos/transporte-privado" className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                      Transporte Privado
                    </Link>
                    .
                  </p>

                  <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_30px_-22px_rgba(10,37,64,0.35)] sm:p-5">
                    <div role="radiogroup" aria-label="Tipo de transfer" className="inline-flex gap-1 rounded-full bg-black/[0.04] p-1">
                      {MODOS.map((m) => (
                        <button
                          key={m.key}
                          type="button"
                          role="radio"
                          aria-checked={modo === m.key}
                          onClick={() => setModo(m.key)}
                          className={`h-9 rounded-full px-4 text-sm transition ${
                            modo === m.key ? "bg-[#0A2540] font-semibold text-white" : "font-medium text-black/60 hover:text-black"
                          }`}
                        >
                          {m.nome}
                        </button>
                      ))}
                    </div>

                    {temChegada && (
                      <div className="mt-5">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Chegada · aeroporto → hotel</p>
                        <RotulosTrecho nomes={["Aeroporto de chegada", "Hotel em", "Data de chegada"]} />
                        <div className={classeCaixa(!!erroChegada)}>
                          <label className={celula}>
                            <span className={rotuloMobile}>Aeroporto de chegada</span>
                            <select
                              value={aeroportoChegada}
                              onChange={(e) => escolherAeroportoChegada(e.target.value as LocalId | "")}
                              onBlur={() => tocar("aeroportoChegada")}
                              className={classeSelectCaixa}
                            >
                              <option value="">Aeroporto de chegada</option>
                              {AEROPORTOS_CHEGADA.map((l) => (
                                <option key={l.id} value={l.id}>{l.nome}</option>
                              ))}
                            </select>
                            <IconeSeta />
                          </label>
                          <label className={celula}>
                            <span className={rotuloMobile}>Hotel em</span>
                            <select
                              value={cidadeChegada}
                              disabled={!aeroportoChegada}
                              onChange={(e) => escolherCidadeChegada(e.target.value as LocalId | "")}
                              onBlur={() => tocar("cidadeChegada")}
                              className={classeSelectCaixa}
                            >
                              <option value="">{aeroportoChegada ? "Cidade do hotel" : "Escolha o aeroporto"}</option>
                              {cidadesChegada.map((c) => (
                                <option key={c} value={c}>{nomeLocal(c)}</option>
                              ))}
                            </select>
                            <IconeSeta />
                          </label>
                          <label className={celula}>
                            <span className={rotuloMobile}>Data de chegada</span>
                            <input
                              type="date"
                              min={hojeISO()}
                              value={dataChegada}
                              onChange={(e) => {
                                const v = e.target.value;
                                setDataChegada(v);
                                if (v && dataPartida && dataPartida < v) setDataPartida(v);
                              }}
                              onBlur={() => tocar("dataChegada")}
                              className={classeDataCaixa}
                            />
                          </label>
                        </div>
                        {erroChegada && <p className="mt-1.5 text-xs text-red-600">{erroChegada}</p>}
                      </div>
                    )}

                    {temVolta && (
                      <div className="mt-5">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Volta · hotel → aeroporto</p>
                        <RotulosTrecho nomes={["Hotel em", "Aeroporto de partida", "Data de partida"]} />
                        <div className={classeCaixa(!!erroVolta)}>
                          <label className={celula}>
                            <span className={rotuloMobile}>Hotel em</span>
                            <select
                              value={cidadeVolta}
                              onChange={(e) => escolherCidadeVolta(e.target.value as LocalId | "")}
                              onBlur={() => tocar("cidadeVolta")}
                              className={classeSelectCaixa}
                            >
                              <option value="">Cidade do hotel</option>
                              {CIDADES_VOLTA.map((l) => (
                                <option key={l.id} value={l.id}>{l.nome}</option>
                              ))}
                            </select>
                            <IconeSeta />
                          </label>
                          <label className={celula}>
                            <span className={rotuloMobile}>Aeroporto de partida</span>
                            <select
                              value={aeroportoVolta}
                              disabled={!cidadeVolta}
                              onChange={(e) => setAeroportoVolta(e.target.value as LocalId | "")}
                              onBlur={() => tocar("aeroportoVolta")}
                              className={classeSelectCaixa}
                            >
                              <option value="">{cidadeVolta ? "Aeroporto" : "Escolha a cidade"}</option>
                              {aeroportosVolta.map((a) => (
                                <option key={a} value={a}>{nomeLocal(a)}</option>
                              ))}
                            </select>
                            <IconeSeta />
                          </label>
                          <label className={celula}>
                            <span className={rotuloMobile}>Data de partida</span>
                            <input
                              type="date"
                              min={(temChegada && dataChegada) || hojeISO()}
                              value={dataPartida}
                              onChange={(e) => setDataPartida(e.target.value)}
                              onBlur={() => tocar("dataPartida")}
                              className={classeDataCaixa}
                            />
                          </label>
                        </div>
                        {erroVolta && <p className="mt-1.5 text-xs text-red-600">{erroVolta}</p>}
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-4 border-t border-black/[0.08] pt-5 sm:flex-row sm:items-end sm:justify-between">
                      <div className="sm:w-56">
                        <span className="mb-1.5 block text-xs font-medium text-black/60">Passageiros</span>
                        <div className="flex h-12 items-center justify-between gap-2 rounded-xl border border-black/15 bg-white px-2">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-5 w-5 shrink-0 text-black/55" aria-hidden="true">
                            <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5Z" />
                          </svg>
                          <button
                            type="button"
                            onClick={() => ajustarPassageiros(passageiros - 1)}
                            disabled={passageiros <= 1}
                            aria-label="Menos um passageiro"
                            className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
                          >
                            −
                          </button>
                          <span className={`${inter.className} w-7 text-center text-base font-semibold tabular-nums text-[#0A2540]`} aria-live="polite">
                            {passageiros}
                          </span>
                          <button
                            type="button"
                            onClick={() => ajustarPassageiros(passageiros + 1)}
                            disabled={passageiros >= MAX_PASSAGEIROS}
                            aria-label="Mais um passageiro"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={acionarCta}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#1f6fb8] px-8 text-sm font-semibold text-white transition hover:bg-[#2f80c9] sm:w-auto"
                      >
                        Ver veículos
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {/* ── ETAPA 2 — VEÍCULO + OPCIONAIS ── */}
              {etapa === 2 && (
                <section aria-labelledby="titulo-etapa-2">
                  <h2 id="titulo-etapa-2" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Escolha o veículo
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">
                    Para{" "}
                    <button type="button" onClick={() => irPara(1)} className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                      {passageiros} {passageiros === 1 ? "passageiro" : "passageiros"}
                    </button>
                    . Valor total {trechos.length > 1 ? "dos dois trechos" : "do trecho"}, o mesmo veículo na ida e na volta.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {VEICULOS_MOTORISTA.filter((v) => veiculoComporta(v.assentos)).map((v) => {
                      const ativo = veiculoEscolhido && veiculoId === v.id;
                      const curto = VEICULO_CURTO[v.id];
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setVeiculoId(v.id);
                            setVeiculoEscolhido(true);
                          }}
                          aria-pressed={ativo}
                          className={`relative flex items-center gap-4 overflow-hidden rounded-xl border p-3 text-left transition sm:flex-col sm:items-stretch sm:gap-0 sm:p-0 ${
                            ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.05] ring-1 ring-[#2f80c9]" : "border-black/10 bg-white hover:border-black/25"
                          }`}
                        >
                          <span className="relative block h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-[#0f1a24] sm:aspect-[3/2] sm:h-auto sm:w-full sm:rounded-none">
                            <Image src={v.foto} alt="" fill sizes="(min-width: 640px) 260px, 112px" className="object-cover" />
                            {v.id === "alphard8" && (
                              <span className="absolute left-1.5 top-1.5 rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0A2540] shadow-sm sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
                                Mais pedido
                              </span>
                            )}
                          </span>
                          <span className="block min-w-0 sm:border-t sm:border-black/[0.06] sm:p-4">
                            <span className="block text-[15px] font-medium text-black">{curto.nome}</span>
                            <span className="mt-0.5 block text-sm font-semibold text-[#0A2540]">Até {v.assentos} passageiros</span>
                            <span className="mt-0.5 block text-xs text-black/55">{curto.perfil}</span>
                            <span className={`${inter.className} mt-2 block text-sm font-semibold tabular-nums text-[#0A2540]`}>
                              {formatUSD(precoTrechos(v.id))}
                              <span className="text-xs font-normal text-black/45"> {trechos.length > 1 ? "ida e volta" : "o trecho"}</span>
                            </span>
                          </span>
                          {ativo && (
                            <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#2f80c9] text-white">
                              <IconeCheck className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-8 grid gap-5 border-t border-black/10 pt-6 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Incluído</p>
                      <p className="mt-1.5 text-sm text-black/65">
                        Impostos, combustível, pedágios e estacionamento. Na chegada, até 90 min de espera após o pouso.
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Não incluído</p>
                      <p className="mt-1.5 text-sm text-black/65">Paradas e deslocamentos fora do trajeto aeroporto ↔ hotel.</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Opcionais</p>
                    <div className="mt-2 divide-y divide-black/[0.06]">
                      {[
                        {
                          marcado: opcionalMeetGreet,
                          alternar: () => setOpcionalMeetGreet((v) => !v),
                          titulo: "Meet & Greet — recepção no desembarque com placa de identificação",
                          icone: "/images/icone-meet-greet.png",
                          detalhe: `${formatUSD(ADICIONAL_MEET_GREET_USD)}, confirmado pela nossa equipe`,
                        },
                        {
                          marcado: opcionalCadeirinha,
                          alternar: () => setOpcionalCadeirinha((v) => !v),
                          titulo: "Cadeirinha infantil",
                          icone: "/images/icone-cadeirinha.png",
                          detalhe: `${formatUSD(ADICIONAL_CADEIRINHA_USD)} por cadeirinha, confirmado pela nossa equipe`,
                          quantidade: true,
                        },
                        {
                          marcado: opcionalBilingue,
                          alternar: () => setOpcionalBilingue((v) => !v),
                          titulo: "Solicitar motorista bilíngue português/inglês",
                          icone: "/images/icone-motorista-bilingue.png",
                          detalhe: "Sujeito à disponibilidade e valor adicional. Recomendamos solicitar com antecedência.",
                          aviso: true,
                        },
                      ].map((op) => (
                        <div key={op.titulo} className="flex flex-wrap items-center justify-between gap-x-4">
                          <label className="flex min-h-[64px] min-w-0 flex-1 cursor-pointer items-center gap-3 py-3">
                            <input
                              type="checkbox"
                              checked={op.marcado}
                              onChange={op.alternar}
                              className="h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                            />
                            <Image
                              src={op.icone}
                              alt=""
                              width={44}
                              height={44}
                              className={`h-11 w-11 shrink-0 transition-opacity ${op.marcado ? "opacity-100" : "opacity-70"}`}
                            />
                            <span className="min-w-0">
                              <span className="block text-sm text-black/85">{op.titulo}</span>
                              <span className="mt-0.5 flex items-center gap-1.5 text-xs text-black/50">
                                {op.aviso && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />}
                                {op.detalhe}
                              </span>
                            </span>
                          </label>
                          {"quantidade" in op && op.marcado && (
                            <div className="mb-3 ml-[88px] flex items-center gap-1 sm:mb-0 sm:ml-0">
                              <button
                                type="button"
                                onClick={() => setQtdCadeirinhas((q) => Math.max(1, q - 1))}
                                disabled={qtdCadeirinhas <= 1}
                                aria-label="Menos uma cadeirinha"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-base text-black/60 transition hover:border-black/30 disabled:opacity-40"
                              >
                                −
                              </button>
                              <span className={`${inter.className} w-6 text-center text-sm font-semibold tabular-nums text-[#0A2540]`}>{qtdCadeirinhas}</span>
                              <button
                                type="button"
                                onClick={() => setQtdCadeirinhas((q) => Math.min(6, q + 1))}
                                aria-label="Mais uma cadeirinha"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-base text-black/60 transition hover:border-black/30"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalRegras(true)}
                      className="mt-2 min-h-[44px] text-sm font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2"
                    >
                      Ver regras e adicionais
                    </button>
                  </div>
                </section>
              )}

              {/* ── ETAPA 3 — DADOS ── */}
              {etapa === 3 && (
                <section aria-labelledby="titulo-etapa-3">
                  <h2 id="titulo-etapa-3" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Seus dados e voos
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Com o número do voo, o motorista acompanha atrasos e antecipações.</p>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Campo rotulo="Nome completo" erro={mostrarErro("nome")}>
                        <input
                          type="text"
                          autoComplete="name"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          onBlur={() => tocar("nome")}
                          className={classeInput(!!mostrarErro("nome"))}
                        />
                      </Campo>
                    </div>
                    <Campo rotulo="E-mail" erro={mostrarErro("email")}>
                      <input
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => tocar("email")}
                        className={classeInput(!!mostrarErro("email"))}
                      />
                    </Campo>
                    <Campo rotulo="WhatsApp" erro={mostrarErro("whatsapp")} ajuda="Com DDD. Para número de fora do Brasil, comece com +.">
                      <input
                        type="tel"
                        autoComplete="tel"
                        inputMode="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(mascararWhatsapp(e.target.value))}
                        onBlur={() => tocar("whatsapp")}
                        placeholder="(11) 99999-9999"
                        className={classeInput(!!mostrarErro("whatsapp"))}
                      />
                    </Campo>
                    {temChegada && (
                      <>
                        <Campo rotulo="Voo de chegada (opcional)">
                          <input
                            type="text"
                            value={vooChegada}
                            onChange={(e) => setVooChegada(e.target.value.toUpperCase())}
                            placeholder="ex.: JL 34"
                            className={classeInput(false)}
                          />
                        </Campo>
                        <Campo rotulo="Horário de pouso (opcional)">
                          <input
                            type="time"
                            value={horarioPouso}
                            onChange={(e) => setHorarioPouso(e.target.value)}
                            className={`${classeInput(false)} block appearance-none text-left`}
                          />
                        </Campo>
                      </>
                    )}
                    {temVolta && (
                      <>
                        <Campo rotulo="Voo de partida (opcional)">
                          <input
                            type="text"
                            value={vooPartida}
                            onChange={(e) => setVooPartida(e.target.value.toUpperCase())}
                            placeholder="ex.: JL 33"
                            className={classeInput(false)}
                          />
                        </Campo>
                        <Campo rotulo="Horário de decolagem (opcional)">
                          <input
                            type="time"
                            value={horarioDecolagem}
                            onChange={(e) => setHorarioDecolagem(e.target.value)}
                            className={`${classeInput(false)} block appearance-none text-left`}
                          />
                        </Campo>
                      </>
                    )}
                    <div className="sm:col-span-2">
                      <Campo rotulo="Hotel (opcional)">
                        <input
                          type="text"
                          value={hotel}
                          onChange={(e) => setHotel(e.target.value)}
                          placeholder="Nome do hotel"
                          className={classeInput(false)}
                        />
                      </Campo>
                    </div>
                    <div className="sm:col-span-2">
                      <Campo rotulo="Observações (opcional)">
                        <textarea
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          rows={3}
                          placeholder="Quantidade de bagagem, carrinho de bebê ou solicitações especiais."
                          className="w-full min-w-0 rounded-lg border border-black/15 bg-white px-3.5 py-3 text-sm text-black focus:border-[#2f80c9] focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/20"
                        />
                      </Campo>
                    </div>
                  </div>
                </section>
              )}

              {/* ── ETAPA 4 — REVISÃO ── */}
              {etapa === 4 && (
                <section aria-labelledby="titulo-etapa-4">
                  <h2 id="titulo-etapa-4" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Revise seu pedido
                  </h2>
                  <dl className="mt-6 divide-y divide-black/[0.07] border-y border-black/[0.07]">
                    {[
                      {
                        rotulo: "Trechos",
                        voltar: 1 as Etapa,
                        conteudo: (
                          <div className="space-y-1.5">
                            {trechos.map((t) => (
                              <p key={t.chave} className="flex justify-between gap-3">
                                <span className="min-w-0">
                                  <span className="text-black/55">
                                    {t.chave === "chegada" ? "Chegada" : "Volta"} · {formatarDataCurta(t.data)} ·{" "}
                                  </span>
                                  {textoTrecho(t)}
                                </span>
                                <span className={`${inter.className} shrink-0 tabular-nums text-black/70`}>{formatUSD(t.rota.precoUSD[veiculoId])}</span>
                              </p>
                            ))}
                            <p className="text-black/55">
                              {passageiros} {passageiros === 1 ? "passageiro" : "passageiros"}
                            </p>
                          </div>
                        ),
                      },
                      {
                        rotulo: "Veículo",
                        voltar: 2 as Etapa,
                        conteudo: (
                          <div className="space-y-1">
                            <p>
                              {veiculoCurto.nome} <span className="text-black/50">· até {veiculo.assentos} passageiros</span>
                            </p>
                            {(opcionalMeetGreet || opcionalCadeirinha || opcionalBilingue) && (
                              <p className="text-black/55">
                                Opcionais:{" "}
                                {[
                                  opcionalMeetGreet && "Meet & Greet",
                                  opcionalCadeirinha && (qtdCadeirinhas > 1 ? `${qtdCadeirinhas} cadeirinhas infantis` : "cadeirinha infantil"),
                                  opcionalBilingue && "motorista bilíngue",
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                        ),
                      },
                      {
                        rotulo: "Dados e voos",
                        voltar: 3 as Etapa,
                        conteudo: (
                          <div className="space-y-0.5">
                            <p>{nome}</p>
                            <p className="text-black/60">{whatsapp}</p>
                            <p className="text-black/60">{email}</p>
                            {temChegada && (vooChegada || horarioPouso) && (
                              <p className="text-black/60">
                                Chegada: {vooChegada}
                                {horarioPouso && ` · pouso ${horarioPouso}`}
                              </p>
                            )}
                            {temVolta && (vooPartida || horarioDecolagem) && (
                              <p className="text-black/60">
                                Partida: {vooPartida}
                                {horarioDecolagem && ` · decolagem ${horarioDecolagem}`}
                              </p>
                            )}
                            {hotel && <p className="text-black/60">Hotel: {hotel}</p>}
                          </div>
                        ),
                      },
                    ].map((linha) => (
                      <div key={linha.rotulo} className="grid gap-1 py-4 sm:grid-cols-[170px_minmax(0,1fr)_auto] sm:gap-4">
                        <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55 sm:pt-0.5">{linha.rotulo}</dt>
                        <dd className="min-w-0 text-sm text-black/85">{linha.conteudo}</dd>
                        <button
                          type="button"
                          onClick={() => irPara(linha.voltar)}
                          className="self-start justify-self-start text-sm font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2 sm:justify-self-end"
                        >
                          Editar
                        </button>
                      </div>
                    ))}
                    <div className="grid gap-1 py-4 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-4">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/55 sm:pt-1.5">Total estimado</dt>
                      <dd>
                        <span className={`${inter.className} text-2xl font-bold tabular-nums text-[#0A2540]`}>{formatUSD(totalUSD)}</span>
                        <span className={`${inter.className} ml-2 text-sm tabular-nums text-black/50`}>≈ {formatBRL(totalBRL)}</span>
                      </dd>
                    </div>
                  </dl>
                  {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-5" />}

                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Termos e Condições</p>
                  <div
                    tabIndex={0}
                    aria-label="Termos e Condições do transfer"
                    className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] leading-6 text-black/70 focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/30"
                  >
                    <TextoTermosTransporte />
                  </div>

                  <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termosAceitos}
                      onChange={(e) => setTermosAceitos(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                    />
                    <span className="text-sm text-black/85">Li e aceito os Termos e Condições do transfer.</span>
                  </label>
                  {tentouEnviar && !termosAceitos && (
                    <p className="ml-8 text-xs text-red-600">Aceite os Termos e Condições para solicitar o transfer.</p>
                  )}
                  <p className="mt-4 text-xs leading-5 text-black/50">
                    Nenhum valor é cobrado agora. Nossa equipe confirma disponibilidade, horários e forma de pagamento com
                    você pelo WhatsApp.
                  </p>
                  {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
                </section>
              )}

              {etapa > 1 && (
                <button
                  type="button"
                  onClick={() => irPara((etapa - 1) as Etapa)}
                  className="mt-8 flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-black/60 transition hover:text-black"
                >
                  <span aria-hidden="true">←</span> Voltar para {ETAPAS[etapa - 2].toLowerCase()}
                </button>
              )}
            </div>

            <aside className="hidden lg:block" aria-label="Resumo do pedido">
              <div className="sticky top-[8.5rem] rounded-2xl border border-black/10 bg-white p-6 shadow-[0_10px_30px_-18px_rgba(10,37,64,0.35)]">
                {conteudoResumo}
                <div className="mt-6">{botaoCta()}</div>
                {textoStatus && <p className="mt-2.5 text-center text-xs text-black/55">{textoStatus}</p>}
              </div>
            </aside>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_rgba(10,37,64,0.08)] lg:hidden">
            {resumoAbertoMobile && <div className="max-h-[50svh] overflow-y-auto border-b border-black/10 pb-4 pt-1">{conteudoResumo}</div>}
            <button
              type="button"
              onClick={() => setResumoAbertoMobile((v) => !v)}
              aria-expanded={resumoAbertoMobile}
              className="flex min-h-[44px] w-full items-center justify-between gap-3 text-left"
            >
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-[0.14em] text-black/50">
                  {MODOS.find((m) => m.key === modo)?.nome}
                  {trechos.length > 0 && <> · {linhaData}</>}
                </span>
                <span
                  key={Math.round(totalExibidoUSD ?? 0)}
                  className={`${inter.className} block rounded text-xl font-bold tabular-nums text-[#0A2540]`}
                  style={totalExibidoUSD !== null ? { animation: "ajisai-destaque-preco 0.9s ease-out" } : undefined}
                >
                  {totalExibidoUSD !== null ? formatUSD(totalExibidoUSD) : "—"}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-[#1f6fb8]">
                {resumoAbertoMobile ? "Fechar" : "Ver resumo"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 transition-transform ${resumoAbertoMobile ? "" : "rotate-180"}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div className="mt-2">{botaoCta()}</div>
            {textoStatus && <p className="mt-1.5 text-center text-[11px] text-black/55">{textoStatus}</p>}
          </div>
        </>
      )}

      <Modal aberto={modalRegras} titulo="Regras e adicionais" onFechar={() => setModalRegras(false)}>
        <p className="font-medium text-black">Incluído no valor</p>
        <p className="mt-1">
          Impostos, estacionamento, pedágios (ETC) e combustível. Na chegada, até 90 min a partir do pouso; na volta,
          30 min de tolerância na saída do hotel.
        </p>
        <p className="mt-4 font-medium text-black">Hora extra</p>
        <p className="mt-1">
          Espera além do tempo incluído é cobrada à parte, em blocos de 30 minutos (sempre arredondado pra cima), com
          tarifa por veículo e rota.
        </p>
        <p className="mt-4 font-medium text-black">Adicionais</p>
        <p className="mt-1">
          Meet &amp; Greet (recepção com placa de identificação) — {formatUSD(ADICIONAL_MEET_GREET_USD)}. Cadeirinha
          infantil — {formatUSD(ADICIONAL_CADEIRINHA_USD)}. Motorista bilíngue português/inglês — sob consulta, com valor
          adicional e disponibilidade limitada. Sem essa solicitação, o motorista fala japonês.
        </p>
        <p className="mt-4 font-medium text-black">Cancelamento</p>
        <p className="mt-1">{POLITICA_CANCELAMENTO_MOTORISTA}</p>
      </Modal>
    </main>
  );
}
