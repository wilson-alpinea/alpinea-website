"use client";

// Peças compartilhadas pelas duas páginas de transporte em /produtos —
// Transporte Privado (motorista à disposição: dentro da cidade, entre
// cidades, passeio 10h) e Transfer Aeroporto (aeroporto ↔ hotel), que
// viraram produtos separados a pedido do Wilson em 30/set/2026 ("motorista
// particular e transfer hotel-aeroporto/aeroporto-hotel tem que ser
// serviços diferentes"). Mesmos veículos, preços (motoristaPrivadoRotas.ts),
// visual, termos e helpers de data/validação.

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Inter } from "next/font/google";
import {
  VEICULOS_MOTORISTA,
  ROTAS_MOTORISTA,
  POLITICA_CANCELAMENTO_MOTORISTA,
  type CategoriaRotaMotorista,
  type VeiculoMotoristaId,
} from "../../lib/motoristaPrivadoRotas";
import { display } from "../../produtos/page";

export const inter = Inter({ subsets: ["latin"], weight: ["500", "600", "700"] });

// Nome curto + diferenciação curta por veículo (só nesta página — os
// nomes completos de motoristaPrivadoRotas.ts continuam valendo no
// resumo do CRM e na Calculadora Reversa). Pedido do Wilson: "Alphard —
// conforto premium · Hiace 10 — grupos pequenos · Hiace 14 — grupos
// médios · Coaster 18/21/29 — grupos grandes".
export const VEICULO_CURTO: Record<VeiculoMotoristaId, { nome: string; perfil: string }> = {
  alphard8: { nome: "Toyota Alphard", perfil: "Conforto premium" },
  hiace10: { nome: "Toyota Hiace 10", perfil: "Grupos pequenos com bagagem" },
  hiace14: { nome: "Toyota Hiace 14", perfil: "Grupos médios" },
  coaster18: { nome: "Toyota Coaster 18", perfil: "Grupos grandes" },
  coaster21: { nome: "Toyota Coaster 21", perfil: "Grupos grandes" },
  coaster29: { nome: "Toyota Coaster 29", perfil: "Grupos grandes" },
};

// Menor preço de trajeto por veículo — mostrado como "a partir de" no
// passo 1 e no resumo enquanto nenhuma rota foi escolhida.
export const PRECO_MINIMO_VEICULO = Object.fromEntries(
  VEICULOS_MOTORISTA.map((v) => [v.id, Math.min(...ROTAS_MOTORISTA.map((r) => r.precoUSD[v.id]))]),
) as Record<VeiculoMotoristaId, number>;

// Passo 2 em formato "origem → destino": cada par aponta pra uma rota do
// catálogo (motoristaPrivadoRotas.ts). Origem = destino significa
// deslocamento dentro da cidade. Kyoto → Osaka usa a mesma rota de
// "Dentro de Kyoto" (o fornecedor cota igual).
export type LocalId = "narita" | "haneda" | "kix" | "tokyo" | "osaka" | "kyoto";
export const LOCAIS: { id: LocalId; nome: string; aeroporto: boolean }[] = [
  { id: "narita", nome: "Aeroporto de Narita", aeroporto: true },
  { id: "haneda", nome: "Aeroporto de Haneda", aeroporto: true },
  { id: "kix", nome: "Aeroporto de Kansai", aeroporto: true },
  { id: "tokyo", nome: "Tóquio", aeroporto: false },
  { id: "osaka", nome: "Osaka", aeroporto: false },
  { id: "kyoto", nome: "Kyoto", aeroporto: false },
];
export const TRECHOS: { de: LocalId; para: LocalId; rotaId: string }[] = [
  { de: "narita", para: "tokyo", rotaId: "narita-tokyo" },
  { de: "haneda", para: "tokyo", rotaId: "haneda-tokyo" },
  { de: "kix", para: "osaka", rotaId: "kansai-osaka" },
  { de: "kix", para: "kyoto", rotaId: "kansai-kyoto" },
  { de: "tokyo", para: "narita", rotaId: "tokyo-narita" },
  { de: "tokyo", para: "haneda", rotaId: "tokyo-haneda" },
  { de: "tokyo", para: "tokyo", rotaId: "dentro-tokyo" },
  { de: "osaka", para: "kix", rotaId: "osaka-kansai" },
  { de: "osaka", para: "osaka", rotaId: "dentro-osaka" },
  { de: "kyoto", para: "kix", rotaId: "kyoto-kansai" },
  { de: "kyoto", para: "kyoto", rotaId: "dentro-kyoto-ou-kyoto-osaka" },
  { de: "kyoto", para: "osaka", rotaId: "dentro-kyoto-ou-kyoto-osaka" },
];
export const nomeLocal = (id: LocalId) => LOCAIS.find((l) => l.id === id)?.nome ?? id;
export const ehAeroporto = (id: LocalId) => LOCAIS.find((l) => l.id === id)?.aeroporto ?? false;
// Transfer = sempre com um aeroporto numa das pontas. Cidade ↔ cidade é
// outra categoria (Transporte interestadual) — pedido do Wilson, 30/set/2026.
export const TRECHOS_TRANSFER = TRECHOS.filter((t) => ehAeroporto(t.de) || ehAeroporto(t.para));
export const TRECHOS_INTERESTADUAL = TRECHOS.filter((t) => !ehAeroporto(t.de) && !ehAeroporto(t.para));
// Ícone pequeno de cada item no resumo (mesmas artes das abas e opcionais).
export const ICONE_CATEGORIA_ROTA: Record<CategoriaRotaMotorista, string> = {
  "transfer-aeroporto": "/images/icone-transfer-aeroporto.png",
  "dentro-cidade": "/images/icone-interestadual.png",
  "tour-dia-inteiro": "/images/icone-passeio-10h.png",
};
export function IconeResumo({ src }: { src?: string }) {
  if (!src) return <span aria-hidden className="h-6 w-6 shrink-0" />;
  return <Image src={src} alt="" width={24} height={24} className="h-6 w-6 shrink-0 object-contain" />;
}

