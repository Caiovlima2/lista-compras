// A ordem define a ordem exibida nos seletores de unidade (a primeira vem selecionada).
const CONVERSOES = {
  // Produtos vendidos em pacote com várias unidades (ex.: papel higiênico, 12 un)
  un: { divisor: 1, rotulo: 'un' },
  g: { divisor: 1000, rotulo: 'kg' },
  kg: { divisor: 1, rotulo: 'kg' },
  ml: { divisor: 1000, rotulo: 'L' },
  L: { divisor: 1, rotulo: 'L' },
};

export const UNIDADES = Object.keys(CONVERSOES);

/** Unidade usada quando nada foi escolhido (a primeira do seletor). */
export const UNIDADE_PADRAO = UNIDADES[0];

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
