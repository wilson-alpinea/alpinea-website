"use client";

import dynamic from "next/dynamic";

// O formulário lê o rascunho salvo no navegador logo ao abrir — por isso
// ele só renderiza no cliente (evita diferença entre HTML do servidor e
// do navegador).
const FichaForm = dynamic(() => import("./FichaForm"), {
  ssr: false,
  loading: () => <div className="mt-8 h-96 animate-pulse rounded-3xl bg-white" />,
});

export default FichaForm;
