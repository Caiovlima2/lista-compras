import { criarElemento, icone } from '../../utils/dom.js';
import { formatarMedida } from '../../utils/formatadores.js';
import { lerNumero } from '../../utils/numero.js';
import { criarStepper } from '../stepper.js';

const CHIP_ATIVO = 'border-primary bg-primary text-on-primary';
const CHIP_INATIVO = 'border-outline-variant bg-surface-container-lowest text-on-surface';

/** Não sobrescreve um campo enquanto a pessoa está digitando nele. */
function definirValor(campo, valor) {
  if (document.activeElement !== campo && campo.value !== valor) campo.value = valor;
}

const rotuloCampo = (texto, para) => criarElemento('label', { classe: 'rotulo', texto, atributos: { for: para } });

const textoPublico = (convidados, duracao) => {
  const adultos = convidados.homens + convidados.mulheres;
  const partes = [`${adultos} ${adultos === 1 ? 'adulto' : 'adultos'}`];
  if (convidados.criancas > 0) partes.push(`${convidados.criancas} ${convidados.criancas === 1 ? 'criança' : 'crianças'}`);
  return `${partes.join(' e ')} · ${duracao.toLowerCase()}`;
};

/**
 * Editor de um evento. A estrutura é montada uma vez; `atualizar` só troca textos e valores,
 * assim os campos mantêm o foco e o teclado aberto enquanto se digita.
 */
