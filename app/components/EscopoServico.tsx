"use client";

// Escopo do serviço — "o que está e o que NÃO está sendo contratado" +
// vídeo explicativo opcional. Pedido do Wilson, 06/out/2026, para o Guia
// Turístico ("na etapa 1 deixar claro o que está sendo contratado e escopo
// de funções [...] deixar claro o que não está contratando [...] precisa
// adicionar um vídeo explicativo") e o Transporte Privado ("igual guia
// turístico, tem que deixar claro o que faz parte e o que não faz parte").

import { IconeCheck } from "./transporte/compartilhado";

export type VideoExplicativo = { tipo: "mp4"; src: string; poster?: string } | { tipo: "youtube"; id: string };

function IconeX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function EscopoServico({
  titulo,
  incluido,
  naoIncluido,
  diferenciais,
  video,
  tituloVideo,
}: {
  titulo: string;
  incluido: string[];
  naoIncluido: string[];
  diferenciais?: string[];
  video?: VideoExplicativo | null;
  tituloVideo?: string;
}) {
  return (
    <section aria-label={titulo} className="mt-6 rounded-2xl border border-black/10 p-4 sm:p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0A2540]">{titulo}</p>

      {video && (
        <div className="mt-3 overflow-hidden rounded-xl bg-black">
          {video.tipo === "mp4" ? (
            <video controls playsInline preload="metadata" poster={video.poster} className="aspect-video h-auto w-full">
              <source src={video.src} type="video/mp4" />
            </video>
          ) : (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0`}
              title={tituloVideo ?? "Vídeo explicativo"}
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video h-auto w-full"
            />
          )}
        </div>
      )}

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-emerald-800">O que está incluído</p>
          <ul className="mt-2 space-y-1.5">
            {incluido.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm leading-5 text-black/75">
                <IconeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-red-800">O que NÃO está incluído</p>
          <ul className="mt-2 space-y-1.5">
            {naoIncluido.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm leading-5 text-black/75">
                <IconeX className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {diferenciais && diferenciais.length > 0 && (
        <div className="mt-5 border-t border-black/[0.08] pt-4">
          <p className="text-sm font-semibold text-[#0A2540]">Diferenciais</p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {diferenciais.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm leading-5 text-black/70">
                <IconeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#2f80c9]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
