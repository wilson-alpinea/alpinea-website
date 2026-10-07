"use client";

import { VAGAS, type Vaga, type PublicoKey, type SetorKey, type StatusVaga } from "../lib/vagasCatalogo";
import {
  PERGUNTAS_TRIAGEM,
  NIVEIS_JAPONES_DETALHADOS,
  nivelDoDetalhado,
  ASCENDENCIA_JAPONESA,
  QUANDO_EMBARCAR,
  NOTA_MINIMA_PROXIMA_ETAPA,
  type RespostasTriagem,
  type CriterioPontuacao,
  type NivelJaponesDetalhado,
  type AscendenciaJaponesa,
  type QuandoEmbarcar,
} from "../lib/candidaturaScoring";
import { EXTENSOES_CURRICULO_ACEITAS } from "../lib/curriculoConstantes";
import { vagaExigeTesteDaltonismo, criteriosDaVaga } from "../lib/candidaturaScoring";
import {
  ESCOLARIDADES,
  OPCOES_DALTONISMO,
  OPCOES_FLEXIBILIDADE,
  OPCOES_HORAS_EXTRAS,
  PERFIL_VAZIO,
  PLACAS_DALTONISMO,
  PROVINCIAS_JAPAO,
  OPCOES_FINANCIAMENTO,
  REGIOES_TATUAGEM,
  TAMANHOS_TATUAGEM,
  CONDICOES_VISUAIS,
  OPCOES_FUMANTE,
  CLASSES_MEDICAMENTO,
  TIPOS_DIABETES,
  avaliarTesteDaltonismo,
  pendenciasPerfil,
  type PerfilCandidato,
} from "../lib/triagemPerfil";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import PrazosProcesso from "../components/empregos/PrazosProcesso";
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

// ── DESTAQUES — pedido do Wilson, 06/out/2026: carrossel com 4 banners
// pra dar destaque a oportunidades em cidades mais afastadas, working
// holiday "e coisas assim". O 1º é Echizen (banner enviado por ele, com o
// texto já na arte); os outros 3 são placeholders até ele mandar as artes
// e definir os temas — aparecem com o selo "Em breve" e sem link.
type Destaque = {
  id: string;
  titulo: string;
  imagem?: string;
  // Texto curto exibido sobre o placeholder (sem imagem).
  subtitulo?: string;
  // Filtro aplicado ao clicar (leva pra lista de vagas); sem isso, o
  // banner não é clicável.
  filtroRegiao?: string;
  // Texto escrito pelo site por cima da foto (com escurecimento à
  // esquerda) — para artes enviadas sem texto (Wilson, 07/out/2026).
  sobreposto?: { kicker: string; titulo: string; subtitulo?: string };
};

const DESTAQUES: Destaque[] = [
  {
    // Banner novo, sem texto na arte (Wilson, 07/out/2026: "novo banner
    // para Trabalhe e More em Echizen [...] adicione o texto por cima da
    // imagem e faça aquele escurecimento").
    id: "echizen",
    titulo: "Trabalhe e More em Echizen",
    imagem: "/images/empregos-destaque-echizen-murata.webp",
    sobreposto: { kicker: "Fukui · Japão", titulo: "Trabalhe e More em Echizen", subtitulo: "Montanhas, rio e cerejeiras ao lado da fábrica." },
    // Ainda não há vaga em Fukui no catálogo (a Kousei Aluminum/Fukui
    // ficou de fora por falta de ficha) — quando entrar, é só preencher
    // filtroRegiao: "Fukui" que o banner passa a levar direto pras vagas.
  },
  {
    id: "working-holiday",
    titulo: "Working Holiday no Japão",
    // Banner enviado pelo Wilson em 06/out/2026 (texto já na arte). Sem
    // link por enquanto — ainda não há página/vagas de Working Holiday.
    imagem: "/images/empregos-destaque-working-holiday.jpg",
  },
  {
    // Wilson, 07/out/2026: "e no segundo, Trabalhe e More em Izumo". Leva
    // para as vagas de Shimane (Murata Izumo).
    id: "izumo",
    titulo: "Trabalhe e More em Izumo",
    imagem: "/images/empregos-destaque-izumo-murata.webp",
    filtroRegiao: "Shimane",
    sobreposto: { kicker: "Shimane · Japão", titulo: "Trabalhe e More em Izumo", subtitulo: "A cidade do Grande Santuário de Izumo." },
  },
  { id: "placeholder-4", titulo: "Novo destaque", subtitulo: "Destaque em preparação" },
];

