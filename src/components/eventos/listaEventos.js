import { criarElemento, icone } from '../../utils/dom.js';
import { formatarDataEvento, formatarMedida } from '../../utils/formatadores.js';
import { calcularEvento } from '../../domain/eventos/calculadora.js';
import { obterDefinicao } from '../../domain/eventos/evento.js';

const textoConvidados = (convidados) => {
  const total = Object.values(convidados).reduce((soma, quantidade) => soma + quantidade, 0);
  return `${total} ${total === 1 ? 'pessoa' : 'pessoas'}`;
};

function textoCarne({ meta, faltam }) {
  if (meta === 0) return 'Defina os convidados';
  return faltam === 0 ? 'Carne completa' : `Faltam ${formatarMedida(faltam, 'g')} de carne`;
}

function criarCartaoEvento(evento, { aoAbrir }) {
  const definicao = obterDefinicao(evento.tipo);
  const { carne } = calcularEvento(evento, definicao);
  const completa = carne.meta > 0 && carne.faltam === 0;

  return criarElemento(
    'li',
    {},
    criarElemento(
      'button',
      { classe: 'card flex w-full cursor-pointer items-center gap-3 p-4 text-left transition hover:border-primary', atributos: { type: 'button', 'aria-label': `Abrir ${evento.nome}` }, aoClicar: () => aoAbrir(evento.id) },
      criarElemento('span', { classe: 'grid size-12 shrink-0 place-items-center rounded-xl bg-primary-fixed text-on-primary-fixed' }, icone(definicao.icone)),
      criarElemento(
        'span',
        { classe: 'min-w-0 flex-1 space-y-1' },
        criarElemento('span', { classe: 'block truncate text-body-lg', texto: evento.nome }),
        criarElemento(
          'span',
          { classe: 'block text-body-sm text-on-surface-variant', texto: [definicao.rotulo, evento.data ? formatarDataEvento(evento.data) : null, textoConvidados(evento.convidados)].filter(Boolean).join(' · ') },
        ),
        criarElemento('span', { classe: completa ? 'badge-bom' : 'badge-alerta' }, icone(completa ? 'check_circle' : 'scale', 'text-sm'), textoCarne(carne)),
      ),
      icone('chevron_right', 'text-outline'),
    ),
  );
}

/** Tela inicial da aba: botão de novo evento e a lista de eventos salvos. */
export function renderizarListaEventos(container, { eventos, aoCriar, aoAbrir }) {
  const definicao = obterDefinicao('churrasco');

  container.replaceChildren(
    criarElemento(
      'div',
      { classe: 'space-y-4' },
      criarElemento(
        'div',
        { classe: 'flex items-center justify-between gap-3' },
        criarElemento('h2', { classe: 'text-headline-md', texto: 'Eventos' }),
        criarElemento('button', { classe: 'btn btn-primary min-h-10 px-4', atributos: { type: 'button' }, aoClicar: () => aoCriar(definicao.tipo) }, icone('add'), `Novo ${definicao.rotulo.toLowerCase()}`),
      ),
      eventos.length === 0
        ? criarElemento(
            'div',
            { classe: 'card space-y-2 p-8 text-center' },
            icone('celebration', 'text-5xl text-primary'),
            criarElemento('p', { classe: 'text-body-lg', texto: 'Nenhum evento planejado ainda.' }),
            criarElemento('p', { classe: 'text-body-md text-on-surface-variant', texto: 'Crie um churrasco: o app calcula a carne e os acompanhamentos e manda o que falta para a sua lista de compras.' }),
          )
        : criarElemento('ul', { classe: 'space-y-3' }, ...eventos.map((evento) => criarCartaoEvento(evento, { aoAbrir }))),
    ),
  );
}
