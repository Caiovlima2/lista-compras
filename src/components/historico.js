import { criarElemento } from '../utils/dom.js';
import { formatarData, formatarPreco, formatarQuantidade } from '../utils/formatadores.js';
import { criarLinhaItem } from './itemLinha.js';

export function renderHistorico(container, registros, { aoExcluir }) {
  if (registros.length === 0) {
    container.replaceChildren(
      criarElemento('p', {
        classe: 'text-body-secondary mb-0',
        texto: 'Nenhuma lista salva ainda.',
      }),
    );
    return;
  }

  const maisRecentesPrimeiro = [...registros].sort((a, b) => b.data.localeCompare(a.data));

  container.replaceChildren(
    ...maisRecentesPrimeiro.map((registro) => criarRegistro(registro, container.id, aoExcluir)),
  );
}

function criarRegistro(registro, idDoContainer, aoExcluir) {
  const idDoCorpo = `lista-salva-${registro.id}`;
  const resumo = [
    formatarData(registro.data),
    formatarQuantidade(registro.itens.length),
    formatarPreco(registro.total),
  ].join(' — ');

  const cabecalho = criarElemento(
    'h3',
    { classe: 'accordion-header' },
    criarElemento('button', {
      classe: 'accordion-button collapsed',
      texto: resumo,
      atributos: {
        type: 'button',
        'data-bs-toggle': 'collapse',
        'data-bs-target': `#${idDoCorpo}`,
        'aria-expanded': 'false',
        'aria-controls': idDoCorpo,
      },
    }),
  );

  const itens = criarElemento(
    'ul',
    { classe: 'list-group list-group-flush' },
    ...registro.itens.map((item) => criarLinhaItem(item)),
  );

  const botaoExcluir = criarElemento('button', {
    classe: 'btn btn-outline-danger btn-sm',
    texto: 'Excluir lista',
    atributos: { type: 'button' },
    aoClicar: () => aoExcluir(registro.id),
  });

  const corpo = criarElemento(
    'div',
    {
      classe: 'accordion-collapse collapse',
      atributos: { id: idDoCorpo, 'data-bs-parent': `#${idDoContainer}` },
    },
    criarElemento(
      'div',
      { classe: 'accordion-body p-0' },
      itens,
      criarElemento('div', { classe: 'p-3' }, botaoExcluir),
    ),
  );

  return criarElemento('div', { classe: 'accordion-item' }, cabecalho, corpo);
}