function CarrosselDestaques({ onAbrir }: { onAbrir: (d: Destaque) => void }) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = DESTAQUES.length;

  // Avança sozinho a cada 6s; pausa com o mouse em cima ou ao tocar.
  useEffect(() => {
    if (pausado) return;
    const t = setInterval(() => setIndice((i) => (i + 1) % total), 6000);
    return () => clearInterval(t);
  }, [pausado, total]);

  const ir = (i: number) => setIndice(((i % total) + total) % total);

  // Swipe no celular — sem biblioteca, só toque inicial/final.
  const [toqueX, setToqueX] = useState<number | null>(null);

  // Setas e bolinhas ficam ABAIXO do banner — antes ficavam por cima e
  // tampavam o texto da arte (Wilson, 06/out/2026).
  return (
    <div>
    <div
      className="relative overflow-hidden rounded-2xl bg-[#0A2540]"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onTouchStart={(e) => {
        setPausado(true);
        setToqueX(e.touches[0]?.clientX ?? null);
      }}
      onTouchEnd={(e) => {
        const fim = e.changedTouches[0]?.clientX ?? null;
        if (toqueX !== null && fim !== null && Math.abs(fim - toqueX) > 40) ir(indice + (fim < toqueX ? 1 : -1));
        setToqueX(null);
      }}
      aria-roledescription="carrossel"
    >
      {/* transform-gpu: evita o flash preto do Safari iOS em carrossel
          (ver learnings do projeto). Trilho com translateX, sem scroll JS. */}
      <div
        className="flex transform-gpu transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${indice * 100}%)` }}
      >
        {DESTAQUES.map((d, i) => {
          const clicavel = Boolean(d.filtroRegiao);
          const conteudo = d.imagem ? (
            <div className="relative aspect-[16/10] w-full sm:aspect-[1918/820]">
              <Image
                src={d.imagem}
                alt={d.titulo}
                fill
                sizes="(min-width: 1152px) 1152px, 100vw"
                className="object-cover object-[30%_50%] sm:object-center"
                priority={i === 0}
              />
              {d.sobreposto && (
                <>
                  {/* Escurecimento: forte à esquerda (texto), some antes das pessoas. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/90 via-[#0A2540]/35 to-transparent sm:bg-gradient-to-r sm:from-[#0A2540]/85 sm:via-[#0A2540]/45 sm:via-35% sm:to-transparent sm:to-60%"
                  />
                  <div className="absolute inset-x-0 bottom-0 px-6 pb-6 sm:inset-y-0 sm:right-auto sm:flex sm:max-w-[52%] sm:flex-col sm:justify-center sm:px-12 sm:pb-0 md:px-14">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">{d.sobreposto.kicker}</p>
                    <p className={`${display.className} mt-2 text-[28px] font-medium leading-[1.08] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-4xl md:text-5xl`}>
                      {d.sobreposto.titulo}
                    </p>
                    {d.sobreposto.subtitulo && <p className="mt-2 hidden text-sm text-white/80 sm:block md:text-base">{d.sobreposto.subtitulo}</p>}
                    {d.filtroRegiao && (
                      <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0A2540]">
                        Ver vagas →
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="relative flex aspect-[16/10] w-full flex-col justify-center bg-gradient-to-br from-[#0A2540] to-[#1c4a74] px-8 sm:aspect-[1918/820] sm:px-14">
              <span className="w-fit rounded-full border border-white/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                Em breve
              </span>
              <p className={`${display.className} mt-4 max-w-xl text-2xl font-medium leading-tight text-white md:text-4xl`}>
                {d.titulo}
              </p>
              {d.subtitulo && <p className="mt-3 text-sm text-white/55">{d.subtitulo}</p>}
            </div>
          );
          return (
            <div
              key={d.id}
              className="w-full shrink-0"
              aria-hidden={i !== indice}
              role="group"
              aria-label={`${i + 1} de ${total}: ${d.titulo}`}
            >
              {clicavel ? (
                <button type="button" onClick={() => onAbrir(d)} tabIndex={i === indice ? 0 : -1} className="block w-full text-left">
                  {conteudo}
                </button>
              ) : (
                conteudo
              )}
            </div>
          );
        })}
      </div>

    </div>

    <div className="mt-4 flex items-center justify-between gap-4">
      <div className="flex gap-2">
        {DESTAQUES.map((d, i) => (
          <button
            key={d.id}
            type="button"
            onClick={() => ir(i)}
            aria-label={`Ir para o destaque ${i + 1}`}
            aria-current={i === indice}
            className="flex h-8 items-center"
          >
            <span className={`block h-1.5 rounded-full transition-all ${i === indice ? "w-6 bg-[#0A2540]" : "w-1.5 bg-black/20"}`} />
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {(["anterior", "proximo"] as const).map((lado) => (
          <button
            key={lado}
            type="button"
            onClick={() => ir(indice + (lado === "proximo" ? 1 : -1))}
            aria-label={lado === "proximo" ? "Próximo destaque" : "Destaque anterior"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/15 text-[#0A2540] transition hover:border-black/40"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
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
function InfoObrigatoriaVaga({ vaga }: { vaga: Vaga }) {
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

      {/* ── DESTAQUES (carrossel) — pedido do Wilson, 06/out/2026 ── */}
      <section className="border-b border-black/10 bg-white px-6 pt-14 md:px-16 md:pt-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c6ea8]">Destaques</p>
          <h2 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-3xl`}>
            Oportunidades em destaque
          </h2>
          <div className="mt-8 pb-14 md:pb-20">
            <CarrosselDestaques onAbrir={(d) => d.filtroRegiao && irParaVagas({ regiao: d.filtroRegiao })} />
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
              <InfoObrigatoriaVaga vaga={vagaAberta} />
            </div>

            <div className="mt-2 border-t border-black/10 pt-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/55">Outras condições</p>
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
type EtapaCandidatura = "formulario" | "resultado";
type SugestaoVaga = { vagaId: string; titulo: string; empresa: string; cidade: string; regiao: string; salario: string; pontuacao: number };

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

// Marcador de campo obrigatório — pedido do Wilson, 06/out/2026.
function Obrigatorio() {
  return (
    <span className="text-red-500" aria-hidden="true">
      *
    </span>
  );
}

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
  const [certidaoAntecedentes, setCertidaoAntecedentes] = useState<File | null>(null);
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
  const testeDaltonismoCompleto = PLACAS_DALTONISMO.every((pl) => (respostasDaltonismo[pl.id] ?? "") !== "");
  const perfilParaEnvio: PerfilCandidato = {
    ...perfil,
    testeDaltonismo: exigeTesteDaltonismo && testeDaltonismoCompleto ? avaliarTesteDaltonismo(respostasDaltonismo) : null,
  };

  const [pontuacao, setPontuacao] = useState(0);
  const [criterios, setCriterios] = useState<CriterioPontuacao[]>([]);
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
      form.append("respostas", JSON.stringify({ ...respostas, perfil: perfilParaEnvio }));
      form.append("curriculo", curriculo);
      if (certificado) form.append("certificadoJapones", certificado);
      if (certidaoAntecedentes && perfil.antecedentesCriminais) form.append("certidaoAntecedentes", certidaoAntecedentes);
      const resposta = await fetch("/api/empregos-candidatura", { method: "POST", body: form });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setErro(dados.error || "Não foi possível enviar sua candidatura agora. Tente novamente.");
        setEnviando(false);
        return;
      }
      setPontuacao(dados.pontuacao);
      setCriterios(dados.criterios || []);
      setAprovadoParaFoto(Boolean(dados.aprovadoParaFoto));
      setFichaUrl(typeof dados.fichaUrl === "string" ? dados.fichaUrl : null);
      setSugestoes(Array.isArray(dados.sugestoes) ? dados.sugestoes : []);
      setCandidatura(dados.tokenCandidatura ? { id: dados.candidaturaId, token: dados.tokenCandidatura } : null);
      setEtapa("resultado");
    } catch {
      setErro("Não foi possível enviar sua candidatura agora. Tente novamente.");
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
            <PrazosProcesso atual="etapa1" semEtapa3={!perguntaFinanciamento} />
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
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm text-black outline-none focus:border-[#2f80c9]"
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
                    {PLACAS_DALTONISMO.map((pl, i) => {
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
                  {PROVINCIAS_JAPAO.map((pr) => (
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
                  O visto de trabalho japonês avalia esse ponto. Se tiver, anexe a Certidão de Antecedentes Criminais
                  da Polícia Federal (emitida grátis em gov.br) — ajuda a acelerar a análise.
                </p>
                <OpcoesBotao valor={perfil.antecedentesCriminais} opcoes={SIM_NAO} onChange={(v) => setP("antecedentesCriminais", v)} />
                {perfil.antecedentesCriminais && (
                  <div className="mt-2">
                    <label className="text-[11px] font-medium text-black/50">
                      Certidão da Polícia Federal <span className="font-normal text-black/35">(opcional)</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,application/pdf,image/*"
                      onChange={(e) => setCertidaoAntecedentes(e.target.files?.[0] ?? null)}
                      className="mt-1 w-full rounded-xl border border-dashed border-black/15 px-3 py-2.5 text-xs text-black/60 outline-none file:mr-3 file:rounded-full file:border-0 file:bg-black/[0.04] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-black/70"
                    />
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-medium text-black/70">
                  Você tem tatuagem que fique visível usando uniforme de manga curta? <Obrigatorio />
                </p>
                <p className="mt-0.5 text-[11px] leading-4 text-black/40">
                  Não é critério de avaliação pessoal. No Japão, algumas empresas, alojamentos com banho coletivo,
                  onsen e academias têm regras próprias para tatuagens — perguntamos só para indicar vagas e
                  moradias compatíveis com você.
                </p>
                <OpcoesBotao
                  valor={perfil.tatuagemVisivel}
                  opcoes={SIM_NAO}
                  onChange={(v) => setPerfil((p) => ({ ...p, tatuagemVisivel: v, ...(v === "nao" ? { tatuagemRegioes: [], tatuagemTamanho: "" } : {}) }))}
                />
                {perfil.tatuagemVisivel === "sim" && (
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

            {/* Currículo movido pro final do formulário — pedido do Wilson,
                06/out/2026 ("campo do curriculo para o final"). */}
            <div className="border-t border-black/10 pt-4">
              <label className="text-[11px] font-medium text-black/50">
                Currículo (PDF ou DOCX) <Obrigatorio />
              </label>
              <input
                type="file"
                accept={EXTENSOES_CURRICULO_ACEITAS}
                onChange={(e) => setCurriculo(e.target.files?.[0] ?? null)}
                required
                className="mt-1 w-full rounded-xl border border-dashed border-black/15 px-3 py-2.5 text-xs text-black/60 outline-none file:mr-3 file:rounded-full file:border-0 file:bg-black/[0.04] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-black/70"
              />
            </div>

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
            {aprovadoParaFoto && (
            <>
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

            </>
            )}

            {aprovadoParaFoto ? (
              <div className="mt-6 rounded-2xl bg-[#2f80c9]/[0.06] p-4">
                <p className="text-xs leading-5 text-black/70">
                  Parabéns! Sua pontuação passou de {NOTA_MINIMA_PROXIMA_ETAPA}%. A etapa 2 é a ficha cadastral
                  completa (documentos, experiência, família e saúde) com o envio da sua foto — leva uns 15 minutos.
                </p>
                {fichaUrl ? (
                  <a
                    href={fichaUrl}
                    className="mt-4 flex w-full items-center justify-center rounded-full bg-[#2f80c9] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3b91dc]"
                  >
                    Continuar para a etapa 2
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
                      Com as mesmas respostas e currículo, você já passaria para a próxima etapa nestas vagas — sem
                      precisar preencher tudo de novo.
                    </p>
                    <div className="mt-3 space-y-2.5">
                      {sugestoes.map((sg) => (
                        <div key={sg.vagaId} className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 p-3.5">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-black/45">{sg.empresa}</p>
                            <p className="truncate text-sm font-medium text-black">{sg.titulo}</p>
                            <p className="text-[11px] text-black/45">
                              {sg.cidade} · compatibilidade {sg.pontuacao}%
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
                  Fechar
                </button>
              </div>
            )}

            <PrazosProcesso atual={aprovadoParaFoto ? "etapa2" : "etapa1"} aberto={aprovadoParaFoto} semEtapa3={!perguntaFinanciamento} className="mt-5" />
          </div>
        )}

      </div>
    </div>
  );
}
