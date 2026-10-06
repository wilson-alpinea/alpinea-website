// Etapa 2 da candidatura de /empregos — ficha cadastral unificada.
// Pedido do Wilson, 06/out/2026: juntar num formulário online as perguntas
// das 4 fichas das empreiteiras (Ficha AVCORP/Rainichisha, Lista de
// Verificação, Ficha Cadastral FUJIARTE e Ficha de Cadastro Digital
// Suri-Emu). Decisões tomadas com ele:
// - Só quem tem score 80+ (ou foi liberado manualmente pelo CRM) acessa.
// - O que já foi perguntado na etapa 1 (perfil/saúde, japonês JLPT,
//   ascendência, embarque, CEP, filhos, dívidas, tatuagem, etc.) NÃO é
//   repetido aqui.
// - Removidas: "Está grávida?" (Lei 9.029/95 proíbe), religião (virou só
//   disponibilidade de fim de semana) e bebida alcoólica. Polícia e saúde
//   mental ficam opcionais, com "prefiro não responder".
// - ID Skype (AVCORP) saiu — o Skype foi descontinuado.
// - Campos internos da agência (entrevistador, promotor, resultado do
//   teste) ficam no CRM, não no formulário.
//
// O formulário é declarativo: as SECOES abaixo alimentam a página, a
// validação no servidor (parseFicha/pendenciasFicha), o e-mail da equipe
// e a ficha no CRM (linhasFicha). Pra mudar uma pergunta, mude só aqui.

import { PROVINCIAS_JAPAO } from "./triagemPerfil";
import { NOTA_MINIMA_PROXIMA_ETAPA } from "./candidaturaScoring";

export type ValorCampo = string | string[];
export type FichaValores = Record<string, ValorCampo>;
export type FichaCadastral = { versao: 1; valores: FichaValores; listas: Record<string, FichaValores[]> };

export type Opcao = { v: string; l: string };
export type TipoCampo =
  | "texto"
  | "textarea"
  | "data"
  | "mes"
  | "numero"
  | "tel"
  | "cpf"
  | "select"
  | "radio"
  | "multi"
  | "aceite";

export type Campo = {
  id: string;
  label: string;
  tipo: TipoCampo;
  opcoes?: Opcao[];
  obrigatorio?: boolean;
  placeholder?: string;
  ajuda?: string;
  largura?: "inteira" | "meia" | "terco";
  // Só aparece (e só é validado) quando outro campo do mesmo escopo tem
  // um destes valores. Para campos "multi", basta conter um deles.
  se?: { campo: string; valores: string[] };
  // Respostas que viram ⚠ no CRM/e-mail da equipe.
  atencao?: string[];
};

export type Lista = {
  id: string;
  tipo: "lista";
  label: string;
  rotuloItem: string;
  max: number;
  ajuda?: string;
  campos: Campo[];
};

export type Secao = { id: string; titulo: string; descricao?: string; itens: (Campo | Lista)[] };

export const isLista = (i: Campo | Lista): i is Lista => i.tipo === "lista";

// ── Opções reutilizadas ───────────────────────────────────────────────
const SN: Opcao[] = [
  { v: "sim", l: "Sim" },
  { v: "nao", l: "Não" },
];
const SN_PREFIRO: Opcao[] = [...SN, { v: "prefiroNaoResponder", l: "Prefiro não responder" }];
const LEITURA: Opcao[] = [
  { v: "nao", l: "Não" },
  { v: "pouco", l: "Um pouco" },
  { v: "bem", l: "Bem" },
];
const NIVEL_FALA: Opcao[] = [
  { v: "nada", l: "Nada" },
  { v: "cumprimentos", l: "Só cumprimentos" },
  { v: "basico", l: "Básico" },
  { v: "intermediario", l: "Intermediário (dia a dia)" },
  { v: "fluente", l: "Fluente" },
];
const TURNO: Opcao[] = [
  { v: "prefere", l: "Prefiro" },
  { v: "aceita", l: "Aceito" },
  { v: "naoAceita", l: "Não aceito" },
];
const UFS = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO"
  .split(" ")
  .map((uf) => ({ v: uf, l: uf }));
const PROVINCIAS: Opcao[] = PROVINCIAS_JAPAO.map((p) => ({ v: p, l: p }));

// Pergunta de saúde Sim/Não + detalhe obrigatório quando "Sim".
function saude(id: string, label: string, detalhe = "Qual / onde e quando?"): Campo[] {
  return [
    { id, label, tipo: "radio", opcoes: SN, obrigatorio: true, atencao: ["sim"], largura: "meia" },
    { id: `${id}Detalhe`, label: detalhe, tipo: "texto", obrigatorio: true, se: { campo: id, valores: ["sim"] }, largura: "meia" },
  ];
}

// Texto exibido quando o candidato vai levar a família (Lista de
// Verificação — orientações para cônjuge e filhos).
export const ORIENTACOES_FAMILIA = [
  "O cônjuge deve aguardar a adaptação do(s) filho(s) na escola para depois procurar vaga e começar a trabalhar.",
  "Todos os custos do cônjuge e filho(s) — passagem aérea, seguro-viagem, visto e elegibilidade (pagos no Brasil) e trecho doméstico/traslado no Japão — são de responsabilidade da família.",
  "Não é possível embarcar a família com financiamento.",
];

