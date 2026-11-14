import { medidaParaItem } from '../medida.js';

const NOME_CARNE_PADRAO = 'Carne para churrasco';

/** O que o evento manda para a lista de compras: itens a comprar e a carne que falta. */
export function listarItensDoEvento(calculo, evento) {
  const itens = calculo.itens
    .filter((item) => !item.emCasa && item.quantidade > 0)
    .map(({ nome, categoria, quantidade, unidade }) => ({ nome, categoria, ...medidaParaItem({ quantidade, unidade }) }));

  if (calculo.carne.faltam > 0) {
    const nome = evento.corteFaltante.trim() || NOME_CARNE_PADRAO;
    itens.unshift({ nome, categoria: 'Carnes', ...medidaParaItem({ quantidade: calculo.carne.faltam, unidade: 'g' }) });
  }
  return itens;
}
