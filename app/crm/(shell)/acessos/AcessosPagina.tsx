"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AbaVagas } from "./AbaVagas";
import { ConfirmarSituacaoEmpresa, PainelEmpresa, PainelSenha, PainelUsuario, linkIndicacao } from "./Paineis";
import { BotaoPrimario, CAMPO_FILTRO, CabecalhoSecao, Copiar, Icones, MenuAcoes, PERFIS, SOMBRA, TEMA, rotuloPerfil, type Papel } from "./comum";

// Acessos e permissões (Wilson, 23/out/2026). Abas, busca e filtros ficam
// na URL (voltar de uma edição mantém tudo). A tela só reorganiza: as
// permissões continuam sendo checadas no servidor.

export type UsuarioAcesso = { id: string; nome: string | null; email: string; papel: Papel; parceiroId: string | null };
export type EmpresaAcesso = { id: string; nome: string; slug: string; tipo: "agencia" | "empreiteira"; ativo: boolean };
export type VagaAcesso = { id: string; titulo: string; codigo: string; empresa: string; local: string };

type Situacao = "ativo" | "sem_acesso" | "bloqueado";
const SITUACAO: Record<Situacao, { label: string; cor: string; fundo: string }> = {
  ativo: { label: "Ativo", cor: "#28665D", fundo: "#E6F2EF" },
  sem_acesso: { label: "Sem acesso", cor: "#59636F", fundo: "#F1F3F5" },
  bloqueado: { label: "Empresa inativa", cor: "#B42318", fundo: "#FDECEA" },
};

type PainelAberto =
  | { tipo: "novo_usuario" }
  | { tipo: "editar_usuario"; usuario: UsuarioAcesso }
  | { tipo: "senha"; usuario: UsuarioAcesso }
  | { tipo: "nova_empresa"; tipoEmpresa: "agencia" | "empreiteira" }
  | { tipo: "editar_empresa"; empresa: EmpresaAcesso }
  | { tipo: "situacao_empresa"; empresa: EmpresaAcesso }
  | null;