export const CLASSE_SELECT =
  "h-12 w-full appearance-none rounded-xl border border-black/15 bg-white pl-4 pr-10 text-base text-black transition focus:border-[#2f80c9] focus:outline-none focus:ring-1 focus:ring-[#2f80c9] disabled:cursor-not-allowed disabled:bg-black/[0.03] disabled:text-black/35 md:text-[15px]";



export const MAX_PASSAGEIROS = Math.max(...VEICULOS_MOTORISTA.map((v) => v.assentos));
export const MAX_DIAS_VIAGEM = 45;


// Sentido de cada transfer de aeroporto: chegada (aeroporto → cidade) ou
// saída (cidade → aeroporto).
export const SENTIDO_TRANSFER: Record<string, "chegada" | "saida"> = Object.fromEntries(
  TRECHOS_TRANSFER.map((t) => [t.rotaId, ehAeroporto(t.de) ? "chegada" : "saida"]),
);

export function isoLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function diasEntre(inicio: string, fim: string): string[] {
  const dias: string[] = [];
  const d = new Date(`${inicio}T00:00:00`);
  const limite = new Date(`${fim}T00:00:00`);
  if (Number.isNaN(d.getTime()) || Number.isNaN(limite.getTime())) return dias;
  while (d <= limite && dias.length <= MAX_DIAS_VIAGEM + 1) {
    dias.push(isoLocal(d));
    d.setDate(d.getDate() + 1);
  }
  return dias;
}

