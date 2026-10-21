"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BUCKET_ARQUIVOS_CLIENTE, LIMITE_ARQUIVO_CLIENTE_MB } from "@/lib/crm/arquivosStorage";
import { prepararUploadArquivoCliente, registrarArquivoCliente } from "../../../arquivosClienteActions";

type Opcao = { valor: string; label: string };

// Envio de arquivos na ficha do cliente (Wilson, 21/out/2026). Arraste ou
// escolha um ou mais arquivos; cada um sobe direto para o storage.
export function UploadArquivoCliente({ clienteId, tipos }: { clienteId: string; tipos: Opcao[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tipo, setTipo] = useState(tipos.find((t) => t.valor === "proposta")?.valor ?? tipos[0].valor);
  const [rotulo, setRotulo] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);

  async function enviar(arquivos: File[]) {
    if (!arquivos.length || enviando) return;
    setEnviando(true);
    setErro(null);
    const supabase = createClient();
    let enviados = 0;
    for (const [i, arquivo] of arquivos.entries()) {
      setStatus(`Enviando ${arquivos.length > 1 ? `${i + 1} de ${arquivos.length}: ` : ""}${arquivo.name}…`);
      const preparo = await prepararUploadArquivoCliente(clienteId, arquivo.name, arquivo.size);
      if (!preparo.ok) {
        setErro(`${arquivo.name}: ${preparo.erro}`);
        continue;
      }
      const { error } = await supabase.storage.from(BUCKET_ARQUIVOS_CLIENTE).uploadToSignedUrl(preparo.path, preparo.token, arquivo, {
        contentType: arquivo.type || "application/octet-stream",
      });
      if (error) {
        setErro(`${arquivo.name}: não foi possível enviar.`);
        continue;
      }
      const registro = await registrarArquivoCliente(clienteId, {
        tipo,
        label: arquivos.length === 1 ? rotulo : "",
        path: preparo.path,
        nomeOriginal: arquivo.name,
      });
      if (!registro.ok) setErro(`${arquivo.name}: ${registro.erro}`);
      else enviados++;
    }
    setEnviando(false);
    setStatus(enviados ? `${enviados} ${enviados === 1 ? "arquivo enviado" : "arquivos enviados"}.` : null);
    setRotulo("");
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  const campo =
    "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-black outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10";

  return (
    <div className="mt-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={campo} aria-label="Tipo do arquivo">
          {tipos.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={rotulo}
          onChange={(e) => setRotulo(e.target.value)}
          placeholder="Nome de exibição (opcional — usa o nome do arquivo)"
          className={`${campo} placeholder-black/30`}
        />
      </div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          void enviar(Array.from(e.dataTransfer.files));
        }}
        className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          arrastando ? "border-[#1C3A5E] bg-[#1C3A5E]/[0.04]" : "border-black/15 hover:border-[#1C3A5E]/50"
        } ${enviando ? "pointer-events-none opacity-60" : ""}`}
      >
        <span className="text-sm font-medium text-[#1C3A5E]">{enviando ? "Enviando…" : "Escolher arquivos ou arrastar aqui"}</span>
        <span className="mt-1 text-xs text-black/45">PDF, Word, Excel, imagens… até {LIMITE_ARQUIVO_CLIENTE_MB} MB cada</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          disabled={enviando}
          onChange={(e) => void enviar(Array.from(e.target.files ?? []))}
        />
      </label>
      {status && (
        <p className="mt-2 text-xs text-black/55" aria-live="polite">
          {status}
        </p>
      )}
      {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
    </div>
  );
}
