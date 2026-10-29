import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { carregarProcessoPublico, enviarEmailDoc, EMAIL_EQUIPE_DOC } from "@/lib/documentacao/processoPublico";
import { passoAtual } from "@/app/documentacao/processo";

export const runtime = "nodejs";

// Certificado de Elegibilidade pago em IENES por depósito no Japão (Wilson,
// 29/out/2026: "tem que ser uma decisão: pagar em real / pagar em ienes ...
// a opção pagar em ienes ele não consegue ainda fazer o checkout
// automático ... prazo de 2 dias para pagamento, mas um consultor vai entrar
// em contato"). Registra a escolha no CRM e avisa a equipe; a confirmação
// do depósito é feita à mão pela equipe (mudar a etapa no CRM).
export async function POST(req: Request) {
  try {
    const corpo = (await req.json().catch(() => null)) as { id?: string; token?: string } | null;
    const p = await carregarProcessoPublico(String(corpo?.id ?? ""), corpo?.token);
    if (!p) return NextResponse.json({ error: "Link inválido." }, { status: 404 });
    if (p.servico !== "elegibilidade") return NextResponse.json({ error: "Opção disponível só para o Certificado de Elegibilidade." }, { status: 400 });
    if (passoAtual(p) !== "pagamento") return NextResponse.json({ error: "Aceite o contrato antes de escolher o pagamento." }, { status: 409 });

    const agora = new Date();
    const prazo = new Date(agora.getTime() + 2 * 86400000).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const historico = (Array.isArray(p.historico) ? p.historico : []) as { texto?: string }[];
    const jaEscolheu = historico.some((h) => typeof h?.texto === "string" && h.texto.startsWith("Pagamento em ienes"));
    if (!jaEscolheu) {
      await createAdminClient()
        .from("documentacao_processos")
        .update({
          updated_at: agora.toISOString(),
          historico: [...historico, { em: agora.toISOString(), por: "cliente (site)", tipo: "nota", texto: `Pagamento em ienes por depósito no Japão (1ª parcela, 50%) — prazo até ${prazo}. Confirmar o depósito e avançar a etapa à mão.` }],
        })
        .eq("id", p.id);
      await enviarEmailDoc({
        para: EMAIL_EQUIPE_DOC,
        assunto: `[DOCUMENTAÇÃO] Pagamento em ienes — Certificado de Elegibilidade — ${p.nome}`,
        texto: `${p.nome} escolheu pagar a 1ª parcela (50%) em ienes, por depósito na conta da Ajisai Japan. Prazo: ${prazo}.\nValor: ${p.valor_final ?? "—"}\nContato: ${p.email ?? ""} ${p.telefone ?? ""}\n\nUm consultor deve entrar em contato. Quando o depósito cair, avance a etapa no CRM:\nhttps://documentos.alpinea.io/crm/documentacao/${p.id}`,
        replyTo: p.email ?? undefined,
      });
    }
    return NextResponse.json({ sucesso: true, prazo });
  } catch (e) {
    console.error("Erro no pagamento em ienes (documentacao):", e);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