export const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
// "qui 23/out"
export function formatarDataCurta(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${DIAS_SEMANA[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${MESES[d.getMonth()]}`;
}
// "23/out"
export function formatarDiaMes(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${MESES[d.getMonth()]}`;
}

export function listarNatural(itens: string[]): string {
  if (itens.length <= 1) return itens.join("");
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}


// Máscara de WhatsApp: formato brasileiro por padrão; se começar com "+",
// aceita número internacional sem forçar o formato.
export function mascararWhatsapp(valor: string): string {
  const t = valor.trimStart();
  if (t.startsWith("+")) return "+" + t.slice(1).replace(/[^\d ]/g, "").slice(0, 20);
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function IconeCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

// Modal simples via portal (evita o bug de `fixed` do Safari iOS dentro de
// containers com transform/backdrop — ver learnings do projeto).
export function Modal({ aberto, titulo, onFechar, children }: { aberto: boolean; titulo: string; onFechar: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", tecla);
    };
  }, [aberto, onFechar]);
  if (!aberto || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 md:items-center md:p-6" onClick={onFechar} role="dialog" aria-modal="true" aria-label={titulo}>
      <div
        className="flex max-h-[88svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
          <p className={`${display.className} text-lg font-medium text-black`}>{titulo}</p>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none text-black/60 transition hover:bg-black/5 hover:text-black"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 text-sm leading-6 text-black/75">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function Campo({
  rotulo,
  erro,
  ajuda,
  children,
}: {
  rotulo: string;
  erro?: string | null;
  ajuda?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/70">{rotulo}</span>
      {children}
      {erro ? (
        <span className="text-xs text-red-600">{erro}</span>
      ) : ajuda ? (
        <span className="text-xs text-black/50">{ajuda}</span>
      ) : null}
    </label>
  );
}

export function classeInput(temErro: boolean) {
  return `h-12 w-full min-w-0 rounded-lg border bg-white px-3.5 text-sm text-black transition focus:outline-none focus:ring-2 focus:ring-[#2f80c9]/20 ${
    temErro ? "border-red-400 focus:border-red-500" : "border-black/15 focus:border-[#2f80c9]"
  }`;
}

// Avisos da seleção (dias sem veículo, transfer sem o par etc.) — só
// informam, sem bloquear nem oferecer ação (decisão do Wilson, 30/set/2026).
export function BlocoAvisos({ avisos, className = "" }: { avisos: string[]; className?: string }) {
  return (
    <div className={`rounded-xl border border-amber-300/70 bg-amber-50 px-3.5 py-3 ${className}`} role="status">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">Atenção</p>
      <ul className="mt-1.5 space-y-1.5 text-xs leading-5 text-amber-900">
        {avisos.map((a) => (
          <li key={a} className="flex gap-2">
            <span aria-hidden="true" className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-amber-600" />
            <span>{a}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function IconeSeta() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Termos e Condições — numa caixa na etapa de revisão das duas páginas
// (Wilson, 30/set/2026: "termos e condições devem estar numa caixa na
// pagina, nao para clicar e abrir").
export function TextoTermosTransporte() {
  return (
    <>
    <p className="font-medium text-black/80">Fornecimento do serviço</p>
    <p className="mt-1">
      O motorista e o veículo são fornecidos por um parceiro especializado no Japão
      — a Alpinea atua como intermediária entre o cliente e esse fornecedor. O veículo
      é exclusivo do grupo contratante, sem compartilhamento com outros passageiros.
    </p>
    <p className="mt-3 font-medium text-black/80">O que está incluído</p>
    <p className="mt-1">
      Os valores já incluem imposto, estacionamento, pedágio (ETC) e combustível. Cada
      rota tem um tempo livre incluso (normalmente 90 min no trecho de chegada/pickup,
      30 min no trecho de partida, ou as 10 horas inteiras nos tours de dia inteiro) —
      ver detalhe em “Ver regras e adicionais”.
    </p>
    <p className="mt-3 font-medium text-black/80">Hora extra</p>
    <p className="mt-1">
      Tempo de uso além do período já incluso na rota escolhida é cobrado em blocos de
      30 minutos (sempre arredondado pra cima), com tarifa específica por veículo e
      rota, cobrado à parte.
    </p>
    <p className="mt-3 font-medium text-black/80">Adicionais opcionais</p>
    <p className="mt-1">
      Recepção com placa de identificação (Meet &amp; Greet) e cadeirinha infantil
      estão disponíveis mediante consulta, com valor adicional — não estão incluídos
      no preço-base da rota.
    </p>
    <p className="mt-3 font-medium text-black/80">Motorista bilíngue</p>
    <p className="mt-1">
      Motorista com português ou inglês está disponível mediante consulta e valor
      adicional — disponibilidade limitada, recomendamos solicitar com grande
      antecedência (idealmente 70 dias antes da viagem). Sem essa solicitação expressa,
      o motorista fornecido fala japonês.
    </p>
    <p className="mt-3 font-medium text-black/80">Não incluído</p>
    <p className="mt-1">
      Trânsito inter-municipal de longa distância entre regiões (ex.: Tóquio↔Kansai
      por estrada) não está coberto pelas rotas/tours listados acima.
    </p>
    <p className="mt-3 font-medium text-black/80">Cancelamento</p>
    <p className="mt-1">{POLITICA_CANCELAMENTO_MOTORISTA}</p>
    <p className="mt-3 font-medium text-black/80">Pagamento e responsabilidade dos dados</p>
    <p className="mt-1">
      O valor final em reais é convertido pela cotação de câmbio do dia da confirmação.
      A exatidão dos dados informados (nome, telefone/WhatsApp, horários de voo e locais
      de embarque) é de responsabilidade do cliente — divergências podem prejudicar o
      pickup e não são de responsabilidade da Alpinea nem do fornecedor. Isso não
      confirma pagamento — nossa equipe entra em contato pelo WhatsApp pra fechar a
      logística antes de qualquer cobrança.
    </p>
    </>
  );
}
