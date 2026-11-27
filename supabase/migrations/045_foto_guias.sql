-- =============================================================
-- Alpinea CRM — migração 045 (Wilson, 27/nov/2026)
-- Foto do guia (miniatura circular no painel /crm/guias). Arquivo no
-- bucket público fotos-guias, com nome aleatório; gravado só pelo
-- servidor (service role). Rode DEPOIS da 044. É seguro rodar de novo.
-- =============================================================
alter table public.guias add column if not exists foto_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-guias', 'fotos-guias', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

notify pgrst, 'reload schema';
