-- =============================================================
-- Alpinea CRM — migração 021
-- Unidades de negócio separadas + acesso de parceiros (Wilson, 21/out/2026):
-- "1 CRM somente agência de viagens e 1 somente para empregos";
-- empresas parceiras veem SOMENTE os leads gerados por elas; empreiteiras
-- veem o pipeline dos candidatos das vagas delas. Admin continua vendo tudo.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase. É seguro rodar de novo.
--
-- MODELO DE SEGURANÇA
-- - perfis.papel: 'admin' | 'parceiro_agencia' | 'empreiteira' | null.
--   null = sem acesso (usuário novo criado direto no painel do Supabase
--   fica bloqueado até um admin liberar em /crm/acessos).
-- - Todas as tabelas do schema public e o storage passam a ter uma política
--   RESTRITIVA "admin only" para o papel authenticated. Políticas
--   restritivas somam (AND) com as permissivas já existentes, então nada
--   muda para o admin e parceiros não leem nada direto pela API REST.
-- - Os portais de parceiro/empreiteira leem os dados no servidor (service
--   role), filtrando pelo parceiro do usuário logado e devolvendo só as
--   colunas liberadas — ver lib/crm/acesso.ts e app/crm/parceiro,
--   app/crm/empreiteira.
-- - O site público (formulários self-service) usa service role e não é
--   afetado.
-- =============================================================

-- ---------------------------------------------------------------
-- Parceiros (empresas parceiras da agência e empreiteiras)
-- ---------------------------------------------------------------
create table if not exists public.parceiros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  -- usado no link de indicação: alpinea.io/?parceiro=<slug>
  slug text not null,
  tipo text not null check (tipo in ('agencia', 'empreiteira')),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'parceiros_slug_key') then
    alter table public.parceiros add constraint parceiros_slug_key unique (slug);
  end if;
end $$;

alter table public.parceiros enable row level security;

drop policy if exists "parceiros_select_autenticados" on public.parceiros;
create policy "parceiros_select_autenticados"
  on public.parceiros for select to authenticated using (true);
drop policy if exists "parceiros_insert_autenticados" on public.parceiros;
create policy "parceiros_insert_autenticados"
  on public.parceiros for insert to authenticated with check (true);
drop policy if exists "parceiros_update_autenticados" on public.parceiros;
create policy "parceiros_update_autenticados"
  on public.parceiros for update to authenticated using (true) with check (true);
drop policy if exists "parceiros_delete_autenticados" on public.parceiros;
create policy "parceiros_delete_autenticados"
  on public.parceiros for delete to authenticated using (true);

-- ---------------------------------------------------------------
-- Papel de cada usuário do CRM
-- ---------------------------------------------------------------
alter table public.perfis
  add column if not exists papel text,
  add column if not exists parceiro_id uuid references public.parceiros (id) on delete set null;

alter table public.perfis drop constraint if exists perfis_papel_check;
alter table public.perfis
  add constraint perfis_papel_check check (papel is null or papel in ('admin', 'parceiro_agencia', 'empreiteira'));

-- Usuários que já existiam sem perfil (criados antes do trigger).
insert into public.perfis (id, email, nome)
select u.id, u.email, split_part(u.email, '@', 1)
from auth.users u
where not exists (select 1 from public.perfis p where p.id = u.id)
on conflict (id) do nothing;

-- Toda a equipe atual vira admin. Roda só uma vez: depois que existir
-- qualquer papel definido, este update não mexe em mais ninguém.
do $$
begin
  if not exists (select 1 from public.perfis where papel is not null) then
    update public.perfis set papel = 'admin';
  end if;
end $$;

-- ---------------------------------------------------------------
-- Funções de apoio para as políticas
-- ---------------------------------------------------------------
create or replace function public.crm_papel()
returns text
language sql
stable
security definer set search_path = public
as $$
  select papel from public.perfis where id = auth.uid();
$$;

create or replace function public.crm_is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select papel = 'admin' from public.perfis where id = auth.uid()), false);
$$;

create or replace function public.crm_parceiro_id()
returns uuid
language sql
stable
security definer set search_path = public
as $$
  select parceiro_id from public.perfis where id = auth.uid();
$$;

revoke all on function public.crm_papel() from public, anon;
revoke all on function public.crm_is_admin() from public, anon;
revoke all on function public.crm_parceiro_id() from public, anon;
grant execute on function public.crm_papel() to authenticated;
grant execute on function public.crm_is_admin() to authenticated;
grant execute on function public.crm_parceiro_id() to authenticated;

