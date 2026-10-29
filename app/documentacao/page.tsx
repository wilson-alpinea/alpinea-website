"use client";

// /documentacao — hub da seção de Documentação (Wilson, 29/out/2026).
// Três serviços: visto específico, Certificado de Elegibilidade (antes
// subordinados a Empregos, agora vendidos avulsos) e exportação de pet
// (unidade à parte). Marca Ajisai; banner enviado pelo Wilson.

import Image from "next/image";
import Link from "next/link";
import { formatBRL, formatJPY } from "../hooks/useCambioUSD";
import { CabecalhoAjisai, RodapeAjisai, display, Secao, ListaCheck, VERDE } from "./componentes";
import { CONSULADOS, COE_INDIVIDUAL_JPY, EXPERIENCIA, PRECO_PET_BRL } from "./conteudo";

const menorVisto = Math.min(...CONSULADOS.map((c) => c.comCOE));

function CardServico({ href, imagem, alt, kicker, titulo, texto, preco, cta, separado = false }: { href: string; imagem: string; alt: string; kicker: string; titulo: string; texto: string; preco?: string; cta: string; separado?: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex flex-col overflow-hidden rounded-2xl border shadow-[0_12px_32px_-14px_rgba(10,37,64,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-16px_rgba(10,37,64,0.5)] ${separado ? "border-black/10 bg-[#F6F7F5]" : "border-black/10 bg-white"}`}
    >
      <Image src={imagem} alt={alt} width={1254} height={1254} sizes="(min-width: 768px) 33vw, 100vw" className="block aspect-square h-auto w-full object-cover" />
      <div className="flex flex-1 flex-col p-6 md:p-7">
      <p className="text-[10px] uppercase tracking-[0.22em] text-black/45">{kicker}</p>
      <h3 className={`${display.className} mt-3 text-2xl font-medium text-black md:text-[1.7rem]`}>{titulo}</h3>
      <p className="mt-3 flex-1 text-sm font-light leading-6 text-black/60">{texto}</p>
      {preco && <p className="mt-5 text-sm text-black/55">{preco}</p>}
      <span className="mt-4 inline-flex w-fit items-center rounded-full px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition group-hover:opacity-90" style={{ background: VERDE }}>
        {cta}
      </span>
      </div>
    </Link>
  );
}

export default function DocumentacaoPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white text-black">
      <CabecalhoAjisai />

      {/* HERO — mesma lógica do /produtos: proporção nativa, sem crop. */}
      <section className="relative bg-[#04261F] pt-[68px] md:pt-[84px]">
        <div className="relative mx-auto w-full max-w-[1902px] overflow-hidden">
          <Image
            src="/images/documentacao-hero.webp"
            alt="Consultora da Ajisai entregando documentos a um casal, com um cachorro na caixa de transporte"
            width={1902}
            height={827}
            priority
            sizes="(min-width: 1902px) 1902px, 100vw"
            className="block h-auto w-full"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#04261F] via-[#04261F]/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-6 sm:px-8 sm:pb-8 md:px-16 md:pb-12">
            <div className="mx-auto max-w-7xl">
              <p className="hidden text-[11px] uppercase tracking-[0.25em] text-white/70 sm:block">Documentação para o Japão</p>
              <h1 className={`${display.className} mt-2 max-w-3xl text-[clamp(1.6rem,4.6vw,3.4rem)] font-normal leading-[1.08] text-white`} style={{ textShadow: "0 3px 18px rgba(0,0,0,0.5)" }}>
                Visto, elegibilidade e pet: a papelada fica com a gente.
              </h1>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-5 pb-10 pt-4 sm:hidden">
          <p className="text-sm font-light leading-6 text-white/75">Documentação para o Japão, do cadastro à entrega.</p>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 md:px-16 md:py-16">
          <h2 className={`${display.className} text-2xl font-medium text-black md:text-3xl`}>Qual documento você precisa?</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <CardServico
              href="/documentacao/visto"
              imagem="/images/documentacao-visto-especifico.webp"
              alt="Detalhe de um visto japonês com as palavras JAPAN VISA e 日本国査証"
              kicker="Nisseis, sanseis e família"
              titulo="Visto específico"
              texto="Preparamos o processo e damos entrada no consulado japonês por você. Valor final por pessoa, com a taxa consular inclusa."
              cta="Ver visto"
            />
            <CardServico
              href="/documentacao/elegibilidade"
              imagem="/images/documentacao-elegibilidade-selo.webp"
              alt="Detalhe do Certificado de Elegibilidade com o selo dourado do Ministério da Justiça do Japão"
              kicker="Com garantidor no Japão"
              titulo="Certificado de Elegibilidade"
              texto="O COE é emitido pela imigração no Japão — não é o visto. Com ele em mãos, o visto específico sai em cerca de 2 semanas (pedido à parte). Traduções inclusas."
              cta="Ver elegibilidade"
            />
            <CardServico
              href="/documentacao/pet"
              imagem="/images/documentacao-pet.webp"
              alt="Tutora com um cavalier king charles ao lado da caixa de transporte no aeroporto"
              kicker="Cães e gatos"
              titulo="Exportação de pet"
              texto="Microchip, vacinas, sorologia, Import Permit e certificado veterinário internacional — o processo completo, com clínicas parceiras em São Paulo."
              cta="Ver exportação de pet"
              separado
            />
          </div>
        </div>
      </section>

      {/* VISTO x COE */}
      <Secao kicker="Antes de começar" titulo="Visto ou Certificado de Elegibilidade?" cinza>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-sm font-medium text-black">Visto direto no consulado</p>
            <p className="mt-2 text-sm leading-6 text-black/60">
              Para o titular nissei ou sansei que mora na região do Consulado de São Paulo (SP, MS e Triângulo Mineiro) e já cumpre os requisitos do visto específico — por exemplo, com contrato de trabalho.
            </p>
            <p className="mt-3 text-xs text-black/45">Prazo no consulado: cerca de 3 meses.</p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <p className="text-sm font-medium text-black">Primeiro o COE, depois o visto</p>
            <p className="mt-2 text-sm leading-6 text-black/60">
              Para quem mora em outras regiões, não tem contrato de trabalho, ou vai como cônjuge ou dependente. Um garantidor no Japão assume a responsabilidade pelo solicitante perante a imigração.
            </p>
            <p className="mt-3 text-xs text-black/45">COE: cerca de 3 meses. Visto com COE: cerca de 2 semanas.</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-black/60">
          Na dúvida, faça o cadastro do visto: a equipe analisa o seu caso e diz se você precisa do certificado antes.
        </p>
      </Secao>

      {/* POR QUE A AJISAI */}
      <Secao kicker="Experiência" titulo="Quem já passou por isso com a gente">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {[
            [EXPERIENCIA.vistos, "vistos emitidos", "/images/icone-documentacao-visto.png"],
            [EXPERIENCIA.elegibilidades, "certificados de elegibilidade", "/images/icone-documentacao-elegibilidade.png"],
            [EXPERIENCIA.pets, "pets levados ao Japão", "/images/icone-documentacao-pet-caixa.png"],
          ].map(([n, t, icone]) => (
            <div key={t} className="rounded-2xl border border-black/10 bg-white p-4 text-center md:p-6">
              <Image src={icone} alt="" width={256} height={256} className="mx-auto mb-3 h-12 w-12 object-contain md:h-16 md:w-16" />
              <p className={`${display.className} text-3xl md:text-4xl`} style={{ color: VERDE }}>{n}</p>
              <p className="mt-1 text-xs leading-5 text-black/55 md:text-sm">{t}</p>
            </div>
          ))}
        </div>
        <ListaCheck
          className="mt-8"
          itens={[
            "Você fala com a equipe Ajisai em português, não com o despachante ou o consulado.",
            "Documentos conferidos por quem conhece o que a imigração aceita.",
            "Equipe no Brasil e no Japão — inclusive para conversar com o garantidor em japonês.",
            "Valor do pacote informado antes de começar. No visto, traduções simples e declarações custam R$ 90 cada; no COE já estão inclusas. Apostila de Haia à parte.",
          ]}
        />
      </Secao>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-5 py-10 text-center md:px-8">
          <p className="text-xs leading-5 text-black/45">
            Trabalhamos somente com o visto específico (descendentes de japoneses até a 3ª geração, cônjuges e dependentes legais).
            Não emitimos visto de estudante, trabalho, religioso ou de outras categorias.
          </p>
        </div>
      </section>
      <RodapeAjisai />
    </main>
  );
}
