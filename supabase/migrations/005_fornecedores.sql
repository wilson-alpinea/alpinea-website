-- =============================================================
-- Alpinea CRM — migração 005
-- Cria a tabela de fornecedores (hotéis, transporte, guias,
-- restaurantes etc.) — cadastro simples, sem funil, ao lado de
-- "Clientes" no menu do CRM.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase (depois de já ter
-- rodado supabase/schema.sql e as migrações anteriores). É seguro
-- rodar de novo (usa "if not exists"/"or replace").
-- =============================================================

create table if not exists public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text,
  contato_nome text,
  email text,
  telefone text,
  cidade text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fornecedores_categoria_check'
  ) then
    alter table public.fornecedores
      add constraint fornecedores_categoria_check
      check (
        categoria is null or categoria in (
          'hotel',
          'transporte',
          'guia',
          'restaurante',
          'passeio_atracao',
          'seguro_viagem',
          'cambio',
          'outro'
        )
      );
  end if;
end $$;

create index if not exists fornecedores_categoria_idx on public.fornecedores (categoria);
create index if not exists fornecedores_created_at_idx on public.fornecedores (created_at);

drop trigger if exists fornecedores_set_updated_at on public.fornecedores;
create trigger fornecedores_set_updated_at
  before update on public.fornecedores
  for each row execute function public.set_updated_at();

alter table public.fornecedores enable row level security;

drop policy if exists "fornecedores_select_autenticados" on public.fornecedores;
create policy "fornecedores_select_autenticados"
  on public.fornecedores for select to authenticated using (true);

drop policy if exists "fornecedores_insert_autenticados" on public.fornecedores;
create policy "fornecedores_insert_autenticados"
  on public.fornecedores for insert to authenticated with check (true);

drop policy if exists "fornecedores_update_autenticados" on public.fornecedores;
create policy "fornecedores_update_autenticados"
  on public.fornecedores for update to authenticated using (true) with check (true);

drop policy if exists "fornecedores_delete_autenticados" on public.fornecedores;
create policy "fornecedores_delete_autenticados"
  on public.fornecedores for delete to authenticated using (true);
