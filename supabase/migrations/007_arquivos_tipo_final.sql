-- =============================================================
-- Alpinea CRM — migração 007
-- Adiciona "roteiro_final" como tipo válido em arquivos_cliente.tipo —
-- pedido do Wilson, 18/set/2026: "preciso de um campo para adicionar o
-- link do roteiro" / "isso não é um draft, é a entrega final". Até aqui
-- só existia "roteiro_draft" (ver migrations/003_arquivos_cliente.sql).
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase.
-- =============================================================

alter table public.arquivos_cliente
  drop constraint if exists arquivos_cliente_tipo_check;

alter table public.arquivos_cliente
  add constraint arquivos_cliente_tipo_check
  check (tipo in ('roteiro_draft', 'roteiro_final', 'proposta', 'contrato', 'outro'));
