import { ESTAGIOS } from "@/lib/crm/estagios";
import type { Cliente } from "@/lib/crm/types";

const TIERS = ["Alpinea Design", "Alpinea Executive", "Alpinea Private", "A definir"];
const ORIGENS = ["Instagram", "Google Ads", "Indicação", "Site", "WhatsApp", "Outro"];

const inputClass =
  "w-full rounded-xl border border-white/15 bg-black px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/40";
const labelClass = "mb-1.5 block text-xs uppercase tracking-[0.15em] text-white/40";

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
          <label className={labelClass}>Tier de serviço</label>
          <select name="tier" defaultValue={cliente?.tier ?? ""} className={inputClass}>
            <option value="">Selecionar…</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Destino / tipo de viagem</label>
          <input
            type="text"
            name="destino_interesse"
            defaultValue={cliente?.destino_interesse ?? ""}
            className={inputClass}
            placeholder="Ex.: Lua de mel — 14 dias, Tóquio e Kyoto"
          />
        </div>

        <div>
          <label className={labelClass}>Valor estimado (R$)</label>
          <input
            type="text"
            inputMode="decimal"
            name="valor_estimado"
            defaultValue={cliente?.valor_estimado ?? ""}
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
        className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 sm:w-auto sm:px-8"
      >
        {submitLabel}
      </button>
    </form>
  );
}
