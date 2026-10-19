import type { Metadata } from "next";
import { metaEmpregos } from "@/lib/empregos/metaCompartilhamento";
import LandingMurata from "../../components/empregos/LandingMurata";
import { LANDING_IZUMO } from "../../lib/landingsMurata";
import { vagasDoHotsite } from "@/lib/empregos/vagasAtivas";

// Prévia no WhatsApp com o logo Ajisai (Wilson, 19/out/2026).
export const metadata: Metadata = metaEmpregos({
  titulo: LANDING_IZUMO.meta.titulo,
  descricao: LANDING_IZUMO.meta.descricao,
  url: "https://www.alpinea.io/empregos/izumo",
});

// Lista as vagas do catálogo ativas no CRM (Wilson, 07/out/2026).
export const revalidate = 60;

export default async function Page() {
  const vagas = await vagasDoHotsite(LANDING_IZUMO.vagaId);
  return <LandingMurata config={LANDING_IZUMO} vagas={vagas} />;
}
