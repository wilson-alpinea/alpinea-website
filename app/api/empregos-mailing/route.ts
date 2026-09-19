import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";

export const runtime = "nodejs";

// Cadastro de e-mail no mailing da página /empregos ("Deseja ser
// notificado quando abrir novas vagas?") — pedido do Wilson, 19/set/2026.
//
// Mesmo padrão de /api/calculadora-reversa-crm: usa o cliente admin
// (service role, ver lib/supabase/admin.ts) porque esse formulário é
// público (visitante do site, sem login no CRM) e a RLS de
// `mailing_vagas` só libera insert pra "authenticated" (ver migração
// supabase/migrations/010_mailing_vagas.sql).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    const supabase = createAdminClient();

    // upsert pela constraint única em `email` — se a pessoa já tinha
    // cadastrado antes, não duplica linha, só confirma sucesso de novo.
    const { error } = await supabase
      .from("mailing_vagas")
      .upsert({ email, origem: "empregos_notificacao" }, { onConflict: "email", ignoreDuplicates: true });

    if (error) {
      console.error("Erro ao gravar e-mail (empregos-mailing):", error);
      return NextResponse.json(
        { error: "Não foi possível registrar seu e-mail agora. Tente novamente em alguns segundos." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro no cadastro de mailing de /empregos:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
