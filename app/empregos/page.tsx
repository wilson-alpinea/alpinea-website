"use client";

import { useEffect, useMemo, useState } from "react";
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
type PublicoKey = "brasil" | "japao";
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
type SetorKey = "automotivo" | "eletronicos" | "alimenticio" | "materiais";
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
  eletronicos: "/images/icon-setor-eletronicos.png",
  alimenticio: "/images/icon-setor-alimenticio.png",
  materiais: "/images/icon-setor-materiais.png",
};

function IconSetor({ setor, className }: { setor: SetorKey; className?: string }) {
  if (setor === "automotivo") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 13l1.6-4.8A2 2 0 0 1 6.5 7h11a2 2 0 0 1 1.9 1.2L21 13" />
        <path d="M3 13h18v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4Z" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="16.5" cy="17.5" r="1.5" />
      </svg>
    );
  }
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
type StatusVaga = "aberta" | "consulta";

type Vaga = {
  id: string;
  empresa: string;
  titulo: string;
  setor: SetorKey;
  regiao: string;
  cidade: string;
  publico: PublicoKey[];
  turno: string;
  contrato: string;
  salario: string;
  status: StatusVaga;
  idioma?: string;
  perfil?: string;
  logo?: string;
  conducao?: string;
  observacoes?: string;
  fonteContrato?: "ut-suriemu";
};

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

