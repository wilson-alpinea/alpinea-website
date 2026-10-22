import type { Metadata } from "next";
import { exigirAdmin } from "@/lib/crm/acesso";
import { urlUnidade } from "@/lib/crm/unidades";
import { PortalShell } from "../PortalShell";

// alpinea.io/crm — escolha do CRM (Wilson, 21/out/2026): "ao acessar o
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
];

export default async function EscolherCrmPage() {
  // Só a equipe (admin) chega aqui; parceiros têm portal próprio.
  const acesso = await exigirAdmin();
  return (
    <PortalShell titulo="CRM" empresa="Alpinea" usuario={acesso.email}>
      <div className="mx-auto max-w-[960px]">
        <h1 className="text-[#20252B]">Escolha sua área de trabalho</h1>
        <p className="mt-1 text-[15px] text-[#626B75]">Acesse a unidade que deseja gerenciar.</p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {UNIDADES.map((u) => (
            <section
              key={u.unidade}
              className="flex flex-col rounded-2xl border border-t-[3px] border-black/[0.06] p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.05),0_22px_40px_-22px_rgba(0,0,0,0.25)] md:p-8"
              style={{ backgroundColor: u.fundo, borderTopColor: u.cor }}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: u.tonal }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.icone} alt="" aria-hidden="true" className="h-12 w-12" />
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
          Use o mesmo e-mail e senha nas duas unidades. No primeiro acesso, pode ser necessário entrar novamente.
        </p>

        {/* Alternativa: abrir a unidade sem sair de alpinea.io (não pede novo login). */}
        <details className="mt-3 text-[13px] text-[#626B75]">
          <summary className="cursor-pointer select-none font-medium text-[#24476B] hover:underline">Continuar neste endereço</summary>
          <p className="mt-2 max-w-xl">
            Abre a unidade aqui mesmo, em alpinea.io, sem trocar de endereço — útil se você não quiser entrar de novo agora.
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
            {UNIDADES.map((u) => (
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
