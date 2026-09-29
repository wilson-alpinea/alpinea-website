-- =============================================================
-- Alpinea CRM — migração 013
-- Evidências de checkout pra defesa de chargeback (JR Pass
-- self-checkout, e qualquer outro self-checkout que venha a usar o
-- mesmo padrão): IP, user-agent, aceite e versão dos termos, e o
-- resultado do e-mail de confirmação enviado ao cliente.
--
-- Pedido do Wilson, 29/set/2026: "Para realmente reduzir chargeback,
-- o contrato sozinho não basta. No checkout da Alpinea eu registraria
-- timestamp + IP + versão dos termos + checkbox de aceite + nome do
-- passageiro + nome do comprador + identificação da transação +
-- comprovante de entrega do voucher + histórico de e-mails." —
-- timestamp já existe via `created_at`; identificação da transação já
-- existe via `clientes.id` e `pagamentos.gateway_pedido_id`; os campos
-- abaixo cobrem o que ainda faltava. Nome do comprador (separado do
-- passageiro) e comprovante de entrega do voucher ficam de fora desta
-- migração — dependem de decisão de produto / de um passo que ainda é
-- manual, ver observação enviada ao Wilson junto com esta mudança.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase (depois das migrações
-- anteriores). É seguro rodar de novo (usa "if not exists").
-- =============================================================

alter table public.clientes
  add column if not exists checkout_ip text,
  add column if not exists checkout_user_agent text,
  add column if not exists termos_aceitos boolean,
  add column if not exists termos_versao text,
  add column if not exists termos_aceitos_em timestamptz,
  add column if not exists email_confirmacao_enviado boolean,
  add column if not exists email_confirmacao_provider_id text;

comment on column public.clientes.checkout_ip is
  'IP do cliente no momento do checkout self-service (evidência pra contestação de chargeback).';
comment on column public.clientes.checkout_user_agent is
  'User-Agent do navegador no momento do checkout self-service.';
comment on column public.clientes.termos_aceitos is
  'Se o cliente marcou o checkbox de aceite dos termos e condições no checkout.';
comment on column public.clientes.termos_versao is
  'Identificador da versão do texto de termos e condições que estava em vigor quando o cliente aceitou (ver TERMOS_VERSAO_JRPASS no código).';
comment on column public.clientes.termos_aceitos_em is
  'Timestamp do servidor no momento em que o pedido com termos aceitos foi recebido.';
comment on column public.clientes.email_confirmacao_enviado is
  'Se o e-mail de confirmação de pedido foi enviado com sucesso ao cliente (Resend).';
comment on column public.clientes.email_confirmacao_provider_id is
  'ID da mensagem no Resend, pra rastrear/confirmar a entrega do e-mail de confirmação.';
