-- =============================================================
-- Alpinea CRM — migração 030
-- Perfil "Consultor" com permissões por nível (Wilson, 29/out/2026):
--   nível 2: quais CRMs acessa (agência, empregos, seguro, documentação);
--   nível 3: quais produtos vê dentro do CRM;
--   nível 4: ver / editar / deletar;
--   nível 5: cargo.
-- perfis.permissoes (jsonb) = { crms: [...], produtos: { agencia: [...], documentacao: [...] }, editar: bool, deletar: bool }
-- O servidor confere tudo (lib/crm/acesso.ts e lib/crm/permissoes.ts).
-- =============================================================
-- Rode depois da 029. É seguro rodar de novo.
-- =============================================================

alter table public.perfis drop constraint if exists perfis_papel_check;
alter table public.perfis
  add constraint perfis_papel_check check (papel is null or papel in ('admin', 'parceiro_agencia', 'empreiteira', 'despachante', 'consultor'));

alter table public.perfis
  add column if not exists permissoes jsonb,
  add column if not exists cargo text;

-- Consultor lê e escreve pelas mesmas políticas da equipe ("admin only").
-- O que cada consultor pode ver/editar/deletar é conferido no servidor.
create or replace function public.crm_is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select papel in ('admin', 'consultor') from public.perfis where id = auth.uid()), false);
$$;

-- Consultor vê SÓ os registros dele (Wilson, 29/out/2026: "o novo usuário só
-- deve conseguir enxergar os dados gerados por ele mesmo"). Na Agência já
-- existe clientes.responsavel_id; nos outros CRMs passa a existir também.
alter table public.seguro_pedidos add column if not exists responsavel_id uuid references public.perfis (id) on delete set null;
alter table public.documentacao_processos add column if not exists responsavel_id uuid references public.perfis (id) on delete set null;
alter table public.candidaturas_vagas add column if not exists responsavel_id uuid references public.perfis (id) on delete set null;
create index if not exists seguro_pedidos_responsavel_idx on public.seguro_pedidos (responsavel_id);
create index if not exists documentacao_processos_responsavel_idx on public.documentacao_processos (responsavel_id);
create index if not exists candidaturas_vagas_responsavel_idx on public.candidaturas_vagas (responsavel_id);

-- Remuneração do parceiro (Wilson, 29/out/2026): percentual da receita
-- líquida ou valor fixo por venda — na empresa parceira e no usuário.
-- Só aparece em Acessos (tela exclusiva dos administradores).
alter table public.parceiros
  add column if not exists remuneracao_tipo text check (remuneracao_tipo is null or remuneracao_tipo in ('percentual', 'fixo')),
  add column if not exists remuneracao_valor numeric(12, 2);
alter table public.perfis
  add column if not exists remuneracao_tipo text check (remuneracao_tipo is null or remuneracao_tipo in ('percentual', 'fixo')),
  add column if not exists remuneracao_valor numeric(12, 2);
