-- =============================================================
-- Alpinea CRM — schema do Supabase
-- =============================================================
-- Como usar:
-- 1. Crie um projeto em https://supabase.com (ou use um existente).
-- 2. Abra o SQL Editor do projeto e cole este arquivo inteiro.
-- 3. Rode uma vez. É seguro rodar de novo (usa "if not exists"/"or replace").
-- 4. Depois, crie os usuários colaboradores em
--    Authentication → Users → Add user (email + senha).
--    Um perfil em "perfis" é criado automaticamente para cada um.
-- =============================================================

-- ---------------------------------------------------------------
-- Perfis (um por colaborador, espelha auth.users)
-- ---------------------------------------------------------------
create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.perfis enable row level security;

drop policy if exists "perfis_select_autenticados" on public.perfis;
create policy "perfis_select_autenticados"
  on public.perfis for select
  to authenticated
  using (true);

-- Cria o perfil automaticamente quando um colaborador é criado no Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfis (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------
-- Estágios do funil comercial
-- ---------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'estagio_cliente') then
    create type public.estagio_cliente as enum (
      'novo_lead',
      'qualificacao',
      'proposta_enviada',
      'negociacao',
      'fechado_ganho',
      'fechado_perdido'
    );
  end if;
end $$;

-- ---------------------------------------------------------------
-- Clientes
-- ---------------------------------------------------------------
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  telefone text,
  origem text,
  tier text,
  destino_interesse text,
  valor_estimado numeric(12, 2),
  estagio public.estagio_cliente not null default 'novo_lead',
  responsavel_id uuid references public.perfis (id) on delete set null,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clientes_estagio_idx on public.clientes (estagio);
create index if not exists clientes_created_at_idx on public.clientes (created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clientes_set_updated_at on public.clientes;
create trigger clientes_set_updated_at
  before update on public.clientes
  for each row execute function public.set_updated_at();

alter table public.clientes enable row level security;

drop policy if exists "clientes_select_autenticados" on public.clientes;
create policy "clientes_select_autenticados"
  on public.clientes for select to authenticated using (true);

drop policy if exists "clientes_insert_autenticados" on public.clientes;
create policy "clientes_insert_autenticados"
  on public.clientes for insert to authenticated with check (true);

drop policy if exists "clientes_update_autenticados" on public.clientes;
create policy "clientes_update_autenticados"
  on public.clientes for update to authenticated using (true) with check (true);

drop policy if exists "clientes_delete_autenticados" on public.clientes;
create policy "clientes_delete_autenticados"
  on public.clientes for delete to authenticated using (true);

-- ---------------------------------------------------------------
-- Interações (histórico de contatos por cliente)
-- ---------------------------------------------------------------
create table if not exists public.interacoes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  autor_id uuid references public.perfis (id) on delete set null,
  tipo text not null default 'nota',
  conteudo text not null,
  created_at timestamptz not null default now()
);

create index if not exists interacoes_cliente_idx on public.interacoes (cliente_id, created_at desc);

alter table public.interacoes enable row level security;

drop policy if exists "interacoes_select_autenticados" on public.interacoes;
create policy "interacoes_select_autenticados"
  on public.interacoes for select to authenticated using (true);

drop policy if exists "interacoes_insert_autenticados" on public.interacoes;
create policy "interacoes_insert_autenticados"
  on public.interacoes for insert to authenticated with check (true);

drop policy if exists "interacoes_delete_autenticados" on public.interacoes;
create policy "interacoes_delete_autenticados"
  on public.interacoes for delete to authenticated using (true);
