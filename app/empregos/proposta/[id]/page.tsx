import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bodoni_Moda } from "next/font/google";
import { carregarCandidaturaPublica } from "@/lib/empregos/candidaturaPublica";
import { buscarCotacaoIene } from "@/app/lib/cotacaoIeneServidor";
import { AEROPORTOS, type SelecaoProposta } from "@/app/lib/financiamentoEmpregos";
import { urlEtapa, vagaPrecisaProposta } from "@/app/lib/etapasCandidatura";
import type { FichaCadastral } from "@/app/lib/fichaCadastral";
import PropostaForm from "./PropostaForm";

// Etapa 3 — proposta de financiamento (Wilson, 06/out/2026).

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Proposta de financiamento — Alpinea Empregos",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function PropostaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const { id } = await params;
  const { t } = await searchParams;
  const c = await carregarCandidaturaPublica(id, t);
  if (!c || !t) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-4 text-center">
        <div>
          <h1 className={`${display.className} text-2xl text-black`}>Link inválido</h1>
          <Link href="/empregos" className="mt-4 inline-block text-sm text-[#2f80c9] underline">
            Ver vagas
          </Link>
        </div>
      </main>
    );
  }
  if (!c.ficha_enviada_em || !c.foto_path) redirect(urlEtapa("ficha", c.id, t));
  if (!vagaPrecisaProposta(c.vaga_id)) redirect(urlEtapa("agendamento", c.id, t));

  const ficha = (c.ficha ?? null) as FichaCadastral | null;
  const uf = typeof ficha?.valores.uf === "string" ? ficha.valores.uf : "";
  const cidade = typeof ficha?.valores.cidade === "string" ? ficha.valores.cidade : "";
  const anterior = c.proposta_financiamento?.selecao as SelecaoProposta | undefined;
  const inicial: SelecaoProposta = anterior ?? {
    proponentes: 1,
    // Já tem visto/certificado? Então não precisa do serviço.
    visto: !ficha || ficha.valores.situacaoVisto === "naoTenho",
    certificado: ficha?.valores.certificadoElegibilidade !== "sim",
    aeroporto: AEROPORTOS.find((a) => a.uf === uf)?.iata ?? "GRU",
    cestaExtras: true,
  };
  const cotacao = await buscarCotacaoIene("sao-paulo", "compra");

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2f80c9]">Etapa 3 · {c.vaga_empresa}</p>
        <h1 className={`${display.className} mt-2 text-3xl font-medium text-black sm:text-4xl`}>Proposta de financiamento</h1>
        <p className="mt-3 text-sm leading-6 text-black/55">
          {c.nome}, esta vaga não tem os custos de ida pagos pela empresa. Monte abaixo o que você precisa — os valores
          são por pessoa e entram no financiamento.
        </p>
        <PropostaForm
          candidaturaId={c.id}
          token={t}
          nome={`${c.nome} ${c.sobrenome}`}
          vagaTitulo={c.vaga_titulo}
          vagaEmpresa={c.vaga_empresa}
          cotacao={cotacao.cotacaoBRLPorJPY}
          fonteCotacao={cotacao.fonte}
          cidadeCandidato={[cidade, uf].filter(Boolean).join(" / ")}
          inicial={inicial}
          jaAceita={c.proposta_status === "aceita"}
          agendamentoUrl={urlEtapa("agendamento", c.id, t)}
        />
      </div>
    </main>
  );
}
