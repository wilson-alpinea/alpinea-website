import { NextResponse } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { LANDING_ECHIZEN, LANDING_IZUMO, type ConfigLanding } from "../../lib/landingsMurata";

export const runtime = "nodejs";

// Pré-candidatura curta das landing pages Murata (/empregos/izumo e
// /empregos/echizen) — Wilson, 07/out/2026. Sem currículo: grava em
// candidaturas_vagas (aparece no CRM de Empregos) com origem "landing" e
// avisa a equipe por e-mail. A análise de elegibilidade é feita pela equipe.

const LANDINGS: Record<string, ConfigLanding> = { izumo: LANDING_IZUMO, echizen: LANDING_ECHIZEN };

const ROTULOS: Record<string, Record<string, string>> = {
  reentry: { reentry: "Reentry válido", visto: "Tem visto", nao: "Não", sim: "Sim" },
  ondeEsta: { brasil: "No Brasil", japao: "No Japão" },
  composicao: { sozinho: "Sozinho(a)", casal: "Com cônjuge", familia: "Com família / filhos" },
  embarque: { imediato: "Imediatamente", "30-dias": "Em até 30 dias", "1-3-meses": "Em 1 a 3 meses", "mais-3-meses": "Mais de 3 meses" },
  jaMorouJapao: { sim: "Sim", nao: "Não" },
};

const texto = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escapar = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function notificarPorEmail(assunto: string, linhas: string[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY não configurada — pulando notificação por e-mail.");
    return;
  }
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Alpinea <contato@alpinea.io>",
        to: ["wilson@alpinea.io"],
        subject: assunto,
        text: linhas.join("\n"),
        html: `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6">${linhas.map((l) => `<p style="margin:0">${escapar(l)}</p>`).join("")}</div>`,
      }),
    });
    if (!resp.ok) console.error("Erro Resend (empregos-pre-candidatura):", await resp.text());
  } catch (err) {
    console.error("Erro ao notificar por e-mail (empregos-pre-candidatura):", err);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

    const config = LANDINGS[texto(body.landing, 20)];
    if (!config) return NextResponse.json({ error: "Vaga não encontrada." }, { status: 400 });

    const nomeCompleto = texto(body.nome, 120).replace(/\s+/g, " ");
    const partes = nomeCompleto.split(" ");
    const whatsapp = texto(body.whatsapp, 30);
    const digitos = whatsapp.replace(/\D/g, "");
    const idade = Number(body.idade);
    const cidade = texto(body.cidade, 80);
    const estado = texto(body.estado, 30);

    if (partes.length < 2 || digitos.length < 10 || !Number.isInteger(idade) || idade < 18 || idade > 80 || cidade.length < 2) {
      return NextResponse.json({ error: "Confira nome e sobrenome, WhatsApp com DDD, idade e cidade." }, { status: 400 });
    }

    const respostas = {
      origem: "landing",
      landing: config.slug,
      cidade,
      estado,
      jaMorouJapao: texto(body.jaMorouJapao, 10),
      reEntry: texto(body.reentry, 10),
      ondeEsta: texto(body.ondeEsta, 10),
      composicao: texto(body.composicao, 20),
      quandoEmbarcar: texto(body.embarque, 20),
    };

    const supabase = createAdminClient();
    const { error } = await supabase.from("candidaturas_vagas").insert({
      vaga_id: config.vagaId,
      vaga_titulo: config.vagaTitulo,
      vaga_empresa: "Murata",
      vaga_setor: "eletronicos",
      nome: partes[0],
      sobrenome: partes.slice(1).join(" "),
      email: "",
      telefone: whatsapp,
      idade,
      respostas,
      etapa: "curriculo",
      status: "novo",
      classificacao: "aprovado_baixo",
    });
    if (error) {
      console.error("Erro ao gravar pré-candidatura:", error);
      return NextResponse.json({ error: "Não foi possível registrar agora. Tente novamente ou fale pelo WhatsApp." }, { status: 500 });
    }

    const r = (campo: string, v: string) => ROTULOS[campo]?.[v] || v || "—";
    await notificarPorEmail(`[Pré-candidatura ${config.cidade}] ${nomeCompleto}`, [
      `Landing: /empregos/${config.slug} — ${config.fabrica}`,
      `Nome: ${nomeCompleto}`,
      `WhatsApp: ${whatsapp} (https://wa.me/${digitos.length <= 11 ? `55${digitos}` : digitos})`,
      `Idade: ${idade}`,
      `Cidade: ${cidade}${estado ? ` / ${estado}` : ""}`,
      `Já morou/trabalhou no Japão: ${r("jaMorouJapao", respostas.jaMorouJapao)}`,
      `Reentry/visto: ${r("reentry", respostas.reEntry)}`,
      ...(respostas.ondeEsta ? [`Onde está: ${r("ondeEsta", respostas.ondeEsta)}`] : []),
      `Vai: ${r("composicao", respostas.composicao)}`,
      `Embarque: ${r("embarque", respostas.quandoEmbarcar)}`,
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro na pré-candidatura:", err);
    return NextResponse.json({ error: "Erro interno. Tente novamente em instantes." }, { status: 500 });
  }
}
