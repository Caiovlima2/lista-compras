import { criarElemento } from '../utils/dom.js';
import { UNIDADES, calcularPrecoBase } from '../utils/calculos.js';
import { formatarCampoPreco, formatarPreco, formatarPrecoBase } from '../utils/formatadores.js';
import { aplicarMascaraPreco } from '../utils/mascaraPreco.js';
import { lerNumero } from '../utils/numero.js';
import { estaNoCarrinho } from '../domain/lista.js';
import { OPCOES_CATEGORIA } from './formItem.js';
import { criarStepper } from './stepper.js';
import { lerChip, renderizarChips, selecionarChip } from './seletorChips.js';
import { abrirSheet, configurarFechamento } from './sheet.js';

/** Sheet "Editar item": corrige nome, marca, preço, quantidade, medida e categoria. */
export function iniciarSheetEditarItem({ dialog, aoSalvar, aoExcluir, obterCustoBeneficio }) {
  const formulario = dialog.querySelector('#form-editar');
  const campos = formulario.elements;
  const subtotal = dialog.querySelector('#editar-subtotal');
  const previa = dialog.querySelector('#editar-previa');
  const unidades = dialog.querySelector('#editar-unidades');
  const categorias = dialog.querySelector('#editar-categorias');
  let itemAtual = null;

  aplicarMascaraPreco(campos.preco);

  const stepper = criarStepper({ valor: 1, nome: 'quantidade' });
  dialog.querySelector('#editar-quantidade').replaceChildren(stepper.elemento);
  renderizarChips(unidades, { nome: 'unidade', opcoes: UNIDADES.map((unidade) => ({ valor: unidade, rotulo: unidade })) });
  renderizarChips(categorias, { nome: 'categoria', opcoes: OPCOES_CATEGORIA });

  configurarFechamento(dialog);

  const lerDados = () => ({
    nome: campos.nome.value.trim(),
    marca: campos.marca.value.trim(),
    preco: lerNumero(campos.preco.value),
    quantidade: stepper.ler(),
    peso: lerNumero(campos.peso.value),
    unidade: lerChip(unidades),
    categoria: lerChip(categorias),
  });

  const atualizarResumo = () => {
    const { preco, quantidade, peso, unidade } = lerDados();
    subtotal.textContent = formatarPreco((preco ?? 0) * quantidade);

    const base = calcularPrecoBase(preco, peso, unidade);
    const custoBeneficio = itemAtual && base ? obterCustoBeneficio({ ...itemAtual, ...lerDados(), compra: null }) : null;
    previa.replaceChildren();
    if (base) {
      previa.append(
        criarElemento(
          'span',
          { classe: 'badge-bom' },
          `${formatarPrecoBase(base)}${custoBeneficio ? ' · Excelente custo-benefício' : ''}`,
        ),
      );
    }
  };

  formulario.addEventListener('input', atualizarResumo);

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = lerDados();
    if (!dados.nome) {
      campos.nome.focus();
      return;
    }
    dialog.close();
    aoSalvar(itemAtual.id, dados);
  });

  dialog.querySelector('#editar-excluir').addEventListener('click', () => {
    dialog.close();
    aoExcluir(itemAtual.id);
  });

  return {
    abrir(item) {
      itemAtual = item;
      const noCarrinho = estaNoCarrinho(item);
      campos.nome.value = item.nome;
      campos.marca.value = item.marca ?? '';
      campos.preco.value = formatarCampoPreco(noCarrinho ? item.compra.preco : item.preco);
      campos.peso.value = item.peso ? String(item.peso).replace('.', ',') : '';
      stepper.definir(noCarrinho ? item.compra.quantidade : item.quantidade);
      selecionarChip(unidades, item.unidade);
      selecionarChip(categorias, item.categoria ?? '');
      atualizarResumo();
      abrirSheet(dialog);
    },
  };
}
