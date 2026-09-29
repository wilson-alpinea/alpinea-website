-- =============================================================
-- Alpinea CRM — migração 014
-- Nome do comprador, quando diferente do passageiro (JR Pass
-- self-checkout, e qualquer outro self-checkout que venha a usar o
-- mesmo padrão) — evidência adicional pra defesa de chargeback.
--
-- Pedido do Wilson, 29/set/2026, como parte do mesmo pedido que gerou
-- a migração 013 ("nome do passageiro + nome do comprador"). Na
-- migração 013 esse campo tinha ficado de fora por depender de uma
-- decisão de produto (campo separado no formulário ou não) — decidido
-- em seguida: sim, campo separado e opcional.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase (depois da 013). É
-- seguro rodar de novo (usa "if not exists").
-- =============================================================

alter table public.clientes
  add column if not exists nome_comprador text;

comment on column public.clientes.nome_comprador is
  'Nome de quem está pagando o pedido, quando diferente do passageiro (clientes.nome). Vazio/nulo quando comprador e passageiro são a mesma pessoa.';
