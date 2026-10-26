-- =============================================================
-- Alpinea CRM — migração 025
-- CRM de Seguro Viagem (Wilson, 26/out/2026): terceiro CRM interno, só
-- para seguro viagem (seguro.alpinea.io). Cada compra feita em
-- /produtos/seguro-viagem vira um pedido aqui — não cria mais cliente no
-- CRM da Agência.
--
-- Etapas: link_enviado → pago → apolice_recebida → apolice_enviada →
-- concluido; cancelado a qualquer momento. A API da Real Seguro Viagem não
-- tem webhook: a equipe confirma o pagamento manualmente.
--
-- No fim, os pedidos de seguro antigos que estavam como cliente na
-- Agência são copiados para cá e arquivados lá (nada é apagado).
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase, depois da 024.
-- É seguro rodar de novo ("if not exists" / "not exists").
-- =============================================================

create table if not exists public.seguro_pedidos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  etapa text not null default 'link_enviado'
    check (etapa in ('link_enviado', 'pago', 'apolice_recebida', 'apolice_enviada', 'concluido', 'cancelado')),
  -- Comprador
  nome text not null,
  email text,
  telefone text,
  -- Plano
  fornecedor text,
  plano text,
  seguradora text,
  partida date,
  retorno date,
  viajantes jsonb not null default '[]'::jsonb, -- [{nome, nascimento, idade, documento, tipo_documento}]
  -- Valores (R$)
  valor_cliente numeric(12, 2),
  custo numeric(12, 2),
  margem_pct numeric(6, 2),
  -- Pagamento e apólice
  link_pagamento text,
  aviso_fornecedor text,
  observacoes_cliente text,
  pago_em timestamptz,
  apolice_recebida_em timestamptz,
  apolice_enviada_em timestamptz,
  numero_apolice text,
  motivo_cancelamento text,
  -- Equipe
  notas text,
  historico jsonb not null default '[]'::jsonb, -- [{em, por, tipo, de?, para?, texto?}]
  -- Origem do lead
  parceiro_id uuid references public.parceiros (id) on delete set null,
  canal text,
  canal_detalhe text,
  utm jsonb,
  checkout_ip text,
  checkout_user_agent text,
  termos_versao text,
  termos_aceitos_em timestamptz,
  -- Pedido antigo trazido do CRM da Agência
  cliente_origem_id uuid unique references public.clientes (id) on delete set null
);

create index if not exists seguro_pedidos_etapa_idx on public.seguro_pedidos (etapa);
create index if not exists seguro_pedidos_created_idx on public.seguro_pedidos (created_at desc);

-- Só o servidor (service role) lê e escreve; o CRM confere se é admin antes.
alter table public.seguro_pedidos enable row level security;

-- Pedidos antigos: clientes da Agência com origem "Seguro Viagem".
insert into public.seguro_pedidos
  (created_at, etapa, nome, email, telefone, fornecedor, partida, valor_cliente, notas, parceiro_id, canal, canal_detalhe, utm,
   checkout_ip, checkout_user_agent, termos_versao, termos_aceitos_em, cliente_origem_id, historico)
select
  c.created_at,
  case
    when c.estagio::text = 'fechado_ganho' then 'pago'
    when c.estagio::text = 'fechado_perdido' then 'cancelado'
    else 'link_enviado'
  end,
  c.nome, c.email, c.telefone,
  case when c.origem ilike '%Real Seguro%' then 'Real Seguro Viagem' else 'Stone (fluxo antigo)' end,
  c.data_viagem, c.valor_proposta, c.observacoes, c.parceiro_id, c.canal, c.canal_detalhe, c.utm,
  c.checkout_ip, c.checkout_user_agent, c.termos_versao, c.termos_aceitos_em, c.id,
  jsonb_build_array(jsonb_build_object('em', now(), 'por', 'sistema', 'tipo', 'nota',
    'texto', 'Pedido trazido do CRM da Agência (estágio lá: ' || coalesce(c.estagio::text, '—') || ').'))
from public.clientes c
where c.origem ilike '%Seguro Viagem%'
  and not exists (select 1 from public.seguro_pedidos s where s.cliente_origem_id = c.id);

-- Arquiva na Agência os que já foram copiados (continuam lá, só arquivados).
update public.clientes c
set arquivado_em = coalesce(c.arquivado_em, now())
where c.origem ilike '%Seguro Viagem%'
  and exists (select 1 from public.seguro_pedidos s where s.cliente_origem_id = c.id);
