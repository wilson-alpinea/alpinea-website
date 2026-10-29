-- ===== Documentação: migrações 026 + 027 + 028 (rodar tudo de uma vez; é seguro repetir) =====

-- ---------- 026_documentacao_processos ----------

create table if not exists public.documentacao_processos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  servico text not null check (servico in ('visto', 'elegibilidade', 'pet')),
  etapa text not null default 'novo'
    check (etapa in ('novo', 'em_analise', 'pre_aprovado', 'contratado', 'documentacao', 'protocolado', 'concluido', 'nao_atende', 'negado', 'cancelado')),
  -- Solicitante / tutor
  nome text not null,
  email text,
  telefone text,
  -- Cadastro
  resumo text,
  respostas jsonb not null default '[]'::jsonb,  -- [[pergunta, resposta], ...] como o cliente viu
  campos jsonb not null default '{}'::jsonb,     -- {id_da_pergunta: resposta} — base para filtros e scoring
  -- Valores
  valor_referencia_brl numeric(12, 2),           -- o que o site mostrou (simulação)
  valor_final text,                              -- valor fechado pela equipe (pode ser em ienes)
  -- Marcos
  pago_em timestamptz,
  protocolado_em timestamptz,
  concluido_em timestamptz,
  motivo_saida text,
  -- Aceite dos termos no site (até existir o contrato digital)
  termos_versao text,
  termos_aceitos_em timestamptz,
  aceites jsonb not null default '[]'::jsonb,
  checkout_ip text,
  checkout_user_agent text,
  -- Origem do lead
  parceiro_id uuid references public.parceiros (id) on delete set null,
  canal text,
  canal_detalhe text,
  utm jsonb,
  -- Equipe
  historico jsonb not null default '[]'::jsonb   -- [{em, por, tipo, de?, para?, texto?}]
);

create index if not exists documentacao_processos_etapa_idx on public.documentacao_processos (etapa);
create index if not exists documentacao_processos_servico_idx on public.documentacao_processos (servico);
create index if not exists documentacao_processos_created_idx on public.documentacao_processos (created_at desc);

alter table public.documentacao_processos enable row level security;

-- ---------- 027_documentacao_portal ----------

alter table public.documentacao_processos
  add column if not exists acesso_token uuid not null default gen_random_uuid(),
  add column if not exists ficha jsonb,
  add column if not exists ficha_enviada_em timestamptz,
  add column if not exists documentos jsonb not null default '[]'::jsonb, -- [{id, tipo, nome, path, tamanho, enviado_em}]
  add column if not exists contrato jsonb,                                  -- {texto, hash, nome, cpf, ip, user_agent, aceito_em, versao}
  add column if not exists contrato_aceito_em timestamptz,
  add column if not exists liberado_contrato_em timestamptz;

alter table public.documentacao_processos drop constraint if exists documentacao_processos_etapa_check;
alter table public.documentacao_processos
  add constraint documentacao_processos_etapa_check
  check (etapa in ('novo', 'em_analise', 'pre_aprovado', 'contrato_aceito', 'contratado', 'documentacao', 'protocolado', 'concluido', 'nao_atende', 'negado', 'cancelado'));

insert into storage.buckets (id, name, public)
values ('documentos-processos', 'documentos-processos', false)
on conflict (id) do nothing;

-- ---------- 028_documentacao_pagamentos ----------

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

alter table public.documentacao_pagamentos enable row level security;
