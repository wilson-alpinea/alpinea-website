import type { Metadata } from "next";
import { Bodoni_Moda } from "next/font/google";
import { ApprovalPanel } from "./ApprovalPanel";

// Página de aprovação de rascunho — enviada individualmente para cada
// cliente por uma URL não listada (chave alfanumérica de 8 dígitos, sem
// link em nenhum outro lugar do site). Baseada no template visual de
// /ajisairoteiros, mas em tema claro, sem hero, e com a "Amostra do Dia 1"
// substituída por uma visão simplificada dos 7 dias (Manhã/Tarde, atração
// principal e pontos de interesse) para validação rápida antes de
// iniciarmos o painel digital completo.

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const APPROVAL_KEY = "lpfyslh1";

export const metadata: Metadata = {
  title: "Aprovação de Roteiro | Ajisai",
  description: "Página privada de aprovação de rascunho de roteiro.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AprovacaoRoteiroPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-black/10 px-6 py-5 md:px-16">
        <img
          src="/images/logo-alpinea-v2-crop.png"
          alt="Alpinea — Empresa do Grupo Ajisai"
          className="h-[51px] w-auto object-contain md:h-16"
        />
        <span className="rounded-full border border-black/15 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-black/50">
          Draft para aprovação
        </span>
      </header>

      <section className="px-6 pb-4 pt-14 text-center md:px-16">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[#2f5aa8]">
            Aprovação do roteiro
          </p>
          <h1
            className={`${display.className} text-[1.9rem] font-medium leading-tight text-black md:text-[2.4rem]`}
          >
            Confirme as informações principais da sua viagem
          </h1>
          <p className="mx-auto mt-5 text-sm leading-7 text-black/55 md:text-base">
            Revise abaixo a estrutura do seu roteiro de 7 dias. Ao aprovar,
            iniciamos a elaboração do seu painel digital personalizado.
          </p>
        </div>
      </section>

      <section className="px-5 pb-4 md:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] sm:rounded-[2rem] sm:p-8">
            <p className="mx-auto mb-5 block w-fit rounded-full border border-black/15 px-5 py-2 text-center text-xs font-bold uppercase tracking-[0.25em] text-black/40">
              Dados do Cliente
            </p>
            <div className="grid grid-cols-1 gap-5 border-b border-black/10 pb-6 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
                  Data da Contratação
                </p>
                <p className="mt-1 text-sm font-semibold text-black">
                  28 de Julho de 2026
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
                  Cliente
                </p>
                <p className="mt-1 text-sm font-semibold text-black">
                  Rafael Serafim Sousa
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
                  Duração
                </p>
                <p className="mt-1 text-sm font-semibold text-black">
                  7 Dias
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <img
                src="/images/emirates-logo.png"
                alt="Emirates"
                className="h-24 w-auto rounded-md object-contain sm:h-28"
              />
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-black/40">
                  Companhia Aérea
                </p>
                <p className="text-sm font-semibold text-black">Emirates</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-black/10 p-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/40">
                  Ida · 03–04 Mai 2027
                </p>
                <div className="space-y-1.5 text-sm text-black/70">
                  <p>
                    <span className="font-semibold text-black">EK262</span>{" "}
                    · GRU → DXB · 01:35 → 23:00
                  </p>
                  <p>
                    <span className="font-semibold text-black">EK318</span>{" "}
                    · DXB → NRT · 23:40 → 17:35
                  </p>
                </div>
                <p className="mt-2 text-xs text-black/40">
                  Chegada em Tokyo pelo Aeroporto de Narita (NRT), Terminal 2
                </p>
              </div>
              <div className="rounded-xl border border-black/10 p-4">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-black/40">
                  Volta · 12 Mai 2027
                </p>
                <div className="space-y-1.5 text-sm text-black/70">
                  <p>
                    <span className="font-semibold text-black">EK313</span>{" "}
                    · HND → DXB · 00:05 → 06:25
                  </p>
                  <p>
                    <span className="font-semibold text-black">EK261</span>{" "}
                    · DXB → GRU · 06:05 → 17:40
                  </p>
                </div>
                <p className="mt-2 text-xs text-black/40">
                  Saída de Tokyo pelo Aeroporto de Haneda (HND), Terminal 3
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-12 pt-24 md:px-16 md:pb-16 md:pt-32">
        <div className="mx-auto max-w-4xl">
          <ApprovalPanel
            displayClassName={display.className}
            approvalKey={APPROVAL_KEY}
          />
        </div>
      </section>

      <footer className="border-t border-black/10 px-6 py-8 text-center text-xs text-black/40 md:px-16">
        <p>
          © {new Date().getFullYear()} AJISAIWORK JAPAN AGENCIA DE VIAGENS
          LTDA — CNPJ 43.544.605/0001-56
        </p>
        <p className="mt-1">
          Alpinea Agências de Viagens LTDA — CNPJ 66.491.067/0001-84
        </p>
        <p className="mt-1.5">Página de aprovação privada, não indexada.</p>
      </footer>
    </main>
  );
}
