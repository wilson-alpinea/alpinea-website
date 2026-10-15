-- Migrações 015 a 019 juntas, na ordem — cole tudo no SQL Editor do Supabase e clique em Run.
-- Todas são seguras para rodar de novo (if not exists).

-- ===================== supabase/migrations/015_candidaturas_classificacao.sql =====================
-- =============================================================
-- Alpinea CRM — migração 015
-- Área de Empregos no CRM — pedido do Wilson, 06/out/2026: "precisamos
-- criar uma nova área no CRM somente para empregos, a ideia é que ao
-- preencher o screening isso alimente o CRM e crie 3 tipos de candidato:
-- eliminados, aprovados com score acima de 80 e abaixo".
--
-- classificacao é calculada no servidor no momento da candidatura
-- (app/api/empregos-candidatura): 'eliminado' quando alguma pergunta
-- eliminatória da vaga reprovou (ver criteriosDaVaga em
-- app/lib/candidaturaScoring.ts), senão 'aprovado_alto' (>= 80) ou
-- 'aprovado_baixo' (< 80). A equipe pode reclassificar manualmente no CRM.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase. É seguro rodar de novo.
-- =============================================================

alter table public.candidaturas_vagas
  add column if not exists classificacao text,
  add column if not exists motivos_eliminacao jsonb not null default '[]'::jsonb,
  add column if not exists pontos_revisar jsonb not null default '[]'::jsonb,
  add column if not exists observacoes_equipe text;

-- Candidaturas antigas (antes das perguntas eliminatórias): classifica só
-- pela pontuação.
update public.candidaturas_vagas
set classificacao = case when coalesce(pontuacao, 0) >= 80 then 'aprovado_alto' else 'aprovado_baixo' end
where classificacao is null;

alter table public.candidaturas_vagas
  alter column classificacao set default 'aprovado_baixo',
  alter column classificacao set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'candidaturas_vagas_classificacao_check') then
    alter table public.candidaturas_vagas
      add constraint candidaturas_vagas_classificacao_check
      check (classificacao in ('eliminado', 'aprovado_alto', 'aprovado_baixo'));
  end if;
end $$;

create index if not exists candidaturas_vagas_classificacao_idx
  on public.candidaturas_vagas (classificacao, pontuacao desc, created_at desc);

notify pgrst, 'reload schema';

-- ===================== supabase/migrations/016_candidaturas_ficha_cadastral.sql =====================
-- =============================================================
-- Alpinea CRM — migração 016
-- Etapa 2 da candidatura de /empregos: ficha cadastral unificada (as 4
-- fichas das empreiteiras num formulário online — Wilson, 06/out/2026).
-- Rode DEPOIS da 015. É seguro rodar de novo.
-- =============================================================

alter table public.candidaturas_vagas
  -- Token do link da ficha (/empregos/ficha/<id>?t=<token>) — impede que
  -- alguém abra a ficha de outra pessoa só trocando o id. Linhas antigas
  -- recebem um token próprio pelo default.
  add column if not exists ficha_token text not null default replace(gen_random_uuid()::text, '-', ''),
  -- Respostas (formato em app/lib/fichaCadastral.ts).
  add column if not exists ficha jsonb,
  add column if not exists ficha_enviada_em timestamptz,
  -- A ficha abre sozinha para score >= 80; abaixo disso só se a equipe
  -- liberar pelo CRM.
  add column if not exists ficha_liberada boolean not null default false;

notify pgrst, 'reload schema';

-- ===================== supabase/migrations/017_empregos_financiamento_entrevista.sql =====================
-- =============================================================
-- Alpinea CRM — migração 017 (Wilson, 06/out/2026)
-- Etapa 3 da candidatura: proposta de financiamento (aceite / falar com
-- a Ajisai). Etapa 4: agendamento da pré-entrevista, com a agenda de
-- horários definida pela equipe em /crm/empregos/agenda.
-- Rode DEPOIS da 016. É seguro rodar de novo.
-- =============================================================

alter table public.candidaturas_vagas
  add column if not exists proposta_financiamento jsonb,
  -- 'aceita' (marcou os termos e aceitou) | 'falar_ajisai' (pediu contato)
  add column if not exists proposta_status text,
  add column if not exists proposta_respondida_em timestamptz;

alter table public.candidaturas_vagas drop constraint if exists candidaturas_vagas_proposta_status_check;
alter table public.candidaturas_vagas
  add constraint candidaturas_vagas_proposta_status_check
  check (proposta_status is null or proposta_status in ('aceita', 'falar_ajisai'));

