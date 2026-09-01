import Image from "next/image";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";
import { DIFERENCIAIS_AEREO } from "../lib/diferenciaisAereo";

// Rede de companhias aéreas parceiras — pedido do Wilson, 01/set/2026.
// Selos com o código IATA (sem logotipo oficial ainda — ver nota na seção).
const COMPANHIAS_HOMOLOGADAS = [
  { nome: "Emirates", codigo: "EK" },
  { nome: "Qatar Airways", codigo: "QR" },
  { nome: "Air France", codigo: "AF" },
  { nome: "KLM", codigo: "KL" },
];
const COMPANHIAS_SAZONAIS = [
  { nome: "Lufthansa", codigo: "LH" },
  { nome: "Swiss", codigo: "LX" },
  { nome: "Ethiopian", codigo: "ET" },
];

// Mesma fonte de destaque usada nas demais páginas do site.
const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Ajisai | Diferenciais para Passagens Aéreas",
  description:
    "Concierge no aeroporto, protocolo pré-embarque, monitoramento de viagem e responsabilidade da agência — os diferenciais Ajisai para quem compra a passagem aérea com a gente.",
  openGraph: {
    title: "Ajisai | Diferenciais para Passagens Aéreas",
    description:
      "O mesmo suporte que você encontra dentro de cada produto Ajisai, na seção Aéreo/Passagem Aérea — aqui resumido em um único lugar.",
    siteName: "Ajisai",
    images: [
      {
        url: "/images/hero-passagens-aereas.jpg",
        width: 1200,
        height: 630,
        alt: "Diferenciais Ajisai para Passagens Aéreas",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajisai | Diferenciais para Passagens Aéreas",
    description:
      "O mesmo suporte que você encontra dentro de cada produto Ajisai — aqui resumido em um único lugar.",
    images: ["/images/hero-passagens-aereas.jpg"],
  },
};

export default function PassagensAereasPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link href="/produtos">
            <img
              src="/images/AJISAI-LOGO.avif"
              alt="Ajisai"
              className="h-9 w-auto object-contain md:h-10"
            />
          </Link>
        </div>
      </header>

      {/* ── DIFERENCIAIS AJISAI · PASSAGENS AÉREAS ── */}
      <div className="border-b border-white/10 bg-black">
        <div className="relative h-[420px] w-full overflow-hidden sm:h-[500px] md:h-[600px]">
          <Image
            src="/images/hero-passagens-aereas.jpg"
            alt="Cabine de primeira classe — viagem aérea Ajisai"
            fill
            sizes="100vw"
            priority
            className="object-cover object-[68%_18%]"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/5" />
          <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-28 text-center sm:pb-32 md:pb-36">
            <p
              className="text-[10px] uppercase tracking-[0.2em] text-white"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}
            >
              Passagem comprada com a Ajisai
            </p>
            <h1
              className={`${display.className} mt-2 max-w-3xl text-2xl font-medium leading-tight text-white md:text-4xl`}
              style={{ textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}
            >
              Diferenciais Ajisai para Passagens Aéreas
            </h1>
            <p
              className="mx-auto mt-3 max-w-2xl text-sm font-light leading-6 text-white"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}
            >
              O mesmo suporte que você encontra dentro de cada produto, na
              seção Aéreo/Passagem Aérea — aqui resumido em um único lugar.
            </p>
          </div>
        </div>

        <div className="relative -mt-20 px-6 pb-14 sm:-mt-24 md:-mt-28 md:px-10 md:pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {DIFERENCIAIS_AEREO.map((item) => (
                <div
                  key={item.titulo}
                  className="rounded-2xl border border-black/5 bg-[#FAF7F2] p-6 text-center shadow-sm md:p-8"
                >
                  <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#6ec3d9]/20 text-[#2f80c9]">
                    <Image src={item.imagem} alt="" width={96} height={96} className="h-20 w-20 object-contain" />
                  </span>
                  <h3 className={`${display.className} mt-5 text-lg font-semibold text-[#2f80c9]`}>
                    {item.titulo}
                  </h3>
                  <p className="mt-2 text-[15px] font-normal leading-6 text-[#0A2540]/80">
                    {item.texto}
                  </p>
                </div>
              ))}
            </div>

            {/* ── COMPANHIAS AÉREAS PARCEIRAS ── */}
            <div className="mt-14 md:mt-20">
              <p className="text-center text-[10px] uppercase tracking-[0.2em] text-[#6ec3d9]">
                Rede de parceiros
              </p>
              <h2
                className={`${display.className} mt-2 text-center text-2xl font-medium text-white md:text-3xl`}
              >
                Companhias Aéreas Parceiras
              </h2>

              <div className="mt-8">
                <p className="text-center text-[11px] uppercase tracking-[0.15em] text-white/40">
                  Parceiros homologados — Brasil ↔ Japão
                </p>
                <div className="mx-auto mt-4 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
                  {COMPANHIAS_HOMOLOGADAS.map((cia) => (
                    <div
                      key={cia.nome}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6ec3d9]/15 text-sm font-semibold uppercase tracking-[0.02em] text-[#6ec3d9]">
                        {cia.codigo}
                      </span>
                      <span className="text-xs font-medium text-white">{cia.nome}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <p className="text-center text-[11px] uppercase tracking-[0.15em] text-white/40">
                  Parceiros sazonais
                </p>
                <div className="mx-auto mt-4 grid max-w-2xl grid-cols-3 gap-4">
                  {COMPANHIAS_SAZONAIS.map((cia) => (
                    <div
                      key={cia.nome}
                      className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-semibold uppercase tracking-[0.02em] text-white/70">
                        {cia.codigo}
                      </span>
                      <span className="text-xs font-medium text-white">{cia.nome}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mx-auto mt-6 max-w-xl text-center text-[11px] leading-5 text-white/35">
                Selos com o código IATA de cada companhia — assim que vocês tiverem os
                logotipos oficiais de parceria (normalmente fornecidos pela própria
                companhia aérea), é só enviar que eu troco pelos logos reais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
