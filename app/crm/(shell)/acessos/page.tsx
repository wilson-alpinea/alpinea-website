import { Suspense } from "react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { exigirSomenteAdmin as exigirAdmin } from "@/lib/crm/acesso";
import { lerPermissoes, lerProdutosParceiro } from "@/lib/crm/permissoes";
import { VAGAS, localVaga } from "@/app/lib/vagasCatalogo";
import { AcessosPagina, type EmpresaAcesso, type UsuarioAcesso, type VagaAcesso, type Remuneracao } from "./AcessosPagina";

// Acessos e permissões (Wilson, 21/out/2026; redesenho 23/out/2026).
// Só admin abre esta página (exigirAdmin) e todas as ações revalidam a
// permissão no servidor (garantirAdmin em app/crm/acessosActions.ts).

export const metadata: Metadata = {
  title: "Acessos — CRM Alpinea",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const dynamic = "force-dynamic";

export default async function AcessosPage() {
  const acesso = await exigirAdmin();
  const h = (await headers()).get("x-crm-unidade");
  const unidade = h === "empregos" || h === "seguro" || h === "documentacao" ? h : "agencia";
  const supabase = await createClient();

  const [rParceiros, rPerfis, rVinculos] = await Promise.all([
    supabase.from("parceiros").select("*").order("nome"), // "*": remuneração (migração 030)
    supabase.from("perfis").select("*").order("created_at"), // "*": permissoes/cargo (migração 030)
    supabase.from("vagas_empreiteira").select("vaga_id, parceiro_id"),
  ]);
  const erros = {
    empresas: !!rParceiros.error,
    usuarios: !!rPerfis.error,
    vinculos: !!rVinculos.error,
  };
  if (rParceiros.error || rPerfis.error || rVinculos.error) console.error("Erro ao carregar Acessos:", rParceiros.error ?? rPerfis.error ?? rVinculos.error);

  const remun = (x: { remuneracao_tipo?: string | null; remuneracao_valor?: number | string | null }): Remuneracao => ({
    tipo: x.remuneracao_tipo === "percentual" || x.remuneracao_tipo === "fixo" ? x.remuneracao_tipo : null,
    valor: x.remuneracao_valor == null ? null : Number(x.remuneracao_valor),
  });
  const empresas: EmpresaAcesso[] = (rParceiros.data ?? []).map((p) => ({ id: p.id, nome: p.nome, slug: p.slug, tipo: p.tipo, ativo: p.ativo, remuneracao: remun(p), produtos: lerProdutosParceiro(p.produtos) }));
  const usuarios: UsuarioAcesso[] = (rPerfis.data ?? []).map((u) => ({
    id: u.id,
    nome: u.nome ?? null,
    email: u.email,
    papel: u.papel ?? null,
    parceiroId: u.parceiro_id ?? null,
    permissoes: u.papel === "consultor" ? lerPermissoes(u.permissoes) : null,
    produtos: u.papel === "parceiro_agencia" ? lerPermissoes(u.permissoes).produtos.agencia ?? [] : [],
    cargo: (u.cargo as string | null) ?? null,
    remuneracao: remun(u),
  }));
  const vinculos: Record<string, string> = Object.fromEntries((rVinculos.data ?? []).map((v) => [v.vaga_id, v.parceiro_id]));
  const vagas: VagaAcesso[] = VAGAS.map((v) => ({ id: v.id, titulo: v.titulo, codigo: v.codigo, empresa: v.empresa, local: localVaga(v) }));

  return (
    <Suspense fallback={null}>
      <AcessosPagina unidade={unidade} usuarioAtualId={acesso.userId} usuarios={usuarios} empresas={empresas} vinculos={vinculos} vagas={vagas} erros={erros} />
    </Suspense>
  );
}