export const SECOES: Secao[] = [
  {
    id: "pessoais",
    titulo: "Dados pessoais",
    itens: [
      { id: "dataNascimento", label: "Data de nascimento", tipo: "data", obrigatorio: true, largura: "terco" },
      { id: "sexo", label: "Sexo", tipo: "radio", opcoes: [{ v: "masculino", l: "Masculino" }, { v: "feminino", l: "Feminino" }], obrigatorio: true, largura: "terco" },
      {
        id: "estadoCivil",
        label: "Estado civil",
        tipo: "select",
        obrigatorio: true,
        largura: "terco",
        opcoes: [
          { v: "solteiro", l: "Solteiro(a)" },
          { v: "casado", l: "Casado(a)" },
          { v: "uniaoEstavel", l: "União estável" },
          { v: "separado", l: "Separado(a) / divorciado(a)" },
          { v: "viuvo", l: "Viúvo(a)" },
        ],
      },
      { id: "cidadeNascimento", label: "Cidade e estado de nascimento", tipo: "texto", obrigatorio: true, placeholder: "Ex.: Londrina / PR", largura: "meia" },
      {
        id: "nacionalidade",
        label: "Nacionalidade",
        tipo: "select",
        obrigatorio: true,
        largura: "meia",
        opcoes: [
          { v: "brasileira", l: "Brasileira" },
          { v: "japonesa", l: "Japonesa" },
          { v: "dupla", l: "Dupla (brasileira e japonesa)" },
          { v: "outra", l: "Outra" },
        ],
      },
      { id: "nacionalidadeOutra", label: "Qual nacionalidade?", tipo: "texto", obrigatorio: true, se: { campo: "nacionalidade", valores: ["outra"] }, largura: "meia" },
      {
        id: "comoSoube",
        label: "Como ficou sabendo da vaga?",
        tipo: "select",
        obrigatorio: true,
        largura: "meia",
        opcoes: [
          { v: "google", l: "Google / site" },
          { v: "redesSociais", l: "Redes sociais" },
          { v: "anuncio", l: "Anúncio (jornal, rádio, cartaz)" },
          { v: "indicacao", l: "Indicação de alguém" },
          { v: "outro", l: "Outro" },
        ],
      },
      { id: "comoSoubeDetalhe", label: "Qual?", tipo: "texto", se: { campo: "comoSoube", valores: ["anuncio", "outro", "redesSociais"] }, largura: "meia" },
      { id: "indicadoPor", label: "Nome de quem indicou", tipo: "texto", obrigatorio: true, se: { campo: "comoSoube", valores: ["indicacao"] }, largura: "meia" },
      { id: "indicadoRelacao", label: "Qual a relação com você?", tipo: "texto", se: { campo: "comoSoube", valores: ["indicacao"] }, largura: "meia" },
    ],
  },
  {
    id: "endereco",
    titulo: "Endereço e contato",
    descricao: "O CEP você já informou na etapa 1 — aqui completamos o endereço.",
    itens: [
      { id: "logradouro", label: "Rua / avenida", tipo: "texto", obrigatorio: true, largura: "meia" },
      { id: "numero", label: "Número", tipo: "texto", obrigatorio: true, largura: "terco" },
      { id: "complemento", label: "Complemento", tipo: "texto", largura: "terco", placeholder: "Apto, bloco…" },
      { id: "bairro", label: "Bairro", tipo: "texto", obrigatorio: true, largura: "terco" },
      { id: "cidade", label: "Cidade", tipo: "texto", obrigatorio: true, largura: "terco" },
      { id: "uf", label: "Estado", tipo: "select", opcoes: UFS, obrigatorio: true, largura: "terco" },
      { id: "telefoneFixo", label: "Telefone fixo / recado", tipo: "tel", largura: "terco" },
    ],
  },
  {
    id: "documentos",
    titulo: "Documentos e visto",
    itens: [
      { id: "cpf", label: "CPF", tipo: "cpf", obrigatorio: true, largura: "terco" },
      { id: "rg", label: "RG", tipo: "texto", obrigatorio: true, largura: "terco" },
      { id: "rgEmissor", label: "Órgão emissor", tipo: "texto", obrigatorio: true, placeholder: "SSP/SP", largura: "terco" },
      { id: "passaporteNumero", label: "Nº do passaporte", tipo: "texto", largura: "meia", ajuda: "Deixe em branco se ainda não tem." },
      { id: "passaporteValidade", label: "Validade do passaporte", tipo: "data", largura: "meia" },
      {
        id: "situacaoVisto",
        label: "Situação do visto",
        tipo: "select",
        obrigatorio: true,
        largura: "meia",
        opcoes: [
          { v: "naoTenho", l: "Ainda não tenho / preciso solicitar" },
          { v: "protocolado", l: "Visto já protocolado (aguardando)" },
          { v: "vistoNovo", l: "Visto novo emitido" },
          { v: "zairyu", l: "Tenho Zairyu Card (residence card)" },
          { v: "permanente", l: "Visto permanente" },
          { v: "japones", l: "Sou cidadão japonês (não preciso)" },
        ],
      },
      {
        id: "vistoData",
        label: "Data (prazo de entrada, previsão de emissão ou validade)",
        tipo: "data",
        obrigatorio: true,
        se: { campo: "situacaoVisto", valores: ["protocolado", "vistoNovo", "zairyu", "permanente"] },
        largura: "meia",
      },
      { id: "reEntryValidade", label: "Validade do Re-Entry", tipo: "data", largura: "meia", ajuda: "Só se você tiver Re-Entry." },
      { id: "certificadoElegibilidade", label: "Possui Certificado de Elegibilidade (在留資格認定証明書)?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia" },
      { id: "ceEmissao", label: "Emissão do certificado", tipo: "data", se: { campo: "certificadoElegibilidade", valores: ["sim"] }, largura: "meia" },
      { id: "ceValidade", label: "Validade do certificado", tipo: "data", se: { campo: "certificadoElegibilidade", valores: ["sim"] }, largura: "meia" },
      {
        id: "kosekiTohon",
        label: "Possui Koseki Tohon (戸籍謄本)?",
        tipo: "radio",
        obrigatorio: true,
        largura: "meia",
        opcoes: [
          { v: "atual", l: "Sim, atualizado" },
          { v: "antigo", l: "Sim, antigo" },
          { v: "nao", l: "Não" },
        ],
      },
      { id: "kosekiData", label: "Data de emissão do Koseki", tipo: "data", se: { campo: "kosekiTohon", valores: ["atual", "antigo"] }, largura: "meia" },
      { id: "cnhBrasil", label: "Tem carteira de motorista brasileira?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia" },
      { id: "cnhBrasilCategoria", label: "Categoria", tipo: "texto", placeholder: "A, B, AB…", se: { campo: "cnhBrasil", valores: ["sim"] }, largura: "terco" },
      {
        id: "cnhBrasilSituacao",
        label: "Situação",
        tipo: "radio",
        opcoes: [{ v: "valida", l: "Na validade" }, { v: "vencida", l: "Vencida" }],
        se: { campo: "cnhBrasil", valores: ["sim"] },
        largura: "terco",
      },
      { id: "cnhJapao", label: "Tem carteira de motorista japonesa?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia" },
      {
        id: "cnhJapaoCambio",
        label: "Câmbio",
        tipo: "radio",
        opcoes: [{ v: "at", l: "AT (automático)" }, { v: "mt", l: "MT (manual)" }],
        se: { campo: "cnhJapao", valores: ["sim"] },
        largura: "meia",
      },
    ],
  },
  {
    id: "formacao",
    titulo: "Formação, japonês e habilidades",
    descricao: "Escolaridade e nível JLPT/BJT você já informou na etapa 1.",
    itens: [
      { id: "curso", label: "Curso técnico ou superior (se houver)", tipo: "texto", largura: "meia" },
      { id: "instituicao", label: "Instituição", tipo: "texto", se: { campo: "curso", valores: ["*"] }, largura: "meia" },
      { id: "cursoConclusao", label: "Ano de conclusão — ou série/semestre em que parou", tipo: "texto", se: { campo: "curso", valores: ["*"] }, largura: "meia" },
      { id: "japonesConversacao", label: "Japonês — conversação", tipo: "select", opcoes: NIVEL_FALA, obrigatorio: true, largura: "meia" },
      { id: "japonesCompreensao", label: "Japonês — compreensão", tipo: "select", opcoes: NIVEL_FALA, obrigatorio: true, largura: "meia" },
      { id: "leHiragana", label: "Lê hiragana?", tipo: "radio", opcoes: LEITURA, obrigatorio: true, largura: "terco" },
      { id: "leKatakana", label: "Lê katakana?", tipo: "radio", opcoes: LEITURA, obrigatorio: true, largura: "terco" },
      { id: "leKanji", label: "Lê kanji?", tipo: "radio", opcoes: LEITURA, obrigatorio: true, largura: "terco" },
      { id: "escreveHiragana", label: "Escreve hiragana?", tipo: "radio", opcoes: LEITURA, obrigatorio: true, largura: "terco" },
      { id: "escreveKatakana", label: "Escreve katakana?", tipo: "radio", opcoes: LEITURA, obrigatorio: true, largura: "terco" },
      { id: "escreveKanji", label: "Escreve kanji?", tipo: "radio", opcoes: LEITURA, obrigatorio: true, largura: "terco" },
      { id: "outrosIdiomas", label: "Fala outros idiomas?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia" },
      { id: "outrosIdiomasQual", label: "Quais e em que nível?", tipo: "texto", obrigatorio: true, se: { campo: "outrosIdiomas", valores: ["sim"] }, largura: "meia" },
      { id: "usaComputador", label: "Consegue usar computador (mouse e digitação)?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia" },
      {
        id: "qualificacoes",
        label: "Qualificações",
        tipo: "multi",
        largura: "meia",
        opcoes: [
          { v: "empilhadeira", l: "Empilhadeira" },
          { v: "solda", l: "Solda" },
          { v: "outros", l: "Outras" },
        ],
      },
      { id: "qualificacoesOutras", label: "Quais outras qualificações?", tipo: "texto", obrigatorio: true, se: { campo: "qualificacoes", valores: ["outros"] } },
    ],
  },
  {
    id: "experiencia",
    titulo: "Experiência profissional",
    descricao: "Comece pelo emprego mais recente.",
    itens: [
      {
        id: "experienciasJapao",
        tipo: "lista",
        label: "Experiência no Japão",
        rotuloItem: "Emprego no Japão",
        max: 6,
        ajuda: "Pule se nunca trabalhou no Japão.",
        campos: [
          { id: "fabrica", label: "Fábrica", tipo: "texto", obrigatorio: true, largura: "meia" },
          { id: "empreiteira", label: "Empreiteira (haken)", tipo: "texto", largura: "meia" },
          { id: "funcao", label: "Serviço que fazia", tipo: "texto", obrigatorio: true, largura: "meia" },
          { id: "provincia", label: "Província", tipo: "select", opcoes: PROVINCIAS, largura: "terco" },
          { id: "cidade", label: "Cidade", tipo: "texto", largura: "terco" },
          { id: "inicio", label: "Início", tipo: "mes", obrigatorio: true, largura: "terco" },
          { id: "saida", label: "Saída (vazio = atual)", tipo: "mes", largura: "terco" },
          { id: "salarioHora", label: "Salário por hora (¥)", tipo: "numero", largura: "terco" },
          {
            id: "contrato",
            label: "Tipo de contrato",
            tipo: "select",
            largura: "terco",
            opcoes: [
              { v: "haken", l: "Empreiteira (haken)" },
              { v: "direto", l: "Direto com a fábrica" },
              { v: "arubaito", l: "Arubaito / meio período" },
              { v: "outro", l: "Outro" },
            ],
          },
          { id: "shakaiHoken", label: "Tinha Shakai Hoken?", tipo: "radio", opcoes: SN, largura: "meia" },
          { id: "motivoSaida", label: "Motivo da saída", tipo: "texto", largura: "meia" },
        ],
      },
      {
        id: "experienciasBrasil",
        tipo: "lista",
        label: "Experiência no Brasil",
        rotuloItem: "Emprego no Brasil",
        max: 5,
        campos: [
          { id: "empresa", label: "Empresa", tipo: "texto", obrigatorio: true, largura: "meia" },
          { id: "funcao", label: "Serviço que fazia", tipo: "texto", obrigatorio: true, largura: "meia" },
          { id: "cidade", label: "Cidade / UF", tipo: "texto", largura: "terco" },
          { id: "inicio", label: "Início", tipo: "mes", obrigatorio: true, largura: "terco" },
          { id: "saida", label: "Saída (vazio = atual)", tipo: "mes", largura: "terco" },
          {
            id: "contrato",
            label: "Tipo de contrato",
            tipo: "select",
            largura: "meia",
            opcoes: [
              { v: "clt", l: "CLT (carteira assinada)" },
              { v: "pj", l: "PJ / autônomo" },
              { v: "temporario", l: "Temporário" },
              { v: "informal", l: "Informal" },
              { v: "outro", l: "Outro" },
            ],
          },
          { id: "motivoSaida", label: "Motivo da saída", tipo: "texto", largura: "meia" },
        ],
      },
      { id: "vezesJapao", label: "Quantas vezes já foi trabalhar no Japão?", tipo: "numero", largura: "meia", ajuda: "0 se nunca foi." },
      {
        id: "seguroDesempregoJapao",
        label: "Já recebeu seguro-desemprego no Japão?",
        tipo: "radio",
        obrigatorio: true,
        opcoes: [...SN, { v: "naoSeAplica", l: "Nunca trabalhei no Japão" }],
      },
      { id: "exEmpreiteira", label: "Já trabalhou para alguma empreiteira parceira da Alpinea?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia" },
      { id: "exEmpreiteiraQual", label: "Qual empreiteira e fábrica?", tipo: "texto", obrigatorio: true, se: { campo: "exEmpreiteira", valores: ["sim"] }, largura: "meia" },
      {
        id: "aceitaMesmoSetor",
        label: "Aceita voltar para o mesmo setor em que trabalhou? (sem garantia de vaga)",
        tipo: "radio",
        opcoes: [{ v: "sim", l: "Sim, aceito" }, { v: "prefereOutro", l: "Prefiro outro" }],
        obrigatorio: true,
        se: { campo: "exEmpreiteira", valores: ["sim"] },
      },
      { id: "conhecidosEmpreiteira", label: "Tem parentes ou amigos trabalhando em empreiteiras no Japão?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia" },
      { id: "conhecidosEmpreiteiraQuem", label: "Quem e em qual empreiteira/unidade?", tipo: "texto", se: { campo: "conhecidosEmpreiteira", valores: ["sim"] }, largura: "meia" },
      { id: "trabalhouEmPe", label: "Já trabalhou em pé?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia" },
      { id: "horasEmPe", label: "Quantas horas por dia?", tipo: "numero", se: { campo: "trabalhouEmPe", valores: ["sim"] }, largura: "meia" },
    ],
  },
  {
    id: "familia",
    titulo: "Família e contatos",
    descricao: "Deixe em branco o que não se aplica.",
    itens: [
      { id: "paiNome", label: "Pai — nome completo", tipo: "texto", largura: "meia" },
      { id: "paiIdade", label: "Idade", tipo: "numero", largura: "terco" },
      { id: "paiOcupacao", label: "Ocupação", tipo: "texto", largura: "terco" },
      { id: "paiMora", label: "Onde mora (cidade/UF ou país)", tipo: "texto", largura: "terco" },
      { id: "paiTelefone", label: "Telefone", tipo: "tel", largura: "terco" },
      { id: "maeNome", label: "Mãe — nome completo", tipo: "texto", largura: "meia" },
      { id: "maeIdade", label: "Idade", tipo: "numero", largura: "terco" },
      { id: "maeOcupacao", label: "Ocupação", tipo: "texto", largura: "terco" },
      { id: "maeMora", label: "Onde mora (cidade/UF ou país)", tipo: "texto", largura: "terco" },
      { id: "maeTelefone", label: "Telefone", tipo: "tel", largura: "terco" },
      { id: "conjugeNome", label: "Cônjuge — nome completo", tipo: "texto", obrigatorio: true, se: { campo: "estadoCivil", valores: ["casado", "uniaoEstavel"] }, largura: "meia" },
      { id: "conjugeNascimento", label: "Data de nascimento", tipo: "data", se: { campo: "estadoCivil", valores: ["casado", "uniaoEstavel"] }, largura: "terco" },
      { id: "conjugeOcupacao", label: "Ocupação", tipo: "texto", se: { campo: "estadoCivil", valores: ["casado", "uniaoEstavel"] }, largura: "terco" },
      { id: "conjugeMora", label: "Onde mora", tipo: "texto", se: { campo: "estadoCivil", valores: ["casado", "uniaoEstavel"] }, largura: "terco" },
      { id: "conjugeTelefone", label: "Telefone", tipo: "tel", se: { campo: "estadoCivil", valores: ["casado", "uniaoEstavel"] }, largura: "terco" },
      {
        id: "filhos",
        tipo: "lista",
        label: "Filhos / dependentes",
        rotuloItem: "Filho(a)",
        max: 8,
        campos: [
          { id: "nome", label: "Nome", tipo: "texto", obrigatorio: true, largura: "meia" },
          { id: "nascimento", label: "Data de nascimento", tipo: "data", obrigatorio: true, largura: "meia" },
          {
            id: "japones",
            label: "Nível de japonês",
            tipo: "select",
            largura: "meia",
            opcoes: [
              { v: "nenhum", l: "Nenhum" },
              { v: "basico", l: "Básico" },
              { v: "intermediario", l: "Intermediário" },
              { v: "fluente", l: "Fluente" },
            ],
          },
          {
            id: "escola",
            label: "Escola desejada no Japão",
            tipo: "select",
            largura: "meia",
            opcoes: [
              { v: "japonesa", l: "Escola pública japonesa" },
              { v: "brasileira", l: "Escola brasileira" },
              { v: "internacional", l: "Escola internacional" },
              { v: "naoVai", l: "Não vai para o Japão" },
            ],
          },
        ],
      },
      {
        id: "irmaos",
        tipo: "lista",
        label: "Irmãos",
        rotuloItem: "Irmão(ã)",
        max: 8,
        campos: [
          { id: "nome", label: "Nome", tipo: "texto", obrigatorio: true, largura: "meia" },
          { id: "idade", label: "Idade", tipo: "numero", largura: "terco" },
          { id: "ocupacao", label: "Ocupação", tipo: "texto", largura: "terco" },
        ],
      },
      {
        id: "levarFamilia",
        label: "Pretende levar cônjuge e/ou filhos para o Japão?",
        tipo: "radio",
        obrigatorio: true,
        opcoes: [
          { v: "nao", l: "Não" },
          { v: "juntos", l: "Sim, vamos juntos" },
          { v: "depois", l: "Sim, vão depois" },
        ],
      },
      { id: "levarFamiliaQuem", label: "Quem vai?", tipo: "texto", obrigatorio: true, se: { campo: "levarFamilia", valores: ["juntos", "depois"] }, largura: "meia" },
      { id: "levarFamiliaQuando", label: "Quanto tempo depois?", tipo: "texto", obrigatorio: true, se: { campo: "levarFamilia", valores: ["depois"] }, largura: "meia" },
      {
        id: "cienteOrientacoesFamilia",
        label: "Li e estou ciente das orientações acima para cônjuge e filhos.",
        tipo: "aceite",
        obrigatorio: true,
        se: { campo: "levarFamilia", valores: ["juntos", "depois"] },
      },
      { id: "pet", label: "Pretende levar animal de estimação?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia", atencao: ["sim"] },
      { id: "petDetalhe", label: "Qual animal?", tipo: "texto", se: { campo: "pet", valores: ["sim"] }, largura: "meia" },
      { id: "emergBrNome", label: "Contato de emergência no Brasil — nome", tipo: "texto", obrigatorio: true, largura: "meia" },
      { id: "emergBrParentesco", label: "Parentesco", tipo: "texto", obrigatorio: true, largura: "terco" },
      { id: "emergBrTelefone", label: "Telefone", tipo: "tel", obrigatorio: true, largura: "terco" },
      { id: "emergBrEndereco", label: "Endereço", tipo: "texto", largura: "terco" },
      { id: "parentesJapao", label: "Tem parentes ou alguém de referência no Japão?", tipo: "radio", opcoes: SN, obrigatorio: true },
      { id: "refJpNome", label: "Referência no Japão — nome", tipo: "texto", obrigatorio: true, se: { campo: "parentesJapao", valores: ["sim"] }, largura: "meia" },
      { id: "refJpParentesco", label: "Parentesco", tipo: "texto", se: { campo: "parentesJapao", valores: ["sim"] }, largura: "meia" },
      { id: "refJpProvincia", label: "Província", tipo: "select", opcoes: PROVINCIAS, se: { campo: "parentesJapao", valores: ["sim"] }, largura: "terco" },
      { id: "refJpEndereco", label: "Endereço", tipo: "texto", se: { campo: "parentesJapao", valores: ["sim"] }, largura: "terco" },
      { id: "refJpTelefone", label: "Telefone", tipo: "tel", se: { campo: "parentesJapao", valores: ["sim"] }, largura: "terco" },
    ],
  },
  {
    id: "disponibilidade",
    titulo: "Disponibilidade e objetivos",
    itens: [
      {
        id: "setoresAceitos",
        label: "Em quais setores aceita trabalhar?",
        tipo: "multi",
        obrigatorio: true,
        largura: "meia",
        opcoes: [
          { v: "eletronica", l: "Eletrônica" },
          { v: "autopecas", l: "Autopeças" },
          { v: "alimenticio", l: "Alimentício" },
        ],
      },
      { id: "setoresMotivo", label: "Se não aceita algum, por quê?", tipo: "texto", largura: "meia" },
      { id: "segmentoPreferido", label: "Tem preferência de tipo de serviço?", tipo: "texto", placeholder: "Ex.: inspeção, montagem, embalagem…" },
      { id: "turnoDiurno", label: "Turno diurno", tipo: "radio", opcoes: TURNO, obrigatorio: true, largura: "meia" },
      { id: "turnoNoturno", label: "Turno noturno (yakin)", tipo: "radio", opcoes: TURNO, obrigatorio: true, largura: "meia" },
      { id: "turnoAlternadoSemanal", label: "Alternado semanal", tipo: "radio", opcoes: TURNO, obrigatorio: true, largura: "meia" },
      { id: "turnoAlternadoMensal", label: "Alternado mensal", tipo: "radio", opcoes: TURNO, obrigatorio: true, largura: "meia" },
      {
        id: "fimDeSemana",
        label: "Pode trabalhar aos",
        tipo: "multi",
        obrigatorio: true,
        largura: "meia",
        opcoes: [
          { v: "sabados", l: "Sábados" },
          { v: "domingos", l: "Domingos" },
          { v: "feriados", l: "Feriados" },
          { v: "nenhum", l: "Nenhum desses" },
        ],
      },
      { id: "trabalhaFolga", label: "Pode trabalhar no dia de folga quando a fábrica pedir?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia" },
      { id: "dividirApto", label: "Aceita dividir apartamento?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia", atencao: ["nao"] },
      { id: "bicicleta", label: "Sabe andar de bicicleta?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia" },
      {
        id: "maoDominante",
        label: "Mão dominante",
        tipo: "radio",
        obrigatorio: true,
        largura: "meia",
        opcoes: [
          { v: "destro", l: "Destro" },
          { v: "canhoto", l: "Canhoto" },
          { v: "ambidestro", l: "Ambidestro" },
        ],
      },
      { id: "mesEmbarque", label: "Previsão de embarque (mês/ano)", tipo: "mes", obrigatorio: true, largura: "meia" },
      {
        id: "tempoJapao",
        label: "Quanto tempo pretende trabalhar no Japão?",
        tipo: "select",
        obrigatorio: true,
        largura: "meia",
        opcoes: [
          { v: "ate1", l: "Até 1 ano" },
          { v: "1a3", l: "1 a 3 anos" },
          { v: "3a5", l: "3 a 5 anos" },
          { v: "mais5", l: "Mais de 5 anos" },
          { v: "indefinido", l: "Ainda não sei" },
        ],
      },
      {
        id: "objetivos",
        label: "Por que quer trabalhar no Japão?",
        tipo: "multi",
        obrigatorio: true,
        opcoes: [
          { v: "salario", l: "Salário melhor" },
          { v: "desemprego", l: "Desemprego" },
          { v: "familia", l: "Família no Japão" },
          { v: "imovel", l: "Comprar imóvel" },
          { v: "poupanca", l: "Fazer poupança" },
          { v: "dividas", l: "Quitar dívidas" },
          { v: "experiencia", l: "Experiência / cultura" },
          { v: "outros", l: "Outro motivo" },
        ],
      },
      { id: "objetivoOutro", label: "Qual outro motivo?", tipo: "texto", obrigatorio: true, se: { campo: "objetivos", valores: ["outros"] } },
      { id: "reservaFinanceira", label: "Vai levar reserva de pelo menos ¥50.000 para os primeiros dias?", tipo: "radio", opcoes: SN, obrigatorio: true, atencao: ["nao"] },
      { id: "distritoPolicialJapao", label: "Já esteve em distrito policial no Japão? (opcional)", tipo: "radio", opcoes: SN_PREFIRO, atencao: ["sim"], largura: "meia" },
      { id: "distritoPolicialDetalhe", label: "Onde, quando e motivo (opcional)", tipo: "texto", se: { campo: "distritoPolicialJapao", valores: ["sim"] }, largura: "meia" },
    ],
  },
  {
    id: "saude",
    titulo: "Medidas e saúde",
    descricao:
      "Uniforme e EPI são separados pelas medidas abaixo. As perguntas de saúde seguem o consentimento que você deu na etapa 1 e só são usadas para avaliar a compatibilidade com a função.",
    itens: [
      { id: "cinturaCm", label: "Cintura (cm)", tipo: "numero", obrigatorio: true, largura: "terco" },
      { id: "calcado", label: "Nº do calçado (BR)", tipo: "numero", obrigatorio: true, largura: "terco" },
      {
        id: "camisa",
        label: "Camisa / manequim",
        tipo: "select",
        obrigatorio: true,
        largura: "terco",
        opcoes: ["PP", "P", "M", "G", "GG", "XG", "XXG"].map((t) => ({ v: t, l: t })),
      },
      { id: "calca", label: "Nº da calça", tipo: "numero", obrigatorio: true, largura: "terco" },
      {
        id: "oculos",
        label: "Usa óculos ou lente de contato?",
        tipo: "radio",
        obrigatorio: true,
        largura: "meia",
        opcoes: [
          { v: "nao", l: "Não" },
          { v: "oculos", l: "Óculos" },
          { v: "lente", l: "Lente de contato" },
          { v: "ambos", l: "Os dois" },
        ],
      },
      {
        id: "oculosGrauTipo",
        label: "Para quê?",
        tipo: "multi",
        se: { campo: "oculos", valores: ["oculos", "lente", "ambos"] },
        largura: "meia",
        opcoes: [
          { v: "miopia", l: "Miopia" },
          { v: "hipermetropia", l: "Hipermetropia" },
          { v: "astigmatismo", l: "Astigmatismo" },
          { v: "outro", l: "Outro" },
        ],
      },
      { id: "grauOD", label: "Grau olho direito (OD)", tipo: "texto", se: { campo: "oculos", valores: ["oculos", "lente", "ambos"] }, largura: "terco" },
      { id: "grauOE", label: "Grau olho esquerdo (OE)", tipo: "texto", se: { campo: "oculos", valores: ["oculos", "lente", "ambos"] }, largura: "terco" },
      {
        id: "pressaoArterial",
        label: "Pressão arterial",
        tipo: "radio",
        obrigatorio: true,
        atencao: ["alta"],
        opcoes: [
          { v: "normal", l: "Normal" },
          { v: "alta", l: "Alta" },
          { v: "baixa", l: "Baixa" },
          { v: "naoSei", l: "Não sei" },
        ],
      },
      ...saude("piercing", "Tem piercing?", "Onde?"),
      ...saude("alergia", "Tem alergia (alimento, medicamento, produto químico…)?", "A quê?"),
      ...saude("asmaBronquite", "Tem asma ou bronquite?"),
      ...saude("deficienciaAuditiva", "Tem alguma deficiência auditiva?"),
      ...saude("problemaCardiaco", "Tem problema cardíaco?"),
      ...saude("problemaColuna", "Tem ou teve problema de coluna (hérnia, escoliose, nervo ciático, lombar)?"),
      ...saude("dorCronica", "Sofre de alguma dor crônica (coluna, mão, joelho…)?", "Onde?"),
      ...saude("tendinite", "Tem ou teve tendinite?", "Onde e quando?"),
      ...saude("restricaoEmPe", "Tem alguma restrição para trabalhar em pé?"),
      ...saude("dificuldadeMovimento", "Tem dificuldade em algum movimento do corpo?", "Qual?"),
      ...saude("limitacaoMaos", "Tem limitação de movimento nas mãos ou punhos?", "Qual?"),
      ...saude("deficienciaFisica", "Tem alguma deficiência física?", "Qual?"),
      ...saude("fratura", "Já teve fratura?", "Onde e quando?"),
      ...saude("acidente", "Já sofreu algum acidente grave?", "Qual e quando?"),
      ...saude("cirurgia", "Já fez alguma cirurgia?", "Qual e quando?"),
      ...saude("pinoPlaca", "Tem pino ou placa de metal no corpo?", "Onde?"),
      ...saude("sequela", "Ficou com alguma sequela de acidente, doença ou cirurgia?", "Qual?"),
      ...saude("fobia", "Tem alguma fobia (altura, lugar fechado…)?", "Qual?"),
      ...saude("medicamentoRegular", "Toma algum medicamento regularmente?", "Qual, para quê e com que frequência?"),
      { id: "barbaCabelo", label: "Pode fazer a barba e cortar o cabelo se a fábrica exigir?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia", atencao: ["nao"] },
      { id: "checkup", label: "Fez check-up médico nos últimos 6 meses?", tipo: "radio", opcoes: SN, obrigatorio: true, largura: "meia" },
      { id: "tratamentoPsicologico", label: "Já fez ou faz tratamento psicológico ou psiquiátrico? (opcional)", tipo: "radio", opcoes: SN_PREFIRO, largura: "meia" },
      { id: "tratamentoPsicologicoDetalhe", label: "Se quiser, conte mais (opcional)", tipo: "texto", se: { campo: "tratamentoPsicologico", valores: ["sim"] }, largura: "meia" },
    ],
  },
  {
    id: "final",
    titulo: "Finalização",
    itens: [
      { id: "observacoes", label: "Alguma informação a mais que a gente deva saber?", tipo: "textarea" },
      { id: "declaracao", label: "Declaro que as informações desta ficha são verdadeiras.", tipo: "aceite", obrigatorio: true },
      {
        id: "autorizacaoContato",
        label: "Autorizo a Alpinea e as empresas parceiras a entrar em contato pelos dados informados sobre o processo seletivo.",
        tipo: "aceite",
        obrigatorio: true,
      },
    ],
  },
];

