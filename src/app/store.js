import {
  carregarHistorico,
  carregarItens,
  carregarPreferencias,
  carregarSessao,
  salvarHistorico,
  salvarItens,
  salvarPreferencias,
  salvarSessao,
} from '../services/storage.js';
import { normalizarItem } from '../domain/item.js';
import { FILTROS } from '../domain/lista.js';
import { normalizarSessao } from '../domain/sessao.js';

/**
 * Estado único do app. Só muda por atualizarEstado.
 * Os valores são sempre substituídos (nunca alterados no lugar): é isso que permite
 * saber o que mudou comparando referências.
 */
export const estado = {
  itens: carregarItens().map(normalizarItem),
  registros: carregarHistorico(),
  sessao: normalizarSessao(carregarSessao()),
  preferencias: carregarPreferencias(),
  // Só existem na tela (não são salvos):
  planejando: false, // o usuário já escolheu "planejar com calma"
  aba: 'lista', // aba aberta
  filtro: FILTROS.TODOS, // filtro da lista no planejamento
};

// Cada parte do estado que vai para o aparelho, e quem a grava.
const PERSISTIDOS = {
  itens: salvarItens,
  registros: salvarHistorico,
  sessao: salvarSessao,
  preferencias: salvarPreferencias,
};

const ouvintes = new Set();
let renderizacaoAgendada = false;

/** Registra uma função que redesenha a tela quando o estado muda. */
export function aoAtualizar(ouvinte) {
  ouvintes.add(ouvinte);
}

/**
 * A tela é redesenhada logo após o evento atual terminar. Assim, um campo que perde o foco
 * (e dispara "change") não provoca um redesenho no meio de outro redesenho.
 */
function agendarRenderizacao() {
  if (renderizacaoAgendada) return;
  renderizacaoAgendada = true;
  queueMicrotask(() => {
    renderizacaoAgendada = false;
    ouvintes.forEach((ouvinte) => ouvinte());
  });
}

/** Aplica a mudança, grava só o que mudou e agenda o redesenho. */
export function atualizarEstado(parcial) {
  Object.entries(parcial).forEach(([chave, valor]) => {
    if (estado[chave] === valor) return;
    estado[chave] = valor;
    PERSISTIDOS[chave]?.(valor);
  });
  agendarRenderizacao();
}
