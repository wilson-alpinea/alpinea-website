import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VAGAS, encontrarVaga } from "../../../lib/vagasCatalogo";
import { HOTSITE_POR_VAGA } from "../../../lib/landingsMurata";
import { vagaEstaAtiva } from "@/lib/empregos/vagasAtivas";
import VagaPagina from "./VagaPagina";

// Página própria de cada vaga do catálogo — Wilson, 07/out/2026: "todas as
// vagas no site agora devem ter site próprio". Gerada a partir de
// app/lib/vagasCatalogo.ts (vaga nova no catálogo = página nova, sem
// código extra). A candidatura é a mesma de /empregos (CandidaturaModal).
// Vaga desligada no CRM (/crm/empregos/vagas) mostra "encerrada" em vez de
// 404, para quem chega por link antigo/anúncio ainda achar as outras vagas.

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return VAGAS.map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const vaga = encontrarVaga(id);
  if (!vaga) return {};
  const titulo = `${vaga.titulo} — ${vaga.empresa}, ${vaga.cidade} | Ajisai Empregos`;
  const descricao = `Vaga em ${vaga.cidade}, ${vaga.regiao} (Japão): ${vaga.salario}. ${vaga.turno}. Candidate-se pelo site da Ajisai.`;
  return { title: titulo, description: descricao, openGraph: { title: titulo, description: descricao } };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vaga = encontrarVaga(id);
  if (!vaga) notFound();
  const ativa = await vagaEstaAtiva(vaga.id);
  return <VagaPagina vaga={vaga} ativa={ativa} hotsite={HOTSITE_POR_VAGA[vaga.id] ?? null} />;
}
