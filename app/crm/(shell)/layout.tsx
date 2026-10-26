import Link from "next/link";
import { NavCrm } from "./NavCrm";
import { headers } from "next/headers";
import { exigirAdmin } from "@/lib/crm/acesso";
import { INICIO_UNIDADE, UNIDADES_CRM, UNIDADE_COR, UNIDADE_LABEL, isUnidadeCrm, urlUnidade } from "@/lib/crm/unidades";
import { logout } from "../actions";

// Dois CRMs (Wilson, 21/out/2026): agência de viagens e empregos, cada um
// com o próprio menu. A unidade vem do proxy.ts (header x-crm-unidade).
const NAV_AGENCIA = [
  { href: "/crm", label: "Dashboard" },
  { href: "/crm/clientes", label: "Clientes" },
  { href: "/crm/fornecedores", label: "Fornecedores" },
  { href: "/crm/pipeline", label: "Pipeline" },
  { href: "/crm/acessos", label: "Acessos" },
];
const NAV_EMPREGOS = [
  { href: "/crm/empregos", label: "Candidatos" },
  { href: "/crm/empregos/agenda", label: "Agenda" },
  { href: "/crm/empregos/vagas", label: "Vagas" },
  { href: "/crm/acessos", label: "Acessos" },
];
// CRM de Seguro Viagem (Wilson, 26/out/2026).
const NAV_SEGURO = [
  { href: "/crm/seguro", label: "Pedidos" },
  { href: "/crm/acessos", label: "Acessos" },
];
const NAV_UNIDADE = { agencia: NAV_AGENCIA, empregos: NAV_EMPREGOS, seguro: NAV_SEGURO };

export default async function CrmShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Só a equipe (admin) entra nas telas do CRM; parceiros têm portal próprio.
  const acesso = await exigirAdmin();
  const nomeExibicao = acesso.nome;
  const h = (await headers()).get("x-crm-unidade");
  const unidade = isUnidadeCrm(h) ? h : "agencia";
  const NAV = NAV_UNIDADE[unidade];
  const rotuloUnidade = UNIDADE_LABEL[unidade];

  return (
    <div data-unidade={unidade} className="crm-pagina min-h-screen bg-[#FAF9F6] text-[#20252B]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 md:px-10">
          <div className="flex min-w-0 items-center gap-6 lg:gap-8">
            <Link href={INICIO_UNIDADE[unidade]} className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ajisai-group-white-crop.png"
                alt="Alpinea — Empresa do Grupo Ajisai"
                className="h-12 w-auto sm:h-16"
              />
              <span className="hidden h-9 w-px bg-white/15 sm:block" />
              {/* Unidade embaixo de "CRM" para não invadir o menu (Wilson, 21/out/2026). */}
              <span className="hidden flex-col leading-none sm:flex">
                <span className="text-[28px] font-semibold leading-[1.1] text-white sm:text-[32px]">CRM</span>
                <span className="mt-1 text-[13px] text-white/45">{rotuloUnidade}</span>
              </span>
            </Link>
            <nav aria-label="Navegação do CRM" className="hidden items-center gap-5 whitespace-nowrap text-sm font-medium md:flex lg:gap-6">
              <NavCrm itens={NAV} variante="desktop" />
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            {/* Trocar para o outro CRM (Wilson, 21/out/2026). Mais visível, na cor
                da unidade de destino e sem a seta (Wilson, 22/out/2026). */}
            {/* Com três CRMs, um botão por destino, cada um na cor da unidade de
                destino (estilo inline: o tema da unidade atual não o remapeia). */}
            {UNIDADES_CRM.filter((u) => u !== unidade).map((u) => (
              <a
                key={u}
                href={urlUnidade(u)}
                className="hidden items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium text-white shadow-sm transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:inline-flex"
                style={{ backgroundColor: UNIDADE_COR[u] }}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 7h11l-3-3M17 17H6l3 3" />
                </svg>
                CRM {u === "seguro" ? "Seguro" : UNIDADE_LABEL[u]}
              </a>
            ))}
            <span className="hidden text-[13px] text-white/35 xl:inline">
              {nomeExibicao}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-white/50 transition hover:border-white/40 hover:text-white"
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        <nav aria-label="Navegação do CRM" className="flex items-center gap-5 overflow-x-auto border-t border-white/10 px-6 py-2.5 text-sm font-medium md:hidden">
          <NavCrm itens={NAV} variante="mobile" />
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">{children}</main>
    </div>
  );
}
