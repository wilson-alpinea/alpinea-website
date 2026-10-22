-- =============================================================
-- Alpinea CRM — migração 023
-- Financeiro (Wilson, 22/out/2026): separa o que é COBRADO (parcelas,
-- tabela "pagamentos" já existente) do que foi RECEBIDO (nova tabela
-- "recebimentos"), com valor contratado no cliente, estornos, reembolsos e
-- histórico de alterações.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase, depois da 022.
-- É seguro rodar de novo ("if not exists" / "or replace" / backfill
-- protegido por "not exists").
--
-- Registros existentes:
--   • nenhuma linha de "pagamentos" é apagada ou tem o valor alterado;
--   • parcelas com status "pago" ganham UM recebimento de mesmo valor,
--     marcado como origem "legado" (ou "gateway" se veio da Pagar.me),
--     com a data e a forma que já estavam gravadas — se faltarem, ficam
--     em branco e a tela sinaliza "dados incompletos";
--   • parcelas "pendente"/"atrasado" continuam em aberto (sem recebimento);
--   • "cancelado" continua cancelado e fora dos totais.
-- =============================================================

-- 1. Valor contratado (aprovado) — distinto de valor_proposta.
alter table public.clientes
  add column if not exists valor_contratado numeric(12, 2);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'clientes_valor_contratado_check') then
    alter table public.clientes
      add constraint clientes_valor_contratado_check check (valor_contratado is null or valor_contratado >= 0);
  end if;
end $$;

-- 2. Parcelas: descrição e serviço vinculado.
alter table public.pagamentos
  add column if not exists descricao text,
  add column if not exists servico text,
  add column if not exists criado_por uuid,
  add column if not exists chave_criacao text;

-- Clique repetido em "Salvar parcela"/"Criar parcelas" não duplica.
create unique index if not exists pagamentos_chave_criacao_idx
  on public.pagamentos (chave_criacao) where chave_criacao is not null;

