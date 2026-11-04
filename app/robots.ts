import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { unidadeDoHost } from "@/lib/crm/unidades";
import { PREFIXOS_PRIVADOS } from "@/lib/privacidade";

// robots.txt (Wilson, 04/nov/2026: roteiros, CRM e sistemas internos não
// podem ser indexados por buscadores nem por IA — só via link).
// - Domínios dos CRMs (crm., empregos., seguro., documentos., cambio.):
//   tudo bloqueado.
// - alpinea.io: bloqueia as áreas internas de lib/privacidade.ts. Os
//   endereços dos roteiros individuais NÃO são listados aqui (o robots.txt
//   é público e revelaria os links privados); eles são protegidos pelo
//   noindex/noai e pelo 404 para robôs no proxy.ts.
// (Antes era app/robots.txt com código TypeScript dentro — o Next servia o
// arquivo como texto, e nenhuma regra valia.)

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host");
  if (unidadeDoHost(host)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...PREFIXOS_PRIVADOS],
    },
    sitemap: "https://www.alpinea.io/sitemap.xml",
  };
}
