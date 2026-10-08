"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { definirVagasAtivas } from "../../../actions";

type Linha = {
  id: string;
  codigo: string;
  publicadaEm: string;
  empresa: string;
  titulo: string;
  local: string;
  status: "aberta" | "consulta";
  ativa: boolean;
  alteradaEm: string | null;
  candidaturas: number;
};

export default function ListaVagasSite({ linhas }: { linhas: Linha[] }) {
  const [ativas, setAtivas] = useState(() => new Set(linhas.filter((l) => l.ativa).map((l) => l.id)));
  const [salvando, setSalvando] = useState<Set<string>>(new Set());
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [, startTransition] = useTransition();

  const visiveis = useMemo(() => {
    const b = busca.trim().toLowerCase();
    if (!b) return linhas;
    return linhas.filter((l) => `${l.codigo} ${l.empresa} ${l.titulo} ${l.local} ${l.id} ${l.publicadaEm}`.toLowerCase().includes(b));
  }, [linhas, busca]);

  function aplicar(ids: string[], ativa: boolean) {
    if (ids.length === 0) return;
    const antes = new Set(ativas);
    setErro("");
    setAtivas((atual) => {
      const novo = new Set(atual);
      for (const id of ids) {
        if (ativa) novo.add(id);
        else novo.delete(id);
      }
      return novo;
    });
    setSalvando((s) => new Set([...s, ...ids]));
    startTransition(async () => {
      const r = await definirVagasAtivas(ids, ativa);
      if (!r.ok) {
        setAtivas(antes);
        setErro(r.erro);
      }
      setSalvando((s) => {
        const novo = new Set(s);
        for (const id of ids) novo.delete(id);
        return novo;
      });
    });
  }

  const idsVisiveis = visiveis.map((l) => l.id);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar ID, empresa, cidade ou função"
          className="h-10 w-full max-w-xs rounded-xl border border-black/15 bg-white px-3 text-sm focus:border-[#1C3A5E] focus:outline-none"
        />
        <p className="text-sm text-black/55">
          <span className="font-semibold text-black">{ativas.size}</span> de {linhas.length} ativas no site
        </p>
        <div className="flex gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={() => aplicar(idsVisiveis.filter((id) => !ativas.has(id)), true)}
            className="rounded-xl border border-black/15 px-3 py-2 text-xs font-medium text-black/70 hover:border-black/40"
          >
            Ativar {busca ? "filtradas" : "todas"}
          </button>
          <button
            type="button"
            onClick={() => aplicar(idsVisiveis.filter((id) => ativas.has(id)), false)}
            className="rounded-xl border border-black/15 px-3 py-2 text-xs font-medium text-black/70 hover:border-black/40"
          >
            Desativar {busca ? "filtradas" : "todas"}
          </button>
        </div>
      </div>

      {erro && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      <ul className="mt-4 divide-y divide-black/[0.07] overflow-hidden rounded-2xl border border-black/10 bg-white">
        {visiveis.map((l) => {
          const marcada = ativas.has(l.id);
          return (
            <li key={l.id} className={`flex items-center gap-4 px-4 py-3 ${marcada ? "" : "bg-black/[0.02]"}`}>
              <input
                id={`vaga-${l.id}`}
                type="checkbox"
                checked={marcada}
                disabled={salvando.has(l.id)}
                onChange={(e) => aplicar([l.id], e.target.checked)}
                className="h-5 w-5 shrink-0 accent-[#1C3A5E]"
              />
              <span className="hidden w-[84px] shrink-0 font-mono text-xs font-semibold text-[#1C3A5E] sm:block">{l.codigo}</span>
              <label htmlFor={`vaga-${l.id}`} className="min-w-0 flex-1 cursor-pointer">
                <span className={`block truncate text-sm font-medium ${marcada ? "text-black" : "text-black/45"}`}>
                  {l.empresa} — {l.titulo}
                </span>
                <span className="block text-xs text-black/45">
                  <span className="font-mono sm:hidden">{l.codigo} · </span>
                  Publicada em {l.publicadaEm} · {l.local}
                  {l.status === "consulta" && " · sob consulta"}
                  {l.candidaturas > 0 && ` · ${l.candidaturas} ${l.candidaturas === 1 ? "candidatura" : "candidaturas"}`}
                  {salvando.has(l.id) && " · salvando…"}
                </span>
              </label>
              <span
                className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] sm:inline ${
                  marcada ? "bg-emerald-50 text-emerald-700" : "bg-black/[0.05] text-black/45"
                }`}
              >
                {marcada ? "No site" : "Oculta"}
              </span>
              <Link
                href={`/empregos/vagas/${l.id}`}
                target="_blank"
                className="shrink-0 text-xs font-medium text-[#1C3A5E] underline decoration-[#1C3A5E]/30 underline-offset-2"
              >
                Ver página
              </Link>
            </li>
          );
        })}
        {visiveis.length === 0 && <li className="px-4 py-6 text-sm text-black/45">Nenhuma vaga com essa busca.</li>}
      </ul>
    </div>
  );
}
