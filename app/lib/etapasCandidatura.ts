// Ordem das etapas da candidatura de /empregos (Wilson, 06/out/2026):
//   1) formulário + currículo (score) → 2) ficha cadastral + foto (score 80+)
//   → 3) proposta de financiamento (só se a empresa não custeia)
//   → 4) agendamento da pré-entrevista (depois do aceite da etapa 3).
// Todas as páginas das etapas 2–4 usam o mesmo token da candidatura.

import { encontrarVaga } from "./vagasCatalogo";

export type EtapaPublica = "ficha" | "proposta" | "agendamento";

export const urlEtapa = (etapa: EtapaPublica, id: string, token: string) => `/empregos/${etapa}/${id}?t=${token}`;

/** true quando a vaga NÃO tem os custos pagos pela empresa — aí existe a etapa 3. */
export const vagaPrecisaProposta = (vagaId: string) => encontrarVaga(vagaId)?.custosCobertosPelaEmpresa !== true;

type Linha = {
  vaga_id: string;
  ficha_enviada_em?: string | null;
  foto_path?: string | null;
  proposta_status?: string | null;
};

export function proximaEtapa(c: Linha): EtapaPublica {
  if (!c.ficha_enviada_em || !c.foto_path) return "ficha";
  if (vagaPrecisaProposta(c.vaga_id) && c.proposta_status !== "aceita") return "proposta";
  return "agendamento";
}
