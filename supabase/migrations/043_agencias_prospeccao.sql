-- =============================================================
-- Alpinea — migração 043 (Wilson, 27/nov/2026)
-- Checklist de prospecção das 100 agências (planilha "Ajisai-Alpinea —
-- 100 potenciais parceiros no Brasil", nov/2026). Página interna fora do
-- CRM, em link privado (app/j6mmw4eu, nunca indexada). Leitura e escrita
-- só pelo servidor (service role); sem acesso pela API pública.
-- As 100 agências entram sozinhas na primeira vez que a página abre
-- (app/j6mmw4eu/agenciasIniciais.ts). Rode DEPOIS da 042. É seguro rodar
-- de novo.
-- =============================================================

create table if not exists public.agencias_prospeccao (
  ordem integer primary key,
  conta text not null,
  prioridade text,
  parceria text,
  perfil text,
  grupo text,
  posicao_panrotas integer,
  vendas_2025_mi numeric(12, 1),
  evidencia_porte text,
  detalhe_indicador text,
  por_que text,
  quem_procurar text,
  proposta_inicial text,
  contato_publico text,
  link_canal text,
  link_evidencia text,
  link_extra text,
  lista_anterior text,
  -- Andamento (editado na página)
  status text not null default 'a_abordar',
  contato_nome text,
  contato_email text,
  email_enviado_em date,
  ultimo_contato_em date,
  proximo_passo text,
  proximo_em date,
  responsavel text,
  observacoes text,
  updated_at timestamptz,
  updated_by text
);
alter table public.agencias_prospeccao enable row level security;

notify pgrst, 'reload schema';
