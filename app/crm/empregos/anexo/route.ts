import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { obterAcesso } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import { PASTA_ANEXOS_EQUIPE, TIPOS_DOCUMENTO_CANDIDATO } from "@/lib/crm/empregos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Anexo manual de arquivos no perfil do candidato pelo operador do CRM
// (Wilson, 15/out/2026). Vai para o bucket privado "curriculos-candidatos",
// pasta anexos-equipe/, com o id da candidatura no começo do nome — a
// página do candidato lista pelo prefixo (sem precisar de migração).
// Limite de 4 MB por arquivo (teto de requisição da Vercel é 4,5 MB).
const LIMITE = 4 * 1024 * 1024;

function nomeSeguro(nome: string) {
  return (
    nome
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9._-]+/g, "_")
      .replace(/_+/g, "_")
      .slice(-80) || "arquivo"
  );
}

export async function POST(request: NextRequest) {
  // Só a equipe (admin) — parceiros/empreiteiras usam o portal próprio.
  if ((await obterAcesso())?.papel !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/crm/login", request.url), 303);

  const form = await request.formData();
  const id = String(form.get("candidaturaId") ?? "");
  const voltar = (erro?: string) =>
    NextResponse.redirect(new URL(`/crm/empregos/${id}${erro ? `?erro=${encodeURIComponent(erro)}` : "?salvo=1"}`, request.url), 303);
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Candidatura inválida." }, { status: 400 });

  // Tipo do documento escolhido no menu (obrigatório) — Wilson, 15/out/2026.
  const tipo = String(form.get("tipo") ?? "");
  if (!TIPOS_DOCUMENTO_CANDIDATO.some((t) => t.key === tipo)) return voltar("Escolha o tipo de documento.");
  const arquivos = form.getAll("arquivo").filter((a): a is File => a instanceof File && a.size > 0);
  if (arquivos.length === 0) return voltar("Escolha um arquivo para anexar.");
  if (arquivos.some((a) => a.size > LIMITE)) return voltar("Cada arquivo pode ter até 4 MB.");

  const admin = createAdminClient();
  for (const a of arquivos) {
    const caminho = `${PASTA_ANEXOS_EQUIPE}/${id}__${Date.now()}__${tipo}__${nomeSeguro(a.name)}`;
    const { error } = await admin.storage
      .from("curriculos-candidatos")
      .upload(caminho, Buffer.from(await a.arrayBuffer()), { contentType: a.type || "application/octet-stream" });
    if (error) {
      console.error("Erro ao anexar arquivo (crm/empregos/anexo):", error);
      return voltar("Não foi possível anexar o arquivo agora. Tente de novo.");
    }
  }
  return voltar();
}
