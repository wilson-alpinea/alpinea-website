import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";

export const runtime = "nodejs";

// Registra no CRM (tabela `clientes`) uma proposta montada na Calculadora
// Reversa — pedido do Wilson, 16/set/2026: "criar um campo novo na cor
// verde chamado REGISTRAR NO CRM [...] para que isso crie uma entrada no
// CRM de registro de novo cliente" + "ajustar o CRM para que ele possua
// todos os dados que temos aqui na pagina de calculadora reversa".
//
// Mesmo padrao de /api/viagem-personalizada-selfservice: usa o cliente
// admin (service role, ver lib/supabase/admin.ts) porque a Calculadora
// Reversa nao exige login do CRM -- so assim da pra gravar apesar do RLS
// de `clientes` liberar insert so pra "authenticated".
function isProdutoSecundarioValido(
  valor: string,
): valor is
  | "jr_pass"
  | "seguro_viagem"
  | "guia"
  | "transporte_privado"
  | "reserva_restaurantes"
  | "ajisai_shopping"
  // Valores antigos — aceitos só para não quebrar nada que ainda envie a
  // chave anterior (ver lib/crm/produtos.ts, 18/set/2026).
  | "motorista_particular"
  | "acompanhamento_restaurantes"
  | "acompanhamento_compras" {
  return [
    "jr_pass",
    "seguro_viagem",
    "guia",
    "transporte_privado",
    "reserva_restaurantes",
    "ajisai_shopping",
    "motorista_particular",
    "acompanhamento_restaurantes",
    "acompanhamento_compras",
  ].includes(valor);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nome = String(body.nome || "").trim();
    if (!nome) {
      return NextResponse.json(
        { error: "Informe o nome do cliente (\"Dados da proposta\") antes de registrar no CRM." },
        { status: 400 },
      );
    }

    const consultor = String(body.consultor || "").trim();
    const telefone = String(body.telefone || "").trim();
    const email = String(body.email || "").trim();
    const valorProposta = Number(body.valorProposta) || null;
    const dataViagem = String(body.dataViagem || "").trim();
    const resumoTexto = String(body.resumoTexto || "").trim();
    const produtoSecundarioBruto = Array.isArray(body.produtoSecundario)
      ? body.produtoSecundario.map(String)
      : [];
    const produtoSecundario = produtoSecundarioBruto.filter(isProdutoSecundarioValido);

    const supabase = createAdminClient();

    const { data: cliente, error: erroCliente } = await supabase
      .from("clientes")
      .insert({
        nome,
        telefone: telefone || null,
        email: email || null,
        origem: consultor
          ? `Calculadora Reversa (interno) — consultor: ${consultor}`
          : "Calculadora Reversa (interno)",
        produto_principal: "roteiro_personalizado",
        produto_secundario: produtoSecundario,
        valor_proposta: valorProposta,
        data_viagem: dataViagem || null,
        estagio: "novo_lead",
        observacoes: resumoTexto || null,
      })
      .select("id")
      .single();

    if (erroCliente || !cliente) {
      console.error("Erro ao gravar cliente (calculadora-reversa-crm):", erroCliente);
      return NextResponse.json(
        {
          error:
            erroCliente?.message ||
            "Não foi possível registrar no CRM agora. Tente novamente em alguns segundos.",
        },
        { status: 500 },
      );
    }

    const { error: erroInteracao } = await supabase.from("interacoes").insert({
      cliente_id: cliente.id,
      tipo: "proposta_calculadora_reversa",
      conteudo: resumoTexto || "Proposta registrada pela Calculadora Reversa.",
    });

    if (erroInteracao) {
      console.error("Erro ao gravar interação (calculadora-reversa-crm):", erroInteracao);
    }

    return NextResponse.json({ success: true, clienteId: cliente.id }, { status: 200 });
  } catch (error) {
    console.error("Erro no registro CRM da calculadora reversa:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao registrar no CRM." },
      { status: 500 },
    );
  }
}
