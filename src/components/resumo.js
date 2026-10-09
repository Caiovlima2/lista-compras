import { criarElemento, icone } from '../utils/dom.js';
import { formatarDiferenca, formatarPreco } from '../utils/formatadores.js';
import {
  calcularDiferenca,
  calcularTotalNoCarrinho,
  calcularTotalPrevisto,
  contarNoCarrinho,
  contarSemPreco,
} from '../domain/lista.js';

const coluna = (rotulo, valor, classeValor = '') =>
  criarElemento(
    'div',
    {},
    criarElemento('p', { classe: 'text-label-md text-on-surface-variant', texto: rotulo }),
    criarElemento('p', { classe: `text-headline-md ${classeValor}`.trim(), texto: valor }),
  );

function resumoPlanejando(itens) {
  const semPreco = contarSemPreco(itens);
  const detalhe = [`${itens.length} ${itens.length === 1 ? 'item' : 'itens'}`];
  if (semPreco > 0) detalhe.push(`${semPreco} sem preço`);

  return criarElemento(
    'div',
    { classe: 'rounded-lg bg-primary-container p-5 text-on-primary-container shadow-sm' },
    criarElemento('p', { classe: 'text-label-md opacity-90', texto: 'PLANEJANDO EM CASA' }),
    criarElemento('p', { classe: 'text-price-hero', texto: formatarPreco(calcularTotalPrevisto(itens)) }),
    criarElemento('p', { classe: 'text-body-md opacity-90', texto: `Total previsto · ${detalhe.join(' · ')}` }),
  );
}

function resumoComprando(itens, sessao, economia) {
  const noCarrinho = contarNoCarrinho(itens);
  const porcentagem = itens.length ? Math.round((noCarrinho / itens.length) * 100) : 0;
  const diferenca = calcularDiferenca(itens);

  const selos = [];
  if (noCarrinho > 0 && Math.abs(diferenca) >= 0.005) {
    selos.push(
      criarElemento(
        'span',
        { classe: diferenca > 0 ? 'badge-alerta' : 'badge-bom' },
        icone(diferenca > 0 ? 'trending_up' : 'trending_down', 'text-base'),
        `${formatarDiferenca(diferenca)} vs. previsto`,
      ),
    );
  }
  if (economia > 0) {
    selos.push(
      criarElemento('span', { classe: 'badge-bom' }, icone('savings', 'text-base'), `Economia ${formatarPreco(economia)}`),
    );
  }

  return criarElemento(
    'div',
    { classe: 'card space-y-4 p-5' },
    criarElemento(
      'div',
      { classe: 'flex items-center justify-between gap-3' },
      criarElemento(
        'p',
        { classe: 'flex items-center gap-2 text-label-lg text-primary' },
        icone('storefront'),
        sessao.mercado ? `Comprando em ${sessao.mercado}` : 'Modo mercado',
      ),
      criarElemento('p', { classe: 'text-label-md text-on-surface-variant', texto: `${noCarrinho} de ${itens.length}` }),
    ),
    criarElemento(
      'div',
      {
        classe: 'h-2 overflow-hidden rounded-full bg-surface-container-high',
        atributos: { role: 'progressbar', 'aria-valuenow': porcentagem, 'aria-valuemin': 0, 'aria-valuemax': 100 },
      },
      criarElemento('div', { classe: 'h-full rounded-full bg-primary transition-all', atributos: { style: `width:${porcentagem}%` } }),
    ),
    criarElemento(
      'div',
      { classe: 'grid grid-cols-2 gap-3' },
      coluna('No carrinho', formatarPreco(calcularTotalNoCarrinho(itens)), 'text-primary'),
      coluna('Previsto total', formatarPreco(calcularTotalPrevisto(itens))),
    ),
    selos.length ? criarElemento('div', { classe: 'flex flex-wrap gap-2' }, ...selos) : null,
  );
}

export function renderizarResumo(container, { itens, sessao, comprando, economia }) {
  container.replaceChildren(comprando ? resumoComprando(itens, sessao, economia) : resumoPlanejando(itens));
}
