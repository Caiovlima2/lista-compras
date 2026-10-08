import { UNIDADES, calcularPrecoBase } from '../utils/calculos.js';
import { criarElemento } from '../utils/dom.js';
import { formatarPreco } from '../utils/formatadores.js';

export function iniciarFormItem(form, { aoAdicionar }) {
  preencherUnidades(form.elements.unidade);

  form.addEventListener('input', () => atualizarPrevia(form));

  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    aoAdicionar(lerDadosDoFormulario(form));
    form.reset();
    form.elements.previa.value = '';
    form.elements.nome.focus();
  });
}

function preencherUnidades(select) {
  const opcoes = UNIDADES.map((unidade) =>
    criarElemento('option', { texto: unidade, atributos: { value: unidade } }),
  );
  select.replaceChildren(...opcoes);
}

function lerDadosDoFormulario(form) {
  const dados = new FormData(form);

  return {
    nome: dados.get('nome').trim(),
    marca: dados.get('marca').trim(),
    preco: Number(dados.get('preco')),
    quantidade: Number(dados.get('quantidade')) || 1,
    peso: Number(dados.get('peso')),
    unidade: dados.get('unidade'),
  };
}

function atualizarPrevia(form) {
  const { preco, peso, unidade } = lerDadosDoFormulario(form);
  const resultado = calcularPrecoBase(preco, peso, unidade);

  form.elements.previa.value = resultado
    ? `💡 Valor por ${resultado.rotulo}: ${formatarPreco(resultado.valor)}`
    : '';
}