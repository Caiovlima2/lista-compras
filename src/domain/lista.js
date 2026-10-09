export const estaNoCarrinho = (item) => item.compra !== null;

const subtotalPrevisto = (item) => (item.preco ?? 0) * item.quantidade;
const subtotalPago = (item) => (item.compra ? item.compra.preco * item.compra.quantidade : 0);

const somar = (itens, calcular) => itens.reduce((total, item) => total + calcular(item), 0);

/** Soma dos preços estimados de todos os itens da lista. */
export const calcularTotalPrevisto = (itens) => somar(itens, subtotalPrevisto);

/** Soma do que realmente foi colocado no carrinho. */
export const calcularTotalNoCarrinho = (itens) => somar(itens, subtotalPago);

export const contarNoCarrinho = (itens) => itens.filter(estaNoCarrinho).length;

export const contarSemPreco = (itens) => itens.filter((item) => item.preco === null).length;

/** Diferença entre pago e estimado, só considerando itens no carrinho que tinham estimativa. */
export function calcularDiferenca(itens) {
  return itens
    .filter((item) => estaNoCarrinho(item) && item.preco !== null)
    .reduce((total, item) => total + subtotalPago(item) - subtotalPrevisto(item), 0);
}

/** Diferença de um único item (null quando não há como comparar). */
export function calcularDiferencaDoItem(item) {
  if (!estaNoCarrinho(item) || item.preco === null) return null;
  return subtotalPago(item) - subtotalPrevisto(item);
}

export const calcularSubtotalExibido = (item) => (estaNoCarrinho(item) ? subtotalPago(item) : subtotalPrevisto(item));
