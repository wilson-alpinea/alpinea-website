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
