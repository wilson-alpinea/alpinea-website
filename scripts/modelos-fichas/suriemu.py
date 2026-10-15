from marcar_xlsx import MarcadorXlsx
import sys, openpyxl
aba = openpyxl.load_workbook(sys.argv[1]).sheetnames[0]
m = MarcadorXlsx(sys.argv[1], aba)
def t(c, k): m.t(c, k, True)   # campos pontilhados "......" viram token
t('G1', 'nome'); t('G2', 'nascDia'); t('J2', 'nascMes'); t('M2', 'nascAno'); t('R2', 'idade')
t('G3', 'cidadeNascimento'); t('G4', 'rg'); t('N4', 'cpf'); t('G5', 'endereco'); t('G6', 'complemento')
t('G7', 'bairro'); t('R7', 'cep'); t('G8', 'cidade'); t('R8', 'uf')
t('H9', 'fixoDDD'); t('J9', 'fixoNumero'); t('H10', 'celDDD'); t('J10', 'celNumero'); t('G11', 'email')
t('G12', 'solteiro'); t('L12', 'casado'); t('P12', 'separado')
t('G13', 'filhosNao'); t('J13', 'filhosSim'); t('Q13', 'qtdFilhos')
t('E14', 'altura'); t('K14', 'peso'); t('R14', 'sapato')
t('F15', 'tamP'); t('H15', 'tamM'); t('J15', 'tamG'); t('L15', 'tamGG'); t('S15', 'calca')
t('G16', 'issei'); t('L16', 'nissei'); t('P16', 'sansei'); t('G17', 'dupla'); t('L17', 'conjugeDescendente')
t('F18', 'passaporte'); t('O18', 'passaporteVenc'); t('F19', 'vistoVenc'); t('O19', 'reEntry')
t('G20', 'cnhBR'); t('L20', 'cnhJP'); t('H21', 'cnhNumero'); t('L21', 'cnhValida'); t('Q21', 'cnhVencida')
t('G22', 'escFund'); t('G23', 'fundCompleto'); t('K23', 'fundIncompleto'); t('R23', 'fundSerie')
t('G24', 'escMedio'); t('G25', 'medioCompleto'); t('K25', 'medioIncompleto'); t('S25', 'medioAno')
t('G26', 'escSuperior'); t('G27', 'supCompleto'); t('K27', 'supIncompleto'); t('Q27', 'supSemestre'); t('O28', 'cursando')
for b, k in [(30, 'conv'), (33, 'comp')]:
    t(f'G{b}', f'{k}MuitoPouco'); t(f'L{b}', f'{k}Pouco'); t(f'Q{b}', f'{k}Fluente'); t(f'G{b+1}', f'{k}Basico'); t(f'L{b+1}', f'{k}Intermediario')
t('K36', 'leKata'); t('R36', 'leHira'); t('K37', 'leKanji'); t('K39', 'escKata'); t('R39', 'escHira'); t('K40', 'escKanji')
for r, k in [(42, 'pai'), (43, 'mae'), (44, 'conjuge')] + [(45 + i, f'filho{i}') for i in range(5)] + [(50 + i, f'irmao{i}') for i in range(5)]:
    t(f'G{r}', f'{k}Nome'); t(f'O{r}', f'{k}Idade'); t(f'Q{r}', f'{k}Ocupacao')
t('B56', 'parentesNao'); t('D56', 'parentesSim'); t('L56', 'parentesUnidade'); t('D57', 'parentesNome')
t('B61', 'anuncios'); t('I61', 'anunciosQual'); t('B62', 'indicacao'); t('D63', 'indicacaoNome')
t('A66', 'refJapao'); t('L68', 'hojeDia'); t('O68', 'hojeMes'); t('R68', 'hojeAno')
# Experiência: Brasil (2), última no Japão + 2 anteriores
for n, b in enumerate([2, 5]):
    t(f'AC{b}', f'br{n}Empresa'); t(f'AC{b+1}', f'br{n}Servico'); t(f'AC{b+2}', f'br{n}Periodo')
for n, b in enumerate([19, 9, 14]):
    t(f'AC{b}', f'jp{n}Empresa'); t(f'AC{b+1}', f'jp{n}Servico'); t(f'AC{b+2}', f'jp{n}Periodo')
    t(f'AB{b+3}', f'jp{n}Salario'); t(f'AG{b+3}', f'jp{n}Local'); t(f'AB{b+4}', f'jp{n}Motivo')
for r, k in [(24, 'shakai'), (25, 'seguroDesemp'), (26, 'regiao'), (28, 'divida'), (29, 'policia'), (32, 'bike'), (33, 'idiomas'),
             (35, 'tatuagem'), (37, 'cores'), (43, 'alergia'), (45, 'doenca'), (47, 'acidente'), (49, 'deficiencia'), (51, 'medicamento'),
             (53, 'vista'), (57, 'tendinite'), (59, 'diabetes'), (61, 'coluna'), (63, 'fumante'), (65, 'horasExtras'), (66, 'yakin'),
             (67, 'revezamento'), (68, 'governo')]:
    t(f'AJ{r}', f'{k}Nao'); t(f'AL{r}', f'{k}Sim')
t('AA27', 'regiaoQual'); t('W31', 'tempoJapao'); t('Y34', 'idiomasQual'); t('AG34', 'idiomasNivel')
t('Z36', 'tatuagemQuantas'); t('AD36', 'tatuagemLocal'); t('W41', 'fimDeSemana')
t('AF42', 'destro'); t('AJ42', 'canhoto')
t('Z44', 'alergiaQual'); t('Y46', 'doencaQual'); t('Z48', 'acidenteQual'); t('Y50', 'deficienciaQual'); t('Y52', 'medicamentoQual')
t('Y54', 'vistaQual'); t('W56', 'pressaoNormal'); t('AA56', 'pressaoBaixa'); t('AE56', 'pressaoAlta')
t('AA58', 'tendiniteQual'); t('W60', 'diabetesQual'); t('AA62', 'colunaQual')
print(len(m.salvar(sys.argv[2])), 'marcas')
