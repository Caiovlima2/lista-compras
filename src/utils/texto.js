/** Normaliza texto para comparação: sem acentos, minúsculo e sem espaços nas pontas. */
export function normalizarTexto(texto = '') {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}
