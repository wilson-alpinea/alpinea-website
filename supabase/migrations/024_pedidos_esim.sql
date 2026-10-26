-- =============================================================
-- Alpinea CRM — migração 024
-- eSIM automatizado (Wilson, 26/out/2026): o cliente compra o eSIM em
-- /produtos/esim, paga pela Stone/Pagar.me e, quando o webhook confirma o
-- pagamento, o site cria o pedido na API de Parceiro da Simpremium
-- (POST /api/partner/v1/orders/chip, paymentMethod "invoiced" — faturado;
-- a Ajisai não mantém saldo pré-pago na Simpremium).
--
-- Uma linha por eSIM (um por celular). O webhook "reserva" cada linha
-- (aguardando_pagamento → processando) antes de chamar a Simpremium, para
-- que um reenvio do webhook nunca crie o mesmo eSIM duas vezes.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase, depois da 023.
-- É seguro rodar de novo ("if not exists").
-- =============================================================

create table if not exists public.pedidos_esim (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  pagamento_id uuid references public.pagamentos (id) on delete set null,
  indice integer not null default 1,
  -- Plano e período pedidos à Simpremium
  plano_id text not null,
  plano_nome text,
  dias integer not null check (dias > 0),
  data_inicio date not null,
  -- Cliente final (vai no pedido da Simpremium)
  nome_cliente text not null,
  email_cliente text not null,
  telefone_cliente text,
  cpf_cliente text,
  -- Valores no momento da compra
  net_usd numeric(12, 2),
  preco_usd numeric(12, 2),
  preco_brl numeric(12, 2),
  cotacao_usd numeric(10, 4),
  -- Andamento
  status text not null default 'aguardando_pagamento'
    check (status in ('aguardando_pagamento', 'processando', 'pedido_criado', 'erro', 'cancelado')),
  simpremium_pedido_id text,
  simpremium_order_number text,
  simpremium_status text,
  iccid text,
  erro text,
  tentativas integer not null default 0
);

create index if not exists pedidos_esim_pagamento_idx on public.pedidos_esim (pagamento_id);
create index if not exists pedidos_esim_cliente_idx on public.pedidos_esim (cliente_id);
create index if not exists pedidos_esim_status_idx on public.pedidos_esim (status);

-- Só o servidor (service role) lê e escreve — nenhuma política para anon/
-- authenticated. O CRM lê pelo cliente admin, como o resto do financeiro.
alter table public.pedidos_esim enable row level security;
