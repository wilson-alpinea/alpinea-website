-- =============================================================
-- Alpinea CRM — migração 042 (Wilson, 27/nov/2026)
-- Programa de Promotores Ajisai (apresentação executiva de nov/2026):
-- - parceiros.tipo ganha 'promotor' (influenciador que mora no Japão), com
--   nível (bronze/prata/ouro) e o código AJISAI-NOME usado na etiqueta do
--   WhatsApp. O link continua sendo ?parceiro=<slug>.
-- - candidaturas_vagas ganha a atribuição (parceiro_id, canal, utm) — até
--   aqui só os leads de viagem eram atribuídos a parceiros.
-- - promotor_comissoes: comissão de cada lead do promotor (viagem ou
--   emprego), SEMPRE revisada e aprovada por um admin. Na aprovação guarda
--   o nível e o valor unitário daquele momento.
-- - comissoes_pagamentos: pagamento do extrato mensal de cada beneficiário
--   (promotor, agência, afiliado ou consultor), marcado à mão pelo admin.
-- Leitura e escrita só pelo servidor (service role), depois de checar o
-- acesso. Rode DEPOIS da 041. É seguro rodar de novo.
-- =============================================================

-- 1. Tipo promotor, nível e código
alter table public.parceiros drop constraint if exists parceiros_tipo_check;
alter table public.parceiros add constraint parceiros_tipo_check check (tipo in ('agencia', 'empreiteira', 'afiliado', 'promotor'));

alter table public.parceiros
  add column if not exists nivel_promotor text,
  add column if not exists codigo_promotor text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'parceiros_nivel_promotor_check') then
    alter table public.parceiros add constraint parceiros_nivel_promotor_check check (nivel_promotor is null or nivel_promotor in ('bronze', 'prata', 'ouro'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'parceiros_codigo_promotor_key') then
    alter table public.parceiros add constraint parceiros_codigo_promotor_key unique (codigo_promotor);
  end if;
end $$;

-- 2. Atribuição das candidaturas (empregos)
alter table public.candidaturas_vagas
  add column if not exists parceiro_id uuid references public.parceiros (id) on delete set null,
  add column if not exists canal text,
  add column if not exists canal_detalhe text,
  add column if not exists utm jsonb;
create index if not exists candidaturas_vagas_parceiro_idx on public.candidaturas_vagas (parceiro_id);

-- 3. Comissão do promotor por lead
create table if not exists public.promotor_comissoes (
  id uuid primary key default gen_random_uuid(),
  parceiro_id uuid not null references public.parceiros (id) on delete cascade,
  cliente_id uuid unique references public.clientes (id) on delete cascade,
  candidatura_id uuid unique references public.candidaturas_vagas (id) on delete cascade,
  -- pacote: aéreo + roteiro + hospedagem + seguro (por passageiro);
  -- passagem: só o aéreo (por bilhete); contratacao: emprego (por pessoa).
  tipo text not null check (tipo in ('pacote', 'passagem', 'contratacao')),
  quantidade integer not null default 1 check (quantidade >= 0 and quantidade <= 99),
  vaga_incentivada boolean not null default false,
  status text not null default 'rascunho' check (status in ('rascunho', 'aprovada')),
  -- Gravados na aprovação: não mudam se o nível ou a tabela mudarem depois.
  nivel text check (nivel is null or nivel in ('bronze', 'prata', 'ouro')),
  valor_unitario_jpy numeric(12, 2),
  -- Viagem cancelada: a 2ª metade não é paga e a 1ª, se já liberada, é
  -- descontada da próxima comissão. Remarcação não é cancelamento.
  cancelado_em date,
  -- Emprego: contratado saiu antes de completar 30 dias = não paga.
  desligado_em date,
  observacao text,
  aprovado_em timestamptz,
  aprovado_por_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by_email text,
  constraint promotor_comissoes_origem_check check ((cliente_id is null) <> (candidatura_id is null))
);
create index if not exists promotor_comissoes_parceiro_idx on public.promotor_comissoes (parceiro_id);
alter table public.promotor_comissoes enable row level security;

-- 4. Pagamento do extrato mensal
create table if not exists public.comissoes_pagamentos (
  id uuid primary key default gen_random_uuid(),
  -- "e:<parceiro_id>" (empresa/promotor) ou "u:<perfil_id>" (consultor)
  beneficiario text not null,
  mes text not null check (mes ~ '^\d{4}-\d{2}$'),
  moeda text not null check (moeda in ('JPY', 'BRL')),
  valor numeric(12, 2) not null check (valor >= 0),
  pago_em date not null,
  observacao text,
  created_at timestamptz not null default now(),
  created_by_email text,
  unique (beneficiario, mes)
);
alter table public.comissoes_pagamentos enable row level security;

notify pgrst, 'reload schema';
