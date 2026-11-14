import { criarElemento, icone } from '../../utils/dom.js';
import { formatarDataEvento } from '../../utils/formatadores.js';
import { TIPOS_DE_EVENTO, obterTipoDeEvento, resumirEvento } from '../../domain/eventos/tipos.js';

function criarCartaoEvento(evento, receitas, aoAbrir) {
  const tipo = obterTipoDeEvento(evento.tipo);
  const { detalhe, selo } = resumirEvento(evento, receitas);

  return criarElemento(
    'li',
    {},
    criarElemento(
      'button',
      { classe: 'card flex w-full cursor-pointer items-center gap-3 p-4 text-left transition hover:border-primary', atributos: { type: 'button', 'aria-label': `Abrir ${evento.nome}` }, aoClicar: () => aoAbrir(evento.id) },
      criarElemento('span', { classe: 'grid size-12 shrink-0 place-items-center rounded-xl bg-primary-fixed text-on-primary-fixed' }, icone(tipo.icone)),
      criarElemento(
        'span',
        { classe: 'min-w-0 flex-1 space-y-1' },
        criarElemento('span', { classe: 'block truncate text-body-lg', texto: evento.nome }),
        criarElemento('span', { classe: 'block text-body-sm text-on-surface-variant', texto: [tipo.rotulo, evento.data ? formatarDataEvento(evento.data) : null, detalhe].filter(Boolean).join(' · ') }),
        selo ? criarElemento('span', { classe: selo.ok ? 'badge-bom' : 'badge-alerta' }, icone(selo.ok ? 'check_circle' : 'scale', 'text-sm'), selo.texto) : null,
      ),
      icone('chevron_right', 'text-outline'),
    ),
  );
}

const criarBotaoDeTipo = ({ tipo, rotulo, icone: nomeIcone, descricao }, aoCriar) =>
  criarElemento(
    'button',
    { classe: 'card flex w-full cursor-pointer items-center gap-3 p-4 text-left transition hover:border-primary', atributos: { type: 'button', 'aria-label': `Criar ${rotulo}` }, aoClicar: () => aoCriar(tipo) },
    criarElemento('span', { classe: 'grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-on-primary' }, icone(nomeIcone)),
    criarElemento('span', { classe: 'min-w-0 flex-1' }, criarElemento('span', { classe: 'block text-body-lg', texto: rotulo }), criarElemento('span', { classe: 'block text-body-sm text-on-surface-variant', texto: descricao })),
    icone('add', 'text-primary'),
  );

/** Tela inicial da aba: criar um evento de cada tipo e a lista de eventos salvos. */
export function renderizarListaEventos(container, { eventos, receitas, aoCriar, aoAbrir }) {
  container.replaceChildren(
    criarElemento(
      'div',
      { classe: 'space-y-6' },
      criarElemento(
        'section',
        { classe: 'space-y-3' },
        criarElemento('h2', { classe: 'text-headline-md', texto: 'Novo evento' }),
        criarElemento('div', { classe: 'grid gap-3 sm:grid-cols-2' }, ...TIPOS_DE_EVENTO.map((tipo) => criarBotaoDeTipo(tipo, aoCriar))),
      ),
      criarElemento(
        'section',
        { classe: 'space-y-3' },
        criarElemento('h2', { classe: 'text-headline-md', texto: 'Seus eventos' }),
        eventos.length === 0
          ? criarElemento(
              'div',
              { classe: 'card space-y-2 p-8 text-center' },
              icone('celebration', 'text-5xl text-primary'),
              criarElemento('p', { classe: 'text-body-lg', texto: 'Nenhum evento planejado ainda.' }),
              criarElemento('p', { classe: 'text-body-md text-on-surface-variant', texto: 'Crie um churrasco ou monte as marmitas da semana: o app calcula e manda o que falta para a sua lista de compras.' }),
            )
          : criarElemento('ul', { classe: 'space-y-3' }, ...eventos.map((evento) => criarCartaoEvento(evento, receitas, aoAbrir))),
      ),
    ),
  );
}
