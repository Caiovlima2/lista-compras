import { calcularPrecoBase } from '../utils/calculos.js';
import { normalizarTexto } from '../utils/texto.js';
import { gerarId } from '../utils/id.js';

/**
 * Um item da lista.
 * - preco: preço ESTIMADO por unidade (null = "Preço a definir")
 * - compra: null enquanto não está no carrinho; depois { preco, quantidade } reais
 * - categoria: opcional ('' = sem categoria)
 */
export function criarItem({ nome, marca = '', preco = null, peso = null, unidade = 'g', quantidade = 1, categoria = '' }) {
  return {
    id: gerarId(),
    nome: nome.trim(),
    marca: marca.trim(),
    preco,
    quantidade,
    peso,
    unidade,
    categoria,
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
    categoria: '',
    ...item,
    compra,
  };
}

/** Identifica "o mesmo produto" (nome + marca, sem acentos e sem diferença de maiúsculas). */
export const chaveDoItem = ({ nome, marca }) => `${normalizarTexto(nome)}|${normalizarTexto(marca ?? '')}`;

/** Preço por kg/L/un do item (usa o preço pago, se houver, senão o estimado). */
export function calcularPrecoBaseDoItem(item) {
  const preco = item.compra?.preco ?? item.preco;
  return calcularPrecoBase(preco, item.peso, item.unidade);
}
