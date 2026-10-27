// Valores que preenchem os ARQUIVOS ORIGINAIS das fichas das empreiteiras
// (Wilson, 15/out/2026: "ele precisa preencher o excel/word que eu enviei e
// não criar um arquivo novo"). Cada modelo em lib/empregos/modelos/ tem
// marcas {{chave}} nos campos e, no Word, caixas de seleção com a tag
// cb:chave. Aqui fica o DE→PARA chave → valor do candidato. Caixa marcada =
// valor "X" (qualquer texto não vazio). Chave sem valor = campo em branco.
// As marcas foram colocadas com os scripts de scripts/modelos-fichas/.

import { ASCENDENCIA_JAPONESA, NIVEIS_JAPONES_DETALHADOS, QUANDO_EMBARCAR } from "@/app/lib/candidaturaScoring";
import { itensListaFicha, valorFicha } from "@/app/lib/fichaCadastral";
import type { ContextoFicha } from "@/app/lib/fichasParceiros";
import { OPCOES_FUMANTE, REGIOES_TATUAGEM, TIPOS_DIABETES, descreverTatuagem, formatarCep } from "@/app/lib/triagemPerfil";

export type ValoresModelo = Record<string, string>;

const X = (cond: unknown) => (cond ? "X" : "");
const juntar = (sep: string, ...partes: (string | undefined | null | false)[]) => partes.filter(Boolean).join(sep);

function hojeSP() {
  const [d, m, a] = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }).split("/");
  return { d, m, a, br: `${d}/${m}/${a}`, jp: `${a}/${m}/${d}` };
}

/** dd/mm/aaaa → idade em anos (vazio se a data não for válida). */
function idadeDe(data: string) {
  const [d, m, a] = data.split("/").map(Number);
  if (!d || !m || !a) return "";
  const hoje = new Date();
  let anos = hoje.getFullYear() - a;
  if (hoje.getMonth() + 1 < m || (hoje.getMonth() + 1 === m && hoje.getDate() < d)) anos--;
  return anos >= 0 && anos < 130 ? String(anos) : "";
}

/** "+55 (11) 93030-0101" → { ddd: "11", numero: "93030-0101" }. */
function separarTelefone(tel: string) {
  let d = tel.replace(/\D/g, "");
  if (d.length >= 12 && (d.startsWith("55") || d.startsWith("81"))) d = d.slice(2);
  if (d.length < 10) return { ddd: "", numero: tel };
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  return { ddd, numero: resto.length > 4 ? `${resto.slice(0, -4)}-${resto.slice(-4)}` : resto };
}

/** Atalhos comuns sobre o contexto do candidato. */
function base(x: ContextoFicha) {
  const f = x.f;
  const v = (id: string) => valorFicha(f, id);
  const raw = (id: string) => f?.valores[id];
  const lista = (id: string): string[] => {
    const r = raw(id);
    return Array.isArray(r) ? r : r ? [r] : [];
  };
  const p = x.p;
  const nascimento = v("dataNascimento");
  const idade = x.c.idade ? String(x.c.idade) : idadeDe(nascimento);
  const escolaridade = p?.escolaridade ?? "";
  const tel = separarTelefone(x.c.telefone ?? "");
  const fixo = separarTelefone(v("telefoneFixo"));
  const expBR = itensListaFicha(f, "experienciasBrasil");
  const expJP = itensListaFicha(f, "experienciasJapao");
  const filhos = itensListaFicha(f, "filhos");
  const irmaos = itensListaFicha(f, "irmaos");
  const saude = (id: string) => ({ sim: raw(id) === "sim", nao: raw(id) === "nao", detalhe: v(`${id}Detalhe`) });
  const fumante = p?.fumante === "diario" || p?.fumante === "ocasional";
  const medicamento = p?.medicacaoControlada === "sim" || raw("medicamentoRegular") === "sim";
  const semMedicamento = p?.medicacaoControlada === "nao" && raw("medicamentoRegular") !== "sim";
  const turno = (id: string) => raw(id) as string | undefined;
  const aceitaTurno = (id: string) => turno(id) === "prefere" || turno(id) === "aceita";
  const fds = lista("fimDeSemana");
  const temTatuagem = p?.tatuagem === "sim" || p?.tatuagemVisivel === "sim";
  const semTatuagem = p?.tatuagem === "nao" || (!p?.tatuagem && p?.tatuagemVisivel === "nao");
  const regioesTatuagem = (p?.tatuagemRegioes ?? []).map((r) => REGIOES_TATUAGEM.find((o) => o.key === r)?.label ?? r).join(", ");
  const objetivos = juntar(", ", v("objetivos"), v("objetivoOutro"));
  const embarque = v("mesEmbarque") || (QUANDO_EMBARCAR.find((q) => q.key === x.r.quandoEmbarcar)?.label ?? "");
  const nivelJLPT = NIVEIS_JAPONES_DETALHADOS.find((n) => n.key === x.r.nivelJaponesDetalhado);
  return {
    f, v, raw, lista, p, nascimento, idade, escolaridade, tel, fixo, expBR, expJP, filhos, irmaos, saude, fumante, medicamento,
    semMedicamento, aceitaTurno, turno, fds, temTatuagem, semTatuagem, regioesTatuagem, objetivos, embarque, nivelJLPT,
    nome: `${x.c.nome} ${x.c.sobrenome}`.trim(),
    endereco: juntar(", ", v("logradouro"), v("numero"), v("complemento")),
    cep: p?.cepResidencia ? formatarCep(p.cepResidencia) : "",
    reEntrySim: x.r.reEntry === "sim",
    reEntryNao: x.r.reEntry === "nao",
    hoje: hojeSP(),
  };
}

