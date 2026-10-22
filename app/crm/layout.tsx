import { interCrm } from "@/lib/crm/fonte";
import "./crm.css";

// Envolve todas as rotas /crm (agência, empregos, portais e login) com a
// tipografia do CRM — tokens e regras em app/crm/crm.css.
export default function CrmRootLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${interCrm.variable} crm-ui`}>{children}</div>;
}
