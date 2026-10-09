const CONVERSOES = {
  g: { divisor: 1000, rotulo: 'kg' },
  kg: { divisor: 1, rotulo: 'kg' },
  ml: { divisor: 1000, rotulo: 'L' },
  L: { divisor: 1, rotulo: 'L' },
};

export const UNIDADES = Object.keys(CONVERSOES);

/**
 * Converte preço + peso/volume em preço por kg ou por litro.
 * Retorna null quando faltam dados para calcular.
 */
export function calcularPrecoBase(preco, peso, unidade) {
  const conversao = CONVERSOES[unidade];
  if (!conversao || !(preco > 0) || !(peso > 0)) return null;

  return {
    valor: preco / (peso / conversao.divisor),
    rotulo: conversao.rotulo,
  };
}
