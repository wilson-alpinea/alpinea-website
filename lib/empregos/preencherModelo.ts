// Preenche o arquivo ORIGINAL de uma ficha de empreiteira (Word ou Excel)
// sem recriar o documento: só troca as marcas {{chave}} pelo valor e marca
// as caixas de seleção do Word com tag cb:chave. Tudo o mais (layout,
// fontes, logos, quebras de página) fica byte a byte como no original.
// Os modelos marcados ficam em lib/empregos/modelos/ (ver scripts/modelos-fichas/).

import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import type { ValoresModelo } from "./valoresModelos";

const PASTA_MODELOS = path.join(process.cwd(), "lib", "empregos", "modelos");

const escXml = (s: string) =>
  s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const XML_COM_TEXTO = /^(word\/(document|header\d*|footer\d*)\.xml|xl\/sharedStrings\.xml|xl\/worksheets\/sheet\d+\.xml)$/;

export async function preencherModelo(
  arquivo: string,
  valores: ValoresModelo,
  opcoes: { fotoJpeg?: Buffer | null; paisagem?: boolean } = {},
): Promise<{ buffer: Buffer; faltando: string[] }> {
  const zip = await JSZip.loadAsync(await readFile(path.join(PASTA_MODELOS, arquivo)));
  const faltando = new Set<string>();

  for (const nome of Object.keys(zip.files)) {
    if (!XML_COM_TEXTO.test(nome)) continue;
    let xml = await zip.file(nome)!.async("string");

    // Caixas de seleção do Word (content control w14:checkbox com tag cb:chave).
    xml = xml.replace(/<w:sdt>(?:(?!<\/w:sdt>)[\s\S])*?<w:tag w:val="cb:([^"]+)"\/>(?:(?!<\/w:sdt>)[\s\S])*?<\/w:sdt>/g, (bloco, chave: string) => {
      if (!(`cb:${chave}` in valores)) faltando.add(`cb:${chave}`);
      if (!valores[`cb:${chave}`]) return bloco;
      return bloco.replace(/w14:checked w14:val="0"/, 'w14:checked w14:val="1"').replace(/<w:t>☐<\/w:t>/, "<w:t>☒</w:t>");
    });

    // Página em paisagem (Wilson, 29/out/2026: no Google Docs a Lista de
    // Verificação cortava à direita em retrato). Troca largura/altura do A4.
    if (opcoes.paisagem && nome === "word/document.xml") {
      xml = xml.replace(/<w:pgSz w:w="(\d+)" w:h="(\d+)"([^>]*)\/>/g, (_m, w: string, h: string, resto: string) => {
        const [maior, menor] = Number(w) >= Number(h) ? [w, h] : [h, w];
        return `<w:pgSz w:w="${maior}" w:h="${menor}" w:orient="landscape"${resto.replace(/\s*w:orient="[^"]*"/, "")}/>`;
      });
    }

    // Texto: {{chave}} → valor (vazio quando não houver dado).
    xml = xml.replace(/\{\{([A-Za-z0-9_]+)\}\}/g, (_, chave: string) => {
      if (!(chave in valores)) faltando.add(chave);
      return escXml(valores[chave] ?? "");
    });
    zip.file(nome, xml);
  }

  // Foto do candidato no Excel: troca a imagem-placeholder do modelo.
  const placeholder = Object.keys(zip.files).find((n) => /^xl\/media\/image1\.jpe?g$/.test(n));
  if (placeholder && opcoes.fotoJpeg) zip.file(placeholder, opcoes.fotoJpeg);

  // Excel recalcula fórmulas (ex.: =N6 do nome na 2ª página) ao abrir.
  const wb = zip.file("xl/workbook.xml");
  if (wb) {
    let xml = await wb.async("string");
    xml = /<calcPr\b/.test(xml)
      ? xml.replace(/<calcPr\b([^>]*?)\/?>/, (m, attrs: string) => (/fullCalcOnLoad/.test(attrs) ? m : `<calcPr${attrs} fullCalcOnLoad="1"/>`))
      : xml.replace("</workbook>", '<calcPr fullCalcOnLoad="1"/></workbook>');
    zip.file("xl/workbook.xml", xml);
  }

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  return { buffer, faltando: [...faltando] };
}
