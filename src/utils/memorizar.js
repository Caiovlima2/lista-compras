/**
 * Guarda o último resultado de uma função de um único argumento.
 * Se o argumento for o mesmo objeto da chamada anterior, devolve o resultado guardado.
 * Como o estado é sempre substituído (nunca alterado no lugar), isso é seguro.
 */
export function memorizar(calcular) {
  let calculado = false;
  let ultimaEntrada;
  let ultimaSaida;

  return (entrada) => {
    if (!calculado || entrada !== ultimaEntrada) {
      ultimaSaida = calcular(entrada);
      ultimaEntrada = entrada;
      calculado = true;
    }
    return ultimaSaida;
  };
}