export function AcessosPagina({
  usuarioAtualId,
  usuarios,
  empresas,
  vinculos,
  vagas,
  erros,
  unidade = "agencia",
}: {
  unidade?: "agencia" | "empregos" | "seguro" | "documentacao";
  usuarioAtualId: string;
  usuarios: UsuarioAcesso[];
  empresas: EmpresaAcesso[];
  vinculos: Record<string, string>;
  vagas: VagaAcesso[];
  erros: { usuarios: boolean; empresas: boolean; vinculos: boolean };
}) {
  // Em Empregos, o destaque principal (Usuários) usa o verde-petróleo da unidade.
  const temaUsuarios = unidade === "empregos" ? { fundo: "#EEF6F3", cor: "#27675B" } : unidade === "seguro" ? { fundo: "#F4F1F8", cor: "#75608B" } : unidade === "documentacao" ? { fundo: "#F8F3EF", cor: "#8A5A3C" } : TEMA.usuarios;
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const aba = sp.get("aba") === "empresas" ? "empresas" : sp.get("aba") === "vagas" ? "vagas" : "usuarios";

  function atualizar(mudancas: Record<string, string | null>) {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(mudancas)) {
      if (!v) p.delete(k);
      else p.set(k, v);
    }
    const s = p.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }

  const [painel, setPainel] = useState<PainelAberto>(null);
  const fechar = useCallback(() => setPainel(null), []);

  const empresaPorId = useMemo(() => new Map(empresas.map((e) => [e.id, e])), [empresas]);
  const usuariosPorEmpresa = useMemo(() => {
    const m = new Map<string, number>();
    for (const u of usuarios) if (u.parceiroId) m.set(u.parceiroId, (m.get(u.parceiroId) ?? 0) + 1);
    return m;
  }, [usuarios]);
  const vagasPorEmpresa = useMemo(() => {
    const m = new Map<string, number>();
    for (const id of Object.values(vinculos)) m.set(id, (m.get(id) ?? 0) + 1);
    return m;
  }, [vinculos]);

  const situacaoDe = (u: UsuarioAcesso): Situacao => {
    if (!u.papel) return "sem_acesso";
    if (u.papel !== "admin") {
      const e = u.parceiroId ? empresaPorId.get(u.parceiroId) : null;
      if (!e || !e.ativo) return "bloqueado";
    }
    return "ativo";
  };

  // ── Usuários: filtros ──
  const uq = sp.get("q") ?? "";
  const uPerfil = sp.get("perfil") ?? "";
  const uEmpresa = sp.get("empresa") ?? "";
  const uSit = sp.get("situacao") ?? "";
  const [textoUsuario, setTextoUsuario] = useState(uq);
  const ultimoUq = useRef(uq);
  useEffect(() => {
    if (textoUsuario.trim() === ultimoUq.current) return;
    const t = setTimeout(() => {
      ultimoUq.current = textoUsuario.trim();
      atualizar({ q: textoUsuario.trim() || null });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textoUsuario]);

  const usuariosFiltrados = usuarios.filter((u) => {
    const t = uq.trim().toLowerCase();
    if (t && !(u.nome ?? "").toLowerCase().includes(t) && !u.email.toLowerCase().includes(t)) return false;
    if (uPerfil && (u.papel ?? "sem_acesso") !== uPerfil) return false;
    if (uEmpresa && u.parceiroId !== uEmpresa) return false;
    if (uSit && situacaoDe(u) !== uSit) return false;
    return true;
  });
  const filtrosUsuario = !!(uq || uPerfil || uEmpresa || uSit);
  function limparUsuarios() {
    setTextoUsuario("");
    ultimoUq.current = "";
    atualizar({ q: null, perfil: null, empresa: null, situacao: null });
  }

  // ── Empresas: filtros ──
  const eq = sp.get("eq") ?? "";
  const eTipo = sp.get("etipo") ?? "";
  const eSit = sp.get("esit") ?? "";
  const empresasFiltradas = empresas.filter((e) => {
    if (eq && !e.nome.toLowerCase().includes(eq.toLowerCase())) return false;
    if (eTipo && e.tipo !== eTipo) return false;
    if (eSit && (eSit === "ativa" ? !e.ativo : e.ativo)) return false;
    return true;
  });

  // ── Vagas ──
  const empreiteiras = empresas.filter((e) => e.tipo === "empreiteira");
  const empSelecionada = empreiteiras.some((e) => e.id === sp.get("emp")) ? sp.get("emp")! : empreiteiras[0]?.id ?? "";

  const abas = [
    { id: "usuarios", label: "Usuários", n: erros.usuarios ? null : usuarios.length, tema: temaUsuarios },
    { id: "empresas", label: "Empresas parceiras", n: erros.empresas ? null : empresas.length, tema: TEMA.empresas },
    { id: "vagas", label: "Vínculos de vagas", n: null, tema: TEMA.vagas },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#20252B]">Acessos e permissões</h1>
        <p className="mt-0.5 text-sm text-[#626B75]">Gerencie usuários, empresas parceiras e o acesso a cada unidade.</p>
        <p className="mt-3 inline-block rounded-xl border border-black/[0.06] bg-white px-4 py-2.5 text-[13px] text-[#626B75]">
          Parceiros visualizam apenas seus leads. Empreiteiras visualizam apenas os candidatos das vagas vinculadas. Acessos externos são somente leitura.
        </p>
      </div>

      <div role="tablist" aria-label="Seções de acesso" className="flex flex-wrap gap-1 border-b border-[#E6E9ED]">
        {abas.map((t) => {
          const sel = aba === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={sel}
              onClick={() => atualizar({ aba: t.id === "usuarios" ? null : t.id })}
              className="-mb-px border-b-2 px-4 py-2.5 text-sm font-medium tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30"
              style={{ borderColor: sel ? t.tema.cor : "transparent", color: sel ? t.tema.cor : "#626B75" }}
            >
              {t.label}
              {t.n !== null && <span className="ml-1.5 opacity-70">{t.n}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Usuários ── */}
      {aba === "usuarios" && (
        <div className="space-y-6">
          <CabecalhoSecao
            tema="usuarios"
            cores={temaUsuarios}
            icone={Icones.usuarios}
            titulo="Usuários"
            descricao="Defina quem pode acessar o CRM e quais informações pode visualizar."
            acao={<BotaoPrimario cor={temaUsuarios.cor} onClick={() => setPainel({ tipo: "novo_usuario" })}>+ Novo usuário</BotaoPrimario>}
          />
          <section className={`rounded-2xl border border-black/[0.06] bg-white p-6 ${SOMBRA}`} aria-label="Lista de usuários">
            <div className="flex flex-wrap gap-3">
              <label className="sr-only" htmlFor="busca-usuarios">
                Buscar usuários
              </label>
              <input id="busca-usuarios" type="search" value={textoUsuario} onChange={(e) => setTextoUsuario(e.target.value)} placeholder="Buscar por nome ou e-mail…" className={`${CAMPO_FILTRO} min-w-[220px] flex-1`} />
              <select aria-label="Perfil de acesso" value={uPerfil} onChange={(e) => atualizar({ perfil: e.target.value || null })} className={CAMPO_FILTRO}>
                <option value="">Perfil: todos</option>
                {PERFIS.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.label}
                  </option>
                ))}
              </select>
              <select aria-label="Empresa" value={uEmpresa} onChange={(e) => atualizar({ empresa: e.target.value || null })} className={CAMPO_FILTRO}>
                <option value="">Empresa: todas</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>
              <select aria-label="Situação" value={uSit} onChange={(e) => atualizar({ situacao: e.target.value || null })} className={CAMPO_FILTRO}>
                <option value="">Situação: todas</option>
                {(Object.keys(SITUACAO) as Situacao[]).map((s) => (
                  <option key={s} value={s}>
                    {SITUACAO[s].label}
                  </option>
                ))}
              </select>
            </div>
            {filtrosUsuario && (
              <button type="button" onClick={limparUsuarios} className="mt-3 text-[13px] font-medium text-[#24476B] hover:underline">
                Limpar filtros
              </button>
            )}

            {erros.usuarios ? (
              <Falha oque="os usuários" />
            ) : usuariosFiltrados.length === 0 ? (
              <Vazio titulo="Nenhum usuário encontrado.">
                {filtrosUsuario && (
                  <button type="button" onClick={limparUsuarios} className="mt-3 rounded-xl border border-[#D5DAE0] bg-white px-4 py-2 text-sm font-medium text-[#20252B]">
                    Limpar filtros
                  </button>
                )}
              </Vazio>
            ) : (
              <>
                <table className="mt-5 hidden w-full text-left text-sm md:table">
                  <thead className="bg-[#F5F6F7] text-[13px] text-[#626B75]">
                    <tr>
                      <th className="rounded-l-lg px-4 py-2.5 font-medium">Usuário</th>
                      <th className="px-4 py-2.5 font-medium">Perfil de acesso</th>
                      <th className="px-4 py-2.5 font-medium">Empresa vinculada</th>
                      <th className="px-4 py-2.5 font-medium">Situação</th>
                      <th className="rounded-r-lg px-4 py-2.5 text-right font-medium">
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF0F2]">
                    {usuariosFiltrados.map((u) => (
                      <tr key={u.id} className="hover:bg-[#F7F9FB]">
                        <td className="px-4 py-3">
                          <NomeUsuario u={u} voce={u.id === usuarioAtualId} />
                        </td>
                        <td className="px-4 py-3 text-[#20252B]">{rotuloPerfil(u.papel)}</td>
                        <td className="px-4 py-3 text-[#20252B]">{u.parceiroId ? empresaPorId.get(u.parceiroId)?.nome ?? "—" : <span className="text-[#8A929B]">—</span>}</td>
                        <td className="px-4 py-3">
                          <SeloSituacao s={situacaoDe(u)} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <AcoesUsuario u={u} voce={u.id === usuarioAtualId} setPainel={setPainel} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <ul className="mt-4 space-y-3 md:hidden">
                  {usuariosFiltrados.map((u) => (
                    <li key={u.id} className="rounded-xl border border-[#E6E9ED] p-4">
                      <NomeUsuario u={u} voce={u.id === usuarioAtualId} />
                      <p className="mt-2 text-sm text-[#20252B]">
                        {rotuloPerfil(u.papel)}
                        {u.parceiroId && ` · ${empresaPorId.get(u.parceiroId)?.nome ?? "—"}`}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <SeloSituacao s={situacaoDe(u)} />
                        <AcoesUsuario u={u} voce={u.id === usuarioAtualId} setPainel={setPainel} />
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      )}

      {/* ── Empresas parceiras ── */}
      {aba === "empresas" && (
        <div className="space-y-6">
          <CabecalhoSecao
            tema="empresas"
            icone={Icones.empresas}
            titulo="Empresas parceiras"
            descricao="Gerencie parceiros da agência e empreiteiras."
            acao={<BotaoPrimario cor={TEMA.empresas.cor} onClick={() => setPainel({ tipo: "nova_empresa", tipoEmpresa: eTipo === "empreiteira" ? "empreiteira" : "agencia" })}>+ Nova empresa</BotaoPrimario>}
          />
          <section className={`rounded-2xl border border-black/[0.06] bg-white p-6 ${SOMBRA}`} aria-label="Lista de empresas">
            {erros.empresas ? (
              <Falha oque="as empresas" />
            ) : empresas.length === 0 ? (
              <Vazio titulo="Nenhuma empresa cadastrada.">
                <p className="mt-1 text-sm text-[#626B75]">Cadastre uma empresa para vincular usuários e configurar seu acesso.</p>
                <div className="mt-4">
                  <BotaoPrimario cor={TEMA.empresas.cor} onClick={() => setPainel({ tipo: "nova_empresa", tipoEmpresa: "agencia" })}>
                    + Nova empresa
                  </BotaoPrimario>
                </div>
              </Vazio>
            ) : (
              <>
                <div className="flex flex-wrap gap-3">
                  <label className="sr-only" htmlFor="busca-empresas">
                    Buscar empresas
                  </label>
                  <input id="busca-empresas" type="search" defaultValue={eq} onChange={(e) => atualizar({ eq: e.target.value || null })} placeholder="Buscar pelo nome…" className={`${CAMPO_FILTRO} min-w-[200px] flex-1`} />
                  <div role="tablist" aria-label="Tipo de empresa" className="inline-flex flex-wrap rounded-xl border border-[#D5DAE0] p-1">
                    {[
                      { id: "", label: "Todas" },
                      { id: "agencia", label: "Parceiros da agência" },
                      { id: "empreiteira", label: "Empreiteiras" },
                    ].map((f) => (
                      <button
                        key={f.id || "todas"}
                        type="button"
                        role="tab"
                        aria-selected={eTipo === f.id}
                        onClick={() => atualizar({ etipo: f.id || null })}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium tabular-nums transition ${eTipo === f.id ? "bg-[#665582] text-white" : "text-[#626B75] hover:text-[#20252B]"}`}
                      >
                        {f.label} <span className={eTipo === f.id ? "text-white/75" : "text-[#8A929B]"}>{f.id ? empresas.filter((e) => e.tipo === f.id).length : empresas.length}</span>
                      </button>
                    ))}
                  </div>
                  <select aria-label="Situação" value={eSit} onChange={(e) => atualizar({ esit: e.target.value || null })} className={CAMPO_FILTRO}>
                    <option value="">Situação: todas</option>
                    <option value="ativa">Ativas</option>
                    <option value="inativa">Inativas</option>
                  </select>
                </div>

                {empresasFiltradas.length === 0 ? (
                  <Vazio titulo="Nenhuma empresa encontrada.">
                    <button type="button" onClick={() => atualizar({ eq: null, etipo: null, esit: null })} className="mt-3 rounded-xl border border-[#D5DAE0] bg-white px-4 py-2 text-sm font-medium text-[#20252B]">
                      Limpar filtros
                    </button>
                  </Vazio>
                ) : (
                  <ul className="mt-5 divide-y divide-[#EEF0F2] md:divide-y-0">
                    <li className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_6rem_7rem_3rem] gap-3 rounded-lg bg-[#F5F6F7] px-4 py-2.5 text-[13px] font-medium text-[#626B75] md:grid">
                      <span>Empresa</span>
                      <span>Tipo</span>
                      <span>Link de indicação</span>
                      <span>Usuários</span>
                      <span>Situação</span>
                      <span className="sr-only">Ações</span>
                    </li>
                    {empresasFiltradas.map((e) => {
                      const n = usuariosPorEmpresa.get(e.id) ?? 0;
                      return (
                        <li key={e.id} className="grid grid-cols-1 gap-2 py-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_6rem_7rem_3rem] md:items-center md:gap-3 md:border-b md:border-[#EEF0F2] md:px-4">
                          <span className="font-semibold text-[#20252B]">{e.nome}</span>
                          <span>
                            <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-medium" style={e.tipo === "agencia" ? { color: "#665582", backgroundColor: "#F0EBF7" } : { color: "#28665D", backgroundColor: "#E6F2EF" }}>
                              {e.tipo === "agencia" ? "Parceiro da agência" : "Empreiteira"}
                            </span>
                          </span>
                          <span className="flex min-w-0 items-center gap-2">
                            {e.tipo === "agencia" ? (
                              <>
                                <code className="truncate text-[13px] text-[#626B75]" title={linkIndicacao(e.slug)}>
                                  ?parceiro={e.slug}
                                </code>
                                <Copiar texto={linkIndicacao(e.slug)} rotulo="Copiar link" rotuloAcessivel={`Copiar link de indicação de ${e.nome}`} />
                              </>
                            ) : (
                              <span className="text-[13px] text-[#8A929B]">Não se aplica</span>
                            )}
                          </span>
                          <span>
                            <button
                              type="button"
                              onClick={() => atualizar({ aba: null, empresa: e.id, q: null, perfil: null, situacao: null })}
                              className="text-sm font-medium tabular-nums text-[#24476B] hover:underline"
                              aria-label={`Ver ${n} ${n === 1 ? "usuário" : "usuários"} de ${e.nome}`}
                            >
                              {n} {n === 1 ? "usuário" : "usuários"}
                            </button>
                          </span>
                          <span>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-medium ${e.ativo ? "bg-[#E6F2EF] text-[#28665D]" : "bg-[#F1F3F5] text-[#59636F]"}`}>{e.ativo ? "Ativa" : "Inativa"}</span>
                          </span>
                          <span className="md:text-right">
                            <MenuAcoes
                              rotulo={`Ações de ${e.nome}`}
                              itens={[
                                { label: "Editar empresa", acao: () => setPainel({ tipo: "editar_empresa", empresa: e }) },
                                ...(e.tipo === "empreiteira" ? [{ label: "Vínculos de vagas", acao: () => atualizar({ aba: "vagas", emp: e.id }) }] : []),
                                { label: e.ativo ? "Desativar empresa" : "Reativar empresa", acao: () => setPainel({ tipo: "situacao_empresa", empresa: e }), perigo: e.ativo },
                              ]}
                            />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {/* ── Vínculos de vagas ── */}
      {aba === "vagas" && (
        <AbaVagas
          empreiteiras={empreiteiras}
          vagas={vagas}
          vinculos={vinculos}
          selecionada={empSelecionada}
          setSelecionada={(id) => atualizar({ emp: id })}
          busca={sp.get("vq") ?? ""}
          setBusca={(v) => atualizar({ vq: v || null })}
          filtro={sp.get("vf") ?? ""}
          setFiltro={(v) => atualizar({ vf: v || null })}
          erro={erros.vinculos || erros.empresas}
          onCadastrarEmpreiteira={() => setPainel({ tipo: "nova_empresa", tipoEmpresa: "empreiteira" })}
        />
      )}

      {/* Painéis */}
      {painel?.tipo === "novo_usuario" && <PainelUsuario empresas={empresas} onFechar={fechar} />}
      {painel?.tipo === "editar_usuario" && <PainelUsuario usuario={painel.usuario} empresas={empresas} onFechar={fechar} />}
      {painel?.tipo === "senha" && <PainelSenha usuario={painel.usuario} onFechar={fechar} />}
      {painel?.tipo === "nova_empresa" && <PainelEmpresa tipoInicial={painel.tipoEmpresa} slugsEmUso={empresas.map((e) => e.slug)} onFechar={fechar} />}
      {painel?.tipo === "editar_empresa" && <PainelEmpresa empresa={painel.empresa} slugsEmUso={empresas.map((e) => e.slug)} onFechar={fechar} />}
      {painel?.tipo === "situacao_empresa" && (
        <ConfirmarSituacaoEmpresa
          empresa={painel.empresa}
          usuariosVinculados={usuariosPorEmpresa.get(painel.empresa.id) ?? 0}
          vagasVinculadas={vagasPorEmpresa.get(painel.empresa.id) ?? 0}
          onFechar={fechar}
        />
      )}
    </div>
  );
}

function NomeUsuario({ u, voce }: { u: UsuarioAcesso; voce: boolean }) {
  return (
    <span className="block min-w-0">
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-[#20252B]">{u.nome || u.email.split("@")[0]}</span>
        {voce && <span className="rounded-full bg-[#EAF1F8] px-2 py-0.5 text-[12px] font-medium text-[#24476B]">Você</span>}
      </span>
      <span className="block break-all text-[13px] text-[#626B75]">{u.email}</span>
    </span>
  );
}

function SeloSituacao({ s }: { s: Situacao }) {
  const c = SITUACAO[s];
  return (
    <span className="inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-medium" style={{ color: c.cor, backgroundColor: c.fundo }}>
      {c.label}
    </span>
  );
}

function AcoesUsuario({ u, voce, setPainel }: { u: UsuarioAcesso; voce: boolean; setPainel: (p: PainelAberto) => void }) {
  // O próprio acesso não pode ser alterado aqui (regra do servidor) — evita
  // tirar o último administrador.
  if (voce) return <span className="text-[13px] text-[#8A929B]">Seu acesso não pode ser alterado aqui</span>;
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => setPainel({ tipo: "editar_usuario", usuario: u })}
        aria-label={`Editar acesso de ${u.nome || u.email}`}
        className="rounded-lg border border-[#D5DAE0] bg-white px-3 py-1.5 text-sm font-medium text-[#24476B] transition hover:border-[#24476B]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24476B]/30"
      >
        Editar acesso
      </button>
      <MenuAcoes rotulo={`Mais ações para ${u.nome || u.email}`} itens={[{ label: "Gerar nova senha", acao: () => setPainel({ tipo: "senha", usuario: u }) }]} />
    </span>
  );
}

function Falha({ oque }: { oque: string }) {
  return (
    <p role="alert" className="mt-5 rounded-xl border border-[#B42318]/20 bg-[#FDECEA] px-4 py-3 text-sm text-[#B42318]">
      Não foi possível carregar {oque}. Recarregue a página.
    </p>
  );
}

function Vazio({ titulo, children }: { titulo: string; children?: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-xl bg-[#F5F6F7] px-6 py-10 text-center">
      <p className="text-base font-semibold text-[#20252B]">{titulo}</p>
      {children}
    </div>
  );
}
