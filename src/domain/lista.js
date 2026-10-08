export function calcularSubtotal({ preco, quantidade = 1 }) {
  return preco * quantidade;
}

export function calcularTotal(itens) {
  return itens.reduce((soma, item) => soma + calcularSubtotal(item), 0);
}