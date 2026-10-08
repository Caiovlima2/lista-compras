import { criarElemento } from '../utils/dom.js';
import { gerarId } from '../utils/id.js';
import {
  formatarData,
  formatarPesoItem,
  formatarPreco,
  formatarQuantidade,
  formatarTituloItem,
} from '../utils/formatadores.js';

export function iniciarReaproveitamento(modal, { obterRegistros, aoConfirmar }) {
  const elementos = {
    vazio: modal.querySelector('#reaproveitar-vazio'),
    conteudo: modal.querySelector('#reaproveitar-conteudo'),
    origem: modal.querySelector('#reaproveitar-origem'),
    marcarTodos: modal.querySelector('#reaproveitar-todos'),
    lista: modal.querySelector('#reaproveitar-itens'),
    confirmar: modal.querySelector('#reaproveitar-confirmar'),
  };

  let registros = [];
  let linhas = [];

  function aoAbrirModal() {
    registros = [...obterRegistros()].sort((a, b) => b.data.localeCompare(a.data));
    const temRegistros = registros.length > 0;

    elementos.vazio.classList.toggle('d-none', temRegistros);
    elementos.conteudo.classList.toggle('d-none', !temRegistros);

    if (temRegistros) {
      preencherOrigens();
      mostrarItensDoRegistroSelecionado();
    } else {
      linhas = [];
      atualizarBotaoConfirmar();
    }
  }

  function preencherOrigens() {
    const opcoes = registros.map((registro, indice) =>
      criarElemento('option', {
        texto: descreverRegistro(registro),
        atributos: { value: indice },
      }),
    );
    elementos.origem.replaceChildren(...opcoes);
  }

  function mostrarItensDoRegistroSelecionado() {
    const registro = registros[Number(elementos.origem.value)];

    linhas = registro.itens.map((item) => criarLinha(item, atualizarBotaoConfirmar));
    elementos.lista.replaceChildren(...linhas.map((linha) => linha.elemento));
    elementos.marcarTodos.checked = false;
    atualizarBotaoConfirmar();
  }

  function atualizarBotaoConfirmar() {
    const total = linhas.filter((linha) => linha.estaMarcada()).length;

    elementos.confirmar.disabled = total === 0;
    elementos.confirmar.textContent = total
      ? `Adicionar ${formatarQuantidade(total)}`
      : 'Adicionar à lista';
  }

  function confirmar() {
    const selecionados = linhas
      .filter((linha) => linha.estaMarcada())
      .map((linha) => linha.lerDados());

    aoConfirmar(selecionados);
  }

  modal.addEventListener('show.bs.modal', aoAbrirModal);
  elementos.origem.addEventListener('change', mostrarItensDoRegistroSelecionado);
  elementos.confirmar.addEventListener('click', confirmar);
  elementos.marcarTodos.addEventListener('change', () => {
    linhas.forEach((linha) => linha.marcar(elementos.marcarTodos.checked));
    atualizarBotaoConfirmar();
  });
}

function descreverRegistro({ data, itens, total }) {
  return [formatarData(data), formatarQuantidade(itens.length), formatarPreco(total)].join(' — ');
}

function descreverUltimoPreco(item) {
  const peso = formatarPesoItem(item);
  return `Último preço: ${formatarPreco(item.preco)}${peso ? ` · ${peso}` : ''}`;
}

function criarCampoNumerico({ valor, rotulo, ...atributos }) {
  return criarElemento('input', {
    classe: 'form-control',
    atributos: { type: 'number', value: valor, 'aria-label': rotulo, ...atributos },
  });
}

/**
 * Uma linha da janela: checkbox + campos de preço e quantidade já preenchidos
 * com os valores da lista anterior. Editar qualquer campo marca o item.
 */
function criarLinha(item, aoMudar) {
  const idDaCaixa = `reaproveitar-${gerarId()}`;

  const caixa = criarElemento('input', {
    classe: 'form-check-input',
    atributos: { type: 'checkbox', id: idDaCaixa },
  });

  const preco = criarCampoNumerico({
    valor: item.preco,
    rotulo: `Novo preço de ${item.nome}`,
    step: '0.01',
    min: '0',
    inputmode: 'decimal',
  });

  const quantidade = criarCampoNumerico({
    valor: item.quantidade ?? 1,
    rotulo: `Quantidade de ${item.nome}`,
    step: '1',
    min: '1',
    inputmode: 'numeric',
  });

  const marcarAoEditar = () => {
    caixa.checked = true;
    aoMudar();
  };
  preco.addEventListener('input', marcarAoEditar);
  quantidade.addEventListener('input', marcarAoEditar);
  caixa.addEventListener('change', aoMudar);

  const titulo = criarElemento(
    'label',
    { classe: 'form-check-label', atributos: { for: idDaCaixa } },
    criarElemento('span', { classe: 'fw-semibold d-block', texto: formatarTituloItem(item) }),
    criarElemento('small', { classe: 'text-body-secondary', texto: descreverUltimoPreco(item) }),
  );

  const campos = criarElemento(
    'div',
    { classe: 'row g-2 mt-1' },
    criarElemento(
      'div',
      { classe: 'col-7' },
      criarElemento(
        'div',
        { classe: 'input-group input-group-sm' },
        criarElemento('span', { classe: 'input-group-text', texto: 'R$' }),
        preco,
      ),
    ),
    criarElemento(
      'div',
      { classe: 'col-5' },
      criarElemento(
        'div',
        { classe: 'input-group input-group-sm' },
        criarElemento('span', { classe: 'input-group-text', texto: 'Qtd' }),
        quantidade,
      ),
    ),
  );

  return {
    elemento: criarElemento(
      'li',
      { classe: 'list-group-item' },
      criarElemento('div', { classe: 'form-check' }, caixa, titulo),
      campos,
    ),
    estaMarcada: () => caixa.checked,
    marcar: (valor) => {
      caixa.checked = valor;
    },
    lerDados: () => ({
      nome: item.nome,
      marca: item.marca,
      preco: Number(preco.value),
      quantidade: Number(quantidade.value) || 1,
      peso: item.peso,
      unidade: item.unidade,
    }),
  };
}