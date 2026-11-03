"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PublicoKey, SetorKey, StatusVaga, Vaga } from "@/app/lib/vagasCatalogo";
import { restaurarVagaOriginal, salvarEdicaoVaga } from "../../../vagasEdicaoActions";
import { BOTAO_PRIMARIO, BOTAO_SECUNDARIO, Erro, Painel, Spinner } from "../../clientes/[id]/financeiro/ui";

// Edição da vaga pelo CRM (Wilson, 03/nov/2026). Salva só o que mudou em
// relação ao catálogo do código (migração 033) e o site atualiza na hora.
// Código AJ-xxxx, link e regras do funil (testes, custos cobertos,
// critérios de triagem) continuam no código.

const CAMPO = "w-full rounded-xl border border-[#DEE6E2] bg-white px-3.5 py-2.5 text-base text-[#202B28] outline-none focus:border-[#42658A] focus:ring-2 focus:ring-[#42658A]/25";
const SETORES: [SetorKey, string][] = [
  ["automotivo", "Automotivo"],
  ["eletronicos", "Eletrônicos"],
  ["alimenticio", "Alimentício"],
  ["materiais", "Materiais"],
];

type Form = {
  empresa: string;
  titulo: string;
  setor: SetorKey;
  cidade: string;
  regiao: string;
  publico: PublicoKey[];
  status: StatusVaga;
  publicadaEm: string;
  salario: string;
  turno: string;
  contrato: string;
  conducao: string;
  idioma: string;
  perfil: string;
  observacoes: string;
  moradia: string;
  beneficios: string;
  kitBoasVindas: string;
  bonus: string;
  diferenciaisHospedagem: string;
  sobreCidade: string;
};

const doVaga = (v: Vaga): Form => ({
  empresa: v.empresa,
  titulo: v.titulo,
  setor: v.setor,
  cidade: v.cidade,
  regiao: v.regiao,
  publico: v.publico,
  status: v.status,
  publicadaEm: v.publicadaEm,
  salario: v.salario,
  turno: v.turno,
  contrato: v.contrato,
  conducao: v.conducao ?? "",
  idioma: v.idioma ?? "",
  perfil: v.perfil ?? "",
  observacoes: v.observacoes ?? "",
  moradia: v.info.moradia ?? "",
  beneficios: v.info.beneficios.join("\n"),
  kitBoasVindas: v.info.kitBoasVindas ?? "",
  bonus: v.info.bonus ?? "",
  diferenciaisHospedagem: v.info.diferenciaisHospedagem.join("\n"),
  sobreCidade: v.info.sobreCidade ?? "",
});

const linhas = (t: string) => t.split("\n").map((l) => l.trim()).filter(Boolean);
const ouNulo = (t: string) => t.trim() || null;

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 border-t border-[#EEF2F0] pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-[#626E69]">{titulo}</legend>
      {children}
    </fieldset>
  );
}

function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#202B28]">{rotulo}</span>
      {children}
      {dica && <span className="mt-1 block text-[12px] text-[#8A9792]">{dica}</span>}
    </label>
  );
}

