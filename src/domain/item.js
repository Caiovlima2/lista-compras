import { calcularPrecoBase } from '../utils/calculos.js';
import { gerarId } from '../utils/id.js';

/**
 * Monta um item de compra a partir dos dados do formulário.
 * Peso e valor por kg/L são opcionais.
 */
export function criarItem({ nome, marca, preco, peso, unidade, quantidade = 1 }) {
  const temPeso = peso > 0;
  const precoBase = temPeso ? calcularPrecoBase(preco, peso, unidade) : null;

  return {
    id: gerarId(),
    nome,
    marca,
    preco,
    quantidade,
    peso: temPeso ? peso : null,
    unidade: temPeso ? unidade : null,
    precoBase: precoBase?.valor ?? null,
    rotuloBase: precoBase?.rotulo ?? null,
    mercado: '',
    comprado: false,
  };
}