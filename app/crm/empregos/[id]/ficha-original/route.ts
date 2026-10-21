import { NextResponse, type NextRequest } from "next/server";
import JSZip from "jszip";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { obterAcesso } from "@/lib/crm/acesso";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ContextoFicha } from "@/app/lib/fichasParceiros";
import type { PerfilCandidato } from "@/app/lib/triagemPerfil";
import { preencherModelo } from "@/lib/empregos/preencherModelo";
import { MODELOS_ORIGINAIS } from "@/lib/empregos/valoresModelos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ficha ORIGINAL da empreiteira (Word/Excel enviado pelo Wilson) preenchida
// com os dados do candidato — Wilson, 15/out/2026. ?modelo=avcorp|
// lista-verificacao|fujiarte|suriemu ou ?modelo=todos (zip com as 4).
// Só equipe logada no CRM.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Só a equipe (admin) — parceiros/empreiteiras usam o portal próprio.
  if ((await obterAcesso())?.papel !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/crm/login", request.url));

  const { id } = await params;
  const pedido = request.nextUrl.searchParams.get("modelo") ?? "";
  const modelos = pedido === "todos" ? MODELOS_ORIGINAIS : MODELOS_ORIGINAIS.filter((m) => m.id === pedido);
  if (!modelos.length) return NextResponse.json({ error: "Modelo inválido." }, { status: 400 });

  const { data: c } = await supabase.from("candidaturas_vagas").select("*").eq("id", id).maybeSingle();
  if (!c) return NextResponse.json({ error: "Candidatura não encontrada." }, { status: 404 });

  const r = (c.respostas ?? {}) as ContextoFicha["r"];
  const x: ContextoFicha = {
    c: { nome: c.nome, sobrenome: c.sobrenome, email: c.email, telefone: c.telefone, idade: c.idade },
    r,
    p: (r.perfil ?? null) as PerfilCandidato | null,
    f: c.ficha,
  };

  // Foto (só a ficha da Fujiarte tem o quadro da foto).
  let foto: Buffer | null = null;
  const quadro = modelos.map((m) => ("foto" in m ? m.foto : null)).find(Boolean);
  if (quadro && c.foto_path) {
    const { data: arquivo } = await createAdminClient().storage.from("fotos-candidatos").download(c.foto_path);
    if (arquivo) {
      try {
        foto = await sharp(Buffer.from(await arquivo.arrayBuffer()))
          .rotate()
          .resize(quadro.largura * 2, quadro.altura * 2, { fit: "cover", position: "attention" })
          .jpeg({ quality: 85 })
          .toBuffer();
      } catch (e) {
        console.error("Erro ao converter a foto para a ficha:", e);
      }
    }
  }

  const slug = `${c.nome}-${c.sobrenome}`.normalize("NFD").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const gerados = await Promise.all(
    modelos.map(async (m) => {
      // Linhas de listas sem item (2º emprego, 3º filho…) saem em branco.
      const { buffer } = await preencherModelo(m.arquivo, m.valores(x), { fotoJpeg: foto });
      return { nome: `${m.saida}_${slug}.${m.arquivo.split(".").pop()}`, buffer };
    }),
  );

  let corpo: Buffer;
  let nomeArquivo: string;
  let tipo: string;
  if (gerados.length === 1) {
    corpo = gerados[0].buffer;
    nomeArquivo = gerados[0].nome;
    tipo = nomeArquivo.endsWith(".docx")
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  } else {
    const zip = new JSZip();
    for (const g of gerados) zip.file(g.nome, g.buffer);
    corpo = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    nomeArquivo = `Fichas-empreiteiras_${slug}.zip`;
    tipo = "application/zip";
  }

  return new NextResponse(new Uint8Array(corpo), {
    headers: {
      "Content-Type": tipo,
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      "Cache-Control": "no-store",
    },
  });
}
