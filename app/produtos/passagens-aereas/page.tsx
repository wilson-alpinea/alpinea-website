"use client";

// Passagens Aéreas — página de produto no mesmo template do Transporte
// Privado (pedido do Wilson, 30/set/2026: "ajustar pagina de passagens
// aereas para ser igual temos na pagina de transporte privado, mesmo
// template geral, checkout deve ser manual e não automatico via Stone").
// Sem pagamento no site: o envio registra o pedido de cotação no CRM
// (/api/passagens-selfservice) e a equipe fecha tarifa, emissão e
// pagamento pelo WhatsApp.
//
// 4 etapas: 1 Viagem (tipo, origem, destino, datas, passageiros — no
// estilo da SIXT) → 2 Cabine (valor de referência por passageiro +
// preferências) → 3 Dados → 4 Revisão (termos numa caixa na página).
//
// Valores de referência = os mesmos do motor de preço
// (PRECO_AEREO_* em CustomPackageCard.tsx): ida e volta por passageiro.
// A tarifa real depende de datas e disponibilidade — por isso a página
// fala sempre em "valor de referência" e o total é "estimado".

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatBRL, formatUSD, useCambioUSD } from "../../hooks/useCambioUSD";
import {
  PRECO_AEREO_ECONOMY_BRL,
  PRECO_AEREO_PREMIUM_ECONOMY_USD,
  PRECO_AEREO_BUSINESS_USD,
  PRECO_AEREO_FIRST_USD,
} from "../../components/CustomPackageCard";
import { DIFERENCIAIS_AEREO } from "../../lib/diferenciaisAereo";
import { TERMOS_PDF_PASSAGENS, TERMOS_VERSAO_PASSAGENS, TextoTermosPassagens } from "./TermosPassagens";
import { display, WHATSAPP_NUMBER, hojeISO } from "../page";
import {
  inter,
  IconeResumo,
  formatarDataCurta,
  formatarDiaMes,
  mascararWhatsapp,
  IconeCheck,
  Campo,
  classeInput,
  BlocoAvisos,
  IconeSeta,
} from "../../components/transporte/compartilhado";

const ETAPAS = ["Viagem", "Cabine", "Dados", "Revisão"] as const;
type Etapa = 1 | 2 | 3 | 4;

type Modo = "ida-volta" | "so-ida";
const MODOS: { key: Modo; nome: string }[] = [
  { key: "ida-volta", nome: "Ida e volta" },
  { key: "so-ida", nome: "Só ida" },
];

// Sentido da viagem — Wilson, 06/out/2026: "deixar disponível origem
// Japão > Brasil". O estado continua o mesmo (origem = cidade no Brasil,
// destino/destinoVolta = cidades no Japão); só muda a ordem dos campos e
// dos trechos.
type Sentido = "br-jp" | "jp-br";
const SENTIDOS: { key: Sentido; nome: string }[] = [
  { key: "br-jp", nome: "Brasil → Japão" },
  { key: "jp-br", nome: "Japão → Brasil" },
];

// Destaques/promoções — banner na coluna da esquerda da etapa 1 (Wilson,
// 06/out/2026). Clicar preenche o trecho da promoção no formulário. Para
// trocar/adicionar promoções, só mexer nesta lista.
const PROMOCOES: {
  id: string;
  imagem: string;
  largura: number;
  altura: number;
  alt: string;
  legenda: string;
  aplicar: { sentido: Sentido; modo: Modo; origem: string; destino: string };
}[] = [
  {
    id: "japao-sp-229mil",
    // Arte nova (Wilson, 06/out/2026: "ajustar banner por arte nova").
    imagem: "/images/passagens-promo-japao-sao-paulo-229mil-v3.webp",
    largura: 1024,
    altura: 438,
    alt: "Saindo do Japão, a partir de 229 mil ienes ida e volta — Tokyo ↔ São Paulo e Osaka ↔ São Paulo, Emirates e Qatar",
    legenda: "Saindo do Japão: Tóquio ou Osaka ↔ São Paulo, ida e volta a partir de ¥229 mil (Emirates e Qatar).",
    aplicar: { sentido: "jp-br", modo: "ida-volta", origem: "GRU", destino: "TYO" },
  },
];

const ORIGENS: { id: string; nome: string; uf: string }[] = [
  { id: "GRU", nome: "São Paulo (GRU)", uf: "SP" },
  { id: "GIG", nome: "Rio de Janeiro (GIG)", uf: "RJ" },
  { id: "BSB", nome: "Brasília (BSB)", uf: "DF" },
  { id: "CNF", nome: "Belo Horizonte (CNF)", uf: "MG" },
  { id: "CWB", nome: "Curitiba (CWB)", uf: "PR" },
  { id: "POA", nome: "Porto Alegre (POA)", uf: "RS" },
  { id: "SSA", nome: "Salvador (SSA)", uf: "BA" },
  { id: "REC", nome: "Recife (REC)", uf: "PE" },
  { id: "FOR", nome: "Fortaleza (FOR)", uf: "CE" },
  { id: "BEL", nome: "Belém (BEL)", uf: "PA" },
  { id: "MAO", nome: "Manaus (MAO)", uf: "AM" },
  { id: "JPA", nome: "João Pessoa (JPA)", uf: "PB" },
  { id: "CGR", nome: "Campo Grande (CGR)", uf: "MS" },
  { id: "CGB", nome: "Cuiabá (CGB)", uf: "MT" },
  { id: "VIX", nome: "Vitória (VIX)", uf: "ES" },
  { id: "FLN", nome: "Florianópolis (FLN)", uf: "SC" },
  { id: "NVT", nome: "Navegantes (NVT)", uf: "SC" },
  { id: "OUTRA", nome: "Outra cidade", uf: "" },
];

// Adicional do trecho doméstico no Brasil, por passageiro, em US$ —
// Wilson, 06/out/2026: "se não for SP como origem, colocar +500 USD ida e
// volta, 300 USD se for só ida, qualquer origem em SP [sem adicional], se
// for norte ou nordeste 600 USD só ida, 1000 USD se for ida e volta".
// Vale nos dois sentidos (a cidade no Brasil é origem ou destino).
const UFS_BRASIL = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
const UFS_NORTE_NORDESTE = ["AC", "AM", "AP", "PA", "RO", "RR", "TO", "AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"];
function adicionalDomesticoUSD(uf: string, idaEVolta: boolean): number {
  if (!uf || uf === "SP") return 0;
  if (UFS_NORTE_NORDESTE.includes(uf)) return idaEVolta ? 1000 : 600;
  return idaEVolta ? 500 : 300;
}
const DESTINOS = [
  { id: "TYO", nome: "Tóquio (NRT/HND)" },
  { id: "KIX", nome: "Osaka (KIX)" },
  { id: "NGO", nome: "Nagoya (NGO)" },
  { id: "KMQ", nome: "Komatsu (KMQ)" },
  { id: "IZO", nome: "Izumo (IZO)" },
  { id: "HIJ", nome: "Hiroshima (HIJ)" },
];
const nomeOrigem = (id: string) => ORIGENS.find((o) => o.id === id)?.nome ?? id;
const nomeDestino = (id: string) => DESTINOS.find((d) => d.id === id)?.nome ?? id;

