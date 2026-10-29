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

-- Unidades de negócio liberadas à empresa parceira (Viagens, Seguro & eSIM,
-- Câmbio, Documentação, Empregos) — escolhidas acima dos produtos em Acessos
-- (Wilson, 29/out/2026). Vazio/null = todas.
alter table public.parceiros add column if not exists unidades jsonb;

-- Remuneração por produto (Wilson, 29/out/2026: "cada valor tem que ser
-- atribuído por produto"). Formato: {"<produto>": {"tipo": "percentual"|"fixo", "valor": 10}}.
-- Produtos sem regra própria usam a remuneração padrão (remuneracao_tipo/valor).
alter table public.parceiros add column if not exists remuneracao_produtos jsonb;
alter table public.perfis add column if not exists remuneracao_produtos jsonb;