-- ---------------------------------------------------------------
-- Lead gerado por parceiro (agência)
-- ---------------------------------------------------------------
alter table public.clientes
  add column if not exists parceiro_id uuid references public.parceiros (id) on delete set null;
create index if not exists clientes_parceiro_id_idx on public.clientes (parceiro_id);

-- Arquivar leads inativos (Wilson, 21/out/2026): só admin. Arquivado sai
-- do pipeline e da lista de clientes, mas nada é apagado.
alter table public.clientes
  add column if not exists arquivado_em timestamptz,
  add column if not exists arquivado_por uuid references public.perfis (id) on delete set null;
create index if not exists clientes_arquivado_em_idx on public.clientes (arquivado_em);

-- ---------------------------------------------------------------
-- Vagas de cada empreiteira (vagas vivem no catálogo em código,
-- app/lib/vagasCatalogo.ts — aqui só o vínculo vaga → empreiteira)
-- ---------------------------------------------------------------
create table if not exists public.vagas_empreiteira (
  vaga_id text primary key,
  parceiro_id uuid not null references public.parceiros (id) on delete cascade,
  updated_at timestamptz not null default now()
);
create index if not exists vagas_empreiteira_parceiro_idx on public.vagas_empreiteira (parceiro_id);

alter table public.vagas_empreiteira enable row level security;

drop policy if exists "vagas_empreiteira_all_autenticados" on public.vagas_empreiteira;
create policy "vagas_empreiteira_all_autenticados"
  on public.vagas_empreiteira for all to authenticated using (true) with check (true);

-- Data prevista de embarque do candidato (preenchida pela equipe).
alter table public.candidaturas_vagas
  add column if not exists data_embarque_prevista date;

-- ---------------------------------------------------------------
-- Políticas RESTRITIVAS: só admin lê/escreve pelo papel authenticated.
-- Exceções: perfis e parceiros (cada usuário lê a própria linha) e
-- vagas_status (lista pública de vagas ativas).
-- ---------------------------------------------------------------
do $$
declare
  t text;
begin
  for t in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
      -- vagas_status é público (o site lê com a chave anônima).
      and c.relname not in ('perfis', 'parceiros', 'vagas_status')
  loop
    execute format('drop policy if exists "unidade_somente_admin" on public.%I', t);
    execute format(
      'create policy "unidade_somente_admin" on public.%I as restrictive for all to authenticated using (public.crm_is_admin()) with check (public.crm_is_admin())',
      t
    );
  end loop;
end $$;

-- perfis: cada um lê o próprio; o resto só admin.
drop policy if exists "unidade_perfis_select" on public.perfis;
create policy "unidade_perfis_select"
  on public.perfis as restrictive for select to authenticated
  using (public.crm_is_admin() or id = auth.uid());
drop policy if exists "unidade_perfis_escrita" on public.perfis;
create policy "unidade_perfis_escrita"
  on public.perfis as restrictive for update to authenticated
  using (public.crm_is_admin()) with check (public.crm_is_admin());

-- parceiros: cada um lê o próprio cadastro; escrita só admin.
drop policy if exists "unidade_parceiros_select" on public.parceiros;
create policy "unidade_parceiros_select"
  on public.parceiros as restrictive for select to authenticated
  using (public.crm_is_admin() or id = public.crm_parceiro_id());
drop policy if exists "unidade_parceiros_insert" on public.parceiros;
create policy "unidade_parceiros_insert"
  on public.parceiros as restrictive for insert to authenticated
  with check (public.crm_is_admin());
drop policy if exists "unidade_parceiros_update" on public.parceiros;
create policy "unidade_parceiros_update"
  on public.parceiros as restrictive for update to authenticated
  using (public.crm_is_admin()) with check (public.crm_is_admin());
drop policy if exists "unidade_parceiros_delete" on public.parceiros;
create policy "unidade_parceiros_delete"
  on public.parceiros as restrictive for delete to authenticated
  using (public.crm_is_admin());

-- Storage (currículos, fotos, arquivos de clientes, documentos JR Pass):
-- pelo papel authenticated, só admin. Portais usam URL assinada gerada
-- no servidor depois de conferir a posse do arquivo.
drop policy if exists "unidade_storage_somente_admin" on storage.objects;
create policy "unidade_storage_somente_admin"
  on storage.objects as restrictive for all to authenticated
  using (public.crm_is_admin()) with check (public.crm_is_admin());
