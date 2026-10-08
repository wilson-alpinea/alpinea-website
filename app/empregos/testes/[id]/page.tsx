import type { Metadata } from "next";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { createAdminClient } from "@/lib/supabase/admin";
import { fichaLiberada } from "@/app/lib/fichaCadastral";
import { estadoPublico, lerEstadoTestes, vagaExigeTestesAptidao } from "@/app/lib/testesAptidao";
import TestesAptidao from "./TestesAptidao";

// Testes de aptidão online — etapa entre o match (80%+) e a ficha
// cadastral, só para vagas com `testesAptidao: true` (Wilson, 08/out/2026).
// Acesso pelo mesmo link com token das outras etapas.

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Testes de aptidão — Ajisai Empregos",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

function Aviso({ titulo, texto, acao }: { titulo: string; texto: string; acao?: { href: string; label: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4">
      <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <h1 className={`${display.className} text-2xl font-medium text-black`}>{titulo}</h1>
        <p className="mt-3 text-sm leading-6 text-black/55">{texto}</p>
        <Link
          href={acao?.href ?? "/empregos"}
          className="mt-6 inline-block rounded-full bg-[#2f80c9] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
        >
          {acao?.label ?? "Ver vagas"}
        </Link>
      </div>
    </main>
  );
}

export default async function TestesPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const { id } = await params;
  const { t } = await searchParams;
  if (!t || !/^[0-9a-f-]{36}$/i.test(id)) {
    return <Aviso titulo="Link inválido" texto="Abra os testes pelo link que você recebeu ao final da candidatura." />;
  }
  const supabase = createAdminClient();
  const { data: c } = await supabase.from("candidaturas_vagas").select("*").eq("id", id).maybeSingle();
  if (!c || c.ficha_token !== t) {
    return <Aviso titulo="Link inválido" texto="Este link não é válido. Abra os testes pelo link que você recebeu ao final da candidatura." />;
  }
  if (!fichaLiberada(c)) {
    return <Aviso titulo="Etapa ainda não liberada" texto="Sua candidatura está em análise. Nossa equipe entra em contato se houver uma vaga compatível." />;
  }
  const fichaUrl = `/empregos/ficha/${c.id}?t=${t}`;
  if (!vagaExigeTestesAptidao(c.vaga_id)) {
    return <Aviso titulo="Sem testes nesta vaga" texto="Esta vaga não pede testes de aptidão. Siga para a ficha cadastral." acao={{ href: fichaUrl, label: "Ir para a ficha" }} />;
  }

  return (
    <TestesAptidao
      candidaturaId={c.id}
      token={t}
      nome={c.nome}
      vagaTitulo={c.vaga_titulo}
      vagaEmpresa={c.vaga_empresa}
      fichaUrl={fichaUrl}
      estadoInicial={estadoPublico(lerEstadoTestes(c.testes_aptidao))}
    />
  );
}
