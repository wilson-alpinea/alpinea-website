import path from "node:path";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ComponentProps, ReactNode } from "react";
import type { ValoresModelo } from "./valoresModelos";

// Lista de Verificação (来日者 確認事項) em PDF — Wilson, 29/out/2026: o
// parceiro abre o Word no Google Docs e o layout "estoura". Mesmo conteúdo e
// mesma ordem do modelo lib/empregos/modelos/lista-verificacao.docx, com os
// MESMOS valores (MODELOS_ORIGINAIS → lista), redesenhado em @react-pdf.
// Fonte Noto Sans JP recortada só com os caracteres do formulário
// (lib/empregos/fontes/, ~200 KB cada) — Helvetica não tem japonês.

const PASTA_FONTES = path.join(process.cwd(), "lib", "empregos", "fontes");
Font.register({
  family: "NotoJP",
  fonts: [
    { src: path.join(PASTA_FONTES, "NotoSansJP-Regular-lista.ttf") },
    { src: path.join(PASTA_FONTES, "NotoSansJP-Bold-lista.ttf"), fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback((w) => [w]);

const BORDA = "#7a7a7a";
const CINZA = "#f2f2f2";
const AZUL = "#1f3c88";
export const s = StyleSheet.create({
  page: { paddingTop: 24, paddingBottom: 30, paddingHorizontal: 26, fontFamily: "NotoJP", fontSize: 7.4, color: "#111" },
  topo: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  titulo: { fontSize: 15, fontWeight: 700 },
  versao: { fontSize: 7, color: "#333", marginTop: 1 },
  selo: { borderWidth: 1.4, borderColor: "#d0021b", borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8, alignItems: "center" },
  seloT1: { color: "#d0021b", fontWeight: 700, fontSize: 9 },
  seloT2: { color: "#333", fontSize: 6, fontWeight: 700 },
  secao: { fontSize: 9.5, fontWeight: 700, marginTop: 5, marginBottom: 2 },
  tabela: { borderWidth: 0.8, borderColor: BORDA },
  linha: { flexDirection: "row", borderBottomWidth: 0.6, borderBottomColor: BORDA },
  cel: { borderRightWidth: 0.6, borderRightColor: BORDA, paddingVertical: 2.5, paddingHorizontal: 4, justifyContent: "center" },
  cab: { backgroundColor: CINZA, textAlign: "center" },
  rot: { fontSize: 6.8, color: "#222" },
  val: { fontSize: 8.6, color: AZUL },
  caixa: { width: 7, height: 7, borderWidth: 0.7, borderColor: "#222", marginRight: 2, alignItems: "center", justifyContent: "center" },
  opcao: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  nota: { fontSize: 6.4, color: "#333", marginTop: 2 },
  rodape: { position: "absolute", bottom: 12, left: 26, right: 26, fontSize: 6, color: "#888", textAlign: "center" },
});

export type V = ValoresModelo;

// <J> = <Text> (mantido como ponto único para ajustes de texto).
export function J(props: ComponentProps<typeof Text>) {
  return <Text {...props} />;
}
const tem = (v: V, k: string) => Boolean((v[k] ?? "").trim());

export function Caixa({ marcado, rotulo }: { marcado: boolean; rotulo: string }) {
  return (
    <View style={s.opcao}>
      <View style={[s.caixa, marcado ? { backgroundColor: AZUL, borderColor: AZUL } : {}]} />
      <J>{rotulo}</J>
    </View>
  );
}
export const Opcoes = ({ v, itens }: { v: V; itens: [string, string][] }) => (
  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
    {itens.map(([k, r]) => (
      <Caixa key={k} marcado={tem(v, k)} rotulo={r} />
    ))}
  </View>
);
export const SimNao = ({ v, sim, nao }: { v: V; sim: string; nao: string }) => <Opcoes v={v} itens={[[sim, "Simはい"], [nao, "Nãoいいえ"]]} />;

type Estilo = Exclude<ComponentProps<typeof View>["style"], undefined | unknown[]>;
export function Cel({ w, children, cab, ultima, style }: { w: string | number; children?: ReactNode; cab?: boolean; ultima?: boolean; style?: Estilo }) {
  return <View style={[s.cel, cab ? s.cab : {}, ultima ? { borderRightWidth: 0 } : {}, { width: w }, style ?? {}]}>{children}</View>;
}
export const Campo = ({ rotulo, valor }: { rotulo: string; valor?: string }) => (
  <>
    <J style={s.rot}>{rotulo}</J>
    <J style={s.val}>{valor || " "}</J>
  </>
);

const SAUDE: [string, string, string, string][] = [
  ["fumante", "1. Fumante喫煙者ですか", "doencaGrave", "11. Doença grave重病"],
  ["tatuagem", "2. Tatuagemタトゥー (どの部分)?", "coluna", "12. Problema na coluna腰の病気"],
  ["piercing", "3. Piercingボディーピアス(どの部分)?", "emPe", "13. Tem alguma restrição para trabalhar em pé?\n立って仕事するのは問題あり"],
  ["alergia", "4. Alergiaアレルギー", "fratura", "14. Fratura骨折"],
  ["asma", "5. Asma/Bronquite 喘息 / 気管支炎", "acidente", "15. Acidente 事故"],
  ["auditiva", "6. Deficiência auditiva 聴力異常", "pino", "16. Pino ou placa 体内に金属"],
  ["diabetes", "7. Diabetes糖尿病", "cirurgia", "17. Cirurgia手術歴"],
  ["cardiaco", "8. Problema cardíaco心臓病", "movimento", "18. Tem dificuldade de movimento (corpo)?\n体の動きに異変あり"],
  ["bemPsico", "9. Está bem psicologicamente? 精神的にOK?", "maos", "19. Tem limitação de movimento das mãos e punhos?\n手の動きに異変あり"],
  ["tratPsico", "10. Já passou por algum tratamento psicológico?\n精神関係の治療履歴", "barba", "20. Pode fazer a barba/cortar cabelo?\n髭を剃る、髪の毛を切ることができますか?"],
];

const FAMILIA: [string, string][] = [
  ["pai", "Pai父"],
  ["mae", "Mãe母"],
  ["conjuge", "Cônjuge配偶者"],
  ["filho0", "Dependentes/filhos\n扶養家族"],
  ["filho1", "Dependentes/filhos\n扶養家族"],
  ["filho2", "Dependentes/filhos\n扶養家族"],
];

const TURNOS: [string, string][] = [
  ["diu", "Diurno昼勤"],
  ["not", "Noturno夜勤"],
  ["sem", "Alternado Semanal週交代勤務可"],
  ["mes", "Mensal月交代勤務可"],
];

function Topo() {
  return (
    <View style={s.topo}>
      <View>
        <J style={s.titulo}>来日者 確認事項 LISTA DE VERIFICAÇÃO</J>
        <J style={s.versao}>Versão 20240429 – 来日者</J>
      </View>
      <View style={s.selo}>
        <J style={s.seloT1}>CONFIDENCIAL</J>
        <J style={s.seloT2}>USO EXCLUSIVO AGÊNCIA</J>
      </View>
    </View>
  );
}

export function ListaVerificacaoPdf({ v, candidato }: { v: V; candidato: string }) {
  const sn = (k: string) => (
    <Cel w="7%" style={{ alignItems: "center" }}>
      <J style={[s.val, { fontWeight: 700 }]}>{v[k] ? "X" : " "}</J>
    </Cel>
  );
  return (
    <Document title={`Lista de Verificação — ${candidato}`} author="Ajisai">
      {/* ── Página 1 ── */}
      <Page size="A4" style={s.page}>
        <Topo />
        <J style={s.secao}>個人情報・ DADOS PESSOAIS</J>
        <View style={s.tabela}>
          <View style={s.linha}>
            <Cel w="56%"><Campo rotulo="Nome completo氏名" valor={v.nome} /></Cel>
            <Cel w="16%"><J style={s.rot}>Sexo 性別</J><Opcoes v={v} itens={[["cb:sexoM", "M男"], ["cb:sexoF", "F女"]]} /></Cel>
            <Cel w="17%"><Campo rotulo="Data Nascimento生年月日" valor={v.nascimento} /></Cel>
            <Cel w="11%" ultima><Campo rotulo="Idade年齢" valor={v.idade} /></Cel>
          </View>
          <View style={[s.linha, { borderBottomWidth: 0 }]}>
            <Cel w="20%"><J style={s.rot}>Filhos? お子さん</J><SimNao v={v} sim="cb:filhosSim" nao="cb:filhosNao" /></Cel>
            <Cel w="9%"><Campo rotulo="Qtde. 何人" valor={v.qtdFilhos} /></Cel>
            <Cel w="71%" ultima>
              <J style={s.rot}>Pretende levar o cônjuge e os filhos para o Japão? 配偶者またはお子さんを日本へ連れて行きますか?</J>
              <J style={s.rot}>Informar quem e se pretende ir junto ou depois 一緒に来日予定のメンバーと全員一緒に行くのか、後から呼び寄せるのか</J>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 1 }}>
                <SimNao v={v} sim="cb:levarSim" nao="cb:levarNao" />
                <J style={s.val}>{v.levarDetalhe}</J>
              </View>
            </Cel>
          </View>
        </View>
        <View style={[s.tabela, { borderTopWidth: 0 }]}>
          <View style={s.linha}>
            <Cel w="34%" cab><J>Nome dos familiares家族の名前</J></Cel>
            <Cel w="17%" cab><J>Parentesco 関係</J></Cel>
            <Cel w="12%" cab><J>Local Moradia{"\n"}Estado/cidade{"\n"}在住場所</J></Cel>
            <Cel w="11%" cab><J>Data Nascimento{"\n"}生年月日</J></Cel>
            <Cel w="26%" cab ultima><J>Nível de japonês e tipo de escola desejada (filhos){"\n"}日本語レベルと学校希望{"\n"}（お子さんの場合）</J></Cel>
          </View>
          {FAMILIA.map(([k, rot], i) => (
            <View key={k} style={[s.linha, i === FAMILIA.length - 1 ? { borderBottomWidth: 0 } : {}]}>
              <Cel w="34%"><J style={s.val}>{v[`${k}_nome`] || " "}</J></Cel>
              <Cel w="17%" style={{ alignItems: "center" }}><J>{rot}</J></Cel>
              <Cel w="12%"><J style={s.val}>{v[`${k}_mora`] || " "}</J></Cel>
              <Cel w="11%"><J style={s.val}>{v[`${k}_nasc`] || " "}</J></Cel>
              <Cel w="26%" ultima><J style={s.val}>{v[`${k}_escola`] || " "}</J></Cel>
            </View>
          ))}
        </View>

        <J style={s.secao}>健康状態・ CONDIÇÃO FÍSICA E SAÚDE</J>
        <View style={s.tabela}>
          <View style={s.linha}>
            {[
              ["Altura 身長", "altura"],
              ["Peso 体重", "peso"],
              ["Cintura ウエスト", "cintura"],
              ["Camisa シャツ", "camisa"],
              ["Calça ズボン", "calca"],
              ["Calçado 靴", "calcado"],
            ].map(([r, k], i) => (
              <Cel key={k} w={`${100 / 6}%`} ultima={i === 5}>
                <Campo rotulo={r} valor={v[k]} />
              </Cel>
            ))}
          </View>
          <View style={s.linha}>
            <Cel w="36%" cab><J>I T E M*</J></Cel>
            <Cel w="7%" cab><J>SIM{"\n"}はい</J></Cel>
            <Cel w="7%" cab><J>NÃO{"\n"}いいえ</J></Cel>
            <Cel w="36%" cab><J>I T E M*</J></Cel>
            <Cel w="7%" cab><J>SIM{"\n"}はい</J></Cel>
            <Cel w="7%" cab ultima><J>NÃO{"\n"}いいえ</J></Cel>
          </View>
          {SAUDE.map(([k1, r1, k2, r2], i) => (
            <View key={k1} style={[s.linha, i === SAUDE.length - 1 ? { borderBottomWidth: 0 } : {}]}>
              <Cel w="36%"><J>{r1}</J></Cel>
              {sn(`${k1}_S`)}
              {sn(`${k1}_N`)}
              <Cel w="36%"><J>{r2}</J></Cel>
              {sn(`${k2}_S`)}
              <Cel w="7%" ultima style={{ alignItems: "center" }}><J style={[s.val, { fontWeight: 700 }]}>{v[`${k2}_N`] ? "X" : " "}</J></Cel>
            </View>
          ))}
        </View>
        <View style={[s.tabela, { borderTopWidth: 0, padding: 4 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
            <J style={{ width: 120 }}>Pressão Arterial血圧</J>
            <Opcoes v={v} itens={[["cb:pressaoAlta", "Alta高い"], ["cb:pressaoNormal", "Normal 正常"], ["cb:pressaoBaixa", "Baixa低い"]]} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
            <J style={{ width: 120 }}>Habilidade Escrita利き手</J>
            <Opcoes v={v} itens={[["cb:destro", "Destro右"], ["cb:canhoto", "Canhoto左"]]} />
          </View>
          <J style={{ fontWeight: 700, marginBottom: 2 }}>VISÃO</J>
          {[
            ["Daltonismo色覚異常", "cb:daltS", "cb:daltN"],
            ["Uso óculos めがね", "cb:oculosS", "cb:oculosN"],
            ["Lente de contato コンタクトレンズ", "cb:lenteS", "cb:lenteN"],
          ].map(([r, a, b]) => (
            <View key={a} style={{ flexDirection: "row", alignItems: "center", marginBottom: 1.5 }}>
              <J style={{ width: 160 }}>{r}</J>
              <SimNao v={v} sim={a} nao={b} />
            </View>
          ))}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 1 }}>
            <Opcoes v={v} itens={[["cb:miopia", "Miopia近視"], ["cb:hipermetropia", "Hipermetropia遠視"], ["cb:grauOutros", "Outrosその他"]]} />
            <J style={{ marginLeft: 10 }}>Grau OD 右目: <J style={s.val}>{v.grauOD}</J></J>
            <J style={{ marginLeft: 10 }}>Grau OE 左目: <J style={s.val}>{v.grauOE}</J></J>
          </View>
          <J style={{ marginTop: 4 }}>Medicamento 薬 | Motivo do uso 薬服用理由 | Frequência 薬服用間隔 (informar se está usando ou usou o medicamento)</J>
          <J style={s.val}>{v.medicamentos || " "}</J>
        </View>
        <J style={s.nota}>*Caso a resposta seja SIM em algum dos itens, favor especificar o local e/ou o problema e quando ocorreu no campo Observações na página 02.</J>

        <J style={s.rodape} fixed render={({ pageNumber, totalPages }) => `Lista de Verificação — ${candidato} — página ${pageNumber}/${totalPages}`} />
      </Page>

      {/* ── Página 2 ── */}
      <Page size="A4" style={s.page}>
        <Topo />
        <J style={s.secao}>一般情報 ・ INFORMAÇÕES GERAIS</J>
        <View style={[s.tabela, { padding: 4 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
            <J style={{ width: 120 }}>Carteira de motorista 運転免許証</J>
            <Opcoes v={v} itens={[["cb:cnhBR", "Brasilブラジル"]]} />
            <J>Categoria: <J style={s.val}>{v.cnhCategoria}</J></J>
            <View style={{ marginLeft: 12 }}><Opcoes v={v} itens={[["cb:cnhJP", "Japão日本"], ["cb:cnhAT", "AT"], ["cb:cnhMT", "MT"]]} /></View>
          </View>
          {[
            ["Anda de bicicleta? 自転車に乗れますか?", "cb:bikeS", "cb:bikeN"],
            ["Consegue usar um computador (mouse, digitação)?\nコンピュータ操作が出来るか", "cb:pcS", "cb:pcN"],
          ].map(([r, a, b]) => (
            <View key={a} style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <J style={{ width: 260 }}>{r}</J>
              <SimNao v={v} sim={a} nao={b} />
            </View>
          ))}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
            <J style={{ width: 120 }}>Qualificação資格</J>
            <Opcoes v={v} itens={[["cb:empilhadeira", "Empilhadeiraフォークリフト"], ["cb:solda", "Solda溶接"], ["cb:qualOutros", "Outrosその他"]]} />
          </View>
          <J style={{ marginTop: 1, marginBottom: 1 }}>Turno シフト</J>
          {TURNOS.map(([k, r]) => (
            <View key={k} style={{ flexDirection: "row", alignItems: "center", marginBottom: 1.5 }}>
              <Opcoes v={v} itens={[[`cb:${k}P`, "Prefere"], [`cb:${k}A`, "Aceita"], [`cb:${k}N`, "Não Aceita"]]} />
              <J>— {r}</J>
            </View>
          ))}
          <View style={{ flexDirection: "row", marginTop: 3 }}>
            <View style={{ width: "50%" }}><Campo rotulo="Região de preferência 地域希望" valor={v.regiao} /></View>
            <View style={{ width: "50%" }}><Campo rotulo="Segmento de preferência 職種希望" valor={v.segmento} /></View>
          </View>
        </View>
        <View style={[s.tabela, { padding: 4, marginTop: 6 }]}>
          {[
            ["*Ex-funcionário* Aceita retornar no mesmo setor que trabalhou? (Sem garantia da colocação)\n＊元従業員の場合、以前配属部署に戻ることはできますか。", "cb:mesmoSetorS", "cb:mesmoSetorN", "Sim, aceitaはい", "Não, prefere outroいいえ"],
            ["Pode dividir apto? アパートを共有できますか", "cb:aptoS", "cb:aptoN"],
            ["Pode trabalhar de FDS? 週末に仕事できますか", "cb:fdsS", "cb:fdsN"],
            ["Pode fazer horas extras? 残業できますか?", "cb:heS", "cb:heN"],
            ["Realizou Check up médico nos últimos 6 meses? 過去6ヶ月以内に健康診断を受けましたか?", "cb:checkupS", "cb:checkupN"],
            ["Reserva financeira (¥50,000) 財政準備金", "cb:reservaS", "cb:reservaN"],
            ["Ajuda do governo? 帰国 支援", "cb:governoS", "cb:governoN"],
          ].map(([r, a, b, ra, rb]) => (
            <View key={a} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 0.4, borderBottomColor: "#ccc", paddingVertical: 2 }}>
              <J style={{ width: "68%" }}>{r}</J>
              <Opcoes v={v} itens={[[a, ra ?? "Simはい"], [b, rb ?? "Nãoいいえ"]]} />
            </View>
          ))}
          <View style={{ marginTop: 3 }}><Campo rotulo="Previsão de Embarque 来日予定" valor={v.embarque} /></View>
        </View>

        <View style={[s.tabela, { marginTop: 6 }]}>
          <View style={[s.linha, { borderBottomWidth: 0 }]}>
            <Cel w="28%"><Campo rotulo="Contato no BRASIL の連絡先名" valor={v.emergNome} /></Cel>
            <Cel w="14%"><Campo rotulo="Parentesco 関係" valor={v.emergParentesco} /></Cel>
            <Cel w="38%"><Campo rotulo="Endereço住所" valor={v.emergEndereco} /></Cel>
            <Cel w="20%" ultima><Campo rotulo="Telefone 電話番号" valor={v.emergTelefone} /></Cel>
          </View>
        </View>

        <J style={s.secao}>追加情報・ OBSERVAÇÕES</J>
        <J style={s.nota}>
          Utilize este espaço para registrar qualquer outra informação adicional sobre o candidato. Caso a resposta seja “SIM” nas questões sobre Condição Física e Saúde especifique o local e/ou o problema e quando ocorreu.
        </J>
        <View style={[s.tabela, { marginTop: 3 }]}>
          {Array.from({ length: 10 }, (_, i) => (
            <View key={i} style={[s.linha, { minHeight: 11 }, i === 9 ? { borderBottomWidth: 0 } : {}]}>
              <Cel w="100%" ultima style={{ paddingVertical: 0.5 }}><J style={[s.val, { fontSize: 7.4 }]}>{v[`obs${i}`] || " "}</J></Cel>
            </View>
          ))}
        </View>

        <J style={s.secao}>色覚異常テスト・ REFERENTE AO TESTE DE DALTONISMO</J>
        <J style={s.nota}>Favor inserir no espaço abaixo, os números que o candidato visualizou no teste de daltonismo:</J>
        <View style={[s.tabela, { marginTop: 3, flexDirection: "row" }]}>
          {["A", "B", "C", "D", "E", "F"].map((l, i) => (
            <Cel key={l} w={`${100 / 6}%`} ultima={i === 5} style={{ minHeight: 14 }}>
              <J style={s.rot}>{l}</J>
            </Cel>
          ))}
        </View>
        <J style={s.nota}>ATENÇÃO: caso o candidato não consiga identificar algum número, preencher com “X” na respectiva lacuna.</J>

        <J style={s.secao}>配偶者と子供 ・ REFERENTE AO CÔNJUGE E FILHOS</J>
        <J style={s.nota}>Favor passar as orientações abaixo para os familiares dos candidatos/funcionários que embarcam sem colocação:</J>
        <View style={[s.tabela, { marginTop: 3, padding: 4 }]}>
          <Caixa marcado={tem(v, "cb:orient1")} rotulo="O cônjuge deverá aguardar a adaptação do(s) filho(s) na escola para depois fazer consulta de vaga e iniciar no trabalho" />
          <View style={{ height: 2 }} />
          <Caixa marcado={tem(v, "cb:orient2")} rotulo="Todos os custos (passagem aérea, seguro-viagem, visto e elegibilidade) do cônjuge e filho(s) são de responsabilidade da família" />
          <J style={[s.nota, { marginLeft: 10 }]}>A ser pago no Brasil: passagem aérea, seguro-viagem, visto e elegibilidade. A ser pago no Japão: trecho doméstico e traslado, se houver.</J>
          <View style={{ height: 2 }} />
          <Caixa marcado={tem(v, "cb:orient3")} rotulo="Não é possível embarcar com financiamento" />
        </View>

        <View style={[s.tabela, { marginTop: 8 }]}>
          <View style={[s.linha, { borderBottomWidth: 0 }]}>
            <Cel w="30%"><Campo rotulo="Data de preenchimento 日付 (年/月/日)" valor={v.hoje} /></Cel>
            <Cel w="30%"><Campo rotulo="Agência エージェント名" valor={v.agencia} /></Cel>
            <Cel w="40%" ultima><Campo rotulo="Responsável pela verificação 実施担当" valor="" /></Cel>
          </View>
        </View>
        <J style={s.rodape} fixed render={({ pageNumber, totalPages }) => `Lista de Verificação — ${candidato} — página ${pageNumber}/${totalPages}`} />
      </Page>
    </Document>
  );
}
