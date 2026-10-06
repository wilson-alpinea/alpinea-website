// Modelo das fichas cadastrais das empreiteiras parceiras — Wilson,
// 06/out/2026: "gerar modelo que captura essas informações e transforma
// na ficha cadastral das empresas parceiras (faremos depois essa
// mecânica)". Aqui fica o DE→PARA de cada campo das 4 fichas originais
// para a fonte do dado no nosso processo:
//   etapa1  → formulário de candidatura (colunas + respostas.perfil)
//   ficha   → etapa 2 (app/lib/fichaCadastral.ts)
//   interno → a agência/equipe preenche (entrevistador, promotor…)
//   removido→ não perguntamos (proibido/descontinuado) — fica em branco
// A mecânica de gerar o arquivo (Word/Excel no layout de cada parceira)
// vem depois e só precisa consumir `montarFichaParceiro`.

import { ASCENDENCIA_JAPONESA, NIVEIS_JAPONES_DETALHADOS, QUANDO_EMBARCAR, type RespostasTriagem } from "./candidaturaScoring";
import { itensListaFicha, valorFicha, type FichaCadastral } from "./fichaCadastral";
import {
  CLASSES_MEDICAMENTO,
  CONDICOES_VISUAIS,
  ESCOLARIDADES,
  OPCOES_DALTONISMO,
  OPCOES_FUMANTE,
  REGIOES_TATUAGEM,
  TIPOS_DIABETES,
  formatarCep,
  type PerfilCandidato,
} from "./triagemPerfil";

export type ContextoFicha = {
  c: { nome: string; sobrenome: string; email: string; telefone: string; idade: number | null; created_at?: string };
  r: Partial<RespostasTriagem> & Record<string, unknown>;
  p: PerfilCandidato | null;
  f: FichaCadastral | null;
};

type Origem = "etapa1" | "ficha" | "interno" | "removido";
export type CampoParceiro = { label: string; origem: Origem; valor: (x: ContextoFicha) => string };
export type ModeloParceiro = { id: string; nome: string; arquivoOriginal: string; secoes: { titulo: string; campos: CampoParceiro[] }[] };

// ── Atalhos ───────────────────────────────────────────────────────────
const rot = <T extends { key: string; label: string }>(lista: T[], k: string | undefined | null) => lista.find((o) => o.key === k)?.label ?? "";
const sn = (v: unknown) => (v === "sim" ? "Sim" : v === "nao" ? "Não" : "");
const F = (label: string, id: string): CampoParceiro => ({ label, origem: "ficha", valor: (x) => valorFicha(x.f, id) });
const E = (label: string, valor: (x: ContextoFicha) => string): CampoParceiro => ({ label, origem: "etapa1", valor });
const FX = (label: string, valor: (x: ContextoFicha) => string): CampoParceiro => ({ label, origem: "ficha", valor });
const I = (label: string): CampoParceiro => ({ label, origem: "interno", valor: () => "" });
const R = (label: string): CampoParceiro => ({ label, origem: "removido", valor: () => "" });
const juntar = (...partes: string[]) => partes.filter(Boolean).join(" · ");