// ── AVCORP / Rainichisha (Word) ───────────────────────────────────────
function avcorp(x: ContextoFicha): ValoresModelo {
  const b = base(x);
  const { v, raw, p } = b;
  const nac = raw("nacionalidade");
  const asc = x.r.ascendencia;
  const e = b.escolaridade;
  const fund1 = e === "fundamentalIncompleto";
  const fund2 = e === "fundamentalCompleto";
  const medio = e === "medioIncompleto" || e === "medioCompleto" || e === "tecnico";
  const superior = ["superiorIncompleto", "superiorCompleto", "posGraduacao", "mestrado", "doutorado"].includes(e);
  const incompleto = ["fundamentalIncompleto", "medioIncompleto", "superiorIncompleto"].includes(e);
  const conv = raw("japonesConversacao");
  const leitura = (id: string) => ({ S: X(raw(id) === "pouco" || raw(id) === "bem"), N: X(raw(id) === "nao") });
  const visto = raw("situacaoVisto");
  const exAvance = raw("exEmpreiteira") === "sim" && /avance/i.test(v("exEmpreiteiraQual"));
  const out: ValoresModelo = {
    hoje: b.hoje.jp,
    agencia: "Ajisai",
    nome: b.nome,
    nascimento: b.nascimento,
    estadoCivil: v("estadoCivil"),
    "cb:nacJaponesa": X(nac === "japonesa"),
    "cb:nacBrasileira": X(nac === "brasileira"),
    "cb:nacDupla": X(nac === "dupla"),
    "cb:nacOutra": X(nac === "outra"),
    "cb:nissei": X(asc === "nissei"),
    "cb:sansei": X(asc === "sansei"),
    "cb:yonsei": X(asc === "yonsei"),
    "cb:conjugeDescendente": X(asc === "conjugeDependente"),
    filhos: p?.temFilhos === "sim" ? `Sim (${p.idadesFilhos.length})` : p?.temFilhos === "nao" ? "Não" : "",
    endereco: b.endereco,
    bairro: v("bairro"),
    cidade: v("cidade"),
    uf: v("uf"),
    cep: b.cep,
    email: x.c.email,
    telefone: x.c.telefone,
    "cb:escFund1": X(fund1),
    "cb:escFund2": X(fund2),
    "cb:escMedio": X(medio),
    "cb:escSuperior": X(superior),
    "cb:escIncompleto": X(e && incompleto),
    "cb:escCompleto": X(e && !incompleto),
    curso: juntar(" · ", v("curso"), v("instituicao"), v("cursoConclusao")) || (e === "tecnico" ? "Curso técnico" : ""),
    "cb:jlptSim": X(b.nivelJLPT && /^n[1-5]$/.test(b.nivelJLPT.key)),
    "cb:jlptNao": X(b.nivelJLPT && !/^n[1-5]$/.test(b.nivelJLPT.key)),
    jlptNivel: b.nivelJLPT && /^n[1-5]$/.test(b.nivelJLPT.key) ? b.nivelJLPT.key.toUpperCase() : "",
    "cb:convNada": X(conv === "nada"),
    "cb:convCumprimentos": X(conv === "cumprimentos"),
    "cb:convBasico": X(conv === "basico"),
    "cb:convIntermediario": X(conv === "intermediario"),
    "cb:convFluente": X(conv === "fluente"),
    "cb:japaoSim": X(p?.jaEsteveJapao === "sim"),
    "cb:japaoNao": X(p?.jaEsteveJapao === "nao"),
    vezesJapao: v("vezesJapao"),
    tempoJapao: v("tempoJapao"),
    "cb:exAvanceSim": X(exAvance),
    "cb:exAvanceNao": X(raw("exEmpreiteira") && !exAvance),
    exAvanceFabrica: exAvance ? v("exEmpreiteiraQual") : "",
    objetivo: b.objetivos,
    "cb:vistoPermanente": X(visto === "permanente"),
    "cb:vistoSolicitar": X(visto === "naoTenho"),
    "cb:vistoNovo": X(visto === "vistoNovo"),
    "cb:vistoZairyu": X(visto === "zairyu"),
    "cb:vistoProtocolado": X(visto === "protocolado"),
    vistoNovoData: visto === "vistoNovo" ? v("vistoData") : "",
    zairyuValidade: visto === "zairyu" ? v("vistoData") : "",
    protocoladoPrevisao: visto === "protocolado" ? v("vistoData") : "",
    "cb:reEntrySim": X(b.reEntrySim),
    "cb:reEntryNao": X(b.reEntryNao),
    reEntryValidade: v("reEntryValidade"),
    "cb:ceSim": X(raw("certificadoElegibilidade") === "sim"),
    "cb:ceNao": X(raw("certificadoElegibilidade") === "nao"),
    ceEmissao: v("ceEmissao"),
    ceValidade: v("ceValidade"),
    "cb:parentesSim": X(raw("parentesJapao") === "sim"),
    "cb:parentesNao": X(raw("parentesJapao") === "nao"),
    "cb:kosekiAtual": X(raw("kosekiTohon") === "atual"),
    "cb:kosekiAntigo": X(raw("kosekiTohon") === "antigo"),
    "cb:kosekiNao": X(raw("kosekiTohon") === "nao"),
    refNome: v("refJpNome"),
    refEndereco: juntar(", ", v("refJpEndereco"), v("refJpProvincia")),
    refTel: v("refJpTelefone"),
    refParentesco: v("refJpParentesco"),
    obs: v("observacoes"),
    rg: juntar(" ", v("rg"), v("rgEmissor")),
    passaporte: juntar(" — val. ", v("passaporteNumero"), v("passaporteValidade")),
    cpf: v("cpf"),
    embarque: b.embarque,
  };
  for (const [k, id] of [["Hira", "Hiragana"], ["Kata", "Katakana"], ["Kanji", "Kanji"]] as const) {
    const le = leitura(`le${id}`);
    const es = leitura(`escreve${id}`);
    out[`cb:le${k}S`] = le.S;
    out[`cb:le${k}N`] = le.N;
    out[`cb:esc${k}S`] = es.S;
    out[`cb:esc${k}N`] = es.N;
  }
  b.expBR.slice(0, 5).forEach((e, i) => {
    Object.assign(out, {
      [`br${i}_empresa`]: e.empresa,
      [`br${i}_funcao`]: e.funcao,
      [`br${i}_local`]: e.cidade,
      [`br${i}_inicio`]: e.inicio,
      [`br${i}_saida`]: e.saida || "atual",
      [`br${i}_motivo`]: e.motivoSaida,
    });
  });
  b.expJP.slice(0, 5).forEach((e, i) => {
    Object.assign(out, {
      [`jp${i}_empresa`]: juntar(" / ", e.fabrica, e.empreiteira),
      [`jp${i}_funcao`]: e.funcao,
      [`jp${i}_local`]: juntar(", ", e.cidade, e.provincia),
      [`jp${i}_inicio`]: e.inicio,
      [`jp${i}_saida`]: e.saida || "atual",
      [`jp${i}_motivo`]: e.motivoSaida,
      [`jp${i}_shakai`]: e.shakaiHoken,
    });
  });
  return out;
}

