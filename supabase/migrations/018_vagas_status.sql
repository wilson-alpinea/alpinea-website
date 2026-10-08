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
