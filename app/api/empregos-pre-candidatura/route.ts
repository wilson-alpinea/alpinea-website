import { NextResponse } from "next/server";

// Desativado em 07/out/2026 — Wilson: "o candidato tem que se candidatar
// pelas vagas que já estão no site, não existe caminho especial". As
// landings Murata (/empregos/izumo e /empregos/echizen) não têm mais o
// formulário curto de pré-análise; listam as vagas do catálogo e usam a
// candidatura padrão (/api/empregos-candidatura). As pré-candidaturas
// antigas (origem "landing") continuam no CRM.
export async function POST() {
  return NextResponse.json(
    { error: "Este formulário foi desativado. Candidate-se pela página da vaga, no catálogo de vagas." },
    { status: 410 },
  );
}
