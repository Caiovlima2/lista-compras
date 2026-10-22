import { criarElemento, icone } from '../utils/dom.js';
import { UNIDADES, calcularPrecoBase } from '../utils/calculos.js';
import { formatarCampoPreco, formatarPreco, formatarPrecoBase } from '../utils/formatadores.js';
import { aplicarMascaraPreco } from '../utils/mascaraPreco.js';
import { lerNumero } from '../utils/numero.js';
import { CATEGORIAS } from '../domain/categorias.js';
import { criarStepper } from './stepper.js';
import { lerChip, renderizarChips, selecionarChip } from './seletorChips.js';

export const OPCOES_CATEGORIA = [{ valor: '', rotulo: 'Nenhuma' }, ...CATEGORIAS.map((c) => ({ valor: c, rotulo: c }))];

/**
 * Formulário usado no planejamento e no modo mercado.
 * - buscarSugestao(texto): devolve um produto conhecido (ou null) para o cartão "Último preço"
 */
export function iniciarFormItem({ formulario, aoAdicionar, aoDigitar, buscarSugestao }) {
  const campos = formulario.elements;
  const previa = formulario.querySelector('#previa');
  const cartaoSugestao = formulario.querySelector('#sugestao-preco');
  const maisDetalhes = formulario.querySelector('#mais-detalhes');
  const rotuloBotao = formulario.querySelector('#rotulo-adicionar');
  const containerCategorias = formulario.querySelector('#categorias-form');

  aplicarMascaraPreco(campos.preco);

  const stepper = criarStepper({ valor: 1, nome: 'quantidade' });
  formulario.querySelector('#quantidade-stepper').replaceChildren(stepper.elemento);

  campos.unidade.replaceChildren(...UNIDADES.map((unidade) => criarElemento('option', { texto: unidade, atributos: { value: unidade } })));
  renderizarChips(containerCategorias, { nome: 'categoria', opcoes: OPCOES_CATEGORIA });

  const lerFormulario = () => ({
    nome: campos.nome.value.trim(),
    marca: campos.marca.value.trim(),
    preco: lerNumero(campos.preco.value),
    quantidade: stepper.ler(),
    peso: lerNumero(campos.peso.value),
    unidade: campos.unidade.value,
    categoria: lerChip(containerCategorias),
  });

  const atualizarPrevia = () => {
    const { preco, peso, unidade } = lerFormulario();
    const base = calcularPrecoBase(preco, peso, unidade);
    previa.textContent = base ? `Valor por ${base.rotulo}: ${formatarPrecoBase(base)}` : '';
  };

  function preencher({ nome, marca, preco, peso, unidade, categoria }) {
    campos.nome.value = nome;
    campos.marca.value = marca ?? '';
    campos.preco.value = formatarCampoPreco(preco ?? null);
    campos.peso.value = peso ? String(peso).replace('.', ',') : '';
    campos.unidade.value = unidade ?? UNIDADES[0];
    selecionarChip(containerCategorias, categoria ?? '');
    atualizarPrevia();
    atualizarSugestao();
  }

  function atualizarSugestao() {
    const sugestao = campos.nome.value.trim() ? buscarSugestao?.(campos.nome.value) : null;
    if (!sugestao || sugestao.preco == null) {
      cartaoSugestao.replaceChildren();
      return;
    }

    const titulo = sugestao.marca ? `${sugestao.nome} · ${sugestao.marca}` : sugestao.nome;
    cartaoSugestao.replaceChildren(
      criarElemento(
        'button',
        {
          classe: 'flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-secondary-container bg-secondary-container/40 p-3 text-left',
          atributos: { type: 'button' },
          aoClicar: () => preencher(sugestao),
        },
        criarElemento(
          'span',
          { classe: 'flex min-w-0 items-center gap-2' },
          icone('lightbulb', 'text-secondary'),
          criarElemento(
            'span',
            { classe: 'min-w-0' },
            criarElemento('span', { classe: 'block truncate text-label-lg', texto: titulo }),
            criarElemento('span', { classe: 'block text-body-sm text-on-surface-variant', texto: `Último pago: ${formatarPreco(sugestao.preco)}` }),
          ),
        ),
        criarElemento('span', { classe: 'badge-alerta shrink-0', texto: `Usar ${formatarPreco(sugestao.preco)}` }),
      ),
    );
  }

  formulario.addEventListener('input', atualizarPrevia);
  campos.nome.addEventListener('input', () => {
    atualizarSugestao();
    aoDigitar?.();
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = lerFormulario();
    if (!dados.nome) {
      campos.nome.focus();
      return;
    }
    aoAdicionar(dados);
  });

  return {
    preencher,

    limpar() {
      formulario.reset();
      stepper.definir(1);
      selecionarChip(containerCategorias, '');
      atualizarPrevia();
      atualizarSugestao();
      campos.nome.focus();
    },

    /** Ajusta textos e o bloco de detalhes conforme a fase da lista. */
    definirModo(comprando) {
      rotuloBotao.textContent = comprando ? 'Pôr no carrinho' : 'Adicionar à lista';
      formulario.dataset.modo = comprando ? 'comprando' : 'planejando';
      if (formulario.dataset.modoAnterior !== formulario.dataset.modo) {
        maisDetalhes.open = !comprando;
        formulario.dataset.modoAnterior = formulario.dataset.modo;
      }
    },
  };
}

/** Atalhos com os itens mais comprados: um toque já adiciona. */
export function renderizarSugestoes(container, bloco, sugestoes, aoEscolher) {
  bloco.classList.toggle('hidden', sugestoes.length === 0);
  container.replaceChildren(
    ...sugestoes.map((sugestao) =>
      criarElemento('button', {
        classe: 'chip',
        texto: `+ ${sugestao.nome}`,
        atributos: { type: 'button', 'aria-label': `Adicionar ${sugestao.nome}` },
        aoClicar: () => aoEscolher(sugestao),
      }),
    ),
  );
}
