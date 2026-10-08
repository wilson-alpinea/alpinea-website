import type { Metadata } from "next";
import LandingMurata from "../../components/empregos/LandingMurata";
import { LANDING_IZUMO } from "../../lib/landingsMurata";
import { vagasDoHotsite } from "@/lib/empregos/vagasAtivas";

export const metadata: Metadata = {
  title: LANDING_IZUMO.meta.titulo,
  description: LANDING_IZUMO.meta.descricao,
  openGraph: { title: LANDING_IZUMO.meta.titulo, description: LANDING_IZUMO.meta.descricao, images: [LANDING_IZUMO.hero.imagem.src] },
};

// Lista as vagas do catálogo ativas no CRM (Wilson, 07/out/2026).
export const revalidate = 60;

export default async function Page() {
  const vagas = await vagasDoHotsite(LANDING_IZUMO.vagaId);
  return <LandingMurata config={LANDING_IZUMO} vagas={vagas} />;
}
