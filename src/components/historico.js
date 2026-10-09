import { criarElemento, icone } from '../utils/dom.js';
import {
  formatarData,
  formatarHora,
  formatarPesoItem,
  formatarPreco,
  formatarQuantidade,
  formatarTituloItem,
} from '../utils/formatadores.js';
import { ordenarRegistrosRecentes } from '../domain/historico.js';

function criarLinhaSalva(item) {
  const detalhe = [formatarPesoItem(item), `${formatarQuantidade(item.quantidade)} un`].filter(Boolean).join(' · ');
  return criarElemento(
    'li',
    { classe: 'flex items-center justify-between gap-3 py-2' },
    criarElemento(
      'div',
      { classe: 'min-w-0' },
      criarElemento('p', { classe: 'truncate text-body-md', texto: formatarTituloItem(item) }),
      criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: detalhe }),
    ),
    criarElemento('p', { classe: 'text-label-lg', texto: formatarPreco(item.preco * item.quantidade) }),
  );
}

function criarRegistro(registro, { aoCopiar, aoExcluir }) {
  const titulo = registro.mercado || 'Compra sem local';
  const quando = `${formatarData(registro.data)} · ${formatarHora(registro.data)}`;

  return criarElemento(
    'details',
    { classe: 'card group' },
    criarElemento(
      'summary',
      { classe: 'flex cursor-pointer list-none items-center justify-between gap-3 p-4' },
      criarElemento(
        'div',
        { classe: 'min-w-0' },
        criarElemento('p', { classe: 'truncate text-body-lg', texto: titulo }),
        criarElemento('p', {
          classe: 'text-body-sm text-on-surface-variant',
          texto: `${quando} · ${registro.itens.length} ${registro.itens.length === 1 ? 'item' : 'itens'}`,
        }),
      ),
      criarElemento(
        'div',
        { classe: 'flex shrink-0 items-center gap-2' },
        criarElemento('p', { classe: 'text-headline-sm', texto: formatarPreco(registro.total) }),
        icone('expand_more', 'transition group-open:rotate-180'),
      ),
    ),
    criarElemento(
      'div',
      { classe: 'border-t border-outline-variant px-4 pb-4' },
      registro.economia > 0
        ? criarElemento(
            'p',
            { classe: 'pt-3' },
            criarElemento('span', { classe: 'badge-bom' }, icone('savings', 'text-base'), `Economia ${formatarPreco(registro.economia)}`),
          )
        : null,
      criarElemento('ul', { classe: 'divide-y divide-outline-variant' }, ...registro.itens.map(criarLinhaSalva)),
      criarElemento(
        'div',
        { classe: 'flex gap-2 pt-3' },
        criarElemento(
          'button',
          { classe: 'btn btn-tonal flex-1', atributos: { type: 'button' }, aoClicar: aoCopiar },
          icone('content_copy'),
          'Copiar lista',
        ),
        criarElemento(
          'button',
          {
            classe: 'btn btn-ghost size-12 min-h-0 p-0 text-error',
            atributos: { type: 'button', 'aria-label': 'Excluir lista salva' },
            aoClicar: aoExcluir,
          },
          icone('delete'),
        ),
      ),
    ),
  );
}

export function renderizarHistorico(container, contador, registros, acoes) {
  contador.textContent = `${registros.length} ${registros.length === 1 ? 'compra registrada' : 'compras registradas'}`;

  if (registros.length === 0) {
    container.replaceChildren(
      criarElemento('p', {
        classe: 'rounded-lg border border-dashed border-outline-variant p-6 text-center text-on-surface-variant',
        texto: 'Nenhuma compra salva ainda.',
      }),
    );
    return;
  }

  container.replaceChildren(
    ...ordenarRegistrosRecentes(registros).map((registro) =>
      criarRegistro(registro, {
        aoCopiar: () => acoes.copiar(registro.id),
        aoExcluir: () => acoes.excluir(registro.id),
      }),
    ),
  );
}
