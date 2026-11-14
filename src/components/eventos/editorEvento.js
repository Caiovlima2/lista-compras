import { criarElemento, icone } from '../../utils/dom.js';
import { formatarMedida } from '../../utils/formatadores.js';
import { lerNumero } from '../../utils/numero.js';
import { criarMarcador } from '../marcador.js';
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

  /* ---------- Tipos de carne (o que vai ao fogo) ---------- */
  const chipsCarne = definicao.carne.tipos.map(({ id, rotulo, icone: nomeIcone }) => {
    const botao = criarElemento('button', { atributos: { type: 'button' }, aoClicar: () => acoes.alternarCarne(id) }, icone(nomeIcone, 'text-xl'), rotulo);
    return { id, botao };
  });

  const blocoTiposCarne = criarElemento(
    'section',
    { classe: 'space-y-2' },
    criarElemento('div', {}, criarElemento('h3', { classe: 'text-headline-sm', texto: 'O que vai ao fogo?' }), criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: 'A carne total se divide entre os tipos escolhidos.' })),
    criarElemento('div', { classe: 'flex flex-wrap gap-2' }, ...chipsCarne.map(({ botao }) => botao)),
  );

  /* ---------- Carne recomendada e quanto falta de cada tipo ---------- */
  const metaTexto = criarElemento('p', { classe: 'text-price-hero tabular-nums' });
  const publicoTexto = criarElemento('p', { classe: 'text-body-md opacity-90' });
  const blocoCarne = criarElemento(
    'section',
    { classe: 'space-y-1 rounded-lg bg-primary-container p-5 text-on-primary-container' },
    criarElemento('p', { classe: 'text-label-md opacity-90', texto: 'CARNE RECOMENDADA' }),
    metaTexto,
    publicoTexto,
  );

  const sugestoes = criarElemento('datalist', { atributos: { id: 'cortes-sugeridos' } });
  const linhasTipos = new Map();
  definicao.carne.tipos.forEach(({ id, rotulo, icone: nomeIcone, nomePadrao, cortesSugeridos }) => {
    const resumo = criarElemento('p', { classe: 'text-body-sm text-on-surface-variant' });
    const progresso = criarElemento('div', { classe: 'h-full rounded-full bg-primary transition-all' });
    const situacao = criarElemento('div', { classe: 'flex' });
    const campoCorte = criarElemento('input', { classe: 'campo', atributos: { id: `corte-faltante-${id}`, type: 'text', placeholder: nomePadrao, enterkeyhint: 'done', list: `sugestoes-${id}` } });
    campoCorte.addEventListener('input', () => acoes.alterarCorteFaltante(id, campoCorte.value));
    const dica = criarElemento('p', { classe: 'text-body-sm text-on-surface-variant' });
    const sugestoesDoTipo = criarElemento('datalist', { atributos: { id: `sugestoes-${id}` } }, ...cortesSugeridos.map((nome) => criarElemento('option', { atributos: { value: nome } })));
    const blocoCorte = criarElemento('div', {}, rotuloCampo('Qual corte comprar para completar?', `corte-faltante-${id}`), campoCorte, dica, sugestoesDoTipo);
    const linha = criarElemento(
      'li',
      { classe: 'card space-y-2 p-4' },
      criarElemento('div', { classe: 'flex items-center gap-2' }, icone(nomeIcone, 'text-primary'), criarElemento('h4', { classe: 'text-label-lg', texto: rotulo })),
      criarElemento('div', { classe: 'h-3 overflow-hidden rounded-full bg-surface-container-high', atributos: { role: 'presentation' } }, progresso),
      resumo,
      situacao,
      blocoCorte,
    );
    linhasTipos.set(id, { linha, resumo, progresso, situacao, campoCorte, blocoCorte, dica, nomePadrao });
  });

  const avisoSemCarne = criarElemento('p', { classe: 'card p-4 text-body-md text-on-surface-variant', texto: 'Escolha pelo menos um tipo de carne para calcular.' });
  const cartaoCarne = criarElemento('ul', { classe: 'space-y-3' }, ...[...linhasTipos.values()].map(({ linha }) => linha));

  /* ---------- Cortes que já tenho ---------- */
  const listaCortes = criarElemento('ul', { classe: 'space-y-2' });
  const cortesTotal = criarElemento('span', { classe: 'text-body-sm text-on-surface-variant' });

  const campoCorteTipo = criarElemento('select', { classe: 'campo', atributos: { id: 'corte-tipo' } });
  const campoCorteNome = criarElemento('input', { classe: 'campo', atributos: { id: 'corte-nome', type: 'text', list: 'cortes-sugeridos', placeholder: 'Ex.: Picanha', required: true } });
  const campoCortePeso = criarElemento('input', { classe: 'campo', atributos: { id: 'corte-peso', inputmode: 'decimal', placeholder: 'Ex.: 1,2', required: true } });
  const campoCorteUnidade = criarElemento(
    'select',
    { classe: 'campo', atributos: { id: 'corte-unidade', 'aria-label': 'Unidade do corte' } },
    criarElemento('option', { texto: 'kg', atributos: { value: 'kg' } }),
    criarElemento('option', { texto: 'g', atributos: { value: 'g' } }),
  );

  const atualizarSugestoes = () => {
    const tipo = definicao.carne.tipos.find(({ id }) => id === campoCorteTipo.value);
    sugestoes.replaceChildren(...(tipo?.cortesSugeridos ?? []).map((nome) => criarElemento('option', { atributos: { value: nome } })));
  };
  campoCorteTipo.addEventListener('change', atualizarSugestoes);

  const formCorte = criarElemento(
    'form',
    { classe: 'space-y-3 p-3 pt-0', atributos: { autocomplete: 'off' } },
    criarElemento('div', {}, rotuloCampo('Tipo de carne', 'corte-tipo'), campoCorteTipo),
    criarElemento('div', {}, rotuloCampo('Corte', 'corte-nome'), campoCorteNome),
    criarElemento('div', { classe: 'grid grid-cols-[1fr_auto] gap-3' }, criarElemento('div', {}, rotuloCampo('Peso', 'corte-peso'), campoCortePeso), criarElemento('div', {}, rotuloCampo('Unidade', 'corte-unidade'), campoCorteUnidade)),
    criarElemento('button', { classe: 'btn btn-tonal w-full', atributos: { type: 'submit' } }, icone('done'), 'Confirmar corte'),
  );
  formCorte.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const peso = lerNumero(campoCortePeso.value);
    if (!campoCorteTipo.value || !campoCorteNome.value.trim() || peso === null || peso <= 0) return;
    acoes.adicionarCorte({ nome: campoCorteNome.value, categoria: campoCorteTipo.value, gramas: Math.round(campoCorteUnidade.value === 'kg' ? peso * 1000 : peso) });
    campoCorteNome.value = '';
    campoCortePeso.value = '';
    campoCorteNome.focus();
  });

  const detalhesCorte = criarElemento(
    'details',
    { classe: 'rounded-md border border-outline-variant' },
    criarElemento('summary', { classe: 'flex min-h-12 cursor-pointer items-center gap-2 px-3 text-label-lg text-primary' }, icone('add'), 'Adicionar corte que tenho em casa'),
    formCorte,
  );

  const blocoCortes = criarElemento(
    'section',
    { classe: 'card space-y-3 p-4' },
    criarElemento('div', { classe: 'flex items-start justify-between gap-3' }, criarElemento('div', {}, criarElemento('h3', { classe: 'text-headline-sm', texto: 'Carnes que eu já tenho' }), criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: 'Já garantidas na geladeira ou no freezer' })), cortesTotal),
    listaCortes,
    detalhesCorte,
    sugestoes,
  );

  /* ---------- Complementos: o usuário marca o que quer ---------- */
  const cartoes = new Map();
  const ingredientes = new Map();

  definicao.complementos.forEach(({ id, nome, icone: nomeIcone, ingredientes: lista }) => {
    const marcador = criarMarcador({ nomeIcone, titulo: nome, aoAlternar: () => acoes.alternarComplemento(id) });
    const mostrarNome = lista.length > 1;

    const linhas = lista.map(({ id: idIngrediente, nome: nomeIngrediente, unidade, passo }) => {
      const estadoTexto = criarElemento('span', { classe: 'badge-neutro' });
      const botaoCasa = criarElemento('button', { atributos: { type: 'button' }, aoClicar: () => acoes.alternarEmCasa(idIngrediente) });
      const stepper = criarStepper({ valor: 0, minimo: 0, passo, compacto: true, rotulo: nomeIngrediente, aoMudar: (quantidade) => acoes.ajustarQuantidade(idIngrediente, quantidade) });
      ingredientes.set(idIngrediente, { estadoTexto, botaoCasa, stepper, unidade });
      const linha = criarElemento(
        'li',
        { classe: 'space-y-2' },
        mostrarNome ? criarElemento('p', { classe: 'text-label-lg', texto: nomeIngrediente }) : null,
        criarElemento('div', { classe: 'flex flex-wrap items-center gap-2' }, stepper.elemento, criarElemento('span', { classe: 'text-label-lg text-on-surface-variant', texto: unidade }), botaoCasa),
        estadoTexto,
      );
      ingredientes.get(idIngrediente).linha = linha;
      return linha;
    });

    const corpo = criarElemento('ul', { classe: 'space-y-4 border-t border-outline-variant p-4' }, ...linhas);
    const cartao = criarElemento('li', { classe: 'card overflow-hidden' }, marcador.rotulo, corpo);
    cartoes.set(id, { caixa: marcador.caixa, corpo });
  });

  const grupos = [...new Set(definicao.complementos.map(({ grupo }) => grupo))];
  const blocoComplementos = criarElemento(
    'div',
    { classe: 'space-y-6' },
    ...grupos.map((grupo) =>
      criarElemento(
        'section',
        { classe: 'space-y-3' },
        criarElemento('h3', { classe: 'text-headline-sm', texto: grupo }),
        criarElemento('ul', { classe: 'space-y-3' }, ...definicao.complementos.filter((complemento) => complemento.grupo === grupo).map(({ id }) => cartoes.get(id).caixa.closest('li'))),
      ),
    ),
  );
  const itensTotal = criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: 'Marque o que vai ter no seu churrasco: o app calcula as quantidades pelo número de convidados.' });

  const elemento = criarElemento(
    'div',
    { classe: 'space-y-6' },
    cabecalho,
    blocoDados,
    blocoDuracao,
    blocoConvidados,
    blocoTiposCarne,
    blocoCarne,
    avisoSemCarne,
    cartaoCarne,
    blocoCortes,
    criarElemento('section', { classe: 'space-y-3' }, criarElemento('h3', { classe: 'text-headline-md', texto: 'Complementos' }), itensTotal, blocoComplementos),
  );

  /* ---------- Atualização ---------- */
  let chaveTiposCorte = '';

  function atualizarTipo(tipo, evento) {
    const { linha, resumo, progresso, situacao, campoCorte, blocoCorte, dica, nomePadrao } = linhasTipos.get(tipo.id);
    linha.classList.toggle('hidden', !tipo.selecionado);
    if (!tipo.selecionado) return;

    resumo.textContent = `Tenho ${formatarMedida(tipo.tenho, 'g')} de ${formatarMedida(tipo.meta, 'g')}`;
    progresso.style.width = `${tipo.meta > 0 ? Math.min(100, (tipo.tenho / tipo.meta) * 100) : 0}%`;
    definirValor(campoCorte, evento.corteFaltante[tipo.id] ?? '');
    blocoCorte.classList.toggle('hidden', tipo.faltam === 0);
    dica.textContent = `Vai para a lista de compras: ${(evento.corteFaltante[tipo.id] ?? '').trim() || nomePadrao}, ${formatarMedida(tipo.faltam, 'g')}`;

    const selo = (classe, nomeIcone, texto) => situacao.replaceChildren(criarElemento('span', { classe }, icone(nomeIcone, 'text-base'), texto));
    if (tipo.meta === 0) selo('badge-neutro', 'group_add', 'Adicione convidados');
    else if (tipo.faltam > 0) selo('badge-alerta', 'scale', `Faltam ${formatarMedida(tipo.faltam, 'g')}`);
    else if (tipo.excesso > 0) selo('badge-bom', 'celebration', `Passou ${formatarMedida(tipo.excesso, 'g')}: churrasco farto!`);
    else selo('badge-bom', 'check_circle', 'Meta atingida');
  }

  function atualizarCortes(evento, carne) {
    const selecionados = carne.tipos.filter((tipo) => tipo.selecionado);
    const chave = selecionados.map((tipo) => tipo.id).join('|');
    if (chave !== chaveTiposCorte) {
      chaveTiposCorte = chave;
      const anterior = campoCorteTipo.value;
      campoCorteTipo.replaceChildren(...selecionados.map((tipo) => criarElemento('option', { texto: tipo.rotulo, atributos: { value: tipo.id } })));
      if (selecionados.some((tipo) => tipo.id === anterior)) campoCorteTipo.value = anterior;
      atualizarSugestoes();
    }
    detalhesCorte.classList.toggle('hidden', selecionados.length === 0);

    cortesTotal.textContent = evento.cortes.length > 0 ? `${formatarMedida(carne.tenho, 'g')} em casa` : '';
    listaCortes.replaceChildren(
      ...evento.cortes.map((corte) => {
        const tipo = carne.tipos.find(({ id }) => id === corte.categoria);
        const ativo = tipo?.selecionado;
        return criarElemento(
          'li',
          { classe: `flex items-center justify-between gap-3 rounded-md bg-surface-container-low p-3 ${ativo ? '' : 'opacity-60'}` },
          criarElemento(
            'div',
            { classe: 'min-w-0' },
            criarElemento('p', { classe: 'truncate text-body-md', texto: corte.nome }),
            criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: `${formatarMedida(corte.gramas, 'g')} · ${tipo?.rotulo ?? 'Carne'}${ativo ? '' : ' (não escolhido)'}` }),
          ),
          criarElemento('button', { classe: 'btn btn-ghost size-12 min-h-0 p-0 text-error', atributos: { type: 'button', 'aria-label': `Remover ${corte.nome}` }, aoClicar: () => acoes.removerCorte(corte.id) }, icone('delete')),
        );
      }),
    );
  }

  function atualizarIngrediente({ id, quantidade, emCasa, unidade }) {
    const { estadoTexto, botaoCasa, stepper, linha } = ingredientes.get(id);
    stepper.definir(quantidade);
    linha.classList.toggle('opacity-60', emCasa);
    estadoTexto.textContent = emCasa ? 'Em casa' : `A comprar · ${formatarMedida(quantidade, unidade)}`;
    estadoTexto.className = emCasa ? 'badge-bom' : 'badge-neutro';
    botaoCasa.className = `btn min-h-10 px-3 ${emCasa ? 'btn-primary' : 'btn-tonal'}`;
    botaoCasa.setAttribute('aria-pressed', String(emCasa));
    botaoCasa.replaceChildren(icone(emCasa ? 'check_circle' : 'inventory_2'), 'Já tenho');
  }

  return {
    elemento,

    atualizar({ evento, calculo }) {
      const { carne } = calculo;
      const duracao = definicao.duracoes.find(({ valor }) => valor === evento.duracao);
      const semCarne = carne.tipos.every((tipo) => !tipo.selecionado);

      definirValor(campoNome, evento.nome);
      definirValor(campoData, evento.data);

      botoesDuracao.forEach(({ valor, botao }) => {
        const ativo = valor === evento.duracao;
        botao.className = `flex min-h-16 cursor-pointer flex-col items-start justify-center gap-0.5 rounded-lg border-2 px-4 text-left transition ${ativo ? CHIP_ATIVO : CHIP_INATIVO}`;
        botao.setAttribute('aria-checked', String(ativo));
      });

      definicao.convidados.forEach(({ id }) => steppers.get(id).definir(evento.convidados[id]));
      total.textContent = `${calculo.cabecas} ${calculo.cabecas === 1 ? 'convidado' : 'convidados'}`;

      chipsCarne.forEach(({ id, botao }) => {
        const ativo = evento.carnes.includes(id);
        botao.className = `chip min-h-11 gap-2 ${ativo ? `${CHIP_ATIVO} hover:text-on-primary` : ''}`.trim();
        botao.setAttribute('aria-pressed', String(ativo));
      });

      blocoCarne.classList.toggle('hidden', semCarne);
      avisoSemCarne.classList.toggle('hidden', !semCarne);
      cartaoCarne.classList.toggle('hidden', semCarne);
      metaTexto.textContent = formatarMedida(carne.meta, 'g');
      publicoTexto.textContent = textoPublico(evento.convidados, duracao.rotulo);
      carne.tipos.forEach((tipo) => atualizarTipo(tipo, evento));
      atualizarCortes(evento, carne);

      calculo.complementos.forEach((complemento) => {
        const { caixa, corpo } = cartoes.get(complemento.id);
        caixa.checked = complemento.selecionado;
        corpo.classList.toggle('hidden', !complemento.selecionado);
        complemento.ingredientes.forEach(atualizarIngrediente);
      });
    },
  };
}
