-- =============================================================
-- Alpinea CRM — migração 006
-- Cria a tabela de pagamentos (fluxo financeiro por cliente):
-- tipo de pagamento, parcelas e status (pago/pendente/atrasado).
-- Alimenta a seção "Financeiro" na ficha do cliente.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase (depois de já ter
-- rodado supabase/schema.sql e as migrações anteriores). É seguro
-- rodar de novo (usa "if not exists"/"or replace").
-- =============================================================

create table if not exists public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  tipo_pagamento text,
  numero_parcela integer not null default 1,
  total_parcelas integer not null default 1,
  valor numeric(12, 2) not null,
  status text not null default 'pendente',
  data_vencimento date,
  data_pagamento date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pagamentos_tipo_pagamento_check'
  ) then
    alter table public.pagamentos
      add constraint pagamentos_tipo_pagamento_check
      check (
        tipo_pagamento is null or tipo_pagamento in (
          'pix',
          'cartao_credito',
          'cartao_debito',
          'transferencia',
          'boleto',
          'dinheiro',
          'outro'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pagamentos_status_check'
  ) then
    alter table public.pagamentos
      add constraint pagamentos_status_check
      check (status in ('pendente', 'pago', 'atrasado', 'cancelado'));
  end if;
end $$;

create index if not exists pagamentos_cliente_idx on public.pagamentos (cliente_id, numero_parcela);

drop trigger if exists pagamentos_set_updated_at on public.pagamentos;
create trigger pagamentos_set_updated_at
  before update on public.pagamentos
  for each row execute function public.set_updated_at();

alter table public.pagamentos enable row level security;

drop policy if exists "pagamentos_select_autenticados" on public.pagamentos;
create policy "pagamentos_select_autenticados"
  on public.pagamentos for select to authenticated using (true);

drop policy if exists "pagamentos_insert_autenticados" on public.pagamentos;
create policy "pagamentos_insert_autenticados"
  on public.pagamentos for insert to authenticated with check (true);

drop policy if exists "pagamentos_update_autenticados" on public.pagamentos;
create policy "pagamentos_update_autenticados"
  on public.pagamentos for update to authenticated using (true) with check (true);

drop policy if exists "pagamentos_delete_autenticados" on public.pagamentos;
create policy "pagamentos_delete_autenticados"
  on public.pagamentos for delete to authenticated using (true);
