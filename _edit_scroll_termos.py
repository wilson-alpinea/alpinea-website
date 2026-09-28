import re

path = "app/produtos/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    s = f.read()

# 1) Motorista Privado — novo estado termosRolados, logo depois do termosAceitos dele
old1 = """  // padrão de tickbox obrigatório já usado no JR Pass (termosAceitos).
  const [termosAceitos, setTermosAceitos] = useState(false);

  const cambioCotacao = cambio?.cotacao ?? 5.3;"""
new1 = """  // padrão de tickbox obrigatório já usado no JR Pass (termosAceitos).
  const [termosAceitos, setTermosAceitos] = useState(false);
  // Só libera o tickbox depois que o cliente rolar os termos até o fim —
  // pedido do Wilson, 28/set/2026: "só pode clicar em li e aceito ao dar
  // scroll em todo documento".
  const [termosRolados, setTermosRolados] = useState(false);

  const cambioCotacao = cambio?.cotacao ?? 5.3;"""
assert s.count(old1) == 1
s = s.replace(old1, new1)

# 2) JR Pass — novo estado termosRolados, logo depois do termosAceitos dele
old2 = """  // aceite do jr pASS".
  const [termosAceitos, setTermosAceitos] = useState(false);
  // Número de pessoas"""
new2 = """  // aceite do jr pASS".
  const [termosAceitos, setTermosAceitos] = useState(false);
  // Só libera o tickbox depois que o cliente rolar os termos até o fim —
  // pedido do Wilson, 28/set/2026: "só pode clicar em li e aceito ao dar
  // scroll em todo documento".
  const [termosRolados, setTermosRolados] = useState(false);
  // Número de pessoas"""
assert s.count(old2) == 1
s = s.replace(old2, new2)

# 3) Motorista Privado — onScroll na caixa de termos + disabled no checkbox + dica
old3 = """                <div className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/60">
                  <p className="font-medium text-black/80">Fornecimento do serviço</p>"""
new3 = """                <div
                  className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/60"
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
                      setTermosRolados(true);
                    }
                  }}
                >
                  <p className="font-medium text-black/80">Fornecimento do serviço</p>"""
assert s.count(old3) == 1
s = s.replace(old3, new3)

old4 = """                <label className="mt-3 flex items-start gap-2.5 text-[11px] leading-5 text-black/60">
                  <input
                    type="checkbox"
                    checked={termosAceitos}
                    onChange={(e) => setTermosAceitos(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/25 text-[#2f80c9] focus:ring-[#2f80c9]"
                  />
                  Li e aceito os termos e condições de contratação do motorista privado acima.
                </label>
              </div>"""
new4 = """                <label className="mt-3 flex items-start gap-2.5 text-[11px] leading-5 text-black/60">
                  <input
                    type="checkbox"
                    checked={termosAceitos}
                    disabled={!termosRolados}
                    onChange={(e) => setTermosAceitos(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/25 text-[#2f80c9] focus:ring-[#2f80c9] disabled:cursor-not-allowed disabled:opacity-40"
                  />
                  Li e aceito os termos e condições de contratação do motorista privado acima.
                </label>
                {!termosRolados && (
                  <p className="mt-1.5 pl-[26px] text-[10px] text-black/35">
                    Role o texto acima até o fim para habilitar o aceite.
                  </p>
                )}
              </div>"""
assert s.count(old4) == 1
s = s.replace(old4, new4)

# 5) JR Pass — onScroll na caixa de termos + disabled no checkbox + dica
old5 = """            <div className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/60">
              <p className="font-medium text-black/80">Emissão e elegibilidade</p>"""
new5 = """            <div
              className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/60"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
                  setTermosRolados(true);
                }
              }}
            >
              <p className="font-medium text-black/80">Emissão e elegibilidade</p>"""
assert s.count(old5) == 1
s = s.replace(old5, new5)

old6 = """            <label className="mt-3 flex items-start gap-2.5 text-[11px] leading-5 text-black/60">
              <input
                type="checkbox"
                checked={termosAceitos}
                onChange={(e) => setTermosAceitos(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/25 text-[#2f80c9] focus:ring-[#2f80c9]"
              />
              Li e aceito os termos e condições de emissão, cancelamento, reembolso e uso do JR
              Pass acima.
            </label>
          </div>"""
new6 = """            <label className="mt-3 flex items-start gap-2.5 text-[11px] leading-5 text-black/60">
              <input
                type="checkbox"
                checked={termosAceitos}
                disabled={!termosRolados}
                onChange={(e) => setTermosAceitos(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/25 text-[#2f80c9] focus:ring-[#2f80c9] disabled:cursor-not-allowed disabled:opacity-40"
              />
              Li e aceito os termos e condições de emissão, cancelamento, reembolso e uso do JR
              Pass acima.
            </label>
            {!termosRolados && (
              <p className="mt-1.5 pl-[26px] text-[10px] text-black/35">
                Role o texto acima até o fim para habilitar o aceite.
              </p>
            )}
          </div>"""
assert s.count(old6) == 1
s = s.replace(old6, new6)

with open(path, "w", encoding="utf-8") as f:
    f.write(s)

print("OK all six edits applied")
