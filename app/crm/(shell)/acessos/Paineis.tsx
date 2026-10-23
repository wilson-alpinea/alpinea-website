"use client";

import { useActionState, useState, useTransition } from "react";
import {
  alterarAcessoUsuario,
  alternarParceiroAtivo,
  criarParceiro,
  criarUsuario,
  editarParceiro,
  redefinirSenhaUsuario,
  type ResultadoAcesso,
} from "../../acessosActions";
import { BOTAO_PERIGO, BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, LABEL, Painel, Spinner } from "../clientes/[id]/financeiro/ui";
import type { EmpresaAcesso, UsuarioAcesso } from "./AcessosPagina";
import { Copiar, ERRO_CAMPO, Mensagem, PERFIS, rotuloPerfil } from "./comum";

const SLUG = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
export const linkIndicacao = (slug: string) => `https://www.alpinea.io/?parceiro=${slug}`;
export function slugDe(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

function ErroDoCampo({ estado, campo }: { estado: ResultadoAcesso | null; campo: string }) {
  if (!estado || estado.ok || estado.campo !== campo) return null;
  return (
    <p id={`erro-${campo}`} className={ERRO_CAMPO}>
      {estado.mensagem}
    </p>
  );
}
const erroGeral = (estado: ResultadoAcesso | null) => (estado && !estado.ok && !estado.campo ? estado.mensagem : null);

// ── Usuário: novo / editar acesso ────────────────────────────────
export function PainelUsuario({
  usuario,
  empresas,
  onFechar,
}: {
  usuario?: UsuarioAcesso; // presente = editar
  empresas: EmpresaAcesso[];
  onFechar: () => void;
}) {
  const editando = !!usuario;
  const [estado, acao, pendente] = useActionState(editando ? alterarAcessoUsuario : criarUsuario, null);
  const [papel, setPapel] = useState<string>(usuario ? usuario.papel ?? "sem_acesso" : "parceiro_agencia");
  const tipo = papel === "parceiro_agencia" ? "agencia" : papel === "empreiteira" ? "empreiteira" : null;
  const opcoes = empresas.filter((e) => e.tipo === tipo);
  const descricao = PERFIS.find((p) => p.valor === papel)?.descricao;
  const formId = editando ? "form-editar-usuario" : "form-novo-usuario";

  // Criado com sucesso: mostra a credencial só aqui, uma vez.
  if (!editando && estado?.ok && estado.senha) {
    return (
      <Painel titulo="Usuário criado" onFechar={onFechar} rodape={<button type="button" className={BOTAO_PRIMARIO} onClick={onFechar} data-foco>Concluir</button>}>
        <div className="space-y-4">
          <Mensagem ok>{estado.mensagem}</Mensagem>
          <dl className="space-y-3 rounded-xl border border-[#E6E9ED] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <dt className="text-[13px] font-medium text-[#626B75]">E-mail de login</dt>
                <dd className="break-all font-mono text-sm text-[#20252B]">{estado.email}</dd>
              </div>
              <Copiar texto={estado.email ?? ""} rotuloAcessivel="Copiar e-mail" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <dt className="text-[13px] font-medium text-[#626B75]">Senha temporária</dt>
                <dd className="break-all font-mono text-sm text-[#20252B]">{estado.senha}</dd>
              </div>
              <Copiar texto={estado.senha} rotuloAcessivel="Copiar senha" />
            </div>
          </dl>
          <p className="text-[13px] text-[#626B75]">Nenhum e-mail é enviado automaticamente. Repasse os dados à pessoa por um canal seguro.</p>
        </div>
      </Painel>
    );
  }

  return (
    <Painel
      titulo={editando ? "Editar acesso" : "Novo usuário"}
      subtitulo={editando ? usuario!.email : "A senha é gerada automaticamente ao criar."}
      onFechar={onFechar}
      rodape={
        <>
          <button type="button" className={BOTAO_SECUNDARIO} onClick={onFechar} disabled={pendente}>
            Cancelar
          </button>
          <button type="submit" form={formId} className={BOTAO_PRIMARIO} disabled={pendente} aria-busy={pendente}>
            {pendente && <Spinner />}
            {editando ? "Salvar alterações" : "Criar usuário"}
          </button>
        </>
      }
    >
      <form id={formId} action={acao} className="space-y-6" noValidate>
        {editando && <input type="hidden" name="user_id" value={usuario!.id} />}
        {estado?.ok && <Mensagem ok>{estado.mensagem}</Mensagem>}
        {erroGeral(estado) && <Mensagem ok={false}>{erroGeral(estado)}</Mensagem>}

        <fieldset className="space-y-4">
          <legend className="mb-1 text-base font-semibold text-[#20252B]">Identificação</legend>
          <div>
            <label className={LABEL} htmlFor="u-nome">
              Nome
            </label>
            <input id="u-nome" name="nome" defaultValue={usuario?.nome ?? ""} className={CAMPO} placeholder="Nome da pessoa" maxLength={120} />
          </div>
          <div>
            <label className={LABEL} htmlFor="u-email">
              E-mail de login
            </label>
            {editando ? (
              <p id="u-email" className="rounded-xl border border-[#E6E9ED] bg-[#F5F6F7] px-3.5 py-2.5 text-base text-[#626B75]">
                {usuario!.email}
              </p>
            ) : (
              <>
                <input
                  id="u-email"
                  name="email"
                  type="email"
                  required
                  className={CAMPO}
                  placeholder="pessoa@empresa.com"
                  aria-invalid={estado?.campo === "email"}
                  aria-describedby={estado?.campo === "email" ? "erro-email" : undefined}
                />
                <ErroDoCampo estado={estado} campo="email" />
              </>
            )}
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-1 text-base font-semibold text-[#20252B]">Permissões</legend>
          <div>
            <label className={LABEL} htmlFor="u-papel">
              Perfil de acesso
            </label>
            <select id="u-papel" name="papel" value={papel} onChange={(e) => setPapel(e.target.value)} className={CAMPO}>
              {PERFIS.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.label}
                </option>
              ))}
            </select>
            {descricao && <p className="mt-1.5 text-[13px] text-[#626B75]">{descricao}</p>}
            <ErroDoCampo estado={estado} campo="papel" />
          </div>
          {tipo && (
            <div>
              <label className={LABEL} htmlFor="u-empresa">
                {tipo === "agencia" ? "Parceiro da agência" : "Empreiteira"}
              </label>
              {opcoes.length === 0 ? (
                <p className="rounded-xl border border-[#946200]/20 bg-[#FFF4DB] px-3 py-2 text-sm text-[#6F4A00]">
                  Nenhuma {tipo === "agencia" ? "empresa parceira da agência" : "empreiteira"} cadastrada. Cadastre a empresa na aba “Empresas parceiras” antes de criar este acesso.
                </p>
              ) : (
                <select
                  id="u-empresa"
                  name="parceiro_id"
                  key={tipo}
                  defaultValue={usuario?.parceiroId && opcoes.some((o) => o.id === usuario.parceiroId) ? usuario.parceiroId : ""}
                  className={CAMPO}
                  required
                  aria-invalid={estado?.campo === "parceiro_id"}
                  aria-describedby={estado?.campo === "parceiro_id" ? "erro-parceiro_id" : undefined}
                >
                  <option value="">Escolha a empresa</option>
                  {opcoes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                      {p.ativo ? "" : " (inativa)"}
                    </option>
                  ))}
                </select>
              )}
              <ErroDoCampo estado={estado} campo="parceiro_id" />
            </div>
          )}
        </fieldset>
        <p className="text-[13px] text-[#626B75]">Usuários sem perfil atribuído permanecem sem acesso até serem liberados aqui.</p>
      </form>
    </Painel>
  );
}

