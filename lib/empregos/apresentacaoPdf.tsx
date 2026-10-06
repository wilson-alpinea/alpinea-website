import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { NIVEIS_JAPONES_DETALHADOS } from "@/app/lib/candidaturaScoring";
import { itensListaFicha, valorFicha, type FichaCadastral } from "@/app/lib/fichaCadastral";
import { montarFichaParceiro, MODELOS_PARCEIROS, type ContextoFicha } from "@/app/lib/fichasParceiros";
import { OPCOES_FLEXIBILIDADE, type PerfilCandidato } from "@/app/lib/triagemPerfil";

// "Documento de Apresentação para Empreiteira" — Wilson, 06/out/2026: PDF
// com as informações do candidato para enviar à empreiteira. Dois tipos:
//   - "alpinea": apresentação resumida no padrão Alpinea (sem e-mail,
//     telefone, CPF ou RG — o contato com o candidato passa pela Alpinea);
//   - um dos MODELOS_PARCEIROS: a ficha completa no DE→PARA daquela
//     empreiteira (campos "interno" ficam em branco para a agência).

export const MODELOS_APRESENTACAO = [
  { id: "alpinea", nome: "Apresentação Alpinea (resumo, sem dados de contato)" },
  ...MODELOS_PARCEIROS.map((m) => ({ id: m.id, nome: `Ficha ${m.nome}` })),
];

const AZUL = "#1C3A5E";
const s = StyleSheet.create({
  page: { padding: 36, paddingBottom: 54, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },
  topo: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: AZUL, paddingBottom: 8 },
  marca: { fontSize: 13, fontFamily: "Helvetica-Bold", color: AZUL, letterSpacing: 2 },
  sub: { fontSize: 8, color: "#666" },
  cabecalho: { flexDirection: "row", marginTop: 16, gap: 14 },
  foto: { width: 84, height: 108, objectFit: "cover", borderRadius: 4 },
  fotoVazia: { width: 84, height: 108, backgroundColor: "#eee", borderRadius: 4, justifyContent: "center", alignItems: "center" },
  nome: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#111" },
  linhaInfo: { fontSize: 9, color: "#444", marginTop: 3 },
  selo: { marginTop: 8, alignSelf: "flex-start", backgroundColor: "#eef3f9", color: AZUL, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 3, fontSize: 8 },
  secao: { marginTop: 14 },
  secaoTitulo: { fontSize: 10, fontFamily: "Helvetica-Bold", color: AZUL, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 },
  linha: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e2e2e2", paddingVertical: 3 },
  rotulo: { width: "38%", color: "#666" },
  valor: { width: "62%" },
  interno: { width: "62%", color: "#aaa" },
  rodape: { position: "absolute", bottom: 22, left: 36, right: 36, fontSize: 7, color: "#888", textAlign: "center" },
});

type Linha = [string, string];

