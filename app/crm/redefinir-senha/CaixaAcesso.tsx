// Moldura das telas de acesso (login, esqueci e redefinir senha).
export const CAMPO =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-base text-[#20252B] placeholder-black/30 outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10";
export const BOTAO =
  "w-full rounded-xl bg-[#1C3A5E] px-4 py-3 text-sm font-medium text-white shadow-sm shadow-[#1C3A5E]/25 transition hover:bg-[#254a73] disabled:opacity-60";

export function CaixaAcesso({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-6 text-[#20252B]">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-black/5 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_30px_70px_-30px_rgba(0,0,0,0.25)]">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ajisai-group-logo-crop.png" alt="Alpinea — Empresa do Grupo Ajisai" className="mx-auto h-12 w-auto" />
          <p className="mt-4 text-base font-semibold text-[#20252B]">{titulo}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
