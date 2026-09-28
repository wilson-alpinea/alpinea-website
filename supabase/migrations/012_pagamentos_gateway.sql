-- =============================================================
-- Alpinea CRM — migração 012
-- Integração de pagamento online (Stone/Pagar.me): adiciona à tabela
-- de pagamentos as colunas que ligam uma parcela ao pedido criado no
-- gateway, pra o webhook conseguir achar e atualizar o registro certo
-- quando o cliente paga.
--
-- Pedido do Wilson, 28/set/2026: "vamos integrar a stone (pagar.me)
-- para processar os nossos produtos online como JR Pass" — começando
-- pelo self-checkout de JR Pass em /produtos (ver
-- app/api/jrpass-selfservice/route.ts e app/api/webhooks/pagarme).
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase (depois da migração
-- 006_pagamentos.sql). É seguro rodar de novo (usa "if not exists").
-- =============================================================

alter table public.pagamentos
  add column if not exists gateway text,
  add column if not exists gateway_pedido_id text,
  add column if not exists gateway_checkout_url text,
  add column if not exists gateway_status text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pagamentos_gateway_check'
  ) then
    alter table public.pagamentos
      add constraint pagamentos_gateway_check
      check (gateway is null or gateway in ('pagarme'));
  end if;
end $$;

-- Índice único (parcial — só quando preenchido) pra o webhook achar a
-- parcela certa pelo id do pedido no gateway sem duplicar.
create unique index if not exists pagamentos_gateway_pedido_idx
  on public.pagamentos (gateway_pedido_id)
  where gateway_pedido_id is not null;
