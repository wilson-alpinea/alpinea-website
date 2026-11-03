-- =============================================================
-- Alpinea CRM — migração 033 (Wilson, 03/nov/2026)
-- Edição das vagas pelo CRM (/crm/empregos/vagas → Detalhes → Editar):
-- "é possível editar os detalhes da vaga pelo CRM?".
--
-- O catálogo continua em app/lib/vagasCatalogo.ts. Aqui fica só o que foi
-- alterado no CRM (campos diferentes do código), em JSON; o site aplica
-- por cima. Vaga sem linha = igual ao código. Apagar a linha = "Restaurar
-- original".
-- Logo da empresa: bucket público logos-vagas (PNG/JPG/WebP até 2 MB),
-- gravado só pelo servidor (service role).
-- Rode DEPOIS da 032. É seguro rodar de novo.
-- =============================================================

create table if not exists public.vagas_edicoes (
  vaga_id text primary key,
  dados jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  updated_by_email text
);

alter table public.vagas_edicoes enable row level security;

-- Leitura pública: o site (sem login) monta as páginas de vaga com isto.
-- Só tem o texto público da vaga — nada sensível.
drop policy if exists "vagas_edicoes_select_todos" on public.vagas_edicoes;
create policy "vagas_edicoes_select_todos"
  on public.vagas_edicoes for select to anon, authenticated using (true);

-- Escrita: só o servidor (service role, depois de checar admin no CRM).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logos-vagas', 'logos-vagas', true, 2097152, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];
