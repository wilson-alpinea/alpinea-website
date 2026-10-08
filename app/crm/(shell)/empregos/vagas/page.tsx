import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { VAGAS } from "@/app/lib/vagasCatalogo";
import ListaVagasSite from "./ListaVagasSite";

// Liga/desliga as vagas do catálogo no site — Wilson, 07/out/2026. Vaga
// desligada some de /empregos, do hot site, das sugestões e deixa de
// aceitar candidatura; a página própria dela mostra "encerrada".

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Vagas no site — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function VagasSitePage() {
  const supabase = await createClient();
  const [{ data: status, error }, { data: candidaturas }] = await Promise.all([
    supabase.from("vagas_status").select("vaga_id, ativa, updated_at"),
    supabase.from("candidaturas_vagas").select("vaga_id"),
  ]);
  if (error) console.error("Erro ao ler vagas_status:", error);

  const statusDe = new Map((status ?? []).map((s) => [s.vaga_id as string, { ativa: Boolean(s.ativa), em: s.updated_at as string }]));
  const totalDe = new Map<string, number>();
  for (const c of candidaturas ?? []) totalDe.set(c.vaga_id, (totalDe.get(c.vaga_id) ?? 0) + 1);

  const linhas = VAGAS.map((v) => ({
    id: v.id,
    empresa: v.empresa,
    titulo: v.titulo,
    local: `${v.cidade}, ${v.regiao}`,
    status: v.status,
    ativa: statusDe.get(v.id)?.ativa ?? true,
    alteradaEm: statusDe.get(v.id)?.em ?? null,
    candidaturas: totalDe.get(v.id) ?? 0,
  }));

  return (
    <div>
      <Link href="/crm/empregos" className="text-xs uppercase tracking-[0.2em] text-black/40 hover:text-black/70">
        ← Empregos
      </Link>
      <h1 className={`${display.className} mt-2 text-3xl font-medium text-black md:text-4xl`}>Vagas no site</h1>
      <p className="mt-2 max-w-2xl text-sm text-black/55">
        Marque as vagas que devem aparecer em /empregos e nos hot sites. Cada clique salva na hora. Vaga nova cadastrada no
        catálogo entra ativa.
      </p>
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Não foi possível ler o status das vagas — rode a migração supabase/migrations/018_vagas_status.sql no Supabase.
        </p>
      )}
      <ListaVagasSite linhas={linhas} />
    </div>
  );
}
