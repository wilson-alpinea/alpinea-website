"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Carrossel horizontal com seta "ver mais" e bolinhas indicativas — usado apenas no mobile
// (md:hidden), já que no desktop o conteúdo continua em grid e mostra tudo de uma vez.
// Mesmo padrão visual/comportamental do /landingpage2.
export function CarouselScroller({
  children,
  itemCount,
}: {
  children: ReactNode;
  itemCount: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

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
    };

    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollNext = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.85, behavior: "smooth" });
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
          className="flex gap-3 overflow-x-auto px-6 pb-2 snap-x snap-mandatory scroll-pl-6 [&::-webkit-scrollbar]:hidden sm:px-10 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0 md:pb-0"
        >
          {children}
        </div>

        {/* Fade lateral + seta "ver mais" — centralizados na altura da fileira, só mobile */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent md:hidden" />
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Ver mais"
          className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition active:bg-white/30 md:hidden"
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
      </div>

      {/* Bolinhas indicativas — só mobile */}
      <div className="mt-4 flex items-center justify-center gap-2 px-6 sm:px-10 md:hidden">
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
