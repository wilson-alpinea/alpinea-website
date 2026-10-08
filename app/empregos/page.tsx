import EmpregosCliente from "./EmpregosCliente";
import { idsVagasInativas } from "@/lib/empregos/vagasAtivas";

// /empregos — o conteúdo está em EmpregosCliente.tsx. Este wrapper de
// servidor só busca as vagas desligadas no CRM (/crm/empregos/vagas).
// O CRM revalida /empregos ao salvar; os 60s são só uma rede de segurança.
export const revalidate = 60;

export default async function EmpregosPage() {
  const inativas = await idsVagasInativas();
  return <EmpregosCliente inativas={[...inativas]} />;
}
