"use client";

import { useSearchParams } from "next/navigation";

export function LoginForm({
  action,
}: {
  action: (formData: FormData) => void;
}) {
  const searchParams = useSearchParams();
  const showError = searchParams.get("erro") === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-6 text-[#20252B]">
      <form
        action={action}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-black/5 bg-white p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_30px_70px_-30px_rgba(0,0,0,0.25)]"
      >
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/ajisai-group-logo-crop.png"
            alt="Alpinea — Empresa do Grupo Ajisai"
            className="mx-auto h-12 w-auto"
          />
          <p
            className="mt-4 text-[13px] text-[#626B75]"
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
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#20252B] placeholder-black/30 outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10"
        />

        <input
          type="password"
          name="password"
          placeholder="Senha"
          required
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#20252B] placeholder-black/30 outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10"
        />

        {showError && (
          <p className="text-[13px] text-red-600">E-mail ou senha incorretos. Tente novamente.</p>
        )}

        {searchParams.get("senha") === "1" && (
          <p className="rounded-lg bg-[#EEF6F3] px-3 py-2 text-[13px] text-[#1F5248]">Senha alterada. Entre com a nova senha.</p>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-[#1C3A5E] px-4 py-3 text-sm font-medium text-white shadow-sm shadow-[#1C3A5E]/25 transition hover:bg-[#254a73] hover:shadow-md hover:shadow-[#1C3A5E]/30"
        >
          Entrar
        </button>

        <p className="text-center">
          <a href="/crm/esqueci-senha" className="text-[13px] text-[#626B75] underline decoration-black/20 underline-offset-2 hover:text-[#1C3A5E]">
            Esqueci minha senha
          </a>
        </p>
      </form>
    </main>
  );
}
