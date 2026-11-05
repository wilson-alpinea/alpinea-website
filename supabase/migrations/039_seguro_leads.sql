-- =============================================================
-- Alpinea CRM — migração 039 (Wilson, 04/nov/2026)
-- Seguro Viagem: "clientes que não pagam não estão sendo registrados".
-- O pedido só entrava no CRM quando o link de pagamento do fornecedor era
-- gerado. Agora entra antes, como "Lead — não finalizou" (etapa
-- iniciado), assim que o cliente cota e deixa nome + contato na página;
-- ao gerar o link, o MESMO pedido passa para "Aguardando pagamento".
-- lead_chave: segredo do pedido guardado no navegador do cliente, para
-- atualizar o próprio lead sem criar duplicados.
-- Rode DEPOIS da 038. É seguro rodar de novo.
-- =============================================================

alter table public.seguro_pedidos drop constraint if exists seguro_pedidos_etapa_check;
alter table public.seguro_pedidos add constraint seguro_pedidos_etapa_check
  check (etapa in ('iniciado', 'link_enviado', 'pago', 'apolice_recebida', 'apolice_enviada', 'concluido', 'cancelado'));

alter table public.seguro_pedidos add column if not exists lead_chave text;
create unique index if not exists seguro_pedidos_lead_chave_idx on public.seguro_pedidos (lead_chave) where lead_chave is not null;

notify pgrst, 'reload schema';
