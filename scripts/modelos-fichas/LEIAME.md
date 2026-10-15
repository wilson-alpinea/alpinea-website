# Modelos das fichas das empreiteiras

Os arquivos em `lib/empregos/modelos/` são os ORIGINAIS enviados pelo Wilson
(os .xls convertidos para .xlsx no LibreOffice) com marcas `{{chave}}` nos
campos e, no Word, a tag `cb:chave` nas caixas de seleção. Em produção,
`lib/empregos/preencherModelo.ts` só troca as marcas pelos valores de
`lib/empregos/valoresModelos.ts`.

Para refazer um modelo (ex.: a empreiteira mandou uma versão nova):

    pip install python-docx openpyxl pillow
    python3 avcorp.py  "FICHA AVCORP rainichisha v20240429.docx" ../../lib/empregos/modelos/avcorp.docx
    python3 lista.py   "LISTA DE VERIFICACAO exclusivo agência v20240429.docx" ../../lib/empregos/modelos/lista-verificacao.docx
    soffice --headless --convert-to xlsx "FUJIARTE Ficha Cadastral Jun2024.xls"
    python3 fujiarte.py "FUJIARTE Ficha Cadastral Jun2024.xlsx" ../../lib/empregos/modelos/fujiarte.xlsx
    soffice --headless --convert-to xlsx "Ficha de Cadastro Digital UT SURIEMU.xls"
    python3 suriemu.py "Ficha de Cadastro Digital UT SURIEMU.xlsx" ../../lib/empregos/modelos/suriemu.xlsx

Cada script lista as células/caixas e a chave de cada uma — se o layout mudar,
ajuste as coordenadas no script e as chaves em valoresModelos.ts.
