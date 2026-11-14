import { criarElemento } from '../utils/dom.js';
import { FILTROS } from '../domain/lista.js';

const ROTULOS = [
  { filtro: FILTROS.TODOS, rotulo: 'Todos' },
  { filtro: FILTROS.A_COMPRAR, rotulo: 'A comprar' },
  { filtro: FILTROS.EM_CASA, rotulo: 'Já tenho' },
];

/** Chips "Todos / A comprar / Já tenho" com a quantidade de cada um. */
export function renderizarFiltroLista(container, { visivel, filtro, contagens, aoEscolher }) {
  container.classList.toggle('hidden', !visivel);

  const chave = JSON.stringify([filtro, contagens]);
  if (container.dataset.chave === chave) return;
  container.dataset.chave = chave;

  container.replaceChildren(
    ...ROTULOS.map(({ filtro: valor, rotulo }) => {
      const ativo = valor === filtro;
      return criarElemento('button', {
        classe: `chip ${ativo ? 'border-primary bg-primary text-on-primary hover:text-on-primary' : ''}`.trim(),
        texto: `${rotulo} · ${contagens[valor]}`,
        atributos: { type: 'button', 'aria-pressed': String(ativo) },
        aoClicar: () => aoEscolher(valor),
      });
    }),
  );
}
