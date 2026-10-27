"use client";

// Corpo client da página /empregos. Até 07/out/2026 era o próprio
// app/empregos/page.tsx; virou componente para o page.tsx (servidor) poder
// passar as vagas desligadas no CRM (/crm/empregos/vagas) e para a página
// própria de cada vaga (app/empregos/vagas/[id]) reaproveitar os blocos de
// detalhe e o mesmo modal de candidatura — Wilson, 07/out/2026: "o
// candidato tem que se candidatar pelas vagas que já estão no site, não
// existe caminho especial" + "todas as vagas no site agora devem ter site
// próprio".

import { medirGoogleEmpregos, medirOpenAI } from "./PixelOpenAI";
import { VAGAS, formatarDataPostagem, localVaga, type Vaga, type PublicoKey, type SetorKey, type StatusVaga } from "../lib/vagasCatalogo";
import {
  PERGUNTAS_TRIAGEM,
  NIVEIS_JAPONES_DETALHADOS,
  nivelDoDetalhado,
  ASCENDENCIA_JAPONESA,
  QUANDO_EMBARCAR,
  type RespostasTriagem,
  type NivelJaponesDetalhado,
  type AscendenciaJaponesa,
  type QuandoEmbarcar,
} from "../lib/candidaturaScoring";
import { vagaExigeTesteDaltonismo, criteriosDaVaga } from "../lib/candidaturaScoring";
import { vagaExigeTestesAptidao } from "../lib/testesAptidao";
import {
  ESCOLARIDADES,
  OPCOES_DALTONISMO,
  OPCOES_FLEXIBILIDADE,
  OPCOES_HORAS_EXTRAS,
  PERFIL_VAZIO,
  sortearPlacasDaltonismo,
  PROVINCIAS_JAPAO,
  OPCOES_FINANCIAMENTO,
  REGIOES_TATUAGEM,
  TAMANHOS_TATUAGEM,
  TIPOS_TATUAGEM,
  tatuagemVisivelDerivada,
  CONDICOES_VISUAIS,
  OPCOES_FUMANTE,
  CLASSES_MEDICAMENTO,
  TIPOS_DIABETES,
  avaliarTesteDaltonismo,
  pendenciasPerfil,
  type PerfilCandidato,
} from "../lib/triagemPerfil";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PrazosProcesso from "../components/empregos/PrazosProcesso";
import Link from "next/link";
import { Bodoni_Moda } from "next/font/google";

