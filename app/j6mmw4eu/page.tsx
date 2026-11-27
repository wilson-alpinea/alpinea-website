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
  // Primeira vez: tabela vazia → grava as 100 agências da planilha, em
  // lotes, com todas as colunas em todas as linhas. Não sobrescreve nada
  // (ignora as que já existirem). Se falhar, o erro aparece na página.
  let erroCarga: string | null = null;
  if (!error && (data ?? []).length === 0) {
    const colunas = Array.from(new Set(AGENCIAS_INICIAIS.flatMap((a) => Object.keys(a))));
    const linhas = AGENCIAS_INICIAIS.map((a) => Object.fromEntries(colunas.map((c) => [c, (a as Record<string, unknown>)[c] ?? null])));
    for (let i = 0; i < linhas.length && !erroCarga; i += 25) {
      const r = await admin.from("agencias_prospeccao").upsert(linhas.slice(i, i + 25), { onConflict: "ordem", ignoreDuplicates: true });
      if (r.error) erroCarga = `${r.error.code ?? ""} ${r.error.message}`.trim();
    }
    if (erroCarga) console.error("Erro na carga inicial das agências:", erroCarga);
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
        {erroCarga && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Não foi possível carregar as 100 agências: {erroCarga}
          </p>
        )}
        {semTabela ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Não foi possível ler a tabela de agências{error?.message ? `: ${error.message}` : ""}. Confira se a migração 043 rodou no Supabase.
          </p>
        ) : (
          <Checklist inicial={(data ?? []) as Agencia[]} />
        )}
      </main>
    </div>
  );
}
