"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Bodoni_Moda } from "next/font/google";
import { useCart } from "./CartContext";
import { formatUSD } from "../hooks/useCambioUSD";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const WHATSAPP_NUMBER = "5511930300101";
const BRAND = "Ajisai";

// "US$ 1.500" -> 1500. Retorna null para preços não numéricos (ex: "Sob
// consulta"), para não entrarem na soma do total estimado. Os itens do
// carrinho já chegam com precoLabel em dólar (ver PrecoPacote/CustomPackageCard),
// então a soma aqui é sempre em dólar.
function parsePrecoNumero(label: string): number | null {
  const digits = label.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

function ResumoLinha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <dt className="shrink-0 text-white/40">{label}</dt>
      <dd className="text-right text-white/70">{valor}</dd>
    </div>
  );
}

function IconCart({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path d="M2.5 3h2.2l1.8 11a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6l1.4-7.4H6.1" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 7h16" />
      <path d="M9 7V4.8A.8.8 0 0 1 9.8 4h4.4a.8.8 0 0 1 .8.8V7" />
      <path d="M6 7l1 13a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7" />
    </svg>
  );
}

export function CartWidget({ triggerClassName }: { triggerClassName?: string }) {
  const { items, removeItem, clear, count } = useCart();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  const totalNumerico = items.reduce((soma, item) => {
    const n = parsePrecoNumero(item.precoLabel);
    return n ? soma + n : soma;
  }, 0);
  const temSobConsulta = items.some((item) => parsePrecoNumero(item.precoLabel) === null);
  const totalViajantes = items.reduce((soma, item) => {
    const n = item.viajantes ? parseInt(item.viajantes, 10) : NaN;
    return soma + (Number.isFinite(n) ? n : 1);
  }, 0);
  const duracoesUnicas = Array.from(
    new Set(items.map((item) => item.duracao).filter((d): d is string => Boolean(d))),
  );
  const duracaoResumo =
    duracoesUnicas.length === 1
      ? duracoesUnicas[0]
      : `${items.length} ${items.length === 1 ? "pacote" : "pacotes"}`;
  const acomodacoesUnicas = Array.from(
    new Set(items.map((item) => item.acomodacao).filter((a): a is string => Boolean(a))),
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleCheckout() {
    if (items.length === 0) return;

    const lines = [
      `Olá! Meu nome é ${nome || "(não informado)"}.`,
      email && `E-mail: ${email}`,
      "",
      "Tenho interesse nos seguintes itens do carrinho de pacotes:",
      ...items.flatMap((item, index) => [
        "",
        `${index + 1}. [${item.divisao}] ${item.nome}`,
        `Variante: ${item.variante}`,
        item.viajantes && `Viajantes: ${item.viajantes}`,
        item.acomodacao && `Acomodação: ${item.acomodacao}`,
        ...(item.itens?.map((it) => `${it.icone} ${it.texto}`) ?? []),
        `Valor: ${item.precoLabel}${item.precoSufixo ? ` ${item.precoSufixo}` : ""}`,
        ...(item.detalhes ?? []),
      ]),
    ].filter((line): line is string => Boolean(line) || line === "");

    const text = encodeURIComponent(lines.join("\n"));

    window.gtag?.("event", "whatsapp_click", { form_name: "pacotes_carrinho" });
    window.gtag?.("event", "generate_lead", {
      form_name: "pacotes_carrinho",
      contact_channel: "whatsapp",
    });
    window.gtag?.("event", "conversion", {
      send_to: "AW-18262525346/fruBCIiVsMMcEKKLoIRE",
      value: 1.0,
      currency: "BRL",
    });

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
    setEnviado(true);
    clear();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir carrinho de pacotes"
        className={
          triggerClassName ??
          "relative flex items-center gap-2 rounded-full border border-white/25 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-white/60 hover:text-white"
        }
      >
        <IconCart className="h-4 w-4 shrink-0" />
        Meu Carrinho
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#7c4fd1] text-[10px] font-semibold text-white">
            {count}
          </span>
        )}
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex justify-end bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              className="flex h-[100dvh] w-full flex-col bg-[#0a0a0a] text-white sm:max-w-md sm:border-l sm:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                <p className={`${display.className} text-lg font-medium`}>
                  Seu carrinho {count > 0 && `(${count})`}
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar carrinho"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-white/40 hover:text-white"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                {enviado ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                      WhatsApp aberto
                    </p>
                    <h3 className={`${display.className} text-2xl font-medium`}>
                      Quase lá.
                    </h3>
                    <p className="max-w-xs text-sm leading-6 text-white/55">
                      Finalize o envio da mensagem na aba do WhatsApp que
                      abrimos para você. A equipe {BRAND} responde em breve.
                    </p>
                    <button
                      onClick={() => {
                        setEnviado(false);
                        setOpen(false);
                      }}
                      className="mt-4 rounded-full border border-white/20 px-6 py-2.5 text-xs uppercase tracking-[0.25em] text-white/80 transition hover:border-white/50 hover:text-white"
                    >
                      Fechar
                    </button>
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white/30">
                      <IconCart className="h-6 w-6" />
                    </span>
                    <p className="text-sm text-white/50">
                      Seu carrinho está vazio. Escolha um pacote para começar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="space-y-2">
                        <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                          {item.imagem && (
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src={item.imagem}
                                alt={item.nome}
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[10px] uppercase tracking-[0.15em] text-white/35">
                                  {item.divisao}
                                </p>
                                <p className="mt-0.5 text-sm font-medium leading-snug text-white">
                                  {item.nome}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                aria-label={`Remover ${item.nome}`}
                                className="shrink-0 text-white/30 transition hover:text-red-400"
                              >
                                <IconTrash className="h-4 w-4" />
                              </button>
                            </div>

                            {(item.duracao || item.periodo) && (
                              <p className="mt-1.5 text-xs text-white/55">
                                {[item.duracao, item.periodo].filter(Boolean).join(" · ")}
                              </p>
                            )}

                            {(item.viajantes || item.acomodacao || item.itens?.length) && (
                              <ul className="mt-2.5 space-y-1.5">
                                {item.viajantes && (
                                  <li className="flex items-center gap-2 text-xs text-white/60">
                                    <span aria-hidden>👤</span>
                                    {item.viajantes}
                                  </li>
                                )}
                                {item.acomodacao && (
                                  <li className="flex items-center gap-2 text-xs text-white/60">
                                    <span aria-hidden>🛏️</span>
                                    {item.acomodacao}
                                  </li>
                                )}
                                {item.itens?.map((it) => (
                                  <li
                                    key={it.texto}
                                    className="flex items-center gap-2 text-xs text-white/60"
                                  >
                                    <span aria-hidden>{it.icone}</span>
                                    {it.texto}
                                  </li>
                                ))}
                              </ul>
                            )}

                            {item.detalhes?.map((linha) => (
                              <p key={linha} className="mt-1.5 text-xs text-white/45">
                                {linha}
                              </p>
                            ))}

                            <p className="mt-3 text-sm font-semibold text-white">
                              {item.precoLabel}
                              {item.precoSufixo && (
                                <span className="ml-1 text-xs font-normal text-white/50">
                                  {item.precoSufixo}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.015] p-3.5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
                            Resumo da solicitação
                          </p>
                          <dl className="mt-2 space-y-1.5">
                            <ResumoLinha label="Pacote" valor={item.nome} />
                            <ResumoLinha label="Modalidade" valor={item.divisao} />
                            {item.duracao && <ResumoLinha label="Duração" valor={item.duracao} />}
                            {item.periodo && <ResumoLinha label="Período" valor={item.periodo} />}
                            {item.viajantes && (
                              <ResumoLinha label="Viajantes" valor={item.viajantes} />
                            )}
                            {item.acomodacao && (
                              <ResumoLinha label="Acomodação" valor={item.acomodacao} />
                            )}
                          </dl>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {items.length > 0 && !enviado && (
                <div className="shrink-0 space-y-4 border-t border-white/10 px-5 py-5 sm:px-6">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Resumo</p>
                    <p className="mt-1 text-sm text-white/70">
                      {totalViajantes} {totalViajantes === 1 ? "viajante" : "viajantes"} ·{" "}
                      {duracaoResumo}
                    </p>

                    {totalNumerico > 0 ? (
                      <>
                        <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-white/40">
                          Total estimado
                        </p>
                        <p
                          className={`${display.className} mt-1 text-3xl font-medium text-white`}
                        >
                          {formatUSD(totalNumerico)}
                          {temSobConsulta && " +"}
                        </p>
                        {acomodacoesUnicas.length === 1 && (
                          <p className="mt-1 text-xs text-white/50">
                            Valor por pessoa em {acomodacoesUnicas[0].toLowerCase()}
                          </p>
                        )}
                        <p className="mt-0.5 text-xs text-white/50">
                          ou em até 12x de {formatUSD(totalNumerico / 12)} + juros
                        </p>
                        {temSobConsulta && (
                          <p className="mt-1.5 text-[11px] text-white/35">
                            + itens sob consulta, valor a combinar
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="mt-3 text-sm text-white/60">Valor sob consulta</p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-mail (opcional)"
                      className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={!nome}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2f80c9] px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#2870b0] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Finalizar no WhatsApp →
                  </button>
                  <p className="text-center text-[11px] leading-4 text-white/35">
                    Ao continuar, você será direcionado ao WhatsApp para
                    confirmação de disponibilidade e reserva.
                  </p>
                  {!nome && (
                    <p className="text-center text-[11px] text-[#6ec3d9]">
                      Informe seu nome para finalizar.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
