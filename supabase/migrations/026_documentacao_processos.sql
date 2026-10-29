-- =============================================================
-- Alpinea CRM — migração 026
-- CRM de Documentação (Wilson, 29/out/2026): quarto CRM interno
-- (documentos.alpinea.io), separado da Agência. Cada cadastro feito em
-- /documentacao (visto específico, Certificado de Elegibilidade,
-- exportação de pet) vira um processo aqui — não cria cliente na Agência.
--
-- Etapas: novo → em_analise → pre_aprovado → contratado → documentacao →
-- protocolado → concluido; saídas: nao_atende, negado, cancelado.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase, depois da 025.
-- É seguro rodar de novo ("if not exists").
-- =============================================================

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

-- Só o servidor (service role) lê e escreve; o CRM confere se é admin antes.
alter table public.documentacao_processos enable row level security;
