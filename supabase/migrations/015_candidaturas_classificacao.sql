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
