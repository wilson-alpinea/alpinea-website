// Portal online dos processos de Documentação (Wilson, 29/out/2026):
// "todos os serviços devem ter formulário totalmente online equivalente ao
// que fazemos com empregos". Mesmo desenho das etapas de /empregos: depois
// do cadastro, o cliente recebe um link com token e segue sozinho pelo
// site — ficha completa + documentos → análise da equipe → contrato com
// aceite eletrônico → comprovante de pagamento → acompanhamento.
// Sem dependências de servidor (usado na página e nas APIs).

import { cpfValido } from "../lib/fichaCadastral";
import type { ServicoDoc } from "./conteudo";
import { TERMOS_PET, TERMOS_VISTO_COE, TERMOS_RACAS } from "./conteudo";

export const urlPortal = (id: string, token: string) => `/documentacao/processo/${id}?t=${token}`;
export const MAX_PESSOAS_FICHA = 15;
export const VERSAO_CONTRATO_DOC = "contrato-documentacao-v1-2026-10-29";

// ── Ficha completa ──
export type CampoFicha = {
  id: string;
  rotulo: string;
  tipo: "texto" | "data" | "cpf" | "opcoes" | "textarea" | "tel";
  opcoes?: string[];
  ajuda?: string;
  placeholder?: string;
  opcional?: boolean;
};

const PESSOA_DOC: CampoFicha[] = [
  { id: "nome", rotulo: "Nome completo (como no passaporte)", tipo: "texto" },
  { id: "relacao", rotulo: "Relação com o titular", tipo: "opcoes", opcoes: ["Titular", "Cônjuge", "Filho(a)"] },
  { id: "nascimento", rotulo: "Data de nascimento", tipo: "data" },
  { id: "sexo", rotulo: "Sexo", tipo: "opcoes", opcoes: ["Feminino", "Masculino"] },
  { id: "estadoCivil", rotulo: "Estado civil", tipo: "opcoes", opcoes: ["Solteiro(a)", "Casado(a)", "União estável", "Divorciado(a)", "Viúvo(a)"] },
  { id: "cpf", rotulo: "CPF", tipo: "cpf" },
  { id: "rg", rotulo: "RG (número e órgão emissor)", tipo: "texto", placeholder: "Ex.: 12.345.678-9 SSP/SP" },
  // Opcionais (Wilson, 29/out/2026): passaporte, validade, pai e mãe.
  { id: "passaporte", rotulo: "Número do passaporte", tipo: "texto", opcional: true, ajuda: "Deixe em branco se não souber informar." },
  { id: "passaporteValidade", rotulo: "Validade do passaporte", tipo: "data", opcional: true, ajuda: "Deixe em branco se não souber informar." },
  { id: "pai", rotulo: "Nome completo do pai", tipo: "texto", opcional: true, ajuda: "Deixe em branco se não souber informar." },
  { id: "mae", rotulo: "Nome completo da mãe", tipo: "texto", opcional: true, ajuda: "Deixe em branco se não souber informar." },
  { id: "profissao", rotulo: "Profissão", tipo: "texto" },
];

const TITULAR_DOC: CampoFicha[] = [
  { id: "endereco", rotulo: "Endereço completo no Brasil", tipo: "textarea", placeholder: "Rua, número, complemento, bairro, cidade, UF e CEP" },
  { id: "ascendenteNome", rotulo: "Nome do ascendente japonês (pai, mãe, avô ou avó)", tipo: "texto", ajuda: "Como aparece no koseki ou na certidão." },
  { id: "ascendenteParentesco", rotulo: "Parentesco do ascendente com o titular", tipo: "opcoes", opcoes: ["Pai", "Mãe", "Avô", "Avó"] },
  { id: "ascendenteProvincia", rotulo: "Província de origem do ascendente (se souber)", tipo: "texto", opcional: true },
];