const VAGAS: Vaga[] = [
  // ── Avance RH/Corporation — comunicado + fichas individuais ──
  {
    id: "fuji-seat-higashiomi",
    empresa: "Fuji Seat",
    titulo: "Montagem e inspeção de bancos de carro",
    setor: "automotivo",
    regiao: "Shiga",
    cidade: "Higashiomi",
    publico: ["brasil"],
    turno: "Turno alternado semanalmente (diurno/noturno), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.400/hora",
    status: "aberta",
    idioma: "Não mandatório",
    perfil: "Homens até 45 anos",
  },
  {
    id: "aisin-shinwa-toyama",
    empresa: "Aisin Shinwa",
    titulo: "Processamento e inspeção de autopeças",
    setor: "automotivo",
    regiao: "Toyama",
    cidade: "Shimoniikawa Gun",
    publico: ["brasil"],
    turno: "Turno alternado semanalmente, 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.600/hora",
    status: "aberta",
    logo: "/images/logo-cliente-aisin.png",
    idioma: "Básico (N4), preferência razoável (N3)",
    perfil: "Homens até 45 anos — precisa ter carro próprio e experiência em fábrica no Brasil ou no Japão",
  },
  {
    id: "marugo-gomu-okayama",
    empresa: "Marugo Gomu",
    titulo: "Vulcanização, acabamento e inspeção de mangueiras automotivas",
    setor: "automotivo",
    regiao: "Okayama",
    cidade: "Oda Yakage-cho",
    publico: ["brasil"],
    turno: "Turno alternado semanalmente, 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.250–1.530/hora, conforme a função",
    status: "aberta",
    idioma: "Não mandatório",
    perfil: "Homens e mulheres até 50 anos",
  },
  {
    id: "murata-izumo",
    empresa: "Murata",
    titulo: "Produção de componentes eletrônicos (condensador cerâmico)",
    setor: "eletronicos",
    regiao: "Shimane",
    cidade: "Izumo",
    publico: ["brasil"],
    turno: "Turno fixo, diurno ou noturno, 4x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.340–1.390/hora (até ¥1.560/hora conforme desempenho)",
    status: "aberta",
    logo: "/images/logo-cliente-murata.png",
    idioma: "Não mandatório",
    perfil: "Homem, mulher ou casal até 50 anos",
  },
  {
    id: "murata-oda",
    empresa: "Murata",
    titulo: "Produção de componentes eletrônicos (condensador cerâmico)",
    setor: "eletronicos",
    regiao: "Shimane",
    cidade: "Oda",
    publico: ["brasil"],
    turno: "Turno fixo, diurno ou noturno, 4x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.340/hora (até ¥1.560/hora conforme desempenho)",
    status: "aberta",
    logo: "/images/logo-cliente-murata.png",
    idioma: "Não mandatório",
    perfil: "Homem, mulher ou casal até 50 anos",
  },
  {
    id: "daikin-kusatsu",
    empresa: "Daikin",
    titulo: "Produção, montagem e inspeção de ar-condicionado",
    setor: "eletronicos",
    regiao: "Shiga",
    cidade: "Kusatsu",
    publico: ["brasil"],
    turno: "Turno alternado semanalmente (diurno/noturno), 5x2 ou 4x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.400/hora (até ¥1.650/hora conforme desempenho)",
    status: "consulta",
    logo: "/images/logo-cliente-daikin.png",
    idioma: "Básico (N4)",
    perfil: "Homens e mulheres até 45 anos — previsão de vagas a partir de outubro/novembro",
  },
  {
    id: "cs-nakatsugawa-gifu",
    empresa: "CS Nakatsugawa",
    titulo: "Produção e inspeção de sensores automotivos",
    setor: "automotivo",
    regiao: "Gifu",
    cidade: "Nakatsugawa",
    publico: ["brasil"],
    turno: "Turno fixo ou alternado, 5x2 ou 6x1",
    contrato: "Haken ou ukeoi, conforme a vaga",
    salario: "¥1.400/hora",
    status: "consulta",
    idioma: "Preferencialmente com conhecimento de japonês",
    perfil: "Homens até 55 anos, não fumante",
  },
  {
    id: "ntk-kani-gifu",
    empresa: "NTK Kani",
    titulo: "Operação de máquina e inspeção de velas automotivas",
    setor: "automotivo",
    regiao: "Gifu",
    cidade: "Kani",
    publico: ["brasil"],
    turno: "Turno alternado mensalmente, 5x2 ou 4x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.300–1.400/hora, conforme o setor",
    status: "consulta",
    idioma: "Zero ou razoável (N3), a depender do setor",
    perfil: "Homem, mulher ou casal até 45 anos",
  },
  {
    id: "nitto-boseki-fukushima",
    empresa: "Nitto Boseki",
    titulo: "Produção de peças de fibra de vidro",
    setor: "materiais",
    regiao: "Fukushima",
    cidade: "Fukushima",
    publico: ["brasil"],
    turno: "3 turnos (05:55–14:15 / 13:55–22:15 / 21:55–06:15)",
    contrato: "Terceirizado (Out-Sourcing)",
    salario: "¥1.300/hora",
    status: "consulta",
    idioma: "Básico (N4)",
    perfil: "Homens até 50 anos — previsão de vagas a partir de setembro",
  },
  // ── UT Suri-emu — fichas de contrato por empresa ──
  {
    id: "subaru-oizumi",
    empresa: "Subaru",
    titulo: "Montagem, abastecimento e inspeção de veículos",
    setor: "automotivo",
    regiao: "Gunma",
    cidade: "Oizumi",
    publico: ["brasil"],
    turno: "Turno alternado (diurno/noturno/sankoutai, conforme escala)",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.800–1.900/hora",
    status: "aberta",
    logo: "/images/logo-cliente-subaru.png",
    conducao: "Bicicleta (alugada pela empresa) — condução própria (carro/moto) possível, consultar a unidade.",
    fonteContrato: "ut-suriemu",
  },
  {
    id: "subaru-ota",
    empresa: "Subaru",
    titulo: "Montagem, abastecimento e inspeção de veículos",
    setor: "automotivo",
    regiao: "Gunma",
    cidade: "Ota",
    publico: ["brasil"],
    turno: "Turno alternado (diurno/noturno), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.800–1.900/hora",
    status: "aberta",
    logo: "/images/logo-cliente-subaru.png",
    conducao: "Bicicleta (alugada pela empresa) — condução própria (carro/moto) possível, consultar a unidade.",
    fonteContrato: "ut-suriemu",
  },
  {
    id: "mitsubishi-fuso-toyama",
    empresa: "Mitsubishi Fuso",
    titulo: "Produção de ônibus — inspeção, soldagem, pintura e montagem",
    setor: "automotivo",
    regiao: "Toyama",
    cidade: "Toyama",
    publico: ["brasil"],
    turno: "Turno fixo ou alternado (diurno/noturno), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.700/hora",
    status: "aberta",
    conducao: "Vans/ônibus (gratuito), bicicleta (alugada pela empresa) ou a pé — condução própria (carro/moto) possível, consultar a unidade.",
    fonteContrato: "ut-suriemu",
  },
  {
    id: "yamase-miyagi",
    empresa: "Yamase Electronics",
    titulo: "Montagem e inspeção de peças eletrônicas automotivas",
    setor: "automotivo",
    regiao: "Miyagi",
    cidade: "Osaki",
    publico: ["brasil"],
    turno: "Turno fixo, diurno ou noturno, 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.200/hora (até ¥1.250/hora após o 3º mês)",
    status: "aberta",
  },
  {
    id: "fujifilm-miyagi",
    empresa: "Fuji Film",
    titulo: "Montagem e inspeção de lentes de câmeras digitais",
    setor: "eletronicos",
    regiao: "Miyagi",
    cidade: "Taiwa",
    publico: ["brasil"],
    turno: "Diurno fixo, 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.200–1.250/hora",
    status: "aberta",
    logo: "/images/logo-cliente-fujifilm.png",
  },
  {
    id: "yokohama-gomu-aichi",
    empresa: "Yokohama Gomu",
    titulo: "Montagem de borracha e inspeção de pneus",
    setor: "automotivo",
    regiao: "Aichi",
    cidade: "Shinshiro",
    publico: ["brasil"],
    turno: "Turno alternado (diurno/noturno), 4x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.430/hora",
    status: "aberta",
    logo: "/images/logo-cliente-yokohama-tyres.png",
    conducao: "Vans/ônibus (gratuito), bicicleta (alugada pela empresa) ou a pé — condução própria (carro/moto) possível, consultar a unidade.",
    observacoes: "Uniforme cobrado à parte, ¥6.450.",
    fonteContrato: "ut-suriemu",
  },
  {
    id: "sony-aichi",
    empresa: "Sony",
    titulo: "Montagem e inspeção de filmadoras e lentes digitais",
    setor: "eletronicos",
    regiao: "Aichi",
    cidade: "Kohda",
    publico: ["brasil"],
    turno: "Diurno ou noturno fixo, 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.100/hora",
    status: "aberta",
    logo: "/images/logo-cliente-sony.png",
  },
  {
    id: "mitsubishi-denki-himeji",
    empresa: "Mitsubishi Denki",
    titulo: "Produção de alternadores automotivos",
    setor: "automotivo",
    regiao: "Hyogo",
    cidade: "Himeji",
    publico: ["brasil"],
    turno: "Diurno fixo (8:30–17:00), noturno fixo (20:45–5:30) ou alternado, 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.300/hora (extra ¥1.625/hora; noturno +¥325/hora)",
    status: "aberta",
    logo: "/images/logo-cliente-mitsubishi-denki.png",
  },
  {
    id: "daihatsu-nakatsu",
    empresa: "Daihatsu",
    titulo: "Montagem e inspeção de automóveis",
    setor: "automotivo",
    regiao: "Oita",
    cidade: "Nakatsu",
    publico: ["brasil"],
    turno: "Turno alternado (diurno 6:30–15:10 / vespertino 18:30–2:40), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.800/hora (extra ¥2.250/hora; noturno +¥450/hora) + bônus de permanência de até ¥500.000 no primeiro ano e meio",
    status: "aberta",
    idioma: "Básico",
    perfil: "18 a 39 anos (até 45 com experiência) — avaliação médica e física admissional",
  },
  {
    id: "fruehauf-atsugi",
    empresa: "Fruehauf",
    titulo: "Montagem e pintura de carrocerias de caminhão",
    setor: "automotivo",
    regiao: "Kanagawa",
    cidade: "Atsugi",
    publico: ["brasil"],
    turno: "Diurno fixo (8:05–17:00), 5x2 — sem turno noturno",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.600/hora (extra ¥2.000/hora; noturno +¥400/hora)",
    status: "aberta",
    idioma: "Básico (identificar avisos e placas de segurança)",
    perfil: "Homens até 50 anos (acima de 45 com experiência) — vagas femininas em negociação; requer visita à fábrica antes da alocação",
    conducao: "Bicicleta (alugada pela empresa) ou a pé — condução própria (carro/moto) possível, consultar a unidade.",
    observacoes: "Estacionamento por conta do funcionário, ¥2.200/mês.",
    fonteContrato: "ut-suriemu",
  },
  {
    id: "gs-yuasa-ritto",
    empresa: "GS Yuasa",
    titulo: "Produção de baterias para veículos elétricos e híbridos",
    setor: "automotivo",
    regiao: "Shiga",
    cidade: "Ritto",
    publico: ["brasil"],
    turno: "Turno alternado (diurno 9:00–21:00 / noturno 21:00–9:00), 4x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.400/hora, com reajuste semestral por assiduidade até ¥1.500/hora",
    status: "aberta",
  },
  // ── Fujiarte Co. Ltd. — fichas "Condições de Contrato" (Inoac e Futaba
  // Sangyou, propostas atualizadas de 1/abr/2026) ──
  {
    id: "inoac-sakurai",
    empresa: "Inoac Corporation",
    titulo: "Produção de peças de aerofólio automotivo",
    setor: "automotivo",
    regiao: "Aichi",
    cidade: "Anjo",
    publico: ["brasil"],
    turno: "Turno alternado (7:00–16:00 / 19:00–4:00), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.300/hora (após 3 meses, ¥1.400/hora) + moradia ¥55.000–60.000",
    status: "aberta",
    perfil: "Homens solteiros ou casais — para casal com filho menor de idade, a vaga é garantida só para o marido, sem suporte de passagem para a família",
  },
  {
    id: "inoac-kira",
    empresa: "Inoac Corporation",
    titulo: "Fabricação de encosto de cabeça e apoio de copos automotivo",
    setor: "automotivo",
    regiao: "Aichi",
    cidade: "Kira",
    publico: ["brasil"],
    turno: "Turno alternado (7:00–16:00 / 18:00–3:00), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.300/hora (após 3 meses, ¥1.400/hora) + moradia ¥45.000–65.000",
    status: "aberta",
    perfil: "Homens solteiros ou casais — para casal com filho menor de idade, a vaga é garantida só para o marido, sem suporte de passagem para a família",
  },
  {
    id: "futaba-mutsumi",
    empresa: "Futaba Sangyou",
    titulo: "Fabricação de peças de chassi automotivo",
    setor: "automotivo",
    regiao: "Aichi",
    cidade: "Okazaki",
    publico: ["brasil"],
    turno: "Turno alternado (8:00–16:45 / 20:00–4:45), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.550/hora (após 6 meses, ¥1.650/hora) + moradia ¥45.000–60.000",
    status: "aberta",
    perfil: "Homens solteiros ou casais com filhos — para casal com filho menor de idade, a vaga é garantida só para o marido, sem suporte de passagem para a família. Alocação entre Kota, Mutsumi e Okazaki definida só após a chegada ao Japão",
  },
  {
    id: "futaba-kota",
    empresa: "Futaba Sangyou",
    titulo: "Fabricação de escapamento automotivo",
    setor: "automotivo",
    regiao: "Aichi",
    cidade: "Kota",
    publico: ["brasil"],
    turno: "Turno alternado (8:00–16:45 / 20:00–4:45), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.550/hora (após 6 meses, ¥1.650/hora) + moradia ¥45.000–60.000",
    status: "aberta",
    perfil: "Homens solteiros ou casais com filhos — para casal com filho menor de idade, a vaga é garantida só para o marido, sem suporte de passagem para a família",
  },
  {
    id: "fujifilm-kanagawa",
    empresa: "Fuji Film",
    titulo: "Embalamento de filmes instantâneos para câmeras fotográficas",
    setor: "eletronicos",
    regiao: "Kanagawa",
    cidade: "Minami Ashigara",
    publico: ["brasil"],
    turno: "Diurno fixo (7:00–16:00) ou noturno fixo (19:00–4:00), 5x2 ou 4x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.350/hora (extra ¥1.688/hora; noturno +¥338/hora)",
    status: "aberta",
    logo: "/images/logo-cliente-fujifilm.png",
    conducao: "Bicicleta (alugada pela empresa) ou a pé — condução própria de carro possível, consultar a unidade.",
    observacoes: "Apartamentos Leopalace geralmente já incluem TV, cortina, mesa, ar-condicionado, máquina de lavar, geladeira e micro-ondas.",
    fonteContrato: "ut-suriemu",
  },
  {
    id: "hino-jidousha-ota",
    empresa: "Hino Jidosha",
    titulo: "Montagem e usinagem de peças de motor de caminhão",
    setor: "automotivo",
    regiao: "Gunma",
    cidade: "Ota",
    publico: ["brasil"],
    turno: "Turno alternado (diurno 6:30–15:20 / noturno 17:15–2:05), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥2.000/hora (extra ¥2.500/hora; noturno +¥500/hora)",
    status: "aberta",
    conducao: "A pé — bicicleta própria possível, consultar a unidade.",
    observacoes: "Refeitório na unidade com geladeira e micro-ondas.",
    fonteContrato: "ut-suriemu",
  },
  {
    id: "hino-jidousha-hamura",
    empresa: "Hino Jidosha",
    titulo: "Montagem, abastecimento e inspeção de veículos",
    setor: "automotivo",
    regiao: "Tokyo",
    cidade: "Hamura",
    publico: ["brasil"],
    turno: "Turno alternado (diurno 6:30–15:20 / noturno 17:15–2:05), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥2.000/hora (extra ¥2.500/hora; noturno +¥500/hora)",
    status: "aberta",
    conducao: "A pé — bicicleta própria possível, consultar a unidade.",
    observacoes: "Refeitório com sistema de recarga (depósito-caução de ¥1.000); cada refeição custa em torno de ¥500.",
    fonteContrato: "ut-suriemu",
  },
  {
    id: "kitz-ina-nagano",
    empresa: "Kitz",
    titulo: "Produção de válvulas de água — montagem, usinagem e inspeção",
    setor: "materiais",
    regiao: "Nagano",
    cidade: "Ina",
    publico: ["brasil"],
    turno: "Diurno fixo (8:25–17:25) ou alternado (hayaban 5:00–13:20 / osoban 13:15–21:35), 5x2",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.200/hora (mulheres) ou ¥1.300/hora (homens)",
    status: "aberta",
    conducao: "Vans/ônibus (gratuito), bicicleta (alugada pela empresa) ou a pé.",
    fonteContrato: "ut-suriemu",
  },
  {
    id: "panasonic-gunma",
    empresa: "Panasonic",
    titulo: "Produção de eletrodomésticos — tratamento térmico, máquina e montagem",
    setor: "eletronicos",
    regiao: "Gunma",
    cidade: "Oizumi",
    publico: ["brasil"],
    turno: "Diurno fixo (8:25–17:00), 5x2 — possibilidade de turno noturno conforme a necessidade",
    contrato: "Contrato temporário (haken)",
    salario: "¥1.300–1.500/hora, conforme japonês e habilidades (até ¥1.600/hora em lift, até ¥1.900/hora em solda)",
    status: "aberta",
    logo: "/images/logo-cliente-panasonic.png",
    conducao: "Bicicleta (alugada pela empresa) ou a pé — condução própria (carro/moto) possível, consultar a unidade.",
    fonteContrato: "ut-suriemu",
  },
];

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
  // Só altura fixa (largura livre) + object-contain — pedido do Wilson,
  // 19/set/2026, revertendo a caixa de largura fixa que eu tinha colocado
  // antes: forçar toda logo pra uma largura igual criava um respiro
  // horizontal enorme em volta de marcas mais "quadradas" (Fujiarte, UT),
  // o carrossel de cima parecia ter buracos vazios. Como os arquivos já
  // foram recortados (sem respiro interno em excesso), travar só a altura
  // já deixa o peso visual parecido, sem sobrar espaço em branco.
  return item.logo ? (
    <div className="mx-6 flex h-14 shrink-0 items-center">
      <img src={item.logo} alt={item.nome} className="h-9 w-auto object-contain md:h-10" />
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
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function aoRolar() {
      setScrolled(window.scrollY > 40);
    }
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

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

  // Expandir/colapsar detalhes do card — pedido do Wilson, 19/set/2026.
  function alternarExpandida(id: string) {
    setExpandidas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

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
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540] from-5% via-[#0A2540]/45 via-35% to-transparent to-70%" />
        </div>
        <div className="relative flex min-h-[640px] flex-col justify-end px-6 pb-8 pt-28 md:min-h-[780px] md:px-10 md:pb-10 md:pt-36">
          <div className="mx-auto w-full max-w-4xl text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#6ec3d9]">Ajisai Empregos</p>
            <h1 className={`${display.className} mt-4 text-[clamp(1.9rem,5vw,3.4rem)] font-medium leading-[1.1] text-white`}>
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
            Qual é a sua situação?
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
                className="group flex flex-col items-start rounded-2xl border border-black/10 bg-black/[0.02] p-7 text-left transition hover:border-[#2f80c9]/50 hover:bg-[#2f80c9]/5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f80c9]/10 text-[#2f80c9]">
                  <IconSetor setor={s.key} className="h-6 w-6" />
                </span>
                <h3 className={`${display.className} mt-4 text-lg font-medium text-black`}>{s.nome}</h3>
                <p className="mt-2 text-xs font-light leading-5 text-black/55">{s.descricao}</p>
                <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2f80c9]">
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
              const expandida = expandidas.has(vaga.id);
              const temDetalhe = Boolean(vaga.conducao || vaga.observacoes || vaga.fonteContrato);
              return (
                <div
                  key={vaga.id}
                  className={`flex flex-col rounded-2xl border p-5 transition ${
                    marcada ? "border-[#2f80c9] bg-[#2f80c9]/5" : "border-black/10 bg-white hover:border-black/25"
                  }`}
                >
                  {/* Corpo do card clicável — pedido do Wilson, 19/set/2026:
                      "ao clicar na vaga deve expandir os campos de
                      detalhes". A seleção pra candidatura continua só no
                      checkbox (que interrompe a propagação do clique), pra
                      não misturar as duas ações. */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => alternarExpandida(vaga.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        alternarExpandida(vaga.id);
                      }
                    }}
                    className="flex cursor-pointer flex-col text-left"
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
                    <h3 className="mt-1 text-sm font-semibold text-black">{vaga.titulo}</h3>
                    <p className="mt-1 text-xs text-black/50">
                      {vaga.cidade}, {vaga.regiao} — Japão
                    </p>
                    <p className="mt-2 text-sm font-semibold text-black/80">{vaga.salario}</p>
                    <div className="mt-2 space-y-1 text-[11px] leading-4 text-black/45">
                      <p>{vaga.turno}</p>
                      <p>{vaga.contrato}</p>
                      {vaga.perfil && <p>Perfil: {vaga.perfil}</p>}
                      {vaga.idioma && <p>Japonês: {vaga.idioma}</p>}
                    </div>
                    <span className="mt-3 inline-flex w-fit items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2f80c9]">
                      {expandida ? "Ver menos" : "Ver mais detalhes"}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-3 w-3 transition-transform ${expandida ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </div>

                  {/* Detalhes expandidos — moradia, condução, seguro social,
                      exame médico e financiamento de passagem, quando a
                      ficha original tem esse bloco (CONDICOES_UT_SURIEMU).
                      Pras demais vagas, mostra só o convite pro WhatsApp em
                      vez de inventar dado que a fonte não trouxe. */}
                  {expandida && (
                    <div className="mt-4 space-y-2.5 border-t border-black/10 pt-4 text-[11px] leading-5 text-black/55">
                      {vaga.conducao && (
                        <p>
                          <span className="font-semibold text-black/70">Condução ao trabalho: </span>
                          {vaga.conducao}
                        </p>
                      )}
                      {(vaga.fonteContrato === "ut-suriemu" || vaga.observacoes) && (
                        <p>
                          <span className="font-semibold text-black/70">Moradia: </span>
                          {vaga.fonteContrato === "ut-suriemu" ? CONDICOES_UT_SURIEMU.moradia : ""}
                          {vaga.observacoes && ` ${vaga.observacoes}`}
                        </p>
                      )}
                      {vaga.fonteContrato === "ut-suriemu" && (
                        <>
                          <p>
                            <span className="font-semibold text-black/70">Seguro social (shakai hoken): </span>
                            {CONDICOES_UT_SURIEMU.seguro}
                          </p>
                          <p>
                            <span className="font-semibold text-black/70">Exame médico: </span>
                            {CONDICOES_UT_SURIEMU.exameMedico}
                          </p>
                          <p>
                            <span className="font-semibold text-black/70">Passagem aérea: </span>
                            {CONDICOES_UT_SURIEMU.financiamentoPassagem}
                          </p>
                        </>
                      )}
                      {!temDetalhe && (
                        <p>Moradia, documentos e demais condições dessa vaga — fale com a gente pelo WhatsApp.</p>
                      )}
                      <a
                        href={linkWhatsapp(
                          `Olá! Tenho interesse na vaga ${vaga.titulo} — ${vaga.empresa}, ${vaga.cidade}/${vaga.regiao}. Podem me passar mais detalhes?`,
                        )}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex w-fit items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#2f80c9] hover:underline"
                      >
                        Perguntar sobre essa vaga →
                      </a>
                    </div>
                  )}
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

      {/* ── CTA FINAL ── */}
      <section className="bg-[#0A2540] px-6 py-16 text-center md:px-16 md:py-20">
        <h2 className={`${display.className} text-2xl font-medium text-white md:text-3xl`}>
          Pronto para dar o próximo passo?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm font-light leading-6 text-white/65">
          Fale com o time da Ajisai pelo WhatsApp e comece agora sua candidatura.
        </p>
        <a
          href={linkWhatsapp("Olá! Vim pela página de Empregos da Ajisai e queria saber mais.")}
          target="_blank"
          rel="noreferrer"
          className="mt-7 inline-block rounded-full bg-[#2f80c9] px-7 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#3b91dc]"
        >
          Falar com a Ajisai no WhatsApp
        </a>
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
