// Preço do Guia Turístico — puro TypeScript, usado pela página
// /produtos/guia-turistico, pelo CustomPackageCard (re-export) e pela API
// /api/guia-selfservice, que RECALCULA o total antes de gerar o pagamento
// da Stone (Wilson, 29/out/2026: "guia turístico deixar pagamento via Stone").
import { comMargemEImposto } from "./margemPadrao";
import { JPY_POR_USD_REFERENCIA } from "./servicosAdicionaisCatalogo";

// Guia estrangeiro: custo HK Tourist (¥40.000/dia) com a margem padrão.
export const CUSTO_GUIA_JPY_DIA = 40000;
export const DIARIA_GUIA_ESTRANGEIRO_USD = comMargemEImposto(CUSTO_GUIA_JPY_DIA / JPY_POR_USD_REFERENCIA);
// Guia brasileiro: "valor base é 500 dólares, com nossa margem deve ir pra 700 USD/dia".
export const CUSTO_GUIA_BRASILEIRO_USD_DIA = 500;
export const MULTIPLICADOR_GUIA_BRASILEIRO = 1.4;
export const DIARIA_GUIA_USD = Math.round(CUSTO_GUIA_BRASILEIRO_USD_DIA * MULTIPLICADOR_GUIA_BRASILEIRO);
export const GUIA_TAMANHO_GRUPO = 4;
// Gorjeta exigida pelo fornecedor — repassada sem margem.
export const GORJETA_GUIA_USD_PAX_DIA = 7;
// Monte Fuji (Fujikawaguchiko): +US$100 por guia, por dia, nos dois tipos de guia.
export const ADICIONAL_GUIA_MONTE_FUJI_USD = 100;
export const CIDADE_MONTE_FUJI = "Fujikawaguchiko (Monte Fuji)";
export const CIDADES_GUIA = ["Tóquio", "Kyoto", "Osaka", "Nara", "Hakone", CIDADE_MONTE_FUJI];
// Roteiro Personalizado incluído quando o cliente ainda não tem (em reais).
export const ROTEIRO_PRECO_BASE_BRL = comMargemEImposto(1500);

export type TipoGuiaPreco = "brasileiro" | "estrangeiro";

export function calcularPrecoGuia(p: { tipo: TipoGuiaPreco; pessoas: number; cidadesDosDias: string[] }) {
  const pessoas = Math.max(1, Math.floor(p.pessoas));
  const guiasPorDia = Math.max(1, Math.ceil(pessoas / GUIA_TAMANHO_GRUPO));
  const diariaUSD = p.tipo === "brasileiro" ? DIARIA_GUIA_USD : DIARIA_GUIA_ESTRANGEIRO_USD;
  const guiaDiaUSD = diariaUSD * guiasPorDia + GORJETA_GUIA_USD_PAX_DIA * pessoas;
  const diasFuji = p.cidadesDosDias.filter((c) => c === CIDADE_MONTE_FUJI).length;
  const adicionalFujiDiaUSD = ADICIONAL_GUIA_MONTE_FUJI_USD * guiasPorDia;
  const guiaUSD = guiaDiaUSD * p.cidadesDosDias.length + adicionalFujiDiaUSD * diasFuji;
  return { guiasPorDia, diariaUSD, guiaDiaUSD, diasFuji, adicionalFujiDiaUSD, guiaUSD };
}
