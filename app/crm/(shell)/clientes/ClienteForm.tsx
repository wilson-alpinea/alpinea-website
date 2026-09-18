import { ESTAGIOS } from "@/lib/crm/estagios";
import { PRODUTOS_PRINCIPAIS, PRODUTOS_SECUNDARIOS } from "@/lib/crm/produtos";
import type { Cliente } from "@/lib/crm/types";
import { PRODUTO_ICONS, PRODUTO_ICON_VARIANTE } from "./ProdutoIcons";

const ORIGENS = [
  "Instagram",
  "Google Ads",
  "Indicação",
  "Site",
  "WhatsApp",
  "YouTube - TSJ",
  "YouTube - frttt",
  "Outro",
];

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm text-black placeholder-black/30 outline-none transition focus:border-[#1C3A5E] focus:ring-2 focus:ring-[#1C3A5E]/10";
const labelClass = "mb-1.5 block text-xs uppercase tracking-[0.15em] text-black/40";

function ProdutoCard({
  type,
  name,
  value,
  label,
  detalhe,
  defaultChecked,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  label: string;
  detalhe?: string;
  defaultChecked: boolean;
}) {
  // Pedido do Wilson, 18/set/2026: ícones agora são os mesmos arquivos
  // (PNG) usados em /produtos e /calculadora_reversa — ver ProdutoIcons.tsx.
  //
  // Pedido do Wilson, 18/set/2026 ("os icones estao da mesma cor do
  // fundo, sem contraste"): checado pixel a pixel — os ícones de
  // /produtos são BRANCOS puros (desenhados pra ficar sobre o fundo
  // escuro do site) e ficavam invisíveis sobre qualquer chip claro. A
  // correção não é opacidade, é o chip certo pra cada ícone: ícone branco
  // ("claro") ganha chip azul-marinho sólido — exatamente como aparece no
  // site —, ícone com tinta própria ("escuro") ganha chip claro. Ver
  // PRODUTO_ICON_VARIANTE em ProdutoIcons.tsx.
  const icone = PRODUTO_ICONS[value];
  const variante = PRODUTO_ICON_VARIANTE[value] ?? "escuro";
  const chipClaro =
    "bg-[#1C3A5E] shadow-[0_2px_8px_-3px_rgba(28,58,94,0.6)] peer-checked:bg-[#12283f]";
  const chipEscuro =
    "border border-black/8 bg-[#FAF9F6] peer-checked:border-[#1C3A5E]/25 peer-checked:bg-white";
  return (
    <label
      title={detalhe}
      className="group flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border border-black/8 bg-white p-3.5 text-center shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition has-[:checked]:border-[#1C3A5E] has-[:checked]:bg-[#1C3A5E]/[0.05] has-[:checked]:shadow-[0_4px_14px_-6px_rgba(28,58,94,0.35)] hover:border-black/20 hover:shadow-[0_4px_14px_-8px_rgba(0,0,0,0.15)]"
    >
      <input type={type} name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      {icone && (
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition ${variante === "claro" ? chipClaro : chipEscuro}`}
        >
          <img src={icone} alt="" className="h-7 w-7 object-contain" />
        </span>
      )}
      <span className="text-xs font-medium leading-tight text-black/70 transition peer-checked:font-semibold peer-checked:text-[#1C3A5E]">
        {label}
      </span>
    </label>
  );
}

export function ClienteForm({
  action,
  cliente,
  submitLabel,
  showEstagio = false,
}: {
  action: (formData: FormData) => void;
  cliente?: Cliente;
  submitLabel: string;
  showEstagio?: boolean;
}) {
  const secundariosAtuais = new Set(cliente?.produto_secundario ?? []);

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nome completo</label>
          <input
            type="text"
            name="nome"
            required
            defaultValue={cliente?.nome}
            className={inputClass}
            placeholder="Nome do cliente"
          />
        </div>

        <div>
          <label className={labelClass}>E-mail</label>
          <input
            type="email"
            name="email"
            defaultValue={cliente?.email ?? ""}
            className={inputClass}
            placeholder="cliente@email.com"
          />
        </div>

        <div>
          <label className={labelClass}>WhatsApp / Telefone</label>
          <input
            type="text"
            name="telefone"
            defaultValue={cliente?.telefone ?? ""}
            className={inputClass}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label className={labelClass}>Origem</label>
          <input
            list="origens"
            name="origem"
            defaultValue={cliente?.origem ?? ""}
            className={inputClass}
            placeholder="Como chegou até a Alpinea"
          />
          <datalist id="origens">
            {ORIGENS.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </div>

        <div>
          <label className={labelClass}>Data da viagem</label>
          <input
            type="date"
            name="data_viagem"
            defaultValue={cliente?.data_viagem ?? ""}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Valor da proposta (R$)</label>
          <input
            type="text"
            inputMode="decimal"
            name="valor_proposta"
            defaultValue={cliente?.valor_proposta ?? ""}
            className={inputClass}
            placeholder="0,00"
          />
        </div>

        {showEstagio && (
          <div>
            <label className={labelClass}>Estágio</label>
            <select
              name="estagio"
              defaultValue={cliente?.estagio ?? "novo_lead"}
              className={inputClass}
            >
              {ESTAGIOS.map((e) => (
                <option key={e.valor} value={e.valor}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className={labelClass}>Produto principal</label>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {PRODUTOS_PRINCIPAIS.map((p) => (
              <ProdutoCard
                key={p.valor}
                type="radio"
                name="produto_principal"
                value={p.valor}
                label={p.label}
                detalhe={p.detalhe}
                defaultChecked={cliente?.produto_principal === p.valor}
              />
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Produto secundário</label>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {PRODUTOS_SECUNDARIOS.map((p) => (
              <ProdutoCard
                key={p.valor}
                type="checkbox"
                name="produto_secundario"
                value={p.valor}
                label={p.label}
                defaultChecked={secundariosAtuais.has(p.valor)}
              />
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Observações</label>
          <textarea
            name="observacoes"
            defaultValue={cliente?.observacoes ?? ""}
            rows={4}
            className={inputClass}
            placeholder="Preferências, contexto, particularidades do atendimento…"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-[#1C3A5E] px-4 py-3 text-sm font-medium text-white shadow-sm shadow-[#1C3A5E]/25 transition hover:bg-[#254a73] hover:shadow-md hover:shadow-[#1C3A5E]/30 sm:w-auto sm:px-8"
      >
        {submitLabel}
      </button>
    </form>
  );
}
