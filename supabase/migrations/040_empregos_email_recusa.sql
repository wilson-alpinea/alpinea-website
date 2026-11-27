-- =============================================================
-- Alpinea CRM — migração 040 (Wilson, 18/nov/2026)
-- E-mail automático de retorno ao candidato eliminado pelo filtro
-- automático (ex.: sem ascendência japonesa): sai 2 dias depois da
-- candidatura, pelo cron diário /api/cron/empregos-followups, dizendo só
-- que o perfil foi avaliado e não se encaixa no momento — o motivo nunca
-- vai para o candidato. email_recusa_enviado_em marca o envio (1x só).
-- Rode DEPOIS da 039. É seguro rodar de novo.
-- =============================================================

alter table public.candidaturas_vagas add column if not exists email_recusa_enviado_em timestamptz;

create index if not exists candidaturas_vagas_recusa_pendente_idx
  on public.candidaturas_vagas (created_at)
  where classificacao = 'eliminado' and email_recusa_enviado_em is null;

notify pgrst, 'reload schema';
