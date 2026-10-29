import { logout } from "./actions";

// Moldura dos portais de parceiro/empreiteira (Wilson, 21/out/2026) — sem o
// menu da equipe.

// `crm`: selo com o CRM em que a pessoa está (Wilson, 29/out/2026).
// `logo`: logo da empresa parceira, ao lado do da Alpinea (Wilson, 29/out/2026).
export function PortalShell({ titulo, empresa, usuario, crm, logo, children }: { titulo: string; empresa: string; usuario: string; crm?: { nome: string; cor: string }; logo?: string | null; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#20252B]">
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 md:px-10">
          <div className="flex min-w-0 items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ajisai-group-white-crop.png" alt="Alpinea — Empresa do Grupo Ajisai" className="h-10 w-auto sm:h-12" />
            {logo && (
              <>
                <span className="text-lg text-white/30" aria-hidden="true">×</span>
                <span className="flex h-12 items-center rounded-lg bg-white px-3 py-1.5 sm:h-14">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo} alt={`Logo ${empresa}`} className="max-h-full max-w-[9rem] object-contain" />
                </span>
              </>
            )}
            <span className="hidden h-8 w-px bg-white/15 sm:block" />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-2xl font-semibold leading-[1.1] text-white">
                {titulo}
                {crm && (
                  <span className="rounded-full px-2.5 py-0.5 text-[12px] font-medium leading-5 text-white" style={{ backgroundColor: crm.cor }}>
                    CRM {crm.nome}
                  </span>
                )}
              </p>
              <p className="mt-1 truncate text-[13px] text-white/45">{empresa}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[13px] text-white/40 sm:inline">{usuario}</span>
            <form action={logout}>
              <button type="submit" className="rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-white/60 transition hover:border-white/40 hover:text-white">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:px-10 md:py-12">{children}</main>
    </div>
  );
}
