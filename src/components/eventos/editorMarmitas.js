import { criarElemento, icone, sincronizarFilhos } from '../../utils/dom.js';
import { formatarMedida } from '../../utils/formatadores.js';
import { porcoesDaEntrada } from '../../domain/marmitas/marmitas.js';
import { criarMarcador } from '../marcador.js';
import { criarStepper } from '../stepper.js';

/** Não sobrescreve um campo enquanto a pessoa está digitando nele. */
function definirValor(campo, valor) {
  if (document.activeElement !== campo && campo.value !== valor) campo.value = valor;
}

const rotuloCampo = (texto, para) => criarElemento('label', { classe: 'rotulo', texto, atributos: { for: para } });
const plural = (quantidade, singular, pluralTexto) => `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`;

/**
 * Editor das marmitas da semana. As linhas de receitas e ingredientes são guardadas por chave
 * e reaproveitadas, então campos e botões mantêm o foco enquanto os valores mudam.
 */
export function criarEditorMarmitas({ acoes }) {
  /* ---------- Cabeçalho, nome e data ---------- */
  const cabecalho = criarElemento(
    'div',
    { classe: 'flex items-center justify-between gap-2' },
    criarElemento(
      'div',
      { classe: 'flex items-center gap-1' },
      criarElemento('button', { classe: 'btn btn-ghost size-12 min-h-0 p-0', atributos: { type: 'button', 'aria-label': 'Voltar para eventos' }, aoClicar: acoes.voltar }, icone('arrow_back')),
      criarElemento('h2', { classe: 'text-headline-md', texto: 'Marmitas da semana' }),
    ),
    criarElemento('button', { classe: 'btn btn-ghost size-12 min-h-0 p-0 text-error', atributos: { type: 'button', 'aria-label': 'Excluir evento' }, aoClicar: acoes.excluir }, icone('delete')),
  );

  const campoNome = criarElemento('input', { classe: 'campo', atributos: { id: 'evento-nome', type: 'text', enterkeyhint: 'done' } });
  const campoData = criarElemento('input', { classe: 'campo', atributos: { id: 'evento-data', type: 'date' } });
  campoNome.addEventListener('input', () => acoes.renomear(campoNome.value));
  campoData.addEventListener('input', () => acoes.alterarData(campoData.value));

  const blocoDados = criarElemento(
    'section',
    { classe: 'card grid gap-3 p-4 sm:grid-cols-2' },
    criarElemento('div', {}, rotuloCampo('Nome do evento', 'evento-nome'), campoNome),
    criarElemento('div', {}, rotuloCampo('Data (opcional)', 'evento-data'), campoData),
  );

  /* ---------- Quantas marmitas ---------- */
  const stepperMarmitas = criarStepper({ valor: 1, minimo: 1, rotulo: 'Marmitas', aoMudar: acoes.alterarMarmitas });
  const blocoMarmitas = criarElemento(
    'section',
    { classe: 'card flex items-center justify-between gap-3 p-4' },
    criarElemento('div', {}, criarElemento('h3', { classe: 'text-headline-sm', texto: 'Quantas marmitas?' }), criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: 'Cada marmita leva uma porção de cada receita escolhida.' })),
    stepperMarmitas.elemento,
  );

  /* ---------- Receitas da semana ---------- */
  const linhasReceitas = new Map();
  const listaReceitas = criarElemento('ul', { classe: 'space-y-3' });
  const contadorReceitas = criarElemento('span', { classe: 'text-body-sm text-on-surface-variant' });
  const semReceitas = criarElemento(
    'div',
    { classe: 'card space-y-3 p-6 text-center' },
    icone('menu_book', 'text-4xl text-primary'),
    criarElemento('p', { classe: 'text-body-md text-on-surface-variant', texto: 'Você ainda não tem receitas salvas. Cadastre as receitas que entram nas suas marmitas.' }),
    criarElemento('button', { classe: 'btn btn-tonal', atributos: { type: 'button' }, aoClicar: acoes.criarReceita }, icone('add_circle'), 'Criar receita'),
  );

  function obterLinhaReceita(receita) {
    const existente = linhasReceitas.get(receita.id);
    if (existente) return existente;

    const marcador = criarMarcador({ titulo: receita.nome, subtitulo: '', aoAlternar: () => acoes.alternarReceita(receita.id) });
    const stepper = criarStepper({ valor: 1, minimo: 1, compacto: true, rotulo: `Porções de ${receita.nome}`, aoMudar: (porcoes) => acoes.definirPorcoes(receita.id, porcoes) });
    const nota = criarElemento('span', { classe: 'text-body-sm text-on-surface-variant' });
    const corpo = criarElemento('div', { classe: 'flex flex-wrap items-center gap-2 border-t border-outline-variant px-4 py-3' }, stepper.elemento, criarElemento('span', { classe: 'text-label-lg text-on-surface-variant', texto: 'porções' }), nota);
    const no = criarElemento('li', { classe: 'card overflow-hidden' }, marcador.rotulo, corpo);
    const linha = { no, marcador, stepper, nota, corpo };
    linhasReceitas.set(receita.id, linha);
    return linha;
  }

  /* ---------- Ingredientes da semana ---------- */
  const linhasIngredientes = new Map();
  const listaIngredientes = criarElemento('ul', { classe: 'space-y-3' });
  const resumoIngredientes = criarElemento('span', { classe: 'text-body-sm text-on-surface-variant' });
  const semIngredientes = criarElemento('p', { classe: 'card p-4 text-body-md text-on-surface-variant', texto: 'Escolha receitas acima para ver os ingredientes consolidados.' });

  function obterLinhaIngrediente(ingrediente) {
    const existente = linhasIngredientes.get(ingrediente.chave);
    if (existente) return existente;

    const quantidade = criarElemento('p', { classe: 'text-body-sm text-on-surface-variant' });
    const nome = criarElemento('p', { classe: 'truncate text-body-lg' });
    const fontes = criarElemento('p', { classe: 'truncate text-body-sm text-outline' });
    const stepper = criarStepper({ valor: 0, minimo: 0, passo: ingrediente.passo, compacto: true, rotulo: ingrediente.nome, aoMudar: (valor) => acoes.ajustarQuantidade(ingrediente.chave, valor) });
    const botaoCasa = criarElemento('button', { atributos: { type: 'button' }, aoClicar: () => acoes.alternarEmCasa(ingrediente.chave) });
    const no = criarElemento(
      'li',
      { classe: 'card space-y-2 p-3' },
      criarElemento('div', { classe: 'min-w-0' }, nome, fontes),
      criarElemento('div', { classe: 'flex flex-wrap items-center gap-2' }, stepper.elemento, criarElemento('span', { classe: 'text-label-lg text-on-surface-variant', texto: ingrediente.unidade }), botaoCasa),
      quantidade,
    );
    const linha = { no, nome, fontes, stepper, botaoCasa, quantidade };
    linhasIngredientes.set(ingrediente.chave, linha);
    return linha;
  }

  const elemento = criarElemento(
    'div',
    { classe: 'space-y-6' },
    cabecalho,
    blocoDados,
    blocoMarmitas,
    criarElemento('section', { classe: 'space-y-3' }, criarElemento('div', { classe: 'flex items-baseline justify-between' }, criarElemento('h3', { classe: 'text-headline-sm', texto: 'Receitas da semana' }), contadorReceitas), listaReceitas, semReceitas),
    criarElemento('section', { classe: 'space-y-3' }, criarElemento('div', { classe: 'flex items-baseline justify-between' }, criarElemento('h3', { classe: 'text-headline-sm', texto: 'Ingredientes da semana' }), resumoIngredientes), listaIngredientes, semIngredientes),
  );

  return {
    elemento,

    atualizar({ plano, receitas, ingredientes }) {
      definirValor(campoNome, plano.nome);
      definirValor(campoData, plano.data);
      stepperMarmitas.definir(plano.marmitas);

      semReceitas.classList.toggle('hidden', receitas.length > 0);
      sincronizarFilhos(
        listaReceitas,
        receitas.map((receita) => {
          const linha = obterLinhaReceita(receita);
          const entrada = plano.receitas.find((atual) => atual.receitaId === receita.id);
          linha.marcador.tituloEl.textContent = receita.nome;
          linha.marcador.subtituloEl.textContent = `${receita.porcoes} ${receita.porcoes === 1 ? 'porção' : 'porções'} · ${plural(receita.ingredientes.length, 'ingrediente', 'ingredientes')}`;
          linha.marcador.caixa.checked = Boolean(entrada);
          linha.corpo.classList.toggle('hidden', !entrada);
          if (entrada) {
            const porcoes = porcoesDaEntrada(plano, entrada);
            linha.stepper.definir(porcoes);
            linha.nota.textContent = entrada.porcoes === null ? '(igual ao nº de marmitas)' : `(ajustado; marmitas: ${plano.marmitas})`;
          }
          return linha.no;
        }),
      );
      contadorReceitas.textContent = receitas.length > 0 ? `${plano.receitas.filter((entrada) => receitas.some((receita) => receita.id === entrada.receitaId)).length} de ${receitas.length} escolhidas` : '';

      semIngredientes.classList.toggle('hidden', ingredientes.length > 0);
      sincronizarFilhos(
        listaIngredientes,
        ingredientes.map((ingrediente) => {
          const linha = obterLinhaIngrediente(ingrediente);
          linha.nome.textContent = ingrediente.nome;
          linha.fontes.textContent = ingrediente.fontes.join(', ');
          linha.stepper.definir(ingrediente.quantidade);
          linha.no.classList.toggle('opacity-60', ingrediente.emCasa);
          linha.quantidade.textContent = ingrediente.emCasa ? `Em casa · ${formatarMedida(ingrediente.quantidade, ingrediente.unidade)}` : `A comprar · ${formatarMedida(ingrediente.quantidade, ingrediente.unidade)}`;
          linha.botaoCasa.className = `btn min-h-10 px-3 ${ingrediente.emCasa ? 'btn-primary' : 'btn-tonal'}`;
          linha.botaoCasa.setAttribute('aria-pressed', String(ingrediente.emCasa));
          linha.botaoCasa.replaceChildren(icone(ingrediente.emCasa ? 'check_circle' : 'inventory_2'), 'Já tenho');
          return linha.no;
        }),
      );
      const emCasa = ingredientes.filter((ingrediente) => ingrediente.emCasa).length;
      resumoIngredientes.textContent = ingredientes.length > 0 ? `${ingredientes.length - emCasa} a comprar · ${emCasa} em casa` : '';
    },
  };
}
