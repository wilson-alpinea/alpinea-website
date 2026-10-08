import type { Metadata } from "next";
import LandingMurata from "../../components/empregos/LandingMurata";
import { LANDING_ECHIZEN } from "../../lib/landingsMurata";
import { vagasDoHotsite } from "@/lib/empregos/vagasAtivas";

export const metadata: Metadata = {
  title: LANDING_ECHIZEN.meta.titulo,
  description: LANDING_ECHIZEN.meta.descricao,
  openGraph: { title: LANDING_ECHIZEN.meta.titulo, description: LANDING_ECHIZEN.meta.descricao, images: [LANDING_ECHIZEN.hero.imagem.src] },
};

// Lista as vagas do catálogo ativas no CRM (Wilson, 07/out/2026).
export const revalidate = 60;

export default async function Page() {
  const vagas = await vagasDoHotsite(LANDING_ECHIZEN.vagaId);
  return <LandingMurata config={LANDING_ECHIZEN} vagas={vagas} />;
}
