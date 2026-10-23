"use client";

import { useMemo, useState, useTransition } from "react";
import { definirEmpreiteiraDaVaga } from "../../acessosActions";
import type { EmpresaAcesso, VagaAcesso } from "./AcessosPagina";
import { BotaoPrimario, CAMPO_FILTRO, CabecalhoSecao, Icones, SOMBRA, TEMA } from "./comum";

// Vínculos de vagas: cada vaga pertence a no máximo UMA empreiteira (regra
// atual do banco — vincular a outra empresa transfere a vaga).
type Estado = { tipo: "salvando" | "ok" | "erro"; texto: string };

export function AbaVagas({
  empreiteiras,
  vagas,
  vinculos,
  selecionada,
  setSelecionada,
  busca,
  setBusca,
  filtro,
  setFiltro,
  erro,
  onCadastrarEmpreiteira,
}: {
  empreiteiras: EmpresaAcesso[];
  vagas: VagaAcesso[];
  vinculos: Record<string, string>;
  selecionada: string;
  setSelecionada: (id: string) => void;
  busca: string;
  setBusca: (v: string) => void;
  filtro: string;
  setFiltro: (v: string) => void;
  erro: boolean;
  onCadastrarEmpreiteira: () => void;
}) {
  const cor = TEMA.vagas.cor;
  const [ajustes, setAjustes] = useState<Record<string, string | null>>({});
  const [estados, setEstados] = useState<Record<string, Estado>>({});
  const [confirmarTransferencia, setConfirmarTransferencia] = useState<string | null>(null);
  const [, iniciar] = useTransition();
  const [buscaEmpresa, setBuscaEmpresa] = useState("");

  const dono = (vagaId: string) => (vagaId in ajustes ? ajustes[vagaId] : vinculos[vagaId] ?? null);
  const nomeEmpresa = (id: string | null) => empreiteiras.find((e) => e.id === id)?.nome ?? "outra empreiteira";
  const empresa = empreiteiras.find((e) => e.id === selecionada) ?? null;

  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return vagas.filter((v) => {
      if (t && ![v.titulo, v.codigo, v.empresa, v.local].some((x) => x.toLowerCase().includes(t))) return false;
      const d = dono(v.id);
      if (filtro === "vinculadas") return d === selecionada;
      if (filtro === "disponiveis") return d === null;
      if (filtro === "outras") return d !== null && d !== selecionada;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vagas, busca, filtro, selecionada, ajustes, vinculos]);

  const contagem = {
    vinculadas: vagas.filter((v) => dono(v.id) === selecionada).length,
    disponiveis: vagas.filter((v) => dono(v.id) === null).length,
    outras: vagas.filter((v) => dono(v.id) !== null && dono(v.id) !== selecionada).length,
  };

  function mudar(vagaId: string, novo: string | null) {
    const anterior = dono(vagaId);
    setConfirmarTransferencia(null);
    setAjustes((a) => ({ ...a, [vagaId]: novo }));
    setEstados((e) => ({ ...e, [vagaId]: { tipo: "salvando", texto: "Salvando…" } }));
    iniciar(async () => {
      const r = await definirEmpreiteiraDaVaga(vagaId, novo).catch(() => ({ ok: false }));
      if (r.ok) {
        setEstados((e) => ({ ...e, [vagaId]: { tipo: "ok", texto: "Vínculo atualizado" } }));
        setTimeout(() => setEstados((e) => (e[vagaId]?.tipo === "ok" ? Object.fromEntries(Object.entries(e).filter(([k]) => k !== vagaId)) : e)), 2500);
      } else {
        setAjustes((a) => ({ ...a, [vagaId]: anterior }));
        setEstados((e) => ({ ...e, [vagaId]: { tipo: "erro", texto: "Não foi possível salvar. O vínculo anterior foi mantido." } }));
      }
    });
  }

  const cabecalho = (
    <CabecalhoSecao tema="vagas" icone={Icones.vagas} titulo="Vínculos de vagas" descricao="Defina quais vagas e candidatos cada empreiteira pode visualizar." />
  );

  if (erro) {
    return (
      <div className="space-y-6">
        {cabecalho}
        <p role="alert" className="rounded-xl border border-[#B42318]/20 bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]">
          Não foi possível carregar os vínculos. Recarregue a página.
        </p>
      </div>
    );
  }

  if (empreiteiras.length === 0) {
    return (
      <div className="space-y-6">
        {cabecalho}
        <div className={`rounded-2xl border border-black/[0.06] bg-white px-6 py-10 text-center ${SOMBRA}`}>
          <p className="text-base font-semibold text-[#20252B]">Nenhuma empreiteira cadastrada.</p>
          <p className="mt-1 text-sm text-[#626B75]">Cadastre uma empreiteira para começar a vincular vagas.</p>
          <div className="mt-4">
            <BotaoPrimario cor={cor} onClick={onCadastrarEmpreiteira}>
              Cadastrar empreiteira
            </BotaoPrimario>
          </div>
        </div>
      </div>
    );
  }

  const empresasFiltradas = empreiteiras.filter((e) => e.nome.toLowerCase().includes(buscaEmpresa.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      {cabecalho}

      <section className={`rounded-2xl border border-black/[0.06] bg-white p-6 ${SOMBRA}`} aria-label="Empreiteira">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <label htmlFor="busca-empreiteira" className="mb-1.5 block text-[13px] font-medium text-[#626B75]">
              Empreiteira
            </label>
            <input id="busca-empreiteira" type="search" value={buscaEmpresa} onChange={(e) => setBuscaEmpresa(e.target.value)} placeholder="Buscar empreiteira…" className={`${CAMPO_FILTRO} mb-2 w-full`} />
            <select
              aria-label="Empreiteira selecionada"
              value={selecionada}
              onChange={(e) => setSelecionada(e.target.value)}
              className={`${CAMPO_FILTRO} w-full`}
              size={Math.min(5, Math.max(2, empresasFiltradas.length))}
            >
              {empresasFiltradas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                  {e.ativo ? "" : " (inativa)"}
                </option>
              ))}
            </select>
            {empresasFiltradas.length === 0 && <p className="mt-1 text-[13px] text-[#626B75]">Nenhuma empreiteira com esse nome.</p>}
          </div>
          {empresa && (
            <div className="rounded-xl p-4" style={{ backgroundColor: TEMA.vagas.fundo }}>
              <p className="text-base font-semibold text-[#20252B]">{empresa.nome}</p>
              <p className="text-sm text-[#626B75]">
                <span className="font-semibold tabular-nums" style={{ color: cor }}>
                  {contagem.vinculadas}
                </span>{" "}
                {contagem.vinculadas === 1 ? "vaga vinculada" : "vagas vinculadas"} · {empresa.ativo ? "empresa ativa" : "empresa inativa (usuários sem acesso)"}
              </p>
              <p className="mt-2 text-[13px] text-[#626B75]">
                Vincular uma vaga libera os candidatos dela para os usuários desta empreiteira. Cada vaga pertence a uma empreiteira por vez: vincular uma vaga de outra empresa transfere a vaga. Salva na hora.
              </p>
            </div>
          )}
        </div>
      </section>

      {empresa && (
        <section className={`rounded-2xl border border-black/[0.06] bg-white p-6 ${SOMBRA}`} aria-label="Vagas">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="busca-vagas" className="sr-only">
              Buscar vagas
            </label>
            <input id="busca-vagas" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por vaga, código, fábrica ou cidade…" className={`${CAMPO_FILTRO} min-w-[220px] flex-1`} />
            <div role="tablist" aria-label="Filtrar vagas" className="inline-flex flex-wrap rounded-xl border border-[#D5DAE0] p-1">
              {[
                { id: "", label: "Todas", n: vagas.length },
                { id: "vinculadas", label: "Vinculadas", n: contagem.vinculadas },
                { id: "disponiveis", label: "Disponíveis", n: contagem.disponiveis },
                { id: "outras", label: "Com outra empreiteira", n: contagem.outras },
              ].map((f) => (
                <button
                  key={f.id || "todas"}
                  type="button"
                  role="tab"
                  aria-selected={filtro === f.id}
                  onClick={() => setFiltro(f.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium tabular-nums transition ${filtro === f.id ? "text-white" : "text-[#626B75] hover:text-[#20252B]"}`}
                  style={filtro === f.id ? { backgroundColor: cor } : undefined}
                >
                  {f.label} <span className={filtro === f.id ? "text-white/75" : "text-[#8A929B]"}>{f.n}</span>
                </button>
              ))}
            </div>
          </div>

          {lista.length === 0 ? (
            <p className="mt-4 rounded-xl bg-[#F5F6F7] px-4 py-6 text-center text-sm text-[#626B75]">Nenhuma vaga neste filtro.</p>
          ) : (
            <ul className="mt-4 divide-y divide-[#EEF0F2]">
              {lista.map((v) => {
                const d = dono(v.id);
                const minha = d === selecionada;
                const deOutra = d !== null && !minha;
                const est = estados[v.id];
                return (
                  <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-[#20252B]">{v.titulo}</p>
                      <p className="text-[13px] text-[#626B75]">
                        {v.codigo} · {v.empresa} · {v.local}
                      </p>
                      {deOutra && <p className="text-[13px] font-medium text-[#946200]">Vinculada a {nomeEmpresa(d)}</p>}
                      {est && (
                        <p role={est.tipo === "erro" ? "alert" : "status"} className={`text-[13px] ${est.tipo === "erro" ? "text-[#B42318]" : est.tipo === "ok" ? "text-[#28665D]" : "text-[#626B75]"}`}>
                          {est.texto}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {minha ? (
                        <>
                          <span className="rounded-full px-2.5 py-0.5 text-[13px] font-medium" style={{ color: cor, backgroundColor: TEMA.vagas.fundo }}>
                            Vinculada
                          </span>
                          <button
                            type="button"
                            disabled={est?.tipo === "salvando"}
                            onClick={() => mudar(v.id, null)}
                            aria-label={`Desvincular ${v.titulo} de ${empresa.nome}`}
                            className="rounded-lg border border-[#D5DAE0] bg-white px-3 py-1.5 text-sm font-medium text-[#20252B] hover:border-[#B42318]/40 hover:text-[#B42318] disabled:opacity-50"
                          >
                            Desvincular
                          </button>
                        </>
                      ) : deOutra && confirmarTransferencia !== v.id ? (
                        <button
                          type="button"
                          disabled={est?.tipo === "salvando"}
                          onClick={() => setConfirmarTransferencia(v.id)}
                          className="rounded-lg border border-[#D5DAE0] bg-white px-3 py-1.5 text-sm font-medium text-[#20252B] hover:border-[#28665D]/50 disabled:opacity-50"
                        >
                          Transferir para esta
                        </button>
                      ) : deOutra ? (
                        <span className="flex flex-wrap items-center gap-2 text-[13px] text-[#20252B]">
                          {nomeEmpresa(d)} deixa de ver os candidatos desta vaga.
                          <button type="button" onClick={() => mudar(v.id, selecionada)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-white" style={{ backgroundColor: cor }}>
                            Confirmar
                          </button>
                          <button type="button" onClick={() => setConfirmarTransferencia(null)} className="rounded-lg px-2 py-1.5 text-sm text-[#626B75] hover:underline">
                            Cancelar
                          </button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={est?.tipo === "salvando"}
                          onClick={() => mudar(v.id, selecionada)}
                          aria-label={`Vincular ${v.titulo} a ${empresa.nome}`}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-50"
                          style={{ backgroundColor: cor }}
                        >
                          Vincular
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
