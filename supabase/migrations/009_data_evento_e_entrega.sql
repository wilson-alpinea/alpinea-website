-- =============================================================
-- Alpinea CRM — migração 009
-- Pedido do Wilson, 19/set/2026: "ao fechar, falta deixar campo de data
-- obrigatorio ao mudar cada etapa, alem disso, precisa haver um campo
-- informando se o serviço foi entre ou nao, um novo fluxograma de entrega
-- abaixo do de vendas é bom adicionar".
--
-- Duas coisas novas:
-- 1) interacoes.data_evento — data "oficial" (informada pelo usuário) de
--    quando o cliente de fato mudou de etapa, tanto no funil de vendas
--    quanto no novo fluxo de entrega. Distinta de created_at (só quando o
--    registro foi salvo no sistema). Nula em registros antigos.
-- 2) Um segundo fluxo, paralelo ao funil de vendas, pra acompanhar a
--    ENTREGA do serviço (montar roteiro → confirmar reservas → viagem →
--    concluída) — taxonomia confirmada pelo Wilson no mesmo dia:
--    Roteiro em Elaboração → Roteiro Entregue → Reservas Confirmadas →
--    Viagem em Andamento → Concluída.
--    clientes.estagio_entrega guarda a etapa atual;
--    interacoes.estagio_entrega_destino guarda o histórico (mesmo padrão
--    já usado por estagio_destino, migração 004).
--
-- Segue o padrão das migrações 002+ (text + check constraint, não enum —
-- só o estagio_cliente original, do schema base, é enum).
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase (depois de já ter rodado
-- as migrações 001 a 008).
-- =============================================================

alter table public.interacoes
  add column if not exists data_evento date;

alter table public.interacoes
  add column if not exists estagio_entrega_destino text;

alter table public.interacoes
  drop constraint if exists interacoes_estagio_entrega_destino_check;

alter table public.interacoes
  add constraint interacoes_estagio_entrega_destino_check
  check (
    estagio_entrega_destino is null or estagio_entrega_destino in (
      'roteiro_elaboracao',
      'roteiro_entregue',
      'reservas_confirmadas',
      'viagem_andamento',
      'concluida'
    )
  );

alter table public.clientes
  add column if not exists estagio_entrega text not null default 'roteiro_elaboracao';

alter table public.clientes
  drop constraint if exists clientes_estagio_entrega_check;

alter table public.clientes
  add constraint clientes_estagio_entrega_check
  check (
    estagio_entrega in (
      'roteiro_elaboracao',
      'roteiro_entregue',
      'reservas_confirmadas',
      'viagem_andamento',
      'concluida'
    )
  );
