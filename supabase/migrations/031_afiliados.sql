-- =============================================================
-- Alpinea CRM — migração 031
-- Afiliados parceiros (Wilson, 29/out/2026): novo tipo de empresa parceira,
-- com link de indicação e remuneração próprios. Os usuários do afiliado
-- usam o perfil "Parceiro" (portal /crm/parceiro: só os leads indicados).
-- Rode depois da 030. É seguro rodar de novo.
-- =============================================================
alter table public.parceiros drop constraint if exists parceiros_tipo_check;
alter table public.parceiros add constraint parceiros_tipo_check check (tipo in ('agencia', 'empreiteira', 'afiliado'));

-- Produtos que a empresa parceira/afiliada pode ver no portal (vazio/null = todos).
alter table public.parceiros add column if not exists produtos jsonb;