const GARANTIDOR_DOC: CampoFicha[] = [
  { id: "gNome", rotulo: "Nome completo do garantidor", tipo: "texto" },
  { id: "gNascimento", rotulo: "Data de nascimento do garantidor", tipo: "data" },
  { id: "gEndereco", rotulo: "Endereço do garantidor no Japão", tipo: "textarea" },
  { id: "gTelefone", rotulo: "Telefone do garantidor (WhatsApp)", tipo: "tel" },
  { id: "gEmail", rotulo: "E-mail do garantidor", tipo: "texto", opcional: true },
  { id: "gEmpresa", rotulo: "Empresa onde o garantidor trabalha", tipo: "texto" },
  { id: "gZairyu", rotulo: "Número do zairyu card do garantidor (se não for japonês)", tipo: "texto", opcional: true },
];

const TUTOR_PET: CampoFicha[] = [
  { id: "nome", rotulo: "Nome completo do tutor (como no passaporte)", tipo: "texto" },
  { id: "cpf", rotulo: "CPF", tipo: "cpf" },
  { id: "rg", rotulo: "RG (número e órgão emissor)", tipo: "texto" },
  { id: "passaporte", rotulo: "Número do passaporte", tipo: "texto" },
  { id: "passaporteValidade", rotulo: "Validade do passaporte", tipo: "data" },
  { id: "aeroporto", rotulo: "Aeroporto de chegada no Japão", tipo: "opcoes", opcoes: ["Narita (Tóquio)", "Haneda (Tóquio)", "Kansai (Osaka)", "Chubu (Nagoya)", "Outro / ainda não sei"] },
  { id: "dataViagem", rotulo: "Data prevista da viagem (aproximada)", tipo: "data" },
  { id: "enderecoJapao", rotulo: "Endereço no Japão (se já tiver)", tipo: "textarea", opcional: true },
];

const DADOS_PET: CampoFicha[] = [
  { id: "petSexo", rotulo: "Sexo do pet", tipo: "opcoes", opcoes: ["Fêmea", "Macho"] },
  { id: "petCastrado", rotulo: "Castrado(a)?", tipo: "opcoes", opcoes: ["Sim", "Não"] },
  { id: "petCor", rotulo: "Cor / pelagem", tipo: "texto" },
  { id: "petNascimento", rotulo: "Data de nascimento do pet (aproximada)", tipo: "data" },
  { id: "petMicrochip", rotulo: "Número do microchip (se já tiver)", tipo: "texto", opcional: true },
  { id: "petVeterinario", rotulo: "Veterinário ou clínica atual (nome e cidade)", tipo: "texto", opcional: true },
];

export type EstruturaFicha = {
  porPessoa: CampoFicha[] | null;
  grupos: { id: string; titulo: string; campos: CampoFicha[] }[];
};

export function estruturaFicha(servico: ServicoDoc): EstruturaFicha {
  if (servico === "pet") return { porPessoa: null, grupos: [{ id: "tutor", titulo: "Tutor", campos: TUTOR_PET }, { id: "pet", titulo: "Pet", campos: DADOS_PET }] };
  const grupos = [{ id: "titular", titulo: "Titular e ascendência", campos: TITULAR_DOC }];
  if (servico === "elegibilidade") grupos.push({ id: "garantidor", titulo: "Garantidor no Japão", campos: GARANTIDOR_DOC });
  return { porPessoa: PESSOA_DOC, grupos };
}

export type FichaDoc = { pessoas: Record<string, string>[]; dados: Record<string, string> };

function erroCampo(c: CampoFicha, v: string): string | null {
  const t = (v ?? "").trim();
  if (!t) return c.opcional ? null : "Campo obrigatório.";
  if (c.tipo === "cpf" && !cpfValido(t)) return "CPF inválido.";
  if (c.tipo === "opcoes" && c.opcoes && !c.opcoes.includes(t)) return "Escolha uma opção.";
  if (c.tipo === "data" && !/^\d{4}-\d{2}-\d{2}$/.test(t)) return "Data inválida.";
  return null;
}

