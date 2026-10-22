/** Lê números digitados em pt-BR ("3,49" ou "3.49"). Retorna null se vazio ou inválido. */
export function lerNumero(texto) {
  const limpo = String(texto ?? '').trim().replace(',', '.');
  if (limpo === '') return null;
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : null;
}

export const arredondar = (numero, casas = 3) => {
  const fator = 10 ** casas;
  return Math.round(numero * fator) / fator;
};