// ── Lista de Verificação (Word) ───────────────────────────────────────
const ITENS_LISTA: [string, string][] = [
  ["piercing", "piercing"],
  ["alergia", "alergia"],
  ["asma", "asmaBronquite"],
  ["auditiva", "deficienciaAuditiva"],
  ["cardiaco", "problemaCardiaco"],
  ["coluna", "problemaColuna"],
  ["emPe", "restricaoEmPe"],
  ["fratura", "fratura"],
  ["acidente", "acidente"],
  ["pino", "pinoPlaca"],
  ["cirurgia", "cirurgia"],
  ["movimento", "dificuldadeMovimento"],
  ["maos", "limitacaoMaos"],
];
const ROTULO_ITEM: Record<string, string> = {
  piercing: "Piercing",
  alergia: "Alergia",
  asmaBronquite: "Asma/bronquite",
  deficienciaAuditiva: "Deficiência auditiva",
  problemaCardiaco: "Problema cardíaco",
  problemaColuna: "Coluna",
  restricaoEmPe: "Restrição em pé",
  fratura: "Fratura",
  acidente: "Acidente",
  pinoPlaca: "Pino/placa",
  cirurgia: "Cirurgia",
  dificuldadeMovimento: "Dificuldade de movimento",
  limitacaoMaos: "Limitação mãos/punhos",
};

