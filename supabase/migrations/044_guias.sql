-- =============================================================
-- Alpinea CRM — migração 044 (Wilson, 27/nov/2026)
-- Guia Turístico: painel de cadastro dos nossos guias, só no CRM de
-- Turismo (/crm/guias) — não é acompanhamento de venda. Na oportunidade
-- (cliente) que contrata guia, o campo "Guia Turístico" escolhe um guia
-- cadastrado (clientes.guia_id).
-- Leitura e escrita só pelo servidor (service role), depois de checar a
-- equipe. Os fornecedores já cadastrados na categoria "Guia" são copiados
-- para cá uma vez (sem duplicar pelo nome). Rode DEPOIS da 043. É seguro
-- rodar de novo.
-- =============================================================

create table if not exists public.guias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  -- brasileiro: português nativo; local: japonês/estrangeiro (inglês ou português limitado)
  tipo text not null default 'brasileiro' check (tipo in ('brasileiro', 'local')),
  idiomas text[] not null default '{}',
  cidades text[] not null default '{}',
  base_cidade text,
  telefone text,
  email text,
  line_id text,
  diaria_jpy numeric(12, 0) check (diaria_jpy is null or diaria_jpy >= 0),
  licenciado boolean not null default false,
  ativo boolean not null default true,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by_email text
);
alter table public.guias enable row level security;
grant select, insert, update, delete on table public.guias to service_role;

alter table public.clientes add column if not exists guia_id uuid references public.guias (id) on delete set null;
create index if not exists clientes_guia_id_idx on public.clientes (guia_id);

-- Guias que já estavam em Fornecedores (categoria "Guia").
insert into public.guias (nome, telefone, email, base_cidade, observacoes)
select f.nome, f.telefone, f.email, f.cidade,
       nullif(concat_ws(E'\n', case when f.contato_nome is not null then 'Contato: ' || f.contato_nome end, f.observacoes), '')
from public.fornecedores f
where f.categoria = 'guia'
  and not exists (select 1 from public.guias g where lower(g.nome) = lower(f.nome));

notify pgrst, 'reload schema';
