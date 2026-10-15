-- =============================================================
-- Alpinea CRM — migração 020
-- Andamento manual da candidatura: o operador do CRM marca etapas
-- (inclusive as posteriores à pré-entrevista: empreiteira, entrevista
-- final, COE, visto, embarque) e deixa comentários (Wilson, 15/out/2026).
-- Formato em lib/crm/andamentoManual.ts. É seguro rodar de novo.
-- =============================================================

alter table public.candidaturas_vagas
  add column if not exists andamento_manual jsonb not null default '{}'::jsonb;

notify pgrst, 'reload schema';
