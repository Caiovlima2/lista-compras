/**
 * Converte "quantidade + unidade" (de um evento ou de uma receita) no formato dos itens da lista.
 * - un: a quantidade é o número de unidades
 * - g e ml a partir de 1000 viram kg e L
 * - demais medidas: 1 pacote com esse peso/volume
 */
export function medidaParaItem({ quantidade, unidade }) {
  if (unidade === 'un') return { quantidade, peso: null, unidade: 'un' };
  if (unidade === 'g' && quantidade >= 1000) return { quantidade: 1, peso: quantidade / 1000, unidade: 'kg' };
  if (unidade === 'ml' && quantidade >= 1000) return { quantidade: 1, peso: quantidade / 1000, unidade: 'L' };
  return { quantidade: 1, peso: quantidade, unidade };
}
