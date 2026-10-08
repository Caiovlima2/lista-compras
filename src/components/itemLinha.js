import { criarElemento } from '../utils/dom.js';
import { calcularSubtotal } from '../domain/lista.js';
import {
  formatarPreco,
  formatarTituloItem,
  formatarDetalheItem,
} from '../utils/formatadores.js';

export function criarLinhaItem(item, { aoRemover } = {}) {
  const detalhe = formatarDetalheItem(item);

  const informacoes = criarElemento(
    'div',
    {},
    criarElemento('div', { classe: 'fw-semibold', texto: formatarTituloItem(item) }),
    detalhe && criarElemento('small', { classe: 'text-body-secondary', texto: detalhe }),
  );

  const botaoRemover =
    aoRemover &&
    criarElemento('button', {
      classe: 'btn btn-outline-danger btn-sm ms-3',
      texto: 'Remover',
      atributos: { type: 'button', 'aria-label': `Remover ${item.nome}` },
      aoClicar: () => aoRemover(item.id),
    });

  const lado = criarElemento(
    'div',
    { classe: 'd-flex align-items-center' },
    criarElemento('span', { classe: 'fw-semibold', texto: formatarPreco(calcularSubtotal(item)) }),
    botaoRemover,
  );

  return criarElemento(
    'li',
    { classe: 'list-group-item d-flex justify-content-between align-items-center' },
    informacoes,
    lado,
  );
}