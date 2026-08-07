-- =============================================================
-- Alpinea CRM — migração 002
-- Remove "tier" e "destino de interesse", renomeia "valor_estimado"
-- para "valor_proposta" e adiciona produto principal, produto(s)
-- secundário(s) e data da viagem.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase (depois de já ter
-- rodado supabase/schema.sql). Não é seguro rodar duas vezes.
-- =============================================================

alter table public.clientes
  drop column if exists tier,
  drop column if exists destino_interesse;

alter table public.clientes
  rename column valor_estimado to valor_proposta;

alter table public.clientes
  add column if not exists produto_principal text,
  add column if not exists produto_secundario text[] not null default '{}',
  add column if not exists data_viagem date;

alter table public.clientes
  add constraint clientes_produto_principal_check
  check (
    produto_principal is null or produto_principal in (
      'roteiro_personalizado',
      'revisao_roteiro',
      'caravana',
      'semi_full_service',
      'full_service'
    )
  );

alter table public.clientes
  add constraint clientes_produto_secundario_check
  check (
    produto_secundario <@ array[
      'jr_pass',
      'seguro_viagem',
      'guia',
      'motorista_particular',
      'reserva_restaurantes',
      'acompanhamento_restaurantes',
      'acompanhamento_compras'
    ]::text[]
  );
