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
          src="/images/alpinea-logo-white-crop.png"
          alt="Alpinea — Empresa do Grupo Ajisai"
          className="h-8 w-auto object-contain md:h-9"
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
            iniciamos a elaboração do seu painel digital personalizado, com
            todos os detalhes de horários, deslocamentos, hospedagem e
            recomendações.
          </p>
        </div>
      </section>

      <section className="px-5 py-12 md:px-16 md:py-16">
        <div className="mx-auto max-w-4xl">
          <ApprovalPanel
            displayClassName={display.className}
            approvalKey={APPROVAL_KEY}
          />
        </div>
      </section>

      <footer className="border-t border-black/10 px-6 py-8 text-center text-xs text-black/40 md:px-16">
        © {new Date().getFullYear()} AJISAIWORK JAPAN AGENCIA DE VIAGENS LTDA
        — Página de aprovação privada, não indexada.
      </footer>
    </main>
  );
}
