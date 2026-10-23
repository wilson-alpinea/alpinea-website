"use client";

import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { CaixaAcesso, BOTAO, CAMPO } from "./CaixaAcesso";

// Destino do link de recuperação. Aceita os três formatos que o Supabase
// pode mandar: #access_token (implicit), ?code= (PKCE) e ?token_hash=.
// Abre uma sessão só para trocar a senha; depois sai e volta ao login.

type Estado = "verificando" | "pronto" | "invalido" | "salvando";

export function RedefinirForm() {
  const [estado, setEstado] = useState<Estado>("verificando");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let ativo = true;
    (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      let ok = false;
      if (hash.get("error") || url.searchParams.get("error")) {
        ok = false;
      } else if (hash.get("access_token") && hash.get("refresh_token")) {
        const { error } = await supabase.auth.setSession({ access_token: hash.get("access_token")!, refresh_token: hash.get("refresh_token")! });
        ok = !error;
      } else if (url.searchParams.get("token_hash")) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: url.searchParams.get("token_hash")!, type: (url.searchParams.get("type") as EmailOtpType) || "recovery" });
        ok = !error;
      } else if (url.searchParams.get("code")) {
        const { error } = await supabase.auth.exchangeCodeForSession(url.searchParams.get("code")!);
        ok = !error;
      } else {
        const { data } = await supabase.auth.getUser();
        ok = !!data.user;
      }
      // Tira os tokens da barra de endereço.
      window.history.replaceState(null, "", "/crm/redefinir-senha");
      if (ativo) setEstado(ok ? "pronto" : "invalido");
    })();
    return () => {
      ativo = false;
    };
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 8) return setErro("A senha precisa ter pelo menos 8 caracteres.");
    if (senha !== confirma) return setErro("As duas senhas não são iguais.");
    setEstado("salvando");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setEstado("pronto");
      setErro(error.message.includes("different from the old") ? "A nova senha precisa ser diferente da anterior." : "Não foi possível salvar a senha. Peça um novo link.");
      return;
    }
    await supabase.auth.signOut();
    window.location.assign("/crm/login?senha=1");
  }

  return (
    <CaixaAcesso titulo="Criar nova senha">
      {estado === "verificando" ? (
        <p className="text-center text-sm text-[#626B75]">Verificando o link…</p>
      ) : estado === "invalido" ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-[#20252B]">Este link expirou ou já foi usado.</p>
          <a href="/crm/esqueci-senha" className={`${BOTAO} inline-block`}>
            Pedir um novo link
          </a>
        </div>
      ) : (
        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label htmlFor="nova" className="mb-1.5 block text-[13px] text-[#626B75]">
              Nova senha
            </label>
            <input id="nova" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={8} autoComplete="new-password" autoFocus className={CAMPO} />
            <p className="mt-1 text-[13px] text-[#626B75]">Mínimo de 8 caracteres.</p>
          </div>
          <div>
            <label htmlFor="conf" className="mb-1.5 block text-[13px] text-[#626B75]">
              Repita a nova senha
            </label>
            <input id="conf" type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} required autoComplete="new-password" className={CAMPO} />
          </div>
          {erro && <p role="alert" className="text-[13px] text-red-600">{erro}</p>}
          <button type="submit" disabled={estado === "salvando"} className={BOTAO}>
            {estado === "salvando" ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      )}
    </CaixaAcesso>
  );
}
