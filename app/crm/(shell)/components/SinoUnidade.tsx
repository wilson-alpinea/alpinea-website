import { Suspense } from "react";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirAdmin } from "@/lib/crm/acesso";
import { carregarNotificacoesUnidade, cookieNotificacoes } from "@/lib/crm/notificacoes";
import { Notificacoes } from "./Notificacoes";

// Sino de notificações dos CRMs de Empregos, Seguro e Documentação (Wilson,
// 29/out/2026) — mesmo componente da Visão geral da Agência.
type Unidade = "empregos" | "seguro" | "documentacao";
const VER_TUDO: Record<Unidade, { href: string; rotulo: string }> = {
  empregos: { href: "/crm/empregos", rotulo: "Ver candidatos" },
  seguro: { href: "/crm/seguro", rotulo: "Ver pedidos" },
  documentacao: { href: "/crm/documentacao", rotulo: "Ver processos" },
};

async function Sino({ unidade }: { unidade: Unidade }) {
  // Seguro e Documentação só são legíveis pelo service role (RLS sem
  // políticas); as telas do CRM já exigem admin — conferido de novo aqui.
  await garantirAdmin();
  const jar = await cookies();
  const supabase = createAdminClient() as unknown as Parameters<typeof carregarNotificacoesUnidade>[0];
  const lidas = jar.get(cookieNotificacoes(unidade))?.value ?? null;
  const r = await carregarNotificacoesUnidade(supabase, unidade, lidas && !Number.isNaN(Date.parse(lidas)) ? lidas : null);
  if ("erro" in r) return <Notificacoes lista={[]} naoLidas={0} erro unidade={unidade} verTudo={VER_TUDO[unidade]} />;
  return <Notificacoes lista={r.lista} naoLidas={r.naoLidas} unidade={unidade} verTudo={VER_TUDO[unidade]} />;
}

export function SinoUnidade({ unidade }: { unidade: Unidade }) {
  return (
    <Suspense fallback={<Notificacoes lista={[]} naoLidas={0} unidade={unidade} verTudo={VER_TUDO[unidade]} />}>
      <Sino unidade={unidade} />
    </Suspense>
  );
}
