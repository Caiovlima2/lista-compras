import { criarElemento } from '../utils/dom.js';
import { criarLinhaItem } from './itemLinha.js';

export function renderListaItens(container, itens, { aoRemover }) {
  if (itens.length === 0) {
    container.replaceChildren(
      criarElemento('li', {
        classe: 'list-group-item text-body-secondary',
        texto: 'Sua lista está vazia.',
      }),
    );
    return;
  }

  container.replaceChildren(...itens.map((item) => criarLinhaItem(item, { aoRemover })));
}