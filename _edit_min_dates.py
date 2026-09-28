# ---- app/calculadora_reversa/page.tsx ----
path = "app/calculadora_reversa/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    s = f.read()

helper = '''
/** Data de hoje em "AAAA-MM-DD" (hora local do navegador, não UTC) — usada
 * como `min` dos campos de data pra impedir selecionar dia no passado.
 * Pedido do Wilson, 28/set/2026: "mesma regra para todos" os calendários
 * do site (mesmo padrão já usado em app/produtos/page.tsx). */
function hojeISO(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export default function CalculadoraReversaPage() {'''
old_marker = "\nexport default function CalculadoraReversaPage() {"
assert s.count(old_marker) == 1
s = s.replace(old_marker, helper)

# Campo 1: "Data estimada da viagem" (painel principal)
old1 = '''                <input
                  type="date"
                  value={dataViagemEstimada}
                  onChange={(e) => setDataViagemEstimada(e.target.value)}
                  className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm outline-none focus:border-black/30"
                />'''
new1 = '''                <input
                  type="date"
                  value={dataViagemEstimada}
                  min={hojeISO()}
                  onChange={(e) => setDataViagemEstimada(e.target.value)}
                  className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm outline-none focus:border-black/30"
                />'''
assert s.count(old1) == 1
s = s.replace(old1, new1)

# Campo 2: "Data estimada da viagem" (mini campo dentro do card PIX)
old2 = '''                        <input
                          type="date"
                          value={dataViagemEstimada}
                          onChange={(e) => setDataViagemEstimada(e.target.value)}
                          className="h-8 rounded-md border border-black/15 bg-black/[0.03] px-2 text-[11px] outline-none focus:border-black/30"
                        />'''
new2 = '''                        <input
                          type="date"
                          value={dataViagemEstimada}
                          min={hojeISO()}
                          onChange={(e) => setDataViagemEstimada(e.target.value)}
                          className="h-8 rounded-md border border-black/15 bg-black/[0.03] px-2 text-[11px] outline-none focus:border-black/30"
                        />'''
assert s.count(old2) == 1
s = s.replace(old2, new2)

# Campo 3: "Validade da proposta"
old3 = '''                    <input
                      type="date"
                      value={validadeProposta}
                      onChange={(e) => setValidadeProposta(e.target.value)}
                      className="h-10 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30"
                    />'''
new3 = '''                    <input
                      type="date"
                      value={validadeProposta}
                      min={hojeISO()}
                      onChange={(e) => setValidadeProposta(e.target.value)}
                      className="h-10 w-full rounded-lg border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30"
                    />'''
assert s.count(old3) == 1
s = s.replace(old3, new3)

with open(path, "w", encoding="utf-8") as f:
    f.write(s)
print("OK calculadora_reversa: 4 edits (helper + 3 inputs)")

# ---- app/viagem_personalizada_selfservice/page.tsx ----
path2 = "app/viagem_personalizada_selfservice/page.tsx"
with open(path2, "r", encoding="utf-8") as f:
    s2 = f.read()

helper2 = '''
/** Data de hoje em "AAAA-MM-DD" (hora local do navegador, não UTC) — usada
 * como `min` do campo de data pra impedir selecionar dia no passado.
 * Pedido do Wilson, 28/set/2026: "mesma regra para todos" os calendários
 * do site (mesmo padrão já usado em app/produtos/page.tsx). */
function hojeISO(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export default function ViagemPersonalizadaSelfServicePage() {'''
old_marker2 = "\nexport default function ViagemPersonalizadaSelfServicePage() {"
assert s2.count(old_marker2) == 1
s2 = s2.replace(old_marker2, helper2)

old4 = '''              <input
                type="date"
                value={dataViagem}
                onChange={(e) => {
                  setDataViagem(e.target.value);'''
new4 = '''              <input
                type="date"
                value={dataViagem}
                min={hojeISO()}
                onChange={(e) => {
                  setDataViagem(e.target.value);'''
assert s2.count(old4) == 1
s2 = s2.replace(old4, new4)

with open(path2, "w", encoding="utf-8") as f:
    f.write(s2)
print("OK viagem_personalizada_selfservice: 2 edits (helper + 1 input)")
