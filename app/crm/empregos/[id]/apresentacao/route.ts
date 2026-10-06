import { NextResponse, type NextRequest } from "next/server";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApresentacaoPdf, MODELOS_APRESENTACAO } from "@/lib/empregos/apresentacaoPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Gera o "Documento de Apresentação para Empreiteira" em PDF (Wilson,
// 06/out/2026). Só equipe logada no CRM. ?modelo=alpinea|avcorp|… e
// ?download=1 para baixar em vez de abrir no navegador.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/crm/login", request.url));

  const { id } = await params;
  const modelo = request.nextUrl.searchParams.get("modelo") ?? "alpinea";
  if (!MODELOS_APRESENTACAO.some((m) => m.id === modelo)) return NextResponse.json({ error: "Modelo inválido." }, { status: 400 });

  const { data: c } = await supabase.from("candidaturas_vagas").select("*").eq("id", id).maybeSingle();
  if (!c) return NextResponse.json({ error: "Candidatura não encontrada." }, { status: 404 });

  // Foto → JPEG em data URI (o @react-pdf não lê WEBP).
  let fotoDataUri: string | null = null;
  if (c.foto_path) {
    const { data: arquivo } = await createAdminClient().storage.from("fotos-candidatos").download(c.foto_path);
    if (arquivo) {
      try {
        const jpeg = await sharp(Buffer.from(await arquivo.arrayBuffer())).rotate().resize(420, 540, { fit: "cover" }).jpeg({ quality: 82 }).toBuffer();
        fotoDataUri = `data:image/jpeg;base64,${jpeg.toString("base64")}`;
      } catch (e) {
        console.error("Erro ao converter foto para o PDF:", e);
      }
    }
  }

  const pdf = await renderToBuffer(
    createElement(ApresentacaoPdf, { candidatura: c, fotoDataUri, modelo }) as unknown as ReactElement<DocumentProps>,
  );
  const nomeArquivo = `apresentacao-${modelo}-${`${c.nome}-${c.sobrenome}`.normalize("NFD").replace(/[^A-Za-z0-9]+/g, "-").toLowerCase()}.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${request.nextUrl.searchParams.get("download") ? "attachment" : "inline"}; filename="${nomeArquivo}"`,
      "Cache-Control": "no-store",
    },
  });
}
