import type { Metadata } from "next";
import { ehEquipe, obterAcesso } from "@/lib/crm/acesso";
import { redirect } from "next/navigation";
import { urlUnidade } from "@/lib/crm/unidades";
import { PortalShell } from "../PortalShell";
import { SinoUnidade } from "../(shell)/components/SinoUnidade";

// alpinea.io/crm — escolha do CRM (Wilson, 21/out/2026; + Seguro Viagem 26/out): "ao acessar o
// domínio /crm, precisa ter uma opção pra entrar no CRM da agência ou da
// parte de empregos, ambos são CRMs".

export const metadata: Metadata = {
  title: "CRM — Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

// Redesenho (Wilson, 22/out/2026): mesmo padrão dos cards da ficha do
// cliente — fundo suave, borda superior colorida, Inter.
const UNIDADES = [
  {
    unidade: "agencia" as const,
    titulo: "Agência de viagens",
    descricao: "Gerencie clientes, propostas, viagens e fornecedores.",
    botao: "Acessar viagens",
    // Abre a unidade aqui mesmo em alpinea.io/crm (sem trocar de domínio).
    // "ficar=1" impede o redirecionamento automático para esta página.
    aqui: "/crm?ficar=1",
    icone: "/images/icone-crm-agencia.png",
    fundo: "#F2F6FC",
    cor: "#24476B",
    corHover: "#2C5480",
    tonal: "#E1EAF5",
  },
  {
    unidade: "empregos" as const,
    titulo: "Empregos",
    descricao: "Gerencie candidatos, vagas, entrevistas e empreiteiras.",
    botao: "Acessar empregos",
    aqui: "/crm/empregos",
    icone: "/images/icone-crm-empregos.png",
    fundo: "#F0F7F5",
    cor: "#28665D",
    corHover: "#307A6F",
    tonal: "#DCEEE9",
  },
  {
    unidade: "seguro" as const,
    titulo: "Seguro Viagem",
    descricao: "Acompanhe pedidos, pagamentos e o envio das apólices.",
    botao: "Acessar seguro viagem",
    aqui: "/crm/seguro",
    icone: null,
    fundo: "#F6F3F9",
    cor: "#75608B",
    corHover: "#63507A",
    tonal: "#E9E2F1",
  },
  {
    // Quarto CRM (Wilson, 29/out/2026).
    unidade: "documentacao" as const,
    titulo: "Documentação",
    descricao: "Acompanhe vistos, certificados de elegibilidade e exportação de pets.",
    botao: "Acessar documentação",
    aqui: "/crm/documentacao",
    icone: null,
    fundo: "#F8F3EF",
    cor: "#8A5A3C",
    corHover: "#744A30",
    tonal: "#EFE3DA",
  },
];

export default async function EscolherCrmPage() {
  // Só a equipe (admin) chega aqui; parceiros têm portal próprio.
  // Admin vê os 4 CRMs; consultor só os liberados para ele (migração 030).
  const acesso = await obterAcesso();
  if (!acesso) redirect("/crm/login");
  if (!ehEquipe(acesso)) redirect("/crm/sem-acesso");
  const visiveis = acesso.papel === "consultor" ? UNIDADES.filter((u) => acesso.permissoes?.crms.includes(u.unidade)) : UNIDADES;
  return (
    <PortalShell titulo="CRM" empresa="Alpinea" usuario={acesso.email}>
      <div className="mx-auto max-w-[960px]">
        <h1 className="text-[#20252B]">Escolha sua área de trabalho</h1>
        <p className="mt-1 text-[15px] text-[#626B75]">Acesse a unidade que deseja gerenciar.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {visiveis.map((u) => (
            <section
              key={u.unidade}
              className="relative flex flex-col rounded-2xl border border-t-[3px] has-[[role=dialog]]:z-50 border-black/[0.06] p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_22px_40px_-22px_rgba(0,0,0,0.25)] md:p-8"
              style={{ backgroundColor: u.fundo, borderTopColor: u.cor }}
            >
              {/* Sino com as notificações recentes de cada CRM (Wilson, 29/out/2026). */}
              {acesso.papel === "admin" && (
                <div className="absolute right-5 top-5 z-10 md:right-6 md:top-6">
                  <SinoUnidade unidade={u.unidade} />
                </div>
              )}
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: u.tonal }}>
                {u.icone ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.icone} alt="" aria-hidden="true" className="h-12 w-12" />
                ) : u.unidade === "documentacao" ? (
                  // Documento com selo, no mesmo estilo do escudo do seguro.
                  <svg viewBox="0 0 48 48" className="h-11 w-11" fill="none" aria-hidden="true">
                    <path d="M13 6h15l9 9v25a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill="#fff" stroke={u.cor} strokeWidth={3} strokeLinejoin="round" />
                    <path d="M28 6v9h9M17 22h14M17 28h14M17 34h8" stroke={u.cor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  // Escudo (seguro) desenhado no próprio estilo dos outros ícones.
                  <svg viewBox="0 0 48 48" className="h-11 w-11" fill="none" aria-hidden="true">
                    <path d="M24 5 9 10.5v11.2c0 9.6 6.4 17.7 15 20.3 8.6-2.6 15-10.7 15-20.3V10.5L24 5Z" fill="#fff" stroke={u.cor} strokeWidth={3} strokeLinejoin="round" />
                    <path d="m17.5 24 4.5 4.5 8.5-9" stroke={u.cor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {/* 22 px por estilo inline: a regra global de h2 (18 px) não vale aqui. */}
              <h2 className="mt-5 font-semibold text-[#20252B]" style={{ fontSize: 22 }}>
                {u.titulo}
              </h2>
              <p className="mt-2 flex-1 text-[15px] leading-[1.5] text-[#626B75]">{u.descricao}</p>
              <a
                href={urlUnidade(u.unidade)}
                className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cor)]/40 focus-visible:ring-offset-2"
                style={{ backgroundColor: u.cor, ["--cor" as string]: u.cor, ["--hover" as string]: u.corHover }}
              >
                {u.botao}
              </a>
            </section>
          ))}
        </div>

        <p className="mt-6 text-[13px] text-[#626B75]">
          Use o mesmo e-mail e senha em todas as unidades. No primeiro acesso, pode ser necessário entrar novamente.
        </p>

        {/* Alternativa: abrir a unidade sem sair de alpinea.io (não pede novo login). */}
        <details className="mt-3 text-[13px] text-[#626B75]">
          <summary className="cursor-pointer select-none font-medium text-[#24476B] hover:underline">Continuar neste endereço</summary>
          <p className="mt-2 max-w-xl">
            Abre a unidade aqui mesmo, em alpinea.io, sem trocar de endereço — útil se você não quiser entrar de novo agora.
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            {visiveis.map((u) => (
              <li key={u.unidade}>
                <a href={u.aqui} className="font-medium text-[#20252B] underline underline-offset-2 hover:text-[#24476B]">
                  {u.titulo} neste endereço
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </PortalShell>
  );
}
