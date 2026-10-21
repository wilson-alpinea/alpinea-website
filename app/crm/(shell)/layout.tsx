import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import { headers } from "next/headers";
import { exigirAdmin } from "@/lib/crm/acesso";
import { urlUnidade } from "@/lib/crm/unidades";
import { logout } from "../actions";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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

export default async function CrmShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Só a equipe (admin) entra nas telas do CRM; parceiros têm portal próprio.
  const acesso = await exigirAdmin();
  const nomeExibicao = acesso.nome;
  const unidade = (await headers()).get("x-crm-unidade") === "empregos" ? "empregos" : "agencia";
  const NAV = unidade === "empregos" ? NAV_EMPREGOS : NAV_AGENCIA;
  const rotuloUnidade = unidade === "empregos" ? "Empregos" : "Agência";

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-black">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 md:px-10">
          <div className="flex min-w-0 items-center gap-6 lg:gap-8">
            <Link href={unidade === "empregos" ? "/crm/empregos" : "/crm"} className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/ajisai-group-white-crop.png"
                alt="Alpinea — Empresa do Grupo Ajisai"
                className="h-12 w-auto sm:h-16"
              />
              <span className="hidden h-9 w-px bg-white/15 sm:block" />
              {/* Unidade embaixo de "CRM" para não invadir o menu (Wilson, 21/out/2026). */}
              <span className="hidden flex-col leading-none sm:flex">
                <span className={`${display.className} text-4xl tracking-[0.03em] text-white sm:text-5xl`}>CRM</span>
                <span className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/45">{rotuloUnidade}</span>
              </span>
            </Link>
            <nav className="hidden items-center gap-5 whitespace-nowrap text-sm text-white/50 md:flex lg:gap-6">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            {/* Trocar para o outro CRM (Wilson, 21/out/2026). */}
            <a
              href={urlUnidade(unidade === "empregos" ? "agencia" : "empregos")}
              className="hidden whitespace-nowrap text-xs text-white/45 underline-offset-4 transition hover:text-white hover:underline lg:inline"
            >
              CRM {unidade === "empregos" ? "Agência" : "Empregos"} →
            </a>
            <span className="hidden text-xs uppercase tracking-[0.2em] text-white/35 xl:inline">
              {nomeExibicao}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-white/15 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-white/50 transition hover:border-white/40 hover:text-white"
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        <nav className="flex items-center gap-5 overflow-x-auto border-t border-white/10 px-6 py-2.5 text-sm text-white/50 md:hidden">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">{children}</main>
    </div>
  );
}
