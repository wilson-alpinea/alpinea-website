-- =============================================================
-- Alpinea CRM — migração 011
-- Candidaturas de vaga em /empregos — pedido do Wilson, 25/set/2026:
-- "ao clicar em aplicar a vaga, deve abrir uma pagina para enviar as
-- informações [...] depois deve haver um sistema que captura essa
-- informacao e valida se o lead é compativel com a vaga, deve haver um
-- percenteil 0-100% de compatibilidade [...] após match superior a 80%,
-- ele pode ir para a proxima etapa que será enviar uma foto".
-- Confirmado com o Wilson: sem IA paga — a pontuação é um motor de
-- palavras-chave/critérios (ver app/lib/candidaturaScoring.ts), não uma
-- leitura "inteligente" do currículo; a checagem da foto (fundo claro,
-- resolução) também é só processamento de imagem local, sem IA. Boné/
-- óculos ficam só no autocertificado do candidato (ver foto_checklist).
-- =============================================================
-- Rode uma única vez no SQL Editor do Supabase (depois de já ter rodado
-- schema.sql e as migrações anteriores). É seguro rodar de novo (usa
-- "if not exists"/"or replace").
-- =============================================================

create table if not exists public.candidaturas_vagas (
  id uuid primary key default gen_random_uuid(),

  -- Snapshot da vaga no momento da candidatura — VAGAS vive em código
  -- (app/lib/vagasCatalogo.ts), não no banco, então guardamos aqui o
  -- suficiente pra entender a candidatura mesmo se a vaga for editada ou
  -- sair do catálogo depois.
  vaga_id text not null,
  vaga_titulo text not null,
  vaga_empresa text not null,
  vaga_setor text not null,

  nome text not null,
  sobrenome text not null,
  email text not null,
  telefone text not null,
  idade integer,

  -- Respostas às perguntas de triagem (mesmas perguntas pra todas as
  -- vagas — ver PERGUNTAS_TRIAGEM em app/lib/candidaturaScoring.ts).
  -- Formato livre (chave da pergunta → resposta), fica em jsonb pra não
  -- precisar de migração toda vez que a lista de perguntas mudar.
  respostas jsonb not null default '{}'::jsonb,

  -- Currículo enviado — bucket privado "curriculos-candidatos".
  curriculo_path text,
  curriculo_nome_arquivo text,
  curriculo_texto text,

  -- Pontuação 0-100 (motor de palavras-chave, sem IA) + o detalhamento
  -- exibido ao candidato e à equipe (ver CriterioPontuacao em
  -- app/lib/candidaturaScoring.ts).
  pontuacao integer,
  criterios jsonb,

  -- Etapa do fluxo: currículo enviado/pontuado; foto (só quando
  -- pontuacao >= 80); concluída (foto enviada).
  etapa text not null default 'curriculo',

  -- Foto — bucket privado "fotos-candidatos". foto_checklist guarda o
  -- autocertificado do candidato (fundo branco, sem boné, etc. — o que
  -- não dá pra checar de forma confiável sem IA de visão computacional).
  -- foto_checagem_automatica guarda o resultado do que É checável sem
  -- IA (fundo claro por amostragem de pixel, resolução mínima,
  -- proporção retrato).
  foto_path text,
  foto_checklist jsonb,
  foto_checagem_automatica jsonb,

  -- Status de revisão manual pela equipe (candidatura sempre cai aqui,
  -- mesmo abaixo de 80% — decisão do Wilson, 25/set/2026: "fica
  -- registrado, sem 2ª etapa" em vez de rejeição automática).
  status text not null default 'novo',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.candidaturas_vagas
  add constraint candidaturas_vagas_etapa_check
  check (etapa in ('curriculo', 'foto', 'concluida'));

alter table public.candidaturas_vagas
  add constraint candidaturas_vagas_status_check
  check (status in ('novo', 'em_analise', 'aprovado', 'reprovado'));

alter table public.candidaturas_vagas
  add constraint candidaturas_vagas_pontuacao_check
  check (pontuacao is null or (pontuacao >= 0 and pontuacao <= 100));

create index if not exists candidaturas_vagas_vaga_idx on public.candidaturas_vagas (vaga_id, created_at desc);
create index if not exists candidaturas_vagas_status_idx on public.candidaturas_vagas (status, created_at desc);

alter table public.candidaturas_vagas enable row level security;

-- Mesmo padrão das outras tabelas do CRM: só a equipe logada
-- (authenticated) enxerga/gerencia. O formulário público de candidatura
-- não faz login, então o insert/update dele acontece pelo cliente admin
-- (service role) nos Route Handlers (/api/empregos-candidatura e
-- /api/empregos-foto), que ignora RLS — ver lib/supabase/admin.ts.
drop policy if exists "candidaturas_vagas_select_autenticados" on public.candidaturas_vagas;
create policy "candidaturas_vagas_select_autenticados"
  on public.candidaturas_vagas for select to authenticated using (true);

drop policy if exists "candidaturas_vagas_insert_autenticados" on public.candidaturas_vagas;
create policy "candidaturas_vagas_insert_autenticados"
  on public.candidaturas_vagas for insert to authenticated with check (true);

drop policy if exists "candidaturas_vagas_update_autenticados" on public.candidaturas_vagas;
create policy "candidaturas_vagas_update_autenticados"
  on public.candidaturas_vagas for update to authenticated using (true) with check (true);

drop policy if exists "candidaturas_vagas_delete_autenticados" on public.candidaturas_vagas;
create policy "candidaturas_vagas_delete_autenticados"
  on public.candidaturas_vagas for delete to authenticated using (true);

-- =============================================================
-- Storage — buckets privados pra currículo e foto. Privados (public =
-- false) porque são documentos pessoais de candidatos — só a equipe
-- logada (via signed URL gerada pelo cliente admin) ou o próprio upload
-- (via service role, no Route Handler) acessam.
-- =============================================================
insert into storage.buckets (id, name, public)
values ('curriculos-candidatos', 'curriculos-candidatos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('fotos-candidatos', 'fotos-candidatos', false)
on conflict (id) do nothing;

drop policy if exists "curriculos_candidatos_select_autenticados" on storage.objects;
create policy "curriculos_candidatos_select_autenticados"
  on storage.objects for select to authenticated
  using (bucket_id = 'curriculos-candidatos');

drop policy if exists "fotos_candidatos_select_autenticados" on storage.objects;
create policy "fotos_candidatos_select_autenticados"
  on storage.objects for select to authenticated
  using (bucket_id = 'fotos-candidatos');