function Secao({ titulo, linhas }: { titulo: string; linhas: Linha[] }) {
  const visiveis = linhas.filter(([, v]) => v && v.trim());
  if (!visiveis.length) return null;
  return (
    <View style={s.secao} wrap={false}>
      <Text style={s.secaoTitulo}>{titulo}</Text>
      {visiveis.map(([k, v], i) => (
        <View key={`${k}-${i}`} style={s.linha}>
          <Text style={s.rotulo}>{k}</Text>
          <Text style={s.valor}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

export type DadosApresentacao = {
  candidatura: {
    id: string;
    nome: string;
    sobrenome: string;
    email: string;
    telefone: string;
    idade: number | null;
    vaga_titulo: string;
    vaga_empresa: string;
    pontuacao: number | null;
    respostas: Record<string, unknown> | null;
    ficha: FichaCadastral | null;
  };
  fotoDataUri: string | null;
  modelo: string;
};

const juntar = (...p: string[]) => p.filter(Boolean).join(" · ");

function linhasAlpinea(x: ContextoFicha): { titulo: string; linhas: Linha[] }[] {
  const f = x.f;
  const p = x.p;
  const v = (id: string) => valorFicha(f, id);
  const jlpt = NIVEIS_JAPONES_DETALHADOS.find((n) => n.key === x.r.nivelJaponesDetalhado);
  return [
    {
      titulo: "Japonês",
      linhas: [
        ["Nível (JLPT / BJT)", jlpt ? juntar(jlpt.label, jlpt.bjt ?? "") : ""],
        ["Conversação", v("japonesConversacao")],
        ["Compreensão", v("japonesCompreensao")],
        ["Leitura (hira/kata/kanji)", [v("leHiragana"), v("leKatakana"), v("leKanji")].filter(Boolean).join(" / ")],
        ["Escrita (hira/kata/kanji)", [v("escreveHiragana"), v("escreveKatakana"), v("escreveKanji")].filter(Boolean).join(" / ")],
        ["Outros idiomas", juntar(v("outrosIdiomas"), v("outrosIdiomasQual"))],
      ],
    },
    {
      titulo: "Experiência no Japão",
      linhas: itensListaFicha(f, "experienciasJapao").map((e, i) => [
        `${i + 1}. ${e.fabrica}`,
        juntar(e.empreiteira, e.funcao, juntar(e.provincia, e.cidade), `${e.inicio} a ${e.saida || "atual"}`, e.motivoSaida && `saída: ${e.motivoSaida}`),
      ]),
    },
    {
      titulo: "Experiência no Brasil",
      linhas: itensListaFicha(f, "experienciasBrasil").map((e, i) => [
        `${i + 1}. ${e.empresa}`,
        juntar(e.funcao, e.cidade, `${e.inicio} a ${e.saida || "atual"}`, e.motivoSaida && `saída: ${e.motivoSaida}`),
      ]),
    },
    {
      titulo: "Documentos e Japão",
      linhas: [
        ["Passaporte", v("passaporteValidade") ? `Válido até ${v("passaporteValidade")}` : x.r.passaporte === "sim" ? "Possui" : "Não possui"],
        ["Visto", juntar(v("situacaoVisto"), v("vistoData"))],
        ["Re-Entry", juntar(x.r.reEntry === "sim" ? "Sim" : x.r.reEntry === "nao" ? "Não" : "", v("reEntryValidade"))],
        ["Certificado de Elegibilidade", v("certificadoElegibilidade")],
        ["Koseki Tohon", v("kosekiTohon")],
        ["Já esteve no Japão", p?.jaEsteveJapao === "sim" ? `Sim — ${p.anosNoJapao ?? "?"} ano(s)` : p?.jaEsteveJapao === "nao" ? "Não" : ""],
        ["Carteira de motorista", juntar(v("cnhBrasil") === "Sim" ? `BR ${v("cnhBrasilCategoria")}` : "", v("cnhJapao") === "Sim" ? `JP ${v("cnhJapaoCambio")}` : "")],
        ["Qualificações", juntar(v("qualificacoes"), v("qualificacoesOutras"))],
      ],
    },
    {
      titulo: "Disponibilidade",
      linhas: [
        ["Previsão de embarque", v("mesEmbarque")],
        ["Tempo pretendido no Japão", v("tempoJapao")],
        ["Setores aceitos", v("setoresAceitos")],
        [
          "Turnos",
          juntar(
            ...[
              ["Diurno", "turnoDiurno"],
              ["Noturno", "turnoNoturno"],
              ["Alt. semanal", "turnoAlternadoSemanal"],
              ["Alt. mensal", "turnoAlternadoMensal"],
            ].map(([rot, id]) => (v(id) ? `${rot}: ${v(id).toLowerCase()}` : "")),
          ),
        ],
        ["Horas extras", p?.horasExtras === "sim" ? "Sim" : p?.horasExtras === "nao" ? "Não" : p?.horasExtras === "indiferente" ? "Indiferente" : ""],
        ["Fim de semana / feriados", v("fimDeSemana")],
        ["Região", juntar(p?.provinciaPreferida || "Sem preferência", OPCOES_FLEXIBILIDADE.find((o) => o.key === p?.flexibilidadeRegiao)?.label ?? "")],
        ["Divide apartamento", v("dividirApto")],
        ["Família junto", juntar(v("levarFamilia"), v("levarFamiliaQuem"))],
      ],
    },
    {
      titulo: "Medidas e físico",
      linhas: [
        ["Altura / peso", p?.alturaCm && p?.pesoKg ? `${p.alturaCm} cm · ${p.pesoKg} kg` : ""],
        ["Cintura / calça / camisa / calçado", juntar(v("cinturaCm") && `${v("cinturaCm")} cm`, v("calca") && `calça ${v("calca")}`, v("camisa"), v("calcado") && `calçado ${v("calcado")}`)],
        ["Mão dominante", v("maoDominante")],
        ["Óculos / lente", juntar(v("oculos"), v("oculosGrauTipo"))],
        ["Teste de cores", p?.testeDaltonismo ? `${p.testeDaltonismo.acertos}/${p.testeDaltonismo.total} — ${p.testeDaltonismo.aprovado ? "aprovado" : "reprovado"}` : ""],
        ["Tatuagem visível", p?.tatuagemVisivel === "sim" ? "Sim" : p?.tatuagemVisivel === "nao" ? "Não" : ""],
        ["Fumante", p?.fumante === "nao" ? "Não" : p?.fumante ? "Sim" : ""],
      ],
    },
  ];
}

export function ApresentacaoPdf({ candidatura: c, fotoDataUri, modelo }: DadosApresentacao) {
  const r = (c.respostas ?? {}) as ContextoFicha["r"];
  const x: ContextoFicha = {
    c: { nome: c.nome, sobrenome: c.sobrenome, email: c.email, telefone: c.telefone, idade: c.idade },
    r,
    p: (r.perfil ?? null) as PerfilCandidato | null,
    f: c.ficha,
  };
  const parceiro = modelo === "alpinea" ? null : montarFichaParceiro(modelo, x);
  const hoje = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const v = (id: string) => valorFicha(c.ficha, id);

  return (
    <Document title={`Apresentação — ${c.nome} ${c.sobrenome}`} author="Alpinea">
      <Page size="A4" style={s.page}>
        <View style={s.topo}>
          <View>
            <Text style={s.marca}>ALPINEA</Text>
            <Text style={s.sub}>Grupo Ajisai · Recrutamento Brasil–Japão</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{parceiro ? parceiro.nome : "Documento de Apresentação de Candidato"}</Text>
            <Text style={s.sub}>
              Emitido em {hoje} · Ref. #{c.id.slice(0, 8)}
            </Text>
          </View>
        </View>

        <View style={s.cabecalho}>
          {fotoDataUri ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={fotoDataUri} style={s.foto} />
          ) : (
            <View style={s.fotoVazia}>
              <Text style={s.sub}>sem foto</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={s.nome}>
              {c.nome} {c.sobrenome}
            </Text>
            <Text style={s.linhaInfo}>{juntar(c.idade ? `${c.idade} anos` : "", v("sexo"), v("estadoCivil"), v("nacionalidade"))}</Text>
            <Text style={s.linhaInfo}>{juntar(v("cidade") && `${v("cidade")}/${v("uf")}`, v("dataNascimento") && `nasc. ${v("dataNascimento")}`)}</Text>
            <Text style={s.linhaInfo}>
              Vaga: {c.vaga_titulo} — {c.vaga_empresa}
            </Text>
            {c.pontuacao !== null && <Text style={s.selo}>Compatibilidade com a vaga: {c.pontuacao}%</Text>}
          </View>
        </View>

        {parceiro
          ? parceiro.secoes.map((sec) => (
              <View key={sec.titulo} style={s.secao}>
                <Text style={s.secaoTitulo}>{sec.titulo}</Text>
                {sec.linhas
                  .filter((l) => l.origem !== "removido")
                  .map((l, i) => (
                    <View key={`${l.label}-${i}`} style={s.linha} wrap={false}>
                      <Text style={s.rotulo}>{l.label}</Text>
                      <Text style={l.origem === "interno" ? s.interno : s.valor}>{l.valor || (l.origem === "interno" ? "(preencher pela agência)" : "—")}</Text>
                    </View>
                  ))}
              </View>
            ))
          : linhasAlpinea(x).map((sec) => <Secao key={sec.titulo} titulo={sec.titulo} linhas={sec.linhas} />)}

        {!parceiro && (
          <View style={s.secao} wrap={false}>
            <Text style={s.secaoTitulo}>Contato</Text>
            <Text>O contato com o candidato é feito exclusivamente pela Alpinea / Ajisai: +55 (11) 93030-0101 · contato@alpinea.io</Text>
          </View>
        )}

        <Text
          style={s.rodape}
          render={({ pageNumber, totalPages }) =>
            `Documento confidencial — dados pessoais tratados conforme a LGPD, uso restrito a este processo seletivo. Página ${pageNumber}/${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
