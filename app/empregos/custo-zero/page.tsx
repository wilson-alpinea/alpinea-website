import type { Metadata } from "next";
import LandingCustoZero from "../../components/empregos/LandingCustoZero";
import { VAGAS_CAMPANHA_CUSTO_ZERO } from "../../lib/vagasCatalogo";
import { vagasAtivas } from "@/lib/empregos/vagasAtivas";

// Hot site da campanha custo zero (banner 1 do carrossel de /empregos) —
// Wilson, 18/out/2026: "porque as vagas do banner 1 não tem página própria
// especial? é pra criar". Lista só as vagas do grupo ativas no CRM; a
// candidatura é sempre pela vaga (sem caminho especial).

const titulo = "Custo zero: trabalhe no Japão com passagem, visto e seguro pagos — Ajisai Empregos";
const descricao =
  "5 vagas em fábricas de Shimane, Fukui e Shiga, de ¥1.400 a ¥1.450 por hora, com passagem aérea, visto e seguro-viagem pagos pela empresa para desembarque até 28/02/2027.";

export const metadata: Metadata = {
  title: titulo,
  description: descricao,
  openGraph: { title: titulo, description: descricao, images: ["/images/empregos-destaque-custo-zero.webp"] },
};

export const revalidate = 60;

export default async function Page() {
  const ativas = await vagasAtivas();
  const vagas = VAGAS_CAMPANHA_CUSTO_ZERO.map((id) => ativas.find((v) => v.id === id)).filter((v) => v !== undefined);
  const panasonicAtiva = ativas.some((v) => v.id === "panasonic-unnan");
  return <LandingCustoZero vagas={vagas} panasonicAtiva={panasonicAtiva} />;
}
