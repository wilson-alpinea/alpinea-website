def once(c, old, new, label):
    n = c.count(old)
    assert n == 1, f"{label}: expected 1 match, got {n}"
    return c.replace(old, new, 1)

path = "app/components/CustomPackageCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# 1) FotoCarousel: accept a `light` prop so it can render on a white card too
old_carousel = '''function FotoCarousel({ fotos, categoria }: { fotos: string[]; categoria: string }) {
  const trilhoRef = useRef<HTMLDivElement>(null);

  function mover(direcao: -1 | 1) {
    const el = trilhoRef.current;
    if (!el) return;
    el.scrollBy({ left: direcao * (el.clientWidth * 0.85), behavior: "smooth" });
  }

  const slots = fotos.length > 0 ? fotos : Array.from({ length: 5 });

  return (
    <div className="group/carousel relative">
      <div
        ref={trilhoRef}
        className="flex gap-2.5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {slots.map((foto, i) =>
          typeof foto === "string" ? (
            <div
              key={foto}
              className="relative aspect-[4/3] w-[220px] shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-black"
            >
              <Image src={foto} alt={`${categoria} — exemplo ${i + 1}`} fill sizes="220px" className="object-cover" />
            </div>
          ) : (
            <div
              key={i}
              className="flex aspect-[4/3] w-[220px] shrink-0 snap-start flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-center"
            >
              <span className="text-xl opacity-40">📷</span>
              <span className="px-4 text-[10px] uppercase tracking-[0.1em] text-white/30">
                Foto em breve — {categoria}
              </span>
            </div>
          ),
        )}
      </div>
      <button
        type="button"
        onClick={() => mover(-1)}
        aria-label="Fotos anteriores"
        className="absolute left-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/70 opacity-0 backdrop-blur transition hover:text-white group-hover/carousel:opacity-100"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => mover(1)}
        aria-label="Proximas fotos"
        className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/70 opacity-0 backdrop-blur transition hover:text-white group-hover/carousel:opacity-100"
      >
        ›
      </button>
    </div>
  );
}'''

new_carousel = '''function FotoCarousel({
  fotos,
  categoria,
  light = false,
}: {
  fotos: string[];
  categoria: string;
  // light = true quando o carrossel roda num card claro (popup avulso de
  // Hoteis em /produtos), fora do tema escuro do resto da Viagem
  // Personalizada.
  light?: boolean;
}) {
  const trilhoRef = useRef<HTMLDivElement>(null);

  function mover(direcao: -1 | 1) {
    const el = trilhoRef.current;
    if (!el) return;
    el.scrollBy({ left: direcao * (el.clientWidth * 0.85), behavior: "smooth" });
  }

  const slots = fotos.length > 0 ? fotos : Array.from({ length: 5 });

  return (
    <div className="group/carousel relative">
      <div
        ref={trilhoRef}
        className="flex gap-2.5 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {slots.map((foto, i) =>
          typeof foto === "string" ? (
            <div
              key={foto}
              className={`relative aspect-[4/3] w-[220px] shrink-0 snap-start overflow-hidden rounded-xl border bg-black ${
                light ? "border-black/10" : "border-white/10"
              }`}
            >
              <Image src={foto} alt={`${categoria} — exemplo ${i + 1}`} fill sizes="220px" className="object-cover" />
            </div>
          ) : (
            <div
              key={i}
              className={`flex aspect-[4/3] w-[220px] shrink-0 snap-start flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-center ${
                light ? "border-black/15 bg-black/[0.03]" : "border-white/15 bg-white/[0.03]"
              }`}
            >
              <span className="text-xl opacity-40">📷</span>
              <span
                className={`px-4 text-[10px] uppercase tracking-[0.1em] ${light ? "text-black/30" : "text-white/30"}`}
              >
                Foto em breve — {categoria}
              </span>
            </div>
          ),
        )}
      </div>
      <button
        type="button"
        onClick={() => mover(-1)}
        aria-label="Fotos anteriores"
        className="absolute left-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/70 opacity-0 backdrop-blur transition hover:text-white group-hover/carousel:opacity-100"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => mover(1)}
        aria-label="Proximas fotos"
        className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/70 opacity-0 backdrop-blur transition hover:text-white group-hover/carousel:opacity-100"
      >
        ›
      </button>
    </div>
  );
}

// Linhas "Exemplos de Propriedades" por categoria de hotel (3 a Elite),
// com o carrossel de fotos — usado tanto no popup "Ver detalhes" dentro da
// Viagem Personalizada (tema escuro) quanto no popup avulso do card
// "Hoteis" em /produtos (tema claro, light=true), sem duplicar o conteudo.
export function HotelExemplosPropriedades({
  categoriaAtiva,
  light = false,
}: {
  categoriaAtiva?: (typeof CATEGORIAS_HOTEL)[number];
  light?: boolean;
}) {
  const t = light
    ? {
        text: "text-black",
        label: "text-black/40",
        sub: "text-black/55",
        info: "text-black/70",
        infoLabel: "text-black/40",
        border: "border-black/10",
        bg: "bg-black/[0.02]",
        offBorder: "border-black/10",
        offText: "text-black/30",
      }
    : {
        text: "text-white",
        label: "text-white/40",
        sub: "text-white/55",
        info: "text-white/70",
        infoLabel: "text-white/40",
        border: "border-white/10",
        bg: "bg-white/[0.02]",
        offBorder: "border-white/10",
        offText: "text-white/30",
      };

  return (
    <div>
      <p className={`text-[11px] uppercase tracking-[0.2em] ${t.label}`}>Exemplos de Propriedades</p>
      <div className="mt-3 space-y-4">
        {CATEGORIAS_HOTEL.map((cat) => {
          const info = EXEMPLOS_HOTEIS[cat];
          const ativo = cat === categoriaAtiva;
          const amenidadeLabel: [keyof typeof info.amenidades, string][] = [
            ["piscina", "Piscina"],
            ["academia", "Academia"],
            ["sauna", "Sauna"],
            ["restaurante", "Restaurante"],
          ];
          return (
            <div
              key={cat}
              className={`rounded-2xl border p-4 md:p-5 ${
                ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.06]" : `${t.border} ${t.bg}`
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="md:w-[240px] md:shrink-0">
                  <p className={`text-base font-semibold uppercase tracking-[0.08em] ${t.text}`}>
                    {cat}
                    {ativo && (
                      <span className="ml-2 rounded-full bg-[#2f80c9]/20 px-2 py-0.5 text-[9px] font-medium normal-case tracking-normal text-[#6ec3d9]">
                        selecionado
                      </span>
                    )}
                  </p>
                  <p className={`mt-1.5 text-xs ${t.sub}`}>{info.exemplos.join(" · ")}</p>
                  <p className={`mt-3 text-xs ${t.info}`}>
                    <span className={t.infoLabel}>m² médio:</span> {info.m2Medio}
                  </p>
                  <p className={`mt-1 text-xs ${t.info}`}>
                    <span className={t.infoLabel}>Quarto:</span> {info.tipoQuarto}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {amenidadeLabel.map(([key, label]) => (
                      <span
                        key={key}
                        className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.05em] ${
                          info.amenidades[key]
                            ? "border-[#6ec3d9]/40 bg-[#6ec3d9]/[0.08] text-[#6ec3d9]"
                            : `${t.offBorder} ${t.offText} line-through`
                        }`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <FotoCarousel fotos={info.fotos} categoria={cat} light={light} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}'''

