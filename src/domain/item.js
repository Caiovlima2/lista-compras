import { calcularPrecoBase } from '../utils/calculos.js';
import { gerarId } from '../utils/id.js';

/**
 * Um item da lista.
 * - preco: preço ESTIMADO por unidade (pode ser null = "Preço a definir")
 * - compra: null enquanto não está no carrinho; depois { preco, quantidade } reais
 */
export function criarItem({ nome, marca = '', preco = null, peso = null, unidade = 'g', quantidade = 1 }) {
  return {
    id: gerarId(),
    nome: nome.trim(),
    marca: marca.trim(),
    preco,
    quantidade,
    peso,
    unidade,
    compra: null,
  };
}

/** Garante o formato atual em dados salvos por versões anteriores do app. */
export function normalizarItem(bruto) {
  const { comprado, precoBase, rotuloBase, mercado, ...item } = bruto;
  const compra = bruto.compra ?? (comprado ? { preco: bruto.preco, quantidade: bruto.quantidade ?? 1 } : null);

  return {
    marca: '',
    preco: null,
    peso: null,
    unidade: 'g',
    quantidade: 1,
    ...item,
    compra,
  };
}

/** Preço por kg/L do item (usa o preço pago, se houver, senão o estimado). */
export function calcularPrecoBaseDoItem(item) {
  const preco = item.compra?.preco ?? item.preco;
  return calcularPrecoBase(preco, item.peso, item.unidade);
}
