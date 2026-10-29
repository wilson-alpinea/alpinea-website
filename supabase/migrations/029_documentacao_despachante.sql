-- =============================================================
-- Alpinea CRM — migração 029
-- Despachantes no CRM de Documentação (Wilson, 29/out/2026: "deixar um
-- campo de despachante; através desse campo um determinado despachante vai
-- ter acesso somente a esse cadastro ... seria interessante eles não
-- enxergarem informações do financeiro").
--
-- - perfis.papel ganha 'despachante' (login próprio, portal /crm/despachante);
-- - documentacao_processos.despachante_id = perfil do despachante atribuído.
-- O portal lê com service role e confere a atribuição no servidor; nada de
-- valores, pagamentos ou contrato aparece para o despachante.
-- =============================================================
-- Rode depois da 028. É seguro rodar de novo.
-- =============================================================

alter table public.perfis drop constraint if exists perfis_papel_check;
alter table public.perfis
  add constraint perfis_papel_check check (papel is null or papel in ('admin', 'parceiro_agencia', 'empreiteira', 'despachante'));

alter table public.documentacao_processos
  add column if not exists despachante_id uuid references public.perfis (id) on delete set null;

create index if not exists documentacao_processos_despachante_idx on public.documentacao_processos (despachante_id);
