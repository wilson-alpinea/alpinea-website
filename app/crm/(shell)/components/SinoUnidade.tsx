import { Suspense } from "react";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { garantirEquipe as garantirAdmin } from "@/lib/crm/acesso";
import { carregarNotificacoes, carregarNotificacoesUnidade, cookieNotificacoes } from "@/lib/crm/notificacoes";
import { createClient } from "@/lib/supabase/server";
import { Notificacoes } from "./Notificacoes";

// Sino de notificações dos CRMs de Empregos, Seguro e Documentação (Wilson,
// 29/out/2026) — mesmo componente da Visão geral da Agência.
// + Agência e a tela de escolha de CRM, um sino por card (Wilson, 29/out/2026).
type Unidade = "agencia" | "empregos" | "seguro" | "documentacao";
const VER_TUDO: Record<Unidade, { href: string; rotulo: string }> = {
  agencia: { href: "/crm/atividade", rotulo: "Ver toda a atividade" },
  empregos: { href: "/crm/empregos", rotulo: "Ver candidatos" },
  seguro: { href: "/crm/seguro", rotulo: "Ver pedidos" },
  documentacao: { href: "/crm/documentacao", rotulo: "Ver processos" },
};

async function Sino({ unidade }: { unidade: Unidade }) {
  // Seguro e Documentação só são legíveis pelo service role (RLS sem
  // políticas); as telas do CRM já exigem admin — conferido de novo aqui.
  const acesso = await garantirAdmin();
  const jar = await cookies();
  const bruto = jar.get(cookieNotificacoes(unidade))?.value ?? null;
  const lidas = bruto && !Number.isNaN(Date.parse(bruto)) ? bruto : null;
  const r =
    unidade === "agencia"
      ? await carregarNotificacoes(await createClient(), acesso.userId ?? null, lidas)
      : await carregarNotificacoesUnidade(createAdminClient() as unknown as Parameters<typeof carregarNotificacoesUnidade>[0], unidade, lidas);
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