-- ── Agenda da pré-entrevista ───────────────────────────────────────────
-- Configuração geral (uma linha só, id = 1).
create table if not exists public.entrevista_config (
  id integer primary key default 1 check (id = 1),
  duracao_min integer not null default 30 check (duracao_min between 10 and 180),
  intervalo_min integer not null default 0 check (intervalo_min between 0 and 120),
  antecedencia_horas integer not null default 24 check (antecedencia_horas between 0 and 720),
  horizonte_dias integer not null default 21 check (horizonte_dias between 1 and 120),
  vagas_por_horario integer not null default 1 check (vagas_por_horario between 1 and 20),
  link_reuniao text,
  updated_at timestamptz not null default now()
);
insert into public.entrevista_config (id) values (1) on conflict (id) do nothing;

-- Janelas semanais em que a equipe atende (horário de Brasília).
-- dia_semana: 0 = domingo … 6 = sábado.
create table if not exists public.entrevista_janelas (
  id uuid primary key default gen_random_uuid(),
  dia_semana integer not null check (dia_semana between 0 and 6),
  inicio time not null,
  fim time not null check (fim > inicio),
  created_at timestamptz not null default now()
);

-- Restrições: dia inteiro bloqueado (inicio/fim nulos) ou só um trecho.
create table if not exists public.entrevista_bloqueios (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  inicio time,
  fim time,
  motivo text,
  created_at timestamptz not null default now(),
  check ((inicio is null and fim is null) or (inicio is not null and fim is not null and fim > inicio))
);

create table if not exists public.entrevistas_agendadas (
  id uuid primary key default gen_random_uuid(),
  candidatura_id uuid not null references public.candidaturas_vagas (id) on delete cascade,
  inicio timestamptz not null,
  fim timestamptz not null,
  status text not null default 'agendada' check (status in ('agendada', 'cancelada', 'realizada', 'faltou')),
  created_at timestamptz not null default now()
);
-- Um agendamento ativo por candidatura.
create unique index if not exists entrevistas_agendadas_candidatura_ativa
  on public.entrevistas_agendadas (candidatura_id) where status = 'agendada';
create index if not exists entrevistas_agendadas_inicio_idx on public.entrevistas_agendadas (inicio);

-- RLS: equipe logada gerencia tudo; o fluxo público usa o cliente admin.
do $$
declare t text;
begin
  foreach t in array array['entrevista_config', 'entrevista_janelas', 'entrevista_bloqueios', 'entrevistas_agendadas'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_autenticados', t);
    execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)', t || '_autenticados', t);
  end loop;
end $$;

notify pgrst, 'reload schema';

-- ===================== supabase/migrations/018_vagas_status.sql =====================
-- =============================================================
-- Alpinea CRM — migração 018 (Wilson, 07/out/2026)
-- Liga/desliga cada vaga do catálogo (app/lib/vagasCatalogo.ts) no site,
-- a partir de /crm/empregos/vagas: "criar um link interno onde
-- conseguimos rapidamente ativar e desativar as vagas vendo elas no
-- formato de lista tick box".
--
-- Só guarda o que foi alterado: vaga sem linha aqui = ATIVA. Assim uma
-- vaga nova cadastrada no catálogo já aparece no site sem passar pelo
-- CRM, e o site continua mostrando tudo se esta migração ainda não
-- tiver rodado.
-- Rode DEPOIS da 017. É seguro rodar de novo.
-- =============================================================

create table if not exists public.vagas_status (
  vaga_id text primary key,
  ativa boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.vagas_status enable row level security;

-- Leitura pública: o site (sem login) precisa saber quais vagas esconder.
-- A tabela só tem id da vaga + ligado/desligado, nada sensível.
drop policy if exists "vagas_status_select_todos" on public.vagas_status;
create policy "vagas_status_select_todos"
  on public.vagas_status for select to anon, authenticated using (true);

-- Escrita só pela equipe logada no CRM.
drop policy if exists "vagas_status_insert_autenticados" on public.vagas_status;
create policy "vagas_status_insert_autenticados"
  on public.vagas_status for insert to authenticated with check (true);

drop policy if exists "vagas_status_update_autenticados" on public.vagas_status;
create policy "vagas_status_update_autenticados"
  on public.vagas_status for update to authenticated using (true) with check (true);

-- ===================== supabase/migrations/019_candidaturas_testes_aptidao.sql =====================
-- =============================================================
-- Alpinea CRM — migração 019
-- Testes de aptidão online (visão, matemática, decimais, comparação,
-- hanamaru e japonês) das vagas com `testesAptidao: true` no catálogo —
-- etapa própria entre o match de 80%+ e a ficha cadastral
-- (Wilson, 08/out/2026). Formato em app/lib/testesAptidao.ts.
-- Rode DEPOIS da 018. É seguro rodar de novo.
-- =============================================================

alter table public.candidaturas_vagas
  -- Inícios (relógio do servidor), respostas e correção de cada teste.
  add column if not exists testes_aptidao jsonb,
  -- null enquanto não terminou; true/false quando todos os testes foram feitos.
  add column if not exists testes_aptidao_aprovado boolean;

notify pgrst, 'reload schema';
