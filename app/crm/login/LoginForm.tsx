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
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-6 text-black">
      <form
        action={action}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-black/10 bg-[#57534E]/[0.05] p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.2)]"
      >
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/ajisai-group-logo-crop.png"
            alt="Alpinea — Empresa do Grupo Ajisai"
            className="mx-auto h-12 w-auto"
          />
          <p
            className={`${displayClassName} mt-4 text-xs uppercase tracking-[0.35em] text-black/40`}
          >
            CRM · Acesso restrito
          </p>
        </div>

        <input
          type="email"
          name="email"
          placeholder="E-mail"
          required
          autoFocus
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder-black/30 outline-none transition focus:border-black/40"
        />

        <input
          type="password"
          name="password"
          placeholder="Senha"
          required
          className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder-black/30 outline-none transition focus:border-black/40"
        />

        {showError && (
          <p className="text-xs text-red-600">E-mail ou senha incorretos. Tente novamente.</p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-[#1C3A5E] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#254a73]"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
