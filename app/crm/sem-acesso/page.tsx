import type { Metadata } from "next";
import { obterAcesso } from "@/lib/crm/acesso";
import { PortalShell } from "../PortalShell";

export const metadata: Metadata = {
  title: "Sem acesso — CRM Alpinea",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function SemAcessoPage() {
  const acesso = await obterAcesso();
  return (
    <PortalShell titulo="CRM" empresa="Alpinea" usuario={acesso?.email ?? ""}>
      <div className="mx-auto max-w-md rounded-2xl border border-black/5 bg-white p-6 text-center">
        <h1 className="text-lg font-medium">Seu acesso ainda não foi liberado</h1>
        <p className="mt-2 text-sm text-black/60">
          Peça para a equipe da Alpinea liberar o seu usuário. Se a sua empresa foi desativada, fale com o seu contato na Alpinea.
        </p>
      </div>
    </PortalShell>
  );
}
