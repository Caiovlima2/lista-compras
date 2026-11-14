import { criarElemento, icone } from '../utils/dom.js';

/** Tela provisória das abas ainda em construção. */
export function renderizarEmBreve(container, { nomeIcone, titulo, texto }) {
  container.replaceChildren(
    criarElemento(
      'div',
      { classe: 'card space-y-2 p-8 text-center' },
      icone(nomeIcone, 'text-5xl text-primary'),
      criarElemento('h2', { classe: 'text-headline-md', texto: titulo }),
      criarElemento('p', { classe: 'text-body-md text-on-surface-variant', texto }),
    ),
  );
}
