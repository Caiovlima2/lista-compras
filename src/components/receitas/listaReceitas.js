import { criarElemento, icone } from '../../utils/dom.js';
import { normalizarTexto } from '../../utils/texto.js';

const resumoIngredientes = (ingredientes) => {
  const nomes = ingredientes.slice(0, 4).map((ingrediente) => ingrediente.nome);
  return nomes.join(', ') + (ingredientes.length > 4 ? '…' : '');
};

function criarCartao(receita, aoAbrir) {
  const { ingredientes, porcoes } = receita;
  return criarElemento(
    'li',
    {},
    criarElemento(
      'button',
      { classe: 'card flex w-full cursor-pointer items-center gap-3 p-4 text-left transition hover:border-primary', atributos: { type: 'button', 'aria-label': `Abrir ${receita.nome}` }, aoClicar: () => aoAbrir(receita.id) },
      criarElemento('span', { classe: 'grid size-12 shrink-0 place-items-center rounded-xl bg-primary-fixed text-on-primary-fixed' }, icone('menu_book')),
      criarElemento(
        'span',
        { classe: 'min-w-0 flex-1 space-y-1' },
        criarElemento('span', { classe: 'block truncate text-body-lg', texto: receita.nome }),
        criarElemento('span', { classe: 'block text-body-sm text-on-surface-variant', texto: `${porcoes} ${porcoes === 1 ? 'porção' : 'porções'} · ${ingredientes.length} ${ingredientes.length === 1 ? 'ingrediente' : 'ingredientes'}` }),
        criarElemento('span', { classe: 'block truncate text-body-sm text-outline', texto: resumoIngredientes(ingredientes) }),
      ),
      icone('chevron_right', 'text-outline'),
    ),
  );
}

/**
 * Tela inicial da aba Receitas: busca, botão de nova receita e a lista.
 * A estrutura é montada uma vez, para a busca manter o foco enquanto se digita.
 */
export function criarListaReceitas({ aoCriar, aoAbrir }) {
  let receitas = [];

  const campoBusca = criarElemento('input', { classe: 'campo', atributos: { type: 'search', placeholder: 'Buscar receita ou ingrediente...', 'aria-label': 'Buscar receita', enterkeyhint: 'search' } });
  const lista = criarElemento('ul', { classe: 'space-y-3' });
  const vazio = criarElemento('div', { classe: 'card space-y-2 p-8 text-center' });
  const contador = criarElemento('span', { classe: 'text-body-sm text-on-surface-variant' });

  function desenhar() {
    const busca = normalizarTexto(campoBusca.value);
    const visiveis = busca
      ? receitas.filter((receita) => [receita.nome, ...receita.ingredientes.map((ingrediente) => ingrediente.nome)].some((texto) => normalizarTexto(texto).includes(busca)))
      : receitas;

    contador.textContent = receitas.length > 0 ? `${receitas.length} ${receitas.length === 1 ? 'salva' : 'salvas'}` : '';
    campoBusca.classList.toggle('hidden', receitas.length === 0);
    lista.replaceChildren(...visiveis.map((receita) => criarCartao(receita, aoAbrir)));

    vazio.classList.toggle('hidden', visiveis.length > 0);
    vazio.replaceChildren(
      icone(receitas.length === 0 ? 'menu_book' : 'search_off', 'text-5xl text-primary'),
      criarElemento('p', { classe: 'text-body-lg', texto: receitas.length === 0 ? 'Você ainda não tem receitas.' : 'Nenhuma receita encontrada.' }),
      criarElemento('p', {
        classe: 'text-body-md text-on-surface-variant',
        texto: receitas.length === 0 ? 'Guarde seus pratos e transforme os ingredientes em lista de compras com um toque.' : 'Tente buscar por outro nome.',
      }),
    );
  }

  campoBusca.addEventListener('input', desenhar);

  const elemento = criarElemento(
    'div',
    { classe: 'space-y-4' },
    criarElemento(
      'div',
      { classe: 'flex items-center justify-between gap-3' },
      criarElemento('div', {}, criarElemento('h2', { classe: 'text-headline-md', texto: 'Receitas' }), contador),
      criarElemento('button', { classe: 'btn btn-primary min-h-10 px-4', atributos: { type: 'button' }, aoClicar: aoCriar }, icone('add'), 'Nova receita'),
    ),
    campoBusca,
    lista,
    vazio,
  );

  return {
    elemento,
    atualizar(novas) {
      receitas = novas;
      desenhar();
    },
  };
}
