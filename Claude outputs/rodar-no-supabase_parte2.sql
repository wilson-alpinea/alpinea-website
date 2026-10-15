-- PARTE 2 — rodar depois da parte 1 (o fim da 017, a 018 e a 019).

-- RLS: equipe logada gerencia tudo; o fluxo público usa o cliente admin.
do $$
declare t text;
begin
  foreach t in array array['entrevista_config', 'entrevista_janelas', 'entrevista_bloqueios', 'entrevistas_agendadas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_autenticados', t);
    execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)', t || '_autenticados', t);
  end loop;
end $$;

notify pgrst, 'reload schema';

-- ===================== supabase/migrations/018_vagas_status.sql =====================
-- =============================================================
-- Alpinea CRM — migração 018 (Wilson, 07/out/2026)
-- Liga/desliga cada vaga do catálogo (app/lib/vagasCatalogo.ts) no site,
-- a partir de /crm/empregos/vagas: "criar um link interno onde
-- conseguimos rapidamente ativar e desativar as vagas vendo elas no
-- formato de lista tick box".
--
-- Só guarda o que foi alterado: vaga sem linha aqui = ATIVA. Assim uma
-- vaga nova cadastrada no catálogo já aparece no site sem passar pelo
-- CRM, e o site continua mostrando tudo se esta migração ainda não
-- tiver rodado.
-- Rode DEPOIS da 017. É seguro rodar de novo.
-- =============================================================

create table if not exists public.vagas_status (
  vaga_id text primary key,
  ativa boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.vagas_status enable row level security;

-- Leitura pública: o site (sem login) precisa saber quais vagas esconder.
-- A tabela só tem id da vaga + ligado/desligado, nada sensível.
drop policy if exists "vagas_status_select_todos" on public.vagas_status;
create policy "vagas_status_select_todos"
  on public.vagas_status for select to anon, authenticated using (true);

-- Escrita só pela equipe logada no CRM.
drop policy if exists "vagas_status_insert_autenticados" on public.vagas_status;
create policy "vagas_status_insert_autenticados"
  on public.vagas_status for insert to authenticated with check (true);

drop policy if exists "vagas_status_update_autenticados" on public.vagas_status;
create policy "vagas_status_update_autenticados"
  on public.vagas_status for update to authenticated using (true) with check (true);

-- ===================== supabase/migrations/019_candidaturas_testes_aptidao.sql =====================
-- =============================================================
-- Alpinea CRM — migração 019
-- Testes de aptidão online (visão, matemática, decimais, comparação,
-- hanamaru e japonês) das vagas com `testesAptidao: true` no catálogo —
-- etapa própria entre o match de 80%+ e a ficha cadastral
-- (Wilson, 08/out/2026). Formato em app/lib/testesAptidao.ts.
-- Rode DEPOIS da 018. É seguro rodar de novo.
-- =============================================================

alter table public.candidaturas_vagas
  -- Inícios (relógio do servidor), respostas e correção de cada teste.
  add column if not exists testes_aptidao jsonb,
  -- null enquanto não terminou; true/false quando todos os testes foram feitos.
  add column if not exists testes_aptidao_aprovado boolean;

notify pgrst, 'reload schema';
