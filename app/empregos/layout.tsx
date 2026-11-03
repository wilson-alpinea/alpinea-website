import { PixelOpenAI } from "./PixelOpenAI";
import { CatalogoVagasProvider } from "../lib/CatalogoVagasProvider";
import { edicoesVagas } from "@/lib/empregos/vagasAtivas";

// Layout de /empregos: pixel da OpenAI (Wilson, 27/out/2026) e as edições de
// vaga feitas no CRM para os componentes de cliente (Wilson, 03/nov/2026).
export default async function EmpregosLayout({ children }: { children: React.ReactNode }) {
  const edicoes = await edicoesVagas();
  return (
    <CatalogoVagasProvider edicoes={edicoes}>
      <PixelOpenAI />
      {children}
    </CatalogoVagasProvider>
  );
}
