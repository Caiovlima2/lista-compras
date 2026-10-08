const CONVERSOES = {
  g: { fator: 1000, base: 'kg' },
  kg: { fator: 1, base: 'kg' },
  ml: { fator: 1000, base: 'L' },
  L: { fator: 1, base: 'L' },
};

export const UNIDADES = Object.keys(CONVERSOES);

/**
 * Converte o preço para o valor por kg (ou por litro).
 * @returns {{ valor: number, rotulo: string } | null}
 */
export function calcularPrecoBase(preco, peso, unidade) {
  const conversao = CONVERSOES[unidade];
  if (!conversao || !peso || peso <= 0 || Number.isNaN(preco)) return null;

  const quantidadeBase = peso / conversao.fator;
  return { valor: preco / quantidadeBase, rotulo: conversao.base };
}