/** Erros por campo ("p0.nome", "dados.endereco") — usado na tela e no servidor. */
export function errosFicha(servico: ServicoDoc, f: FichaDoc, pessoasEsperadas: number): Record<string, string> {
  const e = estruturaFicha(servico);
  const erros: Record<string, string> = {};
  if (e.porPessoa) {
    if (f.pessoas.length !== pessoasEsperadas) erros["pessoas"] = `Informe os dados de ${pessoasEsperadas} pessoa(s).`;
    f.pessoas.forEach((p, i) => {
      for (const c of e.porPessoa!) {
        const er = erroCampo(c, p[c.id] ?? "");
        if (er) erros[`p${i}.${c.id}`] = er;
      }
    });
    if (f.pessoas.filter((p) => p.relacao === "Titular").length !== 1) erros["titular"] = "Marque exatamente uma pessoa como titular.";
  }
  for (const g of e.grupos) for (const c of g.campos) {
    const er = erroCampo(c, f.dados[c.id] ?? "");
    if (er) erros[`dados.${c.id}`] = er;
  }
  return erros;
}

/** Limpa o que veio do navegador: só campos conhecidos, textos curtos. */
export function parseFichaDoc(servico: ServicoDoc, bruto: unknown, pessoasEsperadas: number): FichaDoc {
  const e = estruturaFicha(servico);
  const obj = (bruto && typeof bruto === "object" ? bruto : {}) as { pessoas?: unknown; dados?: unknown };
  const limpar = (campos: CampoFicha[], o: unknown) => {
    const r: Record<string, string> = {};
    const src = (o && typeof o === "object" ? o : {}) as Record<string, unknown>;
    for (const c of campos) r[c.id] = String(src[c.id] ?? "").trim().slice(0, c.tipo === "textarea" ? 1000 : 200);
    return r;
  };
  const pessoas = e.porPessoa && Array.isArray(obj.pessoas)
    ? obj.pessoas.slice(0, Math.min(pessoasEsperadas, MAX_PESSOAS_FICHA)).map((p) => limpar(e.porPessoa!, p))
    : [];
  return { pessoas, dados: limpar(e.grupos.flatMap((g) => g.campos), obj.dados) };
}

/** Linhas legíveis da ficha (CRM e e-mail). */
export function linhasFichaDoc(servico: ServicoDoc, f: FichaDoc): { titulo: string; linhas: [string, string][] }[] {
  const e = estruturaFicha(servico);
  const blocos: { titulo: string; linhas: [string, string][] }[] = [];
  if (e.porPessoa) f.pessoas.forEach((p, i) => blocos.push({ titulo: `Solicitante ${i + 1}${p.nome ? ` — ${p.nome}` : ""}`, linhas: e.porPessoa!.map((c) => [c.rotulo, p[c.id] || "—"]) }));
  for (const g of e.grupos) blocos.push({ titulo: g.titulo, linhas: g.campos.map((c) => [c.rotulo, f.dados[c.id] || "—"]) });
  return blocos;
}

/** Nome e CPF de quem assina o contrato (titular ou tutor). */
export function signatarioFicha(servico: ServicoDoc, f: FichaDoc | null): { nome: string; cpf: string } | null {
  if (!f) return null;
  const p = servico === "pet" ? f.dados : f.pessoas.find((x) => x.relacao === "Titular");
  if (!p?.nome || !p?.cpf) return null;
  return { nome: p.nome, cpf: p.cpf };
}

// ── Documentos ──
export type TipoDocumento = { id: string; rotulo: string; ajuda?: string; obrigatorio: boolean };

