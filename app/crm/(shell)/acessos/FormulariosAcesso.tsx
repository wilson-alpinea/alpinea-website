"use client";

import { useActionState, useState, useTransition } from "react";
import {
  alterarAcessoUsuario,
  criarParceiro,
  criarUsuario,
  definirEmpreiteiraDaVaga,
  redefinirSenhaUsuario,
  type ResultadoAcesso,
} from "../../acessosActions";

export type ParceiroOpcao = { id: string; nome: string; tipo: "agencia" | "empreiteira"; ativo: boolean };

const campo = "mt-1 block w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#1C3A5E]";
const rotulo = "text-[11px] uppercase tracking-[0.12em] text-black/50";
const botao = "rounded-lg bg-[#1C3A5E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#254a73] disabled:opacity-50";

function Retorno({ estado }: { estado: ResultadoAcesso | null }) {
  if (!estado) return null;
  return (
    <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${estado.ok ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-700"}`}>
      <p>{estado.mensagem}</p>
      {estado.senha && (
        <p className="mt-1 break-all font-mono text-xs">
          {estado.email ? `E-mail: ${estado.email} · ` : ""}Senha: <strong>{estado.senha}</strong>
        </p>
      )}
    </div>
  );
}

export function NovoParceiroForm() {
  const [estado, acao, pendente] = useActionState(criarParceiro, null);
  return (
    <form action={acao}>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className={rotulo}>Nome da empresa</span>
          <input name="nome" required className={campo} placeholder="Ex.: Agência Sakura" />
        </label>
        <label className="block">
          <span className={rotulo}>Tipo</span>
          <select name="tipo" defaultValue="agencia" className={campo}>
            <option value="agencia">Parceiro da agência (leads)</option>
            <option value="empreiteira">Empreiteira (candidatos)</option>
          </select>
        </label>
        <label className="block">
          <span className={rotulo}>Código do link (opcional)</span>
          <input name="slug" className={campo} placeholder="gerado a partir do nome" />
        </label>
      </div>
      <button type="submit" disabled={pendente} className={`${botao} mt-3`}>
        {pendente ? "Salvando…" : "Cadastrar"}
      </button>
      <Retorno estado={estado} />
    </form>
  );
}

function CamposPapel({ parceiros, papelInicial = "parceiro_agencia", parceiroInicial = "" }: { parceiros: ParceiroOpcao[]; papelInicial?: string; parceiroInicial?: string }) {
  const [papel, setPapel] = useState(papelInicial);
  const tipo = papel === "parceiro_agencia" ? "agencia" : papel === "empreiteira" ? "empreiteira" : null;
  const opcoes = parceiros.filter((p) => p.tipo === tipo);
  return (
    <>
      <label className="block">
        <span className={rotulo}>Acesso</span>
        <select name="papel" value={papel} onChange={(e) => setPapel(e.target.value)} className={campo}>
          <option value="parceiro_agencia">Parceiro da agência — vê só os leads dele</option>
          <option value="empreiteira">Empreiteira — vê só os candidatos das vagas dela</option>
          <option value="admin">Admin (equipe) — vê tudo</option>
          <option value="sem_acesso">Sem acesso</option>
        </select>
      </label>
      {tipo && (
        <label className="block">
          <span className={rotulo}>{tipo === "agencia" ? "Parceiro" : "Empreiteira"}</span>
          <select name="parceiro_id" defaultValue={parceiroInicial} key={tipo} className={campo} required>
            <option value="">Escolha…</option>
            {opcoes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
                {p.ativo ? "" : " (inativo)"}
              </option>
            ))}
          </select>
        </label>
      )}
    </>
  );
}

export function NovoUsuarioForm({ parceiros }: { parceiros: ParceiroOpcao[] }) {
  const [estado, acao, pendente] = useActionState(criarUsuario, null);
  return (
    <form action={acao}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={rotulo}>E-mail de login</span>
          <input name="email" type="email" required className={campo} placeholder="pessoa@empresa.com" />
        </label>
        <label className="block">
          <span className={rotulo}>Nome</span>
          <input name="nome" className={campo} placeholder="Nome da pessoa" />
        </label>
        <CamposPapel parceiros={parceiros} />
      </div>
      <button type="submit" disabled={pendente} className={`${botao} mt-3`}>
        {pendente ? "Criando…" : "Criar usuário e gerar senha"}
      </button>
      <Retorno estado={estado} />
    </form>
  );
}

export function EditarUsuario({
  userId,
  papel,
  parceiroId,
  parceiros,
  ehVoce,
}: {
  userId: string;
  papel: string | null;
  parceiroId: string | null;
  parceiros: ParceiroOpcao[];
  ehVoce: boolean;
}) {
  const [estado, acao, pendente] = useActionState(alterarAcessoUsuario, null);
  const [estadoSenha, acaoSenha, pendenteSenha] = useActionState(redefinirSenhaUsuario, null);
  const [aberto, setAberto] = useState(false);
  if (ehVoce) return <span className="text-xs text-black/40">Você</span>;
  return (
    <div>
      <button type="button" onClick={() => setAberto((a) => !a)} className="text-xs text-[#1C3A5E] underline">
        {aberto ? "Fechar" : "Alterar"}
      </button>
      {aberto && (
        <div className="mt-2 rounded-lg border border-black/10 bg-[#FAF9F6] p-3">
          <form action={acao} className="grid gap-2">
            <input type="hidden" name="user_id" value={userId} />
            <CamposPapel parceiros={parceiros} papelInicial={papel ?? "sem_acesso"} parceiroInicial={parceiroId ?? ""} />
            <button type="submit" disabled={pendente} className={botao}>
              {pendente ? "Salvando…" : "Salvar acesso"}
            </button>
          </form>
          <Retorno estado={estado} />
          <form action={acaoSenha} className="mt-3 border-t border-black/10 pt-3">
            <input type="hidden" name="user_id" value={userId} />
            <button type="submit" disabled={pendenteSenha} className="text-xs text-black/60 underline">
              {pendenteSenha ? "Gerando…" : "Gerar nova senha"}
            </button>
          </form>
          <Retorno estado={estadoSenha} />
        </div>
      )}
    </div>
  );
}

export function VagaEmpreiteiraSelect({ vagaId, atual, empreiteiras }: { vagaId: string; atual: string | null; empreiteiras: ParceiroOpcao[] }) {
  const [valor, setValor] = useState(atual ?? "");
  const [erro, setErro] = useState(false);
  const [pendente, iniciar] = useTransition();
  return (
    <span className="flex items-center gap-2">
      <select
        value={valor}
        disabled={pendente}
        onChange={(e) => {
          const novo = e.target.value;
          const anterior = valor;
          setValor(novo);
          setErro(false);
          iniciar(async () => {
            const r = await definirEmpreiteiraDaVaga(vagaId, novo || null);
            if (!r.ok) {
              setValor(anterior);
              setErro(true);
            }
          });
        }}
        className="w-full min-w-0 rounded-lg border border-black/15 bg-white px-2 py-1.5 text-xs"
      >
        <option value="">— sem empreiteira —</option>
        {empreiteiras.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>
      {erro && <span className="text-xs text-red-600">erro</span>}
    </span>
  );
}
