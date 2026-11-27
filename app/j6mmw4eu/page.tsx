import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { interCrm } from "@/lib/crm/fonte";
import { Checklist } from "./Checklist";
import type { Agencia } from "./dados";
import { AGENCIAS_INICIAIS } from "./agenciasIniciais";

// Checklist de prospecção das 100 agências (Wilson, 27/nov/2026: "criar uma
// página interna sem estar no CRM para o nosso checklist de agências que
// vamos abordar, algo simples com status, e-mail enviado etc."). Base: a
// planilha "Ajisai-Alpinea — 100 potenciais parceiros no Brasil" (nov/2026),
// carregada pela migração 043. Link privado de 8 caracteres: nunca indexado
// (lib/privacidade.ts), só abre quem tem o link.

export const metadata: Metadata = {
  title: "Prospecção de agências | Ajisai",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default async function ProspeccaoAgenciasPage() {
  const admin = createAdminClient();
  let { data, error } = await admin.from("agencias_prospeccao").select("*").order("ordem");
  // Primeira vez: tabela vazia → grava as 100 agências da planilha. Não
  // sobrescreve nada (ignora as que já existirem).
  if (!error && (data ?? []).length === 0) {
    const r = await admin.from("agencias_prospeccao").upsert(AGENCIAS_INICIAIS, { onConflict: "ordem", ignoreDuplicates: true });
    if (r.error) console.error("Erro na carga inicial das agências:", r.error.message);
    ({ data, error } = await admin.from("agencias_prospeccao").select("*").order("ordem"));
  }
  const semTabela = !!error;
  if (error) console.error("Erro ao carregar agências:", error.message);

  return (
    <div className={`${interCrm.className} min-h-screen bg-[#FAF9F6] text-[#20252B]`}>
      <header className="bg-black">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5 md:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-7 w-auto sm:h-8" />
          <span aria-hidden="true" className="h-7 w-px bg-white/15" />
          <span className="text-sm font-medium text-white">Prospecção de agências</span>
          <span className="ml-auto hidden text-[13px] text-white/45 sm:inline">Uso interno · link privado</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        {semTabela ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Rode a migração 043 no Supabase para carregar as 100 agências.
          </p>
        ) : (
          <Checklist inicial={(data ?? []) as Agencia[]} />
        )}
      </main>
    </div>
  );
}