function lista(x: ContextoFicha): ValoresModelo {
  const b = base(x);
  const { v, raw, p } = b;
  const sexo = raw("sexo");
  const levar = raw("levarFamilia");
  const pessoa = (pre: string) => ({ nome: v(`${pre}Nome`), mora: v(`${pre}Mora`), idade: v(`${pre}Idade`) });
  const oculos = raw("oculos");
  const grau = b.lista("oculosGrauTipo");
  const qualif = b.lista("qualificacoes");
  const cnhBR = raw("cnhBrasil") === "sim";
  const cnhJP = raw("cnhJapao") === "sim";
  const turnoCb = (pre: string, id: string) => ({
    [`cb:${pre}P`]: X(b.turno(id) === "prefere"),
    [`cb:${pre}A`]: X(b.turno(id) === "aceita"),
    [`cb:${pre}N`]: X(b.turno(id) === "naoAceita"),
  });
  const he = p?.horasExtras;
  const pai = pessoa("pai");
  const mae = pessoa("mae");
  const detalhesSaude = [
    b.temTatuagem && `Tatuagem: ${descreverTatuagem(p)}`,
    ...ITENS_LISTA.map(([, id]) => (b.saude(id).sim ? `${ROTULO_ITEM[id]}: ${b.saude(id).detalhe || "sim"}` : "")),
    p?.diabetes === "sim" && `Diabetes: ${TIPOS_DIABETES.find((t) => t.key === p.diabetesTipo)?.label ?? "sim"}`,
    p?.doencaGrave === "sim" && `Doença grave: ${p.doencaGraveDescricao || "sim"}${p.emTratamento === "sim" ? " (em tratamento)" : ""}`,
    raw("tratamentoPsicologico") === "sim" && `Tratamento psicológico: ${v("tratamentoPsicologicoDetalhe") || "sim"}`,
    b.fumante && `Fumante: ${OPCOES_FUMANTE.find((o) => o.key === p?.fumante)?.label ?? ""}`,
  ].filter(Boolean) as string[];

  const out: ValoresModelo = {
    nome: b.nome,
    nascimento: b.nascimento,
    idade: b.idade,
    "cb:sexoM": X(sexo === "masculino"),
    "cb:sexoF": X(sexo === "feminino"),
    "cb:filhosSim": X(p?.temFilhos === "sim"),
    "cb:filhosNao": X(p?.temFilhos === "nao"),
    qtdFilhos: p?.temFilhos === "sim" ? String(b.filhos.length || p.idadesFilhos.length) : "",
    "cb:levarSim": X(levar === "juntos" || levar === "depois"),
    "cb:levarNao": X(levar === "nao"),
    levarDetalhe: levar === "juntos" || levar === "depois" ? juntar(" — ", v("levarFamiliaQuem"), levar === "juntos" ? "vão juntos" : `vão depois ${v("levarFamiliaQuando")}`) : "",
    pai_nome: pai.nome,
    pai_mora: pai.mora,
    pai_nasc: pai.idade && `${pai.idade} anos`,
    mae_nome: mae.nome,
    mae_mora: mae.mora,
    mae_nasc: mae.idade && `${mae.idade} anos`,
    conjuge_nome: v("conjugeNome"),
    conjuge_mora: v("conjugeMora"),
    conjuge_nasc: v("conjugeNascimento"),
    altura: p?.alturaCm ? `${p.alturaCm} cm` : "",
    peso: p?.pesoKg ? `${p.pesoKg} kg` : "",
    cintura: v("cinturaCm"),
    camisa: v("camisa"),
    calca: v("calca"),
    calcado: v("calcado"),
    fumante_S: X(b.fumante),
    fumante_N: X(p?.fumante === "nao" || p?.fumante === "exFumante"),
    tatuagem_S: X(b.temTatuagem),
    tatuagem_N: X(b.semTatuagem),
    diabetes_S: X(p?.diabetes === "sim"),
    diabetes_N: X(p?.diabetes === "nao"),
    bemPsico_S: X(raw("tratamentoPsicologico") === "nao"),
    bemPsico_N: "",
    tratPsico_S: X(raw("tratamentoPsicologico") === "sim"),
    tratPsico_N: X(raw("tratamentoPsicologico") === "nao"),
    doencaGrave_S: X(p?.doencaGrave === "sim"),
    doencaGrave_N: X(p?.doencaGrave === "nao"),
    barba_S: X(raw("barbaCabelo") === "sim"),
    barba_N: X(raw("barbaCabelo") === "nao"),
    "cb:pressaoAlta": X(raw("pressaoArterial") === "alta"),
    "cb:pressaoNormal": X(raw("pressaoArterial") === "normal"),
    "cb:pressaoBaixa": X(raw("pressaoArterial") === "baixa"),
    "cb:destro": X(raw("maoDominante") === "destro" || raw("maoDominante") === "ambidestro"),
    "cb:canhoto": X(raw("maoDominante") === "canhoto" || raw("maoDominante") === "ambidestro"),
    "cb:daltS": X(p?.daltonismo === "sim"),
    "cb:daltN": X(p?.daltonismo === "nao"),
    "cb:oculosS": X(oculos === "oculos" || oculos === "ambos"),
    "cb:oculosN": X(oculos === "nao" || oculos === "lente"),
    "cb:lenteS": X(oculos === "lente" || oculos === "ambos"),
    "cb:lenteN": X(oculos === "nao" || oculos === "oculos"),
    "cb:miopia": X(grau.includes("miopia")),
    "cb:hipermetropia": X(grau.includes("hipermetropia")),
    "cb:grauOutros": X(grau.includes("astigmatismo") || grau.includes("outro")),
    grauOD: v("grauOD"),
    grauOE: v("grauOE"),
    medicamentos: b.medicamento ? juntar(" · ", v("medicamentoRegularDetalhe"), p?.medicacaoControlada === "sim" ? "medicação controlada" : "") : b.semMedicamento ? "Não usa" : "",
    "cb:cnhBR": X(cnhBR),
    "cb:cnhJP": X(cnhJP),
    "cb:cnhAT": X(cnhJP && raw("cnhJapaoCambio") === "at"),
    "cb:cnhMT": X(cnhJP && raw("cnhJapaoCambio") === "mt"),
    cnhCategoria: cnhBR ? juntar(" — ", v("cnhBrasilCategoria"), v("cnhBrasilSituacao")) : "",
    "cb:bikeS": X(raw("bicicleta") === "sim"),
    "cb:bikeN": X(raw("bicicleta") === "nao"),
    "cb:empilhadeira": X(qualif.includes("empilhadeira")),
    "cb:solda": X(qualif.includes("solda")),
    "cb:qualOutros": X(qualif.includes("outros")),
    ...turnoCb("diu", "turnoDiurno"),
    ...turnoCb("not", "turnoNoturno"),
    ...turnoCb("sem", "turnoAlternadoSemanal"),
    ...turnoCb("mes", "turnoAlternadoMensal"),
    "cb:pcS": X(raw("usaComputador") === "sim"),
    "cb:pcN": X(raw("usaComputador") === "nao"),
    regiao: p?.provinciaPreferida || (p ? "Sem preferência" : ""),
    segmento: v("segmentoPreferido"),
    "cb:mesmoSetorS": X(raw("aceitaMesmoSetor") === "sim"),
    "cb:mesmoSetorN": X(raw("aceitaMesmoSetor") === "prefereOutro"),
    "cb:aptoS": X(raw("dividirApto") === "sim"),
    "cb:aptoN": X(raw("dividirApto") === "nao"),
    "cb:fdsS": X(b.fds.some((d) => d !== "nenhum")),
    "cb:fdsN": X(b.fds.includes("nenhum")),
    "cb:heS": X(he === "sim" || he === "indiferente"),
    "cb:heN": X(he === "nao"),
    "cb:checkupS": X(raw("checkup") === "sim"),
    "cb:checkupN": X(raw("checkup") === "nao"),
    "cb:reservaS": X(raw("reservaFinanceira") === "sim"),
    "cb:reservaN": X(raw("reservaFinanceira") === "nao"),
    embarque: b.embarque,
    "cb:governoS": X(p?.ajudaGovernoRetorno === "sim"),
    "cb:governoN": X(p?.ajudaGovernoRetorno === "nao"),
    emergNome: v("emergBrNome"),
    emergParentesco: v("emergBrParentesco"),
    emergEndereco: v("emergBrEndereco"),
    emergTelefone: v("emergBrTelefone"),
    "cb:orient1": X(raw("cienteOrientacoesFamilia")),
    "cb:orient2": X(raw("cienteOrientacoesFamilia")),
    "cb:orient3": X(raw("cienteOrientacoesFamilia")),
    hoje: b.hoje.jp,
    agencia: "Ajisai",
  };
  // Observações: uma linha por item (saúde com "SIM" + observações do candidato).
  const linhasObs = [...detalhesSaude, v("observacoes") && `Observações do candidato: ${v("observacoes")}`].filter(Boolean);
  for (let i = 0; i < 10; i++) out[`obs${i}`] = i === 9 && linhasObs.length > 10 ? linhasObs.slice(9).join(" | ") : (linhasObs[i] ?? "");
  for (const [k, id] of ITENS_LISTA) {
    out[`${k}_S`] = X(b.saude(id).sim);
    out[`${k}_N`] = X(b.saude(id).nao);
  }
  b.filhos.slice(0, 3).forEach((fi, i) => {
    Object.assign(out, {
      [`filho${i}_nome`]: fi.nome,
      [`filho${i}_mora`]: fi.escola === "Não vai para o Japão" ? "Brasil" : "",
      [`filho${i}_nasc`]: fi.nascimento,
      [`filho${i}_escola`]: juntar(" · ", fi.japones && `Japonês: ${fi.japones}`, fi.escola),
    });
  });
  return out;
}

