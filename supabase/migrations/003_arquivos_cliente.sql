-- =============================================================
-- Alpinea CRM — migração 003
-- Arquivos/links associados a um cliente (drafts de roteiro,
-- propostas, contratos etc.), exibidos no rodapé da ficha do cliente.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase.
-- =============================================================

create table if not exists public.arquivos_cliente (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  tipo text not null default 'roteiro_draft',
  label text not null,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists arquivos_cliente_cliente_idx on public.arquivos_cliente (cliente_id, created_at desc);

alter table public.arquivos_cliente
  add constraint arquivos_cliente_tipo_check
  check (tipo in ('roteiro_draft', 'proposta', 'contrato', 'outro'));

alter table public.arquivos_cliente enable row level security;

drop policy if exists "arquivos_cliente_select_autenticados" on public.arquivos_cliente;
create policy "arquivos_cliente_select_autenticados"
  on public.arquivos_cliente for select to authenticated using (true);

drop policy if exists "arquivos_cliente_insert_autenticados" on public.arquivos_cliente;
create policy "arquivos_cliente_insert_autenticados"
  on public.arquivos_cliente for insert to authenticated with check (true);

drop policy if exists "arquivos_cliente_delete_autenticados" on public.arquivos_cliente;
create policy "arquivos_cliente_delete_autenticados"
  on public.arquivos_cliente for delete to authenticated using (true);
