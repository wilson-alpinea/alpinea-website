import { slugVaga, proximoCodigoVaga, montarVagaNova } from "../app/lib/vagasEdicao";
import { VAGAS } from "../app/lib/vagasCatalogo";
const ids = new Set(VAGAS.map((v) => v.id));
console.log(slugVaga("Sun-Denshi", "Masuda", ids), slugVaga("Hichifuku", "Kōnan", new Set()), proximoCodigoVaga(VAGAS.map((v) => v.codigo)));
console.log(JSON.stringify(montarVagaNova({ vaga_id: "x-y", codigo: "AJ-0099", dados: { empresa: "X", titulo: "Montagem", cidade: "Y", regiao: "Aichi", salario: "¥1.300/hora", publicadaEm: "2026-11-03", setor: "automotivo", publico: ["brasil"], status: "aberta", info: { beneficios: ["a"] }, logo: null } })));
