import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VAGAS, encontrarVaga } from "../../../lib/vagasCatalogo";
import { vagaEstaAtiva } from "@/lib/empregos/vagasAtivas";
import CheckoutCandidatura from "./CheckoutCandidatura";

// Página de candidatura ("checkout") comum a todas as vagas — Wilson,
// 08/out/2026: "páginas de candidatura devem ir para um site separado como
// se fosse uma página de checkout comum a todas as vagas". A página da vaga,
// os hot sites e o catálogo levam para cá; o formulário é o mesmo
// (CandidaturaModal em modo página) e grava pela mesma API.

export const revalidate = 60;
export const dynamicParams = false;

export function generateStaticParams() {
  return VAGAS.map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const vaga = encontrarVaga(id);
  if (!vaga) return {};
  return {
    title: `Candidatura — ${vaga.empresa}, ${vaga.cidade} | Ajisai Empregos`,
    robots: { index: false, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vaga = encontrarVaga(id);
  if (!vaga) notFound();
  const ativa = await vagaEstaAtiva(vaga.id);
  return <CheckoutCandidatura vaga={vaga} ativa={ativa} />;
}
