import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { VAGAS, formatarDataPostagem } from "@/app/lib/vagasCatalogo";
import ListaVagasSite, { type LinhaVaga } from "./ListaVagasSite";

// Liga/desliga as vagas do catálogo no site — Wilson, 07/out/2026. Vaga
// desligada some de /empregos, do hot site, das sugestões e deixa de
// aceitar candidatura; a página própria dela mostra "encerrada".
// Redesenho 23/out/2026: indicadores, filtros na URL, switch de
// visibilidade separado da seleção e ações em lote com confirmação.

export const metadata: Metadata = {
  title: "Vagas — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

// Lê todas as candidaturas em páginas de 1000 (limite padrão do Supabase),
// para a contagem por vaga nunca sair cortada.
async function contarCandidaturas(supabase: Awaited<ReturnType<typeof createClient>>) {
  const total = new Map<string, number>();
  for (let de = 0; ; de += 1000) {
    const { data, error } = await supabase.from("candidaturas_vagas").select("vaga_id").range(de, de + 999);
    if (error) {
      console.error("Erro ao contar candidaturas:", error);
      return null;
    }
    for (const c of data ?? []) total.set(c.vaga_id, (total.get(c.vaga_id) ?? 0) + 1);
    if (!data || data.length < 1000) return total;
  }
}

export default async function VagasSitePage() {
  const supabase = await createClient();
  const [{ data: status, error }, totalDe] = await Promise.all([supabase.from("vagas_status").select("vaga_id, ativa"), contarCandidaturas(supabase)]);
  if (error) console.error("Erro ao ler vagas_status:", error);

  const ativaDe = new Map((status ?? []).map((s) => [s.vaga_id as string, Boolean(s.ativa)]));
  const linhas: LinhaVaga[] = VAGAS.map((v) => ({
    id: v.id,
    codigo: v.codigo,
    publicadaEm: v.publicadaEm,
    publicadaBR: formatarDataPostagem(v.publicadaEm),
    empresa: v.empresa,
    titulo: v.titulo,
    cidade: v.cidade,
    provincia: v.regiao,
    // Sem linha em vagas_status = regra atual: vaga nova entra visível.
    ativa: ativaDe.get(v.id) ?? true,
    candidaturas: totalDe ? (totalDe.get(v.id) ?? 0) : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[#202B28]" style={{ fontSize: 28, fontWeight: 600 }}>
            Vagas
          </h1>
          <p className="mt-1 text-sm text-[#626E69]">Gerencie quais vagas aparecem no site e acompanhe suas candidaturas.</p>
          <p className="mt-1 text-[13px] text-[#8A9792]">As alterações de visibilidade são salvas automaticamente.</p>
        </div>
        <a
          href="/empregos"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#DEE6E2] bg-white px-4 py-2.5 text-sm font-medium text-[#202B28] transition hover:border-[#42658A]/50"
        >
          Ver vagas no site
          <IconeExterno />
        </a>
      </div>
      <Suspense>
        <ListaVagasSite linhas={linhas} erroStatus={!!error} />
      </Suspense>
    </div>
  );
}

function IconeExterno() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M9 2.5h4.5V7M13.5 2.5 7.5 8.5M12 9.5v3a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