const nomeCompleto = E("Nome completo", (x) => `${x.c.nome} ${x.c.sobrenome}`.trim());
const idade = E("Idade", (x) => (x.c.idade ? String(x.c.idade) : ""));
const email = E("E-mail", (x) => x.c.email);
const celular = E("Celular", (x) => x.c.telefone);
const cep = E("CEP", (x) => (x.p?.cepResidencia ? formatarCep(x.p.cepResidencia) : ""));
const geracao = E("Geração", (x) => rot(ASCENDENCIA_JAPONESA, x.r.ascendencia as string));
const jlpt = E("JLPT / BJT", (x) => {
  const n = NIVEIS_JAPONES_DETALHADOS.find((k) => k.key === x.r.nivelJaponesDetalhado);
  return n ? juntar(n.label, n.bjt ?? "") : "";
});
const jaFoiJapao = E("Já esteve no Japão", (x) => (x.p?.jaEsteveJapao === "sim" ? `Sim — ${x.p.anosNoJapao ?? "?"} ano(s)` : sn(x.p?.jaEsteveJapao)));
const ajudaGoverno = E("Retornou com ajuda do governo", (x) => sn(x.p?.ajudaGovernoRetorno));
const temFilhos = E("Tem filhos", (x) => (x.p?.temFilhos === "sim" ? `Sim — ${x.p.idadesFilhos.length}` : sn(x.p?.temFilhos)));
const altura = E("Altura (cm)", (x) => (x.p?.alturaCm ? String(x.p.alturaCm) : ""));
const peso = E("Peso (kg)", (x) => (x.p?.pesoKg ? String(x.p.pesoKg) : ""));
const horasExtras = E("Pode fazer horas extras", (x) => (x.p?.horasExtras === "indiferente" ? "Indiferente" : sn(x.p?.horasExtras)));
const dividasBR = E("Dívida no Brasil", (x) => sn(x.p?.dividasBrasil));
const dividasJP = E("Pendência no Japão (impostos etc.)", (x) => sn(x.p?.dividasJapao));
const tatuagem = E("Tatuagem", (x) =>
  x.p?.tatuagemVisivel === "sim" ? `Sim — ${x.p.tatuagemRegioes.map((r) => rot(REGIOES_TATUAGEM, r)).join(", ")}` : sn(x.p?.tatuagemVisivel),
);
const daltonismo = E("Daltonismo", (x) => {
  const t = x.p?.testeDaltonismo;
  return juntar(rot(OPCOES_DALTONISMO, x.p?.daltonismo), t ? `teste ${t.acertos}/${t.total}${t.controleOk ? "" : " (errou controle)"}` : "");
});
const fumante = E("Fumante", (x) => rot(OPCOES_FUMANTE, x.p?.fumante));
const diabetes = E("Diabetes", (x) => (x.p?.diabetes === "sim" ? rot(TIPOS_DIABETES, x.p.diabetesTipo) : sn(x.p?.diabetes)));
const doencaGrave = E("Doença grave / tratamento", (x) =>
  x.p?.doencaGrave === "sim" ? juntar("Sim", x.p.doencaGraveDescricao, x.p.emTratamento === "sim" ? "em tratamento" : "") : sn(x.p?.doencaGrave),
);
const visao = E("Problema de visão", (x) =>
  x.p?.semCondicaoVisual ? "Não" : x.p?.condicoesVisuais.map((c) => rot(CONDICOES_VISUAIS, c)).join(", ") ?? "",
);
const medicacaoControlada = E("Medicação controlada", (x) =>
  x.p?.medicacaoControlada === "sim" ? x.p.medicacaoClasses.map((c) => rot(CLASSES_MEDICAMENTO, c)).join(", ") : sn(x.p?.medicacaoControlada),
);
const detido = E("Antecedentes criminais", (x) => sn(x.p?.antecedentesCriminais));
const previsaoEmbarque = FX("Previsão de embarque", (x) => valorFicha(x.f, "mesEmbarque") || rot(QUANDO_EMBARCAR, x.r.quandoEmbarcar as string));
const endereco = FX("Endereço", (x) => juntar(`${valorFicha(x.f, "logradouro")}, ${valorFicha(x.f, "numero")}`.replace(/^, |, $/, ""), valorFicha(x.f, "complemento")));
const turnos = FX("Turnos", (x) =>
  juntar(
    `Diurno: ${valorFicha(x.f, "turnoDiurno")}`,
    `Noturno: ${valorFicha(x.f, "turnoNoturno")}`,
    `Alt. semanal: ${valorFicha(x.f, "turnoAlternadoSemanal")}`,
    `Alt. mensal: ${valorFicha(x.f, "turnoAlternadoMensal")}`,
  ),
);
const pessoa = (pre: string) => (x: ContextoFicha) =>
  juntar(valorFicha(x.f, `${pre}Nome`), valorFicha(x.f, `${pre}Idade`) && `${valorFicha(x.f, `${pre}Idade`)} anos`, valorFicha(x.f, `${pre}Ocupacao`), valorFicha(x.f, `${pre}Mora`), valorFicha(x.f, `${pre}Telefone`));
