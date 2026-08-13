import { CATEGORIAS_FORNECEDOR } from "@/lib/crm/fornecedores";
import type { Fornecedor } from "@/lib/crm/types";

const inputClass =
  "w-full rounded-xl border border-black/15 bg-white px-4 py-2.5 text-sm text-black placeholder-black/30 outline-none transition focus:border-black/40";
const labelClass = "mb-1.5 block text-xs uppercase tracking-[0.15em] text-black/40";

export function FornecedorForm({
  action,
  fornecedor,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  fornecedor?: Fornecedor;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nome</label>
          <input
            type="text"
            name="nome"
            required
            defaultValue={fornecedor?.nome}
            className={inputClass}
            placeholder="Nome do fornecedor"
          />
        </div>

        <div>
          <label className={labelClass}>Categoria</label>
          <select
            name="categoria"
            defaultValue={fornecedor?.categoria ?? ""}
            className={inputClass}
          >
            <option value="">Não informado</option>
            {CATEGORIAS_FORNECEDOR.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Cidade</label>
          <input
            type="text"
            name="cidade"
            defaultValue={fornecedor?.cidade ?? ""}
            className={inputClass}
            placeholder="Ex.: Tokyo, Kyoto…"
          />
        </div>

        <div>
          <label className={labelClass}>Pessoa de contato</label>
          <input
            type="text"
            name="contato_nome"
            defaultValue={fornecedor?.contato_nome ?? ""}
            className={inputClass}
            placeholder="Nome do contato"
          />
        </div>

        <div>
          <label className={labelClass}>Telefone</label>
          <input
            type="text"
            name="telefone"
            defaultValue={fornecedor?.telefone ?? ""}
            className={inputClass}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>E-mail</label>
          <input
            type="email"
            name="email"
            defaultValue={fornecedor?.email ?? ""}
            className={inputClass}
            placeholder="contato@fornecedor.com"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Observações</label>
          <textarea
            name="observacoes"
            defaultValue={fornecedor?.observacoes ?? ""}
            rows={4}
            className={inputClass}
            placeholder="Condições comerciais, contrato, particularidades…"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-[#1C3A5E] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#254a73] sm:w-auto sm:px-8"
      >
        {submitLabel}
      </button>
    </form>
  );
}
