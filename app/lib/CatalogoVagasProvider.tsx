"use client";

import { createContext, useContext, useMemo } from "react";
import { VAGAS, type Vaga } from "./vagasCatalogo";
import { aplicarEdicoes, type MapaEdicoes } from "./vagasEdicao";

// Catálogo com as edições do CRM para os componentes de cliente de /empregos
// (Wilson, 03/nov/2026). O layout de /empregos busca as edições no servidor
// e passa só o mapa de alterações (pequeno) — o catálogo já vem no bundle.
// Fora do provider, o hook devolve o catálogo do código.
// Vagas criadas no CRM (migração 034) vêm inteiras, já montadas no servidor.
type Valor = { edicoes: MapaEdicoes; novas: Vaga[] };
const Contexto = createContext<Valor>({ edicoes: {}, novas: [] });

export function CatalogoVagasProvider({ edicoes, novas, children }: { edicoes: MapaEdicoes; novas: Vaga[]; children: React.ReactNode }) {
  const valor = useMemo(() => ({ edicoes, novas }), [edicoes, novas]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCatalogoVagas(): Vaga[] {
  const { edicoes, novas } = useContext(Contexto);
  return useMemo(() => [...aplicarEdicoes(VAGAS, edicoes), ...novas], [edicoes, novas]);
}
