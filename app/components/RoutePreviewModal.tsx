"use client";

import Image from "next/image";

// Modal de preview (mapas e roteiros especiais). Continua aberto via CSS :target
// (links âncora tipo href="#preview-x" em qualquer lugar da página funcionam sem JS),
// mas o fechamento usa history.back() para não perder a posição de scroll —
// href="#" sozinho faz o navegador pular pro topo da página, o que estava
// acontecendo antes.
function closePreview(e: React.MouseEvent) {
  e.preventDefault();
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.hash = "";
  }
}

export function RoutePreviewModal({
  id,
  eyebrow,
  title,
  description,
  image,
  alt,
  displayClassName,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  displayClassName: string;
}) {
  return (
    <div
      id={id}
      className="route-preview-modal fixed inset-0 z-[100] hidden items-center justify-center bg-black/92 px-4 py-8 backdrop-blur-xl target:flex"
      aria-modal="true"
      role="dialog"
    >
      <a
        href="#"
        onClick={closePreview}
        className="absolute inset-0"
        aria-label="Fechar preview"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_0_120px_rgba(20,62,135,0.22)]">
        {/* Botão de fechar — fixo no canto, sempre visível e com bom contraste,
            independente do tamanho do título/descrição ao lado */}
        <button
          type="button"
          onClick={closePreview}
          aria-label="Fechar preview"
          className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl leading-none text-black shadow-lg transition hover:bg-white/90 md:right-4 md:top-4"
        >
          ×
        </button>

        <div className="flex items-start justify-between gap-6 border-b border-white/10 px-5 py-5 pr-16 md:px-8 md:pr-20">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-white/35">
              {eyebrow}
            </p>
            <h3
              className={`${displayClassName} text-2xl font-medium text-white md:text-3xl`}
            >
              {title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/50">
              {description}
            </p>
          </div>
        </div>

        <div className="overflow-auto bg-black p-4 md:p-6">
          <a
            href={image}
            target="_blank"
            rel="noopener noreferrer"
            className="group mx-auto block max-w-5xl cursor-zoom-in"
            aria-label="Abrir imagem em tamanho completo"
          >
            <Image
              src={image}
              alt={alt}
              width={1600}
              height={2200}
              className="mx-auto h-auto w-full rounded-xl border border-white/10 object-contain transition duration-300 group-hover:opacity-90"
            />
          </a>
        </div>
      </div>
    </div>
  );
}
