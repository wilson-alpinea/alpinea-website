def once(c, old, new, label):
    n = c.count(old)
    assert n == 1, f"{label}: expected 1 match, got {n}"
    return c.replace(old, new, 1)

path = "app/components/CustomPackageCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

old = '''        <label className="flex flex-col gap-1.5">
          <span className={`text-[10px] uppercase tracking-[0.15em] ${t.label}`}>Cidade</span>
          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value as (typeof CIDADES_HOTEL_EXEMPLO)[number])}
            className={`h-9 min-w-[170px] rounded-lg border px-3 text-xs outline-none focus:border-[#6ec3d9] ${t.selectBorder} ${t.selectBg} ${t.text}`}
          >'''

new = '''        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#2f80c9]">
            Cidade
          </span>
          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value as (typeof CIDADES_HOTEL_EXEMPLO)[number])}
            className={`h-12 min-w-[220px] rounded-xl border-2 border-[#2f80c9] bg-[#2f80c9]/10 px-4 text-sm font-semibold outline-none transition hover:bg-[#2f80c9]/[0.18] focus:border-[#6ec3d9] focus:bg-[#2f80c9]/[0.18] ${t.text}`}
          >'''

c = once(c, old, new, "cidade selector: mais destaque")

with open(path, "w", encoding="utf-8") as f:
    f.write(c)

print("DONE")
