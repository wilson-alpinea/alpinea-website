"use client";

import { useEffect, useRef } from "react";

// Em alguns navegadores, <video autoPlay muted> declarado só via atributos
// JSX não é suficiente — o autoplay é bloqueado se a propriedade `muted`
// não for explicitamente setada via JS antes do play(). Por isso forçamos
// isso aqui com useEffect, em vez de confiar só nos atributos do elemento.
export function HeroVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Autoplay bloqueado pelo navegador — sem som, então sem grande
        // impacto visual; o poster permanece visível nesse caso.
      });
    }
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster={poster}
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
