import type { Metadata } from "next";
import Link from "next/link";
import { exigirAdmin } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PedidoSeguro } from "@/lib/crm/seguro";
import { DetalheSeguro } from "./DetalheSeguro";

export const metadata: Metadata = {
  title: "Pedido — CRM Seguro Viagem",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
export const dynamic = "force-dynamic";

export default async function PedidoSeguroPage({ params }: { params: Promise<{ id: string }> }) {
  await exigirAdmin();
  const { id } = await params;
  const valido = /^[0-9a-f-]{36}$/i.test(id);
  const { data, error } = valido ? await createAdminClient().from("seguro_pedidos").select("*").eq("id", id).maybeSingle() : { data: null, error: null };
  if (error) console.error("Erro ao ler pedido de seguro:", error);
  if (!data) {
    return (
      <div className="rounded-2xl border border-[#E6E1EC] bg-white p-8 text-center">
        <p className="text-base font-semibold text-[#24212A]">{error ? "Não foi possível carregar o pedido." : "Pedido não encontrado."}</p>
        <Link href="/crm/seguro" className="mt-3 inline-block text-sm font-medium text-[#75608B] hover:underline">
          Voltar para os pedidos
        </Link>
      </div>
    );
  }
  const pedido = { ...data, viajantes: Array.isArray(data.viajantes) ? data.viajantes : [], historico: Array.isArray(data.historico) ? data.historico : [] } as PedidoSeguro;
  return <DetalheSeguro pedido={pedido} agora={agoraMs()} />;
}

// Hora do servidor no momento da renderização (prazo de 24 h da apólice).
function agoraMs() {
  return Date.now();
}