c = once(c, old_carousel, new_carousel, "FotoCarousel + HotelExemplosPropriedades extraction")

# 2) export EXEMPLOS_HOTEIS (was a private const)
c = once(
    c,
    "const EXEMPLOS_HOTEIS: Record<",
    "export const EXEMPLOS_HOTEIS: Record<",
    "export EXEMPLOS_HOTEIS",
)

# 3) replace the inline hotel block inside the popup with the new shared component
old_block = '''            {opcaoAberta.key === "hotel" && (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                  Exemplos de Propriedades
                </p>
                <div className="mt-3 space-y-4">
                  {CATEGORIAS_HOTEL.map((cat) => {
                    const info = EXEMPLOS_HOTEIS[cat];
                    const ativo = cat === categoriaHotel;
                    const amenidadeLabel: [keyof typeof info.amenidades, string][] = [
                      ["piscina", "Piscina"],
                      ["academia", "Academia"],
                      ["sauna", "Sauna"],
                      ["restaurante", "Restaurante"],
                    ];
                    return (
                      <div
                        key={cat}
                        className={`rounded-2xl border p-4 md:p-5 ${
                          ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.06]" : "border-white/10 bg-white/[0.02]"
                        }`}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start">
                          <div className="md:w-[240px] md:shrink-0">
                            <p className="text-base font-semibold uppercase tracking-[0.08em] text-white">
                              {cat}
                              {ativo && (
                                <span className="ml-2 rounded-full bg-[#2f80c9]/20 px-2 py-0.5 text-[9px] font-medium normal-case tracking-normal text-[#6ec3d9]">
                                  selecionado
                                </span>
                              )}
                            </p>
                            <p className="mt-1.5 text-xs text-white/55">{info.exemplos.join(" · ")}</p>
                            <p className="mt-3 text-xs text-white/70">
                              <span className="text-white/40">m² médio:</span> {info.m2Medio}
                            </p>
                            <p className="mt-1 text-xs text-white/70">
                              <span className="text-white/40">Quarto:</span> {info.tipoQuarto}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {amenidadeLabel.map(([key, label]) => (
                                <span
                                  key={key}
                                  className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.05em] ${
                                    info.amenidades[key]
                                      ? "border-[#6ec3d9]/40 bg-[#6ec3d9]/[0.08] text-[#6ec3d9]"
                                      : "border-white/10 text-white/30 line-through"
                                  }`}
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <FotoCarousel fotos={info.fotos} categoria={cat} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}'''

new_block = '''            {opcaoAberta.key === "hotel" && (
              <div className="mt-4">
                <HotelExemplosPropriedades categoriaAtiva={categoriaHotel} />
              </div>
            )}'''

c = once(c, old_block, new_block, "hotel block -> shared component")

with open(path, "w", encoding="utf-8") as f:
    f.write(c)

print("DONE")
