import type { Metadata } from "next";
import LandingMurata from "../../components/empregos/LandingMurata";
import { LANDING_IZUMO } from "../../lib/landingsMurata";

export const metadata: Metadata = {
  title: LANDING_IZUMO.meta.titulo,
  description: LANDING_IZUMO.meta.descricao,
  openGraph: { title: LANDING_IZUMO.meta.titulo, description: LANDING_IZUMO.meta.descricao, images: [LANDING_IZUMO.hero.imagem.src] },
};

export default function Page() {
  return <LandingMurata config={LANDING_IZUMO} />;
}