-- 3. Recebimentos (entradas), estornos e reembolsos.
create table if not exists public.recebimentos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  -- "no action" (e não "restrict"): impede apagar uma parcela com
  -- recebimento, mas deixa a exclusão do cliente inteiro cascatear.
  pagamento_id uuid references public.pagamentos (id) on delete no action,
  tipo text not null default 'recebimento',
  valor numeric(12, 2) not null,
  data date,
  forma_pagamento text,
  comprovante_arquivo_id uuid references public.arquivos_cliente (id) on delete set null,
  observacoes text,
  motivo text,
  estorno_de uuid references public.recebimentos (id) on delete no action,
  origem text not null default 'manual',
  gateway_pedido_id text,
  chave_idempotencia text,
  autor_id uuid,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'recebimentos_tipo_check') then
    alter table public.recebimentos add constraint recebimentos_tipo_check
      check (tipo in ('recebimento', 'estorno', 'reembolso'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'recebimentos_valor_check') then
    alter table public.recebimentos add constraint recebimentos_valor_check check (valor > 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'recebimentos_origem_check') then
    alter table public.recebimentos add constraint recebimentos_origem_check
      check (origem in ('manual', 'gateway', 'legado'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'recebimentos_forma_check') then
    alter table public.recebimentos add constraint recebimentos_forma_check
      check (forma_pagamento is null or forma_pagamento in
        ('pix', 'cartao_credito', 'cartao_debito', 'transferencia', 'boleto', 'dinheiro', 'outro'));
  end if;
  -- Coerência entre o tipo e os vínculos.
  if not exists (select 1 from pg_constraint where conname = 'recebimentos_vinculos_check') then
    alter table public.recebimentos add constraint recebimentos_vinculos_check check (
      (tipo = 'recebimento' and pagamento_id is not null and estorno_de is null)
      or (tipo = 'estorno' and estorno_de is not null and motivo is not null)
      or (tipo = 'reembolso' and estorno_de is null and motivo is not null)
    );
  end if;
end $$;

create index if not exists recebimentos_cliente_idx on public.recebimentos (cliente_id, created_at);
create index if not exists recebimentos_pagamento_idx on public.recebimentos (pagamento_id);
-- Clique repetido / reenvio: a mesma chave nunca grava duas vezes.
create unique index if not exists recebimentos_idempotencia_idx
  on public.recebimentos (chave_idempotencia) where chave_idempotencia is not null;
-- Um recebimento só pode ser estornado uma vez.
create unique index if not exists recebimentos_estorno_unico_idx
  on public.recebimentos (estorno_de) where estorno_de is not null;
-- Webhook da Pagar.me reenviado não duplica o recebimento.
create unique index if not exists recebimentos_gateway_idx
  on public.recebimentos (gateway_pedido_id) where tipo = 'recebimento' and gateway_pedido_id is not null;

-- 4. Histórico de alterações do financeiro.
create table if not exists public.financeiro_eventos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  -- Sem FK de propósito: o evento continua mesmo se a parcela for excluída.
  pagamento_id uuid,
  recebimento_id uuid,
  acao text not null,
  descricao text not null,
  motivo text,
  autor_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists financeiro_eventos_cliente_idx on public.financeiro_eventos (cliente_id, created_at desc);

-- 5. Acesso: só admin (mesmo critério do resto do CRM).
alter table public.recebimentos enable row level security;
alter table public.financeiro_eventos enable row level security;

drop policy if exists "recebimentos_admin" on public.recebimentos;
create policy "recebimentos_admin" on public.recebimentos
  for all to authenticated using (public.crm_is_admin()) with check (public.crm_is_admin());

drop policy if exists "financeiro_eventos_admin" on public.financeiro_eventos;
create policy "financeiro_eventos_admin" on public.financeiro_eventos
  for all to authenticated using (public.crm_is_admin()) with check (public.crm_is_admin());

-- 6. Backfill dos registros "pago" existentes (idempotente).
insert into public.recebimentos
  (cliente_id, pagamento_id, tipo, valor, data, forma_pagamento, origem, gateway_pedido_id, observacoes, created_at)
select
  p.cliente_id,
  p.id,
  'recebimento',
  p.valor,
  p.data_pagamento,
  p.tipo_pagamento,
  case when p.gateway is not null then 'gateway' else 'legado' end,
  p.gateway_pedido_id,
  'Migrado do registro anterior (parcela marcada como "pago").',
  coalesce(p.updated_at, p.created_at)
from public.pagamentos p
where p.status = 'pago'
  and p.valor > 0
  and not exists (select 1 from public.recebimentos r where r.pagamento_id = p.id);

-- 7. Saldo de uma parcela (valor − recebido + estornado).
create or replace function public.crm_recebido_parcela(p_pagamento uuid)
returns numeric
language sql
stable
set search_path = public
as $$
  select coalesce(sum(case r.tipo when 'recebimento' then r.valor when 'estorno' then -r.valor else 0 end), 0)
  from public.recebimentos r
  where r.pagamento_id = p_pagamento;
$$;

-- Formata 1234.5 como "1.234,50" (independe do locale do banco).
create or replace function public.crm_brl(p numeric)
returns text
language sql
immutable
as $$
  select translate(to_char(p, 'FM999,999,999,990.00'), ',.', '.,');
$$;

-- 8. Registrar recebimento — atômico: trava a parcela, valida o saldo,
--    grava, atualiza o status e o histórico. Repetir a mesma chave devolve
--    o registro já criado (sem duplicar).
create or replace function public.crm_registrar_recebimento(
  p_pagamento uuid,
  p_valor numeric,
  p_data date,
  p_forma text,
  p_comprovante uuid,
  p_observacoes text,
  p_chave text
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_parcela public.pagamentos%rowtype;
  v_existente uuid;
  v_recebido numeric;
  v_saldo numeric;
  v_id uuid;
begin
  if not public.crm_is_admin() then
    raise exception 'ACESSO_NEGADO';
  end if;

  if p_chave is not null then
    select id into v_existente from public.recebimentos where chave_idempotencia = p_chave;
    if v_existente is not null then
      return jsonb_build_object('ok', true, 'id', v_existente, 'duplicado', true);
    end if;
  end if;

  select * into v_parcela from public.pagamentos where id = p_pagamento for update;
  if not found then
    return jsonb_build_object('ok', false, 'erro', 'Parcela não encontrada.');
  end if;
  if v_parcela.status = 'cancelado' then
    return jsonb_build_object('ok', false, 'erro', 'Esta parcela está cancelada.');
  end if;
  if p_valor is null or p_valor <= 0 then
    return jsonb_build_object('ok', false, 'erro', 'Informe um valor maior que zero.');
  end if;
  if p_data is null then
    return jsonb_build_object('ok', false, 'erro', 'Informe a data do recebimento.');
  end if;
  if p_forma is null then
    return jsonb_build_object('ok', false, 'erro', 'Informe a forma de pagamento.');
  end if;

  v_recebido := public.crm_recebido_parcela(p_pagamento);
  v_saldo := v_parcela.valor - v_recebido;
  if round(p_valor, 2) > round(v_saldo, 2) then
    return jsonb_build_object('ok', false, 'erro',
      'O valor é maior que o saldo desta parcela (R$ ' || public.crm_brl(v_saldo) || ').',
      'saldo', v_saldo);
  end if;

  insert into public.recebimentos
    (cliente_id, pagamento_id, tipo, valor, data, forma_pagamento, comprovante_arquivo_id, observacoes, origem, chave_idempotencia, autor_id)
  values
    (v_parcela.cliente_id, p_pagamento, 'recebimento', round(p_valor, 2), p_data, p_forma, p_comprovante, p_observacoes, 'manual', p_chave, auth.uid())
  returning id into v_id;

  update public.pagamentos
     set status = case when round(v_saldo - p_valor, 2) <= 0 then 'pago' else 'pendente' end,
         data_pagamento = case when round(v_saldo - p_valor, 2) <= 0 then p_data else data_pagamento end
   where id = p_pagamento;

  insert into public.financeiro_eventos (cliente_id, pagamento_id, recebimento_id, acao, descricao, autor_id)
  values (v_parcela.cliente_id, p_pagamento, v_id, 'recebimento',
    'Recebimento de R$ ' || public.crm_brl(p_valor) || ' em "' ||
      coalesce(v_parcela.descricao, 'Parcela ' || v_parcela.numero_parcela || '/' || v_parcela.total_parcelas) || '".',
    auth.uid());

  return jsonb_build_object('ok', true, 'id', v_id, 'duplicado', false);
end;
$$;

-- 9. Estornar recebimento — reabre o saldo da parcela; exige motivo.
create or replace function public.crm_estornar_recebimento(
  p_recebimento uuid,
  p_motivo text,
  p_chave text
)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_rec public.recebimentos%rowtype;
  v_parcela public.pagamentos%rowtype;
  v_existente uuid;
  v_id uuid;
begin
  if not public.crm_is_admin() then
    raise exception 'ACESSO_NEGADO';
  end if;
  if p_motivo is null or length(trim(p_motivo)) = 0 then
    return jsonb_build_object('ok', false, 'erro', 'Informe o motivo do estorno.');
  end if;
  if p_chave is not null then
    select id into v_existente from public.recebimentos where chave_idempotencia = p_chave;
    if v_existente is not null then
      return jsonb_build_object('ok', true, 'id', v_existente, 'duplicado', true);
    end if;
  end if;

  select * into v_rec from public.recebimentos where id = p_recebimento;
  if not found or v_rec.tipo <> 'recebimento' then
    return jsonb_build_object('ok', false, 'erro', 'Recebimento não encontrado.');
  end if;
  select * into v_parcela from public.pagamentos where id = v_rec.pagamento_id for update;
  if exists (select 1 from public.recebimentos where estorno_de = p_recebimento) then
    return jsonb_build_object('ok', false, 'erro', 'Este recebimento já foi estornado.');
  end if;

  insert into public.recebimentos
    (cliente_id, pagamento_id, tipo, valor, data, forma_pagamento, motivo, estorno_de, origem, chave_idempotencia, autor_id)
  values
    (v_rec.cliente_id, v_rec.pagamento_id, 'estorno', v_rec.valor,
     (now() at time zone 'America/Sao_Paulo')::date, v_rec.forma_pagamento, trim(p_motivo), p_recebimento, 'manual', p_chave, auth.uid())
  returning id into v_id;

  update public.pagamentos set status = 'pendente', data_pagamento = null
   where id = v_rec.pagamento_id and status <> 'cancelado';

  insert into public.financeiro_eventos (cliente_id, pagamento_id, recebimento_id, acao, descricao, motivo, autor_id)
  values (v_rec.cliente_id, v_rec.pagamento_id, v_id, 'estorno',
    'Estorno de R$ ' || public.crm_brl(v_rec.valor) || ' em "' ||
      coalesce(v_parcela.descricao, 'Parcela ' || v_parcela.numero_parcela || '/' || v_parcela.total_parcelas) || '".',
    trim(p_motivo), auth.uid());

  return jsonb_build_object('ok', true, 'id', v_id, 'duplicado', false);
end;
$$;

revoke all on function public.crm_registrar_recebimento(uuid, numeric, date, text, uuid, text, text) from public, anon;
revoke all on function public.crm_estornar_recebimento(uuid, text, text) from public, anon;
grant execute on function public.crm_registrar_recebimento(uuid, numeric, date, text, uuid, text, text) to authenticated;
grant execute on function public.crm_estornar_recebimento(uuid, text, text) to authenticated;
grant execute on function public.crm_recebido_parcela(uuid) to authenticated;
grant execute on function public.crm_brl(numeric) to authenticated;

-- 10. Comprovantes enviados como arquivo do cliente.
alter table public.arquivos_cliente drop constraint if exists arquivos_cliente_tipo_check;
alter table public.arquivos_cliente add constraint arquivos_cliente_tipo_check
  check (tipo in ('roteiro_draft', 'roteiro_final', 'proposta', 'contrato', 'comprovante', 'outro'));
