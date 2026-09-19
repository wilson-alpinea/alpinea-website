-- =============================================================
-- Alpinea CRM — migração 010
-- Cria a tabela de e-mails cadastrados na página /empregos pra
-- receber aviso quando novas vagas forem publicadas no catálogo —
-- pedido do Wilson, 19/set/2026: "Deseja ser notificado quando
-- abrir novas vagas?" + "crie um codigo para ele registrar o email
-- no mailing".
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase (depois de já ter
-- rodado supabase/schema.sql e as migrações anteriores). É seguro
-- rodar de novo (usa "if not exists"/"or replace").
-- =============================================================

create table if not exists public.mailing_vagas (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  origem text not null default 'empregos_notificacao',
  created_at timestamptz not null default now()
);

-- Um e-mail não precisa aparecer duas vezes na lista — se a pessoa
-- preencher de novo, o insert do endpoint faz upsert (ver
-- app/api/empregos-mailing/route.ts, onConflict: "email") em vez de
-- duplicar a linha. A normalização pra minúsculas acontece no próprio
-- endpoint antes de gravar, então a unicidade pode ser uma constraint
-- simples na coluna (o upsert do supabase-js precisa que o "onConflict"
-- bata com uma constraint/índice de coluna "de verdade", não uma
-- expressão como lower(email)).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mailing_vagas_email_key'
  ) then
    alter table public.mailing_vagas
      add constraint mailing_vagas_email_key unique (email);
  end if;
end $$;

create index if not exists mailing_vagas_created_at_idx on public.mailing_vagas (created_at);

alter table public.mailing_vagas enable row level security;

-- Mesmo padrão das outras tabelas do CRM: só a equipe logada
-- (authenticated) enxerga/gerencia a lista. O formulário público em
-- /empregos não faz login, então o insert dele acontece pelo cliente
-- admin (service role) no Route Handler, que ignora RLS — ver
-- lib/supabase/admin.ts.
drop policy if exists "mailing_vagas_select_autenticados" on public.mailing_vagas;
create policy "mailing_vagas_select_autenticados"
  on public.mailing_vagas for select to authenticated using (true);

drop policy if exists "mailing_vagas_insert_autenticados" on public.mailing_vagas;
create policy "mailing_vagas_insert_autenticados"
  on public.mailing_vagas for insert to authenticated with check (true);

drop policy if exists "mailing_vagas_delete_autenticados" on public.mailing_vagas;
create policy "mailing_vagas_delete_autenticados"
  on public.mailing_vagas for delete to authenticated using (true);
