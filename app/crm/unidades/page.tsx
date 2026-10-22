import type { Metadata } from "next";
import { exigirAdmin } from "@/lib/crm/acesso";
import { urlUnidade } from "@/lib/crm/unidades";
import { PortalShell, displayPortal } from "../PortalShell";

// alpinea.io/crm — escolha do CRM (Wilson, 21/out/2026): "ao acessar o
// domínio /crm, precisa ter uma opção pra entrar no CRM da agência ou da
// parte de empregos, ambos são CRMs".

export const metadata: Metadata = {
  title: "CRM — Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

const UNIDADES = [
  {
    unidade: "agencia" as const,
    titulo: "Agência de viagens",
    descricao: "Clientes, pipeline de vendas, fornecedores e leads de parceiros.",
    aqui: "/crm?ficar=1",
    icone: "/images/icone-crm-agencia.png",
  },
  {
    unidade: "empregos" as const,
    titulo: "Empregos",
    descricao: "Candidatos, agenda de entrevistas, vagas e empreiteiras.",
    aqui: "/crm/empregos",
    icone: "/images/icone-crm-empregos.png",
  },
];

export default async function EscolherCrmPage() {
  const acesso = await exigirAdmin();
  return (
    <PortalShell titulo="CRM" empresa="Alpinea" usuario={acesso.email}>
      <div className="mx-auto max-w-3xl">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-black/40">Unidades de negócio</p>
        <h1 className={`${displayPortal.className} text-3xl font-medium md:text-4xl`}>Qual CRM você quer abrir?</h1>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {UNIDADES.map((u) => {
            const url = urlUnidade(u.unidade);
            return (
              <div key={u.unidade} className="flex flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)]">
                {/* Ícone preto em fundo branco, sem círculo/selo (regra de ícones do CRM). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.icone} alt="" aria-hidden="true" className="mb-4 h-14 w-14" />
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#1C3A5E]/70">CRM</p>
                <h2 className={`${displayPortal.className} mt-1 text-2xl font-medium`}>{u.titulo}</h2>
                <p className="mt-2 flex-1 text-sm text-black/55">{u.descricao}</p>
                <a
                  href={url}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-[#1C3A5E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#254a73]"
                >
                  Entrar
                </a>
                <p className="mt-2 text-center text-[11px] text-black/40">
                  {url.replace("https://", "")} ·{" "}
                  <a href={u.aqui} className="underline hover:text-black">
                    abrir neste domínio
                  </a>
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-6 text-xs text-black/45">
          Cada CRM tem o próprio endereço. No primeiro acesso a cada um, faça login com o mesmo e-mail e senha.
        </p>
      </div>
    </PortalShell>
  );
}
