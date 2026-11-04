-- =============================================================
-- Alpinea CRM — migração 035 (Wilson, 04/nov/2026)
-- Preços e margens do site editáveis pelo CRM (/crm/precos), só admin:
-- "deixar uma parte com todos os preços e margens aplicadas em todos os
-- cálculos do site [...] ao mudar, todo site muda o cálculo".
--
-- Os valores padrão continuam no código (P(id, padrão) em
-- app/lib/parametrosPreco.ts). Aqui fica só o que foi alterado no CRM.
-- Parâmetro sem linha = padrão do código. Apagar a linha = "Restaurar
-- padrão". No build (scripts/gerar-parametros-preco.mjs) o site lê esta
-- tabela; o CRM dispara o Deploy Hook do Vercel ao salvar.
--
-- Sem leitura pública: margens são confidenciais. Leitura e escrita só
-- pelo servidor (service role), depois de checar admin no CRM.
-- Rode DEPOIS da 034. É seguro rodar de novo.
-- =============================================================

create table if not exists public.precos_parametros (
  id text primary key,
  valor numeric not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  updated_by_email text
);

alter table public.precos_parametros enable row level security;

-- Histórico de alterações (quem mudou o quê e quando).
create table if not exists public.precos_parametros_historico (
  id bigint generated always as identity primary key,
  parametro_id text not null,
  valor_anterior numeric,
  valor_novo numeric,
  alterado_em timestamptz not null default now(),
  alterado_por uuid references auth.users (id) on delete set null,
  alterado_por_email text
);

create index if not exists precos_parametros_historico_idx
  on public.precos_parametros_historico (alterado_em desc);

alter table public.precos_parametros_historico enable row level security;

-- Nenhuma policy de propósito: anon/authenticated não leem nem escrevem.
