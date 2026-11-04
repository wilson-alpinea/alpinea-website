// Simulação de preço por produto na tela /crm/precos (Wilson, 04/nov/2026:
// "precisa ter um preço base de simulação, ou preço base para produtos como
// roteiro personalizado"). Mesmas contas do site (app/lib/precos*.ts,
// precoGuia.ts, precoCambioIene.ts…), refeitas aqui a partir dos valores
// da tela — atualiza enquanto se edita, antes de salvar.
// A primeira linha com `base: true` é o "preço base" mostrado no menu.

export type LinhaSimulacao = { rotulo: string; valor: string; base?: boolean; nota?: string };
export type Simulacao = { titulo: string; linhas: LinhaSimulacao[]; rodape?: string };
type V = (id: string) => number;

const num = (n: number, dec = 0) => n.toLocaleString("pt-BR", { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const brl = (n: number) => `R$ ${num(Math.round(n))}`;
export const usd = (n: number) => `US$ ${num(Math.round(n))}`;
export const jpy = (n: number) => `¥ ${num(Math.round(n))}`;
const pct = (f: number) => `${num(f * 100, f * 100 % 1 ? 2 : 0)}%`;

const padrao = (v: V, custo: number) => Math.round(custo * v("geral.imposto") * v("geral.margemPadrao"));
const parcela = (fin: number, taxa: number, n: number) => (n <= 1 ? fin : (fin * taxa) / (1 - Math.pow(1 + taxa, -n)));
const guiaTotal = (diaria: number, gorjeta: number, pessoas: number, dias: number) => (diaria * Math.max(1, Math.ceil(pessoas / 4)) + gorjeta * pessoas) * dias;
const margemSeguroIdade = (v: V, idade: number) => {
  const a = v("seguroParceiro.margemAte60");
  const b = v("seguroParceiro.margem80");
  if (idade <= 60) return a;
  return Math.round((a + (b - a) * Math.min(1, (idade - 60) / 20)) * 10) / 10;
};

export function simular(produto: string, v: V): Simulacao | null {
  switch (produto) {
    case "margens": {
      const mult = v("geral.imposto") * v("geral.margemPadrao");
      return {
        titulo: "Como um custo vira preço",
        linhas: [
          { rotulo: "Custo de R$ 1.000 vira", valor: brl(padrao(v, 1000)), base: true },
          { rotulo: "Multiplicador final (imposto × margem)", valor: `× ${num(mult, 3)}` },
          { rotulo: "Parte do preço que fica com a Ajisai (antes do imposto)", valor: pct(1 - 1 / v("geral.margemPadrao")) },
        ],
      };
    }
    case "pagamento": {
      const total = 20000;
      const fin = total * (1 + v("pagamento.taxaMaquinaCartao"));
      const p10 = parcela(fin, v("pagamento.jurosCartaoMes"), 10);
      const entrada = total * v("pagamento.entradaPix");
      const pix10 = parcela(total - entrada, v("pagamento.jurosPixMes"), 10);
      return {
        titulo: "Viagem de R$ 20.000",
        linhas: [
          { rotulo: "Cartão em 10×", valor: `10 × ${brl(p10)}`, base: true, nota: `total ${brl(p10 * 10)}` },
          { rotulo: "Cartão à vista", valor: brl(fin) },
          { rotulo: "Pix parcelado em 10×", valor: `${brl(entrada)} + 10 × ${brl(pix10)}`, nota: `total ${brl(entrada + pix10 * 10)}` },
        ],
      };
    }
    case "roteiro": {
      const base = padrao(v, v("roteiro.baseCusto"));
      const extra = padrao(v, v("roteiro.diaExtraCusto"));
      const taxa = v("roteiro.taxaUSDCada2Pessoas");
      return {
        titulo: "Preço do Roteiro Personalizado",
        linhas: [
          { rotulo: "Até 15 dias", valor: brl(base), base: true },
          { rotulo: "Cada dia extra", valor: brl(extra) },
          { rotulo: "20 dias", valor: brl(base + 5 * extra) },
          { rotulo: "30 dias", valor: brl(base + 15 * extra) },
          { rotulo: "Roteiro avulso para 5 pessoas", valor: `+ ${usd(Math.ceil(2 / 2) * taxa)}`, nota: `${usd(taxa)} a cada 2 pessoas acima de 3` },
        ],
        rodape: "Na Viagem Personalizada o roteiro ainda recebe o fator do ritmo do viajante.",
      };
    }
    case "viagemPersonalizada": {
      const taxa = padrao(v, v("grupo.taxaPassageiroExtraCusto"));
      return {
        titulo: "Itens próprios da Viagem Personalizada",
        linhas: [
          { rotulo: "Taxa por passageiro acima de 3", valor: brl(taxa), base: true },
          { rotulo: "Grupo de 6 pessoas", valor: `+ ${brl(taxa * 3)}` },
          { rotulo: "Extensão Seoul — hotel 4★ por noite", valor: usd(padrao(v, v("extensao.hotel.seoul.4estrelas"))) },
          { rotulo: "Voo Tóquio → Seoul por pessoa", valor: usd(padrao(v, v("extensao.vooToquioSeoulUSD"))) },
        ],
      };
    }
    case "pacotes": {
      const ids = ["caravanaCerejeiras", "caravanaMaio", "individualCerejeiras", "individualMaio"];
      const min = (pref: string) => Math.min(...ids.filter((i) => i.startsWith(pref)).flatMap((i) => [v(`pacotes.${i}.7d`), v(`pacotes.${i}.14d`)]));
      return {
        titulo: "“A partir de” em /produtos",
        linhas: [
          { rotulo: "Caravana", valor: usd(min("caravana")), base: true },
          { rotulo: "Individual ou pequenos grupos", valor: usd(min("individual")) },
        ],
      };
    }
    case "hotel": {
      const fator = v("hotel.fatorQuarto.Duplo (casal)");
      const cidade = v("hotel.cidade.tokyo");
      const linha = (cat: string): LinhaSimulacao => ({
        rotulo: `${cat} — casal, 5 noites`,
        valor: brl(Math.round(padrao(v, v(`hotel.diariaCusto.${cat}`)) * 5 * fator * cidade * 2)),
        nota: `diária base ${brl(padrao(v, v(`hotel.diariaCusto.${cat}`)))}`,
      });
      const linhas = ["3 estrelas", "4 estrelas", "5 estrelas", "Elite"].map(linha);
      linhas[1].base = true;
      return { titulo: "Casal em Tokyo, quarto duplo, 5 noites (sem café)", linhas, rodape: "Temporada multiplica por cima nas calculadoras." };
    }
    case "aereo":
      return {
        titulo: "Ida e volta, por pessoa",
        linhas: [
          { rotulo: "Economy", valor: brl(padrao(v, v("aereo.economyCustoBRL"))), base: true },
          { rotulo: "Premium Economy", valor: usd(padrao(v, v("aereo.premiumEconomyCustoUSD"))) },
          { rotulo: "Business", valor: usd(padrao(v, v("aereo.businessCustoUSD"))) },
          { rotulo: "First Class", valor: usd(Math.round(v("aereo.firstCustoUSD") * v("geral.imposto"))) },
        ],
      };
    case "transporte": {
      const m = v("motorista.margem");
      const r = (rota: string, vei: string) => Math.round(v(`motorista.rota.${rota}.preco.${vei}`) * m);
      return {
        titulo: "Preço de venda",
        linhas: [
          { rotulo: "Tour em Tóquio 10 h — Alphard", valor: usd(r("tokyo-tour-10h", "alphard8")), base: true },
          { rotulo: "Tour em Tóquio 10 h — Hiace 10", valor: usd(r("tokyo-tour-10h", "hiace10")) },
          { rotulo: "Motorista à disposição (diária, até 4 pessoas)", valor: usd(Math.round(v("motorista.diariaCustoUSD") * m)) },
          { rotulo: "Transporte durante o roteiro (diária)", valor: brl(padrao(v, v("transporte.diariaCusto"))) },
        ],
      };
    }
    case "transfer": {
      const m = v("transfer.margem");
      const r = (rota: string, vei: string) => Math.round(v(`motorista.rota.${rota}.preco.${vei}`) * m);
      return {
        titulo: "Preço de venda por trecho",
        linhas: [
          { rotulo: "Narita → Tóquio — Alphard", valor: usd(r("narita-tokyo", "alphard8")), base: true },
          { rotulo: "Haneda → Tóquio — Alphard", valor: usd(r("haneda-tokyo", "alphard8")) },
          { rotulo: "Kansai → Kyoto — Alphard", valor: usd(r("kansai-kyoto", "alphard8")) },
          { rotulo: "Narita → Tóquio — Coaster 18", valor: usd(r("narita-tokyo", "coaster18")) },
        ],
      };
    }
    case "guia": {
      const br = Math.round(v("guia.brasileiroCustoUSD") * v("guia.margemBrasileiro"));
      const est = padrao(v, v("guia.estrangeiroCustoJPY") / v("geral.jpyPorUsdReferencia"));
      const g = v("guia.gorjetaUSD");
      return {
        titulo: "Diária e exemplo (4 pessoas, 3 dias)",
        linhas: [
          { rotulo: "Guia brasileiro — diária", valor: usd(br), base: true },
          { rotulo: "Guia estrangeiro — diária", valor: usd(est) },
          { rotulo: "4 pessoas, 3 dias — brasileiro", valor: usd(guiaTotal(br, g, 4, 3)) },
          { rotulo: "4 pessoas, 3 dias — estrangeiro", valor: usd(guiaTotal(est, g, 4, 3)) },
        ],
        rodape: `Inclui gorjeta de ${usd(g)} por pessoa/dia. Monte Fuji: + ${usd(v("guia.adicionalFujiUSD"))} por guia/dia.`,
      };
    }
    case "jrpass": {
      const m = v("jrpass.margem");
      return {
        titulo: "Preço de venda",
        linhas: [
          { rotulo: "7 dias — Ordinary", valor: usd(Math.round(v("jrpass.custoUSD.7") * m)), base: true },
          { rotulo: "14 dias — Ordinary", valor: usd(Math.round(v("jrpass.custoUSD.14") * m)) },
          { rotulo: "21 dias — Ordinary", valor: usd(Math.round(v("jrpass.custoUSD.21") * m)) },
          { rotulo: "7 dias — Green", valor: usd(Math.round(v("jrpass.custoGreenUSD.7") * m)) },
          { rotulo: "Frete SEDEX — capital de SP", valor: brl(v("frete.spCapital")) },
        ],
      };
    }
    case "ingressos":
      return {
        titulo: "Preço de venda por pessoa",
        linhas: [
          { rotulo: "Tokyo Disneyland", valor: usd(padrao(v, v("ingressos.disneyland"))), base: true },
          { rotulo: "Universal Studios Japan", valor: usd(padrao(v, v("ingressos.usj"))) },
          { rotulo: "USJ Express Pass 4", valor: usd(padrao(v, v("ingressos.usjExpress4"))) },
          { rotulo: "Família de 4 — Disneyland", valor: usd(padrao(v, v("ingressos.disneyland")) * 4) },
        ],
      };
    case "servicos":
      return {
        titulo: "Preço de venda",
        linhas: [
          { rotulo: "Reserva de restaurante (por reserva)", valor: usd(padrao(v, v("servicos.reservaRestaurante"))), base: true },
          { rotulo: "Pacote restaurantes high-end", valor: usd(padrao(v, v("servicos.restaurantesHighEnd"))) },
          { rotulo: "Concierge (diária)", valor: usd(padrao(v, v("servicos.concierge"))) },
          { rotulo: "Envio de mala entre cidades", valor: usd(padrao(v, v("servicos.malaIntermunicipal"))) },
        ],
      };
    case "shopping":
      return {
        titulo: "Compras de R$ 10.000",
        linhas: [{ rotulo: "Comissão Ajisai", valor: brl(10000 * v("shopping.comissao")), base: true, nota: pct(v("shopping.comissao")) }],
      };
    case "limousine": {
      const adulto = (a: string) => Math.round((v(`limousine.tarifaJPY.${a}`) / v("geral.jpyPorUsdReferencia")) * v("limousine.margem"));
      return {
        titulo: "Preço de venda",
        linhas: [
          { rotulo: "Narita ↔ Tóquio — adulto, 1 trecho", valor: usd(adulto("narita")), base: true },
          { rotulo: "Haneda ↔ Tóquio — adulto, 1 trecho", valor: usd(adulto("haneda")) },
          { rotulo: "Narita, ida e volta, 2 adultos", valor: usd(adulto("narita") * 4) },
        ],
      };
    }
    case "cambio": {
      const rua = 0.037;
      const taxa = padrao(v, v("cambio.taxaServicoCusto"));
      const qtd = 100000;
      return {
        titulo: "¥ 100.000 com cotação de rua de R$ 0,037 (exemplo)",
        linhas: [
          { rotulo: "Cliente compra ienes — paga", valor: brl(qtd * rua * v("cambio.spreadIeneCompra") + taxa), base: true, nota: `inclui taxa de ${brl(taxa)}` },
          { rotulo: "Cliente vende ienes — recebe", valor: brl(Math.max(0, qtd * rua * v("cambio.spreadIeneVenda") - taxa)) },
          { rotulo: "Mesmo pedido na Viagem Personalizada", valor: brl(qtd * rua * v("cambio.fatorIeneCalculadoras") + taxa) },
          { rotulo: "Pedido mínimo", valor: jpy(v("cambio.minimoIenes")), nota: `aeroporto: ${jpy(v("cambio.minimoIenesAeroporto"))}` },
        ],
      };
    }
    case "seguro": {
      const diaria = padrao(v, v("seguro.diariaCusto"));
      return {
        titulo: "Seguro do parceiro (venda online) e das calculadoras",
        linhas: [
          { rotulo: "Parceiro — margem até 60 anos", valor: `${num(margemSeguroIdade(v, 40), 1)}%`, base: true, nota: "custo × (1 + margem), limitado ao preço de balcão" },
          { rotulo: "Parceiro — margem aos 70 anos", valor: `${num(margemSeguroIdade(v, 70), 1)}%` },
          { rotulo: "Parceiro — canal direto", valor: `${num(v("seguroParceiro.margemCanalDireto"), 0)}%` },
          { rotulo: "Calculadoras — 1 pessoa de 40 anos, 10 dias", valor: brl(diaria * 10 * v("seguro.idade.ate60")) },
          { rotulo: "Calculadoras — casal 40 e 70 anos, 10 dias", valor: brl(diaria * 10 * (v("seguro.idade.ate60") + v("seguro.idade.ate70"))) },
        ],
      };
    }
    case "esim":
      return {
        titulo: "Dentro da Viagem Personalizada",
        linhas: [
          { rotulo: "Wi-fi/eSIM por pessoa/dia", valor: usd(padrao(v, v("conectividade.wifiCustoUSD"))), base: true },
          { rotulo: "2 pessoas, 10 dias", valor: usd(padrao(v, v("conectividade.wifiCustoUSD")) * 20) },
          { rotulo: "eSIM da Calculadora Reversa por pessoa/dia", valor: usd(padrao(v, v("conectividade.esimCustoUSD"))) },
        ],
      };
    case "documentacao": {
      const ad = v("doc.adicionalBRLPessoa");
      const adj = v("doc.adicionalJPYPessoa");
      return {
        titulo: "Preço final ao cliente (por pessoa)",
        linhas: [
          { rotulo: "Visto — São Paulo, com COE", valor: brl(v("doc.visto.sao-paulo.comCOE") + ad), base: true },
          { rotulo: "Visto — São Paulo, sem COE", valor: brl(v("doc.visto.sao-paulo.semCOE") + ad) },
          { rotulo: "COE — individual (descendente)", valor: jpy(v("doc.coe.descendente") + adj) },
          { rotulo: "COE — família de 3", valor: jpy(v("doc.coe.familia3") + 3 * adj) },
        ],
      };
    }
    case "empregos":
      return {
        titulo: "1 candidato, com visto, certificado e passagem",
        linhas: [
          { rotulo: "Em reais", valor: brl(v("empregos.vistoBRL")), base: true },
          { rotulo: "Em ienes", valor: jpy(v("empregos.certificadoJPY") + v("empregos.passagemJPY")), nota: `Norte/Nordeste: + ${jpy(v("empregos.adicionalNorteNordesteJPY"))}` },
        ],
      };
  }
  return null;
}
