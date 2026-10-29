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
