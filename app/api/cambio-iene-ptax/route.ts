import { NextResponse } from "next/server";
import { buscarPtaxIene } from "../../lib/cotacaoIenePtaxServidor";

export const runtime = "nodejs";
export const revalidate = 900;

// PTAX do iene para a tela do Certificado de Elegibilidade (ver
// app/lib/cotacaoIenePtaxServidor.ts).
export async function GET() {
  return NextResponse.json(await buscarPtaxIene());
}
