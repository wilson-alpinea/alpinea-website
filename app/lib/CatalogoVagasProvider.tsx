"use client";

import { createContext, useContext, useMemo } from "react";
import { VAGAS, type Vaga } from "./vagasCatalogo";
import { aplicarEdicoes, type MapaEdicoes } from "./vagasEdicao";

// Catálogo com as edições do CRM para os componentes de cliente de /empregos
// (Wilson, 03/nov/2026). O layout de /empregos busca as edições no servidor
// e passa só o mapa de alterações (pequeno) — o catálogo já vem no bundle.
// Fora do provider, o hook devolve o catálogo do código.
const Contexto = createContext<MapaEdicoes>({});

export function CatalogoVagasProvider({ edicoes, children }: { edicoes: MapaEdicoes; children: React.ReactNode }) {
  return <Contexto.Provider value={edicoes}>{children}</Contexto.Provider>;
}

export function useCatalogoVagas(): Vaga[] {
  const edicoes = useContext(Contexto);
  return useMemo(() => aplicarEdicoes(VAGAS, edicoes), [edicoes]);
}
