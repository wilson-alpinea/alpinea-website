import type { NextConfig } from "next";

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
  outputFileTracingIncludes: {
    "/crm/empregos/[id]/ficha-original": ["./lib/empregos/modelos/**", "./lib/empregos/fontes/**"],
  },
};

export default nextConfig;
