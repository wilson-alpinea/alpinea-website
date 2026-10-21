"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Confirmação depois de cadastrar um cliente (Wilson, 21/out/2026): avisa
// que deu certo e volta sozinho para o CRM em alguns segundos.
const SEGUNDOS = 4;

export function ConfirmacaoCadastro({ nome, clienteId }: { nome: string; clienteId: string }) {
  const router = useRouter();
  const [restante, setRestante] = useState(SEGUNDOS);
  const [aberto, setAberto] = useState(true);

  useEffect(() => {
    if (!aberto) return;
    if (restante <= 0) {
      router.replace(`/crm/clientes/${clienteId}`);
      return;
    }
    const t = setTimeout(() => setRestante((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [restante, aberto, router, clienteId]);

  if (!aberto) return null;

  const fechar = () => {
    setAberto(false);
    router.replace(`/crm/clientes/${clienteId}`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacao">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <span className="mx-auto block text-3xl leading-none text-emerald-700" aria-hidden="true">
          ✓
        </span>
        <h2 id="titulo-confirmacao" className="mt-4 text-lg font-medium text-black">
          Cliente cadastrado
        </h2>
        <p className="mt-1 text-sm text-black/60">
          <strong className="font-medium text-black/80">{nome}</strong> foi registrado no CRM como Novo Lead.
        </p>
        <p className="mt-3 text-xs text-black/45" aria-live="polite">
          Você será redirecionado de volta ao CRM em {restante} {restante === 1 ? "segundo" : "segundos"}…
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={fechar}
            className="rounded-full bg-[#1C3A5E] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#254a73]"
          >
            Ver ficha agora
          </button>
          <Link href="/crm/clientes" className="rounded-full border border-black/15 px-5 py-2 text-sm text-black/70 transition hover:border-black/40">
            Ir para clientes
          </Link>
        </div>
      </div>
    </div>
  );
}
