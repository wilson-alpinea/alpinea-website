from marcar_docx import Marcador
import sys
m = Marcador(sys.argv[1])
T = 1
m.texto(0, 0, 1, 'hoje'); m.texto(0, 0, 4, 'agencia')
m.texto(T, 1, 5, 'nome')
m.depois(T, 1, 26, 'Data Nascimento:', 'nascimento')
m.depois(T, 2, 26, 'Estado civil:', 'estadoCivil')
for i, k in [(0, 'nacJaponesa'), (1, 'nacBrasileira'), (5, 'nacDupla'), (6, 'nacOutra'),
             (2, 'nissei'), (3, 'sansei'), (4, 'yonsei'), (7, 'conjugeDescendente'),
             (8, 'escFund1'), (9, 'escMedio'), (11, 'escFund2'), (12, 'escSuperior'), (10, 'escIncompleto'), (13, 'escCompleto'),
             (14, 'jlptSim'), (24, 'jlptNao'),
             (15, 'convNada'), (16, 'convCumprimentos'), (17, 'convBasico'), (25, 'convIntermediario'), (26, 'convFluente'),
             (18, 'leHiraS'), (19, 'leHiraN'), (20, 'leKataS'), (21, 'leKataN'), (22, 'leKanjiS'), (23, 'leKanjiN'),
             (27, 'escHiraS'), (28, 'escHiraN'), (29, 'escKataS'), (30, 'escKataN'), (31, 'escKanjiS'), (32, 'escKanjiN'),
             (33, 'japaoSim'), (34, 'japaoNao'), (35, 'exAvanceSim'), (36, 'exAvanceNao'),
             (37, 'vistoPermanente'), (38, 'vistoSolicitar'), (39, 'reEntrySim'), (40, 'reEntryNao'),
             (41, 'vistoNovo'), (42, 'vistoZairyu'), (43, 'vistoProtocolado'),
             (44, 'ceSim'), (45, 'ceNao'), (46, 'parentesSim'), (47, 'parentesNao'),
             (48, 'kosekiAtual'), (49, 'kosekiAntigo'), (50, 'kosekiNao')]:
    m.caixa(i, k)
m.texto(T, 4, 34, 'filhos')
m.texto(T, 5, 0, 'endereco')
m.texto(T, 6, 0, 'bairro'); m.texto(T, 6, 13, 'cidade')
m.texto(T, 6, 25, 'uf'); m.texto(T, 6, 30, 'cep')
m.texto(T, 7, 0, 'email'); m.texto(T, 7, 25, 'telefone')
m.texto(T, 9, 25, 'curso')
for n, r in enumerate(range(13, 18)):
    for c, k in [(0, 'empresa'), (7, 'funcao'), (17, 'local'), (22, 'inicio'), (26, 'saida'), (31, 'motivo')]:
        m.texto(T, r, c, f'br{n}_{k}')
for n, r in enumerate(range(20, 25)):
    for c, k in [(0, 'empresa'), (7, 'funcao'), (15, 'local'), (21, 'inicio'), (24, 'saida'), (28, 'motivo'), (33, 'shakai')]:
        m.texto(T, r, c, f'jp{n}_{k}')
m.depois(T, 27, 0, 'レベル', 'jlptNivel')
m.texto(T, 30, 12, 'vezesJapao')
m.texto(T, 30, 18, 'tempoJapao')
m.depois(T, 32, 0, '工場:', 'exAvanceFabrica')
m.texto(T, 32, 18, 'objetivo')
m.depois(T, 35, 0, '入国期限:', 'vistoNovoData')
m.depois(T, 36, 0, '有効期限:', 'zairyuValidade')
m.depois(T, 37, 0, 'ビザ発給予定:', 'protocoladoPrevisao')
m.depois(T, 37, 26, '有効期限:', 'reEntryValidade')
m.depois(T, 39, 0, '発行日:', 'ceEmissao'); m.depois(T, 39, 8, '有効期限:', 'ceValidade')
m.texto(T, 43, 0, 'refNome'); m.texto(T, 43, 16, 'refEndereco'); m.texto(T, 43, 27, 'refTel'); m.texto(T, 43, 32, 'refParentesco')
m.texto(T, 45, 2, 'obs')
m.texto(T, 46, 1, 'rg'); m.texto(T, 46, 11, 'passaporte')
m.texto(T, 47, 1, 'cpf'); m.texto(T, 47, 14, 'embarque')
print(len(m.salvar(sys.argv[2])), 'marcas')
