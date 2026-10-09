import { criarElemento, icone } from '../utils/dom.js';
import { formatarMes, formatarPreco, formatarVariacao } from '../utils/formatadores.js';

function criarSeloVariacao(variacao) {
  if (variacao === null) return null;
  if (Math.abs(variacao) < 0.05) return criarElemento('span', { classe: 'badge-neutro', texto: 'Sem variação' });

  const subiu = variacao > 0;
  return criarElemento(
    'span',
    { classe: subiu ? 'badge-alerta' : 'badge-bom' },
    icone(subiu ? 'trending_up' : 'trending_down', 'text-base'),
    formatarVariacao(variacao),
  );
}

export function renderizarComparativo(container, meses) {
  if (meses.length === 0) {
    container.replaceChildren(
      criarElemento('li', {
        classe: 'rounded-lg border border-dashed border-outline-variant p-6 text-center text-on-surface-variant',
        texto: 'Finalize compras para ver a evolução mês a mês.',
      }),
    );
    return;
  }

  container.replaceChildren(
    ...meses.map((mes) =>
      criarElemento(
        'li',
        { classe: 'card flex items-center justify-between gap-3 p-4' },
        criarElemento(
          'div',
          {},
          criarElemento('p', { classe: 'text-body-lg capitalize', texto: formatarMes(mes.chave) }),
          criarElemento('p', {
            classe: 'text-body-sm text-on-surface-variant',
            texto: `${mes.compras} ${mes.compras === 1 ? 'compra' : 'compras'}`,
          }),
        ),
        criarElemento(
          'div',
          { classe: 'flex flex-col items-end gap-1' },
          criarElemento('p', { classe: 'text-headline-sm', texto: formatarPreco(mes.total) }),
          criarSeloVariacao(mes.variacao),
        ),
      ),
    ),
  );
}