// ── FUJIARTE (Excel) ──────────────────────────────────────────────────
function fujiarte(x: ContextoFicha): ValoresModelo {
  const b = base(x);
  const { v, raw, p } = b;
  const nac = raw("nacionalidade");
  const e = b.escolaridade;
  const sn = (pre: string, valor: unknown) => ({ [`${pre}Sim`]: X(valor === "sim"), [`${pre}Nao`]: X(valor === "nao") });
  const saudeSN = (pre: string, id: string) => ({ ...sn(pre, raw(id)) });
  const visto = raw("situacaoVisto");
  const familiaExtra = [
    ...b.filhos.map((fi) => ({ nome: fi.nome, idade: idadeDe(fi.nascimento), tel: "" })),
    ...b.irmaos.map((ir) => ({ nome: ir.nome, idade: ir.idade, tel: "" })),
  ];
  const levar = raw("levarFamilia");
  const out: ValoresModelo = {
    hojeAno: b.hoje.a,
    hojeMes: b.hoje.m,
    hojeDia: b.hoje.d,
    nome: b.nome.toUpperCase(),
    comoSoube: juntar(" — ", v("comoSoube"), v("comoSoubeDetalhe")),
    indicadoPor: v("indicadoPor"),
    indicadoRelacao: v("indicadoRelacao"),
    nascimento: b.nascimento,
    idade: b.idade,
    sexo: raw("sexo") === "masculino" ? "M" : raw("sexo") === "feminino" ? "F" : "",
    estadoCivil: v("estadoCivil"),
    nacBras: X(nac === "brasileira" || nac === "dupla"),
    nacJap: X(nac === "japonesa" || nac === "dupla"),
    nacOutra: nac === "outra" ? v("nacionalidadeOutra") : "",
    geracao: ASCENDENCIA_JAPONESA.find((a) => a.key === x.r.ascendencia)?.label.split(" (")[0] ?? "",
    passaporteValidade: juntar(" — ", v("passaporteNumero"), v("passaporteValidade")),
    vistoValidade: v("vistoData") || ({ naoTenho: "Não tem", protocolado: "Protocolado", japones: "Cidadão japonês" } as Record<string, string>)[String(visto)] || "",
    koseki: raw("kosekiTohon") === "nao" ? "Não tem" : v("kosekiData") || (raw("kosekiTohon") ? "Sim" : ""),
    reEntry: b.reEntrySim ? v("reEntryValidade") || "Sim" : b.reEntryNao ? "Não tem" : "",
    cpf: v("cpf"),
    rg: v("rg"),
    rgEmissor: v("rgEmissor"),
    altura: p?.alturaCm ? String(p.alturaCm) : "",
    peso: p?.pesoKg ? String(p.pesoKg) : "",
    cintura: v("cinturaCm"),
    pe: v("calcado") && `nº ${v("calcado")} (BR)`,
    fundCompleto: X(e && e !== "fundamentalIncompleto"),
    fundIncompleto: X(e === "fundamentalIncompleto"),
    medioCompleto: X(["medioCompleto", "tecnico", "superiorIncompleto", "superiorCompleto", "posGraduacao", "mestrado", "doutorado"].includes(e)),
    medioIncompleto: X(e === "medioIncompleto"),
    tecCompleto: X(e === "tecnico"),
    tecIncompleto: "",
    facCompleto: X(["superiorCompleto", "posGraduacao", "mestrado", "doutorado"].includes(e)),
    facIncompleto: X(e === "superiorIncompleto"),
    curso: v("curso"),
    cursoConclusao: v("cursoConclusao"),
    instituicao: v("instituicao"),
    logradouro: v("logradouro"),
    numero: v("numero"),
    complemento: v("complemento"),
    bairro: v("bairro"),
    cidade: v("cidade"),
    uf: v("uf"),
    cep: b.cep,
    email: x.c.email,
    celDDD: b.tel.ddd,
    celNumero: b.tel.numero,
    fixoDDD: b.fixo.ddd,
    fixoNumero: v("telefoneFixo") ? b.fixo.numero : "",
    paiNome: v("paiNome"),
    paiIdade: v("paiIdade"),
    paiTel: v("paiTelefone"),
    maeNome: v("maeNome"),
    maeIdade: v("maeIdade"),
    maeTel: v("maeTelefone"),
    conjugeNome: v("conjugeNome"),
    conjugeIdade: idadeDe(v("conjugeNascimento")),
    conjugeTel: v("conjugeTelefone"),
    refNome: v("refJpNome"),
    refRelacao: v("refJpParentesco"),
    refProvincia: juntar(" — ", v("refJpProvincia"), v("refJpEndereco")),
    refTel: v("refJpTelefone"),
    japaoSim: X(p?.jaEsteveJapao === "sim"),
    japaoNao: X(p?.jaEsteveJapao === "nao"),
    japaoPara: p?.jaEsteveJapao === "sim" ? juntar(" · ", "Trabalho", p.anosNoJapao ? `${p.anosNoJapao} ano(s)` : "", v("vezesJapao") && `${v("vezesJapao")} vez(es)`) : "",
    governoSim: X(p?.ajudaGovernoRetorno === "sim"),
    governoNao: X(p?.ajudaGovernoRetorno === "nao"),
    // Enquete
    setEletronica: X(b.lista("setoresAceitos").includes("eletronica")),
    setAutopecas: X(b.lista("setoresAceitos").includes("autopecas")),
    setAlimenticio: X(b.lista("setoresAceitos").includes("alimenticio")),
    setMotivo: v("setoresMotivo"),
    regiaoSim: X(p && p.provinciaPreferida),
    regiaoNao: X(p && !p.provinciaPreferida),
    regiaoOnde: p?.provinciaPreferida ?? "",
    heSim: X(p?.horasExtras === "sim" || p?.horasExtras === "indiferente"),
    heNao: X(p?.horasExtras === "nao"),
    turnoDiurno: X(b.aceitaTurno("turnoDiurno")),
    turnoNoturno: X(b.aceitaTurno("turnoNoturno")),
    turnoAlternado: X(b.aceitaTurno("turnoAlternadoSemanal") || b.aceitaTurno("turnoAlternadoMensal")),
    sabado: X(b.fds.includes("sabados")),
    domingo: X(b.fds.includes("domingos")),
    feriado: X(b.fds.includes("feriados")),
    fdsMotivo: "",
    folgaSim: X(raw("trabalhaFolga") === "sim"),
    folgaNao: X(raw("trabalhaFolga") === "nao"),
    emPeHoras: v("horasEmPe"),
    emPeSim: X(raw("trabalhouEmPe") === "sim"),
    emPeNao: X(raw("trabalhouEmPe") === "nao"),
    dividaBRSim: X(p?.dividasBrasil === "sim"),
    dividaBRNao: X(p?.dividasBrasil === "nao"),
    pendJPSim: X(p?.dividasJapao === "sim"),
    pendJPNao: X(p?.dividasJapao === "nao"),
    depSim: X(levar === "juntos" || levar === "depois"),
    depNao: X(levar === "nao"),
    depQuem: v("levarFamiliaQuem"),
    depJuntos: X(levar === "juntos"),
    depDepois: X(levar === "depois"),
    depQuantoTempo: levar === "depois" ? v("levarFamiliaQuando") : "",
    petSim: X(p?.animalEstimacao === "sim"),
    petNao: X(p?.animalEstimacao === "nao"),
    embarque: b.embarque,
    tempoJapao: v("tempoJapao"),
    detidoSim: X(p?.antecedentesCriminais === "sim"),
    detidoNao: X(p?.antecedentesCriminais === "nao"),
    tatuSim: X(b.temTatuagem),
    tatuNao: X(b.semTatuagem),
    tatuOnde: b.regioesTatuagem,
    visaoSim: X(p && !p.semCondicaoVisual && p.condicoesVisuais.length > 0),
    visaoNao: X(p?.semCondicaoVisual),
    visaoQual: p && !p.semCondicaoVisual ? p.condicoesVisuais.join(", ") : "",
    oculos: X(raw("oculos") === "oculos" || raw("oculos") === "ambos"),
    lente: X(raw("oculos") === "lente" || raw("oculos") === "ambos"),
    grauOD: v("grauOD"),
    grauOE: v("grauOE"),
    daltSim: X(p?.daltonismo === "sim"),
    daltNao: X(p?.daltonismo === "nao"),
    daltNaoSei: X(p?.daltonismo === "naoSei"),
    aptoSim: X(raw("dividirApto") === "sim"),
    aptoNao: X(raw("dividirApto") === "nao"),
    cnhBR: X(raw("cnhBrasil") === "sim"),
    cnhJP: X(raw("cnhJapao") === "sim"),
    bikeSim: X(raw("bicicleta") === "sim"),
    bikeNao: X(raw("bicicleta") === "nao"),
    destro: X(raw("maoDominante") === "destro" || raw("maoDominante") === "ambidestro"),
    canhoto: X(raw("maoDominante") === "canhoto" || raw("maoDominante") === "ambidestro"),
    fumaSim: X(b.fumante),
    fumaNao: X(p?.fumante === "nao" || p?.fumante === "exFumante"),
    acidSim: X(p?.doencaGrave === "sim" || b.saude("acidente").sim || b.saude("cirurgia").sim),
    acidNao: X(p?.doencaGrave === "nao" && b.saude("acidente").nao && b.saude("cirurgia").nao),
    acidQual: juntar(" · ", p?.doencaGrave === "sim" ? p.doencaGraveDescricao : "", b.saude("acidente").detalhe, b.saude("cirurgia").detalhe),
    acidQuando: "",
    ...saudeSN("sequela", "sequela"),
    ...saudeSN("dor", "dorCronica"),
    dorOnde: juntar(" · ", b.saude("dorCronica").detalhe, b.saude("problemaColuna").detalhe),
    ...saudeSN("mov", "dificuldadeMovimento"),
    movOnde: b.saude("dificuldadeMovimento").detalhe,
    mentalSim: X(raw("tratamentoPsicologico") === "sim"),
    mentalNao: X(raw("tratamentoPsicologico") === "nao"),
    mentalQual: v("tratamentoPsicologicoDetalhe"),
    ...saudeSN("alergia", "alergia"),
    alergiaQual: b.saude("alergia").detalhe,
    ...saudeSN("fobia", "fobia"),
    fobiaQual: b.saude("fobia").detalhe,
    tratSim: X(p?.emTratamento === "sim"),
    tratNao: X(p?.emTratamento === "nao" || p?.doencaGrave === "nao"),
    tratQual: p?.emTratamento === "sim" ? p.doencaGraveDescricao : "",
    medSim: X(b.medicamento),
    medNao: X(b.semMedicamento),
    medQual: v("medicamentoRegularDetalhe"),
    objetivos: b.objetivos,
    agencia: "Ajisai",
  };
  familiaExtra.slice(0, 2).forEach((pe, i) => {
    out[`fam${i + 1}Nome`] = pe.nome;
    out[`fam${i + 1}Idade`] = pe.idade;
    out[`fam${i + 1}Tel`] = pe.tel;
  });
  b.expJP.slice(0, 4).forEach((ex, i) => {
    Object.assign(out, {
      [`jp${i}Fabrica`]: ex.fabrica,
      [`jp${i}Empreiteira`]: ex.empreiteira,
      [`jp${i}Servico`]: ex.funcao,
      [`jp${i}Provincia`]: ex.provincia,
      [`jp${i}Cidade`]: ex.cidade,
      [`jp${i}Inicio`]: ex.inicio,
      [`jp${i}Saida`]: ex.saida || "atual",
      [`jp${i}Motivo`]: ex.motivoSaida,
      [`jp${i}Contrato`]: ex.contrato,
    });
  });
  b.expBR.slice(0, 2).forEach((ex, i) => {
    const [cidade, uf] = (ex.cidade ?? "").split("/").map((s) => s.trim());
    Object.assign(out, {
      [`br${i}Empresa`]: ex.empresa,
      [`br${i}Servico`]: ex.funcao,
      [`br${i}UF`]: uf ?? "",
      [`br${i}Cidade`]: cidade ?? "",
      [`br${i}Inicio`]: ex.inicio,
      [`br${i}Saida`]: ex.saida || "atual",
      [`br${i}Motivo`]: ex.motivoSaida,
      [`br${i}Contrato`]: ex.contrato,
    });
  });
  return out;
}

