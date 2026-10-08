import { criarElemento } from '../utils/dom.js';
import { formatarMes, formatarPreco, formatarVariacao } from '../utils/formatadores.js';

export function renderComparativo(container, meses) {
  if (meses.length === 0) {
    container.replaceChildren(
      criarElemento('li', {
        classe: 'list-group-item text-body-secondary',
        texto: 'Salve listas para ver o comparativo entre meses.',
      }),
    );
    return;
  }

  container.replaceChildren(...meses.map(criarLinhaMes));
}

function criarLinhaMes({ mes, total, variacao }) {
  return criarElemento(
    'li',
    { classe: 'list-group-item d-flex justify-content-between align-items-center' },
    criarElemento('span', { texto: formatarMes(mes) }),
    criarElemento(
      'span',
      {},
      criarElemento('strong', { texto: formatarPreco(total) }),
      criarBadgeVariacao(variacao),
    ),
  );
}

function criarBadgeVariacao(variacao) {
  if (variacao === null) return null;

  return criarElemento('span', {
    classe: `badge ms-2 ${corDaVariacao(variacao)}`,
    texto: formatarVariacao(variacao),
    atributos: { title: 'Variação em relação ao mês anterior' },
  });
}

// Gastar mais que no mês anterior aparece em vermelho; gastar menos, em verde.
function corDaVariacao(variacao) {
  if (variacao > 0) return 'text-bg-danger';
  if (variacao < 0) return 'text-bg-success';
  return 'text-bg-secondary';
}