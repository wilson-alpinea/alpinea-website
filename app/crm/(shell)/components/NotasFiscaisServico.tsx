import { notasFiscaisDo, type OrigemNf } from "@/lib/crm/notasFiscais";
import { AnexarNf } from "./AnexarNf";

// Notas fiscais do serviço, na tela de detalhe (Wilson, 04/nov/2026).
// Aparece quando o serviço está concluído ou já tem NF anexada.
const fmt = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export async function NotasFiscaisServico({ origem, registroId, concluido }: { origem: OrigemNf; registroId: string; concluido: boolean }) {
  const nfs = await notasFiscaisDo(origem, registroId);
  if (!concluido && nfs.length === 0) return null;
  const pendente = concluido && nfs.length === 0;
  return (
    <section
      id="nota-fiscal"
      className={`mt-6 scroll-mt-28 rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-20px_rgba(0,0,0,0.15)] md:p-6 ${pendente ? "border-[#B42318]/30" : "border-black/[0.06]"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[#20252B]">Nota fiscal</h2>
          <p className="mt-0.5 text-[13px] text-[#626B75]">
            {pendente ? "Serviço concluído sem nota fiscal — o alerta fica nas notificações até a NF ser anexada." : "Notas fiscais anexadas a este serviço."}
          </p>
        </div>
        <AnexarNf origem={origem} registroId={registroId} rotulo={nfs.length ? "Anexar outra nota" : "Anexar nota fiscal"} />
      </div>
      {nfs.length > 0 && (
        <ul className="mt-4 divide-y divide-black/[0.05] text-sm">
          {nfs.map((n) => (
            <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <a href={`/crm/nota-fiscal?id=${n.id}`} target="_blank" rel="noopener noreferrer" className="font-medium text-[#24476B] hover:underline">
                {n.nome_arquivo}
              </a>
              <span className="text-[12px] text-[#626B75]">
                {fmt(n.created_at)}
                {n.created_by_email ? ` · ${n.created_by_email}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