const familia: CampoParceiro[] = [
  FX("Pai", pessoa("pai")),
  FX("Mãe", pessoa("mae")),
  FX("Cônjuge", (x) => juntar(valorFicha(x.f, "conjugeNome"), valorFicha(x.f, "conjugeNascimento"), valorFicha(x.f, "conjugeOcupacao"), valorFicha(x.f, "conjugeMora"), valorFicha(x.f, "conjugeTelefone"))),
  FX("Filhos", (x) => itensListaFicha(x.f, "filhos").map((i) => juntar(i.nome, i.nascimento, i.japones && `japonês ${i.japones}`, i.escola)).join(" | ")),
  FX("Irmãos", (x) => itensListaFicha(x.f, "irmaos").map((i) => juntar(i.nome, i.idade && `${i.idade} anos`, i.ocupacao)).join(" | ")),
];
const expJapao = FX("Experiência no Japão", (x) =>
  itensListaFicha(x.f, "experienciasJapao")
    .map((e) => juntar(e.fabrica, e.empreiteira, e.funcao, juntar(e.provincia, e.cidade), `${e.inicio}～${e.saida || "atual"}`, e.salarioHora && `¥${e.salarioHora}/h`, e.contrato, e.shakaiHoken && `Shakai: ${e.shakaiHoken}`, e.motivoSaida && `saída: ${e.motivoSaida}`))
    .join(" | "),
);
const expBrasil = FX("Experiência no Brasil", (x) =>
  itensListaFicha(x.f, "experienciasBrasil")
    .map((e) => juntar(e.empresa, e.funcao, e.cidade, `${e.inicio}～${e.saida || "atual"}`, e.contrato, e.motivoSaida && `saída: ${e.motivoSaida}`))
    .join(" | "),
);
const japonesLeitura = FX("Japonês — leitura (hira/kata/kanji)", (x) => [valorFicha(x.f, "leHiragana"), valorFicha(x.f, "leKatakana"), valorFicha(x.f, "leKanji")].join(" / "));
const japonesEscrita = FX("Japonês — escrita (hira/kata/kanji)", (x) => [valorFicha(x.f, "escreveHiragana"), valorFicha(x.f, "escreveKatakana"), valorFicha(x.f, "escreveKanji")].join(" / "));
const saudeDetalhe = (label: string, id: string) => FX(label, (x) => juntar(valorFicha(x.f, id), valorFicha(x.f, `${id}Detalhe`)));
const cnh = FX("Carteira de motorista", (x) =>
  juntar(
    valorFicha(x.f, "cnhBrasil") === "Sim" ? `BR ${valorFicha(x.f, "cnhBrasilCategoria")} (${valorFicha(x.f, "cnhBrasilSituacao")})` : "",
    valorFicha(x.f, "cnhJapao") === "Sim" ? `JP ${valorFicha(x.f, "cnhJapaoCambio")}` : "",
  ) || "Não",
);
const visto = FX("Visto", (x) => juntar(valorFicha(x.f, "situacaoVisto"), valorFicha(x.f, "vistoData")));
const refJapao = FX("Referência no Japão", (x) =>
  juntar(valorFicha(x.f, "refJpNome"), valorFicha(x.f, "refJpParentesco"), valorFicha(x.f, "refJpProvincia"), valorFicha(x.f, "refJpEndereco"), valorFicha(x.f, "refJpTelefone")),
);
const emergBR = FX("Contato no Brasil", (x) => juntar(valorFicha(x.f, "emergBrNome"), valorFicha(x.f, "emergBrParentesco"), valorFicha(x.f, "emergBrEndereco"), valorFicha(x.f, "emergBrTelefone")));

