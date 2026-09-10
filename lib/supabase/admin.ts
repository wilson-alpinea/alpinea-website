import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase "admin" — usa a service role key, que ignora Row Level
// Security. Só pode ser importado em código que roda no servidor (Route
// Handlers), NUNCA em Client Components: a service role key dá acesso
// total ao banco e não pode vazar pro navegador (por isso ela não tem o
// prefixo NEXT_PUBLIC_, diferente da publishable key usada em
// lib/supabase/client.ts e lib/supabase/server.ts).
//
// Motivo de existir: as policies de RLS de `clientes`/`interacoes` (ver
// supabase/schema.sql) só liberam insert/select/update para o papel
// "authenticated" — ou seja, só colaboradores logados no CRM. Formulários
// públicos (preenchidos por clientes externos, sem login) precisam desse
// cliente admin pra conseguir registrar o lead.
//
// Configuração: pegue a "service_role" key em Project Settings → API →
// Project API keys no painel do Supabase (é secreta — nunca é a mesma
// coisa que a publishable key) e coloque em SUPABASE_SERVICE_ROLE_KEY no
// .env.local (local) e nas variáveis de ambiente do Vercel (produção).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client não configurado — faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente.",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
