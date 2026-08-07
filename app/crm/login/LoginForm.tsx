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
      <form
        action={action}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-8"
      >
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-white/40">Acesso restrito</p>
          <h1 className={`${displayClassName} text-2xl font-medium text-white`}>CRM Alpinea</h1>
        </div>

        <input
          type="email"
          name="email"
          placeholder="E-mail"
          required
          autoFocus
          className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/40"
        />

        <input
          type="password"
          name="password"
          placeholder="Senha"
          required
          className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/40"
        />

        {showError && (
          <p className="text-xs text-red-400">E-mail ou senha incorretos. Tente novamente.</p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
