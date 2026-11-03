-- =============================================================
-- Alpinea CRM — migração 034 (Wilson, 03/nov/2026)
-- Cadastro de vagas novas pelo CRM (/crm/empregos/vagas → "Nova vaga"):
-- "no CRM empregos, criar a opção de subir novas vagas também".
--
-- As vagas antigas continuam no catálogo do código (vagasCatalogo.ts) e as
-- edições delas em vagas_edicoes (033). Vaga criada no CRM mora inteira
-- aqui: id = slug da URL (/empregos/vagas/[id]), codigo = AJ-xxxx seguinte
-- ao maior em uso, dados = campos públicos da vaga em JSON.
-- Visibilidade continua em vagas_status (018); logo no bucket logos-vagas (033).
-- Rode DEPOIS da 033. É seguro rodar de novo.
-- =============================================================

create table if not exists public.vagas_novas (
  vaga_id text primary key,
  codigo text not null unique,
  dados jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  created_by_email text,
  updated_at timestamptz not null default now(),
  updated_by_email text
);

alter table public.vagas_novas enable row level security;

-- Leitura pública: o site (sem login) lista e monta as páginas dessas vagas.
drop policy if exists "vagas_novas_select_todos" on public.vagas_novas;
create policy "vagas_novas_select_todos"
  on public.vagas_novas for select to anon, authenticated using (true);

-- Escrita: só o servidor (service role, depois de checar admin no CRM).
