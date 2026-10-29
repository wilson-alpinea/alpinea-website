import { Document, Page, View } from "@react-pdf/renderer";
import { Caixa, Campo, Cel, J, Opcoes, SimNao, s, type V } from "./listaVerificacaoPdf";

// AVCORP / Avance — Curriculum Vitae (来日者 履歴書) em PDF (Wilson,
// 29/out/2026: "arquivos da Avance devem ter na opção PDF e Word"). Mesmo
// conteúdo e ordem do modelo lib/empregos/modelos/avcorp.docx, com os
// MESMOS valores (MODELOS_ORIGINAIS → avcorp). Fonte e peças da Lista de
// Verificação (listaVerificacaoPdf.tsx).

const tem = (v: V, k: string) => Boolean((v[k] ?? "").trim());

function TabelaExp({ v, pre, colunas }: { v: V; pre: "br" | "jp"; colunas: [string, string, string][] }) {
  return (
    <View style={s.tabela}>
      <View style={s.linha}>
        {colunas.map(([, r, w], i) => (
          <Cel key={r} w={w} cab ultima={i === colunas.length - 1}>
            <J>{r}</J>
          </Cel>
        ))}
      </View>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={[s.linha, i === 4 ? { borderBottomWidth: 0 } : {}]}>
          {colunas.map(([k, , w], j) => (
            <Cel key={k} w={w} ultima={j === colunas.length - 1}>
              <J style={s.val}>{v[`${pre}${i}_${k}`] || " "}</J>
            </Cel>
          ))}
        </View>
      ))}
    </View>
  );
}

const Linha = ({ children }: { children: React.ReactNode }) => <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginBottom: 2 }}>{children}</View>;
const Rot = ({ children, w }: { children: React.ReactNode; w?: number }) => <J style={{ width: w, marginRight: 6 }}>{children}</J>;

