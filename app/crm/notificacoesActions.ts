"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { garantirEquipe as garantirAdmin } from "@/lib/crm/acesso";
import { cookieNotificacoes, type UnidadeNotificacao } from "@/lib/crm/notificacoes";

// Marca todas as notificações como lidas neste navegador.
export async function marcarNotificacoesLidas(unidade: UnidadeNotificacao = "agencia") {
  await garantirAdmin();
  (await cookies()).set(cookieNotificacoes(unidade), new Date().toISOString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: true,
    httpOnly: true,
  });
  revalidatePath("/crm", "layout");
}
