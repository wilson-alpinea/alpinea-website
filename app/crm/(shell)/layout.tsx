import Link from "next/link";
import { NavCrm } from "./NavCrm";
import { MenuCrm } from "./MenuCrm";
import { headers } from "next/headers";
import { exigirAdmin } from "@/lib/crm/acesso";
import { INICIO_UNIDADE, NAV_CONSULTOR, UNIDADES_CRM, UNIDADE_COR, UNIDADE_CURTO, UNIDADE_LABEL, isUnidadeCrm, urlUnidade } from "@/lib/crm/unidades";
import { logout } from "../actions";

// Dois CRMs (Wilson, 21/out/2026): agência de viagens e empregos, cada um
// com o próprio menu. A unidade vem do proxy.ts (header x-crm-unidade).
const NAV_AGENCIA = [
  { href: "/crm", label: "Dashboard" },
  { href: "/crm/clientes", label: "Clientes" },
  { href: "/crm/fornecedores", label: "Fornecedores" },
  { href: "/crm/pipeline", label: "Pipeline" },
  { href: "/crm/acessos", label: "Acessos" },
  { href: "/crm/comissoes", label: "Comissões" },
  { href: "/crm/precos", label: "Preços" },
];
const NAV_EMPREGOS = [
  { href: "/crm/empregos", label: "Candidatos" },
  { href: "/crm/empregos/agenda", label: "Agenda" },
  { href: "/crm/empregos/vagas", label: "Vagas" },
  { href: "/crm/empregos/blacklist", label: "Blacklist" },
  { href: "/crm/acessos", label: "Acessos" },
  { href: "/crm/precos", label: "Preços" },
];
// CRM de Seguro Viagem (Wilson, 26/out/2026).
// + Visão geral (Wilson, 29/out/2026), como a da Agência.
const NAV_SEGURO = [
  { href: "/crm/seguro/visao-geral", label: "Visão geral" },
  { href: "/crm/seguro", label: "Pedidos" },
  // eSIM dentro do Seguro — "CRM de Seguro Viagem & eSIM" (Wilson, 29/out/2026).
  { href: "/crm/seguro/esim", label: "eSIM" },
  { href: "/crm/acessos", label: "Acessos" },
  { href: "/crm/precos", label: "Preços" },
];
// CRM de Documentação (Wilson, 29/out/2026).
const NAV_DOCUMENTACAO = [
  { href: "/crm/documentacao/visao-geral", label: "Visão geral" },
  { href: "/crm/documentacao", label: "Processos" },
  { href: "/crm/acessos", label: "Acessos" },
  { href: "/crm/precos", label: "Preços" },
];
// CRM de Câmbio (Wilson, 29/out/2026).
const NAV_CAMBIO = [
  { href: "/crm/cambio", label: "Pedidos" },
  { href: "/crm/acessos", label: "Acessos" },
  { href: "/crm/precos", label: "Preços" },
];
const NAV_UNIDADE = { agencia: NAV_AGENCIA, empregos: NAV_EMPREGOS, seguro: NAV_SEGURO, documentacao: NAV_DOCUMENTACAO, cambio: NAV_CAMBIO };

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
  // Consultor (migração 030): sem "Acessos" e só os CRMs liberados no menu.
  const consultor = acesso.papel === "consultor";
  const NAV = consultor ? [NAV_CONSULTOR[unidade]] : NAV_UNIDADE[unidade];
  const crmsVisiveis = consultor ? UNIDADES_CRM.filter((u) => acesso.permissoes?.crms.includes(u)) : UNIDADES_CRM;
  const rotuloUnidade = UNIDADE_LABEL[unidade];

  return (
    <div data-unidade={unidade} className="crm-pagina min-h-screen bg-[#FAF9F6] text-[#20252B]">
      {/* Cabeçalho em duas linhas (Wilson, 27/nov/2026: "texto em cima do
          logo, repense num jeito mais fácil de organizar essa barra preta").
          Linha 1: logo, troca de CRM (mostra o CRM atual) e usuário/Sair.
          Linha 2: o menu da unidade, com rolagem lateral quando não cabe —
          nada disputa espaço com o logo em nenhuma largura de tela. */}
      <header className="sticky top-0 z-50 bg-black">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6 md:px-10">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link href={consultor ? NAV_CONSULTOR[unidade].href : INICIO_UNIDADE[unidade]} className="shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60" aria-label={`Ajisai — início do CRM ${rotuloUnidade}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-7 w-auto sm:h-8" />
            </Link>
            <span aria-hidden="true" className="h-7 w-px shrink-0 bg-white/15" />
            {/* Trocar de CRM: o botão já mostra em qual CRM você está. */}
            <MenuCrm
              opcoes={crmsVisiveis.map((u) => ({
                chave: u,
                nome: UNIDADE_CURTO[u],
                href: urlUnidade(u),
                cor: UNIDADE_COR[u],
                atual: u === unidade,
              }))}
            />
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden max-w-[16rem] truncate text-[13px] text-white/45 lg:inline">
              {nomeExibicao}
              {acesso.cargo ? ` · ${acesso.cargo}` : ""}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-white/60 transition hover:border-white/40 hover:text-white"
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10">
          <nav aria-label={`Menu do CRM ${rotuloUnidade}`} className="crm-menu mx-auto flex max-w-6xl items-stretch gap-1 overflow-x-auto px-3 text-sm font-medium md:px-7">
            <NavCrm itens={NAV} />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">{children}</main>
    </div>
  );
}
