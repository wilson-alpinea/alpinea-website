// Edição das vagas pelo CRM (Wilson, 03/nov/2026: "é possível editar os
// detalhes da vaga pelo CRM?" → "Tudo"). O catálogo continua em
// vagasCatalogo.ts; o CRM grava em public.vagas_edicoes (migração 033) só os
// campos que ficaram diferentes do código, e o site aplica por cima.
//
// Fora da edição (continuam no código): id (URL e chave no banco), código
// AJ-xxxx e as regras do funil — custos cobertos, testes de aptidão,
// critérios de triagem e fonte do contrato. Mudar essas regras com
// candidatos no meio do processo quebraria as etapas já em andamento.
//
// Arquivo puro (sem servidor nem "use client"): usado pelo CRM, pelas
// páginas do site, pelas APIs e pelo provider do cliente.

import type { InfoVaga, PublicoKey, SetorKey, StatusVaga, Vaga } from "./vagasCatalogo";

export const CAMPOS_TEXTO = ["empresa", "titulo", "regiao", "cidade", "turno", "contrato", "salario", "publicadaEm"] as const;
export const CAMPOS_OPCIONAIS = ["idioma", "perfil", "conducao", "observacoes", "logo"] as const;
export const CAMPOS_INFO_TEXTO = ["moradia", "kitBoasVindas", "bonus", "sobreCidade"] as const;
export const CAMPOS_INFO_LISTA = ["beneficios", "diferenciaisHospedagem"] as const;

type CampoTexto = (typeof CAMPOS_TEXTO)[number];
type CampoOpcional = (typeof CAMPOS_OPCIONAIS)[number];

export type EdicaoVaga = Partial<Pick<Vaga, CampoTexto>> &
  Partial<Record<CampoOpcional, string | null>> & {
    setor?: SetorKey;
    status?: StatusVaga;
    publico?: PublicoKey[];
    info?: Partial<InfoVaga>;
  };

export type MapaEdicoes = Record<string, EdicaoVaga>;

const SETORES: SetorKey[] = ["automotivo", "eletronicos", "alimenticio", "materiais"];
const STATUS: StatusVaga[] = ["aberta", "consulta"];
const PUBLICOS: PublicoKey[] = ["brasil", "japao"];
const DATA = /^\d{4}-\d{2}-\d{2}$/;

const texto = (v: unknown, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);
const lista = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").map((x) => x.trim().slice(0, 600)).filter(Boolean).slice(0, 40) : undefined);

/** Valida o JSON vindo do banco/formulário — campo inválido é descartado. */
export function lerEdicao(bruto: unknown): EdicaoVaga {
  if (!bruto || typeof bruto !== "object") return {};
  const b = bruto as Record<string, unknown>;
  const e: EdicaoVaga = {};
  for (const k of CAMPOS_TEXTO) {
    const t = texto(b[k]);
    if (t && (k !== "publicadaEm" || DATA.test(t))) e[k] = t;
  }
  for (const k of CAMPOS_OPCIONAIS) {
    if (b[k] === null) e[k] = null;
    else {
      const t = texto(b[k], k === "logo" ? 600 : 4000);
      if (t !== undefined) e[k] = t || null;
    }
  }
  if (e.logo && !/^(https:\/\/|\/images\/)/.test(e.logo)) delete e.logo;
  if (SETORES.includes(b.setor as SetorKey)) e.setor = b.setor as SetorKey;
  if (STATUS.includes(b.status as StatusVaga)) e.status = b.status as StatusVaga;
  if (Array.isArray(b.publico)) {
    const p = PUBLICOS.filter((x) => (b.publico as unknown[]).includes(x));
    if (p.length) e.publico = p;
  }
  if (b.info && typeof b.info === "object") {
    const bi = b.info as Record<string, unknown>;
    const info: Partial<InfoVaga> = {};
    for (const k of CAMPOS_INFO_TEXTO) {
      if (bi[k] === null) info[k] = null;
      else {
        const t = texto(bi[k]);
        if (t !== undefined) info[k] = t || null;
      }
    }
    for (const k of CAMPOS_INFO_LISTA) {
      const l = lista(bi[k]);
      if (l) info[k] = l;
    }
    if (Object.keys(info).length) e.info = info;
  }
  return e;
}

/** Vaga do código + edição do CRM. */
export function aplicarEdicao(vaga: Vaga, edicao: EdicaoVaga | undefined): Vaga {
  if (!edicao || Object.keys(edicao).length === 0) return vaga;
  const { info, ...resto } = edicao;
  const v: Vaga = { ...vaga, info: { ...vaga.info, ...(info ?? {}) } };
  for (const [k, val] of Object.entries(resto)) {
    // null em campo opcional = apagar o campo (ex.: tirar o logo).
    (v as Record<string, unknown>)[k] = val === null ? undefined : val;
  }
  return v;
}

export function aplicarEdicoes(vagas: Vaga[], mapa: MapaEdicoes): Vaga[] {
  return vagas.map((v) => aplicarEdicao(v, mapa[v.id]));
}

const igual = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Guarda só o que difere do código — campo igual ao original continua seguindo o código. */
export function diferencaDoOriginal(original: Vaga, editada: EdicaoVaga): EdicaoVaga {
  const d: EdicaoVaga = {};
  const { info, ...resto } = editada;
  for (const [k, val] of Object.entries(resto)) {
    if (!igual(val, (original as Record<string, unknown>)[k])) (d as Record<string, unknown>)[k] = val;
  }
  if (info) {
    const di: Partial<InfoVaga> = {};
    for (const [k, val] of Object.entries(info)) {
      if (!igual(val, (original.info as Record<string, unknown>)[k])) (di as Record<string, unknown>)[k] = val;
    }
    if (Object.keys(di).length) d.info = di;
  }
  return d;
}
