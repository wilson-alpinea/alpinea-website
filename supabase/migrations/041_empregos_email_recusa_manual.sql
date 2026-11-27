-- =============================================================
-- Alpinea CRM — migração 041 (Wilson, 19/nov/2026)
-- Aviso no topo da página do candidato: "E-mail de resposta enviado em
-- <data e hora>". email_recusa_por guarda quem enviou: 'sistema' (cron
-- automático, lib/empregos/emailRecusa.ts) ou o e-mail de quem registrou
-- um envio manual pelo CRM. Registrar o envio manual também impede o
-- e-mail automático de sair de novo para o mesmo candidato.
-- Rode DEPOIS da 040. É seguro rodar de novo.
-- =============================================================

alter table public.candidaturas_vagas add column if not exists email_recusa_por text;

-- Envios automáticos anteriores a esta migração (se houver) foram do sistema.
update public.candidaturas_vagas
   set email_recusa_por = 'sistema'
 where email_recusa_enviado_em is not null and email_recusa_por is null;

-- Retroativo: 3 e-mails de resposta enviados à mão pelo Wilson em
-- 19/nov/2026 (Renan e Brunna — Daihatsu; Cicero — Niticon). Ajuste o
-- horário se precisar. Só marca quem ainda não tem envio registrado.
update public.candidaturas_vagas
   set email_recusa_enviado_em = '2026-11-19T16:50:00-03:00',
       email_recusa_por = 'wilson (manual)'
 where email_recusa_enviado_em is null
   and classificacao = 'eliminado'
   and lower(trim(email)) in ('renan.alves4253@gmail.com', 'bru.maia136@gmail.com', 'kauan.oli009@gmail.com')
   and created_at >= '2026-11-17T00:00:00-03:00';

notify pgrst, 'reload schema';
