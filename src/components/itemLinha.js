import { criarElemento, icone } from '../utils/dom.js';
import {
  formatarDiferenca,
  formatarPesoItem,
  formatarPreco,
  formatarPrecoBase,
  formatarQuantidade,
  formatarTituloItem,
  formatarVariacao,
} from '../utils/formatadores.js';
import { calcularDiferencaDoItem, calcularSubtotalExibido, estaNoCarrinho } from '../domain/lista.js';
import { calcularPrecoBaseDoItem } from '../domain/item.js';

function criarDetalhe(item) {
  const partes = [formatarPesoItem(item)];
  const base = calcularPrecoBaseDoItem(item);
  if (base) partes.push(formatarPrecoBase(base));
  partes.push(`${formatarQuantidade(item.compra?.quantidade ?? item.quantidade)}×`);
  return partes.filter(Boolean).join(' · ');
}

function criarSelos(item, percentualCustoBeneficio) {
  const diferenca = calcularDiferencaDoItem(item);
  return [
    percentualCustoBeneficio
      ? criarElemento(
          'span',
          { classe: 'badge-bom' },
          icone('thumb_up', 'text-sm'),
          `Mais barato ${formatarVariacao(-percentualCustoBeneficio)}`,
        )
      : null,
    diferenca !== null && Math.abs(diferenca) >= 0.005
      ? criarElemento('span', { classe: diferenca > 0 ? 'badge-alerta' : 'badge-bom' }, formatarDiferenca(diferenca))
      : null,
  ];
}

function criarPreco(item) {
  const semPreco = item.preco === null && !estaNoCarrinho(item);
  return criarElemento(
    'div',
    { classe: 'text-right' },
    criarElemento('p', {
      classe: semPreco ? 'text-label-md text-tertiary' : 'text-headline-sm',
      texto: semPreco ? 'Preço a definir' : formatarPreco(calcularSubtotalExibido(item)),
    }),
  );
}

/** Linha do modo "planejando": nome, preço estimado e botão de remover. */
export function criarLinhaPlanejamento(item, { custoBeneficio, aoRemover }) {
  return criarElemento(
    'li',
    { classe: 'card flex items-center gap-3 p-3 pl-4' },
    criarElemento(
      'div',
      { classe: 'min-w-0 flex-1 space-y-1' },
      criarElemento('p', { classe: 'truncate text-body-lg', texto: formatarTituloItem(item) }),
      criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: criarDetalhe(item) }),
      criarElemento('div', { classe: 'flex flex-wrap gap-1' }, ...criarSelos(item, custoBeneficio)),
    ),
    criarPreco(item),
    criarElemento(
      'button',
      {
        classe: 'btn btn-ghost size-12 min-h-0 shrink-0 p-0',
        atributos: { type: 'button', 'aria-label': `Remover ${item.nome}` },
        aoClicar: aoRemover,
      },
      icone('delete'),
    ),
  );
}

/** Linha do "modo mercado": checkbox, preço pago e botão para registrar o preço real. */
export function criarLinhaMercado(item, { custoBeneficio, aoAlternarCarrinho, aoRegistrar }) {
  const noCarrinho = estaNoCarrinho(item);

  const checkbox = criarElemento('input', {
    classe: 'size-6 cursor-pointer accent-primary',
    atributos: { type: 'checkbox', checked: noCarrinho, 'aria-label': `${item.nome} no carrinho` },
  });
  checkbox.addEventListener('change', aoAlternarCarrinho);

  return criarElemento(
    'li',
    { classe: `card flex items-center gap-1 p-2 pr-3 transition ${noCarrinho ? 'opacity-70' : ''}` },
    criarElemento('label', { classe: 'grid size-12 shrink-0 cursor-pointer place-items-center' }, checkbox),
    criarElemento(
      'div',
      { classe: 'min-w-0 flex-1 space-y-1' },
      criarElemento('p', {
        classe: `truncate text-body-lg ${noCarrinho ? 'text-outline line-through' : ''}`,
        texto: formatarTituloItem(item),
      }),
      criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: criarDetalhe(item) }),
      criarElemento('div', { classe: 'flex flex-wrap gap-1' }, ...criarSelos(item, custoBeneficio)),
    ),
    criarPreco(item),
    criarElemento(
      'button',
      {
        classe: 'btn btn-tonal size-12 min-h-0 shrink-0 p-0',
        atributos: { type: 'button', 'aria-label': `${noCarrinho ? 'Editar' : 'Registrar'} preço de ${item.nome}` },
        aoClicar: aoRegistrar,
      },
      icone(noCarrinho ? 'edit' : 'add'),
    ),
  );
}
