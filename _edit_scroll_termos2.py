path = "app/produtos/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    s = f.read()

# 1) Motorista Privado — ref + useEffect de fallback (caixa sem overflow já libera)
old1 = """  const [termosRolados, setTermosRolados] = useState(false);

  const cambioCotacao = cambio?.cotacao ?? 5.3;"""
new1 = """  const [termosRolados, setTermosRolados] = useState(false);
  const termosBoxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = termosBoxRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 4) {
      setTermosRolados(true);
    }
  }, []);

  const cambioCotacao = cambio?.cotacao ?? 5.3;"""
assert s.count(old1) == 1
s = s.replace(old1, new1)

old2 = """  const [termosRolados, setTermosRolados] = useState(false);
  // Número de pessoas"""
new2 = """  const [termosRolados, setTermosRolados] = useState(false);
  const termosBoxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = termosBoxRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 4) {
      setTermosRolados(true);
    }
  }, []);
  // Número de pessoas"""
assert s.count(old2) == 1
s = s.replace(old2, new2)

old3 = """                <div
                  className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/60"
                  onScroll={(e) => {"""
new3 = """                <div
                  ref={termosBoxRef}
                  className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/60"
                  onScroll={(e) => {"""
assert s.count(old3) == 1
s = s.replace(old3, new3)

old4 = """            <div
              className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/60"
              onScroll={(e) => {"""
new4 = """            <div
              ref={termosBoxRef}
              className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] p-4 text-[11px] leading-5 text-black/60"
              onScroll={(e) => {"""
assert s.count(old4) == 1
s = s.replace(old4, new4)

with open(path, "w", encoding="utf-8") as f:
    f.write(s)

print("OK four edits applied")
