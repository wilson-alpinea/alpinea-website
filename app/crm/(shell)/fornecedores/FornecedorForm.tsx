"use client";

import { useActionState, useEffect, useRef } from "react";
import { CATEGORIAS_FORNECEDOR } from "@/lib/crm/fornecedores";
import type { Fornecedor } from "@/lib/crm/types";
import { salvarFornecedor, type ResultadoFornecedor } from "../../fornecedoresActions";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, CAMPO, LABEL, Spinner } from "../clientes/[id]/financeiro/ui";

// Formulário único de fornecedor (painel lateral da lista, /novo e /[id]).
// Campos reais da tabela `fornecedores`; só o nome é obrigatório.
export function FornecedorForm({
  fornecedor,
  onSalvo,
  onCancelar,
}: {
  fornecedor?: Fornecedor;
  onSalvo?: (r: ResultadoFornecedor) => void;
  onCancelar?: () => void;
}) {
  const [estado, acao, pendente] = useActionState(salvarFornecedor, null);
  const avisado = useRef<ResultadoFornecedor | null>(null);
  useEffect(() => {
    if (estado?.ok && avisado.current !== estado) {
      avisado.current = estado;
      onSalvo?.(estado);
    }
  }, [estado, onSalvo]);

  const erro = (campo: string) =>
    estado && !estado.ok && estado.campo === campo ? (
      <p id={`erro-${campo}`} className="mt-1 text-[13px] text-[#B42318]">
        {estado.mensagem}
      </p>
    ) : null;
  const invalido = (campo: string) => ({
    "aria-invalid": !!(estado && !estado.ok && estado.campo === campo),
    "aria-describedby": estado && !estado.ok && estado.campo === campo ? `erro-${campo}` : undefined,
  });

  return (
    <form action={acao} className="space-y-6" noValidate>
      {fornecedor && <input type="hidden" name="id" value={fornecedor.id} />}
      {estado && !estado.ok && !estado.campo && (
        <p role="alert" className="rounded-lg border border-[#B42318]/20 bg-[#FDECEA] px-3 py-2 text-sm text-[#B42318]">
          {estado.mensagem}
        </p>
      )}
      {estado?.ok && !onSalvo && (
        <p role="status" className="rounded-lg border border-[#28665D]/20 bg-[#E6F2EF] px-3 py-2 text-sm text-[#1F4F48]">
          {estado.mensagem}
        </p>
      )}

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-semibold text-[#20252B]">Identificação</legend>
        <div>
          <label className={LABEL} htmlFor="f-nome">
            Nome do fornecedor
          </label>
          <input id="f-nome" name="nome" required defaultValue={fornecedor?.nome} className={CAMPO} placeholder="Empresa ou profissional" maxLength={160} {...invalido("nome")} />
          {erro("nome")}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="f-categoria">
              Categoria
            </label>
            <select id="f-categoria" name="categoria" defaultValue={fornecedor?.categoria ?? ""} className={CAMPO}>
              <option value="">Não informado</option>
              {CATEGORIAS_FORNECEDOR.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="f-contato">
              Pessoa de contato
            </label>
            <input id="f-contato" name="contato_nome" defaultValue={fornecedor?.contato_nome ?? ""} className={CAMPO} placeholder="Nome do contato" maxLength={160} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-semibold text-[#20252B]">Atendimento</legend>
        <div>
          <label className={LABEL} htmlFor="f-cidade">
            Cidade
          </label>
          <input id="f-cidade" name="cidade" defaultValue={fornecedor?.cidade ?? ""} className={CAMPO} placeholder="Ex.: Tokyo, Kyoto" maxLength={120} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-semibold text-[#20252B]">Contatos</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="f-telefone">
              Telefone
            </label>
            <input id="f-telefone" name="telefone" type="tel" defaultValue={fornecedor?.telefone ?? ""} className={CAMPO} placeholder="+81 90 1234 5678" maxLength={60} {...invalido("telefone")} />
            {erro("telefone") ?? <p className="mt-1 text-[13px] text-[#626B75]">Inclua o código do país quando não for do Brasil.</p>}
          </div>
          <div>
            <label className={LABEL} htmlFor="f-email">
              E-mail
            </label>
            <input id="f-email" name="email" type="email" defaultValue={fornecedor?.email ?? ""} className={CAMPO} placeholder="contato@fornecedor.com" maxLength={200} {...invalido("email")} />
            {erro("email")}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-1 text-base font-semibold text-[#20252B]">Informações adicionais</legend>
        <div>
          <label className={LABEL} htmlFor="f-obs">
            Observações
          </label>
          <textarea id="f-obs" name="observacoes" defaultValue={fornecedor?.observacoes ?? ""} rows={4} className={CAMPO} placeholder="Condições comerciais, contrato, idiomas, região atendida, particularidades…" />
        </div>
      </fieldset>

      <div className="sticky bottom-0 -mx-1 flex flex-wrap justify-end gap-2 border-t border-[#E4E7EB] bg-white px-1 pt-4">
        {onCancelar && (
          <button type="button" onClick={onCancelar} className={BOTAO_SECUNDARIO} disabled={pendente}>
            Cancelar
          </button>
        )}
        <button type="submit" className={BOTAO_PRIMARIO} disabled={pendente} aria-busy={pendente}>
          {pendente && <Spinner />}
          Salvar fornecedor
        </button>
      </div>
    </form>
  );
}
