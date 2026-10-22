import { criarElemento, icone } from '../utils/dom.js';
import {
  formatarCampoPreco,
  formatarDiferenca,
  formatarPesoItem,
  formatarPreco,
  formatarPrecoBase,
  formatarQuantidade,
  formatarTituloItem,
  formatarVariacao,
} from '../utils/formatadores.js';
import { lerNumero } from '../utils/numero.js';
import { calcularDiferencaDoItem, calcularSubtotalExibido, estaNoCarrinho } from '../domain/lista.js';
import { calcularPrecoBaseDoItem } from '../domain/item.js';
import { criarStepper } from './stepper.js';

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
      ? criarElemento('span', { classe: 'badge-bom' }, icone('thumb_up', 'text-sm'), `Mais barato ${formatarVariacao(-percentualCustoBeneficio)}`)
      : null,
    diferenca !== null && Math.abs(diferenca) >= 0.005
      ? criarElemento('span', { classe: diferenca > 0 ? 'badge-alerta' : 'badge-bom' }, formatarDiferenca(diferenca))
      : null,
    item.categoria ? criarElemento('span', { classe: 'badge-neutro', texto: item.categoria }) : null,
  ];
}

function criarColunaPreco(item) {
  const semPreco = item.preco === null && !estaNoCarrinho(item);
  const noCarrinho = estaNoCarrinho(item);
  return criarElemento(
    'div',
    { classe: 'shrink-0 text-right' },
    criarElemento('p', {
      classe: semPreco ? 'text-label-md text-secondary' : 'text-headline-sm tabular-nums',
      texto: semPreco ? 'Preço a definir' : formatarPreco(calcularSubtotalExibido(item)),
    }),
    noCarrinho
      ? criarElemento('p', {
          classe: 'text-body-sm text-on-surface-variant',
          texto: `${formatarQuantidade(item.compra.quantidade)} × ${formatarPreco(item.compra.preco)}`,
        })
      : null,
  );
}

/** Linha do modo "planejando": toque no nome para editar; stepper e lixeira embaixo. */
export function criarLinhaPlanejamento(item, { custoBeneficio, acoes }) {
  const stepper = criarStepper({ valor: item.quantidade, compacto: true, aoMudar: (quantidade) => acoes.alterarQuantidade(item.id, quantidade) });

  return criarElemento(
    'li',
    { classe: 'card space-y-2 p-3 pl-4' },
    criarElemento(
      'div',
      { classe: 'flex items-start gap-3' },
      criarElemento(
        'button',
        {
          classe: 'min-w-0 flex-1 cursor-pointer space-y-1 text-left',
          atributos: { type: 'button', 'aria-label': `Editar ${item.nome}` },
          aoClicar: () => acoes.editar(item.id),
        },
        criarElemento('p', { classe: 'truncate text-body-lg', texto: formatarTituloItem(item) }),
        criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: criarDetalhe(item) }),
        criarElemento('div', { classe: 'flex flex-wrap gap-1' }, ...criarSelos(item, custoBeneficio)),
      ),
      criarColunaPreco(item),
    ),
    criarElemento(
      'div',
      { classe: 'flex items-center justify-between border-t border-outline-variant pt-2' },
      stepper.elemento,
      criarElemento(
        'button',
        {
          classe: 'btn btn-ghost size-12 min-h-0 p-0 text-error',
          atributos: { type: 'button', 'aria-label': `Remover ${item.nome}` },
          aoClicar: () => acoes.remover(item.id),
        },
        icone('delete'),
      ),
    ),
  );
}

/**
 * Linha do "modo mercado": o preço fica na própria linha.
 * - Com estimativa: "Peguei" confirma com 1 toque (ou ajuste o valor antes).
 * - Sem preço: digite o valor e confirme (OK / Enter / sair do campo).
 * - No carrinho: altere preço e quantidade direto, sem abrir nada.
 */