type Cabine = "economy" | "premium" | "business" | "first";
const CABINES: { key: Cabine; nome: string; perfil: string }[] = [
  { key: "economy", nome: "Econômica", perfil: "Tarifa mais acessível, com bagagem conforme a companhia" },
  { key: "premium", nome: "Premium Economy", perfil: "Mais espaço para as pernas e serviço de bordo superior" },
  { key: "business", nome: "Executiva", perfil: "Assento que vira cama, sala VIP e prioridade no embarque" },
  { key: "first", nome: "Primeira Classe", perfil: "Suíte privativa e o serviço mais exclusivo da companhia" },
];

// Companhias com que a Ajisai emite para o Japão (mesma lista de /passagens).
const COMPANHIAS = ["Emirates", "Qatar Airways", "Air France", "KLM", "Lufthansa", "Swiss", "Ethiopian"];

// Visto americano — Wilson, 06/out/2026 ("se tem visto americano ou
// não"): define se dá para cotar conexões pelos EUA.
type VistoEUA = "" | "todos" | "alguns" | "nao";
const OPCOES_VISTO_EUA: { key: Exclude<VistoEUA, "">; nome: string }[] = [
  { key: "todos", nome: "Sim, todos os passageiros" },
  { key: "alguns", nome: "Só alguns passageiros" },
  { key: "nao", nome: "Não" },
];

// "Quando tem intenção de concluir a compra?" — na revisão (Wilson,
// 06/out/2026). Ajuda a equipe a priorizar as cotações.
const PRAZOS_COMPRA = ["Dentro de 1 semana", "Dentro de 15 dias", "Dentro de 1 mês", "Dentro de 3 meses", "Não tenho urgência"];

const MAX_POR_FAIXA = 9;

