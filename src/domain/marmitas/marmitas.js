import { gerarId } from '../../utils/id.js';
import { arredondar } from '../../utils/numero.js';
import { normalizarTexto } from '../../utils/texto.js';
import { medidaParaItem } from '../medida.js';

export const TIPO_MARMITAS = 'marmitas';

/**
 * Planejamento das marmitas da semana (um tipo de evento).
 * - marmitas: quantas marmitas serão feitas
 * - receitas: receitas escolhidas: { receitaId, porcoes }. `porcoes: null` = acompanha o número de marmitas
 *   (cada marmita leva uma porção de cada receita); um número fixa as porções daquela receita
 * - ajustes: mudanças à mão nos ingredientes consolidados, por chave: { quantidade?, emCasa? }
 */
export function criarPlanoMarmitas(agora = new Date()) {
  return {
    id: gerarId(),
    tipo: TIPO_MARMITAS,
    nome: 'Marmitas da semana',
    data: '',
    marmitas: 10,
    receitas: [],
    ajustes: {},
    criadoEm: agora.toISOString(),
  };
}

export function normalizarPlanoMarmitas(bruto) {
  const { id: _id, ...padrao } = criarPlanoMarmitas();
  return { ...padrao, ...bruto, receitas: bruto.receitas ?? [], ajustes: bruto.ajustes ?? {} };
}

export const porcoesDaEntrada = (plano, entrada) => entrada.porcoes ?? plano.marmitas;

/** Muda o que afeta as quantidades. Quantidades ajustadas à mão voltam ao cálculo; "já tenho" é mantido. */
function recalcular(plano, mudancas) {
  const ajustes = Object.fromEntries(
    Object.entries(plano.ajustes)
      .filter(([, ajuste]) => ajuste.emCasa)
      .map(([chave]) => [chave, { emCasa: true }]),
  );
  return { ...plano, ...mudancas, ajustes };
}

export const alterarMarmitas = (plano, marmitas) =>
  recalcular(plano, { marmitas, receitas: plano.receitas.map((entrada) => ({ ...entrada, porcoes: null })) });

export const alternarReceitaDoPlano = (plano, receitaId) =>
  recalcular(plano, {
    receitas: plano.receitas.some((entrada) => entrada.receitaId === receitaId)
      ? plano.receitas.filter((entrada) => entrada.receitaId !== receitaId)
      : [...plano.receitas, { receitaId, porcoes: null }],
  });

export const definirPorcoesDaReceita = (plano, receitaId, porcoes) =>
  recalcular(plano, { receitas: plano.receitas.map((entrada) => (entrada.receitaId === receitaId ? { ...entrada, porcoes } : entrada)) });

export const ajustarIngredienteDoPlano = (plano, chave, parcial) => ({
  ...plano,
  ajustes: { ...plano.ajustes, [chave]: { ...plano.ajustes[chave], ...parcial } },
});

/* ---------- Ingredientes consolidados ---------- */

// Cada unidade pertence a uma família; dentro dela, tudo é somado na unidade base (g, ml ou un).
const FAMILIAS = {
  g: { familia: 'massa', fator: 1, base: 'g' },
  kg: { familia: 'massa', fator: 1000, base: 'g' },
  ml: { familia: 'volume', fator: 1, base: 'ml' },
  L: { familia: 'volume', fator: 1000, base: 'ml' },
  un: { familia: 'unidade', fator: 1, base: 'un' },
};

const passoDe = (unidade) => (unidade === 'un' ? 1 : 50);

/**
 * Soma os ingredientes de todas as receitas escolhidas, cada uma na sua quantidade de porções.
 * O mesmo ingrediente (mesmo nome e mesma família de unidade) vira uma linha só.
 * Receitas que não existem mais são ignoradas.
 */
export function consolidarIngredientes(plano, receitas) {
  const linhas = new Map();

  plano.receitas.forEach((entrada) => {
    const receita = receitas.find((atual) => atual.id === entrada.receitaId);
    if (!receita) return;
    const fator = porcoesDaEntrada(plano, entrada) / receita.porcoes;

    receita.ingredientes.forEach(({ nome, quantidade, unidade }) => {
      const { familia, fator: paraBase, base } = FAMILIAS[unidade];
      const chave = `${normalizarTexto(nome)}|${familia}`;
      const atual = linhas.get(chave) ?? { chave, nome, unidade: base, total: 0, fontes: [] };
      atual.total += quantidade * fator * paraBase;
      if (!atual.fontes.includes(receita.nome)) atual.fontes.push(receita.nome);
      linhas.set(chave, atual);
    });
  });

  return [...linhas.values()].map(({ chave, nome, unidade, total, fontes }) => {
    const calculada = Math.ceil(arredondar(total, 6));
    const ajuste = plano.ajustes[chave];
    return { chave, nome, unidade, fontes, calculada, quantidade: ajuste?.quantidade ?? calculada, emCasa: Boolean(ajuste?.emCasa), passo: passoDe(unidade) };
  });
}

/** O que o planejamento manda para a lista de compras: tudo o que não está marcado "já tenho". */
export const listarItensDoPlano = (ingredientes) =>
  ingredientes
    .filter((ingrediente) => !ingrediente.emCasa && ingrediente.quantidade > 0)
    .map(({ nome, quantidade, unidade }) => ({ nome, categoria: '', ...medidaParaItem({ quantidade, unidade }) }));