export function documentosServico(servico: ServicoDoc): TipoDocumento[] {
  if (servico === "pet") {
    return [
      { id: "passaporte_tutor", rotulo: "Passaporte do tutor (página da foto)", obrigatorio: true },
      { id: "rg_cpf_tutor", rotulo: "RG e CPF do tutor (ou CNH)", obrigatorio: true },
      { id: "vacinacao", rotulo: "Carteira de vacinação do pet", ajuda: "Todas as páginas com vacinas registradas.", obrigatorio: true },
      { id: "fotos_pet", rotulo: "Fotos do pet — de frente e de perfil", ajuda: "Usamos para confirmar a raça antes da contratação.", obrigatorio: true },
      { id: "sorologia", rotulo: "Laudo de sorologia (se já tiver)", obrigatorio: false },
      { id: "microchip", rotulo: "Comprovante do microchip (se já tiver)", obrigatorio: false },
    ];
  }
  const base: TipoDocumento[] = [
    { id: "passaportes", rotulo: "Passaporte de cada solicitante (página da foto)", obrigatorio: true },
    { id: "rg_cpf", rotulo: "RG e CPF de cada solicitante (ou CNH)", obrigatorio: true },
    { id: "certidoes", rotulo: "Certidões de nascimento e de casamento", ajuda: "Do titular, do cônjuge e dos filhos. Se tiver, inclua também a do ascendente japonês.", obrigatorio: true },
    { id: "fotos", rotulo: "Foto de cada solicitante (fundo branco, 4,5 × 4,5 cm)", obrigatorio: true },
    { id: "koseki", rotulo: "Koseki tohon (cópia ou original, se tiver)", ajuda: "Se não tiver, a Ajisai busca no Japão.", obrigatorio: false },
  ];
  if (servico === "visto") base.push({ id: "coe", rotulo: "Certificado de Elegibilidade (se já tiver)", obrigatorio: false });
  if (servico === "elegibilidade") base.push({ id: "garantidor", rotulo: "Documentos do garantidor (zairyu card, holerites, juminhyo, kazei shomeisho)", ajuda: "Se o garantidor preferir, ele pode enviar depois pelo mesmo link.", obrigatorio: false });
  return base;
}
export const DOC_COMPROVANTE = "comprovante_pagamento";

export type DocumentoEnviado = { id: string; tipo: string; nome: string; path: string; tamanho: number; enviado_em: string };
export const TIPOS_ARQUIVO_ACEITOS = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const TAMANHO_MAX_ARQUIVO = 10 * 1024 * 1024;
export const MAX_ARQUIVOS_PROCESSO = 60;

export function documentosFaltando(servico: ServicoDoc, docs: DocumentoEnviado[]): TipoDocumento[] {
  return documentosServico(servico).filter((t) => t.obrigatorio && !docs.some((d) => d.tipo === t.id));
}

// ── Contrato ──
export const CONTRATADA_DOC = {
  razaoSocial: "AjisaiWork Japan Agência de Viagens LTDA",
  cnpj: "43.544.605/0001-56",
  marca: "Ajisai",
} as const;

const OBJETO: Record<ServicoDoc, string> = {
  visto: "assessoria na preparação da documentação e no protocolo do pedido de visto específico (descendentes de japoneses até a 3ª geração, cônjuges e dependentes legais) junto à representação consular do Japão no Brasil, incluindo traduções, declarações, entrada presencial por profissional autorizado e envio do passaporte ao endereço do CONTRATANTE",
  elegibilidade: "assessoria na preparação da documentação e no protocolo do pedido de Certificado de Elegibilidade junto à imigração do Japão, incluindo traduções, declarações, advogado de imigração cadastrado, busca do koseki tohon e postagem expressa Japão ⇄ Brasil",
  pet: "assessoria na documentação de exportação de cão ou gato do Brasil para o Japão, incluindo microchip, vacinação antirrábica, sorologia com envio ao laboratório credenciado, Import Permit junto à quarentena animal do Japão e Certificado Veterinário Internacional",
};

const PAGAMENTO: Record<ServicoDoc, string> = {
  visto: "100% (cem por cento) do valor na contratação, por cartão de crédito ou Pix, pelo link de pagamento da Stone no portal do processo.",
  elegibilidade: "50% (cinquenta por cento) antes do início do serviço e 50% (cinquenta por cento) antes da entrada do pedido na imigração, em reais convertidos pela PTAX do dia de cada pagamento, por cartão de crédito ou Pix, pelo link de pagamento da Stone no portal do processo.",
  pet: "100% (cem por cento) do valor na contratação, por cartão de crédito ou Pix, pelo link de pagamento da Stone no portal do processo.",
};

