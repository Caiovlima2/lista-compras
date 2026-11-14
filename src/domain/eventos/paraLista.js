import { medidaParaItem } from '../medida.js';
import { listarIngredientesEscolhidos } from './calculadora.js';

/** O que o evento manda para a lista de compras: a carne que falta de cada tipo e os complementos marcados. */
export function listarItensDoEvento(calculo, evento) {
  const carnes = calculo.carne.tipos
    .filter((tipo) => tipo.faltam > 0)
    .map((tipo) => ({
      nome: evento.corteFaltante[tipo.id]?.trim() || tipo.nomePadrao,
      categoria: 'Carnes',
      ...medidaParaItem({ quantidade: tipo.faltam, unidade: 'g' }),
    }));

  const complementos = listarIngredientesEscolhidos(calculo)
    .filter((ingrediente) => !ingrediente.emCasa && ingrediente.quantidade > 0)
    .map(({ nome, categoria, quantidade, unidade }) => ({ nome, categoria, ...medidaParaItem({ quantidade, unidade }) }));

  return [...carnes, ...complementos];
}
