import type { Metadata } from "next";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { createAdminClient } from "@/lib/supabase/admin";
import { fichaLiberada } from "@/app/lib/fichaCadastral";
import FichaForm from "./FichaFormCliente";
import { urlEtapa, vagaPrecisaProposta } from "@/app/lib/etapasCandidatura";

// Etapa 2 da candidatura de /empregos — ficha cadastral unificada
// (Wilson, 06/out/2026). Acesso só pelo link com token gerado na etapa 1.

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Ficha cadastral — Alpinea Empregos",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

function Aviso({ titulo, texto, acao }: { titulo: string; texto: string; acao?: { href: string; label: string } }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4">
      <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
        <h1 className={`${display.className} text-2xl font-medium text-black`}>{titulo}</h1>
        <p className="mt-3 text-sm leading-6 text-black/55">{texto}</p>
        {acao ? (
          <Link href={acao.href} className="mt-6 inline-block rounded-full bg-[#2f80c9] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            {acao.label}
          </Link>
        ) : (
          <Link href="/empregos" className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            Ver vagas
          </Link>
        )}
      </div>
    </main>
  );
}

export default async function FichaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id } = await params;
  const { t } = await searchParams;
  if (!t || !/^[0-9a-f-]{36}$/i.test(id)) {
    return <Aviso titulo="Link inválido" texto="Abra a ficha pelo link que você recebeu ao final da etapa 1." />;
  }

  const supabase = createAdminClient();
  const { data: c } = await supabase
    .from("candidaturas_vagas")
    .select("id, nome, vaga_id, vaga_titulo, vaga_empresa, pontuacao, classificacao, ficha_token, ficha_liberada, ficha_enviada_em, foto_path")
    .eq("id", id)
    .maybeSingle();

  if (!c || c.ficha_token !== t) {
    return <Aviso titulo="Link inválido" texto="Este link não é válido. Abra a ficha pelo link que você recebeu ao final da etapa 1." />;
  }
  if (!fichaLiberada(c)) {
    return <Aviso titulo="Etapa ainda não liberada" texto="Sua candidatura está em análise. Nossa equipe entra em contato se houver uma vaga compatível." />;
  }
  const proxima = vagaPrecisaProposta(c.vaga_id)
    ? { href: urlEtapa("proposta", c.id, t), label: "Ir para a etapa 3 — proposta" }
    : { href: urlEtapa("agendamento", c.id, t), label: "Agendar a pré-entrevista" };
  if (c.ficha_enviada_em && c.foto_path) {
    return <Aviso titulo="Ficha recebida" texto={`Obrigado, ${c.nome}! Já recebemos sua ficha e sua foto.`} acao={proxima} />;
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f80c9]">
          Etapa 2 · {c.vaga_empresa}
        </p>
        <h1 className={`${display.className} mt-2 text-3xl font-medium text-black sm:text-4xl`}>Ficha cadastral</h1>
        <p className="mt-3 text-sm leading-6 text-black/55">
          Olá, {c.nome}! Você passou na etapa 1 para <strong className="font-medium text-black/75">{c.vaga_titulo}</strong>.
          Complete a ficha abaixo — é a mesma que as empresas parceiras no Japão pedem. Seu progresso fica salvo neste
          navegador, então dá pra parar e continuar depois pelo mesmo link.
        </p>
        <FichaForm candidaturaId={c.id} token={t} fichaJaEnviada={Boolean(c.ficha_enviada_em)} proxima={proxima} />
      </div>
    </main>
  );
}
