-- =============================================================
-- Alpinea CRM — migração 036 (Wilson, 04/nov/2026)
-- Nota fiscal de serviço concluído: "sempre que um serviço for concluído
-- deve disparar um alerta para que seja anexada nota fiscal no sistema, o
-- alerta só para quando for anexado nas notificações, não precisa
-- bloquear, mas precisa manter o alerta vigente".
--
-- - notas_fiscais: arquivos de NF por serviço (origem + id do registro).
-- - Bucket privado notas-fiscais (PDF, XML ou imagem, até 10 MB), lido só
--   pelo servidor (service role) com URL assinada.
-- - Data de conclusão: clientes.entrega_concluida_em e
--   seguro_pedidos.concluido_em, preenchidas por gatilho quando o serviço
--   passa para "Concluída/Concluído" (documentacao_processos.concluido_em
--   já existia). Só serviços concluídos a partir desta migração geram alerta.
-- Rode DEPOIS da 035. É seguro rodar de novo.
-- =============================================================

create table if not exists public.notas_fiscais (
  id uuid primary key default gen_random_uuid(),
  origem text not null check (origem in ('agencia', 'seguro', 'documentacao')),
  registro_id uuid not null,
  caminho text not null,
  nome_arquivo text not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  created_by_email text
);
create index if not exists notas_fiscais_registro_idx on public.notas_fiscais (origem, registro_id);
alter table public.notas_fiscais enable row level security;
-- Sem policies: leitura e escrita só pelo servidor, depois de checar a equipe.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('notas-fiscais', 'notas-fiscais', false, 10485760, array['application/pdf', 'application/xml', 'text/xml', 'image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = 10485760, allowed_mime_types = array['application/pdf', 'application/xml', 'text/xml', 'image/png', 'image/jpeg', 'image/webp'];

-- Agência: data em que a execução passou para "Concluída".
alter table public.clientes add column if not exists entrega_concluida_em timestamptz;
create or replace function public.marcar_entrega_concluida()
returns trigger language plpgsql as $$
begin
  if new.estagio_entrega = 'concluida' and (tg_op = 'INSERT' or old.estagio_entrega is distinct from 'concluida') then
    new.entrega_concluida_em := now();
  elsif new.estagio_entrega is distinct from 'concluida' then
    new.entrega_concluida_em := null;
  end if;
  return new;
end;
$$;
drop trigger if exists clientes_entrega_concluida on public.clientes;
create trigger clientes_entrega_concluida
  before insert or update of estagio_entrega on public.clientes
  for each row execute function public.marcar_entrega_concluida();

-- Seguro viagem: data em que o pedido passou para "Concluído".
alter table public.seguro_pedidos add column if not exists concluido_em timestamptz;
create or replace function public.marcar_seguro_concluido()
returns trigger language plpgsql as $$
begin
  if new.etapa = 'concluido' and (tg_op = 'INSERT' or old.etapa is distinct from 'concluido') then
    new.concluido_em := coalesce(new.concluido_em, now());
  end if;
  return new;
end;
$$;
drop trigger if exists seguro_pedidos_concluido on public.seguro_pedidos;
create trigger seguro_pedidos_concluido
  before insert or update of etapa on public.seguro_pedidos
  for each row execute function public.marcar_seguro_concluido();
