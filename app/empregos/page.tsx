"use client";

import { VAGAS, type Vaga, type PublicoKey, type SetorKey, type StatusVaga } from "../lib/vagasCatalogo";
import {
  PERGUNTAS_TRIAGEM,
  NIVEIS_JAPONES,
  NOTA_MINIMA_PROXIMA_ETAPA,
  type RespostasTriagem,
  type CriterioPontuacao,
  type NivelJapones,
} from "../lib/candidaturaScoring";
import { EXTENSOES_CURRICULO_ACEITAS } from "../lib/curriculoConstantes";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Página nova — pedido do Wilson, 16/set/2026 (colado de um e-mail que ele
// recebeu, com uma visão bem mais ampla do que só esta página: catálogo de
// vagas ao vivo, sistema de match, bot de WhatsApp pra qualificar leads,
// testes online). Alinhado com ele via AskUserQuestion antes de começar:
// construir agora a página completa (template visual de /produtos) com
// vagas GENÉRICAS de placeholder — o catálogo real, o motor de match, o
// bot de WhatsApp e os testes (visão, foto) ficam para uma fase seguinte,
// são sistemas à parte. Logos das empresas em texto por enquanto (Wilson
// ainda não tem os arquivos PNG/SVG à mão).
//
// 19/set/2026: Wilson passou os primeiros lotes de vagas reais — duas
// fontes diferentes:
// (a) Avance RH/Corporation: um comunicado com a lista de empresas
//     parceiras com vaga (com status "disponibilidade"/"sob consulta") +
//     fichas "PROPOSTA DE TRABALHO" individuais por empresa. O comunicado
//     foi atualizado por ele no mesmo dia (Daikin passou de disponível
//     para "sob consulta"; Fuji Seat passou de "sob consulta" para
//     disponível, mas só a unidade Higashiomi) — o código abaixo já
//     reflete a versão mais recente.
// (b) UT Suri-emu: fichas de contrato ("Sobre o Serviço/Salário/Turno…")
//     de empresas grandes já conhecidas do carrossel de clientes
//     corporativos mais abaixo (Subaru, Mitsubishi Fuso, Fuji Film, Sony,
//     Yokohama Gomu/Tyres) — sem indicação de status "sob consulta", então
//     tratadas como disponíveis. Essas fichas não trazem idioma exigido
//     nem perfil de idade/sexo, então esses dois campos ficaram opcionais
//     no tipo Vaga — o card só mostra a linha quando o dado existe.
//
// As vagas genéricas de placeholder foram substituídas pelas reais — ver
// VAGAS logo abaixo. Decisões confirmadas com o Wilson via AskUserQuestion:
// (1) mostrar o nome real da empresa no card (não só o tipo de fábrica);
// (2) trazer tanto vagas com "disponibilidade" (embarque imediato/futuro)
// quanto as "sob consulta" (processo de visto), cada uma com um selo de
// status — vagas "suspensas" (Sankyu, Akebono Brake, no comunicado antigo,
// nem citadas mais no atualizado) ficam de fora; (3) adicionar salário
// (¥/h) e perfil aceito (idade/sexo, quando disponível) no card, além do
// que já existia (setor, região, turno, contrato, idioma).
//
// Duas vagas do comunicado da Avance (Kousei Aluminum/Fukui e Shigeru
// Kougyo/Gunma) ficaram de fora deste lote por não termos a ficha
// detalhada (salário, horário) delas ainda — só o texto resumido do
// comunicado. A vaga da Fuji Seat em Omihachiman também ficou de fora
// porque o comunicado atualizado só lista a unidade Higashiomi como
// disponível — perguntar ao Wilson se Omihachiman deve voltar ao
// catálogo.
//
// 19/set/2026 (terceiro lote, mesmo dia): mais fichas UT Suri-emu
// (Mitsubishi Denki, Daihatsu, Fruehauf, GS Yuasa) + o primeiro lote da
// Fujiarte Co. Ltd. ("Condições de Contrato" — Inoac e Futaba Sangyou,
// duas unidades cada). Duas fichas eram vagas já cadastradas (Daikin
// Kusatsu e Yokohama Gomu Shinshiro, mesmos dados) — não duplicadas.
// Daihatsu tem critério médico/físico detalhado na ficha (altura, IMC,
// visão, uma lista de condições de saúde); no card ficou só "avaliação
// médica e física admissional", sem listar as condições — não é
// informação que deveria ir num card público. Inoac e Futaba: o
// comunicado do Wilson (1/abr/2026) diz que, pra casal com filho menor de
// idade, a vaga só é garantida para o marido e não há suporte (passagem)
// para a família — isso é informação real de elegibilidade, então entrou
// no campo perfil, mas de forma direta e sem valor de julgamento.
//
// 19/set/2026 (quarto lote, mesmo dia): mais fichas UT Suri-emu (Fuji Film
// Kanagawa/Ashigara — unidade diferente da de Miyagi já cadastrada, Hino
// Jidosha em Gunma e em Tokyo, Kitz, Panasonic). Cinco fichas eram vagas já
// cadastradas com os mesmos dados (Mitsubishi Fuso Toyama, Yokohama Gomu
// Shinshiro, Subaru Oizumi, Subaru Ota, Fruehauf Kanagawa) — não
// duplicadas. A ficha da Kitz traz salário-base diferente por gênero
// (mulher/homem) — mantive os dois valores no card tal como consta no
// contrato, é informação real de remuneração, não uma escolha editorial.
const WHATSAPP_NUMBER = "5511930300101";

function linkWhatsapp(mensagem: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}

// ── Os 2 tipos de serviço (público-alvo). Fotos adicionadas 19/set/2026 a
// pedido do Wilson, que mandou as duas imagens + um print de referência
// mostrando o layout desejado (foto no topo do card, texto embaixo). ──
const PUBLICOS: { key: PublicoKey; nome: string; descricao: string; cta: string; imagem: string }[] = [
  {
    key: "brasil",
    nome: "Emprego no Japão para quem está no Brasil",
    descricao:
      "Você está no Brasil e quer um emprego formal no Japão, com contrato, moradia e todo o processo de mudança organizado do início ao fim.",
    cta: "Ver vagas para quem vem do Brasil",
    imagem: "/images/empregos-publico-brasil.jpg",
  },
  {
    key: "japao",
    nome: "Troca de emprego para quem já está no Japão",
    descricao:
      "Você já mora e trabalha no Japão e quer uma vaga melhor — mais perto de casa, com salário maior ou em outro setor.",
    cta: "Ver vagas para quem já está no Japão",
    imagem: "/images/empregos-publico-japao.jpg",
  },
];

// ── Setores. "materiais" adicionado em 19/set/2026 junto com o primeiro
// lote de vagas reais — cobre fábricas de vidro, borracha e afins que não
// se encaixam nos outros 3 setores (ex.: Nitto Boseki, fibra de vidro). ──
const SETORES: { key: SetorKey; nome: string; descricao: string }[] = [
  {
    key: "automotivo",
    nome: "Automobilístico",
    descricao: "Linhas de montagem, componentes e logística para montadoras e fornecedoras do setor automotivo.",
  },
  {
    key: "eletronicos",
    nome: "Componentes Eletrônicos",
    descricao: "Fabricação, montagem e controle de qualidade de componentes eletrônicos e semicondutores.",
  },
  {
    key: "alimenticio",
    nome: "Alimentício",
    descricao: "Produção, embalagem e logística em fábricas de alimentos e bebidas.",
  },
  {
    key: "materiais",
    nome: "Materiais Industriais",
    descricao: "Produção de peças e materiais industriais — vidro, borracha, plástico e afins.",
  },
];

// Ícones novos para eletrônicos, alimentício e materiais — pedido do
// Wilson, 19/set/2026 ("novos icones para setores"), enviados como PNG
// (chip, garfo+colher cruzados, caixa 3D). Automobilístico não veio com
// ícone novo, então continua com o SVG desenhado à mão. Os PNGs entram via
// CSS mask (currentColor como cor de fundo, a imagem como máscara) em vez
// de <img>, pra manter o mesmo comportamento de herdar a cor azul da
// marca que os ícones em SVG já tinham — uma imagem <img> comum não
// consegue ser recolorida assim.
const ICONE_SETOR_IMG: Partial<Record<SetorKey, string>> = {
  automotivo: "/images/icon-setor-automotivo.png",
  eletronicos: "/images/icon-setor-eletronicos.png",
  alimenticio: "/images/icon-setor-alimenticio.png",
  materiais: "/images/icon-setor-materiais.png",
};

// Ícone de Automotivo (engrenagem + pistão) enviado pelo Wilson em 19/set/2026
// pra completar o conjunto — antes era o único setor ainda com SVG inline
// (um carrinho), enquanto os outros 3 já usavam a arte PNG nova dele.
function IconSetor({ setor, className }: { setor: SetorKey; className?: string }) {
  const src = ICONE_SETOR_IMG[setor];
  return (
    <span
      aria-hidden
      className={className}
      style={{
        display: "inline-block",
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

// ── Vagas reais — primeiro lote, 19/set/2026 (ver comentário no topo do
// arquivo). status "consulta" = "embarque sob consulta" (processo de
// visto, ainda não é vaga com data de embarque confirmada); "aberta" =
// vaga com disponibilidade — embarque imediato ou futuro já confirmado.
// idioma e perfil ficam de fora do objeto quando a fonte não trouxe esse
// dado (fichas UT Suri-emu não têm essas duas informações). logo é
// opcional (pedido do Wilson, 19/set/2026) — só entra quando ele manda o
// arquivo da empresa; até lá o card mostra só o nome em texto.
//
// conducao/observacoes/fonteContrato — pedido do Wilson, 19/set/2026: "ao
// clicar na vaga deve expandir os campos de detalhes que enviei
// anteriormente". As fichas UT Suri-emu trazem um bloco de condições quase
// idêntico em todas (moradia, seguro social, exame médico, financiamento
// de passagem) — isso virou o bloco fixo CONDICOES_UT_SURIEMU abaixo, pra
// não repetir o mesmo texto em cada vaga. Só entram em fonteContrato as
// vagas cuja ficha eu de fato reli com esse bloco completo — não é
// fabricado pras demais, que mostram só um convite pra falar no WhatsApp. ──
// Bloco de condições padrão que se repete, com o mesmo texto, em toda
// ficha "UT Suri-emu" já relida (moradia, seguro social/shakai hoken,
// exame médico admissional/anual, financiamento de passagem aérea).
const CONDICOES_UT_SURIEMU = {
  moradia:
    "Aluguel integral (aprox. 60 a 70% do valor do imóvel) + água, luz, gás e taxa da Associação Comunitária. Kit de futon fornecido pela empresa (cerca de ¥15.000, descontado no 1º pagamento).",
  seguro:
    "Desconto de aproximadamente 14% do salário bruto a partir do 1º mês (saúde com cobertura de 70%, aposentadoria, seguro-desemprego). Percentual pode variar conforme a legislação japonesa.",
  exameMedico:
    "Admissional e anual, gratuitos. Se for detectada alguma doença que impossibilite o serviço, a admissão pode não ser aprovada — não omitir informação na entrevista.",
  financiamentoPassagem:
    "Passagem aérea financiada pela empresa, com desconto a partir do 2º pagamento (parcelas de até ¥50 mil por mês).",
};

// Corpo de detalhes de uma vaga — condução, moradia, seguro social, exame
// médico e financiamento de passagem, quando a ficha original tem esse
// bloco (CONDICOES_UT_SURIEMU). Pras demais vagas, mostra só o convite pro
// WhatsApp em vez de inventar dado que a fonte não trouxe. Usado dentro do
// pop-up de detalhes (ver Modal de vaga, 19/set/2026).
function DetalhesVaga({ vaga }: { vaga: Vaga }) {
  const temDetalhe = Boolean(vaga.conducao || vaga.observacoes || vaga.fonteContrato);
  return (
    <div className="space-y-2.5 text-[13px] leading-6 text-black/60">
      {vaga.conducao && (
        <p>
          <span className="font-semibold text-black/75">Condução ao trabalho: </span>
          {vaga.conducao}
        </p>
      )}
      {(vaga.fonteContrato === "ut-suriemu" || vaga.observacoes) && (
        <p>
          <span className="font-semibold text-black/75">Moradia: </span>
          {vaga.fonteContrato === "ut-suriemu" ? CONDICOES_UT_SURIEMU.moradia : ""}
          {vaga.observacoes && ` ${vaga.observacoes}`}
        </p>
      )}
      {vaga.fonteContrato === "ut-suriemu" && (
        <>
          <p>
            <span className="font-semibold text-black/75">Seguro social (shakai hoken): </span>
            {CONDICOES_UT_SURIEMU.seguro}
          </p>
          <p>
            <span className="font-semibold text-black/75">Exame médico: </span>
            {CONDICOES_UT_SURIEMU.exameMedico}
          </p>
          <p>
            <span className="font-semibold text-black/75">Passagem aérea: </span>
            {CONDICOES_UT_SURIEMU.financiamentoPassagem}
          </p>
        </>
      )}
      {!temDetalhe && <p>Moradia, documentos e demais condições dessa vaga — fale com a gente pelo WhatsApp.</p>}
    </div>
  );
}


// ── Análise da vaga (pop-up) — pedido do Wilson, 19/set/2026: comparar
// salário e benefícios documentados de cada vaga contra o resto do
// catálogo. Tudo calculado a partir do próprio array VAGAS (nunca número
// inventado) — se um dia o texto de salário mudar de formato, o pior caso
// é a vaga simplesmente não entrar na comparação (retorna null), nunca um
// número errado.

// Extrai o valor-base em ¥/hora do texto livre de `salario`, ignorando
// bônus/extra/noturno/reajustes futuros (que sempre aparecem entre
// parênteses, ou depois de "até" fora de parênteses — ex.: "¥1.400/hora,
// com reajuste semestral... até ¥1.500/hora"). Quando há dois valores-base
// (ex.: salário diferente por gênero na ficha da Kitz), usa a média dos
// dois como valor representativo da vaga.
function salarioBaseHora(salario: string): number | null {
  const semParenteses = salario.replace(/\([^)]*\)/g, "");
  const regex = /¥([\d.]+)(?:[–-]¥?([\d.]+))?\s*\/\s*hora/gi;
  const valores: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(semParenteses))) {
    const antes = semParenteses.slice(Math.max(0, m.index - 15), m.index).toLowerCase();
    if (antes.includes("até") || antes.includes("ate ")) continue;
    const a = parseFloat(m[1].replace(/\./g, ""));
    const b = m[2] ? parseFloat(m[2].replace(/\./g, "")) : null;
    valores.push(b !== null ? (a + b) / 2 : a);
  }
  if (valores.length === 0) return null;
  return valores.reduce((soma, v) => soma + v, 0) / valores.length;
}

// Quantos "blocos" de benefício a ficha documenta (0 a 5): condução ao
// trabalho, moradia, e — só nas fichas UT Suri-emu, que sempre trazem o
// mesmo bloco fixo (CONDICOES_UT_SURIEMU) — seguro social, exame médico e
// passagem aérea juntos.
function contarBeneficiosDocumentados(vaga: Vaga): number {
  let n = 0;
  if (vaga.conducao) n += 1;
  if (vaga.fonteContrato === "ut-suriemu" || vaga.observacoes) n += 1;
  if (vaga.fonteContrato === "ut-suriemu") n += 3;
  return n;
}

const SALARIO_POR_SETOR: Partial<Record<SetorKey, { media: number; contagem: number }>> = (() => {
  const somas: Partial<Record<SetorKey, { soma: number; contagem: number }>> = {};
  for (const vaga of VAGAS) {
    const base = salarioBaseHora(vaga.salario);
    if (base === null) continue;
    const atual = somas[vaga.setor] ?? { soma: 0, contagem: 0 };
    atual.soma += base;
    atual.contagem += 1;
    somas[vaga.setor] = atual;
  }
  const resultado: Partial<Record<SetorKey, { media: number; contagem: number }>> = {};
  (Object.keys(somas) as SetorKey[]).forEach((setor) => {
    const { soma, contagem } = somas[setor]!;
    resultado[setor] = { media: soma / contagem, contagem };
  });
  return resultado;
})();

const BENEFICIOS_MEDIA_CATALOGO = VAGAS.reduce((soma, v) => soma + contarBeneficiosDocumentados(v), 0) / VAGAS.length;

function SetaComparativa({ positivo }: { positivo: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${positivo ? "text-emerald-600" : "text-amber-600"}`}
    >
      {positivo ? <path d="M12 19V5M5 12l7-7 7 7" /> : <path d="M12 5v14M5 12l7 7 7-7" />}
    </svg>
  );
}

// Só mostra uma comparação salarial quando há pelo menos 3 outras vagas do
// mesmo setor com salário legível, pra não tirar conclusão de amostra
// pequena — e só quando a diferença é grande o bastante (5%+) pra valer a
// pena mostrar.
function AnaliseVaga({ vaga }: { vaga: Vaga }) {
  const baseVaga = salarioBaseHora(vaga.salario);
  const statSetor = SALARIO_POR_SETOR[vaga.setor];
  const podeCompararSalario = baseVaga !== null && !!statSetor && statSetor.contagem >= 3;
  const diffPercentual = podeCompararSalario ? Math.round(((baseVaga! - statSetor!.media) / statSetor!.media) * 100) : null;
  const mostraSalario = diffPercentual !== null && Math.abs(diffPercentual) >= 5;

  const beneficios = contarBeneficiosDocumentados(vaga);
  const diffBeneficios = beneficios - BENEFICIOS_MEDIA_CATALOGO;
  const mostraBeneficios = Math.abs(diffBeneficios) >= 1;

  if (!mostraSalario && !mostraBeneficios) return null;

  return (
    <div className="rounded-xl border border-[#2f80c9]/15 bg-[#2f80c9]/[0.04] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#2f80c9]">Análise da vaga</p>
      <div className="mt-2.5 space-y-2">
        {mostraSalario && (
          <div className="flex items-start gap-2">
            <SetaComparativa positivo={diffPercentual! > 0} />
            <p className="text-xs leading-5 text-black/65">
              Salário {diffPercentual! > 0 ? `${diffPercentual}% acima` : `${Math.abs(diffPercentual!)}% abaixo`} da
              média de vagas de {SETOR_NOME[vaga.setor]} no catálogo (¥{Math.round(statSetor!.media).toLocaleString("pt-BR")}
              /hora em média, {statSetor!.contagem} vagas comparadas).
            </p>
          </div>
        )}
        {mostraBeneficios && (
          <div className="flex items-start gap-2">
            <SetaComparativa positivo={diffBeneficios > 0} />
            <p className="text-xs leading-5 text-black/65">
              {diffBeneficios > 0
                ? "Documenta mais detalhes de moradia, condução e benefícios do que a média das vagas do catálogo."
                : "Documenta menos detalhes de moradia, condução e benefícios do que a média das vagas do catálogo — pergunte pelo WhatsApp."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Regiões do filtro — derivadas das próprias vagas cadastradas, em vez de
// uma lista mantida à parte, pra crescer automaticamente conforme o
// Wilson for mandando mais fichas.
const REGIOES = Array.from(new Set(VAGAS.map((v) => v.regiao))).sort((a, b) => a.localeCompare(b, "pt-BR"));

const SETOR_NOME: Record<SetorKey, string> = {
  automotivo: "Automobilístico",
  eletronicos: "Componentes Eletrônicos",
  alimenticio: "Alimentício",
  materiais: "Materiais Industriais",
};

const STATUS_LABEL: Record<StatusVaga, string> = {
  aberta: "Embarque imediato/futuro",
  consulta: "Sob consulta",
};

// ── Jornada do cliente — 5 etapas, conteúdo do e-mail do Wilson,
// 16/set/2026 (processo real de hoje; o que muda com o tempo é só o quanto
// disso fica automatizado por trás — catálogo ao vivo, match automático,
// bot de WhatsApp). ──
const JORNADA = [
  {
    numero: "01",
    titulo: "Escolha as vagas",
    texto:
      "Veja todas as vagas abertas dentro do site, filtre por região e por setor, e monte sua lista com quantas vagas quiser — como um carrinho de compras.",
  },
  {
    numero: "02",
    titulo: "Candidatura e match",
    texto:
      "Você faz um cadastro inicial. Comparamos seu perfil com o que cada empresa procura — se o match for positivo, você recebe a ficha específica daquela vaga (definida pela própria empresa) para preencher.",
  },
  {
    numero: "03",
    titulo: "Testes",
    texto:
      "Etapas como teste de visão online e checagem de foto, para confirmar que você está dentro do padrão exigido pela empresa antes da entrevista.",
  },
  {
    numero: "04",
    titulo: "Entrevista por WhatsApp",
    texto: "Nosso time entra em contato direto com você pelo WhatsApp, passando todos os detalhes da entrevista.",
  },
  {
    numero: "05",
    titulo: "Passagem, visto e documentação",
    texto:
      "Damos suporte completo em passagem, visto e toda a documentação necessária, até o seu primeiro dia no novo emprego no Japão.",
  },
];

const DIFERENCIAIS = [
  {
    titulo: "+12 anos de presença no Japão",
    texto: "Mais de uma década de operação própria no Japão, com equipe local e experiência real com o mercado de trabalho japonês.",
  },
  {
    titulo: "Rede direta com fábricas e fornecedoras",
    texto: "Relacionamento direto com empresas dos setores automotivo, eletrônico e alimentício — sem intermediários entre você e a vaga.",
  },
  {
    titulo: "Processo cuidadoso, do match à mudança",
    texto: "Acompanhamos cada etapa: candidatura, match com a empresa, testes, entrevista, passagem, visto e documentação.",
  },
  {
    titulo: "Atendimento em português, do Brasil ao Japão",
    texto: "Suporte em português por WhatsApp durante toda a jornada, antes e depois da sua chegada ao Japão.",
  },
];

// ── Logos. Pedido do Wilson, 17/set/2026: "na pagina de empregos, vamos
// adicionar os logos que estao indicados no rodapé da pagina" — enviou os
// 4 arquivos das empresas parceiras (Fujiarte, Avance Authent, Brexa, UT
// Sumi-emu) e os 9 logos dos clientes corporativos, todos enviados em
// 17/set/2026 (a Fujifilm veio por último — um print 3840×2160 recortado e
// com o fundo branco tornado transparente aqui). Duplicado 2x dentro do
// componente Marquee pra criar o loop infinito sem buraco no CSS. ──
type ItemMarquee = { nome: string; logo?: string };

const EMPRESAS_PARCEIRAS: ItemMarquee[] = [
  { nome: "Fujiarte", logo: "/images/logo-parceiro-fujiarte.png" },
  { nome: "Avance Authent", logo: "/images/logo-parceiro-authent.png" },
  { nome: "Brexa", logo: "/images/logo-parceiro-brexa.png" },
  { nome: "UT Sumi-emu", logo: "/images/logo-parceiro-ut.png" },
];
const CLIENTES_CORPORATIVOS: ItemMarquee[] = [
  { nome: "Murata", logo: "/images/logo-cliente-murata.png" },
  { nome: "Yamaha", logo: "/images/logo-cliente-yamaha.png" },
  { nome: "Sony", logo: "/images/logo-cliente-sony.png" },
  { nome: "Panasonic", logo: "/images/logo-cliente-panasonic.png" },
  { nome: "Yokohama Tyres", logo: "/images/logo-cliente-yokohama-tyres.png" },
  { nome: "Mitsubishi Denki", logo: "/images/logo-cliente-mitsubishi-denki.png" },
  { nome: "Fujifilm", logo: "/images/logo-cliente-fujifilm.png" },
  { nome: "Aisin", logo: "/images/logo-cliente-aisin.png" },
  { nome: "Subaru", logo: "/images/logo-cliente-subaru.png" },
];

function LogoMarquee({ item }: { item: ItemMarquee }) {
  // Altura E largura máximas (sem caixa fixa) — ajustado 19/set/2026.
  // Só altura fixa (w-auto) resolvia o "buraco vazio" mas criava o problema
  // oposto: as marcas em formato de logotipo bem largo e baixo (Brexa, Sony,
  // Panasonic — proporção de até 8:1) ficavam 6 a 8x mais largas que marcas
  // em formato quase quadrado (Fujiarte, uT), parecendo "tamanhos totalmente
  // diferentes". Travando altura MÁXIMA e largura MÁXIMA juntas (sem w-auto
  // fixo, sem caixa/wrapper de tamanho forçado), o navegador escala cada
  // logo pelo lado mais restritivo mantendo a proporção original — isso
  // equilibra o peso visual dos logotipos largos sem sobrar espaço em
  // branco ao redor dos logos mais quadrados (porque não existe uma caixa
  // maior que o próprio logo escalado).
  return item.logo ? (
    <div className="mx-6 flex h-14 shrink-0 items-center">
      <img
        src={item.logo}
        alt={item.nome}
        className="h-auto max-h-9 w-auto max-w-[108px] object-contain md:max-h-10 md:max-w-[128px]"
      />
    </div>
  ) : (
    <span className="mx-4 shrink-0 rounded-full border border-black/10 bg-black/[0.02] px-6 py-3 text-sm font-medium uppercase tracking-[0.08em] text-black/55">
      {item.nome}
    </span>
  );
}

// estatico — pedido do Wilson, 19/set/2026: "empresas parceiras pode ser
// fixo são poucos logos". Com poucos itens, sem rolagem: fica centralizado
// e parado, sem o loop infinito (que exigiria duplicar os itens e só faz
// sentido com uma fileira comprida).
function Marquee({ itens, estatico }: { itens: ItemMarquee[]; estatico?: boolean }) {
  if (estatico) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
        {itens.map((item) => (
          <LogoMarquee key={item.nome} item={item} />
        ))}
      </div>
    );
  }

  const lista = [...itens, ...itens];
  return (
    <div className="marquee-viewport">
      <div className="marquee-track">
        {lista.map((item, i) => (
          <LogoMarquee key={`${item.nome}-${i}`} item={item} />
        ))}
      </div>
      <style jsx>{`
        .marquee-viewport {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 32s linear infinite;
        }
        @keyframes marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

export default function EmpregosPage() {
  const [publicoFiltro, setPublicoFiltro] = useState<PublicoKey | "todos">("todos");
  const [setorFiltro, setSetorFiltro] = useState<SetorKey | "todos">("todos");
  const [regioesFiltro, setRegioesFiltro] = useState<Set<string>>(new Set());
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [vagaAbertaId, setVagaAbertaId] = useState<string | null>(null);
  const [candidaturaVagaId, setCandidaturaVagaId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [emailMailing, setEmailMailing] = useState("");
  const [statusMailing, setStatusMailing] = useState<"idle" | "enviando" | "sucesso" | "erro">("idle");
  const [erroMailing, setErroMailing] = useState("");

  useEffect(() => {
    function aoRolar() {
      setScrolled(window.scrollY > 40);
    }
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  // Pop-up de detalhes da vaga — pedido do Wilson, 19/set/2026 ("o detalhes
  // devem abrir como pop up"), substituindo o expandir/colapsar inline no
  // card. Trava o scroll do fundo enquanto o modal está aberto.
  useEffect(() => {
    if (!vagaAbertaId) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [vagaAbertaId]);

  // Modal de candidatura — pedido do Wilson, 25/set/2026 ("ao clicar em
  // aplicar a vaga, deve abrir uma pagina para enviar as informações...").
  // Mesmo travamento de scroll do pop-up de detalhes acima.
  useEffect(() => {
    if (!candidaturaVagaId) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [candidaturaVagaId]);

  // Cadastro de e-mail no mailing de novas vagas — pedido do Wilson,
  // 19/set/2026 ("Deseja ser notificado quando abrir novas vagas?" +
  // "crie um codigo para ele registrar o email no mailing"). Grava em
  // Supabase via app/api/empregos-mailing/route.ts (ver também a
  // migração supabase/migrations/010_mailing_vagas.sql).
  async function enviarEmailMailing(e: FormEvent) {
    e.preventDefault();
    if (statusMailing === "enviando") return;
    setStatusMailing("enviando");
    setErroMailing("");
    try {
      const resposta = await fetch("/api/empregos-mailing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailMailing }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErroMailing(dados.error || "Não foi possível registrar seu e-mail agora. Tente de novo.");
        setStatusMailing("erro");
        return;
      }
      setStatusMailing("sucesso");
      setEmailMailing("");
    } catch {
      setErroMailing("Não foi possível registrar seu e-mail agora. Tente de novo.");
      setStatusMailing("erro");
    }
  }

  function irParaVagas(ajustes?: { publico?: PublicoKey | "todos"; setor?: SetorKey | "todos" }) {
    if (ajustes?.publico !== undefined) setPublicoFiltro(ajustes.publico);
    if (ajustes?.setor !== undefined) setSetorFiltro(ajustes.setor);
    document.getElementById("vagas")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function alternarRegiao(regiao: string) {
    setRegioesFiltro((atual) => {
      const novo = new Set(atual);
      if (novo.has(regiao)) novo.delete(regiao);
      else novo.add(regiao);
      return novo;
    });
  }

  function alternarSelecao(id: string) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  const vagaAberta = useMemo(() => VAGAS.find((v) => v.id === vagaAbertaId) ?? null, [vagaAbertaId]);
  const vagaEmCandidatura = useMemo(
    () => VAGAS.find((v) => v.id === candidaturaVagaId) ?? null,
    [candidaturaVagaId],
  );

  const vagasFiltradas = useMemo(() => {
    return VAGAS.filter((vaga) => {
      if (publicoFiltro !== "todos" && !vaga.publico.includes(publicoFiltro)) return false;
      if (setorFiltro !== "todos" && vaga.setor !== setorFiltro) return false;
      if (regioesFiltro.size > 0 && !regioesFiltro.has(vaga.regiao)) return false;
      return true;
    });
  }, [publicoFiltro, setorFiltro, regioesFiltro]);

  const vagasSelecionadas = VAGAS.filter((v) => selecionadas.has(v.id));

  function mensagemCandidatura() {
    const linhas = [
      "Olá! Tenho interesse nas vagas abaixo (catálogo Ajisai Empregos):",
      "",
      ...vagasSelecionadas.map((v) => `• ${v.titulo} — ${v.empresa}, ${v.cidade}/${v.regiao} (${SETOR_NOME[v.setor]})`),
      "",
      "Podem me passar os próximos passos?",
    ];
    return linhas.join("\n");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-black">
      {/* ── HEADER ── */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-300 ${
          scrolled ? "bg-black/10 backdrop-blur-2xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5 md:px-16">
          <Link href="/">
            <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-10 w-auto object-contain invert md:h-11" />
          </Link>
          <a
            href={linkWhatsapp("Olá! Vim pela página de Empregos da Ajisai e queria saber mais.")}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-[#2f80c9] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#3b91dc]"
          >
            Falar no WhatsApp
          </a>
        </div>
      </header>

      {/* ── HERO. Foto de colagem (4 painéis — alimentício, automotivo/robótica,
          eletrônicos, logística) adicionada 19/set/2026 a pedido do Wilson,
          substituindo o fundo azul-marinho liso. Texto reposicionado no
          rodapé da imagem. Ajustado no mesmo dia, olhando o site publicado:
          hero mais alto e gradiente mais curto (só a faixa de baixo escurece)
          pra deixar mais imagem à mostra, texto ainda mais colado na base, e
          os botões "Ver vagas"/"Falar com a Ajisai" removidos daqui — o CTA
          "Ver vagas" já existe no header fixo. ── */}
      <section className="relative overflow-hidden border-b border-black/10 bg-[#0A2540]">
        <div className="absolute inset-0">
          <Image
            src="/images/empregos-hero-colagem.jpg"
            alt="Trabalhadores em fábricas no Japão — linha alimentícia, automotiva, eletrônicos e logística"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] from-15% via-[#0A2540]/75 via-45% to-[#0A2540]/10 to-90%" />
        </div>
        <div className="relative flex min-h-[520px] flex-col justify-end px-6 pb-8 pt-28 md:min-h-[640px] md:px-10 md:pb-10 md:pt-36">
          <div className="mx-auto w-full max-w-4xl text-center">
            <h1 className={`${display.className} text-[clamp(1.9rem,5vw,3.4rem)] font-medium leading-[1.1] text-white`}>
              Emprego formal no Japão, do primeiro contato até a mudança
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm font-light leading-6 text-white/65 md:text-base">
              Vagas nos setores automobilístico, de componentes eletrônicos e alimentício — para quem
              está no Brasil e quer vir para o Japão, ou para quem já está no Japão e quer mudar de
              emprego.
            </p>
          </div>
        </div>
      </section>

      {/* ── OS 2 TIPOS DE SERVIÇO ── */}
      <section className="border-b border-black/10 bg-white px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className={`${display.className} text-2xl font-medium text-black md:text-3xl`}>
            Qual seu objetivo?
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {PUBLICOS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => irParaVagas({ publico: p.key })}
                className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white text-left transition hover:border-black/25 hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.3)]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/5">
                  <Image
                    src={p.imagem}
                    alt={p.nome}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col bg-black/[0.02] p-7 md:p-8">
                  <h3 className={`${display.className} text-xl font-medium text-black md:text-2xl`}>{p.nome}</h3>
                  <p className="mt-3 flex-1 text-sm font-light leading-6 text-black/55">{p.descricao}</p>
                  <span className="mt-5 inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2f80c9]">
                    {p.cta} →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── DIFERENCIAIS AJISAI ── */}
      <section className="border-b border-black/10 bg-black/[0.02] px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Por que a Ajisai</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
            Diferenciais Ajisai
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIFERENCIAIS.map((d) => (
              <div key={d.titulo} className="rounded-2xl border border-black/10 bg-white p-6">
                <h3 className="text-sm font-semibold text-black">{d.titulo}</h3>
                <p className="mt-2 text-xs font-light leading-5 text-black/55">{d.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARDS DE SETOR ── */}
      <section className="border-b border-black/10 bg-white px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className={`${display.className} text-2xl font-medium text-black md:text-3xl`}>Setores</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SETORES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => irParaVagas({ setor: s.key })}
                className="group flex h-[268px] flex-col items-center rounded-2xl border border-black/10 bg-black/[0.02] p-7 text-center transition hover:border-[#2f80c9]/50 hover:bg-[#2f80c9]/5"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center text-[#2f80c9]">
                  <IconSetor setor={s.key} className="h-16 w-16" />
                </span>
                <h3 className={`${display.className} mt-4 shrink-0 text-lg font-medium text-black`}>{s.nome}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-xs font-light leading-5 text-black/55">{s.descricao}</p>
                <span className="mt-4 shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2f80c9]">
                  Ver vagas →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATÁLOGO DE VAGAS ── */}
      <section id="vagas" className="scroll-mt-24 border-b border-black/10 bg-black/[0.02] px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Catálogo</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>Vagas</h2>
          <p className="mt-2 max-w-2xl text-sm font-light leading-6 text-black/55">
            Selecione a região e o setor para filtrar, marque quantas vagas quiser e aplique de uma
            vez — como um carrinho de compras.
          </p>

          {/* Filtro por público */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPublicoFiltro("todos")}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                publicoFiltro === "todos" ? "border-[#2f80c9] bg-[#2f80c9] text-white" : "border-black/15 bg-white text-black/60 hover:border-black/30"
              }`}
            >
              Todos os públicos
            </button>
            {PUBLICOS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPublicoFiltro(p.key)}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                  publicoFiltro === p.key ? "border-[#2f80c9] bg-[#2f80c9] text-white" : "border-black/15 bg-white text-black/60 hover:border-black/30"
                }`}
              >
                {p.key === "brasil" ? "Vindo do Brasil" : "Já no Japão"}
              </button>
            ))}
          </div>

          {/* Filtro por setor */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSetorFiltro("todos")}
              className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                setorFiltro === "todos" ? "border-[#0A2540] bg-[#0A2540] text-white" : "border-black/15 bg-white text-black/60 hover:border-black/30"
              }`}
            >
              Todos os setores
            </button>
            {SETORES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSetorFiltro(s.key)}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                  setorFiltro === s.key ? "border-[#0A2540] bg-[#0A2540] text-white" : "border-black/15 bg-white text-black/60 hover:border-black/30"
                }`}
              >
                {s.nome}
              </button>
            ))}
          </div>

          {/* Filtro por região — modelo "Tabelog": grade de chips de região,
              multi-seleção, sem região marcada = mostra todas. */}
          <div className="mt-3">
            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-black/40">Região</p>
            <div className="flex flex-wrap gap-2">
              {REGIOES.map((r) => {
                const marcado = regioesFiltro.has(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => alternarRegiao(r)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                      marcado ? "border-[#b79ce6] bg-[#b79ce6]/15 text-[#6b4fa0]" : "border-black/15 bg-white text-black/55 hover:border-black/30"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
              {regioesFiltro.size > 0 && (
                <button
                  type="button"
                  onClick={() => setRegioesFiltro(new Set())}
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium text-black/40 underline decoration-black/20 underline-offset-2 hover:text-black/60"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Grade de vagas */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vagasFiltradas.map((vaga) => {
              const marcada = selecionadas.has(vaga.id);
              return (
                <div
                  key={vaga.id}
                  className={`relative flex h-[430px] flex-col overflow-hidden rounded-2xl border p-5 transition ${
                    marcada ? "border-[#2f80c9] bg-[#2f80c9]/5" : "border-black/10 bg-white hover:border-black/25"
                  }`}
                >
                  {/* Corpo do card clicável — pedido do Wilson, 19/set/2026:
                      clicar na vaga abre os detalhes. Virou pop-up (19/set/2026,
                      segundo ajuste do mesmo dia) em vez de expandir dentro do
                      card. A seleção pra candidatura continua só no checkbox
                      (que interrompe a propagação do clique), pra não misturar
                      as duas ações. Altura fixa (h-[430px]) — pedido do Wilson,
                      19/set/2026, "todos os cards de vagas devem ter o mesmo
                      tamanho": os campos que variam de tamanho (título,
                      salário, turno, perfil) ficam com line-clamp e o texto
                      completo continua disponível no pop-up de detalhes. */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setVagaAbertaId(vaga.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setVagaAbertaId(vaga.id);
                      }
                    }}
                    className="flex h-full cursor-pointer flex-col text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-black/50">
                          {SETOR_NOME[vaga.setor]}
                        </span>
                        {/* Selo de status — pedido do Wilson, 19/set/2026: vagas
                            "sob consulta" (processo de visto, sem embarque
                            confirmado) ficam no catálogo, mas marcadas — só
                            "aberta" fica sem selo, pra não poluir a maioria dos
                            cards. */}
                        {vaga.status === "consulta" && (
                          <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
                            {STATUS_LABEL.consulta}
                          </span>
                        )}
                      </div>
                      {/* Logo da empresa no canto superior direito, quando
                          disponível — pedido do Wilson, 19/set/2026. Enquanto
                          ele não manda o arquivo, o card só mostra o nome em
                          texto (linha abaixo). */}
                      <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {vaga.logo && (
                          <img
                            src={vaga.logo}
                            alt={vaga.empresa}
                            className="h-6 max-w-[92px] object-contain"
                          />
                        )}
                        <input
                          type="checkbox"
                          checked={marcada}
                          onChange={() => alternarSelecao(vaga.id)}
                          className="h-4 w-4 shrink-0 accent-[#2f80c9]"
                        />
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2f80c9]">
                      {vaga.empresa}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-black">{vaga.titulo}</h3>
                    <p className="mt-1 text-xs text-black/50">
                      {vaga.cidade}, {vaga.regiao} — Japão
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-black/80">{vaga.salario}</p>
                    <div className="mt-2 flex-1 space-y-1 overflow-hidden text-[11px] leading-4 text-black/45">
                      <p className="line-clamp-1">{vaga.turno}</p>
                      <p className="line-clamp-1">{vaga.contrato}</p>
                      {vaga.perfil && <p className="line-clamp-2">Perfil: {vaga.perfil}</p>}
                      {vaga.idioma && <p className="line-clamp-1">Japonês: {vaga.idioma}</p>}
                    </div>
                    <span className="mt-3 inline-flex w-fit shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2f80c9]">
                      Ver mais detalhes
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                      >
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>

                  {/* Ícone do setor no canto inferior direito do card —
                      pedido do Wilson, 19/set/2026. Decorativo (marca
                      d'água), não intercepta clique. Reduzido e reposicionado
                      no mesmo dia — tamanho maior cortava na borda direita
                      do card. */}
                  <span className="pointer-events-none absolute bottom-3 right-3 text-[#2f80c9]/10">
                    <IconSetor setor={vaga.setor} className="h-11 w-11" />
                  </span>
                </div>
              );
            })}
            {vagasFiltradas.length === 0 && (
              <p className="col-span-full text-sm text-black/40">
                Nenhuma vaga com esses filtros — tente outra combinação de região e setor.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── POP-UP DE DETALHES DA VAGA — pedido do Wilson, 19/set/2026
          ("o detalhes devem abrir como pop up e bota INICIAR
          CANDIDATURA"). Substitui o expandir/colapsar inline no card. */}
      {vagaAberta && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => setVagaAbertaId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-black/50">
                  {SETOR_NOME[vagaAberta.setor]}
                </span>
                {vagaAberta.status === "consulta" && (
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700">
                    {STATUS_LABEL.consulta}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setVagaAbertaId(null)}
                aria-label="Fechar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black/70"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {vagaAberta.logo && (
              <img src={vagaAberta.logo} alt={vagaAberta.empresa} className="mt-4 h-7 max-w-[120px] object-contain" />
            )}
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2f80c9]">{vagaAberta.empresa}</p>
            <h3 className={`${display.className} mt-1 text-xl font-medium text-black`}>{vagaAberta.titulo}</h3>
            <p className="mt-1 text-xs text-black/50">
              {vagaAberta.cidade}, {vagaAberta.regiao} — Japão
            </p>
            <p className="mt-2 text-base font-semibold text-black/80">{vagaAberta.salario}</p>
            <div className="mt-2 space-y-1 text-xs leading-5 text-black/50">
              <p>{vagaAberta.turno}</p>
              <p>{vagaAberta.contrato}</p>
              {vagaAberta.perfil && <p>Perfil: {vagaAberta.perfil}</p>}
              {vagaAberta.idioma && <p>Japonês: {vagaAberta.idioma}</p>}
            </div>

            {/* Análise da vaga — pedido do Wilson, 19/set/2026: comparar
                salário e benefícios com o resto do catálogo. Some sozinha
                quando a amostra é pequena demais ou a diferença é
                irrelevante (ver AnaliseVaga). */}
            <div className="mt-5">
              <AnaliseVaga vaga={vagaAberta} />
            </div>

            <div className="mt-5 border-t border-black/10 pt-5">
              <DetalhesVaga vaga={vagaAberta} />
            </div>

            <button
              type="button"
              onClick={() => {
                const idVaga = vagaAberta.id;
                setVagaAbertaId(null);
                setCandidaturaVagaId(idVaga);
              }}
              className="mt-6 flex w-full items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3b91dc]"
            >
              Iniciar candidatura
            </button>
          </div>
        </div>
      )}

      {vagaEmCandidatura && (
        <CandidaturaModal vaga={vagaEmCandidatura} onFechar={() => setCandidaturaVagaId(null)} />
      )}

      {/* ── BARRA FIXA: carrinho de vagas ── */}
      {selecionadas.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/97 px-5 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] backdrop-blur sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium text-black/70">
              {selecionadas.size} {selecionadas.size === 1 ? "vaga selecionada" : "vagas selecionadas"}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelecionadas(new Set())}
                className="rounded-full px-3 py-2 text-[11px] font-medium text-black/40 underline decoration-black/20 underline-offset-2 hover:text-black/60"
              >
                Limpar seleção
              </button>
              <a
                href={linkWhatsapp(mensagemCandidatura())}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#2f80c9] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#3b91dc]"
              >
                Aplicar para as vagas selecionadas
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── JORNADA DO CLIENTE ── */}
      <section className="border-b border-black/10 bg-white px-6 py-14 md:px-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Como funciona</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
            A jornada até o seu novo emprego
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {JORNADA.map((etapa) => (
              <div key={etapa.numero} className="rounded-2xl border border-black/10 bg-black/[0.02] p-5">
                <span className={`${display.className} text-2xl font-medium text-[#2f80c9]`}>{etapa.numero}</span>
                <h3 className="mt-2 text-sm font-semibold text-black">{etapa.titulo}</h3>
                <p className="mt-2 text-xs font-light leading-5 text-black/55">{etapa.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARROSSEL DE LOGOS ── */}
      <section className="border-b border-black/10 bg-black/[0.02] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-16">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-black/40">Empresas parceiras</p>
        </div>
        <div className="mt-5">
          <Marquee itens={EMPRESAS_PARCEIRAS} estatico />
        </div>
        <div className="mx-auto mt-10 max-w-6xl px-6 md:px-16">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-black/40">
            Clientes corporativos que já contrataram nossos candidatos
          </p>
        </div>
        <div className="mt-5">
          <Marquee itens={CLIENTES_CORPORATIVOS} />
        </div>
      </section>

      {/* ── CTA FINAL — mailing de novas vagas ── */}
      {/* Trocado de "Pronto para dar o próximo passo?" (CTA de WhatsApp)
          pra um cadastro de e-mail — pedido do Wilson, 19/set/2026. O
          WhatsApp continua disponível (header fixo + cada vaga no
          catálogo já tem o próprio CTA), então aqui vira um link
          secundário abaixo do formulário, sem duplicar o botão principal. */}
      <section className="bg-[#0A2540] px-6 py-16 text-center md:px-16 md:py-20">
        <h2 className={`${display.className} text-2xl font-medium text-white md:text-3xl`}>
          Deseja ser notificado quando abrir novas vagas?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-light leading-6 text-white/65">
          Deixe seu e-mail e a Ajisai avisa você assim que novas vagas forem publicadas no catálogo.
        </p>
        <form onSubmit={enviarEmailMailing} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={emailMailing}
            onChange={(e) => setEmailMailing(e.target.value)}
            placeholder="seu@email.com"
            className="w-full flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/35 focus:border-[#6ec3d9] focus:outline-none"
          />
          <button
            type="submit"
            disabled={statusMailing === "enviando"}
            className="shrink-0 rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3b91dc] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {statusMailing === "enviando" ? "Enviando…" : "Quero ser avisado"}
          </button>
        </form>
        {statusMailing === "sucesso" && (
          <p className="mt-3 text-xs text-emerald-300">
            Pronto! Você vai receber um aviso assim que novas vagas forem publicadas.
          </p>
        )}
        {statusMailing === "erro" && <p className="mt-3 text-xs text-red-300">{erroMailing}</p>}
        <p className="mt-6 text-xs text-white/40">
          Prefere falar agora?{" "}
          <a
            href={linkWhatsapp("Olá! Vim pela página de Empregos da Ajisai e queria saber mais.")}
            target="_blank"
            rel="noreferrer"
            className="text-[#6ec3d9] underline decoration-white/20 underline-offset-2 hover:text-white"
          >
            Fale com a Ajisai no WhatsApp
          </a>
        </p>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white px-8 pb-20 pt-16 text-black md:px-16 md:pb-20 md:pt-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
          <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-11 w-auto object-contain invert md:h-12" />
          <p className="max-w-sm text-sm leading-relaxed text-black/50">
            Empregos formais no Japão para brasileiros — do primeiro contato até a mudança.
          </p>
          <p className="text-[11px] leading-relaxed text-black/25">
            © 2026 AJISAIWORK JAPAN AGENCIA DE VIAGENS LTDA, Todos os Direitos Reservados — CNPJ:
            43.544.605/0001-56
          </p>
        </div>
      </footer>
    </main>
  );
}

// ── MODAL DE CANDIDATURA — pedido do Wilson, 25/set/2026: "ao clicar em
// aplicar a vaga, deve abrir uma pagina para enviar as informações de
// nome, sobrenome, email, telefone, curriculo e algumas perguntas
// relevantes para cada vaga, depois deve haver um sistema que captura
// essa informacao e valida se o lead é compativel com a vaga, deve haver
// um percenteil 0-100% de compatibilidade [...] após match superior a
// 80%, ele pode ir para a proxima etapa que será enviar uma foto do
// candidato". Fluxo em 4 etapas: formulário → resultado da pontuação →
// (só se >=80%) foto → concluído. Sem IA (decisão do Wilson): a
// pontuação vem de app/lib/candidaturaScoring.ts e a checagem da foto de
// app/lib/fotoChecagem.ts, ambos determinísticos.
type EtapaCandidatura = "formulario" | "resultado" | "foto" | "concluido";

function CandidaturaModal({ vaga, onFechar }: { vaga: Vaga; onFechar: () => void }) {
  const [etapa, setEtapa] = useState<EtapaCandidatura>("formulario");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [idade, setIdade] = useState("");
  const [curriculo, setCurriculo] = useState<File | null>(null);
  const [respostas, setRespostas] = useState<RespostasTriagem>({
    passaporte: "",
    disponibilidadeEmbarque: "",
    experienciaSetor: "",
    nivelJapones: "",
  });

  const [candidaturaId, setCandidaturaId] = useState<string | null>(null);
  const [pontuacao, setPontuacao] = useState(0);
  const [criterios, setCriterios] = useState<CriterioPontuacao[]>([]);
  const [aprovadoParaFoto, setAprovadoParaFoto] = useState(false);

  const [foto, setFoto] = useState<File | null>(null);
  const [checklist, setChecklist] = useState({
    fundoClaro: false,
    semBoneOuChapeu: false,
    semOculosEscuros: false,
    rostoVisivelCentralizado: false,
  });

  async function enviarFormulario(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;
    if (!nome || !sobrenome || !email || !telefone) {
      setErro("Preencha nome, sobrenome, e-mail e telefone.");
      return;
    }
    if (!curriculo) {
      setErro("Envie seu currículo (PDF ou DOCX).");
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      const form = new FormData();
      form.append("vagaId", vaga.id);
      form.append("nome", nome);
      form.append("sobrenome", sobrenome);
      form.append("email", email);
      form.append("telefone", telefone);
      if (idade) form.append("idade", idade);
      form.append("respostas", JSON.stringify(respostas));
      form.append("curriculo", curriculo);
      const resposta = await fetch("/api/empregos-candidatura", { method: "POST", body: form });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dados.error || "Não foi possível enviar sua candidatura agora. Tente novamente.");
        setEnviando(false);
        return;
      }
      setCandidaturaId(dados.candidaturaId);
      setPontuacao(dados.pontuacao);
      setCriterios(dados.criterios || []);
      setAprovadoParaFoto(Boolean(dados.aprovadoParaFoto));
      setEtapa("resultado");
    } catch {
      setErro("Não foi possível enviar sua candidatura agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function enviarFoto(e: FormEvent) {
    e.preventDefault();
    if (enviando || !candidaturaId) return;
    if (!foto) {
      setErro("Envie sua foto.");
      return;
    }
    setEnviando(true);
    setErro("");
    try {
      const form = new FormData();
      form.append("candidaturaId", candidaturaId);
      form.append("foto", foto);
      form.append("checklist", JSON.stringify(checklist));
      const resposta = await fetch("/api/empregos-foto", { method: "POST", body: form });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dados.error || "Não foi possível enviar sua foto agora. Tente novamente.");
        setEnviando(false);
        return;
      }
      setEtapa("concluido");
    } catch {
      setErro("Não foi possível enviar sua foto agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2f80c9]">{vaga.empresa}</p>
            <h3 className={`${display.className} mt-1 text-xl font-medium text-black`}>{vaga.titulo}</h3>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black/70"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {etapa === "formulario" && (
          <form onSubmit={enviarFormulario} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-black/50">Nome</label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-black/50">Sobrenome</label>
                <input
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-black/50">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-black/50">Telefone (WhatsApp)</label>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-black/50">Idade</label>
                <input
                  type="number"
                  min={16}
                  max={75}
                  value={idade}
                  onChange={(e) => setIdade(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-black/50">Currículo (PDF ou DOCX)</label>
              <input
                type="file"
                accept={EXTENSOES_CURRICULO_ACEITAS}
                onChange={(e) => setCurriculo(e.target.files?.[0] ?? null)}
                required
                className="mt-1 w-full rounded-xl border border-dashed border-black/15 px-3 py-2.5 text-xs text-black/60 outline-none file:mr-3 file:rounded-full file:border-0 file:bg-black/[0.04] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-black/70"
              />
            </div>

            <div className="border-t border-black/10 pt-4">
              <label className="text-[11px] font-medium text-black/50">Seu nível de japonês</label>
              <select
                value={respostas.nivelJapones}
                onChange={(e) =>
                  setRespostas((r) => ({ ...r, nivelJapones: e.target.value as NivelJapones | "" }))
                }
                required
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
              >
                <option value="" disabled>
                  Selecione
                </option>
                {NIVEIS_JAPONES.map((n) => (
                  <option key={n.key} value={n.key}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            {PERGUNTAS_TRIAGEM.map((p) => (
              <div key={p.key}>
                <p className="text-xs font-medium text-black/70">{p.pergunta}</p>
                {p.ajuda && <p className="mt-0.5 text-[11px] text-black/40">{p.ajuda}</p>}
                <div className="mt-2 flex gap-2">
                  {(["sim", "nao"] as const).map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setRespostas((r) => ({ ...r, [p.key]: valor }))}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                        respostas[p.key] === valor
                          ? "bg-[#2f80c9] text-white"
                          : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08]"
                      }`}
                    >
                      {valor === "sim" ? "Sim" : "Não"}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {erro && <p className="text-xs text-red-500">{erro}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="mt-2 flex w-full items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3b91dc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? "Enviando…" : "Enviar candidatura"}
            </button>
          </form>
        )}

        {etapa === "resultado" && (
          <div className="mt-5">
            <div className="flex flex-col items-center gap-2 py-2">
              <div
                className="relative flex h-28 w-28 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#2f80c9 ${pontuacao * 3.6}deg, rgba(0,0,0,0.06) 0deg)`,
                }}
              >
                <div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white">
                  <span className={`${display.className} text-2xl font-medium text-black`}>{pontuacao}%</span>
                </div>
              </div>
              <p className="text-center text-xs text-black/50">Compatibilidade com esta vaga</p>
            </div>

            <div className="mt-4 space-y-2.5 border-t border-black/10 pt-4">
              {criterios.map((c) => (
                <div key={c.chave} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-black/70">{c.label}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-black/40">{c.detalhe}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-black/60">
                    {c.pontosObtidos}/{c.pontosMaximos}
                  </span>
                </div>
              ))}
            </div>

            {aprovadoParaFoto ? (
              <div className="mt-6 rounded-2xl bg-[#2f80c9]/[0.06] p-4">
                <p className="text-xs leading-5 text-black/70">
                  Parabéns! Sua pontuação passou de {NOTA_MINIMA_PROXIMA_ETAPA}% — a próxima etapa é enviar uma foto
                  para o processo seletivo.
                </p>
                <button
                  type="button"
                  onClick={() => setEtapa("foto")}
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3b91dc]"
                >
                  Continuar para envio de foto
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-black/[0.03] p-4">
                <p className="text-xs leading-5 text-black/70">
                  Sua candidatura foi registrada e vai passar por uma revisão manual da nossa equipe — pontuações
                  abaixo de {NOTA_MINIMA_PROXIMA_ETAPA}% não são descartadas automaticamente. Entraremos em contato se
                  houver uma oportunidade compatível.
                </p>
                <button
                  type="button"
                  onClick={onFechar}
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-black px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/80"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        )}

        {etapa === "foto" && (
          <form onSubmit={enviarFoto} className="mt-5 space-y-4">
            <p className="text-xs leading-5 text-black/60">
              Envie uma foto tipo 3x4 recente, com fundo claro/liso, boa iluminação e o rosto bem visível — sem boné,
              chapéu ou óculos escuros.
            </p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              required
              className="w-full rounded-xl border border-dashed border-black/15 px-3 py-2.5 text-xs text-black/60 outline-none file:mr-3 file:rounded-full file:border-0 file:bg-black/[0.04] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-black/70"
            />

            <div className="space-y-2 border-t border-black/10 pt-4">
              {[
                { key: "fundoClaro" as const, label: "O fundo da foto é claro/liso" },
                { key: "semBoneOuChapeu" as const, label: "Não estou usando boné ou chapéu" },
                { key: "semOculosEscuros" as const, label: "Não estou usando óculos escuros" },
                { key: "rostoVisivelCentralizado" as const, label: "Meu rosto está visível e centralizado" },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2.5 text-xs text-black/70">
                  <input
                    type="checkbox"
                    checked={checklist[item.key]}
                    onChange={(e) => setChecklist((c) => ({ ...c, [item.key]: e.target.checked }))}
                    required
                    className="h-4 w-4 rounded border-black/20 text-[#2f80c9] focus:ring-[#2f80c9]"
                  />
                  {item.label}
                </label>
              ))}
            </div>

            {erro && <p className="text-xs text-red-500">{erro}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="flex w-full items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3b91dc] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enviando ? "Enviando…" : "Enviar foto"}
            </button>
          </form>
        )}

        {etapa === "concluido" && (
          <div className="mt-6 flex flex-col items-center gap-3 py-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f80c9]/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2f80c9"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h4 className={`${display.className} text-lg font-medium text-black`}>Candidatura enviada!</h4>
            <p className="max-w-xs text-xs leading-5 text-black/50">
              Recebemos sua candidatura e sua foto. Nossa equipe vai revisar tudo e entrar em contato pelo e-mail ou
              telefone informados.
            </p>
            <button
              type="button"
              onClick={onFechar}
              className="mt-2 rounded-full bg-black px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/80"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
