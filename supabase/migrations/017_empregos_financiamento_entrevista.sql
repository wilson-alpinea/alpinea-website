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
