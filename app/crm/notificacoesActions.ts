"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { garantirAdmin } from "@/lib/crm/acesso";
import { COOKIE_NOTIFICACOES } from "@/lib/crm/notificacoes";

// Marca todas as notificações como lidas neste navegador.
export async function marcarNotificacoesLidas() {
  await garantirAdmin();
  (await cookies()).set(COOKIE_NOTIFICACOES, new Date().toISOString(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: true,
    httpOnly: true,
  });
  revalidatePath("/crm");
}