export function criarLinhaMercado(item, { custoBeneficio, acoes }) {
  const noCarrinho = estaNoCarrinho(item);
  const semPreco = !noCarrinho && item.preco === null;
  const quantidade = noCarrinho ? item.compra.quantidade : item.quantidade;
  const precoAtual = noCarrinho ? item.compra.preco : item.preco;

  const campoPreco = criarElemento('input', {
    classe: 'min-h-12 w-full rounded-xl border border-outline-variant bg-surface-container-lowest pr-2 pl-8 text-right text-body-lg font-bold tabular-nums focus:border-primary focus:outline-2 focus:outline-primary',
    atributos: {
      type: 'text',
      inputmode: 'decimal',
      enterkeyhint: 'done',
      placeholder: '0,00',
      value: formatarCampoPreco(precoAtual),
      'aria-label': `Preço de ${item.nome}`,
      'data-preco-id': item.id,
    },
  });

  const confirmar = () => {
    const valor = lerNumero(campoPreco.value);
    if (valor === null || valor <= 0) {
      campoPreco.focus();
      return;
    }
    acoes.pegar(item.id, valor);
  };

  campoPreco.addEventListener('focus', () => campoPreco.select());
  campoPreco.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault();
      noCarrinho ? campoPreco.blur() : confirmar();
    }
  });
  campoPreco.addEventListener('change', () => {
    const valor = lerNumero(campoPreco.value);
    if (noCarrinho) {
      valor !== null && valor > 0 ? acoes.alterarPrecoCompra(item.id, valor) : (campoPreco.value = formatarCampoPreco(precoAtual));
    } else if (semPreco && valor !== null && valor > 0) {
      confirmar();
    }
  });

  const stepper = criarStepper({ valor: quantidade, compacto: true, aoMudar: (nova) => acoes.alterarQuantidade(item.id, nova) });

  const marcador = criarElemento(
    'button',
    {
      classe: 'grid size-12 shrink-0 cursor-pointer place-items-center',
      atributos: { type: 'button', 'aria-pressed': String(noCarrinho), 'aria-label': noCarrinho ? `Tirar ${item.nome} do carrinho` : `Pôr ${item.nome} no carrinho` },
      aoClicar: () => acoes.alternarCarrinho(item.id),
    },
    criarElemento(
      'span',
      { classe: `grid size-8 place-items-center rounded-full border-2 transition ${noCarrinho ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant'}` },
      noCarrinho ? icone('check', 'text-xl') : null,
    ),
  );

  const borda = noCarrinho ? '' : semPreco ? 'border-secondary' : 'border-primary/40';
  const previsto = item.preco !== null && noCarrinho ? criarElemento('span', { classe: 'text-body-sm text-on-surface-variant', texto: `Previsto: ${formatarPreco(item.preco)}` }) : null;

  return criarElemento(
    'li',
    { classe: `card space-y-2 p-2 pr-3 transition ${borda} ${noCarrinho ? 'opacity-80' : ''}` },
    criarElemento(
      'div',
      { classe: 'flex items-center gap-1' },
      marcador,
      criarElemento(
        'button',
        {
          classe: 'min-w-0 flex-1 cursor-pointer space-y-1 text-left',
          atributos: { type: 'button', 'aria-label': `Editar ${item.nome}` },
          aoClicar: () => acoes.editar(item.id),
        },
        criarElemento('p', { classe: `truncate text-body-lg ${noCarrinho ? 'text-outline line-through' : ''}`, texto: formatarTituloItem(item) }),
        criarElemento('div', { classe: 'flex flex-wrap items-center gap-1' }, ...criarSelos(item, custoBeneficio), previsto),
        criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: criarDetalhe(item) }),
      ),
      criarColunaPreco(item),
    ),
    criarElemento(
      'div',
      { classe: 'flex items-center justify-end gap-1.5 border-t border-outline-variant pt-2' },
      stepper.elemento,
      criarElemento(
        'div',
        { classe: 'relative min-w-0 max-w-32 flex-1' },
        criarElemento('span', { classe: 'pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-label-md text-outline', texto: 'R$' }),
        campoPreco,
      ),
      noCarrinho
        ? null
        : criarElemento(
            'button',
            {
              classe: 'btn btn-primary shrink-0 px-3',
              atributos: { type: 'button' },
              aoClicar: () => (semPreco ? confirmar() : acoes.pegar(item.id, lerNumero(campoPreco.value) ?? item.preco)),
            },
            icone('check'),
            semPreco ? 'OK' : 'Peguei',
          ),
    ),
  );
}
