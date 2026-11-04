// Importa todos os módulos de preço para registrar seus parâmetros (P()) —
// usado só pelo CRM (/crm/precos) para listar tudo o que é editável.
// Ao criar um módulo de preço novo com P(), inclua-o aqui.
import "./margemPadrao";
import "./precosPacote";
import "./precoCambioIene";
import "./precoGuia";
import "./precoRoteiro";
import "./precoSeguroViagem";
import "./margemSeguroViagemParceiro";
import "./servicosAdicionaisCatalogo";
import "./freteSedex";
import "./motoristaPrivadoRotas";
import "./calculadoraCatalogoPublico";
import "./precificacaoPerfil";
import "./financiamentoEmpregos";
import "./precosPacotesProntos";
import "../documentacao/conteudo";

export { padroesRegistrados, valoresNoAr } from "./parametrosPreco";
