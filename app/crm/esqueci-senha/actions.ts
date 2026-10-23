"use server";

import { headers } from "next/headers";
import { createClient as criarClienteSupabase } from "@supabase/supabase-js";

// Pedido de link de recuperação (Wilson, 23/out/2026). Fluxo "implicit":
// o link funciona mesmo se aberto em outro aparelho/navegador. A resposta é
// sempre a mesma, exista ou não o e-mail, para não revelar quem tem acesso.

export type EstadoEsqueci = { enviado: boolean; erro?: string } | null;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function pedirLinkSenha(_: EstadoEsqueci, formData: FormData): Promise<EstadoEsqueci> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 200) return { enviado: false, erro: "Informe um e-mail válido." };

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.alpinea.io";
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const origem = `${local ? "http" : "https"}://${host}`;

  const supabase = criarClienteSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origem}/crm/redefinir-senha` });
  if (error) {
    console.error("Erro ao pedir link de senha:", error.message);
    if (error.status === 429) return { enviado: false, erro: "Muitos pedidos seguidos. Aguarde alguns minutos e tente de novo." };
  }
  return { enviado: true };
}