// ── Nova senha (ação secundária do usuário) ──────────────────────
export function PainelSenha({ usuario, onFechar }: { usuario: UsuarioAcesso; onFechar: () => void }) {
  const [estado, acao, pendente] = useActionState(redefinirSenhaUsuario, null);
  return (
    <Painel
      titulo="Gerar nova senha"
      subtitulo={usuario.email}
      onFechar={onFechar}
      largura="max-w-md"
      rodape={
        estado?.ok ? (
          <button type="button" className={BOTAO_PRIMARIO} onClick={onFechar}>
            Concluir
          </button>
        ) : (
          <>
            <button type="button" className={BOTAO_SECUNDARIO} onClick={onFechar} disabled={pendente}>
              Cancelar
            </button>
            <button type="submit" form="form-senha" className={BOTAO_PRIMARIO} disabled={pendente}>
              {pendente && <Spinner />}
              Gerar nova senha
            </button>
          </>
        )
      }
    >
      <form id="form-senha" action={acao} className="space-y-4">
        <input type="hidden" name="user_id" value={usuario.id} />
        {estado?.ok && estado.senha ? (
          <>
            <Mensagem ok>{estado.mensagem}</Mensagem>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E6E9ED] p-4">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#626B75]">Nova senha</p>
                <p className="break-all font-mono text-sm text-[#20252B]">{estado.senha}</p>
              </div>
              <Copiar texto={estado.senha} rotuloAcessivel="Copiar senha" />
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-[#20252B]">A senha atual deixa de funcionar e uma nova é gerada. Ela aparece uma única vez, aqui.</p>
            {estado && !estado.ok && <Mensagem ok={false}>{estado.mensagem}</Mensagem>}
          </>
        )}
      </form>
    </Painel>
  );
}

