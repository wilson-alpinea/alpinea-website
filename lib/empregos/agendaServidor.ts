import { createAdminClient } from "@/lib/supabase/admin";
import { CONFIG_PADRAO, gerarHorarios, hojeBrasilia, type Bloqueio, type ConfigAgenda, type Janela } from "@/app/lib/agendaEntrevista";

// Lê a agenda (config + janelas + bloqueios + ocupados) e devolve os
// horários livres — só servidor (cliente admin).
export async function horariosDisponiveis() {
  const supabase = createAdminClient();
  const hoje = hojeBrasilia();
  const [{ data: cfg }, { data: janelas }, { data: bloqueios }, { data: ocupados }] = await Promise.all([
    supabase.from("entrevista_config").select("*").eq("id", 1).maybeSingle(),
    supabase.from("entrevista_janelas").select("dia_semana, inicio, fim"),
    supabase.from("entrevista_bloqueios").select("data, inicio, fim").gte("data", hoje),
    supabase.from("entrevistas_agendadas").select("inicio").eq("status", "agendada").gte("inicio", new Date().toISOString()),
  ]);
  const config: ConfigAgenda = { ...CONFIG_PADRAO, ...(cfg ?? {}) };
  return {
    config,
    horarios: gerarHorarios({
      config,
      janelas: (janelas ?? []) as Janela[],
      bloqueios: (bloqueios ?? []) as Bloqueio[],
      ocupados: (ocupados ?? []).map((o) => o.inicio as string),
    }),
  };
}
