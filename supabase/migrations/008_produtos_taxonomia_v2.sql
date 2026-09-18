-- =============================================================
-- Alpinea CRM — migração 008
-- Reorganiza a taxonomia de produto principal/secundário do CRM pra
-- bater com os produtos reais do site — pedido do Wilson, 18/set/2026:
-- "a divisao no crm deve ser: produto principal → roteiro personalizado,
-- pacote de viagem, viagem personalizada, serviço individual / produto
-- secundario → listar todos os serviços que podem ser contratados
-- individualmente, incluso transfer, eSIM e reserva de restaurantes"
-- (ver lib/crm/produtos.ts).
--
-- Os valores antigos continuam válidos nas constraints abaixo — não são
-- removidos, só deixam de aparecer como opção no formulário — pra não
-- quebrar clientes já cadastrados. "motorista_particular" e
-- "acompanhamento_compras" são renomeados pros nomes novos
-- ("transporte_privado" e "ajisai_shopping", mesmo serviço) e os
-- registros existentes são atualizados abaixo.
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase (depois de já ter
-- rodado as migrações 001 a 007).
-- =============================================================

alter table public.clientes
  drop constraint if exists clientes_produto_principal_check;

alter table public.clientes
  add constraint clientes_produto_principal_check
  check (
    produto_principal is null or produto_principal in (
      -- taxonomia atual (18/set/2026)
      'roteiro_personalizado',
      'pacote_viagem',
      'viagem_personalizada',
      'servico_individual',
      -- valores antigos — mantidos só pra clientes já cadastrados
      'revisao_roteiro',
      'caravana',
      'semi_full_service',
      'full_service'
    )
  );

alter table public.clientes
  drop constraint if exists clientes_produto_secundario_check;

alter table public.clientes
  add constraint clientes_produto_secundario_check
  check (
    produto_secundario <@ array[
      -- taxonomia atual (18/set/2026)
      'passagem_aerea',
      'hoteis',
      'guia',
      'transporte_privado',
      'jr_pass',
      'cambio',
      'seguro_viagem',
      'ajisai_shopping',
      'transfer_aeroporto_hotel',
      'esim',
      'reserva_restaurantes',
      -- valores antigos — mantidos só pra clientes já cadastrados
      'motorista_particular',
      'acompanhamento_restaurantes',
      'acompanhamento_compras'
    ]::text[]
  );

-- Renomeia nos registros já existentes (mesmo serviço, nome novo).
update public.clientes
set produto_secundario = array_replace(produto_secundario, 'motorista_particular', 'transporte_privado')
where 'motorista_particular' = any(produto_secundario);

update public.clientes
set produto_secundario = array_replace(produto_secundario, 'acompanhamento_compras', 'ajisai_shopping')
where 'acompanhamento_compras' = any(produto_secundario);
