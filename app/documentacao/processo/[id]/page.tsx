import type { Metadata } from "next";
import Link from "next/link";
import { carregarProcessoPublico, pessoasDoProcesso } from "@/lib/documentacao/processoPublico";
import { parseFichaDoc, passoAtual, signatarioFicha, textoContrato, type DocumentoEnviado } from "../../processo";
import { PortalProcesso } from "./PortalProcesso";

// Portal do processo de Documentação (Wilson, 29/out/2026) — acesso só pelo
// link com token enviado no fim do cadastro, como as etapas de /empregos.
export const metadata: Metadata = {
  title: "Seu processo — Ajisai Documentação",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default async function PortalPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const { id } = await params;
  const { t } = await searchParams;
  const p = await carregarProcessoPublico(id, t);
  if (!p || !t) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F6F7F5] px-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-medium text-black">Link inválido</h1>
          <p className="mt-3 text-sm leading-6 text-black/55">Abra o processo pelo link que você recebeu por e-mail depois do cadastro.</p>
          <Link href="/documentacao" className="mt-6 inline-block rounded-full bg-[#0B3D30] px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white">
            Documentação
          </Link>
        </div>
      </main>
    );
  }

  const pessoas = pessoasDoProcesso(p.campos, p.servico);
  const ficha = parseFichaDoc(p.servico, p.ficha, pessoas || 1);
  const passo = passoAtual(p);
  const sig = signatarioFicha(p.servico, ficha);
  const contratoPrevia =
    passo === "contrato" && p.valor_final && sig
      ? textoContrato({ servico: p.servico, nome: sig.nome, cpf: sig.cpf, valorFinal: p.valor_final, pessoas: ficha.pessoas.map((x) => x.nome).filter(Boolean), resumo: p.resumo ?? "", data: "(data e hora do aceite)" })
      : null;
  const contratoAceito = (p.contrato ?? null) as { texto: { titulo: string; clausulas: string[] }; hash: string; aceito_em: string } | null;
  const docs = ((Array.isArray(p.documentos) ? p.documentos : []) as DocumentoEnviado[]).map((d) => ({ id: d.id, tipo: d.tipo, nome: d.nome, tamanho: d.tamanho, enviado_em: d.enviado_em }));

  return (
    <PortalProcesso
      id={p.id}
      token={t}
      servico={p.servico}
      nome={p.nome}
      etapa={p.etapa}
      passo={passo}
      pessoas={pessoas}
      fichaInicial={ficha}
      documentosIniciais={docs}
      valorFinal={p.valor_final}
      contratoPrevia={contratoPrevia}
      contratoAceito={contratoAceito}
      motivoSaida={p.motivo_saida}
    />
  );
}
