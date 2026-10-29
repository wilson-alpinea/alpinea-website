-- =============================================================
-- Alpinea CRM — migração 027
-- Portal online dos processos de Documentação (Wilson, 29/out/2026):
-- "todos os serviços devem ter formulário totalmente online equivalente ao
-- que fazemos com empregos". Depois do cadastro, o cliente recebe um link
-- com token (/documentacao/processo/<id>?t=<token>) e segue as etapas:
-- ficha completa + documentos → análise → contrato (aceite eletrônico) →
-- comprovante de pagamento → acompanhamento.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase, depois da 026.
-- =============================================================

alter table public.documentacao_processos
  add column if not exists acesso_token uuid not null default gen_random_uuid(),
  add column if not exists ficha jsonb,
  add column if not exists ficha_enviada_em timestamptz,
  add column if not exists documentos jsonb not null default '[]'::jsonb, -- [{id, tipo, nome, path, tamanho, enviado_em}]
  add column if not exists contrato jsonb,                                  -- {texto, hash, nome, cpf, ip, user_agent, aceito_em, versao}
  add column if not exists contrato_aceito_em timestamptz,
  add column if not exists liberado_contrato_em timestamptz;

-- Nova etapa "contrato_aceito" (entre pré-aprovado e contratado).
alter table public.documentacao_processos drop constraint if exists documentacao_processos_etapa_check;
alter table public.documentacao_processos
  add constraint documentacao_processos_etapa_check
  check (etapa in ('novo', 'em_analise', 'pre_aprovado', 'contrato_aceito', 'contratado', 'documentacao', 'protocolado', 'concluido', 'nao_atende', 'negado', 'cancelado'));

-- Bucket privado para os documentos enviados pelo cliente (passaporte,
-- certidões, carteira de vacinação, comprovantes). Só o servidor (service
-- role) grava; a equipe abre por URL assinada no CRM.
insert into storage.buckets (id, name, public)
values ('documentos-processos', 'documentos-processos', false)
on conflict (id) do nothing;
