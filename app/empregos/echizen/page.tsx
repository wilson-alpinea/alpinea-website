import type { Metadata } from "next";
import LandingMurata from "../../components/empregos/LandingMurata";
import { LANDING_ECHIZEN } from "../../lib/landingsMurata";

export const metadata: Metadata = {
  title: LANDING_ECHIZEN.meta.titulo,
  description: LANDING_ECHIZEN.meta.descricao,
  openGraph: { title: LANDING_ECHIZEN.meta.titulo, description: LANDING_ECHIZEN.meta.descricao, images: [LANDING_ECHIZEN.hero.imagem] },
};

export default function Page() {
  return <LandingMurata config={LANDING_ECHIZEN} />;
}
