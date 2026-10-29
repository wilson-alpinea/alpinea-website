// Preço da solicitação 100% online (Wilson, 29/out/2026: "formulário online
// para solicitação 100% online ... pagamento online via stone"). Visto e
// Certificado de Elegibilidade têm tabela fechada, então o servidor calcula
// o valor final a partir do cadastro — o navegador nunca manda o preço.
// Sem dependências de servidor.
import { CONSULADOS, precoCOEJPY, type ServicoDoc } from "@/app/documentacao/conteudo";

export const MAX_PESSOAS_ONLINE = { visto: 10, elegibilidade: 5 } as const;

export type PrecoOnline = { total: number; moeda: "BRL" | "JPY"; porPessoa: number | null; detalhe: string };

export function precoOnline(servico: ServicoDoc, campos: Record<string, string>): PrecoOnline | null {
  const qtd = Math.floor(Number(campos.qtd) || 0);
  if (servico === "visto") {
    const c = CONSULADOS.find((x) => x.id === campos.consuladoId);
    if (!c || !["Sim", "Não"].includes(campos.temCOE) || qtd < 1 || qtd > MAX_PESSOAS_ONLINE.visto) return null;
    const porPessoa = campos.temCOE === "Sim" ? c.comCOE : c.semCOE;
    return { total: porPessoa * qtd, moeda: "BRL", porPessoa, detalhe: `${c.nome} · ${campos.temCOE === "Sim" ? "com" : "sem"} Certificado de Elegibilidade · ${qtd} pessoa(s)` };
  }
  if (servico === "elegibilidade") {
    if (qtd < 1 || qtd > MAX_PESSOAS_ONLINE.elegibilidade) return null;
    const total = precoCOEJPY(qtd, /c[oô]njuge/i.test(campos.perfil ?? "") ? "conjuge" : "descendente");
    if (!total) return null;
    return { total, moeda: "JPY", porPessoa: null, detalhe: `${qtd} pessoa(s)` };
  }
  return null;
}
