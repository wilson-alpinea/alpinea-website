"use server";

import { revalidatePath } from "next/cache";
import { garantirAdmin } from "@/lib/crm/acesso";
import { ESTAGIO_LABEL, isEstagio } from "@/lib/crm/estagios";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// CRM de Câmbio (Wilson, 29/out/2026): os pedidos continuam em `clientes`
// (produto_secundario contém "cambio"); aqui só muda a etapa e grava notas.
const UUID = /^[0-9a-f-]{36}$/i;

async function autor() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  return user?.id ?? null;
}

export async function moverEtapaCambio(id: string, formData: FormData) {
  await garantirAdmin();
  const estagio = String(formData.get("estagio") ?? "");
  if (!UUID.test(id) || !isEstagio(estagio)) return;
  const admin = createAdminClient();
  const { error } = await admin.from("clientes").update({ estagio }).eq("id", id);
  if (error) {
    console.error("Erro ao mover etapa (câmbio):", error);
    return;
  }
  await admin.from("interacoes").insert({ cliente_id: id, autor_id: await autor(), tipo: "nota", conteudo: `Etapa do câmbio alterada para ${ESTAGIO_LABEL[estagio]}.` });
  revalidatePath("/crm/cambio");
  revalidatePath(`/crm/cambio/${id}`);
}

export async function notaCambio(id: string, formData: FormData) {
  await garantirAdmin({ cadastrar: true });
  const conteudo = String(formData.get("conteudo") ?? "").trim().slice(0, 4000);
  if (!UUID.test(id) || !conteudo) return;
  const { error } = await createAdminClient().from("interacoes").insert({ cliente_id: id, autor_id: await autor(), tipo: "nota", conteudo });
  if (error) console.error("Erro ao gravar nota (câmbio):", error);
  revalidatePath(`/crm/cambio/${id}`);
}