export function criarEditorEvento({ definicao, acoes }) {
  /* ---------- Cabeçalho ---------- */
  const cabecalho = criarElemento(
    'div',
    { classe: 'flex items-center justify-between gap-2' },
    criarElemento(
      'div',
      { classe: 'flex items-center gap-1' },
      criarElemento('button', { classe: 'btn btn-ghost size-12 min-h-0 p-0', atributos: { type: 'button', 'aria-label': 'Voltar para eventos' }, aoClicar: acoes.voltar }, icone('arrow_back')),
      criarElemento('h2', { classe: 'text-headline-md', texto: definicao.rotulo }),
    ),
    criarElemento('button', { classe: 'btn btn-ghost size-12 min-h-0 p-0 text-error', atributos: { type: 'button', 'aria-label': 'Excluir evento' }, aoClicar: acoes.excluir }, icone('delete')),
  );

  /* ---------- Nome e data ---------- */
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

  /* ---------- Duração ---------- */
  const botoesDuracao = definicao.duracoes.map(({ valor, rotulo, icone: nomeIcone }) => {
    const botao = criarElemento(
      'button',
      { atributos: { type: 'button', role: 'radio' }, aoClicar: () => acoes.alterarDuracao(valor) },
      criarElemento('span', { classe: 'flex items-center gap-2 text-label-lg' }, icone(nomeIcone), rotulo),
      criarElemento('span', { classe: 'text-body-sm opacity-80', texto: `${definicao.carne.gramasPorPessoa[valor]} g de carne / pessoa` }),
    );
    return { valor, botao };
  });

  const blocoDuracao = criarElemento(
    'section',
    { classe: 'space-y-2' },
    criarElemento('h3', { classe: 'text-headline-sm', texto: 'Tipo de encontro' }),
    criarElemento('div', { classe: 'grid grid-cols-2 gap-3', atributos: { role: 'radiogroup', 'aria-label': 'Duração do evento' } }, ...botoesDuracao.map(({ botao }) => botao)),
  );

  /* ---------- Convidados ---------- */
  const total = criarElemento('span', { classe: 'badge-neutro' });
  const steppers = new Map();
  const linhasConvidados = definicao.convidados.map(({ id, rotulo, icone: nomeIcone, nota }) => {
    const stepper = criarStepper({ valor: 0, minimo: 0, rotulo, aoMudar: (quantidade) => acoes.alterarConvidado(id, quantidade) });
    steppers.set(id, stepper);
    return criarElemento(
      'div',
      { classe: 'flex items-center justify-between gap-3' },
      criarElemento(
        'div',
        { classe: 'flex items-center gap-3' },
        criarElemento('span', { classe: 'grid size-10 place-items-center rounded-full bg-surface-container text-on-surface-variant' }, icone(nomeIcone)),
        criarElemento('div', {}, criarElemento('p', { classe: 'text-body-lg', texto: rotulo }), criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: nota })),
      ),
      stepper.elemento,
    );
  });

  const blocoConvidados = criarElemento(
    'section',
    { classe: 'card space-y-3 p-4' },
    criarElemento('div', { classe: 'flex items-center justify-between' }, criarElemento('h3', { classe: 'text-headline-sm', texto: 'Quem vai comer?' }), total),
    ...linhasConvidados,
  );

  /* ---------- Carne ---------- */
  const metaTexto = criarElemento('p', { classe: 'text-price-hero tabular-nums' });
  const publicoTexto = criarElemento('p', { classe: 'text-body-md opacity-90' });
  const progresso = criarElemento('div', { classe: 'h-full rounded-full bg-primary transition-all' });
  const progressoTexto = criarElemento('p', { classe: 'text-body-sm text-on-surface-variant' });
  const situacao = criarElemento('div', { classe: 'flex' });

  const campoCorteFaltante = criarElemento('input', {
    classe: 'campo',
    atributos: { id: 'evento-corte-faltante', type: 'text', placeholder: 'Ex.: Fraldinha', enterkeyhint: 'done', list: 'cortes-sugeridos' },
  });
  campoCorteFaltante.addEventListener('input', () => acoes.alterarCorteFaltante(campoCorteFaltante.value));
  const blocoCorteFaltante = criarElemento('div', {}, rotuloCampo('Qual corte comprar para completar?', 'evento-corte-faltante'), campoCorteFaltante);

  const blocoCarne = criarElemento(
    'section',
    { classe: 'space-y-3 rounded-lg bg-primary-container p-5 text-on-primary-container' },
    criarElemento('p', { classe: 'text-label-md opacity-90', texto: 'CARNE RECOMENDADA' }),
    metaTexto,
    publicoTexto,
  );

  const cartaoCarne = criarElemento(
    'section',
    { classe: 'card space-y-3 p-4' },
    criarElemento('div', { classe: 'h-3 overflow-hidden rounded-full bg-surface-container-high', atributos: { role: 'presentation' } }, progresso),
    progressoTexto,
    situacao,
    blocoCorteFaltante,
  );

  /* ---------- Cortes que já tenho ---------- */
  const listaCortes = criarElemento('ul', { classe: 'space-y-2' });
  const cortesTotal = criarElemento('span', { classe: 'text-body-sm text-on-surface-variant' });

  const campoCorteNome = criarElemento('input', { classe: 'campo', atributos: { id: 'corte-nome', type: 'text', list: 'cortes-sugeridos', placeholder: 'Ex.: Picanha', required: true } });
  const campoCortePeso = criarElemento('input', { classe: 'campo', atributos: { id: 'corte-peso', inputmode: 'decimal', placeholder: 'Ex.: 1,2', required: true } });
  const campoCorteUnidade = criarElemento(
    'select',
    { classe: 'campo', atributos: { id: 'corte-unidade', 'aria-label': 'Unidade do corte' } },
    criarElemento('option', { texto: 'kg', atributos: { value: 'kg' } }),
    criarElemento('option', { texto: 'g', atributos: { value: 'g' } }),
  );
  const sugestoes = criarElemento('datalist', { atributos: { id: 'cortes-sugeridos' } }, ...definicao.cortesSugeridos.map((nome) => criarElemento('option', { atributos: { value: nome } })));

  const formCorte = criarElemento(
    'form',
    { classe: 'space-y-3 p-3 pt-0', atributos: { autocomplete: 'off' } },
    criarElemento('div', {}, rotuloCampo('Corte', 'corte-nome'), campoCorteNome),
    criarElemento('div', { classe: 'grid grid-cols-[1fr_auto] gap-3' }, criarElemento('div', {}, rotuloCampo('Peso', 'corte-peso'), campoCortePeso), criarElemento('div', {}, rotuloCampo('Unidade', 'corte-unidade'), campoCorteUnidade)),
    criarElemento('button', { classe: 'btn btn-tonal w-full', atributos: { type: 'submit' } }, icone('done'), 'Confirmar corte'),
  );
  formCorte.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const peso = lerNumero(campoCortePeso.value);
    if (!campoCorteNome.value.trim() || peso === null || peso <= 0) return;
    acoes.adicionarCorte({ nome: campoCorteNome.value, gramas: Math.round(campoCorteUnidade.value === 'kg' ? peso * 1000 : peso) });
    formCorte.reset();
    campoCorteNome.focus();
  });

  const blocoCortes = criarElemento(
    'section',
    { classe: 'card space-y-3 p-4' },
    criarElemento('div', { classe: 'flex items-start justify-between gap-3' }, criarElemento('div', {}, criarElemento('h3', { classe: 'text-headline-sm', texto: 'Cortes que eu já tenho' }), criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: 'Carnes já garantidas na geladeira ou no freezer' })), cortesTotal),
    listaCortes,
    criarElemento(
      'details',
      { classe: 'rounded-md border border-outline-variant' },
      criarElemento('summary', { classe: 'flex min-h-12 cursor-pointer items-center gap-2 px-3 text-label-lg text-primary' }, icone('add'), 'Adicionar corte que tenho em casa'),
      formCorte,
    ),
    sugestoes,
  );

  /* ---------- Acompanhamentos e bebidas ---------- */
  const linhasItens = new Map();
  definicao.itens.forEach(({ id, nome, unidade, passo }) => {
    const estado = criarElemento('span', { classe: 'badge-neutro' });
    const botaoCasa = criarElemento('button', { atributos: { type: 'button' }, aoClicar: () => acoes.alternarEmCasa(id) });
    const stepper = criarStepper({ valor: 0, minimo: 0, passo, compacto: true, rotulo: nome, aoMudar: (quantidade) => acoes.ajustarQuantidade(id, quantidade) });
    const linha = criarElemento(
      'li',
      { classe: 'card space-y-2 p-3' },
      criarElemento('div', { classe: 'flex items-center justify-between gap-2' }, criarElemento('div', { classe: 'min-w-0 space-y-1' }, criarElemento('p', { classe: 'truncate text-body-lg', texto: nome }), estado), botaoCasa),
      criarElemento('div', { classe: 'flex items-center gap-2' }, stepper.elemento, criarElemento('span', { classe: 'text-label-lg text-on-surface-variant', texto: unidade })),
    );
    linhasItens.set(id, { linha, estado, botaoCasa, stepper });
  });

  const itensTotal = criarElemento('span', { classe: 'text-body-sm text-on-surface-variant' });
  const blocoItens = criarElemento(
    'section',
    { classe: 'space-y-3' },
    criarElemento('div', { classe: 'flex items-baseline justify-between' }, criarElemento('h3', { classe: 'text-headline-sm', texto: 'Acompanhamentos e bebidas' }), itensTotal),
    criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: 'Quantidades sugeridas pelo número de convidados. Ajuste como preferir.' }),
    criarElemento('ul', { classe: 'space-y-3' }, ...[...linhasItens.values()].map(({ linha }) => linha)),
  );

  const elemento = criarElemento('div', { classe: 'space-y-6' }, cabecalho, blocoDados, blocoDuracao, blocoConvidados, blocoCarne, cartaoCarne, blocoCortes, blocoItens);

  /* ---------- Atualização ---------- */
  function atualizarCortes(cortes, carne) {
    cortesTotal.textContent = cortes.length > 0 ? `${formatarMedida(carne.tenho, 'g')} em casa` : '';
    listaCortes.replaceChildren(
      ...cortes.map((corte) =>
        criarElemento(
          'li',
          { classe: 'flex items-center justify-between gap-3 rounded-md bg-surface-container-low p-3' },
          criarElemento('div', { classe: 'min-w-0' }, criarElemento('p', { classe: 'truncate text-body-md', texto: corte.nome }), criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: formatarMedida(corte.gramas, 'g') })),
          criarElemento('button', { classe: 'btn btn-ghost size-12 min-h-0 p-0 text-error', atributos: { type: 'button', 'aria-label': `Remover ${corte.nome}` }, aoClicar: () => acoes.removerCorte(corte.id) }, icone('delete')),
        ),
      ),
    );
  }

  function atualizarSituacao({ meta, faltam, excesso }) {
    const selo = (classe, nomeIcone, texto) => situacao.replaceChildren(criarElemento('span', { classe }, icone(nomeIcone, 'text-base'), texto));
    if (meta === 0) selo('badge-neutro', 'group_add', 'Adicione convidados para calcular a carne');
    else if (faltam > 0) selo('badge-alerta', 'scale', `Faltam ${formatarMedida(faltam, 'g')} de carne`);
    else if (excesso > 0) selo('badge-bom', 'celebration', `Passou ${formatarMedida(excesso, 'g')} do sugerido: churrasco farto!`);
    else selo('badge-bom', 'check_circle', 'Meta atingida: carne completa');
  }

  function atualizarItem({ id, quantidade, emCasa, unidade }) {
    const { linha, estado, botaoCasa, stepper } = linhasItens.get(id);
    stepper.definir(quantidade);
    linha.classList.toggle('opacity-60', emCasa);
    estado.textContent = emCasa ? 'Em casa' : `A comprar · ${formatarMedida(quantidade, unidade)}`;
    estado.className = emCasa ? 'badge-bom' : 'badge-neutro';
    botaoCasa.className = `btn min-h-10 px-3 ${emCasa ? 'btn-primary' : 'btn-tonal'}`;
    botaoCasa.setAttribute('aria-pressed', String(emCasa));
    botaoCasa.replaceChildren(icone(emCasa ? 'check_circle' : 'inventory_2'), 'Já tenho');
  }

  return {
    elemento,

    atualizar({ evento, calculo }) {
      const { carne } = calculo;
      const duracao = definicao.duracoes.find(({ valor }) => valor === evento.duracao);

      definirValor(campoNome, evento.nome);
      definirValor(campoData, evento.data);
      definirValor(campoCorteFaltante, evento.corteFaltante);

      botoesDuracao.forEach(({ valor, botao }) => {
        const ativo = valor === evento.duracao;
        botao.className = `flex min-h-16 cursor-pointer flex-col items-start justify-center gap-0.5 rounded-lg border-2 px-4 text-left transition ${ativo ? CHIP_ATIVO : CHIP_INATIVO}`;
        botao.setAttribute('aria-checked', String(ativo));
      });

      definicao.convidados.forEach(({ id }) => steppers.get(id).definir(evento.convidados[id]));
      total.textContent = `${calculo.cabecas} ${calculo.cabecas === 1 ? 'convidado' : 'convidados'}`;

      metaTexto.textContent = formatarMedida(carne.meta, 'g');
      publicoTexto.textContent = textoPublico(evento.convidados, duracao.rotulo);
      progresso.style.width = `${carne.meta > 0 ? Math.min(100, (carne.tenho / carne.meta) * 100) : 0}%`;
      progressoTexto.textContent = `Tenho ${formatarMedida(carne.tenho, 'g')} de ${formatarMedida(carne.meta, 'g')}`;
      atualizarSituacao(carne);
      blocoCorteFaltante.classList.toggle('hidden', carne.faltam === 0);

      atualizarCortes(evento.cortes, carne);
      calculo.itens.forEach(atualizarItem);
      const emCasa = calculo.itens.filter((item) => item.emCasa).length;
      itensTotal.textContent = `${calculo.itens.length - emCasa} a comprar · ${emCasa} em casa`;
    },
  };
}
