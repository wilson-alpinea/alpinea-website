def add_helper(s, after_marker, helper_comment):
    marker = "function hasText(v: string) {"
    assert s.count(marker) == 1
    helper = f'''{helper_comment}
function hojeISO(): string {{
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${{ano}}-${{mes}}-${{dia}}`;
}}

{marker}'''
    return s.replace(marker, helper, 1)

comment = '''/** Data de hoje em "AAAA-MM-DD" (hora local do navegador, não UTC) — usada
 * como `min` dos campos de data pra impedir selecionar dia no passado.
 * Pedido do Wilson, 28/set/2026: "mesma regra para todos" os calendários
 * do site (mesmo padrão já usado em app/produtos/page.tsx). */'''

# ---- app/briefing/page.tsx ----
path = "app/briefing/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    s = f.read()
s = add_helper(s, None, comment)

old = '''            <DateInput
              value={data.dataInicio}
              onChange={(v) => {
                set("dataInicio", v);
                if (data.dataFim && v && data.dataFim < v) {
                  set("dataFim", v);
                } else if (!data.dataFim && v) {
                  set("dataFim", v);
                }
              }}
              onFocus={() => setActiveField("dataInicio")}
              onBlur={() => setActiveField(null)}
            />'''
new = '''            <DateInput
              value={data.dataInicio}
              min={hojeISO()}
              onChange={(v) => {
                set("dataInicio", v);
                if (data.dataFim && v && data.dataFim < v) {
                  set("dataFim", v);
                } else if (!data.dataFim && v) {
                  set("dataFim", v);
                }
              }}
              onFocus={() => setActiveField("dataInicio")}
              onBlur={() => setActiveField(null)}
            />'''
assert s.count(old) == 1
s = s.replace(old, new)

old2 = '''            <DateInput
              value={data.dataFim}
              onChange={(v) => set("dataFim", v)}
              onFocus={() => setActiveField("dataFim")}
              onBlur={() => setActiveField(null)}
              min={data.dataInicio || undefined}
            />'''
new2 = '''            <DateInput
              value={data.dataFim}
              onChange={(v) => set("dataFim", v)}
              onFocus={() => setActiveField("dataFim")}
              onBlur={() => setActiveField(null)}
              min={data.dataInicio || hojeISO()}
            />'''
assert s.count(old2) == 1
s = s.replace(old2, new2)
with open(path, "w", encoding="utf-8") as f:
    f.write(s)
print("OK briefing/page.tsx")

# ---- app/components/BriefingForm.tsx ----
path = "app/components/BriefingForm.tsx"
with open(path, "r", encoding="utf-8") as f:
    s = f.read()
s = add_helper(s, None, comment)

old = '''            <DateInput
              value={data.dataInicio}
              onChange={(v) => {
                set("dataInicio", v);
                if (data.dataFim && v && data.dataFim < v) {
                  set("dataFim", "");
                }
              }}
              onFocus={() => setActiveField("dataInicio")}
              onBlur={() => setActiveField(null)}
            />'''
new = '''            <DateInput
              value={data.dataInicio}
              min={hojeISO()}
              onChange={(v) => {
                set("dataInicio", v);
                if (data.dataFim && v && data.dataFim < v) {
                  set("dataFim", "");
                }
              }}
              onFocus={() => setActiveField("dataInicio")}
              onBlur={() => setActiveField(null)}
            />'''
assert s.count(old) == 1
s = s.replace(old, new)

old2 = '''            <DateInput
              value={data.dataFim}
              onChange={(v) => set("dataFim", v)}
              onFocus={() => setActiveField("dataFim")}
              onBlur={() => setActiveField(null)}
              min={data.dataInicio || undefined}
            />'''
new2 = '''            <DateInput
              value={data.dataFim}
              onChange={(v) => set("dataFim", v)}
              onFocus={() => setActiveField("dataFim")}
              onBlur={() => setActiveField(null)}
              min={data.dataInicio || hojeISO()}
            />'''
assert s.count(old2) == 1
s = s.replace(old2, new2)
with open(path, "w", encoding="utf-8") as f:
    f.write(s)
print("OK components/BriefingForm.tsx")

# ---- app/components/CustomPackageCard.tsx ----
path = "app/components/CustomPackageCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    s = f.read()

old = '''              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm text-[#0A2540] outline-none [color-scheme:light] focus:border-black/30"
              />'''
new = '''              <input
                type="date"
                value={data}
                min={hojeISO()}
                onChange={(e) => setData(e.target.value)}
                className="h-10 w-full rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm text-[#0A2540] outline-none [color-scheme:light] focus:border-black/30"
              />'''
assert s.count(old) == 1
s = s.replace(old, new)

# helper: inserir antes do primeiro "export default function" ou "export function" do arquivo
import re
m = re.search(r"\n(export default function |export function )", s)
assert m, "no export function marker found in CustomPackageCard.tsx"
insert_at = m.start() + 1
s = s[:insert_at] + comment + '''
function hojeISO(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

''' + s[insert_at:]
with open(path, "w", encoding="utf-8") as f:
    f.write(s)
print("OK components/CustomPackageCard.tsx")

# ---- app/components/HotelQuoteCalculator.tsx ----
path = "app/components/HotelQuoteCalculator.tsx"
with open(path, "r", encoding="utf-8") as f:
    s = f.read()

old = '''              <input
                type="date"
                value={dataCheckin}
                onChange={(e) => setDataCheckin(e.target.value)}
                className="h-10 rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm text-black outline-none focus:border-[#2f80c9]/60"
              />'''
new = '''              <input
                type="date"
                value={dataCheckin}
                min={hojeISO()}
                onChange={(e) => setDataCheckin(e.target.value)}
                className="h-10 rounded-lg border border-black/15 bg-black/[0.03] px-3 text-sm text-black outline-none focus:border-[#2f80c9]/60"
              />'''
assert s.count(old) == 1
s = s.replace(old, new)

m = re.search(r"\n(export default function |export function )", s)
assert m, "no export function marker found in HotelQuoteCalculator.tsx"
insert_at = m.start() + 1
s = s[:insert_at] + comment + '''
function hojeISO(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

''' + s[insert_at:]
with open(path, "w", encoding="utf-8") as f:
    f.write(s)
print("OK components/HotelQuoteCalculator.tsx")
