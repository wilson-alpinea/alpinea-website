"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Carrossel horizontal com seta "ver mais" e bolinhas indicativas — usado apenas no mobile
// (md:hidden), já que no desktop o conteúdo continua em grid e mostra tudo de uma vez.
// Mesmo padrão visual/comportamental do /landingpage2.
//
// Passar `desktopScroll` mantém o comportamento de carrossel (scroll lateral) também no
// desktop, em vez de virar grid mostrando tudo de uma vez — usado quando há muitos itens
// (ex.: avaliações) e queremos mostrar só alguns por vez com scroll horizontal.
export function CarouselScroller({
  children,
  itemCount,
  desktopColumns = 5,
  desktopScroll = false,
}: {
  children: ReactNode;
  itemCount: number;
  desktopColumns?: 2 | 3 | 4 | 5;
  desktopScroll?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Classes estáticas (Tailwind precisa ver a string literal completa pra gerar o CSS,
  // então não dá pra interpolar `md:grid-cols-${n}` diretamente).
  const gridColsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
  }[desktopColumns];

  const desktopContainerClass = desktopScroll
    ? "md:flex md:gap-4 md:overflow-x-auto md:px-0 md:pb-0"
    : `md:grid ${gridColsClass} md:gap-4 md:overflow-visible md:px-0 md:pb-0`;

  // Setas e bolinhas normalmente só aparecem no mobile (no desktop o grid mostra tudo).
  // Com desktopScroll, também fazem sentido no desktop, já que nem tudo está visível.
  const controlsVisibility = desktopScroll ? "" : "md:hidden";

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const items = Array.from(el.children) as HTMLElement[];
      let closest = 0;
      let minDist = Infinity;
      items.forEach((child, i) => {
        const dist = Math.abs(child.offsetLeft - el.scrollLeft);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setActive(closest);

      // Margem de 8px pra absorver arredondamento de subpixel do scroll.
      setCanScrollLeft(el.scrollLeft > 8);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollNext = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.85, behavior: "smooth" });
  };

  const scrollPrev = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: -el.clientWidth * 0.85, behavior: "smooth" });
  };

  const goTo = (i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
  };

  return (
    <div className="-mx-6 sm:-mx-10 md:mx-0">
      <div className="relative">
        <div
          ref={scrollRef}
          className={`flex transform-gpu items-stretch gap-3 overflow-x-auto px-6 pb-2 snap-x snap-mandatory scroll-pl-6 [&::-webkit-scrollbar]:hidden sm:px-10 ${desktopContainerClass}`}
        >
          {children}
        </div>

        {/* Fades laterais + setas — centralizadas verticalmente, pra funcionar tanto em
            carrosséis de imagem pura quanto em cards com texto de altura variável. Só mobile,
            a menos que desktopScroll esteja ativo. */}
        {canScrollLeft && (
          <>
            <div
              className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent ${controlsVisibility}`}
            />
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Ver anterior"
              className={`absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition active:bg-white/30 ${controlsVisibility}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </>
        )}

        {canScrollRight && (
          <>
            <div
              className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent ${controlsVisibility}`}
            />
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Ver mais"
              className={`absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition active:bg-white/30 ${controlsVisibility}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Bolinhas indicativas — só mobile, a menos que desktopScroll esteja ativo */}
      <div
        className={`mt-4 flex items-center justify-center gap-2 px-6 sm:px-10 ${controlsVisibility}`}
      >
        {Array.from({ length: itemCount }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir para item ${i + 1}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active
                ? "w-6 bg-gradient-to-r from-[#E94332] via-[#D96A2E] to-[#C9A03A]"
                : "w-1.5 bg-white/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
