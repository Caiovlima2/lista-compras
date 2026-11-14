import { criarItem } from '../item.js';

const NOME_CARNE_PADRAO = 'Carne para churrasco';

/** Converte "quantidade + unidade do evento" no formato dos itens da lista. */
function medidaParaItem({ quantidade, unidade }) {
  if (unidade === 'un') return { quantidade, peso: null, unidade: 'un' };
  if (unidade === 'g' && quantidade >= 1000) return { quantidade: 1, peso: quantidade / 1000, unidade: 'kg' };
  return { quantidade: 1, peso: quantidade, unidade };
}

/** O que o evento manda para a lista de compras: itens a comprar e a carne que falta. */
export function listarItensDoEvento(calculo, evento) {
  const itens = calculo.itens
    .filter((item) => !item.emCasa && item.quantidade > 0)
    .map(({ nome, categoria, quantidade, unidade }) => ({ nome, categoria, ...medidaParaItem({ quantidade, unidade }) }));

  if (calculo.carne.faltam > 0) {
    const nome = evento.corteFaltante.trim() || NOME_CARNE_PADRAO;
    itens.unshift({ nome, categoria: 'Carnes', ...medidaParaItem({ quantidade: calculo.carne.faltam, unidade: 'g' }) });
  }
  return itens;
}

/** Cria os itens da lista, marcando de onde vieram (aparece como selo na lista). */
export const criarItensDoEvento = (descricoes, evento) =>
  descricoes.map((descricao) => ({ ...criarItem(descricao), origem: { tipo: evento.tipo, nome: evento.nome } }));
