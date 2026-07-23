"use client";

import { useSearchParams } from "next/navigation";

export function LoginForm({
  action,
  displayClassName,
}: {
  action: (formData: FormData) => void;
  displayClassName: string;
}) {
  const searchParams = useSearchParams();
  const showError = searchParams.get("erro") === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <form action={action} className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/40">Acesso restrito</p>
          <h1 className={`${displayClassName} text-2xl font-medium text-white`}>Banco de Conteúdo</h1>
        </div>

        <input
          type="password"
          name="password"
          placeholder="Senha"
          required
          autoFocus
          className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#5b9bd5]"
        />

        {showError && <p className="text-xs text-red-400">Senha incorreta. Tente novamente.</p>}

        <button
          type="submit"
          className="w-full rounded-xl bg-[#5b9bd5] px-4 py-3 text-sm font-medium text-black transition hover:bg-[#4a89c4]"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
