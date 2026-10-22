import { criarElemento, icone } from '../utils/dom.js';
import { formatarQuantidade } from '../utils/formatadores.js';

export function ocultarAvisoDuplicado(container) {
  container.replaceChildren();
}

/** Pergunta se o item repetido deve somar na quantidade do que já está na lista. */
export function mostrarAvisoDuplicado(container, { nome, quantidadeTotal, aoSomar, aoManterSeparado }) {
  container.replaceChildren(
    criarElemento(
      'div',
      { classe: 'space-y-3 rounded-lg border border-secondary-container bg-secondary-container/40 p-3', atributos: { role: 'alert' } },
      criarElemento(
        'div',
        { classe: 'flex gap-2' },
        icone('warning', 'text-secondary'),
        criarElemento(
          'div',
          {},
          criarElemento('p', { classe: 'text-label-lg', texto: `Você já tem "${nome}" na lista` }),
          criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: 'Deseja somar à quantidade ou adicionar como item separado?' }),
        ),
      ),
      criarElemento(
        'div',
        { classe: 'flex gap-2' },
        criarElemento('button', {
          classe: 'btn btn-primary flex-1',
          texto: `Somar (total: ${formatarQuantidade(quantidadeTotal)})`,
          atributos: { type: 'button' },
          aoClicar: aoSomar,
        }),
        criarElemento('button', {
          classe: 'btn btn-ghost flex-1 border border-outline-variant',
          texto: 'Manter separado',
          atributos: { type: 'button' },
          aoClicar: aoManterSeparado,
        }),
      ),
    ),
  );
}
