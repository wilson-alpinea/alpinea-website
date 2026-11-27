"use client";

import type { CSSProperties, ReactNode } from "react";

// Link de WhatsApp da home da Ajisai. Clique precisa disparar a conversão
// do Google Ads explicitamente — evento genérico não conta como conversão.
export function LinkWhatsapp({
  numero = "5511930300101",
  mensagem,
  origem,
  className,
  style,
  children,
}: {
  numero?: string;
  mensagem?: string;
  origem: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const href = `https://wa.me/${numero}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      onClick={() => {
        window.gtag?.("event", "whatsapp_click", { form_name: `ajisai_home_${origem}` });
        window.gtag?.("event", "conversion", { send_to: "AW-18262525346/fruBCIiVsMMcEKKLoIRE", value: 1.0, currency: "BRL" });
      }}
    >
      {children}
    </a>
  );
}
