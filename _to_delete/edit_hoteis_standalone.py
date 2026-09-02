def once(c, old, new, label):
    n = c.count(old)
    assert n == 1, f"{label}: expected 1 match, got {n}"
    return c.replace(old, new, 1)

path = "app/produtos/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# 1) import HotelExemplosPropriedades
c = once(
    c,
    'import { CambioLabel } from "../components/CambioLabel";\n',
    'import { CambioLabel } from "../components/CambioLabel";\n'
    'import { HotelExemplosPropriedades } from "../components/CustomPackageCard";\n',
    "import HotelExemplosPropriedades",
)

# 2) state: drop viagemModalFoco, add hoteisModalOpen
c = once(
    c,
    '  const [transporteModalOpen, setTransporteModalOpen] = useState(false);\n'
    '  // Quando aberto a partir do card "Hoteis", a Viagem Personalizada abre\n'
    '  // ja focada no popup de detalhes do Hotel (categorias/exemplos).\n'
    '  const [viagemModalFoco, setViagemModalFoco] = useState<"hotel" | null>(null);\n',
    '  const [transporteModalOpen, setTransporteModalOpen] = useState(false);\n'
    '  // Hoteis abre um popup avulso e leve com os exemplos de propriedade por\n'
    '  // categoria — nao carrega a Viagem Personalizada (iframe) atras dele.\n'
    '  const [hoteisModalOpen, setHoteisModalOpen] = useState(false);\n',
    "state: viagemModalFoco -> hoteisModalOpen",
)

# 3) escape-key / overflow-lock effect: add hoteisModalOpen
c = once(
    c,
    '      !servicosModalOpen &&\n'
    '      !transporteModalOpen\n'
    '    )\n'
    '      return;',
    '      !servicosModalOpen &&\n'
    '      !transporteModalOpen &&\n'
    '      !hoteisModalOpen\n'
    '    )\n'
    '      return;',
    "effect condition",
)

c = once(
    c,
    '        setServicosModalOpen(false);\n'
    '        setTransporteModalOpen(false);\n'
    '      }\n'
    '    };',
    '        setServicosModalOpen(false);\n'
    '        setTransporteModalOpen(false);\n'
    '        setHoteisModalOpen(false);\n'
    '      }\n'
    '    };',
    "handleKeyDown setter",
)

c = once(
    c,
    '    servicosModalOpen,\n'
    '    transporteModalOpen,\n'
    '  ]);',
    '    servicosModalOpen,\n'
    '    transporteModalOpen,\n'
    '    hoteisModalOpen,\n'
    '  ]);',
    "effect deps array",
)

# 4) Viagem Personalizada card: revert onClick (no more foco reset)
c = once(
    c,
    '              <ProductSelectorCard\n'
    '                href="/viagem-personalizada"\n'
    '                onClick={() => {\n'
    '                  setViagemModalFoco(null);\n'
    '                  setViagemModalOpen(true);\n'
    '                }}\n'
    '                icon="/images/produtos/viagem-personalizada-icone-v2.png"',
    '              <ProductSelectorCard\n'
    '                href="/viagem-personalizada"\n'
    '                onClick={() => setViagemModalOpen(true)}\n'
    '                icon="/images/produtos/viagem-personalizada-icone-v2.png"',
    "viagem card onClick revert",
)

# 5) Hoteis card: open the new standalone modal instead of the iframe one
c = once(
    c,
    '              <ProductSelectorCard\n'
    '                href="/viagem-personalizada?abrir=hotel"\n'
    '                onClick={() => {\n'
    '                  setViagemModalFoco("hotel");\n'
    '                  setViagemModalOpen(true);\n'
    '                }}\n'
    '                icon="/images/produtos/hoteis.png"',
    '              <ProductSelectorCard\n'
    '                href="/viagem-personalizada?abrir=hotel"\n'
    '                onClick={() => setHoteisModalOpen(true)}\n'
    '                icon="/images/produtos/hoteis.png"',
    "hoteis card onClick",
)

# 6) iframe: static src again
c = once(
    c,
    '            <iframe\n'
    '              src={`/viagem-personalizada${viagemModalFoco ? `?abrir=${viagemModalFoco}` : ""}`}\n'
    '              title="Configurador completo de Viagem Personalizada"\n'
    '              className="h-full w-full border-0 pt-14"\n'
    '            />',
    '            <iframe\n'
    '              src="/viagem-personalizada"\n'
    '              title="Configurador completo de Viagem Personalizada"\n'
    '              className="h-full w-full border-0 pt-14"\n'
    '            />',
    "iframe static src",
)

# 7) new standalone Hoteis modal, right after the TransportePrivadoCalculator modal
c = once(
    c,
    '      {transporteModalOpen && (\n'
    '        <TransportePrivadoCalculator onClose={() => setTransporteModalOpen(false)} />\n'
    '      )}\n',
    '      {transporteModalOpen && (\n'
    '        <TransportePrivadoCalculator onClose={() => setTransporteModalOpen(false)} />\n'
    '      )}\n'
    '\n'
    '      {hoteisModalOpen && (\n'
    '        <div\n'
    '          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/85 p-0 backdrop-blur-sm md:items-center md:p-6"\n'
    '          role="dialog"\n'
    '          aria-modal="true"\n'
    '          aria-labelledby="hoteis-modal-title"\n'
    '          onClick={() => setHoteisModalOpen(false)}\n'
    '        >\n'
    '          <div\n'
    '            className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-3xl border border-black/10 bg-white shadow-2xl md:max-h-[88vh] md:rounded-3xl"\n'
    '            onClick={(event) => event.stopPropagation()}\n'
    '          >\n'
    '            <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-black/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">\n'
    '              <p\n'
    '                id="hoteis-modal-title"\n'
    '                className={`${display.className} text-lg font-medium text-black md:text-xl`}\n'
    '              >\n'
    '                Hotéis\n'
    '              </p>\n'
    '              <button\n'
    '                type="button"\n'
    '                onClick={() => setHoteisModalOpen(false)}\n'
    '                aria-label="Fechar Hotéis"\n'
    '                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/15 text-2xl leading-none text-black/65 transition hover:border-black/40 hover:text-black"\n'
    '              >\n'
    '                ×\n'
    '              </button>\n'
    '            </div>\n'
    '            <div className="p-5 md:p-8">\n'
    '              <p className="max-w-2xl text-sm leading-relaxed text-black/60">\n'
    '                Curadoria e reserva de hotéis escolhidos pelo perfil e pela logística da sua\n'
    '                viagem — veja exemplos de propriedades por categoria.\n'
    '              </p>\n'
    '              <div className="mt-6">\n'
    '                <HotelExemplosPropriedades light />\n'
    '              </div>\n'
    '            </div>\n'
    '          </div>\n'
    '        </div>\n'
    '      )}\n',
    "hoteisModalOpen render block",
)

with open(path, "w", encoding="utf-8") as f:
    f.write(c)

print("DONE")