// ── Suri-Emu — Ficha de Cadastro Digital (Excel) ──────────────────────
function suriemu(x: ContextoFicha): ValoresModelo {
  const b = base(x);
  const { v, raw, p } = b;
  const [nd, nm, na] = b.nascimento.split("/");
  const ec = raw("estadoCivil");
  const camisa = raw("camisa") as string | undefined;
  const asc = x.r.ascendencia;
  const e = b.escolaridade;
  const nivelFala = (pre: string, id: string) => {
    const n = raw(id);
    return {
      [`${pre}MuitoPouco`]: X(n === "nada"),
      [`${pre}Pouco`]: X(n === "cumprimentos"),
      [`${pre}Basico`]: X(n === "basico"),
      [`${pre}Intermediario`]: X(n === "intermediario"),
      [`${pre}Fluente`]: X(n === "fluente"),
    };
  };
  const pct = (id: string) => ({ nao: "0", pouco: "50", bem: "100" })[raw(id) as string] ?? "";
  const sn = (pre: string, sim: unknown, nao: unknown) => ({ [`${pre}Sim`]: X(sim), [`${pre}Nao`]: X(nao) });
  const sd = (id: string) => b.saude(id);
  const periodo = (ex: Record<string, string>) => (ex.inicio ? `${ex.inicio} a ${ex.saida || "atual"}` : "");
  const shakai = b.expJP.map((ex) => ex.shakaiHoken);
  const comoSoube = raw("comoSoube");
  const out: ValoresModelo = {
    nome: b.nome.toUpperCase(),
    nascDia: nd ?? "",
    nascMes: nm ?? "",
    nascAno: na ?? "",
    idade: b.idade,
    cidadeNascimento: juntar(" / ", v("cidadeNascimento"), raw("estadoNascimento") === "exterior" ? "exterior" : v("estadoNascimento")),
    rg: juntar(" ", v("rg"), v("rgEmissor")),
    cpf: v("cpf"),
    endereco: juntar(", ", v("logradouro"), v("numero")),
    complemento: v("complemento"),
    bairro: v("bairro"),
    cep: b.cep,
    cidade: v("cidade"),
    uf: v("uf"),
    fixoDDD: b.fixo.ddd,
    fixoNumero: v("telefoneFixo") ? b.fixo.numero : "",
    celDDD: b.tel.ddd,
    celNumero: b.tel.numero,
    email: x.c.email,
    solteiro: X(ec === "solteiro"),
    casado: X(ec === "casado" || ec === "uniaoEstavel"),
    separado: X(ec === "separado"),
    filhosNao: X(p?.temFilhos === "nao"),
    filhosSim: X(p?.temFilhos === "sim"),
    qtdFilhos: p?.temFilhos === "sim" ? String(b.filhos.length || p.idadesFilhos.length) : "",
    altura: p?.alturaCm ? String(p.alturaCm) : "",
    peso: p?.pesoKg ? String(p.pesoKg) : "",
    sapato: v("calcado"),
    tamP: X(camisa === "PP" || camisa === "P"),
    tamM: X(camisa === "M"),
    tamG: X(camisa === "G"),
    tamGG: X(camisa === "GG" || camisa === "XG" || camisa === "XXG"),
    calca: v("calca"),
    issei: "",
    nissei: X(asc === "nissei"),
    sansei: X(asc === "sansei"),
    dupla: X(raw("nacionalidade") === "dupla"),
    conjugeDescendente: X(asc === "conjugeDependente"),
    passaporte: v("passaporteNumero"),
    passaporteVenc: v("passaporteValidade"),
    vistoVenc: v("vistoData") || ({ naoTenho: "Não tem", protocolado: "Protocolado", japones: "Cidadão japonês" } as Record<string, string>)[String(raw("situacaoVisto"))] || "",
    reEntry: b.reEntrySim ? v("reEntryValidade") || "Sim" : b.reEntryNao ? "Não tem" : "",
    cnhBR: X(raw("cnhBrasil") === "sim"),
    cnhJP: X(raw("cnhJapao") === "sim"),
    cnhNumero: raw("cnhBrasil") === "sim" ? juntar(" ", "Cat.", v("cnhBrasilCategoria")) : "",
    cnhValida: X(raw("cnhBrasilSituacao") === "valida"),
    cnhVencida: X(raw("cnhBrasilSituacao") === "vencida"),
    escFund: X(e === "fundamentalIncompleto" || e === "fundamentalCompleto"),
    fundCompleto: X(e === "fundamentalCompleto"),
    fundIncompleto: X(e === "fundamentalIncompleto"),
    escMedio: X(e === "medioIncompleto" || e === "medioCompleto" || e === "tecnico"),
    medioCompleto: X(e === "medioCompleto" || e === "tecnico"),
    medioIncompleto: X(e === "medioIncompleto"),
    escSuperior: X(["superiorIncompleto", "superiorCompleto", "posGraduacao", "mestrado", "doutorado"].includes(e)),
    supCompleto: X(["superiorCompleto", "posGraduacao", "mestrado", "doutorado"].includes(e)),
    supIncompleto: X(e === "superiorIncompleto"),
    cursando: juntar(" · ", v("curso"), v("instituicao")),
    ...nivelFala("conv", "japonesConversacao"),
    ...nivelFala("comp", "japonesCompreensao"),
    leKata: pct("leKatakana"),
    leHira: pct("leHiragana"),
    leKanji: pct("leKanji"),
    escKata: pct("escreveKatakana"),
    escHira: pct("escreveHiragana"),
    escKanji: pct("escreveKanji"),
    paiNome: v("paiNome"),
    paiIdade: v("paiIdade"),
    paiOcupacao: v("paiOcupacao"),
    maeNome: v("maeNome"),
    maeIdade: v("maeIdade"),
    maeOcupacao: v("maeOcupacao"),
    conjugeNome: v("conjugeNome"),
    conjugeIdade: idadeDe(v("conjugeNascimento")),
    conjugeOcupacao: v("conjugeOcupacao"),
    parentesNao: X(raw("conhecidosEmpreiteira") === "nao"),
    parentesSim: X(raw("conhecidosEmpreiteira") === "sim"),
    parentesUnidade: "",
    parentesNome: v("conhecidosEmpreiteiraQuem"),
    anuncios: X(["anuncio", "redesSociais", "google", "youtubeTudoSobreJapao", "youtubeFrttt", "chatgpt"].includes(String(comoSoube ?? ""))),
    anunciosQual: comoSoube && comoSoube !== "indicacao" ? juntar(" — ", v("comoSoube"), v("comoSoubeDetalhe")) : "",
    indicacao: X(comoSoube === "indicacao"),
    indicacaoNome: juntar(" — ", v("indicadoPor"), v("indicadoRelacao")),
    refJapao: juntar(", ", v("refJpNome"), v("refJpEndereco"), v("refJpProvincia"), v("refJpTelefone"), v("refJpParentesco")),
    hojeDia: b.hoje.d,
    hojeMes: b.hoje.m,
    hojeAno: b.hoje.a,
    ...sn("shakai", shakai.includes("Sim"), shakai.length > 0 && !shakai.includes("Sim")),
    ...sn("seguroDesemp", raw("seguroDesempregoJapao") === "sim", raw("seguroDesempregoJapao") === "nao"),
    ...sn("regiao", p && p.provinciaPreferida, p && !p.provinciaPreferida),
    regiaoQual: p?.provinciaPreferida ?? "",
    ...sn("divida", p?.dividasBrasil === "sim", p?.dividasBrasil === "nao"),
    ...sn("policia", raw("distritoPolicialJapao") === "sim", raw("distritoPolicialJapao") === "nao"),
    tempoJapao: v("tempoJapao"),
    ...sn("bike", raw("bicicleta") === "sim", raw("bicicleta") === "nao"),
    ...sn("idiomas", raw("outrosIdiomas") === "sim", raw("outrosIdiomas") === "nao"),
    idiomasQual: v("outrosIdiomasQual"),
    idiomasNivel: "",
    ...sn("tatuagem", b.temTatuagem, b.semTatuagem),
    tatuagemQuantas: "",
    tatuagemLocal: b.regioesTatuagem,
    ...sn("cores", p?.daltonismo === "nao", p?.daltonismo === "sim"),
    fimDeSemana: v("fimDeSemana") && `Pode trabalhar: ${v("fimDeSemana")}`,
    destro: X(raw("maoDominante") === "destro" || raw("maoDominante") === "ambidestro"),
    canhoto: X(raw("maoDominante") === "canhoto" || raw("maoDominante") === "ambidestro"),
    ...sn("alergia", sd("alergia").sim, sd("alergia").nao),
    alergiaQual: sd("alergia").detalhe,
    ...sn("doenca", p?.doencaGrave === "sim", p?.doencaGrave === "nao"),
    doencaQual: p?.doencaGrave === "sim" ? p.doencaGraveDescricao : "",
    ...sn("acidente", sd("acidente").sim, sd("acidente").nao),
    acidenteQual: sd("acidente").detalhe,
    ...sn("deficiencia", sd("deficienciaFisica").sim, sd("deficienciaFisica").nao),
    deficienciaQual: sd("deficienciaFisica").detalhe,
    ...sn("medicamento", b.medicamento, b.semMedicamento),
    medicamentoQual: v("medicamentoRegularDetalhe"),
    ...sn("vista", p && !p.semCondicaoVisual && p.condicoesVisuais.length > 0, p?.semCondicaoVisual),
    vistaQual: p && !p.semCondicaoVisual ? p.condicoesVisuais.join(", ") : "",
    pressaoNormal: X(raw("pressaoArterial") === "normal"),
    pressaoBaixa: X(raw("pressaoArterial") === "baixa"),
    pressaoAlta: X(raw("pressaoArterial") === "alta"),
    ...sn("tendinite", sd("tendinite").sim, sd("tendinite").nao),
    tendiniteQual: sd("tendinite").detalhe,
    ...sn("diabetes", p?.diabetes === "sim", p?.diabetes === "nao"),
    diabetesQual: p?.diabetes === "sim" ? (TIPOS_DIABETES.find((t) => t.key === p.diabetesTipo)?.label ?? "") : "",
    ...sn("coluna", sd("problemaColuna").sim, sd("problemaColuna").nao),
    colunaQual: sd("problemaColuna").detalhe,
    ...sn("fumante", b.fumante, p?.fumante === "nao" || p?.fumante === "exFumante"),
    ...sn("horasExtras", p?.horasExtras === "sim" || p?.horasExtras === "indiferente", p?.horasExtras === "nao"),
    ...sn("yakin", b.aceitaTurno("turnoNoturno"), b.turno("turnoNoturno") === "naoAceita"),
    ...sn(
      "revezamento",
      b.aceitaTurno("turnoAlternadoSemanal") || b.aceitaTurno("turnoAlternadoMensal"),
      b.turno("turnoAlternadoSemanal") === "naoAceita" && b.turno("turnoAlternadoMensal") === "naoAceita",
    ),
    ...sn("governo", p?.ajudaGovernoRetorno === "sim", p?.ajudaGovernoRetorno === "nao"),
  };
  b.filhos.slice(0, 5).forEach((fi, i) => {
    out[`filho${i}Nome`] = fi.nome;
    out[`filho${i}Idade`] = idadeDe(fi.nascimento);
    out[`filho${i}Ocupacao`] = fi.escola === "Não vai para o Japão" ? "" : fi.escola;
  });
  b.irmaos.slice(0, 5).forEach((ir, i) => {
    out[`irmao${i}Nome`] = ir.nome;
    out[`irmao${i}Idade`] = ir.idade;
    out[`irmao${i}Ocupacao`] = ir.ocupacao;
  });
  b.expBR.slice(0, 2).forEach((ex, i) => {
    out[`br${i}Empresa`] = juntar(" — ", ex.empresa, ex.cidade);
    out[`br${i}Servico`] = ex.funcao;
    out[`br${i}Periodo`] = periodo(ex);
  });
  b.expJP.slice(0, 3).forEach((ex, i) => {
    Object.assign(out, {
      [`jp${i}Empresa`]: juntar(" / ", ex.fabrica, ex.empreiteira),
      [`jp${i}Servico`]: ex.funcao,
      [`jp${i}Periodo`]: periodo(ex),
      [`jp${i}Salario`]: ex.salarioHora && `¥${ex.salarioHora}/h`,
      [`jp${i}Local`]: juntar(", ", ex.cidade, ex.provincia),
      [`jp${i}Motivo`]: ex.motivoSaida,
    });
  });
  return out;
}

export const MODELOS_ORIGINAIS = [
  { id: "avcorp", nome: "AVCORP / Rainichisha — Curriculum Vitae", arquivo: "avcorp.docx", saida: "AVCORP-rainichisha", valores: avcorp },
  { id: "lista-verificacao", nome: "Lista de Verificação (来日者 確認事項)", arquivo: "lista-verificacao.docx", saida: "LISTA-DE-VERIFICACAO", valores: lista },
  { id: "fujiarte", nome: "FUJIARTE — Ficha Cadastral e Enquete", arquivo: "fujiarte.xlsx", saida: "FUJIARTE-Ficha-Cadastral", valores: fujiarte, foto: { largura: 379, altura: 435 } },
  { id: "suriemu", nome: "Suri-Emu — Ficha de Cadastro Digital", arquivo: "suriemu.xlsx", saida: "SURIEMU-Ficha-de-Cadastro", valores: suriemu },
] as const;

export type ModeloOriginal = (typeof MODELOS_ORIGINAIS)[number];
