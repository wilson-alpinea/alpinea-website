import { PRODUTOS_PRINCIPAIS, PRODUTOS_SECUNDARIOS } from "@/lib/crm/produtos";
import type { Cliente } from "@/lib/crm/types";
import { PRODUTO_ICONS, PRODUTO_ICON_VARIANTE } from "./ProdutoIcons";
import { CANAIS } from "@/lib/crm/canal";
import { BotaoSalvar } from "./BotaoSalvar";

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
  // Padrão de /produtos (Wilson, 21/out/2026): card branco, ícone preto,
  // sem círculo em volta. Ícones brancos do site são invertidos; os que
  // já são escuros ficam como estão (o eSIM, colorido, vai para preto).
  const icone = PRODUTO_ICONS[value];
  const variante = PRODUTO_ICON_VARIANTE[value] ?? "escuro";
  const filtro = variante === "claro" ? "invert" : value === "esim" ? "brightness-0" : "";
  return (
    <label
      title={detalhe}
      className="group flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border border-black/10 bg-white p-3.5 text-center transition hover:border-black/30 has-[:checked]:border-black has-[:checked]:ring-1 has-[:checked]:ring-black"
    >
      <input type={type} name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      {icone && <img src={icone} alt="" className={`h-10 w-10 object-contain ${filtro}`} />}
      <span className="text-xs font-medium leading-tight text-black/70 transition peer-checked:font-semibold peer-checked:text-black">
        {label}
      </span>
    </label>
  );
}

export function ClienteForm({
  action,
  cliente,
  submitLabel,
  parceiros = [],
  consultorEmailPadrao,
}: {
  action: (formData: FormData) => void;
  cliente?: Cliente;
  submitLabel: string;
  // Empresas parceiras da agência (migração 021) — atribuição manual do lead.
  parceiros?: { id: string; nome: string; ativo: boolean }[];
  // Lead cadastrado à mão no CRM: origem padrão "Consultor" com o e-mail
  // de quem está cadastrando (Wilson, 21/out/2026).
  consultorEmailPadrao?: string;
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
          <label className={labelClass}>Canal de origem</label>
          <select name="canal" defaultValue={cliente?.canal ?? (cliente ? "" : "consultor")} className={inputClass}>
            {cliente && !cliente.canal && <option value="">Não identificado</option>}
            {CANAIS.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Detalhe da origem</label>
          <input
            type="text"
            name="canal_detalhe"
            defaultValue={cliente ? (cliente.canal_detalhe ?? "") : (consultorEmailPadrao ?? "")}
            className={inputClass}
            placeholder="E-mail do consultor, campanha, quem indicou…"
          />
        </div>

        <div>
          <label className={labelClass}>Parceiro que indicou</label>
          <select name="parceiro_id" defaultValue={cliente?.parceiro_id ?? ""} className={inputClass}>
            <option value="">Nenhum (lead direto)</option>
            {parceiros.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
                {p.ativo ? "" : " (inativo)"}
              </option>
            ))}
          </select>
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

        {/* O estágio (venda) e a etapa de entrega saíram deste formulário —
            pedido do Wilson, 19/set/2026: mudar de etapa agora sempre exige
            uma data e passa pelo EstagioSelect (funil de vendas e
            fluxograma de entrega, na ficha do cliente), nunca pelo "Salvar
            alterações" genérico. */}

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

      <BotaoSalvar
        rotulo={submitLabel}
        className="w-full rounded-xl bg-[#1C3A5E] px-4 py-3 text-sm font-medium text-white shadow-sm shadow-[#1C3A5E]/25 transition hover:bg-[#254a73] hover:shadow-md hover:shadow-[#1C3A5E]/30 sm:w-auto sm:px-8"
      />
    </form>
  );
}
