from marcar_docx import Marcador
import sys
m = Marcador(sys.argv[1])
m.texto(0, 1, 0, 'nome'); m.texto(0, 1, 7, 'nascimento'); m.texto(0, 1, 9, 'idade')
m.texto(0, 3, 1, 'qtdFilhos')
m.depois(0, 2, 2, 'Nãoいいえ', 'levarDetalhe')
for r, k in [(5, 'pai'), (6, 'mae'), (7, 'conjuge'), (8, 'filho0'), (9, 'filho1'), (10, 'filho2')]:
    for c, s in [(0, 'nome'), (4, 'mora'), (6, 'nasc'), (8, 'escola')]:
        m.texto(0, r, c, f'{k}_{s}')
for c, k in [(2, 'altura'), (8, 'peso'), (13, 'cintura'), (17, 'camisa'), (24, 'calca'), (30, 'calcado')]:
    m.texto(1, 0, c, k)
itens = ['fumante', 'tatuagem', 'piercing', 'alergia', 'asma', 'auditiva', 'diabetes', 'cardiaco', 'bemPsico', 'tratPsico',
         'doencaGrave', 'coluna', 'emPe', 'fratura', 'acidente', 'pino', 'cirurgia', 'movimento', 'maos', 'barba']
for i, k in enumerate(itens):
    r = 2 + i % 10
    cs, cn = (12, 14) if i < 10 else (29, 31)
    m.texto(1, r, cs, f'{k}_S'); m.texto(1, r, cn, f'{k}_N')
for i, k in enumerate(['sexoM', 'sexoF', 'levarSim', 'levarNao', 'filhosSim', 'filhosNao', 'pressaoAlta', 'pressaoNormal', 'pressaoBaixa',
                       'destro', 'canhoto', 'daltS', 'daltN', 'oculosS', 'oculosN', 'lenteS', 'lenteN', 'miopia', 'hipermetropia', 'grauOutros',
                       'cnhBR', 'cnhJP', 'cnhAT', 'cnhMT', 'bikeS', 'bikeN', 'empilhadeira', 'solda', 'qualOutros',
                       'diuP', 'diuA', 'diuN', 'notP', 'notA', 'notN', 'semP', 'semA', 'semN', 'mesP', 'mesA', 'mesN',
                       'pcS', 'pcN', 'mesmoSetorS', 'mesmoSetorN', 'aptoS', 'aptoN', 'fdsS', 'fdsN', 'heS', 'heN',
                       'checkupS', 'checkupN', 'reservaS', 'reservaN', 'governoS', 'governoN', 'orient1', 'orient2', 'orient3']):
    m.caixa(i, k)
m.depois(1, 14, 1, 'Grau OD', 'grauOD'); m.depois(1, 14, 9, 'Grau OE', 'grauOE')
m.texto(1, 14, 15, 'medicamentos', par=-1)
m.depois(1, 16, 0, 'Categoria:', 'cnhCategoria')
m.texto(1, 19, 11, 'regiao', par=-1); m.texto(1, 19, 23, 'segmento', par=-1)
m.texto(1, 23, 18, 'embarque')
m.texto(1, 24, 7, 'emergNome'); m.texto(1, 24, 25, 'emergParentesco')
m.texto(1, 25, 3, 'emergEndereco'); m.texto(1, 25, 26, 'emergTelefone')
for i in range(10):
    m.texto(1, 28, 0, f'obs{i}', par=2 + i)  # uma linha por item, logo abaixo da instrução
m.texto(4, 0, 2, 'hoje'); m.texto(4, 1, 1, 'agencia')
print(len(m.salvar(sys.argv[2])), 'marcas')