export const MODELOS_PARCEIROS: ModeloParceiro[] = [
  {
    id: "avcorp",
    nome: "AVCORP / Rainichisha — Curriculum Vitae",
    arquivoOriginal: "FICHA AVCORP rainichisha v20240429.docx",
    secoes: [
      {
        titulo: "Dados",
        campos: [
          I("Data de preenchimento / Agência"),
          nomeCompleto,
          F("Data de nascimento", "dataNascimento"),
          F("Estado civil", "estadoCivil"),
          F("Nacionalidade", "nacionalidade"),
          geracao,
          temFilhos,
          endereco,
          F("Bairro", "bairro"),
          F("Cidade", "cidade"),
          F("Estado", "uf"),
          cep,
          email,
          R("ID Skype (descontinuado)"),
          celular,
          FX("Escolaridade / curso", (x) => juntar(rot(ESCOLARIDADES, x.p?.escolaridade), valorFicha(x.f, "curso"), valorFicha(x.f, "cursoConclusao"))),
        ],
      },
      { titulo: "Experiências", campos: [expBrasil, expJapao] },
      {
        titulo: "Japonês",
        campos: [jlpt, F("Conversação", "japonesConversacao"), japonesLeitura, japonesEscrita],
      },
      {
        titulo: "Japão e documentos",
        campos: [
          FX("Já foi ao Japão / quantas vezes", (x) => juntar(sn(x.p?.jaEsteveJapao), valorFicha(x.f, "vezesJapao") && `${valorFicha(x.f, "vezesJapao")}x`)),
          F("Quanto tempo pretende ficar", "tempoJapao"),
          FX("Ex-funcionário (fábrica)", (x) => juntar(valorFicha(x.f, "exEmpreiteira"), valorFicha(x.f, "exEmpreiteiraQual"))),
          F("Objetivo no Japão", "objetivos"),
          visto,
          FX("Re-Entry", (x) => juntar(sn(x.r.reEntry), valorFicha(x.f, "reEntryValidade"))),
          FX("Certificado de Elegibilidade", (x) => juntar(valorFicha(x.f, "certificadoElegibilidade"), valorFicha(x.f, "ceEmissao"), valorFicha(x.f, "ceValidade"))),
          F("Parentes no Japão", "parentesJapao"),
          FX("Koseki Tohon", (x) => juntar(valorFicha(x.f, "kosekiTohon"), valorFicha(x.f, "kosekiData"))),
          refJapao,
          F("Observações", "observacoes"),
          FX("RG", (x) => juntar(valorFicha(x.f, "rg"), valorFicha(x.f, "rgEmissor"))),
          F("Passaporte", "passaporteNumero"),
          F("CPF", "cpf"),
          previsaoEmbarque,
          I("Assinatura do candidato"),
        ],
      },
    ],
  },
  {
    id: "lista-verificacao",
    nome: "Lista de Verificação (来日者 確認事項)",
    arquivoOriginal: "LISTA DE VERIFICACAO exclusivo agência v20240429.docx",
    secoes: [
      {
        titulo: "Dados pessoais e família",
        campos: [
          nomeCompleto,
          F("Sexo", "sexo"),
          F("Data de nascimento", "dataNascimento"),
          idade,
          temFilhos,
          FX("Levar cônjuge/filhos", (x) => juntar(valorFicha(x.f, "levarFamilia"), valorFicha(x.f, "levarFamiliaQuem"), valorFicha(x.f, "levarFamiliaQuando"))),
          ...familia,
        ],
      },
      {
        titulo: "Condição física e saúde",
        campos: [
          altura,
          peso,
          F("Cintura", "cinturaCm"),
          F("Camisa", "camisa"),
          F("Calça", "calca"),
          F("Calçado", "calcado"),
          fumante,
          tatuagem,
          saudeDetalhe("Piercing", "piercing"),
          saudeDetalhe("Alergia", "alergia"),
          saudeDetalhe("Asma / bronquite", "asmaBronquite"),
          saudeDetalhe("Deficiência auditiva", "deficienciaAuditiva"),
          diabetes,
          saudeDetalhe("Problema cardíaco", "problemaCardiaco"),
          FX("Tratamento psicológico", (x) => juntar(valorFicha(x.f, "tratamentoPsicologico"), valorFicha(x.f, "tratamentoPsicologicoDetalhe"))),
          doencaGrave,
          saudeDetalhe("Problema na coluna", "problemaColuna"),
          saudeDetalhe("Restrição para trabalhar em pé", "restricaoEmPe"),
          saudeDetalhe("Fratura", "fratura"),
          saudeDetalhe("Acidente", "acidente"),
          saudeDetalhe("Pino ou placa", "pinoPlaca"),
          saudeDetalhe("Cirurgia", "cirurgia"),
          saudeDetalhe("Dificuldade de movimento", "dificuldadeMovimento"),
          saudeDetalhe("Limitação mãos/punhos", "limitacaoMaos"),
          F("Pode fazer barba/cortar cabelo", "barbaCabelo"),
          F("Pressão arterial", "pressaoArterial"),
          F("Mão dominante", "maoDominante"),
          daltonismo,
          FX("Óculos / lente / grau", (x) => juntar(valorFicha(x.f, "oculos"), valorFicha(x.f, "oculosGrauTipo"), valorFicha(x.f, "grauOD") && `OD ${valorFicha(x.f, "grauOD")}`, valorFicha(x.f, "grauOE") && `OE ${valorFicha(x.f, "grauOE")}`)),
          FX("Medicamentos", (x) => juntar(medicacaoControlada.valor(x), valorFicha(x.f, "medicamentoRegularDetalhe"))),
        ],
      },
      {
        titulo: "Informações gerais",
        campos: [
          cnh,
          F("Anda de bicicleta", "bicicleta"),
          FX("Qualificação", (x) => juntar(valorFicha(x.f, "qualificacoes"), valorFicha(x.f, "qualificacoesOutras"))),
          turnos,
          F("Usa computador", "usaComputador"),
          E("Região de preferência", (x) => x.p?.provinciaPreferida || "Sem preferência"),
          F("Segmento de preferência", "segmentoPreferido"),
          F("Ex-funcionário: aceita mesmo setor", "aceitaMesmoSetor"),
          F("Pode dividir apto", "dividirApto"),
          F("Pode trabalhar FDS", "fimDeSemana"),
          horasExtras,
          F("Check-up nos últimos 6 meses", "checkup"),
          F("Reserva financeira (¥50.000)", "reservaFinanceira"),
          previsaoEmbarque,
          ajudaGoverno,
          emergBR,
          F("Observações", "observacoes"),
          I("Teste de daltonismo A–F (agência)"),
          FX("Orientações cônjuge/filhos", (x) => (valorFicha(x.f, "cienteOrientacoesFamilia") ? "Ciente" : "")),
          I("Agência / responsável pela verificação"),
        ],
      },
    ],
  },
  {
    id: "fujiarte",
    nome: "FUJIARTE — Ficha Cadastral e Enquete",
    arquivoOriginal: "FUJIARTE Ficha Cadastral Jun2024.xls",
    secoes: [
      {
        titulo: "Ficha cadastral",
        campos: [
          nomeCompleto,
          FX("Como soube da Fujiarte", (x) => juntar(valorFicha(x.f, "comoSoube"), valorFicha(x.f, "comoSoubeDetalhe"))),
          FX("Quem indicou / relação", (x) => juntar(valorFicha(x.f, "indicadoPor"), valorFicha(x.f, "indicadoRelacao"))),
          E("Foto recente", () => "(foto enviada na etapa 2)"),
          F("Data de nascimento", "dataNascimento"),
          idade,
          F("Sexo", "sexo"),
          F("Estado civil", "estadoCivil"),
          F("Nacionalidade", "nacionalidade"),
          geracao,
          FX("Passaporte / validade", (x) => juntar(valorFicha(x.f, "passaporteNumero"), valorFicha(x.f, "passaporteValidade"))),
          visto,
          FX("Koseki / data", (x) => juntar(valorFicha(x.f, "kosekiTohon"), valorFicha(x.f, "kosekiData"))),
          FX("Re-Entry / validade", (x) => juntar(sn(x.r.reEntry), valorFicha(x.f, "reEntryValidade"))),
          F("CPF", "cpf"),
          FX("RG / emissor", (x) => juntar(valorFicha(x.f, "rg"), valorFicha(x.f, "rgEmissor"))),
          altura,
          peso,
          F("Cintura (cm)", "cinturaCm"),
          F("Pé (nº)", "calcado"),
          FX("Escolaridade", (x) => juntar(rot(ESCOLARIDADES, x.p?.escolaridade), valorFicha(x.f, "curso"), valorFicha(x.f, "instituicao"), valorFicha(x.f, "cursoConclusao"))),
          endereco,
          F("Bairro", "bairro"),
          F("Cidade", "cidade"),
          F("Estado", "uf"),
          cep,
          email,
          celular,
          F("Telefone fixo", "telefoneFixo"),
          ...familia,
          refJapao,
          jaFoiJapao,
          ajudaGoverno,
          expJapao,
          expBrasil,
        ],
      },
      {
        titulo: "Enquete",
        campos: [
          FX("1. Setores aceitos", (x) => juntar(valorFicha(x.f, "setoresAceitos"), valorFicha(x.f, "setoresMotivo"))),
          E("2. Preferência de região", (x) => x.p?.provinciaPreferida || "Não"),
          horasExtras,
          turnos,
          F("5. Sábados/domingos/feriados", "fimDeSemana"),
          F("6. Trabalha no dia de folga", "trabalhaFolga"),
          FX("7. Já trabalhou em pé", (x) => juntar(valorFicha(x.f, "trabalhouEmPe"), valorFicha(x.f, "horasEmPe") && `${valorFicha(x.f, "horasEmPe")}h/dia`)),
          dividasBR,
          dividasJP,
          FX("10. Dependentes", (x) => juntar(valorFicha(x.f, "levarFamilia"), valorFicha(x.f, "levarFamiliaQuem"), valorFicha(x.f, "levarFamiliaQuando"))),
          FX("11. Pet", (x) => juntar(valorFicha(x.f, "pet"), valorFicha(x.f, "petDetalhe"))),
          previsaoEmbarque,
          F("13. Tempo no Japão", "tempoJapao"),
          detido,
          tatuagem,
          visao,
          daltonismo,
          F("18. Divide apartamento", "dividirApto"),
          cnh,
          F("20. Bicicleta", "bicicleta"),
          F("21. Mão dominante", "maoDominante"),
          fumante,
          FX("23. Acidente/doença grave/operação", (x) => juntar(doencaGrave.valor(x), valorFicha(x.f, "acidenteDetalhe"), valorFicha(x.f, "cirurgiaDetalhe"))),
          saudeDetalhe("24. Sequela", "sequela"),
          FX("25. Dor crônica / coluna", (x) => juntar(valorFicha(x.f, "dorCronica"), valorFicha(x.f, "dorCronicaDetalhe"), valorFicha(x.f, "problemaColunaDetalhe"))),
          saudeDetalhe("26. Dificuldade de movimento", "dificuldadeMovimento"),
          FX("27. Saúde mental", (x) => juntar(valorFicha(x.f, "tratamentoPsicologico"), valorFicha(x.f, "tratamentoPsicologicoDetalhe"))),
          saudeDetalhe("28. Alergia", "alergia"),
          saudeDetalhe("29. Fobia", "fobia"),
          doencaGrave,
          FX("31. Medicamento", (x) => juntar(medicacaoControlada.valor(x), valorFicha(x.f, "medicamentoRegularDetalhe"))),
          FX("32. Por que quer ir ao Japão", (x) => juntar(valorFicha(x.f, "objetivos"), valorFicha(x.f, "objetivoOutro"))),
          FX("Declaração / autorização", (x) => (valorFicha(x.f, "declaracao") && valorFicha(x.f, "autorizacaoContato") ? "Aceitas" : "")),
          I("Agência / entrevistador / promotor"),
        ],
      },
    ],
  },
  {
    id: "suriemu",
    nome: "Suri-Emu — Ficha de Cadastro Digital",
    arquivoOriginal: "Ficha de Cadastro Digital.xls",
    secoes: [
      {
        titulo: "Cadastro",
        campos: [
          nomeCompleto,
          F("Data de nascimento", "dataNascimento"),
          idade,
          F("Cidade de nascimento", "cidadeNascimento"),
          F("Identidade", "rg"),
          F("CPF", "cpf"),
          endereco,
          F("Bairro", "bairro"),
          cep,
          F("Cidade", "cidade"),
          F("Estado", "uf"),
          F("Telefone residencial", "telefoneFixo"),
          celular,
          email,
          F("Estado civil", "estadoCivil"),
          temFilhos,
          altura,
          peso,
          F("Sapato nº", "calcado"),
          F("Manequim", "camisa"),
          F("Calça jeans nº", "calca"),
          geracao,
          FX("Passaporte / vencimento", (x) => juntar(valorFicha(x.f, "passaporteNumero"), valorFicha(x.f, "passaporteValidade"))),
          visto,
          FX("Re-Entry", (x) => juntar(sn(x.r.reEntry), valorFicha(x.f, "reEntryValidade"))),
          cnh,
          FX("Escolaridade", (x) => juntar(rot(ESCOLARIDADES, x.p?.escolaridade), valorFicha(x.f, "curso"), valorFicha(x.f, "cursoConclusao"))),
          FX("Japonês conversação/compreensão", (x) => juntar(valorFicha(x.f, "japonesConversacao"), valorFicha(x.f, "japonesCompreensao"))),
          japonesLeitura,
          japonesEscrita,
          ...familia,
          FX("Parentes/amigos na empreiteira", (x) => juntar(valorFicha(x.f, "conhecidosEmpreiteira"), valorFicha(x.f, "conhecidosEmpreiteiraQuem"))),
          FX("Como procurou", (x) => juntar(valorFicha(x.f, "comoSoube"), valorFicha(x.f, "comoSoubeDetalhe"), valorFicha(x.f, "indicadoPor"))),
          refJapao,
        ],
      },
      {
        titulo: "Experiência e questionário",
        campos: [
          expBrasil,
          expJapao,
          FX("Shakai Hoken", (x) => itensListaFicha(x.f, "experienciasJapao").map((e) => e.shakaiHoken).filter(Boolean).join(", ")),
          F("Seguro-desemprego no Japão", "seguroDesempregoJapao"),
          E("Preferência por região", (x) => x.p?.provinciaPreferida || "Não"),
          dividasBR,
          FX("Distrito policial no Japão", (x) => juntar(valorFicha(x.f, "distritoPolicialJapao"), valorFicha(x.f, "distritoPolicialDetalhe"))),
          F("Tempo no Japão", "tempoJapao"),
          F("Bicicleta", "bicicleta"),
          FX("Outros idiomas", (x) => juntar(valorFicha(x.f, "outrosIdiomas"), valorFicha(x.f, "outrosIdiomasQual"))),
          tatuagem,
          daltonismo,
          R("Bebida alcoólica (removida)"),
          R("Religião (removida — ver fim de semana)"),
          F("Pode trabalhar sábado e domingo", "fimDeSemana"),
          F("Destro ou canhoto", "maoDominante"),
          saudeDetalhe("Alergia", "alergia"),
          doencaGrave,
          saudeDetalhe("Acidente", "acidente"),
          saudeDetalhe("Deficiência física", "deficienciaFisica"),
          FX("Medicamento regular", (x) => juntar(medicacaoControlada.valor(x), valorFicha(x.f, "medicamentoRegularDetalhe"))),
          visao,
          F("Pressão arterial", "pressaoArterial"),
          saudeDetalhe("Tendinite", "tendinite"),
          diabetes,
          saudeDetalhe("Problema de coluna", "problemaColuna"),
          fumante,
          R("Está grávida (removida — Lei 9.029/95)"),
          horasExtras,
          F("Yakin (noturno)", "turnoNoturno"),
          F("Revezamento de turno", "turnoAlternadoSemanal"),
          ajudaGoverno,
        ],
      },
    ],
  },
];

export function montarFichaParceiro(id: string, x: ContextoFicha) {
  const modelo = MODELOS_PARCEIROS.find((m) => m.id === id);
  if (!modelo) return null;
  return {
    ...modelo,
    secoes: modelo.secoes.map((s) => ({
      titulo: s.titulo,
      linhas: s.campos.map((c) => ({ label: c.label, origem: c.origem, valor: c.valor(x) })),
    })),
  };
}
