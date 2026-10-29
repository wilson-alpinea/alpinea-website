import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { obterAcesso } from "@/lib/crm/acesso";
import { produtoVisivel } from "@/lib/crm/permissoes";

import { execucaoIniciada } from "@/lib/crm/processo";
import type { EstagioEntrega } from "@/lib/crm/types";
import { ListaClientes, type ClienteLista } from "./ListaClientes";

export const metadata: Metadata = {
  title: "Clientes — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

// Lista de clientes (Wilson, 22/out/2026). O servidor entrega todos os
// clientes que o usuário pode ver (RLS: só admin) já com a última
// interação real e a situação da execução; busca, filtros, ordenação e
// paginação acontecem na tela e ficam na URL (voltar da ficha preserva).
export default async function ClientesPage() {
  const supabase = await createClient();

  const { data: clientes, error } = await supabase
    .from("clientes")
    .select(
      "id, nome, email, telefone, estagio, estagio_entrega, valor_proposta, produto_principal, produto_secundario, origem, canal, canal_detalhe, responsavel_id, arquivado_em, created_at",
    )
    .order("created_at", { ascending: false });
  if (error) console.error("Erro ao carregar clientes:", error);

  // Última interação real por cliente (sem cair para a data de cadastro) e
  // se a execução da viagem já teve registro.
  const { data: interacoes, error: erroInteracoes } = await supabase
    .from("interacoes")
    .select("cliente_id, tipo, created_at")
    .order("created_at", { ascending: false })
    .limit(20000);
  if (erroInteracoes) console.error("Erro ao carregar interações:", erroInteracoes);
  const ultima = new Map<string, string>();
  const comExecucao = new Set<string>();
  for (const i of interacoes ?? []) {
    if (!ultima.has(i.cliente_id)) ultima.set(i.cliente_id, i.created_at);
    if (i.tipo === "mudanca_estagio_entrega") comExecucao.add(i.cliente_id);
  }

  const idsResp = [...new Set((clientes ?? []).map((c) => c.responsavel_id).filter(Boolean))] as string[];
  const nomes = new Map<string, string>();
  if (idsResp.length) {
    const { data: perfis } = await supabase.from("perfis").select("id, nome, email").in("id", idsResp);
    for (const p of perfis ?? []) nomes.set(p.id, p.nome || p.email);
  }

  // Consultor (migração 030): só os produtos liberados para ele.
  const permissoes = (await obterAcesso())?.permissoes ?? null;
  const lista: ClienteLista[] = (clientes ?? []).filter((c) => produtoVisivel(permissoes, "agencia", c.produto_principal)).map((c) => {
    const iniciada = execucaoIniciada(c.estagio_entrega as EstagioEntrega, comExecucao.has(c.id));
    return {
      id: c.id,
      nome: c.nome,
      email: c.email,
      telefone: c.telefone,
      estagio: c.estagio,
      execucao: iniciada ? c.estagio_entrega : "aguardando",
      valor: c.valor_proposta === null || c.valor_proposta === undefined ? null : Number(c.valor_proposta),
      produtoPrincipal: c.produto_principal,
      produtosSecundarios: c.produto_secundario ?? [],
      origem: c.origem,
      canal: c.canal ?? null,
      canalDetalhe: c.canal_detalhe ?? null,
      responsavelId: c.responsavel_id,
      responsavel: c.responsavel_id ? nomes.get(c.responsavel_id) ?? null : null,
      arquivado: !!c.arquivado_em,
      ultimaInteracao: ultima.get(c.id) ?? null,
      criadoEm: c.created_at,
    };
  });

  return (
    <Suspense fallback={null}>
      <ListaClientes clientes={lista} />
    </Suspense>
  );
}
