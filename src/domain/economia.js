import { calcularPrecoBase } from '../utils/calculos.js';
import { normalizarTexto } from '../utils/texto.js';
import { calcularPrecoBaseDoItem } from './item.js';
import { estaNoCarrinho } from './lista.js';

const chaveDoItem = ({ nome, marca }) => `${normalizarTexto(nome)}|${normalizarTexto(marca)}`;

/**
 * Mapa "nome|marca" -> último item salvo no histórico.
 * Serve de referência para saber se o preço de hoje é melhor que o da última vez.
 */
export function criarIndiceHistorico(registros) {
  const indice = new Map();
  [...registros]
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .forEach(({ itens }) => itens.forEach((item) => indice.set(chaveDoItem(item), item)));
  return indice;
}

/** Quanto se economizou nos itens do carrinho em relação ao último preço salvo. */
export function calcularEconomia(itens, indice) {
  return itens.filter(estaNoCarrinho).reduce((total, item) => {
    const anterior = indice.get(chaveDoItem(item));
    if (!anterior) return total;
    const diferenca = anterior.preco - item.compra.preco;
    return diferenca > 0 ? total + diferenca * item.compra.quantidade : total;
  }, 0);
}

/**
 * Percentual de queda no preço por kg/L em relação à última compra do mesmo item.
 * Retorna null quando não há ganho ou não dá para comparar.
 */
export function calcularCustoBeneficio(item, indice) {
  const anterior = indice.get(chaveDoItem(item));
  const atual = calcularPrecoBaseDoItem(item);
  if (!anterior || !atual) return null;

  const base = calcularPrecoBase(anterior.preco, anterior.peso, anterior.unidade);
  if (!base || base.rotulo !== atual.rotulo || atual.valor >= base.valor) return null;

  return ((base.valor - atual.valor) / base.valor) * 100;
}
