import { Bodoni_Moda } from "next/font/google";
import { logout } from "./actions";

// Moldura dos portais de parceiro/empreiteira (Wilson, 21/out/2026) — sem o
// menu da equipe.
export const displayPortal = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

export function PortalShell({ titulo, empresa, usuario, children }: { titulo: string; empresa: string; usuario: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-black">
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 md:px-10">
          <div className="flex min-w-0 items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ajisai-group-white-crop.png" alt="Alpinea — Empresa do Grupo Ajisai" className="h-10 w-auto sm:h-12" />
            <span className="hidden h-8 w-px bg-white/15 sm:block" />
            <div className="min-w-0">
              <p className={`${displayPortal.className} text-2xl leading-none text-white`}>{titulo}</p>
              <p className="mt-1 truncate text-[11px] uppercase tracking-[0.2em] text-white/45">{empresa}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-white/40 sm:inline">{usuario}</span>
            <form action={logout}>
              <button type="submit" className="rounded-full border border-white/15 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-white/60 transition hover:border-white/40 hover:text-white">
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
