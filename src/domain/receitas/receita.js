import { gerarId } from '../../utils/id.js';
import { arredondar } from '../../utils/numero.js';
import { medidaParaItem } from '../medida.js';

/**
 * Uma receita.
 * - porcoes: para quantas porções as quantidades dos ingredientes foram escritas
 * - ingredientes: { id, nome, quantidade, unidade }  (unidade: un, g, kg, ml ou L)
 * - anotacoes: texto livre opcional (modo de preparo, dicas)
 */
export function criarReceita({ nome, porcoes, ingredientes, anotacoes = '' }, agora = new Date()) {
  return {
    id: gerarId(),
    nome: nome.trim(),
    porcoes,
    ingredientes: ingredientes.map(({ id = gerarId(), nome: nomeIngrediente, quantidade, unidade }) => ({
      id,
      nome: nomeIngrediente.trim(),
      quantidade,
      unidade,
    })),
    anotacoes: anotacoes.trim(),
    criadoEm: agora.toISOString(),
  };
}

/** Garante o formato atual em receitas salvas por versões anteriores. */
export const normalizarReceita = (bruta) => ({ anotacoes: '', ingredientes: [], porcoes: 1, ...bruta });

/** Cópia com novos identificadores, para editar sem mexer na original. */
export const duplicarReceita = (receita) =>
  criarReceita({
    nome: `${receita.nome} (cópia)`,
    porcoes: receita.porcoes,
    ingredientes: receita.ingredientes.map(({ id: _id, ...ingrediente }) => ingrediente),
    anotacoes: receita.anotacoes,
  });

/**
 * Avisos que impedem salvar. Linhas de ingrediente totalmente vazias são ignoradas.
 * `dados.ingredientes`: [{ nome, quantidade (número ou null) }]
 */
export function listarPendencias({ nome, ingredientes }) {
  const pendencias = [];
  if (!nome.trim()) pendencias.push('Informe o nome da receita');

  const preenchidos = ingredientes.filter((ingrediente) => ingrediente.nome.trim() || ingrediente.quantidade !== null);
  if (preenchidos.length === 0) pendencias.push('Adicione pelo menos um ingrediente');

  preenchidos.forEach((ingrediente, indice) => {
    const rotulo = ingrediente.nome.trim() ? `"${ingrediente.nome.trim()}"` : `do ingrediente ${indice + 1}`;
    if (!ingrediente.nome.trim()) pendencias.push(`Informe o nome do ingrediente ${indice + 1}`);
    if (!(ingrediente.quantidade > 0)) pendencias.push(`Informe a quantidade ${rotulo}`);
  });

  return pendencias;
}

/** Quantidades para outro número de porções. Unidades inteiras ("un") sobem para o próximo inteiro. */
export function escalarIngredientes(receita, porcoes) {
  const fator = porcoes / receita.porcoes;
  return receita.ingredientes.map((ingrediente) => {
    const escalada = ingrediente.quantidade * fator;
    return { ...ingrediente, quantidade: ingrediente.unidade === 'un' ? Math.ceil(arredondar(escalada, 6)) : arredondar(escalada) };
  });
}

/** Ingredientes que irão para a lista de compras (os marcados "já tenho" ficam de fora). */
export const listarItensDaReceita = (ingredientesEscalados, emCasa) =>
  ingredientesEscalados
    .filter((ingrediente) => !emCasa[ingrediente.id])
    .map(({ nome, quantidade, unidade }) => ({ nome, categoria: '', ...medidaParaItem({ quantidade, unidade }) }));