// ── Empresa: nova / editar ───────────────────────────────────────
export function PainelEmpresa({
  empresa,
  tipoInicial = "agencia",
  slugsEmUso,
  onFechar,
}: {
  empresa?: EmpresaAcesso;
  tipoInicial?: "agencia" | "empreiteira";
  slugsEmUso: string[];
  onFechar: () => void;
}) {
  const editando = !!empresa;
  const [estado, acao, pendente] = useActionState(editando ? editarParceiro : criarParceiro, null);
  const [nome, setNome] = useState(empresa?.nome ?? "");
  const [tipo, setTipo] = useState<"agencia" | "empreiteira">(empresa?.tipo ?? tipoInicial);
  const [avancado, setAvancado] = useState(false);
  const [slugManual, setSlugManual] = useState(editando ? empresa!.slug : "");
  // Ao criar, o código acompanha o nome até ser personalizado. Ao editar, nunca muda sozinho.
  const slug = editando || avancado ? slugManual : slugDe(nome);
  const outros = slugsEmUso.filter((s) => s !== empresa?.slug);
  const slugInvalido = !!slug && !SLUG.test(slug);
  const slugDuplicado = !!slug && outros.includes(slug);
  const formId = "form-empresa";

  if (!editando && estado?.ok) {
    return (
      <Painel titulo="Empresa cadastrada" onFechar={onFechar} largura="max-w-md" rodape={<button type="button" className={BOTAO_PRIMARIO} onClick={onFechar} data-foco>Concluir</button>}>
        <Mensagem ok>{estado.mensagem}</Mensagem>
        <p className="mt-3 text-sm text-[#626B75]">Agora você pode criar usuários para essa empresa na aba Usuários{tipo === "empreiteira" ? " e vincular vagas na aba Vínculos de vagas" : ""}.</p>
      </Painel>
    );
  }

  return (
    <Painel
      titulo={editando ? "Editar empresa" : "Nova empresa"}
      onFechar={onFechar}
      rodape={
        <>
          <button type="button" className={BOTAO_SECUNDARIO} onClick={onFechar} disabled={pendente}>
            Cancelar
          </button>
          <button type="submit" form={formId} className={BOTAO_PRIMARIO} disabled={pendente || (tipo === "agencia" && (editando || avancado) && (slugInvalido || slugDuplicado))}>
            {pendente && <Spinner />}
            {editando ? "Salvar alterações" : "Cadastrar empresa"}
          </button>
        </>
      }
    >
      <form id={formId} action={acao} className="space-y-5" noValidate>
        {editando && <input type="hidden" name="id" value={empresa!.id} />}
        {estado?.ok && <Mensagem ok>{estado.mensagem}</Mensagem>}
        {erroGeral(estado) && <Mensagem ok={false}>{erroGeral(estado)}</Mensagem>}
        <div>
          <label className={LABEL} htmlFor="e-nome">
            Nome da empresa
          </label>
          <input id="e-nome" name="nome" required value={nome} onChange={(e) => setNome(e.target.value)} className={CAMPO} placeholder="Ex.: Agência Sakura" maxLength={120} aria-invalid={estado?.campo === "nome"} />
          <ErroDoCampo estado={estado} campo="nome" />
        </div>
        <fieldset>
          <legend className={LABEL}>Tipo</legend>
          {editando ? (
            <>
              <input type="hidden" name="tipo" value={tipo} />
              <p className="text-sm text-[#20252B]">{tipo === "agencia" ? "Parceiro da agência" : "Empreiteira"}</p>
              <p className="text-[13px] text-[#626B75]">O tipo não muda depois do cadastro, porque os usuários vinculados dependem dele.</p>
            </>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  { v: "agencia", t: "Parceiro da agência", d: "Gera leads pelo link de indicação." },
                  { v: "empreiteira", t: "Empreiteira", d: "Vê candidatos das vagas vinculadas." },
                ] as const
              ).map((o) => (
                <label key={o.v} className={`flex cursor-pointer gap-2.5 rounded-xl border p-3 transition ${tipo === o.v ? "border-[#665582] bg-[#F5F3FA] ring-1 ring-[#665582]" : "border-[#D5DAE0] bg-white"}`}>
                  <input type="radio" name="tipo" value={o.v} checked={tipo === o.v} onChange={() => setTipo(o.v)} className="mt-0.5 h-4 w-4 accent-[#665582]" />
                  <span>
                    <span className="block text-sm font-medium text-[#20252B]">{o.t}</span>
                    <span className="block text-[13px] font-normal text-[#626B75]">{o.d}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          <ErroDoCampo estado={estado} campo="tipo" />
        </fieldset>

        {tipo === "agencia" ? (
          <div className="space-y-3 rounded-xl border border-[#E6E9ED] p-4">
            <div>
              <p className={LABEL}>Link de indicação</p>
              {slug ? (
                <p className="break-all rounded-lg bg-[#F5F6F7] px-3 py-2 font-mono text-[13px] text-[#20252B]">{linkIndicacao(slug)}</p>
              ) : (
                <p className="text-[13px] text-[#626B75]">Digite o nome para gerar o código.</p>
              )}
              {!editando && !avancado && slug && outros.includes(slug) && (
                <p className="mt-1 text-[13px] text-[#626B75]">Esse código já existe: ao salvar, um sufixo curto é adicionado automaticamente.</p>
              )}
            </div>
            {editando || avancado ? (
              <div>
                <label className={LABEL} htmlFor="e-slug">
                  Código de indicação
                </label>
                <input
                  id="e-slug"
                  name="slug"
                  value={slugManual}
                  onChange={(e) => setSlugManual(e.target.value.toLowerCase())}
                  className={`${CAMPO} font-mono`}
                  aria-invalid={slugInvalido || slugDuplicado || estado?.campo === "slug"}
                  aria-describedby="e-slug-ajuda"
                />
                <p id="e-slug-ajuda" className={slugInvalido || slugDuplicado ? ERRO_CAMPO : "mt-1 text-[13px] text-[#626B75]"}>
                  {slugInvalido
                    ? "Use só letras minúsculas, números e hífen (sem acentos ou espaços), até 40 caracteres."
                    : slugDuplicado
                      ? "Esse código já está em uso por outra empresa."
                      : editando
                        ? "Mudar o código invalida o link antigo já divulgado. O nome pode mudar sem afetar o código."
                        : "Letras minúsculas, números e hífen."}
                </p>
                <ErroDoCampo estado={estado} campo="slug" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSlugManual(slugDe(nome));
                  setAvancado(true);
                }}
                className="text-sm font-medium text-[#665582] hover:underline"
              >
                Opções avançadas: personalizar código
              </button>
            )}
            <details className="text-[13px] text-[#626B75]">
              <summary className="cursor-pointer font-medium text-[#20252B]">Como funciona a indicação</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>O link funciona em qualquer página do site, por exemplo alpinea.io/produtos/jrpass?parceiro={slug || "codigo"}.</li>
                <li>O código fica guardado no navegador do cliente por 30 dias; quem se cadastrar nesse período entra como lead do parceiro.</li>
                <li>Leads também podem ser atribuídos ao parceiro manualmente, na ficha do cliente.</li>
                <li>Empresa desativada deixa de receber novos leads e seus usuários perdem o acesso; os leads já atribuídos continuam registrados.</li>
              </ul>
            </details>
          </div>
        ) : (
          !editando && <p className="text-[13px] text-[#626B75]">Empreiteiras não usam link de indicação. Depois de cadastrar, vincule as vagas na aba Vínculos de vagas.</p>
        )}
        {/* Empreiteira nova: o servidor ainda precisa de um código interno único. */}
        {!editando && tipo === "empreiteira" && <input type="hidden" name="slug" value="" />}
        {!editando && tipo === "agencia" && !avancado && <input type="hidden" name="slug" value="" />}
      </form>
    </Painel>
  );
}

