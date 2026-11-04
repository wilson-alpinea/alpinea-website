-- =============================================================
-- Alpinea CRM — migração 038 (Wilson, 04/nov/2026)
-- Comissões por serviço vendido, em ienes (tabela "Comissão atualizada"):
-- - comissoes_tabela: valores da tabela padrão alterados no CRM (sem linha
--   = valor padrão do código, app/lib/comissaoTabela.ts).
-- - parceiros.comissao_itens / perfis.comissao_itens: exceções por empresa
--   parceira (PJ) ou consultor (PF/PJ) — { item_id: valor_jpy }.
-- - parceiros/perfis.margem_seguro_mult: preço final do seguro viagem no
--   link de venda do vendedor = custo × N% (padrão 250%).
-- - comissoes_vendas: serviços e quantidades de cada venda (cliente),
--   pré-preenchidos pela Calculadora Reversa e SEMPRE revisados e aprovados
--   à mão. Na aprovação fica uma foto (snapshot) dos valores e do câmbio.
-- Leitura e escrita só pelo servidor (service role), depois de checar a
-- equipe/admin. Rode DEPOIS da 037. É seguro rodar de novo.
-- =============================================================

create table if not exists public.comissoes_tabela (
  item_id text primary key,
  valor_jpy numeric(12, 2) not null check (valor_jpy >= 0),
  updated_at timestamptz not null default now(),
  updated_by_email text
);
alter table public.comissoes_tabela enable row level security;

alter table public.parceiros add column if not exists comissao_itens jsonb;
alter table public.perfis add column if not exists comissao_itens jsonb;
alter table public.parceiros add column if not exists margem_seguro_mult numeric(6, 1) check (margem_seguro_mult is null or margem_seguro_mult >= 100);
alter table public.perfis add column if not exists margem_seguro_mult numeric(6, 1) check (margem_seguro_mult is null or margem_seguro_mult >= 100);

create table if not exists public.comissoes_vendas (
  cliente_id uuid primary key references public.clientes (id) on delete cascade,
  quantidades jsonb not null default '{}'::jsonb,
  origem text not null default 'manual' check (origem in ('calculadora', 'manual')),
  status text not null default 'rascunho' check (status in ('rascunho', 'aprovada')),
  beneficiarios_excluidos jsonb not null default '[]'::jsonb,
  cotacao_brl_por_jpy numeric(12, 6),
  observacao text,
  snapshot jsonb,
  aprovado_em timestamptz,
  aprovado_por_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by_email text
);
create index if not exists comissoes_vendas_aprovadas_idx on public.comissoes_vendas (aprovado_em) where status = 'aprovada';
alter table public.comissoes_vendas enable row level security;

notify pgrst, 'reload schema';