function Contador({
  rotulo,
  ajuda,
  valor,
  min,
  onChange,
}: {
  rotulo: string;
  ajuda: string;
  valor: number;
  min: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="min-w-0">
        <span className="block text-sm text-black/85">{rotulo}</span>
        <span className="block text-xs text-black/45">{ajuda}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, valor - 1))}
          disabled={valor <= min}
          aria-label={`Menos ${rotulo.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
        >
          −
        </button>
        <span className={`${inter.className} w-7 text-center text-base font-semibold tabular-nums text-[#0A2540]`} aria-live="polite">
          {valor}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(MAX_POR_FAIXA, valor + 1))}
          disabled={valor >= MAX_POR_FAIXA}
          aria-label={`Mais ${rotulo.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-lg text-black/70 transition hover:border-black/35 disabled:opacity-30"
        >
          +
        </button>
      </span>
    </div>
  );
}

// Ícones de linha da revisão (Wilson, 06/out/2026: "deixar mais
// agradável, usar ícones").
function Icone({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`h-[18px] w-[18px] shrink-0 ${className}`}>
      <path d={d} />
    </svg>
  );
}
const ICONES = {
  pessoas: "M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6M20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.6a3 3 0 0 1 0 5.8",
  calendario: "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 12h2M14 12h2M8 16h2",
  etiqueta: "M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9zM7.5 7.5h.01",
  assento: "M6 4v9a2 2 0 0 0 2 2h7l2 5M6 13h9M9 4h0M5 20h4",
  aviao: "M10.5 12 3 9.5l1.5-1.5 8 1L17 4.5a1.8 1.8 0 0 1 2.5 2.5L15 11.5l1 8-1.5 1.5L12 13.5l-3 3V19l-1.5 1.5-1-3.5-3.5-1L4.5 14.5H7l3-3",
  usuario: "M19 20v-1.5a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4V20M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  telefone: "M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1",
  email: "M4 6h16v12H4zM4 7l8 6 8-6",
  passaporte: "M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6M9 17h6",
  documento: "M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M9 13h6M9 17h6",
} as const;

function LinhaIcone({ icone, img, children }: { icone?: keyof typeof ICONES; img?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1f6fb8]/[0.08] text-[#1f6fb8]">
        {img ? <IconeResumo src={img} /> : icone ? <Icone d={ICONES[icone]} /> : null}
      </span>
      <div className="min-w-0 pt-1">{children}</div>
    </div>
  );
}

export default function PassagensAereasPage() {
  const cambio = useCambioUSD();
  const cambioCotacao = cambio?.cotacao ?? 5.3;

  const [etapa, setEtapa] = useState<Etapa>(1);
  const [modo, setModo] = useState<Modo>("ida-volta");
  const [sentido, setSentido] = useState<Sentido>("br-jp");
  const [origem, setOrigem] = useState("");
  const [origemOutra, setOrigemOutra] = useState("");
  const [ufOutra, setUfOutra] = useState("");
  const [destino, setDestino] = useState("");
  const [destinoVolta, setDestinoVolta] = useState("");
  const [dataIda, setDataIda] = useState("");
  const [dataVolta, setDataVolta] = useState("");
  const [adultos, setAdultos] = useState(1);
  const [criancas, setCriancas] = useState(0);
  const [bebes, setBebes] = useState(0);

  const [cabine, setCabine] = useState<Cabine | "">("");
  const [companhia, setCompanhia] = useState("");
  const [datasFlexiveis, setDatasFlexiveis] = useState(false);
  // "Tem disponibilidade para viajar em outra data sugerida por nós?" —
  // com datas sugeridas a equipe consegue promoções/tarifas melhores
  // (Wilson, 06/out/2026). null = não respondeu (opcional).
  const [aceitaDataSugerida, setAceitaDataSugerida] = useState<boolean | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [nomesPassageiros, setNomesPassageiros] = useState("");
  const [vistoEUA, setVistoEUA] = useState<VistoEUA>("");
  const [observacoes, setObservacoes] = useState("");

  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const [tentouAvancarViagem, setTentouAvancarViagem] = useState(false);
  const [tentouAvancarDados, setTentouAvancarDados] = useState(false);
  const [termosAceitos, setTermosAceitos] = useState(false);
  const [prazoCompra, setPrazoCompra] = useState("");
  // Termos com rolagem obrigatória até o fim antes do aceite — mesmo
  // comportamento do Seguro Viagem (Wilson, 06/out/2026).
  const [termosRolados, setTermosRolados] = useState(false);
  const termosBoxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = termosBoxRef.current;
    if (etapa === 4 && el && el.scrollHeight <= el.clientHeight + 4) setTermosRolados(true);
  }, [etapa]);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [resumoAbertoMobile, setResumoAbertoMobile] = useState(false);
  const [status, setStatus] = useState<"form" | "enviando" | "enviado" | "erro">("form");
  const [erro, setErro] = useState("");

  const stepperRef = useRef<HTMLDivElement | null>(null);

  const temVolta = modo === "ida-volta";
  const voltaDe = destinoVolta || destino;
  const passageirosPagantes = adultos + criancas;
  const totalPassageiros = adultos + criancas + bebes;

  // ── Validação ──
  const errosViagem: Record<string, string | null> = {
    origem: !origem
      ? sentido === "br-jp"
        ? "Escolha a cidade de origem."
        : "Escolha o destino no Brasil."
      : origem === "OUTRA" && origemOutra.trim().length < 2
        ? "Informe a cidade no Brasil."
        : origem === "OUTRA" && !ufOutra
          ? "Informe o estado da cidade no Brasil."
          : null,
    destino: !destino ? (sentido === "br-jp" ? "Escolha o destino no Japão." : "Escolha a cidade de saída no Japão.") : null,
    dataIda: !dataIda ? "Informe a data de ida." : dataIda < hojeISO() ? "A ida precisa ser hoje ou depois." : null,
    dataVolta: !temVolta
      ? null
      : !dataVolta
        ? "Informe a data de volta."
        : dataIda && dataVolta < dataIda
          ? "A volta precisa ser no dia da ida ou depois."
          : null,
    bebes: bebes > adultos ? "Cada bebê precisa viajar no colo de um adulto." : null,
  };
  const viagemValida = Object.values(errosViagem).every((e) => e === null);

  const digitosWhatsapp = whatsapp.replace(/\D/g, "").length;
  const errosDados: Record<string, string | null> = {
    nome: nome.trim().length < 3 ? "Informe seu nome completo." : null,
    email: /^\S+@\S+\.\S+$/.test(email.trim()) ? null : "Informe um e-mail válido.",
    whatsapp: digitosWhatsapp >= 10 ? null : "Informe um WhatsApp com DDD.",
    vistoEUA: vistoEUA ? null : "Informe se tem visto americano.",
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

  // ── Valores de referência (ida e volta, por passageiro, em US$) ──
  const referenciaUSD = (c: Cabine) =>
    c === "economy"
      ? PRECO_AEREO_ECONOMY_BRL / cambioCotacao
      : c === "premium"
        ? PRECO_AEREO_PREMIUM_ECONOMY_USD
        : c === "business"
          ? PRECO_AEREO_BUSINESS_USD
          : PRECO_AEREO_FIRST_USD;
  const ufBrasil = origem === "OUTRA" ? ufOutra : ORIGENS.find((o) => o.id === origem)?.uf ?? "";
  const adicionalUSD = adicionalDomesticoUSD(ufBrasil, temVolta);
  const precoCabineUSD = (c: Cabine) => referenciaUSD(c) + adicionalUSD;
  const porPassageiroUSD = cabine ? precoCabineUSD(cabine) : 0;
  const totalUSD = porPassageiroUSD * passageirosPagantes;
  const totalBRL = totalUSD * cambioCotacao;
  const nomeCabine = CABINES.find((c) => c.key === cabine)?.nome ?? "";
  const menorReferencia = precoCabineUSD("economy") * passageirosPagantes;

  // Avisos (só informam).
  const avisos: string[] = [];
  if (viagemValida && !temVolta && sentido === "br-jp")
    avisos.push("Passagem só de ida — confirme com a nossa equipe as exigências de entrada no Japão sem bilhete de volta.");
  if (viagemValida && temVolta && voltaDe !== destino)
    avisos.push(
      sentido === "br-jp"
        ? `Chegada em ${nomeDestino(destino)} e volta saindo de ${nomeDestino(voltaDe)} — o deslocamento entre as cidades no Japão não está incluído.`
        : `Saída de ${nomeDestino(destino)} e volta para ${nomeDestino(voltaDe)} — o deslocamento entre as cidades no Japão não está incluído.`,
    );
  if (bebes > 0) avisos.push("Bebês (até 2 anos) viajam no colo, com tarifa própria da companhia — cotamos junto.");

  const etapa1Ok = viagemValida && adultos >= 1;
  const etapa2Ok = cabine !== "";
  const etapa3Ok = dadosValidos;
  const etapasOk = [etapa1Ok, etapa2Ok, etapa3Ok];
  const podeEnviar = etapa1Ok && etapa2Ok && etapa3Ok && termosAceitos && prazoCompra !== "";

  const textoOrigem = origem === "OUTRA" ? origemOutra.trim() || "Outra cidade" : nomeOrigem(origem);
  // Trechos já na ordem certa para o sentido escolhido.
  const deIda = sentido === "br-jp" ? textoOrigem : nomeDestino(destino);
  const paraIda = sentido === "br-jp" ? nomeDestino(destino) : textoOrigem;
  const deVolta = sentido === "br-jp" ? nomeDestino(voltaDe) : textoOrigem;
  const paraVolta = sentido === "br-jp" ? textoOrigem : nomeDestino(voltaDe);
  const trechoIda = `${deIda} → ${paraIda}`;
  const trechoVolta = `${deVolta} → ${paraVolta}`;
  const textoFlexibilidade = [
    datasFlexiveis ? "datas flexíveis (±3 dias)" : "",
    aceitaDataSugerida === true ? "aceita outras datas sugeridas" : aceitaDataSugerida === false ? "só nas datas escolhidas" : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const textoPassageiros = [
    `${adultos} ${adultos === 1 ? "adulto" : "adultos"}`,
    criancas ? `${criancas} ${criancas === 1 ? "criança" : "crianças"}` : "",
    bebes ? `${bebes} ${bebes === 1 ? "bebê" : "bebês"}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  function irPara(nova: Etapa) {
    setEtapa(nova);
    setResumoAbertoMobile(false);
    const alvo = stepperRef.current;
    if (alvo) {
      const topo = alvo.getBoundingClientRect().top + window.scrollY - 56 + 24;
      if (window.scrollY > topo) window.scrollTo({ top: topo, behavior: "smooth" });
    }
  }

  const cta: { rotulo: string; ativo: boolean; falta: string | null } =
    etapa === 1
      ? { rotulo: "Ver cabines", ativo: true, falta: etapa1Ok ? null : "Preencha origem, destino e datas para continuar" }
      : etapa === 2
        ? etapa2Ok
          ? { rotulo: "Continuar", ativo: true, falta: null }
          : { rotulo: "Escolha a cabine", ativo: false, falta: "Escolha uma cabine para continuar" }
        : etapa === 3
          ? { rotulo: "Continuar", ativo: etapa3Ok, falta: etapa3Ok ? null : "Complete seus dados para continuar" }
          : {
              rotulo: status === "enviando" ? "Enviando…" : "Solicitar cotação",
              ativo: podeEnviar && status !== "enviando",
              falta: !prazoCompra
                ? "Diga quando pretende concluir a compra"
                : !termosRolados
                  ? "Leia os Termos e Condições até o fim"
                  : termosAceitos
                  ? null
                  : "Aceite os Termos e Condições para solicitar",
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
    if (!termosAceitos || !prazoCompra) {
      setTentouEnviar(true);
      return;
    }
    void enviar();
  }

  const etapasFaltando = etapasOk.filter((ok) => !ok).length;

  const resumoVoo = `${MODOS.find((m) => m.key === modo)?.nome}: ${trechoIda} em ${dataIda}${temVolta ? `; volta ${trechoVolta} em ${dataVolta}` : ""}${
    textoFlexibilidade ? ` (${textoFlexibilidade})` : ""
  }`;

  async function enviar() {
    if (!podeEnviar || status === "enviando") return;
    setStatus("enviando");
    setErro("");
    try {
      const resposta = await fetch("/api/passagens-selfservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumo: resumoVoo,
          modo,
          sentido: SENTIDOS.find((x) => x.key === sentido)?.nome,
          origem: deIda,
          destino: paraIda,
          destinoVolta: temVolta ? nomeDestino(voltaDe) : "",
          trechoIda,
          trechoVolta: temVolta ? trechoVolta : "",
          aceitaDataSugerida,
          dataIda,
          dataVolta: temVolta ? dataVolta : "",
          adultos,
          criancas,
          bebes,
          cabine: nomeCabine,
          companhia: companhia || "Sem preferência",
          datasFlexiveis,
          referenciaPorPassageiroUSD: Math.round(porPassageiroUSD),
          adicionalDomesticoPorPassageiroUSD: adicionalUSD,
          ufBrasil,
          totalUSD: Math.round(totalUSD),
          totalBRL: Math.round(totalBRL),
          avisos,
          nome,
          email,
          whatsapp,
          nomesPassageiros,
          vistoEUA: OPCOES_VISTO_EUA.find((o) => o.key === vistoEUA)?.nome ?? "",
          observacoes,
          termosAceitos,
          termosVersao: TERMOS_VERSAO_PASSAGENS,
          prazoCompra,
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

  const mensagemWhatsapp = `Olá! Acabei de pedir uma cotação de passagem aérea pelo site da Ajisai — ${resumoVoo}, ${nomeCabine}, ${textoPassageiros}.${
    nome ? ` Meu nome é ${nome}.` : ""
  }`;

  const totalExibidoUSD: number | null = cabine ? totalUSD : etapa1Ok ? menorReferencia : null;

  const conteudoResumo = (
    <div>
      <p className={`${display.className} text-lg font-medium text-[#0A2540]`}>Sua passagem</p>
      <p className="mt-2 text-sm text-black/80">
        {MODOS.find((m) => m.key === modo)?.nome}
        <span className="text-black/50"> · {textoPassageiros}</span>
      </p>
      {cabine ? (
        <p className="mt-1 text-sm text-black/80">{nomeCabine}</p>
      ) : (
        <p className="mt-1 text-sm text-black/45">Nenhuma cabine escolhida</p>
      )}
      <div className="mt-4 space-y-3 border-t border-black/10 pt-4">
        {!origem || !destino ? (
          <p className="text-sm text-black/45">Nenhum trecho escolhido</p>
        ) : (
          <>
            <div className="flex items-center gap-2.5 text-sm text-black/80">
              <IconeResumo src="/images/icone-decolagem.png" />
              <span className="min-w-0">
                <span className="block">
                  {trechoIda}
                </span>
                <span className="block text-xs text-black/50">Ida{dataIda && !errosViagem.dataIda && ` · ${formatarDataCurta(dataIda)}`}</span>
              </span>
            </div>
            {temVolta && (
              <div className="flex items-center gap-2.5 text-sm text-black/80">
                <IconeResumo src="/images/icone-pousando.png" />
                <span className="min-w-0">
                  <span className="block">
                    {trechoVolta}
                  </span>
                  <span className="block text-xs text-black/50">
                    Volta{dataVolta && !errosViagem.dataVolta && ` · ${formatarDataCurta(dataVolta)}`}
                  </span>
                </span>
              </div>
            )}
          </>
        )}
        {cabine && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-black/65">
              {passageirosPagantes} × {formatUSD(porPassageiroUSD - adicionalUSD)}
            </span>
            <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>
              {formatUSD((porPassageiroUSD - adicionalUSD) * passageirosPagantes)}
            </span>
          </div>
        )}
        {cabine && adicionalUSD > 0 && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-black/65">
              Trecho doméstico ({ufBrasil}) · {passageirosPagantes} × {formatUSD(adicionalUSD)}
            </span>
            <span className={`${inter.className} shrink-0 font-medium tabular-nums text-black`}>{formatUSD(adicionalUSD * passageirosPagantes)}</span>
          </div>
        )}
        {bebes > 0 && cabine && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-black/65">
              {bebes} {bebes === 1 ? "bebê" : "bebês"} de colo
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
        {totalExibidoUSD !== null && !cabine && <p className="text-xs text-black/50">a partir de, na Econômica · valor de referência</p>}
        {totalExibidoUSD !== null && cabine && (
          <p className={`${inter.className} text-xs tabular-nums text-black/50`}>
            ≈ {formatBRL(totalBRL)} · valor de referência, a tarifa final vem na cotação
          </p>
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

  // No celular as células empilham e os rótulos de cima somem — cada
  // célula ganha um rótulo pequeno interno (sm:hidden).
  const classeSelectCaixa =
    "h-14 w-full min-w-0 appearance-none bg-transparent pl-3 pr-9 pt-4 text-base text-black focus:outline-none disabled:text-black/35 sm:h-12 sm:pt-0 md:text-[15px]";
  const classeDataCaixa =
    "h-14 w-full min-w-0 appearance-none bg-transparent px-3 pt-4 text-base text-black focus:outline-none sm:h-12 sm:pt-0 md:text-[15px]";
  const rotuloMobile = "pointer-events-none absolute left-3 top-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-black/45 sm:hidden";
  const celula = "relative block min-w-0 border-t border-black/10 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0";
  const erroTrecho = mostrarErro("origem") || mostrarErro("destino");
  const rotulos =
    sentido === "br-jp"
      ? { primeiro: "Saindo de", segundo: "Destino no Japão", volta: "Volta saindo de", brasil: "Saindo de", japao: "Destino no Japão" }
      : { primeiro: "Saindo do Japão", segundo: "Destino no Brasil", volta: "Volta para (Japão)", brasil: "Destino no Brasil", japao: "Saindo do Japão" };
  const celulaBrasil = (
    <label className={celula}>
      <span className={rotuloMobile}>{rotulos.brasil}</span>
      <select value={origem} onChange={(e) => setOrigem(e.target.value)} onBlur={() => tocar("origem")} className={classeSelectCaixa}>
        <option value="">{rotulos.brasil}</option>
        {ORIGENS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nome}
          </option>
        ))}
      </select>
      <IconeSeta />
    </label>
  );
  const celulaJapao = (
    <label className={celula}>
      <span className={rotuloMobile}>{rotulos.japao}</span>
      <select value={destino} onChange={(e) => setDestino(e.target.value)} onBlur={() => tocar("destino")} className={classeSelectCaixa}>
        <option value="">{rotulos.japao}</option>
        {DESTINOS.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nome}
          </option>
        ))}
      </select>
      <IconeSeta />
    </label>
  );
  const erroDatas = mostrarErro("dataIda") || mostrarErro("dataVolta");

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
        <p className={`${display.className} truncate whitespace-nowrap text-base font-medium text-white sm:text-lg md:text-xl`}>Passagens Aéreas</p>
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
            Nossa equipe envia a cotação com as melhores opções de voo pelo WhatsApp — em geral no mesmo dia útil. A
            passagem só é emitida depois da sua aprovação.
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
                  src="/images/produtos/passagens-aereas-header.jpg"
                  alt="Família com malas no terminal do aeroporto, com o avião ao fundo"
                  fill
                  priority
                  sizes="(min-width: 640px) 700px, 100vw"
                  className="object-cover object-[35%_40%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A2540] via-[#0A2540]/10 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540] sm:via-[#0A2540]/0 sm:via-40% sm:to-transparent"
                />
              </div>
              <div className="relative -mt-10 px-5 pb-6 sm:mt-0 sm:flex sm:min-h-[260px] sm:max-w-[38%] sm:flex-col sm:justify-center sm:px-10 sm:py-10 md:min-h-[290px]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/75">Passagens Aéreas</p>
                <h1 className={`${display.className} mt-3 text-[28px] font-medium leading-tight text-white md:text-4xl`}>
                  Brasil ↔ Japão, com suporte do check-in ao desembarque
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
                    Para onde e quando?
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Buscamos as melhores conexões para as suas datas e enviamos a cotação pelo WhatsApp.</p>

                  <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_30px_-22px_rgba(10,37,64,0.35)] sm:p-5">
                    <div className="flex flex-wrap gap-2">
                    <div role="radiogroup" aria-label="Sentido da viagem" className="inline-flex gap-1 rounded-full bg-black/[0.04] p-1">
                      {SENTIDOS.map((x) => (
                        <button
                          key={x.key}
                          type="button"
                          role="radio"
                          aria-checked={sentido === x.key}
                          onClick={() => setSentido(x.key)}
                          className={`h-9 rounded-full px-4 text-sm transition ${
                            sentido === x.key ? "bg-[#0A2540] font-semibold text-white" : "font-medium text-black/60 hover:text-black"
                          }`}
                        >
                          {x.nome}
                        </button>
                      ))}
                    </div>
                    <div role="radiogroup" aria-label="Tipo de passagem" className="inline-flex gap-1 rounded-full bg-black/[0.04] p-1">
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
                    </div>

                    {/* Trecho: origem | destino (| volta saindo de) */}
                    <div className="mt-5">
                      <div
                        className={`mb-1.5 hidden text-xs font-medium text-black/60 sm:grid ${
                          temVolta ? "grid-cols-3" : "grid-cols-2"
                        }`}
                      >
                        <span>{rotulos.primeiro}</span>
                        <span className="pl-3">{rotulos.segundo}</span>
                        {temVolta && <span className="pl-3">{rotulos.volta}</span>}
                      </div>
                      <div
                        className={`grid grid-cols-1 overflow-hidden rounded-xl border bg-white ${temVolta ? "sm:grid-cols-3" : "sm:grid-cols-2"} ${
                          erroTrecho ? "border-red-400" : "border-black/15"
                        } focus-within:border-[#2f80c9] focus-within:ring-1 focus-within:ring-[#2f80c9]`}
                      >
                        {sentido === "br-jp" ? (
                          <>
                            {celulaBrasil}
                            {celulaJapao}
                          </>
                        ) : (
                          <>
                            {celulaJapao}
                            {celulaBrasil}
                          </>
                        )}
                        {temVolta && (
                          <label className={celula}>
                            <span className={rotuloMobile}>{rotulos.volta}</span>
                            <select value={voltaDe} disabled={!destino} onChange={(e) => setDestinoVolta(e.target.value)} className={classeSelectCaixa}>
                              {!destino && <option value="">Escolha o destino</option>}
                              {DESTINOS.map((d) => (
                                <option key={d.id} value={d.id}>{d.nome}</option>
                              ))}
                            </select>
                            <IconeSeta />
                          </label>
                        )}
                      </div>
                      {erroTrecho && <p className="mt-1.5 text-xs text-red-600">{erroTrecho}</p>}
                      {origem === "OUTRA" && (
                        <input
                          type="text"
                          value={origemOutra}
                          onChange={(e) => setOrigemOutra(e.target.value)}
                          onBlur={() => tocar("origem")}
                          placeholder="Qual cidade no Brasil?"
                          className={`${classeInput(false)} mt-2`}
                        />
                      )}
                      {origem === "OUTRA" && (
                        <select
                          value={ufOutra}
                          onChange={(e) => setUfOutra(e.target.value)}
                          onBlur={() => tocar("origem")}
                          className={`${classeInput(false)} mt-2`}
                          aria-label="Estado da cidade no Brasil"
                        >
                          <option value="">Estado (UF)</option>
                          {UFS_BRASIL.map((uf) => (
                            <option key={uf} value={uf}>
                              {uf}
                            </option>
                          ))}
                        </select>
                      )}
                      {origem && adicionalUSD > 0 && (
                        <p className="mt-1.5 text-xs text-black/55">
                          Saídas/chegadas fora de São Paulo incluem o trecho doméstico: +{formatUSD(adicionalUSD)} por passageiro
                          {temVolta ? " (ida e volta)" : " (só ida)"}.
                        </p>
                      )}
                    </div>

                    {/* Datas */}
                    <div className="mt-4">
                      <div className={`mb-1.5 hidden text-xs font-medium text-black/60 sm:grid ${temVolta ? "grid-cols-2" : "grid-cols-1"}`}>
                        <span>Data de ida</span>
                        {temVolta && <span className="pl-3">Data de volta</span>}
                      </div>
                      <div
                        className={`grid overflow-hidden rounded-xl border bg-white ${temVolta ? "grid-cols-2" : "grid-cols-1"} ${
                          erroDatas ? "border-red-400" : "border-black/15"
                        } focus-within:border-[#2f80c9] focus-within:ring-1 focus-within:ring-[#2f80c9]`}
                      >
                        <label className="relative block min-w-0">
                          <span className={rotuloMobile}>Ida</span>
                          <input
                            type="date"
                            min={hojeISO()}
                            value={dataIda}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDataIda(v);
                              if (v && dataVolta && dataVolta < v) setDataVolta(v);
                            }}
                            onBlur={() => tocar("dataIda")}
                            className={classeDataCaixa}
                          />
                        </label>
                        {temVolta && (
                          <label className="relative block min-w-0 border-l border-black/10">
                            <span className={rotuloMobile}>Volta</span>
                            <input
                              type="date"
                              min={dataIda || hojeISO()}
                              value={dataVolta}
                              onChange={(e) => setDataVolta(e.target.value)}
                              onBlur={() => tocar("dataVolta")}
                              className={classeDataCaixa}
                            />
                          </label>
                        )}
                      </div>
                      {erroDatas && <p className="mt-1.5 text-xs text-red-600">{erroDatas}</p>}
                    </div>

                    {/* Flexibilidade — Wilson, 06/out/2026 */}
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-black/10 p-3.5">
                        <p className="text-sm text-black/85">Tem flexibilidade de data?</p>
                        <p className="text-xs text-black/50">Até 3 dias antes ou depois das datas escolhidas.</p>
                        <div className="mt-2.5 flex gap-1.5">
                          {[
                            { v: true, l: "Sim, ±3 dias" },
                            { v: false, l: "Não" },
                          ].map((o) => (
                            <button
                              key={o.l}
                              type="button"
                              aria-pressed={datasFlexiveis === o.v}
                              onClick={() => setDatasFlexiveis(o.v)}
                              className={`h-9 rounded-full border px-3.5 text-xs transition ${
                                datasFlexiveis === o.v ? "border-[#0A2540] bg-[#0A2540] font-semibold text-white" : "border-black/15 text-black/65 hover:border-black/35"
                              }`}
                            >
                              {o.l}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-[#c9a03a]/40 bg-[#c9a03a]/[0.06] p-3.5">
                        <p className="text-sm text-black/85">Pode viajar em outra data sugerida por nós?</p>
                        <p className="text-xs leading-5 text-[#7a5c12]">
                          Com datas sugeridas pela nossa equipe conseguimos <strong className="font-semibold">promoções e preços melhores</strong> do
                          que nas datas fixas.
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {[
                            { v: true, l: "Sim, aceito sugestões" },
                            { v: false, l: "Não, só nas minhas datas" },
                          ].map((o) => (
                            <button
                              key={o.l}
                              type="button"
                              aria-pressed={aceitaDataSugerida === o.v}
                              onClick={() => setAceitaDataSugerida(o.v)}
                              className={`h-9 rounded-full border px-3.5 text-xs transition ${
                                aceitaDataSugerida === o.v ? "border-[#0A2540] bg-[#0A2540] font-semibold text-white" : "border-black/15 bg-white text-black/65 hover:border-black/35"
                              }`}
                            >
                              {o.l}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Passageiros + avançar */}
                    <div className="mt-5 grid gap-4 border-t border-black/[0.08] pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                      <div className="divide-y divide-black/[0.06] sm:max-w-sm">
                        <Contador rotulo="Adultos" ajuda="12 anos ou mais" valor={adultos} min={1} onChange={setAdultos} />
                        <Contador rotulo="Crianças" ajuda="2 a 11 anos" valor={criancas} min={0} onChange={setCriancas} />
                        <Contador rotulo="Bebês" ajuda="Até 2 anos, no colo" valor={bebes} min={0} onChange={setBebes} />
                        {mostrarErro("bebes") && <p className="pt-1.5 text-xs text-red-600">{mostrarErro("bebes")}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={acionarCta}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#1f6fb8] px-8 text-sm font-semibold text-white transition hover:bg-[#2f80c9] sm:mb-2 sm:w-auto"
                      >
                        Ver cabines
                      </button>
                    </div>
                  </div>

                  {/* Destaques / promoções */}
                  {PROMOCOES.length > 0 && (
                    <div className="mt-8">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Destaques e promoções</p>
                      <div className="mt-3 space-y-4">
                        {PROMOCOES.map((p) => (
                          <figure key={p.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSentido(p.aplicar.sentido);
                                setModo(p.aplicar.modo);
                                setOrigem(p.aplicar.origem);
                                setDestino(p.aplicar.destino);
                                setDestinoVolta("");
                                const alvo = stepperRef.current;
                                if (alvo) window.scrollTo({ top: alvo.getBoundingClientRect().top + window.scrollY - 56, behavior: "smooth" });
                              }}
                              className="group block w-full overflow-hidden rounded-2xl border border-black/10 shadow-[0_10px_30px_-22px_rgba(10,37,64,0.35)] transition hover:shadow-[0_14px_34px_-20px_rgba(10,37,64,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2f80c9]"
                              aria-label={`${p.alt} — preencher este trecho na cotação`}
                            >
                              <Image
                                src={p.imagem}
                                alt={p.alt}
                                width={p.largura}
                                height={p.altura}
                                sizes="(min-width: 1024px) 640px, 100vw"
                                className="h-auto w-full transition duration-500 group-hover:scale-[1.015]"
                              />
                            </button>
                            <figcaption className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-black/55">
                              <span>{p.legenda}</span>
                              <span className="font-medium text-[#1f6fb8]">Clique no banner para cotar este trecho ↑</span>
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diferenciais — o conteúdo da antiga /passagens, compacto. */}
                  <div className="mt-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Passagem comprada com a Ajisai</p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      {DIFERENCIAIS_AEREO.map((d) => (
                        <div key={d.titulo} className="flex gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#6ec3d9]/20">
                            <Image src={d.imagem} alt="" width={44} height={44} className="h-8 w-8 object-contain" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-[#0A2540]">{d.titulo}</span>
                            <span className="mt-0.5 block text-xs leading-5 text-black/60">{d.texto}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ── ETAPA 2 — CABINE ── */}
              {etapa === 2 && (
                <section aria-labelledby="titulo-etapa-2">
                  <h2 id="titulo-etapa-2" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Escolha a cabine
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">
                    Valor de referência por passageiro, {temVolta ? "ida e volta" : "ida"}, para{" "}
                    <button type="button" onClick={() => irPara(1)} className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2">
                      {textoPassageiros}
                    </button>
                    . A tarifa final vem na cotação.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {CABINES.map((c) => {
                      const ativo = cabine === c.key;
                      return (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setCabine(c.key)}
                          aria-pressed={ativo}
                          className={`relative flex flex-col rounded-xl border p-4 text-left transition sm:p-5 ${
                            ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.05] ring-1 ring-[#2f80c9]" : "border-black/10 bg-white hover:border-black/25"
                          }`}
                        >
                          <span className="block pr-8 text-[15px] font-medium text-black">{c.nome}</span>
                          <span className="mt-0.5 block text-xs text-black/55">{c.perfil}</span>
                          <span className={`${inter.className} mt-3 block text-sm font-semibold tabular-nums text-[#0A2540]`}>
                            {formatUSD(precoCabineUSD(c.key))}
                            <span className="text-xs font-normal text-black/45"> por passageiro</span>
                          </span>
                          {adicionalUSD > 0 && (
                            <span className="mt-0.5 block text-[11px] text-black/45">inclui {formatUSD(adicionalUSD)} do trecho doméstico</span>
                          )}
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
                    <label className="block min-w-0">
                      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Companhia preferida</span>
                      <span className="relative block">
                        <select
                          value={companhia}
                          onChange={(e) => setCompanhia(e.target.value)}
                          className="h-12 w-full appearance-none rounded-xl border border-black/15 bg-white pl-4 pr-10 text-base text-black focus:border-[#2f80c9] focus:outline-none focus:ring-1 focus:ring-[#2f80c9] md:text-[15px]"
                        >
                          <option value="">Sem preferência</option>
                          {COMPANHIAS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <IconeSeta />
                      </span>
                    </label>
                  </div>
                </section>
              )}

              {/* ── ETAPA 3 — DADOS ── */}
              {etapa === 3 && (
                <section aria-labelledby="titulo-etapa-3">
                  <h2 id="titulo-etapa-3" className={`${display.className} text-2xl font-medium text-[#0A2540]`}>
                    Seus dados
                  </h2>
                  <p className="mt-1.5 text-sm text-black/60">Usamos esses dados para enviar a cotação e, depois da aprovação, emitir as passagens.</p>
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
                    <div className="sm:col-span-2">
                      <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-black/70">Tem visto americano válido?</span>
                      <div role="radiogroup" aria-label="Visto americano" className="mt-1.5 flex flex-wrap gap-1.5">
                        {OPCOES_VISTO_EUA.map((o) => (
                          <button
                            key={o.key}
                            type="button"
                            role="radio"
                            aria-checked={vistoEUA === o.key}
                            onClick={() => {
                              setVistoEUA(o.key);
                              tocar("vistoEUA");
                            }}
                            className={`h-10 rounded-full border px-4 text-sm transition ${
                              vistoEUA === o.key ? "border-[#0A2540] bg-[#0A2540] font-semibold text-white" : "border-black/15 text-black/70 hover:border-black/35"
                            }`}
                          >
                            {o.nome}
                          </button>
                        ))}
                      </div>
                      {mostrarErro("vistoEUA") ? (
                        <p className="mt-1.5 text-xs text-red-600">{mostrarErro("vistoEUA")}</p>
                      ) : (
                        <p className="mt-1.5 text-xs text-black/50">
                          Com visto americano também podemos cotar conexões pelos Estados Unidos — mais opções de rota e tarifa.
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <Campo rotulo="Nomes dos passageiros (opcional)" ajuda="Como no passaporte. Pode enviar depois, antes da emissão.">
                        <textarea
                          value={nomesPassageiros}
                          onChange={(e) => setNomesPassageiros(e.target.value)}
                          rows={3}
                          className="w-full min-w-0 rounded-lg border border-black/15 bg-white px-3.5 py-3 text-sm text-black focus:border-[#2f80c9] focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/20"
                        />
                      </Campo>
                    </div>
                    <div className="sm:col-span-2">
                      <Campo rotulo="Observações (opcional)">
                        <textarea
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          rows={3}
                          placeholder="Programa de milhas, preferência de horário, assento ou refeição especial."
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
                        rotulo: "Voos",
                        voltar: 1 as Etapa,
                        conteudo: (
                          <div className="space-y-3">
                            <LinhaIcone img="/images/icone-decolagem.png">
                              <p className="font-medium text-black">{trechoIda}</p>
                              <p className="text-xs text-black/55">Ida · {formatarDataCurta(dataIda)}</p>
                            </LinhaIcone>
                            {temVolta && (
                              <LinhaIcone img="/images/icone-pousando.png">
                                <p className="font-medium text-black">{trechoVolta}</p>
                                <p className="text-xs text-black/55">Volta · {formatarDataCurta(dataVolta)}</p>
                              </LinhaIcone>
                            )}
                            <LinhaIcone icone="pessoas">
                              <p>{textoPassageiros}</p>
                            </LinhaIcone>
                            {(datasFlexiveis || aceitaDataSugerida !== null) && (
                              <div className="flex flex-wrap gap-1.5 pl-11">
                                {datasFlexiveis && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1f6fb8]/[0.08] px-2.5 py-1 text-xs text-[#1f6fb8]">
                                    <Icone d={ICONES.calendario} className="h-3.5 w-3.5" /> Datas flexíveis ±3 dias
                                  </span>
                                )}
                                {aceitaDataSugerida === true && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c9a03a]/[0.12] px-2.5 py-1 text-xs text-[#7a5c12]">
                                    <Icone d={ICONES.etiqueta} className="h-3.5 w-3.5" /> Aceita datas sugeridas (promoções)
                                  </span>
                                )}
                                {aceitaDataSugerida === false && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.05] px-2.5 py-1 text-xs text-black/60">
                                    <Icone d={ICONES.calendario} className="h-3.5 w-3.5" /> Só nas datas escolhidas
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ),
                      },
                      {
                        rotulo: "Cabine",
                        voltar: 2 as Etapa,
                        conteudo: (
                          <div className="space-y-3">
                            <LinhaIcone icone="assento">
                              <p className="font-medium text-black">{nomeCabine}</p>
                              <p className="text-xs text-black/55">
                                {formatUSD(porPassageiroUSD)} por passageiro (referência)
                                {adicionalUSD > 0 && ` · inclui ${formatUSD(adicionalUSD)} do trecho doméstico`}
                              </p>
                            </LinhaIcone>
                            <LinhaIcone icone="aviao">
                              <p>{companhia || "Sem preferência de companhia"}</p>
                            </LinhaIcone>
                          </div>
                        ),
                      },
                      {
                        rotulo: "Seus dados",
                        voltar: 3 as Etapa,
                        conteudo: (
                          <div className="space-y-3">
                            <LinhaIcone icone="usuario">
                              <p className="font-medium text-black">{nome}</p>
                            </LinhaIcone>
                            <LinhaIcone icone="telefone">
                              <p>{whatsapp}</p>
                            </LinhaIcone>
                            <LinhaIcone icone="email">
                              <p className="break-all">{email}</p>
                            </LinhaIcone>
                            <LinhaIcone icone="passaporte">
                              <p>Visto americano: {OPCOES_VISTO_EUA.find((o) => o.key === vistoEUA)?.nome ?? "—"}</p>
                            </LinhaIcone>
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
                        <p className="mt-0.5 text-xs text-black/50">Valor de referência. A tarifa final vem na cotação.</p>
                      </dd>
                    </div>
                  </dl>
                  {avisos.length > 0 && <BlocoAvisos avisos={avisos} className="mt-5" />}

                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">
                    Quando pretende concluir a compra?
                  </p>
                  <div role="radiogroup" aria-label="Quando pretende concluir a compra" className="mt-2 flex flex-wrap gap-1.5">
                    {PRAZOS_COMPRA.map((p) => (
                      <button
                        key={p}
                        type="button"
                        role="radio"
                        aria-checked={prazoCompra === p}
                        onClick={() => setPrazoCompra(p)}
                        className={`h-10 rounded-full border px-4 text-sm transition ${
                          prazoCompra === p ? "border-[#0A2540] bg-[#0A2540] font-semibold text-white" : "border-black/15 text-black/70 hover:border-black/35"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  {tentouEnviar && !prazoCompra && <p className="mt-1.5 text-xs text-red-600">Escolha uma opção para solicitar a cotação.</p>}

                  {/* Documentos — Wilson, 06/out/2026: Guia de Diferenciais e
                      Termos (PDF) + política de cancelamento involuntário. */}
                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Documentos da sua passagem</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        href: "/docs/ajisai-diferenciais-passagem-aerea-2026.pdf",
                        capa: "/images/ajisai-diferenciais-passagem-capa.webp",
                        titulo: "Nossos serviços e diferenciais",
                        texto: "Concierge em Guarulhos, protocolo pré-embarque, central no WhatsApp e mais — Guia 2026.",
                      },
                      {
                        href: TERMOS_PDF_PASSAGENS,
                        capa: "/images/ajisai-termos-passagem-capa.webp",
                        titulo: "Termos e Condições (PDF)",
                        texto: "Versão completa para baixar e guardar — edição v1.00, fev/2026.",
                      },
                    ].map((d) => (
                      <a
                        key={d.href}
                        href={d.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex gap-3 rounded-xl border border-black/10 bg-white p-3 transition hover:border-[#1f6fb8]/40 hover:shadow-sm"
                      >
                        <Image src={d.capa} alt="" width={64} height={90} className="h-[90px] w-16 shrink-0 rounded-md border border-black/10 object-cover" />
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 text-sm font-medium text-[#0A2540]">
                            <Icone d={ICONES.documento} className="h-4 w-4 text-[#1f6fb8]" />
                            {d.titulo}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-black/55">{d.texto}</span>
                          <span className="mt-1.5 block text-xs font-medium text-[#1f6fb8] group-hover:underline">Abrir PDF ↗</span>
                        </span>
                      </a>
                    ))}
                  </div>

                  <div className="mt-6 rounded-2xl border border-black/10 bg-[#fbf7fa] p-4">
                    <p className="text-sm font-medium text-[#0A2540]">Se a companhia aérea cancelar o voo</p>
                    <p className="mt-1 text-xs leading-5 text-black/60">
                      Como a Ajisai atua em cancelamentos involuntários, inclusive no acordo com Emirates e Qatar Airways.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {[
                        { src: "/images/passagens-cancelamento-emirates-qatar.webp", alt: "Cancelamentos são ruins, e nós sabemos disso — acordo Ajisai com Emirates e Qatar Airways para remanejamento em rota alternativa" },
                        { src: "/images/passagens-cancelamento-o-que-e-feito.webp", alt: "Após o cancelamento pela companhia aérea, o que é feito — a Ajisai verifica o próximo voo disponível via Europa em companhias parceiras" },
                      ].map((im) => (
                        <a key={im.src} href={im.src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-black/10 transition hover:shadow-md">
                          <Image src={im.src} alt={im.alt} width={470} height={670} className="h-auto w-full" />
                        </a>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-black/45">Toque na imagem para ampliar.</p>
                  </div>

                  <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-black/70">Termos e Condições</p>
                  <div
                    id="termos-passagens"
                    ref={termosBoxRef}
                    tabIndex={0}
                    aria-label="Termos e Condições das passagens aéreas"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) setTermosRolados(true);
                    }}
                    className="mt-2 max-h-96 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] leading-6 text-black/70 focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/30"
                  >
                    <TextoTermosPassagens />
                  </div>

                  <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={termosAceitos}
                      disabled={!termosRolados}
                      onChange={(e) => setTermosAceitos(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9] disabled:cursor-not-allowed disabled:opacity-40"
                    />
                    <span className="text-sm text-black/85">
                      Li e aceito os Termos e Condições da passagem aérea internacional e o Guia de Serviços e Diferenciais da Ajisai.
                    </span>
                  </label>
                  {!termosRolados && <p className="ml-8 text-xs text-black/55">Role o texto acima até o fim para habilitar o aceite.</p>}
                  {tentouEnviar && termosRolados && !termosAceitos && (
                    <p className="ml-8 text-xs text-red-600">Aceite os Termos e Condições para solicitar a cotação.</p>
                  )}
                  <p className="ml-8 mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <a href={TERMOS_PDF_PASSAGENS} target="_blank" rel="noopener noreferrer" className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/40 underline-offset-2">
                      Termos em PDF ↗
                    </a>
                    <a href="/privacy" target="_blank" rel="noreferrer" className="font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/40 underline-offset-2">
                      Política de Privacidade ↗
                    </a>
                  </p>
                  <p className="mt-4 text-xs leading-5 text-black/50">
                    Nenhum valor é cobrado agora. Nossa equipe envia a cotação e combina a forma de pagamento com você pelo
                    WhatsApp.
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
                  {cabine ? `${nomeCabine} · ` : ""}
                  {totalPassageiros} {totalPassageiros === 1 ? "passageiro" : "passageiros"}
                  {dataIda && !errosViagem.dataIda && ` · ${formatarDiaMes(dataIda)}`}
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
    </main>
  );
}
