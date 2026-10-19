import EmpregosCliente from "./EmpregosCliente";
import { idsVagasInativas } from "@/lib/empregos/vagasAtivas";
import { DESCRICAO_EMPREGOS, TITULO_EMPREGOS, metaEmpregos } from "@/lib/empregos/metaCompartilhamento";

// Prévia do link (WhatsApp, redes): logo Ajisai + resumo da página.
export const metadata = metaEmpregos({ titulo: TITULO_EMPREGOS, descricao: DESCRICAO_EMPREGOS, url: "https://www.alpinea.io/empregos" });

// /empregos — o conteúdo está em EmpregosCliente.tsx. Este wrapper de
// servidor só busca as vagas desligadas no CRM (/crm/empregos/vagas).
// O CRM revalida /empregos ao salvar; os 60s são só uma rede de segurança.
export const revalidate = 60;

export default async function EmpregosPage() {
  const inativas = await idsVagasInativas();
  return <EmpregosCliente inativas={[...inativas]} />;
}
