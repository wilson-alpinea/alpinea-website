"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { prepararUploadNf, registrarNf } from "../../notasFiscaisActions";

// Botão "Anexar nota fiscal" (Wilson, 04/nov/2026) — usado no alerta das
// notificações e na tela do serviço. Sobe o arquivo e atualiza a página:
// com a NF anexada, o alerta some.
const BUCKET = "notas-fiscais";
const ACEITA = ".pdf,.xml,.png,.jpg,.jpeg,.webp,application/pdf,text/xml,application/xml,image/png,image/jpeg,image/webp";

export function AnexarNf({
  origem,
  registroId,
  rotulo = "Anexar nota fiscal",
  compacto = false,
  aoConcluir,
}: {
  origem: "agencia" | "seguro" | "documentacao";
  registroId: string;
  rotulo?: string;
  compacto?: boolean;
  aoConcluir?: () => void;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(arquivo: File | undefined) {
    if (!arquivo || enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      const preparo = await prepararUploadNf(origem, registroId, arquivo.name, arquivo.size, arquivo.type);
      if (!preparo.ok) return setErro(preparo.erro);
      const { error } = await createClient().storage.from(BUCKET).uploadToSignedUrl(preparo.path, preparo.token, arquivo, {
        contentType: arquivo.type || "application/octet-stream",
      });
      if (error) return setErro("Não foi possível enviar o arquivo.");
      const r = await registrarNf(origem, registroId, preparo.path, arquivo.name);
      if (!r.ok) return setErro(r.erro ?? "Não foi possível registrar a nota.");
      aoConcluir?.();
      router.refresh();
    } finally {
      setEnviando(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <input ref={input} type="file" accept={ACEITA} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => enviar(e.target.files?.[0])} />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={enviando}
        className={`rounded-lg bg-[#B42318] font-medium text-white transition hover:bg-[#912018] disabled:opacity-60 ${compacto ? "px-2.5 py-1 text-[12px]" : "px-3.5 py-2 text-sm"}`}
      >
        {enviando ? "Enviando…" : rotulo}
      </button>
      {erro && (
        <span role="alert" className="text-[12px] text-[#B42318]">
          {erro}
        </span>
      )}
    </span>
  );
}
