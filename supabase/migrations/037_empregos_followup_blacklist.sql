-- =============================================================
-- Alpinea CRM — migração 037 (Wilson, 04/nov/2026)
-- CRM de Empregos:
-- 1. Follow-ups manuais ("follow up com candidato daqui a 20 dias"): na
--    data marcada aparece alerta no sino do CRM de Empregos e sai um e-mail
--    (rota /api/cron/empregos-followups, chamada pelo Vercel Cron).
-- 2. Blacklist de candidatos por nome completo, CPF, e-mail ou telefone:
--    candidaturas que batem ficam anuladas (anulada_em + blacklist_id) e
--    não são processadas como ativas.
-- Anotações gerais e anotações curtas de arquivos/foto ficam em
-- candidaturas_vagas.andamento_manual (jsonb, migração 020) — sem coluna nova.
-- Tabelas sem policies: leitura e escrita só pelo servidor (service role),
-- depois de checar a equipe. Rode DEPOIS da 036. É seguro rodar de novo.
-- =============================================================

create table if not exists public.empregos_blacklist (
  id uuid primary key default gen_random_uuid(),
  nome_completo text,
  nome_normalizado text,
  cpf text,
  email text,
  telefone text,
  motivo text not null,
  created_at timestamptz not null default now(),
  created_by_email text,
  removido_em timestamptz,
  removido_por text
);
create index if not exists empregos_blacklist_ativos_idx on public.empregos_blacklist (removido_em);
alter table public.empregos_blacklist enable row level security;

alter table public.candidaturas_vagas add column if not exists blacklist_id uuid references public.empregos_blacklist (id) on delete set null;
alter table public.candidaturas_vagas add column if not exists anulada_em timestamptz;

create table if not exists public.empregos_followups (
  id uuid primary key default gen_random_uuid(),
  candidatura_id uuid not null references public.candidaturas_vagas (id) on delete cascade,
  data_alvo date not null,
  nota text,
  created_at timestamptz not null default now(),
  created_by_email text,
  concluido_em timestamptz,
  concluido_por text,
  email_enviado_em timestamptz
);
create index if not exists empregos_followups_pendentes_idx on public.empregos_followups (data_alvo) where concluido_em is null;
create index if not exists empregos_followups_candidatura_idx on public.empregos_followups (candidatura_id);
alter table public.empregos_followups enable row level security;

notify pgrst, 'reload schema';
