import { criarElemento } from '../utils/dom.js';
import { formatarData, formatarPreco, formatarTituloItem, formatarPesoItem } from '../utils/formatadores.js';
import { criarItem } from '../domain/item.js';
import { ordenarRegistrosRecentes } from '../domain/historico.js';
import { abrirSheet, configurarFechamento } from './sheet.js';

export const MODOS = { JUNTAR: 'juntar', SUBSTITUIR: 'substituir' };

/** Sheet para copiar uma lista salva (inteira ou só alguns itens) para a lista atual. */
export function iniciarReaproveitarLista({ dialog, obterRegistros, aoConfirmar }) {
  const vazio = dialog.querySelector('#reaproveitar-vazio');
  const conteudo = dialog.querySelector('#reaproveitar-conteudo');
  const origem = dialog.querySelector('#reaproveitar-origem');
  const todos = dialog.querySelector('#reaproveitar-todos');
  const listaItens = dialog.querySelector('#reaproveitar-itens');
  const botaoJuntar = dialog.querySelector('#reaproveitar-juntar');
  const botaoSubstituir = dialog.querySelector('#reaproveitar-substituir');

  /** Cada linha guarda o item original e seus campos editáveis. */
  let linhas = [];

  configurarFechamento(dialog);

  const linhasSelecionadas = () => linhas.filter((linha) => linha.checkbox.checked);

  const montarItens = () =>
    linhasSelecionadas().map(({ item, preco, quantidade }) =>
      criarItem({
        nome: item.nome,
        marca: item.marca,
        peso: item.peso,
        unidade: item.unidade,
        preco: preco.value === '' ? null : Number(preco.value),
        quantidade: Number(quantidade.value) || 1,
      }),
    );

  const atualizarRodape = () => {
    const itens = montarItens();
    const total = itens.reduce((soma, item) => soma + (item.preco ?? 0) * item.quantidade, 0);
    botaoJuntar.textContent = itens.length ? `Adicionar ${itens.length} · ${formatarPreco(total)}` : 'Adicionar itens';
    botaoJuntar.disabled = botaoSubstituir.disabled = itens.length === 0;
    todos.checked = linhas.length > 0 && linhasSelecionadas().length === linhas.length;
  };

  const criarCampo = (rotulo, valor, atributos) => {
    const input = criarElemento('input', { classe: 'campo min-h-10 px-2', atributos: { type: 'number', min: 0, step: 'any', inputmode: 'decimal', value: valor, ...atributos } });
    input.addEventListener('input', atualizarRodape);
    return { input, rotulo: criarElemento('label', { classe: 'block' }, criarElemento('span', { classe: 'rotulo', texto: rotulo }), input) };
  };

  const criarLinha = (item) => {
    const checkbox = criarElemento('input', { classe: 'size-6 shrink-0 cursor-pointer accent-primary', atributos: { type: 'checkbox', checked: true, 'aria-label': `Selecionar ${item.nome}` } });
    checkbox.addEventListener('change', atualizarRodape);
    const preco = criarCampo('Preço (R$)', item.preco, { step: '0.01' });
    const quantidade = criarCampo('Qtd.', item.quantidade, { min: 0.001 });

    const elemento = criarElemento(
      'li',
      { classe: 'card space-y-2 p-3' },
      criarElemento(
        'div',
        { classe: 'flex items-center gap-3' },
        criarElemento('label', { classe: 'grid size-10 shrink-0 cursor-pointer place-items-center' }, checkbox),
        criarElemento(
          'div',
          { classe: 'min-w-0' },
          criarElemento('p', { classe: 'truncate text-body-lg', texto: formatarTituloItem(item) }),
          criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: formatarPesoItem(item) }),
        ),
      ),
      criarElemento('div', { classe: 'grid grid-cols-2 gap-3' }, preco.rotulo, quantidade.rotulo),
    );

    return { item, checkbox, preco: preco.input, quantidade: quantidade.input, elemento };
  };

  const mostrarRegistro = (registro) => {
    linhas = registro.itens.map(criarLinha);
    listaItens.replaceChildren(...linhas.map((linha) => linha.elemento));
    atualizarRodape();
  };

  origem.addEventListener('change', () => {
    mostrarRegistro(obterRegistros().find((registro) => registro.id === origem.value));
  });

  todos.addEventListener('change', () => {
    linhas.forEach((linha) => (linha.checkbox.checked = todos.checked));
    atualizarRodape();
  });

  const confirmar = (modo) => {
    dialog.close();
    aoConfirmar({ itens: montarItens(), modo });
  };
  botaoJuntar.addEventListener('click', () => confirmar(MODOS.JUNTAR));
  botaoSubstituir.addEventListener('click', () => confirmar(MODOS.SUBSTITUIR));

  return {
    /** Abre já na lista indicada (ou na mais recente). */
    abrir(registroId) {
      const registros = ordenarRegistrosRecentes(obterRegistros());
      vazio.classList.toggle('hidden', registros.length > 0);
      conteudo.classList.toggle('hidden', registros.length === 0);

      if (registros.length > 0) {
        origem.replaceChildren(
          ...registros.map((registro) =>
            criarElemento('option', {
              texto: `${formatarData(registro.data)} · ${registro.mercado || 'Sem local'} · ${formatarPreco(registro.total)}`,
              atributos: { value: registro.id },
            }),
          ),
        );
        origem.value = registroId ?? registros[0].id;
        mostrarRegistro(registros.find((registro) => registro.id === origem.value));
      }

      abrirSheet(dialog);
    },
  };
}
