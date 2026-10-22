import { criarElemento, sincronizarFilhos } from '../utils/dom.js';
import { formatarPreco } from '../utils/formatadores.js';
import { calcularCustoBeneficio } from '../domain/economia.js';
import { agruparPorCategoria } from '../domain/categorias.js';
import { calcularSubtotalExibido, contarPendentes } from '../domain/lista.js';
import { criarLinhaMercado, criarLinhaPlanejamento } from './itemLinha.js';

/**
 * Cache das linhas já desenhadas: só recria a linha cujo conteúdo mudou.
 * Isso mantém o foco e o teclado no campo que o usuário está usando.
 */
const cache = new Map();

function obterLinha(item, comprando, indiceHistorico, acoes) {
  const custoBeneficio = calcularCustoBeneficio(item, indiceHistorico);
  const assinatura = JSON.stringify([item, comprando, custoBeneficio]);
  const guardada = cache.get(item.id);
  if (guardada?.assinatura === assinatura) return guardada.no;

  const no = comprando ? criarLinhaMercado(item, { custoBeneficio, acoes }) : criarLinhaPlanejamento(item, { custoBeneficio, acoes });
  cache.set(item.id, { assinatura, no });
  return no;
}

function criarCabecalhoGrupo({ rotulo, itens }, comprando) {
  const pendentes = contarPendentes(itens);
  const total = itens.reduce((soma, item) => soma + calcularSubtotalExibido(item), 0);

  return criarElemento(
    'li',
    { classe: 'flex items-center justify-between gap-2 px-1 pt-3', atributos: { role: 'heading', 'aria-level': 3 } },
    criarElemento(
      'div',
      { classe: 'flex items-center gap-2' },
      criarElemento('span', { classe: 'text-label-lg tracking-wide text-on-surface-variant uppercase', texto: rotulo }),
      criarElemento('span', { classe: 'text-body-sm text-outline', texto: `(${itens.length})` }),
      comprando && pendentes > 0 ? criarElemento('span', { classe: 'badge-alerta', texto: `${pendentes} pendentes` }) : null,
    ),
    criarElemento('span', { classe: 'text-label-md tabular-nums text-on-surface-variant', texto: formatarPreco(total) }),
  );
}

const criarVazio = (texto) =>
  criarElemento('li', { classe: 'rounded-lg border border-dashed border-outline-variant p-6 text-center text-on-surface-variant', texto });

export function renderizarLista(container, { itens, comprando, agrupar, indiceHistorico, acoes }) {
  cache.forEach((_, id) => {
    if (!itens.some((item) => item.id === id)) cache.delete(id);
  });

  if (itens.length === 0) {
    sincronizarFilhos(container, [
      criarVazio(
        comprando
          ? 'Nada no carrinho ainda. Caminhe pelos corredores e use a barra acima para adicionar o que for pegando.'
          : 'Sua lista está vazia. Adicione itens acima ou use uma lista anterior.',
      ),
    ]);
    return;
  }

  const linha = (item) => obterLinha(item, comprando, indiceHistorico, acoes);
  const nos = agrupar
    ? agruparPorCategoria(itens).flatMap((grupo) => [criarCabecalhoGrupo(grupo, comprando), ...grupo.itens.map(linha)])
    : itens.map(linha);

  sincronizarFilhos(container, nos);
}
