import type { NextConfig } from "next";
import { X_ROBOTS_PRIVADO } from "./lib/privacidade";

const nextConfig: NextConfig = {
  images: {
    // valores de quality usados pelo <Image quality={...}> nas imagens de
    // roteiro ilustrado (CaravanaDetailModal) — o padrão do Next.js só
    // libera 75 a menos que a gente declare explicitamente aqui.
    qualities: [75, 90, 95],
  },
  // Modelos Word/Excel das fichas das empreiteiras, lidos do disco pela rota
  // que preenche o arquivo original (Wilson, 15/out/2026).
  // Upload do logo do parceiro pela server action de Acessos (até 2 MB).
  experimental: {
    serverActions: { bodySizeLimit: "3mb" },
  },
  // APIs ficam fora do proxy.ts: o X-Robots-Tag de "privado" vem daqui
  // (lib/privacidade.ts — Wilson, 04/nov/2026). As páginas privadas recebem
  // o cabeçalho pelo proxy.ts.
  async headers() {
    return [{ source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: X_ROBOTS_PRIVADO }] }];
  },
  outputFileTracingIncludes: {
    "/crm/empregos/[id]/ficha-original": ["./lib/empregos/modelos/**", "./lib/empregos/fontes/**"],
  },
};

export default nextConfig;