// ── Desativar / reativar empresa (com efeitos concretos) ─────────
export function ConfirmarSituacaoEmpresa({
  empresa,
  usuariosVinculados,
  vagasVinculadas,
  onFechar,
}: {
  empresa: EmpresaAcesso;
  usuariosVinculados: number;
  vagasVinculadas: number;
  onFechar: () => void;
}) {
  const [resultado, setResultado] = useState<ResultadoAcesso | null>(null);
  const [pendente, iniciar] = useTransition();
  const desativar = empresa.ativo;
  return (
    <Painel
      titulo={desativar ? "Desativar empresa" : "Reativar empresa"}
      subtitulo={empresa.nome}
      onFechar={onFechar}
      largura="max-w-md"
      rodape={
        resultado?.ok ? (
          <button type="button" className={BOTAO_PRIMARIO} onClick={onFechar}>
            Concluir
          </button>
        ) : (
          <>
            <button type="button" className={BOTAO_SECUNDARIO} onClick={onFechar} disabled={pendente}>
              Cancelar
            </button>
            <button
              type="button"
              className={desativar ? BOTAO_PERIGO : BOTAO_PRIMARIO}
              disabled={pendente}
              onClick={() => iniciar(async () => setResultado(await alternarParceiroAtivo(empresa.id, !empresa.ativo)))}
            >
              {pendente && <Spinner />}
              {desativar ? "Desativar empresa" : "Reativar empresa"}
            </button>
          </>
        )
      }
    >
      {resultado ? (
        <Mensagem ok={resultado.ok}>{resultado.mensagem}</Mensagem>
      ) : (
        <div className="space-y-3 text-sm text-[#20252B]">
          <p>{desativar ? "Ao desativar:" : "Ao reativar:"}</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              {usuariosVinculados === 1
                ? `1 usuário vinculado ${desativar ? "perde" : "volta a ter"} o acesso ao CRM.`
                : `${usuariosVinculados} usuários vinculados ${desativar ? "perdem" : "voltam a ter"} o acesso ao CRM.`}
            </li>
            {empresa.tipo === "agencia" ? (
              <li>{desativar ? "O link de indicação deixa de atribuir novos leads (inclusive de quem já tinha o código salvo no navegador)." : "O link de indicação volta a atribuir novos leads."}</li>
            ) : (
              <li>
                {vagasVinculadas} {vagasVinculadas === 1 ? "vaga continua vinculada" : "vagas continuam vinculadas"}; {desativar ? "os candidatos deixam de ficar visíveis para a empresa." : "os candidatos voltam a ficar visíveis."}
              </li>
            )}
            <li>Nada é apagado: leads, candidatos, usuários e vínculos continuam registrados.</li>
          </ul>
          <p className="text-[13px] text-[#626B75]">Perfil atual dos usuários: {rotuloPerfil(empresa.tipo === "agencia" ? "parceiro_agencia" : "empreiteira")}.</p>
        </div>
      )}
    </Painel>
  );
}