export default function EditarVaga({ vaga, editada, onFechar }: { vaga: Vaga; editada: boolean; onFechar: () => void }) {
  const router = useRouter();
  const [f, setF] = useState<Form>(() => doVaga(vaga));
  const [logo, setLogo] = useState<File | null>(null);
  const [removerLogo, setRemoverLogo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmarRestaurar, setConfirmarRestaurar] = useState(false);
  const [pendente, iniciar] = useTransition();
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const texto = (k: keyof Form) => ({ value: f[k] as string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k, e.target.value as never) });
  const previa = useMemo(() => (logo ? URL.createObjectURL(logo) : null), [logo]);
  useEffect(() => () => {
    if (previa) URL.revokeObjectURL(previa);
  }, [previa]);
  const logoAtual = removerLogo ? null : (previa ?? vaga.logo);

  function salvar() {
    setErro(null);
    const dados = {
      empresa: f.empresa,
      titulo: f.titulo,
      setor: f.setor,
      cidade: f.cidade,
      regiao: f.regiao,
      publico: f.publico,
      status: f.status,
      publicadaEm: f.publicadaEm,
      salario: f.salario,
      turno: f.turno,
      contrato: f.contrato,
      conducao: ouNulo(f.conducao),
      idioma: ouNulo(f.idioma),
      perfil: ouNulo(f.perfil),
      observacoes: ouNulo(f.observacoes),
      info: {
        moradia: ouNulo(f.moradia),
        beneficios: linhas(f.beneficios),
        kitBoasVindas: ouNulo(f.kitBoasVindas),
        bonus: ouNulo(f.bonus),
        diferenciaisHospedagem: linhas(f.diferenciaisHospedagem),
        sobreCidade: ouNulo(f.sobreCidade),
      },
    };
    const fd = new FormData();
    fd.set("dados", JSON.stringify(dados));
    if (logo) fd.set("logo", logo);
    if (removerLogo) fd.set("remover_logo", "1");
    iniciar(async () => {
      let r: Awaited<ReturnType<typeof salvarEdicaoVaga>>;
      try {
        r = await salvarEdicaoVaga(vaga.id, fd);
      } catch {
        r = { ok: false, erro: "Sem conexão com o servidor." };
      }
      if (!r.ok) return setErro(`${r.erro} Nada foi alterado.`);
      router.refresh();
      onFechar();
    });
  }

  function restaurar() {
    setErro(null);
    iniciar(async () => {
      const r = await restaurarVagaOriginal(vaga.id).catch(() => ({ ok: false as const, erro: "Sem conexão com o servidor." }));
      if (!r.ok) return setErro(r.erro);
      router.refresh();
      onFechar();
    });
  }

  return (
    <Painel
      titulo={`Editar vaga ${vaga.codigo}`}
      subtitulo="As alterações aparecem no site assim que você salvar."
      onFechar={onFechar}
      largura="max-w-2xl"
      rodape={
        <>
          {editada && !confirmarRestaurar && (
            <button type="button" className={`${BOTAO_SECUNDARIO} mr-auto`} disabled={pendente} onClick={() => setConfirmarRestaurar(true)}>
              Restaurar original
            </button>
          )}
          {confirmarRestaurar && (
            <span className="mr-auto flex flex-wrap items-center gap-2 text-[13px] text-[#202B28]">
              Desfazer todas as edições do CRM?
              <button type="button" className={BOTAO_SECUNDARIO} disabled={pendente} onClick={() => setConfirmarRestaurar(false)}>
                Não
              </button>
              <button type="button" className={BOTAO_PRIMARIO} disabled={pendente} onClick={restaurar}>
                Sim, restaurar
              </button>
            </span>
          )}
          <button type="button" className={BOTAO_SECUNDARIO} onClick={onFechar} disabled={pendente}>
            Cancelar
          </button>
          <button type="button" className={BOTAO_PRIMARIO} onClick={salvar} disabled={pendente}>
            {pendente && <Spinner />}
            Salvar
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <Erro>{erro}</Erro>

        <Grupo titulo="Empresa e logo">
          <Campo rotulo="Empresa">
            <input className={CAMPO} {...texto("empresa")} />
          </Campo>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-14 w-24 items-center justify-center rounded-lg bg-white p-2 ring-1 ring-black/10">
              {logoAtual ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoAtual} alt={`Logo ${f.empresa}`} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-[12px] text-[#8A9792]">Sem logo</span>
              )}
            </span>
            <label className={`${BOTAO_SECUNDARIO} cursor-pointer`}>
              {vaga.logo || logo ? "Trocar logo" : "Enviar logo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => {
                  setLogo(e.target.files?.[0] ?? null);
                  setRemoverLogo(false);
                }}
              />
            </label>
            {(vaga.logo || logo) && !removerLogo && (
              <button
                type="button"
                className="text-[13px] font-medium text-[#B42318] hover:underline"
                onClick={() => {
                  setLogo(null);
                  setRemoverLogo(true);
                }}
              >
                Remover logo
              </button>
            )}
            <span className="w-full text-[12px] text-[#8A9792]">PNG, JPG ou WebP até 2 MB. Fundo branco ou transparente.</span>
          </div>
        </Grupo>

        <Grupo titulo="Vaga">
          <Campo rotulo="Função">
            <input className={CAMPO} {...texto("titulo")} />
          </Campo>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo rotulo="Cidade">
              <input className={CAMPO} {...texto("cidade")} />
            </Campo>
            <Campo rotulo="Província">
              <input className={CAMPO} {...texto("regiao")} />
            </Campo>
            <Campo rotulo="Setor">
              <select className={CAMPO} value={f.setor} onChange={(e) => set("setor", e.target.value as SetorKey)}>
                {SETORES.map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Status">
              <select className={CAMPO} value={f.status} onChange={(e) => set("status", e.target.value as StatusVaga)}>
                <option value="aberta">Aberta</option>
                <option value="consulta">Sob consulta</option>
              </select>
            </Campo>
            <Campo rotulo="Data de publicação">
              <input type="date" className={CAMPO} {...texto("publicadaEm")} />
            </Campo>
            <div>
              <span className="mb-1 block text-sm font-medium text-[#202B28]">Público</span>
              <span className="flex gap-4 pt-2 text-sm text-[#202B28]">
                {(["brasil", "japao"] as PublicoKey[]).map((p) => (
                  <label key={p} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[#42658A]"
                      checked={f.publico.includes(p)}
                      onChange={(e) => set("publico", e.target.checked ? [...f.publico, p] : f.publico.filter((x) => x !== p))}
                    />
                    {p === "brasil" ? "Quem está no Brasil" : "Quem está no Japão"}
                  </label>
                ))}
              </span>
            </div>
          </div>
        </Grupo>

        <Grupo titulo="Condições">
          <Campo rotulo="Salário">
            <input className={CAMPO} {...texto("salario")} />
          </Campo>
          <Campo rotulo="Turno e escala">
            <textarea rows={2} className={CAMPO} {...texto("turno")} />
          </Campo>
          <Campo rotulo="Contrato">
            <input className={CAMPO} {...texto("contrato")} />
          </Campo>
          <Campo rotulo="Condução ao trabalho">
            <textarea rows={2} className={CAMPO} {...texto("conducao")} />
          </Campo>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo rotulo="Japonês">
              <input className={CAMPO} {...texto("idioma")} />
            </Campo>
            <Campo rotulo="Perfil">
              <input className={CAMPO} {...texto("perfil")} />
            </Campo>
          </div>
          <Campo rotulo="Observações">
            <textarea rows={4} className={CAMPO} {...texto("observacoes")} />
          </Campo>
        </Grupo>

        <Grupo titulo="Moradia e benefícios">
          <Campo rotulo="Moradia">
            <textarea rows={3} className={CAMPO} {...texto("moradia")} />
          </Campo>
          <Campo rotulo="Benefícios" dica="Um benefício por linha.">
            <textarea rows={5} className={CAMPO} {...texto("beneficios")} />
          </Campo>
          <Campo rotulo="Diferenciais da hospedagem" dica="Um item por linha.">
            <textarea rows={3} className={CAMPO} {...texto("diferenciaisHospedagem")} />
          </Campo>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo rotulo="Kit de boas-vindas">
              <textarea rows={2} className={CAMPO} {...texto("kitBoasVindas")} />
            </Campo>
            <Campo rotulo="Bônus">
              <textarea rows={2} className={CAMPO} {...texto("bonus")} />
            </Campo>
          </div>
          <Campo rotulo="Sobre a cidade">
            <textarea rows={3} className={CAMPO} {...texto("sobreCidade")} />
          </Campo>
          <p className="text-[12px] text-[#8A9792]">Campo vazio aparece no site como “A confirmar com a nossa equipe”.</p>
        </Grupo>
      </div>
    </Painel>
  );
}
