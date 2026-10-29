-- =============================================================
-- Alpinea CRM — migração 028
-- Pagamento online dos processos de Documentação pela Stone/Pagar.me
-- (Wilson, 29/out/2026: "pagamento vai ser o mesmo que usamos da Stone no
-- site de alpinea.io/produtos"). Mesmo link de pagamento e mesmo webhook
-- (app/api/webhooks/pagarme) dos produtos; como o CRM de Documentação é
-- separado da Agência, as parcelas ficam numa tabela própria.
-- =============================================================
-- Rode depois da 027. É seguro rodar de novo.
-- =============================================================

-- Valor fechado pela equipe, em número (o texto valor_final continua para
-- exibição). Visto e pet em reais; Certificado de Elegibilidade em ienes,
-- cobrado em reais pela PTAX do dia de cada parcela.
alter table public.documentacao_processos
  add column if not exists valor_total numeric(12, 2),
  add column if not exists valor_moeda text not null default 'BRL';

alter table public.documentacao_processos drop constraint if exists documentacao_processos_valor_moeda_check;
alter table public.documentacao_processos
  add constraint documentacao_processos_valor_moeda_check check (valor_moeda in ('BRL', 'JPY'));

create table if not exists public.documentacao_pagamentos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  processo_id uuid not null references public.documentacao_processos (id) on delete cascade,
  parcela integer not null default 1,        -- COE: 1 = primeiros 50%, 2 = segundos 50%
  valor_brl numeric(12, 2) not null,
  valor_jpy numeric(12, 0),
  cotacao_brl_por_jpy numeric(12, 6),
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'cancelado')),
  gateway text not null default 'pagarme',
  gateway_pedido_id text,
  gateway_checkout_url text,
  gateway_status text,
  forma_pagamento text,
  pago_em timestamptz
);

create index if not exists documentacao_pagamentos_processo_idx on public.documentacao_pagamentos (processo_id, parcela);

-- Só o servidor (service role) lê e escreve.
alter table public.documentacao_pagamentos enable row level security;
