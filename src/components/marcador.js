import { criarElemento, icone } from '../utils/dom.js';

/**
 * Caixa de marcar (checkbox estilizado) com ícone, título e, opcionalmente, subtítulo.
 * Devolve o rótulo clicável, a caixa e os textos (para atualizar depois).
 */
export function criarMarcador({ nomeIcone, titulo, subtitulo, aoAlternar }) {
  const caixa = criarElemento('input', { classe: 'peer sr-only', atributos: { type: 'checkbox' } });
  caixa.addEventListener('change', aoAlternar);

  const tituloEl = criarElemento('span', { classe: 'block truncate text-body-lg', texto: titulo });
  const subtituloEl = criarElemento('span', { classe: 'block text-body-sm text-on-surface-variant', texto: subtitulo });

  const rotulo = criarElemento(
    'label',
    { classe: 'flex min-h-14 min-w-0 flex-1 cursor-pointer items-center gap-3 px-4' },
    caixa,
    criarElemento('span', { classe: 'grid size-6 shrink-0 place-items-center rounded-md border-2 border-outline text-on-primary transition peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:outline-2 peer-focus-visible:outline-primary' }, icone('check', 'text-base')),
    nomeIcone ? icone(nomeIcone, 'text-primary') : null,
    criarElemento('span', { classe: 'min-w-0' }, tituloEl, subtitulo === undefined ? null : subtituloEl),
  );

  return { rotulo, caixa, tituloEl, subtituloEl };
}
