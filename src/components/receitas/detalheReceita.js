import { criarElemento, icone } from '../../utils/dom.js';
import { formatarMedida } from '../../utils/formatadores.js';
import { escalarIngredientes } from '../../domain/receitas/receita.js';
import { criarStepper } from '../stepper.js';

/**
 * Tela de uma receita: escolha as porções, marque o que já tem em casa e envie para a lista.
 * As linhas são montadas uma vez; `atualizar` só troca quantidades e estados.
 */
export function criarDetalheReceita({ receita, acoes }) {
  const cabecalho = criarElemento(
    'div',
    { classe: 'flex items-center justify-between gap-2' },
    criarElemento(
      'div',
      { classe: 'flex min-w-0 items-center gap-1' },
      criarElemento('button', { classe: 'btn btn-ghost size-12 min-h-0 shrink-0 p-0', atributos: { type: 'button', 'aria-label': 'Voltar para receitas' }, aoClicar: acoes.voltar }, icone('arrow_back')),
      criarElemento('h2', { classe: 'truncate text-headline-md', texto: receita.nome }),
    ),
    criarElemento(
      'div',
      { classe: 'flex shrink-0' },
      criarElemento('button', { classe: 'btn btn-ghost size-12 min-h-0 p-0', atributos: { type: 'button', 'aria-label': 'Editar receita' }, aoClicar: acoes.editar }, icone('edit')),
      criarElemento('button', { classe: 'btn btn-ghost size-12 min-h-0 p-0', atributos: { type: 'button', 'aria-label': 'Duplicar receita' }, aoClicar: acoes.duplicar }, icone('content_copy')),
      criarElemento('button', { classe: 'btn btn-ghost size-12 min-h-0 p-0 text-error', atributos: { type: 'button', 'aria-label': 'Excluir receita' }, aoClicar: acoes.excluir }, icone('delete')),
    ),
  );

  const stepper = criarStepper({ valor: receita.porcoes, minimo: 1, rotulo: 'Porções', aoMudar: acoes.alterarPorcoes });
  const aviso = criarElemento('p', { classe: 'text-body-sm text-on-surface-variant' });

  const blocoPorcoes = criarElemento(
    'section',
    { classe: 'card space-y-2 p-4' },
    criarElemento('div', { classe: 'flex items-center justify-between gap-3' }, criarElemento('span', { classe: 'flex items-center gap-2 text-label-lg' }, icone('groups', 'text-primary'), 'Porções a preparar'), stepper.elemento),
    aviso,
  );

  const blocoAnotacoes = receita.anotacoes
    ? criarElemento('section', { classe: 'card space-y-1 p-4' }, criarElemento('h3', { classe: 'text-label-lg', texto: 'Anotações' }), criarElemento('p', { classe: 'whitespace-pre-line text-body-md text-on-surface-variant', texto: receita.anotacoes }))
    : null;

  const resumo = criarElemento('p', { classe: 'text-body-sm text-on-surface-variant' });
  const linhas = new Map();
  receita.ingredientes.forEach(({ id, nome }) => {
    const quantidade = criarElemento('p', { classe: 'text-body-sm text-on-surface-variant' });
    const botao = criarElemento('button', { atributos: { type: 'button' }, aoClicar: () => acoes.alternarEmCasa(id) });
    const linha = criarElemento(
      'li',
      { classe: 'card flex items-center justify-between gap-3 p-3' },
      criarElemento('div', { classe: 'min-w-0' }, criarElemento('p', { classe: 'truncate text-body-lg', texto: nome }), quantidade),
      botao,
    );
    linhas.set(id, { linha, quantidade, botao });
  });

  const blocoIngredientes = criarElemento(
    'section',
    { classe: 'space-y-3' },
    criarElemento('div', { classe: 'flex items-baseline justify-between' }, criarElemento('h3', { classe: 'text-headline-sm', texto: 'Ingredientes' }), resumo),
    criarElemento('ul', { classe: 'space-y-2' }, ...[...linhas.values()].map(({ linha }) => linha)),
  );

  const elemento = criarElemento('div', { classe: 'space-y-6' }, cabecalho, blocoPorcoes, blocoAnotacoes, blocoIngredientes);

  return {
    elemento,

    /** Devolve os ingredientes já escalados (a tela e o botão "Adicionar" usam os mesmos números). */
    atualizar({ porcoes, emCasa }) {
      const escalados = escalarIngredientes(receita, porcoes);
      stepper.definir(porcoes);
      aviso.textContent = porcoes === receita.porcoes ? `Quantidades da receita original (${receita.porcoes} ${receita.porcoes === 1 ? 'porção' : 'porções'})` : `Quantidades ajustadas para ${porcoes} ${porcoes === 1 ? 'porção' : 'porções'} (receita: ${receita.porcoes})`;

      escalados.forEach(({ id, quantidade, unidade }) => {
        const { linha, quantidade: texto, botao } = linhas.get(id);
        const tenho = Boolean(emCasa[id]);
        texto.textContent = formatarMedida(quantidade, unidade);
        linha.classList.toggle('opacity-60', tenho);
        botao.className = `btn min-h-10 shrink-0 px-3 ${tenho ? 'btn-primary' : 'btn-tonal'}`;
        botao.setAttribute('aria-pressed', String(tenho));
        botao.replaceChildren(icone(tenho ? 'check_circle' : 'inventory_2'), 'Já tenho');
      });

      const emCasaTotal = escalados.filter(({ id }) => emCasa[id]).length;
      resumo.textContent = `${escalados.length - emCasaTotal} a comprar · ${emCasaTotal} em casa`;
      return escalados;
    },
  };
}
