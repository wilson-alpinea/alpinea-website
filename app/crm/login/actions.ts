"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { inicioDoPapel, isPapelCrm, unidadeDoHost } from "@/lib/crm/unidades";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/crm/login?erro=1");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect("/crm/login?erro=1");
  }

  // Vai direto para o início certo do papel e do domínio (crm./empregos.)
  // — evita redirect para outro domínio no meio da navegação.
  const { data: perfil } = await createAdminClient().from("perfis").select("papel").eq("id", data.user.id).maybeSingle();
  const papel = isPapelCrm(perfil?.papel) ? perfil!.papel : null;
  redirect(inicioDoPapel(papel, unidadeDoHost((await headers()).get("host"))));
}
