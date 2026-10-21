-- =============================================================
-- Alpinea CRM — migração 022
-- Origem estruturada do lead (Wilson, 21/out/2026): "é necessário
-- identificar a origem, exemplo se foi Google Ads, Consultor - Email do
-- consultor, etc". Rode depois da 021. É seguro rodar de novo.
-- =============================================================
-- canal: google_ads | meta_ads | busca_organica | parceiro | consultor |
--        indicacao | whatsapp | instagram | direto | outro
-- canal_detalhe: e-mail do consultor, nome do parceiro, campanha, site de
--        origem etc.
-- utm: parâmetros capturados no site (utm_*, gclid, fbclid, página de
--        entrada, referer) no momento do pedido.
alter table public.clientes
  add column if not exists canal text,
  add column if not exists canal_detalhe text,
  add column if not exists utm jsonb;

create index if not exists clientes_canal_idx on public.clientes (canal);

-- Preenche o canal dos leads antigos a partir do texto livre de origem.
update public.clientes set canal = case
    when parceiro_id is not null then 'parceiro'
    when origem ilike '%calculadora reversa%' or origem ilike '%consultor%' then 'consultor'
    when origem ilike '%google%' then 'google_ads'
    when origem ilike '%instagram%' then 'instagram'
    when origem ilike '%facebook%' or origem ilike '%meta%' then 'meta_ads'
    when origem ilike '%whats%' then 'whatsapp'
    when origem ilike '%indica%' then 'indicacao'
    when origem ilike 'SELF-SERVICE%' then 'direto'
    when origem is null or origem = '' then 'direto'
    else 'outro'
  end
where canal is null;

update public.clientes
set canal_detalhe = nullif(trim(split_part(origem, 'consultor:', 2)), '')
where canal = 'consultor' and canal_detalhe is null and origem ilike '%consultor:%';