export function AvcorpPdf({ v, candidato }: { v: V; candidato: string }) {
  return (
    <Document title={`Curriculum Vitae — ${candidato}`} author="Ajisai">
      <Page size="A4" style={s.page}>
        <View style={s.topo}>
          <View>
            <J style={s.titulo}>来日者 履歴書 CURRICULUM VITAE</J>
            <J style={s.versao}>Candidatos residentes no BRASIL</J>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <J style={s.rot}>Data de preenchimento 日付 (年/月/日)</J>
            <J style={s.val}>{v.hoje}</J>
            <J style={[s.rot, { marginTop: 2 }]}>Agência エージェント名</J>
            <J style={s.val}>{v.agencia}</J>
          </View>
        </View>

        <View style={[s.tabela, { marginTop: 8 }]}>
          <View style={s.linha}>
            <Cel w="55%"><Campo rotulo="Nome completo 氏名" valor={v.nome} /></Cel>
            <Cel w="22%"><Campo rotulo="Data Nascimento" valor={v.nascimento} /></Cel>
            <Cel w="23%" ultima><Campo rotulo="Estado civil" valor={v.estadoCivil} /></Cel>
          </View>
          <View style={s.linha}>
            <Cel w="100%" ultima>
              <Linha>
                <Rot w={90}>Nacionalidade 国籍</Rot>
                <Opcoes v={v} itens={[["cb:nacJaponesa", "Japonesa 日本国籍"], ["cb:nacBrasileira", "Brasileiro ブラジル国籍"], ["cb:nacDupla", "Dupla nacionalid. 二重"], ["cb:nacOutra", "Outros その他"]]} />
              </Linha>
              <Linha>
                <Rot w={90}>Geração 世代</Rot>
                <Opcoes v={v} itens={[["cb:nissei", "Nissei 2世"], ["cb:sansei", "Sansei 3世"], ["cb:yonsei", "Yonsei 4世"], ["cb:conjugeDescendente", "Cônjuge de descendente 日系の配偶者"]]} />
              </Linha>
              <Linha>
                <Rot w={90}>Tem filhos?</Rot>
                <J style={s.val}>{v.filhos || " "}</J>
              </Linha>
            </Cel>
          </View>
          <View style={s.linha}>
            <Cel w="40%"><Campo rotulo="Endereço 現在地" valor={v.endereco} /></Cel>
            <Cel w="20%"><Campo rotulo="Bairro 地区" valor={v.bairro} /></Cel>
            <Cel w="20%"><Campo rotulo="Cidade 市" valor={v.cidade} /></Cel>
            <Cel w="8%"><Campo rotulo="Estado 県" valor={v.uf} /></Cel>
            <Cel w="12%" ultima><Campo rotulo="CEP 〒" valor={v.cep} /></Cel>
          </View>
          <View style={[s.linha, { borderBottomWidth: 0 }]}>
            <Cel w="45%"><Campo rotulo="E-mail メール" valor={v.email} /></Cel>
            <Cel w="25%"><Campo rotulo="ID Skype IDスカイプ" valor="" /></Cel>
            <Cel w="30%" ultima><Campo rotulo="Tel. 連絡先" valor={v.telefone} /></Cel>
          </View>
        </View>

        <J style={s.secao}>Escolaridade 学歴</J>
        <View style={[s.tabela, { padding: 4 }]}>
          <Opcoes
            v={v}
            itens={[
              ["cb:escFund1", "小学校 Fundamental I"],
              ["cb:escFund2", "中学校 Fundamental II"],
              ["cb:escMedio", "高校 Médio"],
              ["cb:escSuperior", "大学等 Superior"],
              ["cb:escIncompleto", "Incompleto 中退"],
              ["cb:escCompleto", "Completo 卒業"],
            ]}
          />
          <View style={{ marginTop: 3 }}><Campo rotulo="Curso técnico e/ou Superior 学科/専門" valor={v.curso} /></View>
        </View>

        <J style={s.secao}>Experiências Profissionais no Brasil ブラジルでの職歴</J>
        <TabelaExp v={v} pre="br" colunas={[["empresa", "Nome da Empresa 企業名", "22%"], ["funcao", "Serviço 担当業務", "20%"], ["local", "Local 勤務地", "16%"], ["inicio", "Início 入社日", "11%"], ["saida", "Saída 退職日", "11%"], ["motivo", "Motivo da Saída 退社理由", "20%"]]} />

        <J style={s.secao}>Experiências Profissionais no Japão 日本での職歴</J>
        <TabelaExp v={v} pre="jp" colunas={[["empresa", "Fábrica/Empreiteira 派遣会社", "22%"], ["funcao", "Serviço 担当業務", "17%"], ["local", "Local 勤務地", "14%"], ["inicio", "Início 入社日", "10%"], ["saida", "Saída 退職日", "10%"], ["motivo", "Motivo da Saída 退社理由", "17%"], ["shakai", "Shakai 社会保険", "10%"]]} />

        <J style={s.secao}>Japonês 日本語</J>
        <View style={[s.tabela, { padding: 4 }]}>
          <Linha>
            <Rot w={140}>Possui JLPT? JLPTをお持ちですか</Rot>
            <Caixa marcado={tem(v, "cb:jlptSim")} rotulo="Simはい" />
            <J>Nível レベル: <J style={s.val}>{v.jlptNivel}</J></J>
            <View style={{ marginLeft: 8 }}><Caixa marcado={tem(v, "cb:jlptNao")} rotulo="Nãoいいえ" /></View>
          </Linha>
          <Linha>
            <Rot w={140}>Conversação 会話</Rot>
            <Opcoes v={v} itens={[["cb:convNada", "Nada全く"], ["cb:convCumprimentos", "Cumprimentos挨拶"], ["cb:convBasico", "Básico基本的会話"], ["cb:convIntermediario", "Intermediário日常会話"], ["cb:convFluente", "Fluente流暢"]]} />
          </Linha>
          {[
            ["Hiragana ひらがな", "Hira"],
            ["Katakana カタカナ", "Kata"],
            ["Kanji 漢字", "Kanji"],
          ].map(([r, k]) => (
            <Linha key={k}>
              <Rot w={140}>{r}</Rot>
              <J style={{ marginRight: 4 }}>Leitura 読み</J>
              <Opcoes v={v} itens={[[`cb:le${k}S`, "Sはい"], [`cb:le${k}N`, "Nいいえ"]]} />
              <J style={{ marginLeft: 10, marginRight: 4 }}>Escrita 書き</J>
              <Opcoes v={v} itens={[[`cb:esc${k}S`, "Sはい"], [`cb:esc${k}N`, "Nいいえ"]]} />
            </Linha>
          ))}
        </View>

        <View style={[s.tabela, { padding: 4, marginTop: 6 }]}>
          <Linha>
            <Rot w={190}>Já foi ao Japão? 日本へ行ったことはありますか</Rot>
            <SimNao v={v} sim="cb:japaoSim" nao="cb:japaoNao" />
            <J>Quantas vezes? 何回 <J style={s.val}>{v.vezesJapao}</J></J>
          </Linha>
          <Linha>
            <Rot w={190}>Quanto tempo pretende ficar no Japão? 日本にはどれくらい滞在する予定ですか</Rot>
            <J style={s.val}>{v.tempoJapao}</J>
          </Linha>
          <Linha>
            <Rot w={190}>Ex-funcionário da Avance? アバンセコーポレーション元社員?</Rot>
            <SimNao v={v} sim="cb:exAvanceSim" nao="cb:exAvanceNao" />
            <J>Fábrica 工場: <J style={s.val}>{v.exAvanceFabrica}</J></J>
          </Linha>
          <Linha>
            <Rot w={190}>Qual objetivo no Japão? 日本で働く目的は?</Rot>
            <J style={[s.val, { flex: 1 }]}>{v.objetivo}</J>
          </Linha>
        </View>
        <J style={s.rodape} fixed render={({ pageNumber, totalPages }) => `Curriculum Vitae — ${candidato} — página ${pageNumber}/${totalPages}`} />
      </Page>

      <Page size="A4" style={s.page}>
        <View style={s.topo}>
          <J style={s.titulo}>来日者 履歴書 CURRICULUM VITAE</J>
        </View>
        <J style={s.secao}>VISTO ビザ査証</J>
        <View style={[s.tabela, { padding: 4 }]}>
          <Linha>
            <Opcoes v={v} itens={[["cb:vistoPermanente", "Permanente 永住許可"], ["cb:vistoSolicitar", "Solicitar 申請必要"]]} />
          </Linha>
          <Linha>
            <Caixa marcado={tem(v, "cb:vistoNovo")} rotulo="Visto Novo 新規ビザ" />
            <J>Prazo de entrada 入国期限: <J style={s.val}>{v.vistoNovoData}</J></J>
          </Linha>
          <Linha>
            <Caixa marcado={tem(v, "cb:vistoZairyu")} rotulo="Zairyu CARD 在留カード" />
            <J>Validade 有効期限: <J style={s.val}>{v.zairyuValidade}</J></J>
          </Linha>
          <Linha>
            <Caixa marcado={tem(v, "cb:vistoProtocolado")} rotulo="Visto protocolado ビザ申請済み" />
            <J>Previsão de sair o visto ビザ発給予定: <J style={s.val}>{v.protocoladoPrevisao}</J></J>
          </Linha>
          <Linha>
            <Rot w={140}>RE-ENTRY 再入国許可</Rot>
            <SimNao v={v} sim="cb:reEntrySim" nao="cb:reEntryNao" />
            <J>Validade 有効期限: <J style={s.val}>{v.reEntryValidade}</J></J>
          </Linha>
          <Linha>
            <Rot w={140}>Possui Certificado de Elegibilidade? 在留資格認定証明書</Rot>
            <SimNao v={v} sim="cb:ceSim" nao="cb:ceNao" />
            <J>Emissão 発行日: <J style={s.val}>{v.ceEmissao}</J>   Validade 有効期限: <J style={s.val}>{v.ceValidade}</J></J>
          </Linha>
          <Linha>
            <Rot w={140}>Possui parentes no Japão? 日本に親戚</Rot>
            <SimNao v={v} sim="cb:parentesSim" nao="cb:parentesNao" />
          </Linha>
          <Linha>
            <Rot w={140}>Possui Koseki Tohon? 戸籍謄本</Rot>
            <Opcoes v={v} itens={[["cb:kosekiAtual", "Atual 有効"], ["cb:kosekiAntigo", "Antigo 失効"], ["cb:kosekiNao", "Nãoいいえ"]]} />
          </Linha>
        </View>

        <J style={s.secao}>Referência de parentes no Japão 緊急連絡先</J>
        <View style={s.tabela}>
          <View style={[s.linha, { borderBottomWidth: 0 }]}>
            <Cel w="28%"><Campo rotulo="Nome 氏名" valor={v.refNome} /></Cel>
            <Cel w="38%"><Campo rotulo="Endereço 現在地" valor={v.refEndereco} /></Cel>
            <Cel w="18%"><Campo rotulo="Tel. 連絡先" valor={v.refTel} /></Cel>
            <Cel w="16%" ultima><Campo rotulo="Parentesco 関係" valor={v.refParentesco} /></Cel>
          </View>
        </View>

        <J style={s.secao}>OBS 備考</J>
        <View style={[s.tabela, { padding: 4, minHeight: 60 }]}>
          <J style={s.val}>{v.obs || " "}</J>
        </View>

        <View style={[s.tabela, { marginTop: 8 }]}>
          <View style={s.linha}>
            <Cel w="33%"><Campo rotulo="RG" valor={v.rg} /></Cel>
            <Cel w="33%"><Campo rotulo="CPF" valor={v.cpf} /></Cel>
            <Cel w="34%" ultima><Campo rotulo="Passaporte" valor={v.passaporte} /></Cel>
          </View>
          <View style={[s.linha, { borderBottomWidth: 0 }]}>
            <Cel w="33%"><Campo rotulo="Data do embarque" valor={v.embarque} /></Cel>
            <Cel w="67%" ultima style={{ minHeight: 34 }}><J style={s.rot}>Assinatura do Candidato（署名）</J></Cel>
          </View>
        </View>
        <J style={s.rodape} fixed render={({ pageNumber, totalPages }) => `Curriculum Vitae — ${candidato} — página ${pageNumber}/${totalPages}`} />
      </Page>
    </Document>
  );
}
