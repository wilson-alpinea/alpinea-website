import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { criarCheckout, pagarmeConfigurado } from "@/lib/pagarme/client";
import { carregarProcessoPublico } from "@/lib/documentacao/processoPublico";
import { numeroParcelas, parcelaDevida, valorParcela } from "@/lib/documentacao/pagamento";
import { urlPortal } from "@/app/documentacao/processo";
import { servicoDoc } from "@/lib/crm/documentacao";

export const runtime = "nodejs";

// Abre o pagamento da parcela devida na Stone/Pagar.me (Wilson, 29/out/2026:
// "pagamento vai ser o mesmo que usamos da Stone no site de
// alpinea.io/produtos"). O valor é recalculado aqui — nunca vem do navegador.
// A confirmação chega pelo webhook genérico (app/api/webhooks/pagarme).
export async function POST(req: Request) {
  try {
    const corpo = (await req.json().catch(() => null)) as { id?: string; token?: string } | null;
    const p = await carregarProcessoPublico(String(corpo?.id ?? ""), corpo?.token);
    if (!p) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
    if (!pagarmeConfigurado()) return NextResponse.json({ error: "Pagamento online indisponível no momento. Fale com a equipe pelo WhatsApp." }, { status: 503 });

    const supabase = createAdminClient();
    const { data: parcelas } = await supabase.from("documentacao_pagamentos").select("parcela, status").eq("processo_id", p.id);
    const pagas = (parcelas ?? []).filter((x) => x.status === "pago").map((x) => x.parcela as number);
    const processo = { id: p.id, servico: p.servico, etapa: p.etapa, valor_total: (p.valor_total as number | null) ?? null, valor_moeda: (p.valor_moeda as string | null) ?? "BRL" };
    const parcela = parcelaDevida(processo, pagas);
    if (!parcela) return NextResponse.json({ error: "Não há pagamento pendente neste processo agora." }, { status: 409 });
    const valor = await valorParcela(processo, parcela);
    if (!valor || !(valor.valorBRL > 0)) return NextResponse.json({ error: "O valor ainda não foi definido pela equipe." }, { status: 409 });

    // Links antigos da mesma parcela deixam de valer (o valor em reais pode ter mudado com a PTAX).
    await supabase.from("documentacao_pagamentos").update({ status: "cancelado" }).eq("processo_id", p.id).eq("parcela", parcela).eq("status", "pendente");
    const { data: pag, error } = await supabase
      .from("documentacao_pagamentos")
      .insert({ processo_id: p.id, parcela, valor_brl: valor.valorBRL, valor_jpy: valor.valorJPY, cotacao_brl_por_jpy: valor.cotacao })
      .select("id")
      .single();
    if (error || !pag) {
      console.error("Erro ao criar parcela (rodou a migração 028?):", error);
      return NextResponse.json({ error: "Não foi possível gerar o pagamento agora. Tente novamente." }, { status: 500 });
    }

    const total = numeroParcelas(p.servico);
    const nomeServico = servicoDoc(p.servico).label;
    try {
      const checkout = await criarCheckout({
        codigoInterno: pag.id,
        itemNome: `${nomeServico} — Ajisai${total > 1 ? ` (parcela ${parcela}/${total})` : ""}`,
        itemDescricao: valor.valorJPY ? `¥${valor.valorJPY.toLocaleString("ja-JP")} pela PTAX ${valor.fonteCotacao ?? "do dia"}` : `Processo de ${p.nome}`,
        valorTotalBRL: valor.valorBRL,
        aceitarCartao: true,
        aceitarPix: true,
        urlSucesso: `${new URL(req.url).origin}${urlPortal(p.id, p.acesso_token)}&pagamento=concluido`,
      });
      await supabase.from("documentacao_pagamentos").update({ gateway_pedido_id: checkout.id, gateway_checkout_url: checkout.url }).eq("id", pag.id);
      return NextResponse.json({ sucesso: true, checkoutUrl: checkout.url, valorBRL: valor.valorBRL });
    } catch (e) {
      console.error("Erro ao criar checkout Pagar.me (documentacao):", e);
      await supabase.from("documentacao_pagamentos").update({ status: "cancelado" }).eq("id", pag.id);
      return NextResponse.json({ error: "Não foi possível abrir o pagamento agora. Tente novamente em alguns minutos." }, { status: 502 });
    }
  } catch (e) {
    console.error("Erro no pagamento (documentacao):", e);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
