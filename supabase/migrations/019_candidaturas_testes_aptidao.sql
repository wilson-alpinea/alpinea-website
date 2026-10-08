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