export const display = Bodoni_Moda({
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

export function linkWhatsapp(mensagem: string) {
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

// ── DESTAQUES — carrossel "Oportunidades em destaque".
// Histórico: 06/out/2026 (4 banners, Wilson), 07/out (Fukui e Izumo com
// texto do site sobre a foto), 08/out (montadoras), 15/out (informações
// estratégicas nos banners Murata), 18/out (campanha custo zero e
// Panasonic Unnan).
//
// v2 — 18/out/2026, briefing do Wilson: mesma hierarquia em todos os
// slides (localização → título com o benefício → descrição → remuneração
// → botão → faixa inferior com 3 benefícios → condições legíveis), abas
// com nome no lugar das bolinhas, botão de pausa, composição própria no
// celular (foto em cima, texto em área azul-marinho embaixo) e nada de
// valor ou benefício que não esteja no cadastro. Textos, valores e botões
// são do site — nunca na imagem.
type Destaque = {
  id: string;
  /** Nome curto da aba (navegação). */
  aba: string;
  imagem?: string;
  alt: string;
  /** object-position da foto no celular (área separada, 16:10). */
  posicaoMobile: string;
  /** object-position da foto no desktop, já com prefixo lg: (classe literal p/ o Tailwind). */
  posicaoDesktop?: string;
  /** Pessoa mais perto do centro: bloco de texto e degradê mais curtos. */
  estreito?: boolean;
  local: string;
  /** Título; com 2 itens, vira 2 linhas fixas só no desktop (no celular quebra natural). */
  titulo: string | [string, string];
  /** Linha curta de destaque logo abaixo do título (ex.: passagem paga). */
  destaque?: string;
  /** Descrição; com 2 itens, 2 linhas fixas só no desktop. */
  descricao: string | [string, string];
  /** Largura do bloco de texto no desktop (classes literais lg:/xl:). */
  larguraTexto?: string;
  remuneracao?: { valor: string; detalhe?: string };
  // Destino do botão: página própria (href) ou filtro da lista (vagaIds).
  cta: { rotulo: string; href?: string; vagaIds?: string[] };
  /** Exatamente 3 benefícios complementares (faixa inferior). */
  beneficios: [string, string, string];
  /** Condições da oferta — sempre visíveis, nunca em tooltip. */
  condicoes: string[];
};

// Ressalvas — os asteriscos dos benefícios apontam para estas frases.
const NOTA_ELEGIVEIS = "* Para candidatos elegíveis, sujeito à análise e disponibilidade.";
const NOTA_CAMPANHA_CUSTO_ZERO =
  "* Para quem desembarcar no Japão de 15/10/2026 a 28/02/2027 e permanecer no mínimo 6 meses na fábrica.";
// Panasonic: deixa claro a que benefício cada condição se aplica.
const NOTA_PASSAGEM_PANASONIC =
  "* Passagem, visto e seguro-viagem: para quem desembarcar no Japão de 15/10/2026 a 28/02/2027 e permanecer no mínimo 6 meses na fábrica.";
// Mesma redação do Auxílio Embarque Ajisai nas landings Murata
// (landingsMurata.ts). Condições específicas do auxílio da Panasonic ainda
// não foram passadas — trocar aqui quando o Wilson confirmar.
const NOTA_AUXILIO_PANASONIC =
  "** Auxílio-embarque: para candidatos elegíveis, conforme as condições da campanha vigente — confirme com a nossa equipe.";

// Murata (Fukui e Izumo): benefícios aprovados pelo Wilson em 15/out/2026.
// "Embarque imediato para quem já tem a documentação" saiu do banner e
// ficou nos detalhes das vagas (observações em vagasCatalogo.ts).
const BENEFICIOS_MURATA: [string, string, string] = ["Custo zero com documentação inclusa*", "Sem experiência prévia", "Vagas até 59 anos"];

const DESTAQUES: Destaque[] = [
  {
    // Panasonic Unnan — card próprio (auxílio embarque). 1º do carrossel (Wilson, 19/out/2026).
    id: "panasonic-unnan",
    aba: "Panasonic",
    // v2 (18/out/2026): logo ~10% menor, com mais margem no topo e à direita.
    imagem: "/images/empregos-destaque-panasonic-unnan-v2.webp",
    alt: "Mulher sorrindo à beira de um rio com cerejeiras floridas, com o logo da Panasonic",
    // Ancorado à direita (celular e desktop) para nunca cortar o logo.
    posicaoMobile: "object-right",
    // Desktop mais horizontal (19/out/2026): ancorado no topo para manter o logo e o rosto.
    posicaoDesktop: "lg:object-[100%_0%]",
    estreito: true,
    local: "Unnan · Shimane",
    // "Receba" — antes "R$ 1.000 para embarcar", que podia parecer valor a
    // pagar. Wilson, 18/out/2026: 2 linhas, sem quebrar "auxílio-embarque".
    titulo: ["Receba R$ 1.000**", "para seu embarque"],
    // A passagem paga sobe para o corpo principal (Wilson, 18/out/2026).
    destaque: "Passagem, visto e seguro-viagem pagos*",
    descricao: ["Produção de conversores", "para painéis solares."],
    // Texto mais estreito para não encostar na pessoa.
    larguraTexto: "lg:max-w-[44%]",
    remuneracao: { valor: "¥1.500/hora" },
    cta: { rotulo: "Conhecer a vaga", href: "/empregos/vagas/panasonic-unnan" },
    // Passagem saiu do rodapé (já está no destaque); 3º item do cadastro da vaga.
    beneficios: ["Turno fixo noturno", "Escala 5×2", "Seguro saúde, previdência e seguro-desemprego"],
    condicoes: [NOTA_PASSAGEM_PANASONIC, NOTA_AUXILIO_PANASONIC],
  },
  {
    // Campanha custo zero (5 vagas — 5 oportunidades do catálogo, não
    // número de postos). Abre o hot site /empregos/custo-zero.
    id: "custo-zero",
    aba: "Passagem paga",
    imagem: "/images/empregos-destaque-custo-zero.webp",
    alt: "Operadora de uniforme e luvas montando placas eletrônicas numa fábrica",
    posicaoMobile: "object-[70%_45%]",
    posicaoDesktop: "lg:object-[50%_10%]",
    estreito: true,
    local: "Shimane · Fukui · Shiga",
    titulo: "Passagem, visto e seguro pagos",
    descricao: "Conheça 5 oportunidades de trabalho em fábricas no Japão.",
    remuneracao: { valor: "¥1.400–¥1.450/hora" },
    cta: { rotulo: "Ver as 5 vagas", href: "/empregos/custo-zero" },
    beneficios: ["Passagem paga*", "Visto e seguro-viagem pagos*", "Desembarque até 28/02/2027*"],
    condicoes: [NOTA_CAMPANHA_CUSTO_ZERO],
  },
  {
    // Landing Fukui Murata. Salário confirmado na vaga murata-echizen.
    id: "echizen",
    aba: "Fukui",
    imagem: "/images/empregos-destaque-echizen-murata.webp",
    alt: "Operadores de uniforme numa fábrica de componentes eletrônicos, com a cidade de Fukui ao fundo",
    posicaoMobile: "object-[72%_40%]",
    posicaoDesktop: "lg:object-[50%_20%]",
    local: "Fukui · Japão",
    titulo: "Trabalhe no Japão sem falar japonês",
    descricao: "Oportunidades em Fukui, sem exigência de experiência prévia.",
    remuneracao: { valor: "¥1.500/hora", detalhe: "em turno alternado; ¥1.300–1.450/hora em diurno fixo" },
    cta: { rotulo: "Conhecer a vaga", href: "/empregos/echizen" },
    beneficios: BENEFICIOS_MURATA,
    condicoes: [NOTA_ELEGIVEIS],
  },
  {
    // Landing Izumo Murata — só dados já cadastrados (vaga murata-izumo).
    id: "izumo",
    aba: "Izumo",
    imagem: "/images/empregos-destaque-izumo-murata.webp",
    alt: "Operadores de uniforme numa fábrica de componentes eletrônicos, com Izumo ao fundo",
    posicaoMobile: "object-[72%_35%]",
    posicaoDesktop: "lg:object-[50%_35%]",
    local: "Shimane · Japão",
    titulo: "Trabalhe e More em Izumo",
    descricao: "Produção de componentes eletrônicos (condensador cerâmico).",
    remuneracao: { valor: "¥1.500/hora", detalhe: "até ¥1.650/hora conforme o tempo de casa" },
    cta: { rotulo: "Conhecer a vaga", href: "/empregos/izumo" },
    beneficios: BENEFICIOS_MURATA,
    condicoes: [NOTA_ELEGIVEIS],
  },
  {
    // 4 vagas UT Suri-emu — filtra a lista. Benefícios comuns às 4 fichas.
    id: "montadoras",
    aba: "Montadoras",
    imagem: "/images/empregos-destaque-montadoras.webp",
    alt: "Operador fazendo manutenção num carro na linha de montagem",
    posicaoMobile: "object-[62%_50%]",
    posicaoDesktop: "lg:object-[50%_28%]",
    local: "Gunma · Oita · Aichi",
    titulo: "Vagas em montadoras",
    descricao: "Subaru, Daihatsu e Yokohama Gomu — 4 vagas em linhas de produção.",
    remuneracao: { valor: "¥1.430–¥1.900/hora" },
    cta: { rotulo: "Ver as 4 vagas", vagaIds: ["subaru-oizumi", "subaru-ota", "daihatsu-nakatsu", "yokohama-gomu-aichi"] },
    beneficios: [
      "Exame médico admissional e anual gratuitos",
      "Bicicleta alugada pela empresa ou transporte fretado",
      "Seguro saúde, aposentadoria e seguro-desemprego",
    ],
    condicoes: [
      CONDICOES_UT_SURIEMU.financiamentoPassagem,
      "Requisitos e condições variam por vaga — confira os detalhes de cada uma.",
    ],
  },
];

// Texto em 2 linhas fixas só no desktop; no celular, quebra natural.
// Asteriscos no fim de um trecho do título viram sobrescrito discreto.
function ComNota({ t }: { t: string }) {
  const m = t.match(/^(.*?)(\*+)$/);
  if (!m) return <>{t}</>;
  return (
    <>
      {m[1]}
      <span className="ml-0.5 align-super text-[0.5em] font-normal">{m[2]}</span>
    </>
  );
}

function Linhas({ texto }: { texto: string | [string, string] }) {
  if (typeof texto === "string") return <ComNota t={texto} />;
  return (
    <>
      <span className="lg:block">
        <ComNota t={texto[0]} />
      </span>{" "}
      <span className="lg:block">
        <ComNota t={texto[1]} />
      </span>
    </>
  );
}

function IconeCheckDestaque() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#7fb6e6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-[3px] h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

const classeBotaoDestaque =
  "inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-[#0A2540] transition-colors hover:bg-[#e8f1fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb6e6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#061a2e]";

function SlideDestaque({ d, ativo, onAbrir }: { d: Destaque; ativo: boolean; onAbrir: (d: Destaque) => void }) {
  const router = useRouter();
  // Clicar em qualquer parte da foto faz o mesmo que o botão (Wilson, 19/out/2026).
  const abrir = () => (d.cta.href ? router.push(d.cta.href) : onAbrir(d));
  const botao = d.cta.href ? (
    <Link href={d.cta.href} className={classeBotaoDestaque}>
      {d.cta.rotulo} <span aria-hidden="true">→</span>
    </Link>
  ) : (
    <button type="button" onClick={() => onAbrir(d)} className={classeBotaoDestaque}>
      {d.cta.rotulo} <span aria-hidden="true">→</span>
    </button>
  );
  return (
    <div className="flex h-full flex-col">
      {/* Área principal: no celular/tablet, foto em cima e texto embaixo;
          no desktop (lg+), texto à esquerda sobre o degradê. */}
      {/* Desktop: área da foto com ~364 px (mínimo, nunca altura fixa — se o texto
          precisar, cresce). Wilson, 19/out/2026: carrossel mais horizontal. */}
      <div className="relative flex flex-1 flex-col lg:min-h-[364px] lg:justify-center">
        <div onClick={abrir} className="relative aspect-[16/10] w-full cursor-pointer md:aspect-[2/1] lg:absolute lg:inset-0 lg:aspect-auto">
          {d.imagem && (
            <Image
              src={d.imagem}
              alt={d.alt}
              fill
              sizes="(min-width: 1152px) 1152px, 100vw"
              className={`object-cover ${d.posicaoMobile} ${d.posicaoDesktop ?? "lg:object-center"}`}
              priority={d.id === DESTAQUES[0]?.id}
            />
          )}
          {/* Celular: só uma transição curta para o azul do texto. Desktop:
              degradê à esquerda que some antes do rosto. */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 bg-gradient-to-t from-[#061a2e] via-transparent via-25% to-transparent lg:bg-gradient-to-r lg:from-[#061a2e] lg:from-10% lg:via-[#061a2e]/80 lg:to-transparent ${
              d.estreito ? "lg:via-30% lg:to-[52%]" : "lg:via-35% lg:to-[60%]"
            }`}
          />
        </div>
        <div className={`relative px-6 pb-6 pt-2 sm:px-10 lg:px-12 lg:py-7 ${d.larguraTexto ?? (d.estreito ? "lg:max-w-[48%]" : "lg:max-w-[52%]")}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">{d.local}</p>
          <h3 className={`${display.className} mt-3 text-[28px] font-medium leading-[1.12] text-white sm:text-[32px] lg:mt-2.5 lg:text-[34px] xl:text-[36px]`}>
            <Linhas texto={d.titulo} />
          </h3>
          {d.destaque && (
            <p className="mt-3 flex items-start gap-2 text-[17px] font-semibold leading-snug text-[#cfe3f6] lg:text-lg">
              <IconeCheckDestaque />
              {d.destaque}
            </p>
          )}
          <p className={`mt-3 leading-relaxed text-white/80 lg:leading-snug ${d.destaque ? "text-[15px] lg:text-base" : "text-base lg:text-[17px]"}`}>
            <Linhas texto={d.descricao} />
          </p>
          {d.remuneracao && (
            <p className="mt-5 lg:mt-4">
              <span className="block text-2xl font-semibold tabular-nums text-white lg:text-[26px]">{d.remuneracao.valor}</span>
              {d.remuneracao.detalhe && <span className="mt-1 block text-sm text-white/70">{d.remuneracao.detalhe}</span>}
            </p>
          )}
          <div className="mt-6 lg:mt-5">{botao}</div>
        </div>
      </div>
      {/* Faixa inferior única: 3 benefícios + condições em bloco separado. */}
      <div className="border-t border-white/10 bg-[#061a2e] px-6 py-5 sm:px-10 lg:px-12 lg:py-4">
        <ul className="grid gap-3 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-2">
          {d.beneficios.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[15px] leading-snug text-white">
              <IconeCheckDestaque />
              {b}
            </li>
          ))}
        </ul>
        {d.condicoes.length > 0 && (
          <div className="mt-4 space-y-1 border-t border-white/10 pt-3 lg:mt-3 lg:space-y-0.5 lg:pt-2.5">
            {d.condicoes.map((c) => (
              <p key={c} className="text-[13.5px] leading-5 text-white/75">
                {c}
              </p>
            ))}
          </div>
        )}
      </div>
      {!ativo && <span className="sr-only">(slide oculto)</span>}
    </div>
  );
}

function CarrosselDestaques({ destaques: DESTAQUES, onAbrir }: { destaques: Destaque[]; onAbrir: (d: Destaque) => void }) {
  const [indice, setIndice] = useState(0);
  // Pausa automática (mouse em cima, foco dentro, toque) e pausa do usuário
  // (botão) são separadas: a do usuário só sai pelo botão.
  const [pausaInteracao, setPausaInteracao] = useState(false);
  // null = o usuário ainda não mexeu: vale a preferência do sistema.
  const [escolhaUsuario, setEscolhaUsuario] = useState<boolean | null>(null);
  // Quem pediu menos movimento no sistema começa com a rotação parada.
  const reduzMovimento = useSyncExternalStore(
    (avisar) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", avisar);
      return () => mq.removeEventListener("change", avisar);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const pausaUsuario = escolhaUsuario ?? reduzMovimento;
  const total = DESTAQUES.length;
  const abasRef = useRef<HTMLDivElement | null>(null);

  // Rotação automática a cada 6s (já existia), parada em qualquer pausa.
  useEffect(() => {
    if (pausaInteracao || pausaUsuario) return;
    const t = setInterval(() => setIndice((i) => (i + 1) % total), 6000);
    return () => clearInterval(t);
  }, [pausaInteracao, pausaUsuario, total]);

  // Mantém a aba ativa visível na faixa de abas (rolagem só da faixa, nunca da página).
  useEffect(() => {
    const lista = abasRef.current;
    const aba = lista?.querySelector<HTMLElement>(`[data-aba="${indice}"]`);
    if (!lista || !aba) return;
    const esquerda = aba.offsetLeft - lista.offsetLeft;
    if (esquerda < lista.scrollLeft || esquerda + aba.offsetWidth > lista.scrollLeft + lista.clientWidth) {
      lista.scrollTo({ left: Math.max(0, esquerda - 16), behavior: "smooth" });
    }
  }, [indice]);

  const ir = (i: number) => setIndice(((i % total) + total) % total);

  function teclaAbas(e: React.KeyboardEvent<HTMLDivElement>) {
    let alvo: number | null = null;
    if (e.key === "ArrowRight") alvo = (indice + 1) % total;
    else if (e.key === "ArrowLeft") alvo = (indice - 1 + total) % total;
    else if (e.key === "Home") alvo = 0;
    else if (e.key === "End") alvo = total - 1;
    if (alvo === null) return;
    e.preventDefault();
    ir(alvo);
    abasRef.current?.querySelector<HTMLElement>(`[data-aba="${alvo}"]`)?.focus();
  }

  // Swipe no celular — sem biblioteca, só toque inicial/final.
  const [toqueX, setToqueX] = useState<number | null>(null);

  const classeControle =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/15 text-[#0A2540] transition hover:border-black/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c6ea8] focus-visible:ring-offset-2";

  return (
    <div
      role="region"
      aria-roledescription="carrossel"
      aria-label="Oportunidades em destaque"
      onMouseEnter={() => setPausaInteracao(true)}
      onMouseLeave={() => setPausaInteracao(false)}
      onFocusCapture={() => setPausaInteracao(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPausaInteracao(false);
      }}
    >
      <div
        className="relative overflow-hidden rounded-2xl bg-[#061a2e]"
        onTouchStart={(e) => {
          setPausaInteracao(true);
          setToqueX(e.touches[0]?.clientX ?? null);
        }}
        onTouchEnd={(e) => {
          const fim = e.changedTouches[0]?.clientX ?? null;
          if (toqueX !== null && fim !== null && Math.abs(fim - toqueX) > 40) ir(indice + (fim < toqueX ? 1 : -1));
          setToqueX(null);
        }}
      >
        {/* transform-gpu: evita o flash preto do Safari iOS em carrossel
            (ver learnings do projeto). Trilho com translateX, sem scroll JS.
            Os slides esticam até o mais alto: altura igual entre slides,
            definida pelo conteúdo (sem altura fixa que corte texto). */}
        <div
          className="flex transform-gpu transition-transform duration-700 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${indice * 100}%)` }}
        >
          {DESTAQUES.map((d, i) => (
            <div
              key={d.id}
              id={`destaque-painel-${d.id}`}
              role="tabpanel"
              aria-roledescription="slide"
              aria-labelledby={`destaque-aba-${d.id}`}
              aria-hidden={i !== indice}
              inert={i !== indice}
              className="w-full shrink-0"
            >
              <SlideDestaque d={d} ativo={i === indice} onAbrir={onAbrir} />
            </div>
          ))}
        </div>
      </div>

      {/* Navegação: abas com nome (rolagem horizontal própria no celular),
          posição, pausa e setas. */}
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
        <div
          ref={abasRef}
          role="tablist"
          aria-label="Escolher destaque"
          onKeyDown={teclaAbas}
          className="-mx-1 flex min-w-0 gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {DESTAQUES.map((d, i) => (
            <button
              key={d.id}
              id={`destaque-aba-${d.id}`}
              data-aba={i}
              type="button"
              role="tab"
              aria-selected={i === indice}
              aria-controls={`destaque-painel-${d.id}`}
              tabIndex={i === indice ? 0 : -1}
              onClick={() => ir(i)}
              className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-full px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c6ea8] focus-visible:ring-offset-2 ${
                i === indice ? "bg-[#0A2540] text-white" : "border border-black/15 text-[#0A2540]/75 hover:border-black/40 hover:text-[#0A2540]"
              }`}
            >
              {d.aba}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          <p className="mr-2 text-sm tabular-nums text-black/55" aria-live="polite">
            <span className="font-semibold text-[#0A2540]">{indice + 1}</span> de {total}
          </p>
          <button
            type="button"
            onClick={() => setEscolhaUsuario(!pausaUsuario)}
            aria-label={pausaUsuario ? "Retomar rotação automática dos destaques" : "Pausar rotação automática dos destaques"}
            className={classeControle}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              {pausaUsuario ? <path d="M8 5.5v13l10.5-6.5L8 5.5z" /> : <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />}
            </svg>
          </button>
          {(["anterior", "proximo"] as const).map((lado) => (
            <button
              key={lado}
              type="button"
              onClick={() => ir(indice + (lado === "proximo" ? 1 : -1))}
              aria-label={lado === "proximo" ? "Próximo destaque" : "Destaque anterior"}
              className={classeControle}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <path d={lado === "proximo" ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Seções obrigatórias de detalhe de toda vaga (ver InfoVaga em
// app/lib/vagasCatalogo.ts) — pedido do Wilson, 06/out/2026. Quando o dado
// ainda não chegou, mostra "A confirmar" em vez de esconder a seção, pra
// deixar claro que é uma informação que existe e vai ser passada. Moradia
// cai no texto padrão das fichas UT Suri-emu quando a vaga é dessa fonte.
export function InfoObrigatoriaVaga({ vaga }: { vaga: Vaga }) {
  const pendente = <span className="text-black/40">A confirmar com a nossa equipe.</span>;
  const moradia =
    vaga.info.moradia ?? (vaga.fonteContrato === "ut-suriemu" ? CONDICOES_UT_SURIEMU.moradia : null);
  const lista = (itens: string[]) =>
    itens.length > 0 ? (
      <ul className="space-y-1">
        {itens.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#2f80c9]" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ) : (
      pendente
    );
  const secoes: { titulo: string; conteudo: React.ReactNode }[] = [
    { titulo: "Moradia", conteudo: moradia ?? pendente },
    { titulo: "Diferenciais da hospedagem", conteudo: lista(vaga.info.diferenciaisHospedagem) },
    { titulo: "Benefícios", conteudo: lista(vaga.info.beneficios) },
    { titulo: "Kit de boas-vindas", conteudo: vaga.info.kitBoasVindas ?? pendente },
    { titulo: "Bônus", conteudo: vaga.info.bonus ?? pendente },
    { titulo: `Sobre ${vaga.cidade}`, conteudo: vaga.info.sobreCidade ?? pendente },
  ];
  return (
    <dl className="divide-y divide-black/[0.07]">
      {secoes.map((s) => (
        <div key={s.titulo} className="py-3 first:pt-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55">{s.titulo}</dt>
          <dd className="mt-1 text-[13px] leading-6 text-black/70">{s.conteudo}</dd>
        </div>
      ))}
    </dl>
  );
}

// Corpo de detalhes de uma vaga — condução, moradia, seguro social, exame
// médico e financiamento de passagem, quando a ficha original tem esse
// bloco (CONDICOES_UT_SURIEMU). Pras demais vagas, mostra só o convite pro
// WhatsApp em vez de inventar dado que a fonte não trouxe. Usado dentro do
// pop-up de detalhes (ver Modal de vaga, 19/set/2026).
export function DetalhesVaga({ vaga }: { vaga: Vaga }) {
  const temDetalhe = Boolean(vaga.conducao || vaga.observacoes || vaga.fonteContrato);
  return (
    <div className="space-y-2.5 text-[13px] leading-6 text-black/60">
      {vaga.conducao && (
        <p>
          <span className="font-semibold text-black/75">Condução ao trabalho: </span>
          {vaga.conducao}
        </p>
      )}
      {/* Moradia saiu daqui (06/out/2026) — agora é uma seção própria em
          InfoObrigatoriaVaga. Fica só a observação livre da ficha. */}
      {vaga.observacoes && (
        <p>
          <span className="font-semibold text-black/75">Observações: </span>
          {vaga.observacoes}
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
      {!temDetalhe && <p>Documentos e demais condições dessa vaga — fale com a gente pelo WhatsApp.</p>}
    </div>
  );
}


// Análise da vaga: saiu daqui em 08/out/2026 e virou um componente próprio,
// mais completo — app/components/empregos/AnaliseVaga.tsx (cálculos em
// app/lib/analiseVagas.ts). Reexportado abaixo pra manter o import antigo.
export { default as AnaliseVaga } from "../components/empregos/AnaliseVaga";

// Regiões do filtro — derivadas das próprias vagas cadastradas, em vez de
// uma lista mantida à parte, pra crescer automaticamente conforme o
// Wilson for mandando mais fichas.

export const SETOR_NOME: Record<SetorKey, string> = {
  automotivo: "Automobilístico",
  eletronicos: "Componentes Eletrônicos",
  alimenticio: "Alimentício",
  materiais: "Materiais Industriais",
};

export const STATUS_LABEL: Record<StatusVaga, string> = {
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

export default function EmpregosCliente({ inativas }: { inativas: string[] }) {
  const router = useRouter();
  // Vagas desligadas no CRM somem do catálogo (e das regiões do filtro).
  const vagasNoSite = useMemo(() => {
    const fora = new Set(inativas);
    return VAGAS.filter((v) => !fora.has(v.id));
  }, [inativas]);
  const REGIOES = useMemo(
    () => Array.from(new Set(vagasNoSite.map((v) => v.regiao))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [vagasNoSite],
  );
  // Card do carrossel que filtra um grupo de vagas mostra só as que estão
  // ligadas no CRM (contagem e botão ajustados); sem nenhuma ativa, o card
  // sai do carrossel — Wilson, 19/out/2026 ("vagas desse banner não aparecem").
  const destaquesAtivos = useMemo(() => {
    const fora = new Set(inativas);
    return DESTAQUES.flatMap((d): Destaque[] => {
      const ids = d.cta.vagaIds;
      if (!ids) return [d];
      const ativos = ids.filter((id) => !fora.has(id));
      if (!ativos.length) return [];
      if (ativos.length === ids.length) return [d];
      const n = ativos.length;
      const trocar = (t: string) => t.replace(new RegExp(`\\b${ids.length} vagas\\b`), n === 1 ? "1 vaga" : `${n} vagas`);
      return [
        {
          ...d,
          descricao: typeof d.descricao === "string" ? trocar(d.descricao) : [trocar(d.descricao[0]), trocar(d.descricao[1])],
          cta: { ...d.cta, vagaIds: ativos, rotulo: n === 1 ? "Ver a vaga" : `Ver as ${n} vagas` },
        },
      ];
    });
  }, [inativas]);
  const [publicoFiltro, setPublicoFiltro] = useState<PublicoKey | "todos">("todos");
  const [setorFiltro, setSetorFiltro] = useState<SetorKey | "todos">("todos");
  const [regioesFiltro, setRegioesFiltro] = useState<Set<string>>(new Set());
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  // Filtro aplicado por um card do carrossel com grupo de vagas.
  const [destaqueFiltro, setDestaqueFiltro] = useState<{ titulo: string; ids: string[] } | null>(null);
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

  function irParaVagas(ajustes?: { publico?: PublicoKey | "todos"; setor?: SetorKey | "todos"; regiao?: string }) {
    if (ajustes?.publico !== undefined) setPublicoFiltro(ajustes.publico);
    if (ajustes?.regiao !== undefined) setRegioesFiltro(new Set([ajustes.regiao]));
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

  const vagasFiltradas = useMemo(() => {
    return vagasNoSite.filter((vaga) => {
      if (destaqueFiltro && !destaqueFiltro.ids.includes(vaga.id)) return false;
      if (publicoFiltro !== "todos" && !vaga.publico.includes(publicoFiltro)) return false;
      if (setorFiltro !== "todos" && vaga.setor !== setorFiltro) return false;
      if (regioesFiltro.size > 0 && !regioesFiltro.has(vaga.regiao)) return false;
      return true;
    });
  }, [vagasNoSite, destaqueFiltro, publicoFiltro, setorFiltro, regioesFiltro]);

  const vagasSelecionadas = VAGAS.filter((v) => selecionadas.has(v.id));

  function mensagemCandidatura() {
    const linhas = [
      "Olá! Tenho interesse nas vagas abaixo (catálogo Ajisai Empregos):",
      "",
      ...vagasSelecionadas.map((v) => `• ${v.titulo} — ${v.empresa}, ${localVaga(v)} (${SETOR_NOME[v.setor]})`),
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
          <Link href="/empregos" aria-label="Ajisai Empregos — página inicial">
            <img src="/images/AJISAI-LOGO.avif" alt="Ajisai" className="h-10 w-auto object-contain invert md:h-11" />
          </Link>
          {/* Botão "Falar no WhatsApp" removido do header — pedido do
              Wilson, 06/out/2026. */}
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
        {/* Widescreen (Wilson, 27/out/2026): a colagem (2752×1536) não passa de
            1400 px — acima disso o object-cover ampliava e cortava os rostos.
            As laterais mostram a própria colagem ampliada e desfocada (sem
            faixa azul lisa), e a imagem nítida esmaece nas bordas. */}
        <div className="absolute inset-0 hidden min-[1400px]:block" aria-hidden="true">
          <Image src="/images/empregos-hero-colagem.jpg" alt="" fill sizes="100vw" className="scale-110 object-cover blur-2xl" />
        </div>
        <div className="absolute inset-y-0 left-1/2 w-full max-w-[1400px] -translate-x-1/2 min-[1400px]:[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <Image
            src="/images/empregos-hero-colagem.jpg"
            alt="Trabalhadores em fábricas no Japão — linha alimentícia, automotiva, eletrônicos e logística"
            fill
            priority
            sizes="(min-width: 1400px) 1400px, 100vw"
            className="object-cover object-top"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] from-15% via-[#0A2540]/75 via-45% to-[#0A2540]/10 to-90%" />
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

      {/* ── DESTAQUES (carrossel) — pedido do Wilson, 06/out/2026 ── */}
      <section className="border-b border-black/10 bg-white px-6 pt-14 md:px-16 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Destaques</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
            Oportunidades em destaque
          </h2>
          <div className="mt-8 pb-14 md:pb-20">
            <CarrosselDestaques
              destaques={destaquesAtivos}
              onAbrir={(d) => {
                if (d.cta.vagaIds?.length) {
                  setDestaqueFiltro({ titulo: typeof d.titulo === "string" ? d.titulo : d.titulo.join(" "), ids: d.cta.vagaIds });
                  irParaVagas({ publico: "todos", setor: "todos" });
                  setRegioesFiltro(new Set());
                }
              }}
            />
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

          {destaqueFiltro && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#2f80c9]/30 bg-[#2f80c9]/5 px-4 py-3 text-sm">
              <span className="text-black/70">
                Mostrando: <span className="font-semibold text-[#0A2540]">{destaqueFiltro.titulo}</span>
              </span>
              <button
                type="button"
                onClick={() => setDestaqueFiltro(null)}
                className="text-xs font-medium text-[#2f80c9] underline decoration-[#2f80c9]/30 underline-offset-2"
              >
                Ver todas as vagas
              </button>
            </div>
          )}

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
                      completo continua disponível na página da vaga (desde
                      08/out/2026 o clique abre /empregos/vagas/[id], não
                      mais o pop-up). */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/empregos/vagas/${vaga.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/empregos/vagas/${vaga.id}`);
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
                      {localVaga(vaga)} — Japão
                    </p>
                    <p className="mt-0.5 text-[11px] text-black/40">
                      <span className="font-mono">{vaga.codigo}</span> · Publicada em {formatarDataPostagem(vaga.publicadaEm)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold text-black/80">{vaga.salario}</p>
                    <div className="mt-2 flex-1 space-y-1 overflow-hidden text-[11px] leading-4 text-black/45">
                      <p className="line-clamp-1">{vaga.turno}</p>
                      <p className="line-clamp-1">{vaga.contrato}</p>
                      {vaga.perfil && <p className="line-clamp-2">Perfil: {vaga.perfil}</p>}
                      {vaga.idioma && <p className="line-clamp-1">Japonês: {vaga.idioma}</p>}
                    </div>
                    <Link
                      href={`/empregos/vagas/${vaga.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 inline-flex w-fit shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2f80c9]"
                    >
                      Ver vaga
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
                    </Link>
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

      {/* Pop-up de detalhes e modal de candidatura saíram daqui em
          08/out/2026 — Wilson: "porque as vagas abrem pop-up? pedi pra
          transformar todas em página própria". O card leva para
          /empregos/vagas/[id], que tem os detalhes e a candidatura. */}

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
type EtapaCandidatura = "formulario" | "resultado";
type SugestaoVaga = { vagaId: string; titulo: string; empresa: string; cidade: string; regiao: string; salario: string };

// Botões de opção (Sim/Não e similares) — mesmo visual das perguntas de
// triagem que já existiam.
function OpcoesBotao<T extends string>({
  valor,
  opcoes,
  onChange,
}: {
  valor: T | "";
  opcoes: { key: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {opcoes.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            valor === o.key ? "bg-[#2f80c9] text-white" : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const SIM_NAO: { key: "sim" | "nao"; label: string }[] = [
  { key: "sim", label: "Sim" },
  { key: "nao", label: "Não" },
];

// Máscara do telefone conforme o país (Wilson, 15/out/2026: "criar
// pré-formatação do número com separadores"). Brasil: (11) 93030-0101 ou
// (11) 3030-0101. Japão: celular 090-1234-5678; fixo 03-1234-5678 /
// 0XX-XXX-XXXX. Só reorganiza os dígitos — não valida operadora.
function formatarTelefone(valor: string, pais: "br" | "jp" | ""): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (pais === "br") {
    if (d.length <= 2) return d.length ? `(${d}` : "";
    const ddd = d.slice(0, 2);
    const resto = d.slice(2);
    if (resto.length <= 4) return `(${ddd}) ${resto}`;
    const corte = d.length === 11 ? 5 : 4;
    return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
  }
  if (pais === "jp") {
    if (/^0[5789]0/.test(d)) return [d.slice(0, 3), d.slice(3, 7), d.slice(7)].filter(Boolean).join("-");
    if (/^0[36]/.test(d)) return [d.slice(0, 2), d.slice(2, 6), d.slice(6)].filter(Boolean).join("-");
    return [d.slice(0, 3), d.slice(3, 6), d.slice(6)].filter(Boolean).join("-");
  }
  return d;
}

// Marcador de campo obrigatório — pedido do Wilson, 06/out/2026.
function Obrigatorio() {
  return (
    <span className="text-red-500" aria-hidden="true">
      *
    </span>
  );
}

// `pagina`: renderiza como página de "checkout" (/empregos/candidatura/[id])
// em vez de pop-up — Wilson, 08/out/2026: "páginas de candidatura devem ir
// para um site separado como se fosse uma página de checkout comum a todas
// as vagas". Mesmo formulário, mesma API.
export function CandidaturaModal({ vaga, onFechar, pagina = false }: { vaga: Vaga; onFechar: () => void; pagina?: boolean }) {
  const [etapa, setEtapa] = useState<EtapaCandidatura>("formulario");
  // Na página de checkout, o resultado aparece no topo (no pop-up o
  // próprio painel rola).
  useEffect(() => {
    if (pagina && etapa === "resultado") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pagina, etapa]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  // País do telefone — obrigatório (Wilson, 15/out/2026). Vai junto no
  // número enviado (+55 / +81) para a equipe chamar no WhatsApp certo.
  const [paisTelefone, setPaisTelefone] = useState<"br" | "jp" | "">("");
  const [idade, setIdade] = useState("");
  const [respostas, setRespostas] = useState<RespostasTriagem>({
    passaporte: "",
    disponibilidadeEmbarque: "",
    experienciaSetor: "",
    reEntry: "",
    nivelJapones: "",
    nivelJaponesDetalhado: "",
    ascendencia: "",
    quandoEmbarcar: "",
  });
  // Certificado JLPT/BJT — opcional (Wilson, 06/out/2026).
  const [certificado, setCertificado] = useState<File | null>(null);
  // Perguntas de perfil (Wilson, 06/out/2026) — ver app/lib/triagemPerfil.ts.
  const [perfil, setPerfil] = useState<PerfilCandidato>(PERFIL_VAZIO);
  const setP = <K extends keyof PerfilCandidato>(k: K, v: PerfilCandidato[K]) => setPerfil((p) => ({ ...p, [k]: v }));
  const exigeTesteDaltonismo = vagaExigeTesteDaltonismo(vaga);
  const perguntaFinanciamento = vaga.custosCobertosPelaEmpresa !== true;
  // Anexo da certidão da Polícia Federal removido do formulário (Wilson,
  // 15/out/2026). A API ainda aceita o campo se vier, mas o site não manda.
  const alternarEmLista = <K extends "tatuagemRegioes" | "condicoesVisuais" | "medicacaoClasses">(
    campo: K,
    item: PerfilCandidato[K][number],
  ) =>
    setPerfil((p) => {
      const atual = p[campo] as string[];
      const novo = atual.includes(item) ? atual.filter((x) => x !== item) : [...atual, item];
      return { ...p, [campo]: novo, ...(campo === "condicoesVisuais" ? { semCondicaoVisual: false } : {}) };
    });
  const turnoEliminatorio = criteriosDaVaga(vaga).turnoAlternado === "eliminatorio";
  const [respostasDaltonismo, setRespostasDaltonismo] = useState<Record<string, string>>({});
  // Placas sorteadas uma vez por formulário (controle + 3, ordem aleatória).
  const [placasDaltonismo] = useState(sortearPlacasDaltonismo);
  const testeDaltonismoCompleto = placasDaltonismo.every((pl) => (respostasDaltonismo[pl.id] ?? "") !== "");
  const perfilParaEnvio: PerfilCandidato = {
    ...perfil,
    testeDaltonismo: exigeTesteDaltonismo && testeDaltonismoCompleto ? avaliarTesteDaltonismo(respostasDaltonismo) : null,
  };

  const [aprovadoParaFoto, setAprovadoParaFoto] = useState(false);
  // Etapa 2 (ficha cadastral + foto) virou página própria — Wilson, 06/out/2026.
  const [fichaUrl, setFichaUrl] = useState<string | null>(null);
  // Parte 2 — sugestões de outras vagas quando não passa nesta (Wilson, 06/out/2026).
  const [sugestoes, setSugestoes] = useState<SugestaoVaga[]>([]);
  const [candidatura, setCandidatura] = useState<{ id: string; token: string } | null>(null);
  const [candidatandoSugestao, setCandidatandoSugestao] = useState<string | null>(null);

  async function candidatarSugestao(vagaId: string) {
    if (!candidatura || candidatandoSugestao) return;
    setCandidatandoSugestao(vagaId);
    setErro("");
    try {
      const r = await fetch("/api/empregos-candidatura-sugerida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidaturaId: candidatura.id, token: candidatura.token, vagaId }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.fichaUrl) {
        setErro(d.error || "Não foi possível registrar agora. Tente novamente.");
        setCandidatandoSugestao(null);
        return;
      }
      window.location.assign(d.fichaUrl);
    } catch {
      setErro("Não foi possível registrar agora. Tente novamente.");
      setCandidatandoSugestao(null);
    }
  }

  async function enviarFormulario(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;
    if (!nome || !sobrenome || !email || !telefone || !idade) {
      setErro("Preencha nome, sobrenome, e-mail, telefone e idade.");
      return;
    }
    if (!paisTelefone) {
      setErro("Informe se o seu telefone é do Brasil ou do Japão.");
      return;
    }
    if (telefone.replace(/\D/g, "").length < 10) {
      setErro("Confira o telefone: faltam dígitos (com DDD no Brasil, com o 0 inicial no Japão).");
      return;
    }
    // Perguntas de triagem (sim/não) passaram a ser obrigatórias — algumas
    // podem ser eliminatórias conforme a vaga (Wilson, 06/out/2026).
    if (PERGUNTAS_TRIAGEM.some((p) => !respostas[p.key])) {
      setErro("Responda todas as perguntas de Sim/Não.");
      return;
    }
    const faltaPerfil = pendenciasPerfil(perfilParaEnvio, { exigeTesteDaltonismo, perguntaFinanciamento });
    if (faltaPerfil.length > 0) {
      setErro(`Faltou responder: ${faltaPerfil.join(", ")}.`);
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
      form.append("telefone", `${paisTelefone === "jp" ? "+81" : "+55"} ${telefone.trim()}`);
      if (idade) form.append("idade", idade);
      form.append("respostas", JSON.stringify({ ...respostas, perfil: perfilParaEnvio }));
      if (certificado) form.append("certificadoJapones", certificado);
      const resposta = await fetch("/api/empregos-candidatura", { method: "POST", body: form });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dados.error || "Não foi possível enviar sua candidatura agora. Tente novamente.");
        setEnviando(false);
        return;
      }
      setAprovadoParaFoto(Boolean(dados.aprovadoParaFoto));
      setFichaUrl(typeof dados.fichaUrl === "string" ? dados.fichaUrl : null);
      setSugestoes(Array.isArray(dados.sugestoes) ? dados.sugestoes : []);
      setCandidatura(dados.tokenCandidatura ? { id: dados.candidaturaId, token: dados.tokenCandidatura } : null);
      // Conversão do ChatGPT Ads: candidatura enviada (Wilson, 27/out/2026).
      medirOpenAI("registration_completed", { type: "customer_action" }, typeof dados.candidaturaId === "string" ? { event_id: `candidatura_${dados.candidaturaId}` } : undefined);
      if (typeof dados.candidaturaId === "string") medirGoogleEmpregos("candidatura", dados.candidaturaId);
      setEtapa("resultado");
    } catch {
      setErro("Não foi possível enviar sua candidatura agora. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div
      className={pagina ? "" : "fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"}
      onClick={pagina ? undefined : onFechar}
    >
      <div
        role={pagina ? undefined : "dialog"}
        aria-modal={pagina ? undefined : true}
        onClick={(e) => e.stopPropagation()}
        className={
          pagina
            ? "w-full rounded-2xl border border-black/10 bg-white p-5 sm:p-8"
            : "max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
        }
      >
        <div className={`flex items-start justify-between gap-3 ${pagina ? "hidden" : ""}`}>
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
          <form onSubmit={enviarFormulario} className={`${pagina ? "" : "mt-5"} space-y-4`}>
            <PrazosProcesso atual="etapa1" semEtapa3={!perguntaFinanciamento} temReEntry={respostas.reEntry === "sim"} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-black/50">
                  Nome <Obrigatorio />
                </label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-black/50">
                  Sobrenome <Obrigatorio />
                </label>
                <input
                  value={sobrenome}
                  onChange={(e) => setSobrenome(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-black/50">
                  E-mail <Obrigatorio />
                </label>
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
                <label className="text-[11px] font-medium text-black/50">
                  Telefone (WhatsApp) <Obrigatorio />
                </label>
                <div className="mt-1 flex gap-1.5" role="radiogroup" aria-label="País do telefone">
                  {([
                    ["br", "Brasil +55"],
                    ["jp", "Japão +81"],
                  ] as const).map(([k, rot]) => (
                    <button
                      key={k}
                      type="button"
                      role="radio"
                      aria-checked={paisTelefone === k}
                      onClick={() => {
                        setPaisTelefone(k);
                        setTelefone((t) => formatarTelefone(t, k));
                      }}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition ${
                        paisTelefone === k ? "bg-[#2f80c9] text-white" : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08]"
                      }`}
                    >
                      {rot}
                    </button>
                  ))}
                </div>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(formatarTelefone(e.target.value, paisTelefone))}
                  required
                  inputMode="tel"
                  placeholder={paisTelefone === "jp" ? "090-1234-5678" : paisTelefone === "br" ? "(11) 91234-5678" : "Escolha o país acima"}
                  className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-black/50">
                  Idade <Obrigatorio />
                </label>
                <input
                  type="number"
                  min={16}
                  max={75}
                  value={idade}
                  onChange={(e) => setIdade(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                />
              </div>
            </div>

            <div className="border-t border-black/10 pt-4">
              <label className="text-[11px] font-medium text-black/50">
                Seu nível de japonês <Obrigatorio />
              </label>
              <p className="mt-0.5 text-[11px] leading-4 text-black/40">
                Não precisa ter feito a prova — escolha o nível equivalente ao que você fala hoje.
              </p>
              <select
                value={respostas.nivelJaponesDetalhado ?? ""}
                onChange={(e) => {
                  const detalhado = e.target.value as NivelJaponesDetalhado | "";
                  setRespostas((r) => ({ ...r, nivelJaponesDetalhado: detalhado, nivelJapones: nivelDoDetalhado(detalhado) }));
                  if (detalhado === "nenhum") setCertificado(null);
                }}
                required
                className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
              >
                <option value="" disabled>
                  Selecione
                </option>
                {NIVEIS_JAPONES_DETALHADOS.map((n) => (
                  <option key={n.key} value={n.key}>
                    {n.bjt ? `${n.label}  ·  ${n.bjt}` : n.label}
                  </option>
                ))}
              </select>
              {respostas.nivelJaponesDetalhado && respostas.nivelJaponesDetalhado !== "nenhum" && (
                <div className="mt-3">
                  <label className="text-[11px] font-medium text-black/50">
                    Certificado de aprovação JLPT ou BJT <span className="font-normal text-black/35">(opcional)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/*"
                    onChange={(e) => setCertificado(e.target.files?.[0] ?? null)}
                    className="mt-1 w-full rounded-xl border border-dashed border-black/15 px-3 py-2.5 text-xs text-black/60 outline-none file:mr-3 file:rounded-full file:border-0 file:bg-black/[0.04] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-black/70"
                  />
                  <p className="mt-1 text-[11px] text-black/40">PDF ou foto do certificado, até 8MB.</p>
                </div>
              )}
            </div>

            {/* Ascendência japonesa + data desejada de embarque — pedido
                do Wilson, 25/set/2026: "aqui ta faltando o pre-cadastro,
                anexar curriculo, nome completo, idade, ascendencia, etc
                quando gostaria de embarcar etc". */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-black/50">Ascendência japonesa</label>
                <select
                  value={respostas.ascendencia}
                  onChange={(e) =>
                    setRespostas((r) => ({ ...r, ascendencia: e.target.value as AscendenciaJaponesa | "" }))
                  }
                  required
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {ASCENDENCIA_JAPONESA.map((a) => (
                    <option key={a.key} value={a.key}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-black/50">Quando gostaria de embarcar?</label>
                <select
                  value={respostas.quandoEmbarcar}
                  onChange={(e) =>
                    setRespostas((r) => ({ ...r, quandoEmbarcar: e.target.value as QuandoEmbarcar | "" }))
                  }
                  required
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {QUANDO_EMBARCAR.map((q) => (
                    <option key={q.key} value={q.key}>
                      {q.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {PERGUNTAS_TRIAGEM.map((p) => (
              <div key={p.key}>
                <p className="text-xs font-medium text-black/70">
                  {p.pergunta} <Obrigatorio />
                </p>
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

            {/* ── PERFIL — perguntas eliminatórias/qualificatórias, pedido do
                Wilson, 06/out/2026. Cada vaga decide se a resposta elimina
                ou só informa (criteriosDaVaga). ── */}
            <div className="space-y-4 border-t border-black/10 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55">Seu perfil</p>

              <div className="max-w-[260px]">
                <label className="text-[11px] font-medium text-black/50">
                  CEP de residência <Obrigatorio />
                </label>
                <input
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="00000-000"
                  value={
                    perfil.cepResidencia.length > 5
                      ? `${perfil.cepResidencia.slice(0, 5)}-${perfil.cepResidencia.slice(5)}`
                      : perfil.cepResidencia
                  }
                  onChange={(e) => setP("cepResidencia", e.target.value.replace(/\D/g, "").slice(0, 8))}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                />
                <p className="mt-1 text-[11px] text-black/40">Mora no Japão? Use o código postal 〒 (7 dígitos).</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-black/50">
                    Peso (kg) <Obrigatorio />
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={30}
                    max={250}
                    value={perfil.pesoKg ?? ""}
                    onChange={(e) => setP("pesoKg", e.target.value === "" ? null : Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-black/50">
                    Altura (cm) <Obrigatorio />
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={120}
                    max={230}
                    placeholder="ex.: 172"
                    value={perfil.alturaCm ?? ""}
                    onChange={(e) => setP("alturaCm", e.target.value === "" ? null : Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                  />
                </div>
              </div>
              <p className="-mt-2 text-[11px] leading-4 text-black/40">
                Algumas fábricas têm exigências físicas para a função. Usamos esses dados só para checar os
                requisitos da vaga.
              </p>

              <div>
                <label className="text-[11px] font-medium text-black/50">
                  Escolaridade <Obrigatorio />
                </label>
                <select
                  value={perfil.escolaridade}
                  onChange={(e) => setP("escolaridade", e.target.value as PerfilCandidato["escolaridade"])}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {ESCOLARIDADES.map((e) => (
                    <option key={e.key} value={e.key}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Você tem daltonismo? <Obrigatorio />
                </p>
                {exigeTesteDaltonismo && (
                  <p className="mt-0.5 text-[11px] text-black/40">
                    Vagas de componentes eletrônicos exigem boa distinção de cores — por isso pedimos o teste rápido abaixo.
                  </p>
                )}
                <OpcoesBotao valor={perfil.daltonismo} opcoes={OPCOES_DALTONISMO} onChange={(v) => setP("daltonismo", v)} />
              </div>

              {exigeTesteDaltonismo && (
                <div className="rounded-2xl border border-black/10 bg-black/[0.015] p-4">
                  <p className="text-xs font-medium text-black/70">
                    Teste rápido de visão de cores <Obrigatorio />
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-black/45">
                    Digite o número que você vê em cada círculo. Se não enxergar nenhum, toque em &quot;Não vejo&quot;.
                    Faça com o brilho da tela normal e sem filtro de luz azul/modo noturno.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {placasDaltonismo.map((pl, i) => {
                      const v = respostasDaltonismo[pl.id] ?? "";
                      return (
                        <div key={pl.id} className="flex flex-col items-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={pl.imagem} alt={`Placa ${i + 1}`} className="aspect-square w-full max-w-[140px]" />
                          <div className="mt-1.5 flex w-full max-w-[140px] gap-1">
                            <input
                              inputMode="numeric"
                              maxLength={2}
                              aria-label={`Número da placa ${i + 1}`}
                              value={v === "-" ? "" : v}
                              placeholder={v === "-" ? "Não vejo" : "nº"}
                              onChange={(e) =>
                                setRespostasDaltonismo((r) => ({ ...r, [pl.id]: e.target.value.replace(/\D/g, "") }))
                              }
                              className="w-full min-w-0 rounded-lg border border-black/10 px-2 py-1.5 text-center text-sm text-black outline-none focus:border-[#2f80c9]"
                            />
                            <button
                              type="button"
                              onClick={() => setRespostasDaltonismo((r) => ({ ...r, [pl.id]: "-" }))}
                              className={`shrink-0 rounded-lg px-2 text-[10px] font-medium transition ${
                                v === "-" ? "bg-[#2f80c9] text-white" : "bg-black/[0.04] text-black/55 hover:bg-black/[0.08]"
                              }`}
                            >
                              Não vejo
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-black/70">
                  Você já esteve no Japão? <Obrigatorio />
                </p>
                <OpcoesBotao
                  valor={perfil.jaEsteveJapao}
                  opcoes={SIM_NAO}
                  onChange={(v) => setPerfil((p) => ({ ...p, jaEsteveJapao: v, ...(v === "nao" ? { anosNoJapao: null, dividasJapao: "", ajudaGovernoRetorno: "" } : {}) }))}
                />
                {perfil.jaEsteveJapao === "sim" && (
                  <div className="mt-2 max-w-[220px]">
                    <label className="text-[11px] font-medium text-black/50">
                      Quanto tempo no total (anos)? <Obrigatorio />
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      max={60}
                      step={0.5}
                      placeholder="ex.: 2,5"
                      value={perfil.anosNoJapao ?? ""}
                      onChange={(e) => setP("anosNoJapao", e.target.value === "" ? null : Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                    />
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Você tem filhos? <Obrigatorio />
                </p>
                <OpcoesBotao
                  valor={perfil.temFilhos}
                  opcoes={SIM_NAO}
                  onChange={(v) =>
                    setPerfil((p) => ({ ...p, temFilhos: v, idadesFilhos: v === "sim" ? (p.idadesFilhos.length ? p.idadesFilhos : [NaN]) : [] }))
                  }
                />
                {perfil.temFilhos === "sim" && (
                  <div className="mt-2">
                    <p className="text-[11px] font-medium text-black/50">
                      Idade de cada filho <Obrigatorio />
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {perfil.idadesFilhos.map((idadeFilho, i) => (
                        <input
                          key={i}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          max={40}
                          aria-label={`Idade do filho ${i + 1}`}
                          value={Number.isFinite(idadeFilho) ? idadeFilho : ""}
                          onChange={(e) =>
                            setPerfil((p) => ({
                              ...p,
                              idadesFilhos: p.idadesFilhos.map((x, j) => (j === i ? (e.target.value === "" ? NaN : Number(e.target.value)) : x)),
                            }))
                          }
                          className="w-16 rounded-xl border border-black/10 px-2 py-2 text-center text-sm text-black outline-none focus:border-[#2f80c9]"
                        />
                      ))}
                      {perfil.idadesFilhos.length < 10 && (
                        <button
                          type="button"
                          onClick={() => setPerfil((p) => ({ ...p, idadesFilhos: [...p.idadesFilhos, NaN] }))}
                          className="rounded-full bg-black/[0.04] px-3 py-1.5 text-xs font-medium text-black/60 hover:bg-black/[0.08]"
                        >
                          + filho
                        </button>
                      )}
                      {perfil.idadesFilhos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPerfil((p) => ({ ...p, idadesFilhos: p.idadesFilhos.slice(0, -1) }))}
                          className="rounded-full px-2 py-1.5 text-xs text-black/45 hover:text-black/70"
                        >
                          remover
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Aceita fazer horas extras? <Obrigatorio />
                </p>
                <OpcoesBotao valor={perfil.horasExtras} opcoes={OPCOES_HORAS_EXTRAS} onChange={(v) => setP("horasExtras", v)} />
              </div>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Aceita trabalhar em turno alternado? <Obrigatorio />
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-black/40">
                  Revezamento entre turnos de dia e de noite — por exemplo, 4 dias no turno do dia, 4 no da noite, com 2
                  dias de folga a cada 4. Os dias de folga e o turno podem mudar.
                  {turnoEliminatorio && " Esta vaga trabalha em turno alternado."}
                </p>
                <OpcoesBotao valor={perfil.turnoAlternado} opcoes={SIM_NAO} onChange={(v) => setP("turnoAlternado", v)} />
              </div>

              <div>
                <label className="text-[11px] font-medium text-black/50">Província de preferência</label>
                <select
                  value={perfil.provinciaPreferida}
                  onChange={(e) => setP("provinciaPreferida", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                >
                  <option value="">Sem preferência</option>
                  {/* Ordem alfabética (Wilson, 15/out/2026). */}
                  {[...PROVINCIAS_JAPAO].sort((x, y) => x.localeCompare(y, "pt-BR")).map((pr) => (
                    <option key={pr} value={pr}>
                      {pr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Se a vaga original não puder seguir, você tem flexibilidade de região? <Obrigatorio />
                </p>
                <div className="mt-2 space-y-1.5">
                  {OPCOES_FLEXIBILIDADE.map((o) => (
                    <label key={o.key} className="flex cursor-pointer items-center gap-2.5 text-xs text-black/70">
                      <input
                        type="radio"
                        name="flexibilidadeRegiao"
                        checked={perfil.flexibilidadeRegiao === o.key}
                        onChange={() => setP("flexibilidadeRegiao", o.key)}
                        className="h-4 w-4 text-[#2f80c9] focus:ring-[#2f80c9]"
                      />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Você possui dívidas em aberto no Brasil? <Obrigatorio />
                </p>
                <OpcoesBotao valor={perfil.dividasBrasil} opcoes={SIM_NAO} onChange={(v) => setP("dividasBrasil", v)} />
              </div>

              {perfil.jaEsteveJapao === "sim" && (
                <>
                  <div>
                    <p className="text-xs font-medium text-black/70">
                      Você possui dívidas em aberto no Japão (impostos/tributos)? <Obrigatorio />
                    </p>
                    <OpcoesBotao valor={perfil.dividasJapao} opcoes={SIM_NAO} onChange={(v) => setP("dividasJapao", v)} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-black/70">
                      Você já recebeu ajuda do governo japonês para retornar ao Brasil? <Obrigatorio />
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-black/40">
                      Por exemplo, o auxílio de passagem de retorno oferecido a descendentes em 2009–2010.
                    </p>
                    <OpcoesBotao valor={perfil.ajudaGovernoRetorno} opcoes={SIM_NAO} onChange={(v) => setP("ajudaGovernoRetorno", v)} />
                  </div>
                </>
              )}

              {perguntaFinanciamento && (
                <div>
                  <p className="text-xs font-medium text-black/70">
                    Pretende financiar a taxa de contratação, a passagem aérea e a emissão de documentos? <Obrigatorio />
                  </p>
                  <p className="mt-0.5 text-[11px] leading-4 text-black/40">
                    Nesta vaga esses custos não são cobertos pela empresa. O financiamento é descontado do salário
                    em parcelas — confirmamos as condições com você.
                  </p>
                  <OpcoesBotao valor={perfil.financiamentoCustos} opcoes={OPCOES_FINANCIAMENTO} onChange={(v) => setP("financiamentoCustos", v)} />
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-black/70">
                  Você possui antecedentes criminais? <Obrigatorio />
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-black/40">
                  O visto de trabalho japonês avalia esse ponto.
                </p>
                <OpcoesBotao valor={perfil.antecedentesCriminais} opcoes={SIM_NAO} onChange={(v) => setP("antecedentesCriminais", v)} />
              </div>

              {/* Animal de estimação — veio da ficha para cá porque é
                  eliminatório nas vagas da Murata (Wilson, 15/out/2026). */}
              <div>
                <p className="text-xs font-medium text-black/70">
                  Pretende levar animal de estimação para o Japão? <Obrigatorio />
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-black/40">
                  A maioria das moradias das empresas parceiras não aceita animais.
                </p>
                <OpcoesBotao
                  valor={perfil.animalEstimacao}
                  opcoes={SIM_NAO}
                  onChange={(v) => setPerfil((p) => ({ ...p, animalEstimacao: v, ...(v === "nao" ? { animalDetalhe: "" } : {}) }))}
                />
                {perfil.animalEstimacao === "sim" && (
                  <input
                    value={perfil.animalDetalhe}
                    onChange={(e) => setP("animalDetalhe", e.target.value.slice(0, 120))}
                    placeholder="Qual animal? (ex.: 1 gato)"
                    className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                  />
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Você tem tatuagem? <Obrigatorio />
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-black/40">
                  Não é critério de avaliação pessoal. No Japão, algumas empresas, alojamentos com banho coletivo,
                  onsen e academias têm regras próprias para tatuagens — perguntamos só para indicar vagas e
                  moradias compatíveis com você.
                </p>
                <OpcoesBotao
                  valor={perfil.tatuagem}
                  opcoes={SIM_NAO}
                  onChange={(v) =>
                    setPerfil((p) => ({
                      ...p,
                      tatuagem: v,
                      ...(v === "nao"
                        ? { tatuagemTipo: "", tatuagemVisivel: "nao", tatuagemRegioes: [], tatuagemTamanho: "" }
                        : { tatuagemVisivel: tatuagemVisivelDerivada("sim", p.tatuagemTipo) }),
                    }))
                  }
                />
                {perfil.tatuagem === "sim" && (
                  <div className="mt-2">
                    <p className="text-[11px] font-medium text-black/50">
                      Qual tipo? <Obrigatorio />
                    </p>
                    <OpcoesBotao
                      valor={perfil.tatuagemTipo}
                      opcoes={TIPOS_TATUAGEM}
                      onChange={(v) => setPerfil((p) => ({ ...p, tatuagemTipo: v, tatuagemVisivel: tatuagemVisivelDerivada("sim", v) }))}
                    />
                    <p className="mt-1 text-[10px] leading-4 text-black/40">Visível = aparece usando uniforme de manga curta.</p>
                  </div>
                )}
                {perfil.tatuagem === "sim" && (
                  <div className="mt-2 space-y-2">
                    <p className="text-[11px] font-medium text-black/50">
                      Em quais regiões? <Obrigatorio />
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {REGIOES_TATUAGEM.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          aria-pressed={perfil.tatuagemRegioes.includes(r.key)}
                          onClick={() => alternarEmLista("tatuagemRegioes", r.key)}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                            perfil.tatuagemRegioes.includes(r.key) ? "bg-[#2f80c9] text-white" : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08]"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    <p className="pt-1 text-[11px] font-medium text-black/50">
                      Tamanho da maior <Obrigatorio />
                    </p>
                    <OpcoesBotao valor={perfil.tatuagemTamanho} opcoes={TAMANHOS_TATUAGEM} onChange={(v) => setP("tatuagemTamanho", v)} />
                  </div>
                )}
              </div>
            </div>

            {/* ── SAÚDE — perguntas 17–21 (Wilson, 06/out/2026). Consentimento
                específico antes das perguntas (LGPD art. 11); nenhuma resposta
                daqui elimina automaticamente por padrão — vão pra revisão da
                equipe (ver CRITERIOS_TRIAGEM_PADRAO). ── */}
            <div className="space-y-4 border-t border-black/10 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55">Saúde</p>
              <p className="text-[11px] leading-4 text-black/45">
                Essas informações servem para garantir sua segurança no Japão: indicar cidades com estrutura médica
                compatível, moradia adequada e checar regras de entrada de medicamentos no país. Ficam restritas à
                equipe de recrutamento da Ajisai e não são repassadas sem a sua autorização.
              </p>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-black/10 bg-black/[0.015] p-3 text-xs leading-5 text-black/70">
                <input
                  type="checkbox"
                  checked={perfil.consentimentoSaude}
                  onChange={(e) => setP("consentimentoSaude", e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/30 text-[#2f80c9] focus:ring-[#2f80c9]"
                />
                <span>
                  Autorizo a Ajisai a usar os dados de saúde abaixo exclusivamente para avaliar a compatibilidade da vaga,
                  da cidade e da moradia comigo. <Obrigatorio />
                </span>
              </label>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Já teve alguma doença grave ou está em tratamento médico atualmente? <Obrigatorio />
                </p>
                <OpcoesBotao
                  valor={perfil.doencaGrave}
                  opcoes={SIM_NAO}
                  onChange={(v) => setPerfil((p) => ({ ...p, doencaGrave: v, ...(v === "nao" ? { emTratamento: "", doencaGraveDescricao: "" } : {}) }))}
                />
                {perfil.doencaGrave === "sim" && (
                  <div className="mt-2 space-y-2">
                    <input
                      value={perfil.doencaGraveDescricao}
                      onChange={(e) => setP("doencaGraveDescricao", e.target.value)}
                      placeholder="Qual? (opcional)"
                      maxLength={500}
                      className="w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
                    />
                    <p className="text-[11px] font-medium text-black/50">
                      Está em tratamento atualmente? <Obrigatorio />
                    </p>
                    <OpcoesBotao valor={perfil.emTratamento} opcoes={SIM_NAO} onChange={(v) => setP("emTratamento", v)} />
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Você tem alguma destas condições visuais? <Obrigatorio />
                </p>
                <p className="mt-0.5 text-[11px] text-black/40">Miopia, astigmatismo e hipermetropia não entram aqui.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    aria-pressed={perfil.semCondicaoVisual}
                    onClick={() => setPerfil((p) => ({ ...p, semCondicaoVisual: !p.semCondicaoVisual, condicoesVisuais: [] }))}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                            perfil.semCondicaoVisual ? "bg-[#2f80c9] text-white" : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08]"
                          }`}
                  >
                    Nenhuma
                  </button>
                  {CONDICOES_VISUAIS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      aria-pressed={perfil.condicoesVisuais.includes(c.key)}
                      onClick={() => alternarEmLista("condicoesVisuais", c.key)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                            perfil.condicoesVisuais.includes(c.key) ? "bg-[#2f80c9] text-white" : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08]"
                          }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Você fuma? <Obrigatorio />
                </p>
                <OpcoesBotao valor={perfil.fumante} opcoes={OPCOES_FUMANTE} onChange={(v) => setP("fumante", v)} />
              </div>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Toma atualmente algum medicamento controlado? <Obrigatorio />
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-black/40">
                  Alguns remédios são proibidos ou exigem autorização prévia para entrar no Japão — perguntamos para
                  orientar você antes do embarque.
                </p>
                <OpcoesBotao
                  valor={perfil.medicacaoControlada}
                  opcoes={SIM_NAO}
                  onChange={(v) => setPerfil((p) => ({ ...p, medicacaoControlada: v, ...(v === "nao" ? { medicacaoClasses: [] } : {}) }))}
                />
                {perfil.medicacaoControlada === "sim" && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CLASSES_MEDICAMENTO.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        aria-pressed={perfil.medicacaoClasses.includes(c.key)}
                        onClick={() => alternarEmLista("medicacaoClasses", c.key)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                            perfil.medicacaoClasses.includes(c.key) ? "bg-[#2f80c9] text-white" : "bg-black/[0.04] text-black/60 hover:bg-black/[0.08]"
                          }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Você tem diabetes? <Obrigatorio />
                </p>
                <OpcoesBotao
                  valor={perfil.diabetes}
                  opcoes={SIM_NAO}
                  onChange={(v) => setPerfil((p) => ({ ...p, diabetes: v, ...(v === "nao" ? { diabetesTipo: "", insulinaInjetavel: "" } : {}) }))}
                />
                {perfil.diabetes === "sim" && (
                  <div className="mt-2 space-y-2">
                    <p className="text-[11px] font-medium text-black/50">
                      Qual tipo? <Obrigatorio />
                    </p>
                    <OpcoesBotao valor={perfil.diabetesTipo} opcoes={TIPOS_DIABETES} onChange={(v) => setP("diabetesTipo", v)} />
                    <p className="pt-1 text-[11px] font-medium text-black/50">
                      Usa insulina injetável? <Obrigatorio />
                    </p>
                    <p className="text-[11px] leading-4 text-black/40">
                      Para garantir moradia e local de trabalho com estrutura de higiene adequada para a aplicação.
                    </p>
                    <OpcoesBotao valor={perfil.insulinaInjetavel} opcoes={SIM_NAO} onChange={(v) => setP("insulinaInjetavel", v)} />
                  </div>
                )}
              </div>
            </div>

            {/* Campo de currículo removido — Wilson, 15/out/2026. */}
            <p className="text-[11px] text-black/40">
              <Obrigatorio /> Campos obrigatórios
            </p>

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
            {/* Pontuação e compatibilidade não aparecem para o candidato
                (Wilson, 15/out/2026) — ficam só no CRM e no e-mail da equipe. */}

            {aprovadoParaFoto ? (
              <div className="mt-6 rounded-2xl bg-[#2f80c9]/[0.06] p-4">
                {vagaExigeTestesAptidao(vaga.id) ? (
                  <p className="text-xs leading-5 text-black/70">
                    Parabéns! Seu perfil foi pré-aprovado para esta vaga. Ela pede antes os testes de
                    aptidão exigidos pela empresa (visão, matemática, atenção e japonês) — leva uns 15 minutos. Depois
                    vem a ficha cadastral com a sua foto.
                  </p>
                ) : (
                  <p className="text-xs leading-5 text-black/70">
                    Parabéns! Seu perfil foi pré-aprovado para esta vaga. A etapa 2 é a ficha cadastral
                    completa (documentos, experiência, família e saúde) com o envio da sua foto — leva uns 15 minutos.
                  </p>
                )}
                {fichaUrl ? (
                  <a
                    href={fichaUrl}
                    className="mt-4 flex w-full items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3b91dc]"
                  >
                    {vagaExigeTestesAptidao(vaga.id) ? "Fazer os testes de aptidão" : "Continuar para a etapa 2"}
                  </a>
                ) : (
                  <p className="mt-3 text-xs leading-5 text-black/55">
                    Nossa equipe vai te enviar o link da etapa 2 pelo e-mail ou telefone informados.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <div className="rounded-2xl bg-black/[0.03] p-5 text-center">
                  <p className={`${display.className} text-lg font-medium text-black`}>Obrigado, {nome}!</p>
                  <p className="mt-2 text-xs leading-5 text-black/65">
                    Recebemos sua candidatura e ela segue em análise pela nossa equipe. Entraremos em contato pelo
                    e-mail ou telefone informados.
                  </p>
                </div>

                {/* Vagas em que o mesmo perfil passaria — Wilson, 06/out/2026. */}
                {sugestoes.length > 0 && (
                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2f80c9]">
                      Vagas com mais a ver com o seu perfil
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-black/45">
                      Com as mesmas respostas, você já passaria para a próxima etapa nestas vagas — sem
                      precisar preencher tudo de novo.
                    </p>
                    <div className="mt-3 space-y-2.5">
                      {sugestoes.map((sg) => (
                        <div key={sg.vagaId} className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 p-3.5">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-black/45">{sg.empresa}</p>
                            <p className="truncate text-sm font-medium text-black">{sg.titulo}</p>
                            <p className="text-[11px] text-black/45">
                              {sg.cidade}
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={!!candidatandoSugestao}
                            onClick={() => candidatarSugestao(sg.vagaId)}
                            className="shrink-0 rounded-full bg-[#2f80c9] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#3b91dc] disabled:opacity-60"
                          >
                            {candidatandoSugestao === sg.vagaId ? "Enviando…" : "Quero esta"}
                          </button>
                        </div>
                      ))}
                    </div>
                    {erro && <p className="mt-2 text-xs text-red-500">{erro}</p>}
                  </div>
                )}
                <button
                  type="button"
                  onClick={onFechar}
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-black px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/80"
                >
                  {pagina ? "Voltar para a vaga" : "Fechar"}
                </button>
              </div>
            )}

            <PrazosProcesso atual={aprovadoParaFoto ? "etapa2" : "etapa1"} aberto={aprovadoParaFoto} semEtapa3={!perguntaFinanciamento} temReEntry={respostas.reEntry === "sim"} className="mt-5" />
          </div>
        )}

      </div>
    </div>
  );
}
