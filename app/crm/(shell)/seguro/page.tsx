import type { Metadata } from "next";
import { Suspense } from "react";
import { exigirAdmin } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { ListaSeguro, type LinhaSeguro } from "./ListaSeguro";

// CRM de Seguro Viagem — lista de pedidos (Wilson, 26/out/2026).
export const metadata: Metadata = {
  title: "Pedidos — CRM Seguro Viagem",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default async function SeguroPage() {
  await exigirAdmin();
  const { data, error } = await createAdminClient()
    .from("seguro_pedidos")
    .select("id, created_at, etapa, nome, email, telefone, plano, seguradora, partida, retorno, viajantes, valor_cliente, pago_em, numero_apolice")
    .order("created_at", { ascending: false })
    .limit(3000);
  if (error) console.error("Erro ao ler seguro_pedidos:", error);
  const pedidos = (data ?? []).map((p) => ({ ...p, viajantes: Array.isArray(p.viajantes) ? p.viajantes.length : 0 })) as unknown as LinhaSeguro[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#24212A]" style={{ fontSize: 28, fontWeight: 600 }}>
          Pedidos de seguro viagem
        </h1>
        <p className="mt-1 text-sm text-[#67626F]">Acompanhe pagamentos e o envio das apólices. A seguradora tem até 24 horas após o pagamento para enviar a apólice.</p>
      </div>
      <Suspense>
        <ListaSeguro pedidos={pedidos} erro={!!error} agora={agoraMs()} />
      </Suspense>
    </div>
  );
}

// Hora do servidor no momento da renderização (prazo de 24 h da apólice).
function agoraMs() {
  return Date.now();
}
