-- =============================================================
-- Alpinea CRM — migração 032
-- Logo da empresa parceira (Wilson, 29/out/2026: "ao cadastrar um parceiro,
-- deixar opção de subir um logo" + "esse logo aparece na visão do CRM do
-- parceiro quando ele abre"). Arquivo no bucket público logos-parceiros;
-- a URL pública fica em parceiros.logo_url. Só o servidor (service role)
-- grava no bucket. Rode depois da 031. É seguro rodar de novo.
-- =============================================================
alter table public.parceiros add column if not exists logo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos-parceiros', 'logos-parceiros', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];