export type DadosContrato = { servico: ServicoDoc; nome: string; cpf: string; valorFinal: string; pessoas: string[]; resumo: string; data: string };

export function textoContrato(d: DadosContrato): { titulo: string; clausulas: string[] } {
  const termos: [string, string][] = d.servico === "pet" ? [...TERMOS_PET, ...TERMOS_RACAS.map(([t, x]) => [t, x] as [string, string])] : TERMOS_VISTO_COE;
  return {
    titulo: "Contrato de prestação de serviços de documentação",
    clausulas: [
      `CONTRATADA: ${CONTRATADA_DOC.razaoSocial}, CNPJ ${CONTRATADA_DOC.cnpj}, que atua sob a marca ${CONTRATADA_DOC.marca}.`,
      `CONTRATANTE: ${d.nome}, CPF ${d.cpf}.${d.pessoas.length > 1 ? ` Solicitantes incluídos: ${d.pessoas.join(", ")}.` : ""}`,
      `OBJETO: ${OBJETO[d.servico]}.${d.resumo ? ` Caso: ${d.resumo}.` : ""}`,
      `VALOR: ${d.valorFinal}, valor final do serviço, sem cobrança por item.`,
      `PAGAMENTO: ${PAGAMENTO[d.servico]}`,
      ...termos.map(([t, x], i) => `${i + 1}. ${t}. ${x}`),
      "DECLARAÇÕES DO CONTRATANTE: as informações e os documentos enviados no cadastro e na ficha são verdadeiros e completos. Informações falsas, omitidas ou incorretas são de responsabilidade exclusiva do CONTRATANTE e não dão direito a reembolso.",
      `ACEITE ELETRÔNICO: o CONTRATANTE aceita este contrato eletronicamente em ${d.data}, digitando nome completo e CPF. O aceite fica registrado com data, hora, endereço IP, navegador e o código de integridade (SHA-256) deste texto, e tem a mesma validade da assinatura.`,
    ],
  };
}

// ── Etapas vistas pelo cliente ──
export const PASSOS_PORTAL = [
  { id: "cadastro", titulo: "Cadastro" },
  { id: "ficha", titulo: "Ficha e documentos" },
  { id: "analise", titulo: "Análise da equipe" },
  { id: "contrato", titulo: "Contrato" },
  { id: "pagamento", titulo: "Pagamento" },
  { id: "andamento", titulo: "Processo em andamento" },
  { id: "concluido", titulo: "Concluído" },
] as const;
export type PassoPortal = (typeof PASSOS_PORTAL)[number]["id"];

export function passoAtual(p: { etapa: string; ficha_enviada_em: string | null; contrato_aceito_em: string | null }): PassoPortal | "encerrado" {
  if (["nao_atende", "negado", "cancelado"].includes(p.etapa)) return "encerrado";
  if (p.etapa === "concluido") return "concluido";
  if (["contratado", "documentacao", "protocolado"].includes(p.etapa)) return "andamento";
  if (p.etapa === "contrato_aceito" || p.contrato_aceito_em) return "pagamento";
  if (p.etapa === "pre_aprovado") return "contrato";
  if (!p.ficha_enviada_em) return "ficha";
  return "analise";
}

/** Texto do valor final usado no contrato e no portal. */
export function textoValorFinal(total: number, moeda: "BRL" | "JPY", servico: ServicoDoc): string {
  if (moeda === "JPY") {
    const ienes = `¥${Math.round(total).toLocaleString("ja-JP")}`;
    return servico === "elegibilidade" ? `${ienes}, pagos em reais pela PTAX do dia de cada parcela (2 × 50%)` : `${ienes}, pagos em reais pela PTAX do dia do pagamento`;
  }
  return total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