export const FICHA_VAZIA: FichaCadastral = { versao: 1, valores: {}, listas: {} };

// ── Helpers ───────────────────────────────────────────────────────────
const vazio = (v: ValorCampo | undefined) => (Array.isArray(v) ? v.length === 0 : !v || !String(v).trim());

export function campoVisivel(c: Campo, escopo: FichaValores, raiz: FichaValores = escopo): boolean {
  if (!c.se) return true;
  const v = c.se.campo in escopo ? escopo[c.se.campo] : raiz[c.se.campo];
  if (c.se.valores.includes("*")) return !vazio(v);
  if (Array.isArray(v)) return v.some((x) => c.se!.valores.includes(x));
  return c.se.valores.includes(v ?? "");
}

export function apenasDigitos(s: string) {
  return s.replace(/\D/g, "");
}

export function cpfValido(cpf: string): boolean {
  const d = apenasDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  for (const t of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(d[i]) * (t + 1 - i);
    const dig = ((soma * 10) % 11) % 10;
    if (dig !== Number(d[t])) return false;
  }
  return true;
}

export function formatarCpf(s: string) {
  const d = apenasDigitos(s).slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function sanitizarCampo(c: Campo, bruto: unknown): ValorCampo | undefined {
  const limite = c.tipo === "textarea" ? 3000 : 300;
  if (c.tipo === "multi") {
    if (!Array.isArray(bruto)) return undefined;
    const validos = (c.opcoes ?? []).map((o) => o.v);
    const lista = Array.from(new Set(bruto.map(String).filter((x) => validos.includes(x))));
    return lista.length ? lista : undefined;
  }
  if (typeof bruto !== "string" && typeof bruto !== "number") return undefined;
  let s = String(bruto).trim().slice(0, limite);
  if (!s) return undefined;
  if ((c.tipo === "select" || c.tipo === "radio") && !(c.opcoes ?? []).some((o) => o.v === s)) return undefined;
  if (c.tipo === "aceite") return s === "sim" ? "sim" : undefined;
  if (c.tipo === "numero") {
    const n = Number(s.replace(",", "."));
    return Number.isFinite(n) && n >= 0 && n < 1_000_000 ? String(n) : undefined;
  }
  if (c.tipo === "data") return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined;
  if (c.tipo === "mes") return /^\d{4}-\d{2}$/.test(s) ? s : undefined;
  if (c.tipo === "cpf") s = formatarCpf(s);
  return s;
}

function sanitizarEscopo(campos: Campo[], bruto: Record<string, unknown>, raiz?: FichaValores): FichaValores {
  const out: FichaValores = {};
  for (const c of campos) {
    const v = sanitizarCampo(c, bruto[c.id]);
    if (v !== undefined) out[c.id] = v;
  }
  // Remove respostas de campos condicionais que ficaram escondidos.
  for (const c of campos) if (!campoVisivel(c, out, raiz ?? out)) delete out[c.id];
  return out;
}

// Normaliza o que veio do navegador: só ids conhecidos, opções válidas,
// tamanhos limitados — nunca gravar JSON arbitrário do cliente.
export function parseFicha(bruto: unknown): FichaCadastral {
  const o = (bruto && typeof bruto === "object" ? bruto : {}) as { valores?: unknown; listas?: unknown };
  const valoresBrutos = (o.valores && typeof o.valores === "object" ? o.valores : {}) as Record<string, unknown>;
  const listasBrutas = (o.listas && typeof o.listas === "object" ? o.listas : {}) as Record<string, unknown>;
  const campos = SECOES.flatMap((s) => s.itens.filter((i): i is Campo => !isLista(i)));
  const valores = sanitizarEscopo(campos, valoresBrutos);
  const listas: Record<string, FichaValores[]> = {};
  for (const l of SECOES.flatMap((s) => s.itens.filter(isLista))) {
    const itens = Array.isArray(listasBrutas[l.id]) ? (listasBrutas[l.id] as unknown[]) : [];
    const limpos = itens
      .slice(0, l.max)
      .map((it) => sanitizarEscopo(l.campos, (it && typeof it === "object" ? it : {}) as Record<string, unknown>, valores))
      .filter((it) => Object.keys(it).length > 0);
    if (limpos.length) listas[l.id] = limpos;
  }
  return { versao: 1, valores, listas };
}

// Lista do que falta preencher (labels), na ordem do formulário.
export function pendenciasFicha(f: FichaCadastral, secaoId?: string): string[] {
  const faltas: string[] = [];
  for (const s of SECOES) {
    if (secaoId && s.id !== secaoId) continue;
    for (const item of s.itens) {
      if (isLista(item)) {
        (f.listas[item.id] ?? []).forEach((it, idx) => {
          for (const c of item.campos)
            if (c.obrigatorio && campoVisivel(c, it, f.valores) && vazio(it[c.id])) faltas.push(`${item.rotuloItem} ${idx + 1}: ${c.label}`);
        });
        continue;
      }
      if (!item.obrigatorio || !campoVisivel(item, f.valores)) continue;
      if (vazio(f.valores[item.id])) {
        // Detalhes curtos ("Onde?", "Qual?") ganham a pergunta-mãe como contexto.
        const mae = item.se && item.label.length < 30 ? s.itens.find((i) => i.id === item.se!.campo) : undefined;
        faltas.push(mae ? `${mae.label.replace(/\?$/, "")} — ${item.label}` : item.label);
      }
      else if (item.tipo === "cpf" && !cpfValido(String(f.valores[item.id]))) faltas.push("CPF válido");
    }
  }
  return faltas;
}

function rotulo(c: Campo, v: ValorCampo | undefined): string {
  if (v === undefined || vazio(v)) return "—";
  const nome = (x: string) => c.opcoes?.find((o) => o.v === x)?.l ?? x;
  if (Array.isArray(v)) return v.map(nome).join(", ");
  if (c.tipo === "aceite") return "Sim";
  if (c.tipo === "data") return v.split("-").reverse().join("/");
  if (c.tipo === "mes") return v.split("-").reverse().join("/");
  return nome(v);
}

function emAtencao(c: Campo, v: ValorCampo | undefined) {
  if (!c.atencao || v === undefined) return false;
  return Array.isArray(v) ? v.some((x) => c.atencao!.includes(x)) : c.atencao.includes(v);
}

// Linhas agrupadas para o CRM e o e-mail da equipe: [label, valor, atenção].
export function linhasFicha(f: FichaCadastral | null | undefined): { grupo: string; linhas: [string, string, boolean][] }[] {
  if (!f) return [];
  const grupos: { grupo: string; linhas: [string, string, boolean][] }[] = [];
  for (const s of SECOES) {
    const linhas: [string, string, boolean][] = [];
    for (const item of s.itens) {
      if (isLista(item)) {
        (f.listas[item.id] ?? []).forEach((it, idx) => {
          const resumo = item.campos
            .filter((c) => !vazio(it[c.id]))
            .map((c) => `${c.label}: ${rotulo(c, it[c.id])}`)
            .join(" · ");
          linhas.push([`${item.rotuloItem} ${idx + 1}`, resumo || "—", false]);
        });
        continue;
      }
      if (item.tipo === "aceite" && item.id !== "cienteOrientacoesFamilia") continue;
      const v = f.valores[item.id];
      if (v === undefined || vazio(v)) continue;
      linhas.push([item.label, rotulo(item, v), emAtencao(item, v)]);
    }
    if (linhas.length) grupos.push({ grupo: s.titulo, linhas });
  }
  return grupos;
}

// Tags "REVISAR" a partir da ficha — somam com as da etapa 1 no CRM.
export function pontosRevisarFicha(f: FichaCadastral): string[] {
  const tags: string[] = [];
  for (const s of SECOES)
    for (const item of s.itens)
      if (!isLista(item) && emAtencao(item, f.valores[item.id])) {
        const t = item.label.replace(/\s*\(.*$/, "").replace(/\?.*$/, "").replace(/^(Tem ou teve|Tem|Já) /, "");
        tags.push(t.charAt(0).toUpperCase() + t.slice(1));
      }
  return tags;
}

// Quem pode abrir a etapa 2: score >= 80 e não eliminado, ou liberado
// manualmente pela equipe no CRM.
export function fichaLiberada(c: { pontuacao: number | null; classificacao?: string | null; ficha_liberada?: boolean | null }) {
  if (c.ficha_liberada) return true;
  return (c.pontuacao ?? 0) >= NOTA_MINIMA_PROXIMA_ETAPA && c.classificacao !== "eliminado";
}

// ── Leitura formatada (usada pelos modelos das fichas das parceiras) ───
const TODOS_CAMPOS: Record<string, Campo> = Object.fromEntries(
  SECOES.flatMap((s) => s.itens.filter((i): i is Campo => !isLista(i))).map((c) => [c.id, c]),
);
const TODAS_LISTAS: Record<string, Lista> = Object.fromEntries(SECOES.flatMap((s) => s.itens.filter(isLista)).map((l) => [l.id, l]));

/** Valor de um campo da ficha já com o rótulo da opção ("Casado(a)", "12/03/1990"…). Vazio = "". */
export function valorFicha(f: FichaCadastral | null | undefined, id: string): string {
  const c = TODOS_CAMPOS[id];
  const v = f?.valores[id];
  if (!c || v === undefined || vazio(v)) return "";
  return rotulo(c, v);
}

/** Itens de uma lista (experiências, filhos…) com cada campo formatado. */
export function itensListaFicha(f: FichaCadastral | null | undefined, id: string): Record<string, string>[] {
  const l = TODAS_LISTAS[id];
  if (!l || !f) return [];
  return (f.listas[id] ?? []).map((it) =>
    Object.fromEntries(l.campos.map((c) => [c.id, it[c.id] === undefined || vazio(it[c.id]) ? "" : rotulo(c, it[c.id])])),
  );
}
