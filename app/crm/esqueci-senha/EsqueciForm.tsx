"use client";

import { useActionState } from "react";
import { pedirLinkSenha } from "./actions";
import { CaixaAcesso, BOTAO, CAMPO } from "../redefinir-senha/CaixaAcesso";

export function EsqueciForm() {
  const [estado, acao, pendente] = useActionState(pedirLinkSenha, null);
  return (
    <CaixaAcesso titulo="Esqueci minha senha">
      {estado?.enviado ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-[#20252B]">Se esse e-mail tiver acesso ao CRM, você vai receber um link para criar uma nova senha.</p>
          <p className="text-[13px] text-[#626B75]">O link vale por pouco tempo. Confira também a caixa de spam.</p>
          <a href="/crm/login" className="inline-block text-[13px] font-medium text-[#1C3A5E] underline underline-offset-2">
            Voltar para o login
          </a>
        </div>
      ) : (
        <form action={acao} className="space-y-4">
          <p className="text-[13px] text-[#626B75]">Informe o e-mail de acesso. Enviaremos um link para criar uma nova senha.</p>
          <input type="email" name="email" placeholder="E-mail" required autoFocus autoComplete="email" className={CAMPO} />
          {estado?.erro && <p className="text-[13px] text-red-600">{estado.erro}</p>}
          <button type="submit" disabled={pendente} className={BOTAO}>
            {pendente ? "Enviando…" : "Enviar link"}
          </button>
          <p className="text-center">
            <a href="/crm/login" className="text-[13px] text-[#626B75] underline decoration-black/20 underline-offset-2">
              Voltar para o login
            </a>
          </p>
        </form>
      )}
    </CaixaAcesso>
  );
}
