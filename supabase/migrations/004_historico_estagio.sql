-- =============================================================
-- Alpinea CRM — migração 004
-- Adiciona "estagio_destino" em interacoes, usado para registrar
-- automaticamente as mudanças de estágio no histórico do cliente e
-- alimentar o funil visual (data em que entrou em cada etapa).
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase.
-- =============================================================

alter table public.interacoes
  add column if not exists estagio_destino text;

alter table public.interacoes
  add constraint interacoes_estagio_destino_check
  check (
    estagio_destino is null or estagio_destino in (
      'novo_lead',
      'qualificacao',
      'proposta_enviada',
      'negociacao',
      'fechado_ganho',
      'fechado_perdido'
    )
  );
