import { criarElemento, icone } from '../utils/dom.js';
import { formatarDiaSemana, formatarPreco } from '../utils/formatadores.js';

const cartaoAcao = ({ icone: nomeIcone, titulo, descricao, classe, aoClicar }) =>
  criarElemento(
    'button',
    { classe: `flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-lg p-4 text-left shadow-sm transition active:scale-[0.99] ${classe}`, atributos: { type: 'button' }, aoClicar },
    icone(nomeIcone, 'text-3xl'),
    criarElemento(
      'span',
      { classe: 'min-w-0 flex-1' },
      criarElemento('span', { classe: 'block text-headline-sm', texto: titulo }),
      criarElemento('span', { classe: 'block text-body-md opacity-90', texto: descricao }),
    ),
    icone('arrow_forward'),
  );

/** Tela inicial quando não há nenhum item: duas formas de começar. */
export function renderizarHeroVazio(container, { visivel, ultimoRegistro, aoComecarNoMercado, aoPlanejar, aoUsarUltima }) {
  container.classList.toggle('hidden', !visivel);
  if (!visivel) return;

  container.replaceChildren(
    criarElemento(
      'div',
      { classe: 'card space-y-4 p-6 text-center' },
      criarElemento('div', { classe: 'mx-auto grid size-16 place-items-center rounded-full bg-primary-fixed text-on-primary-fixed' }, icone('shopping_basket', 'text-4xl')),
      criarElemento('h2', { classe: 'text-headline-lg', texto: 'Sua lista está limpa' }),
      criarElemento('p', { classe: 'text-body-lg text-on-surface-variant', texto: 'Escolha como quer organizar suas compras hoje.' }),
      ultimoRegistro
        ? criarElemento(
            'button',
            { classe: 'btn btn-tonal w-full justify-between', atributos: { type: 'button' }, aoClicar: aoUsarUltima },
            criarElemento('span', { classe: 'flex items-center gap-2' }, icone('history'), 'Usar lista da última compra'),
            criarElemento('span', { classe: 'badge-neutro', texto: `${formatarDiaSemana(ultimoRegistro.data)} · ${formatarPreco(ultimoRegistro.total)}` }),
          )
        : null,
    ),
    criarElemento(
      'div',
      { classe: 'mt-3 space-y-3' },
      cartaoAcao({
        icone: 'storefront',
        titulo: 'Começar direto no mercado',
        descricao: 'Vá anotando conforme pega os itens.',
        classe: 'bg-primary text-on-primary',
        aoClicar: aoComecarNoMercado,
      }),
      cartaoAcao({
        icone: 'edit_note',
        titulo: 'Planejar lista com calma',
        descricao: 'Cheque os armários e anote o que falta.',
        classe: 'card text-on-surface',
        aoClicar: aoPlanejar,
      }),
    ),
  );
}
