import { criarElemento } from '../utils/dom.js';
import { UNIDADES, calcularPrecoBase } from '../utils/calculos.js';
import { formatarPrecoBase } from '../utils/formatadores.js';

const lerNumero = (valor) => (valor === '' || valor === null ? null : Number(valor));

function lerFormulario(formulario) {
  const dados = new FormData(formulario);
  return {
    nome: String(dados.get('nome')),
    marca: String(dados.get('marca')),
    preco: lerNumero(dados.get('preco')),
    quantidade: lerNumero(dados.get('quantidade')) ?? 1,
    peso: lerNumero(dados.get('peso')),
    unidade: String(dados.get('unidade')),
  };
}

export function iniciarFormItem({ formulario, previa, aoAdicionar }) {
  const selectUnidade = formulario.elements.unidade;
  selectUnidade.replaceChildren(...UNIDADES.map((unidade) => criarElemento('option', { texto: unidade, atributos: { value: unidade } })));

  const atualizarPrevia = () => {
    const { preco, peso, unidade } = lerFormulario(formulario);
    const base = calcularPrecoBase(preco, peso, unidade);
    previa.textContent = base ? `Valor por ${base.rotulo}: ${formatarPrecoBase(base)}` : '';
  };

  formulario.addEventListener('input', atualizarPrevia);

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    aoAdicionar(lerFormulario(formulario));
    formulario.reset();
    atualizarPrevia();
    formulario.elements.nome.focus();
  });

  return {
    /** Preenche o formulário a partir de uma sugestão do histórico. */
    preencher({ nome, marca, preco, peso, unidade }) {
      const campos = formulario.elements;
      campos.nome.value = nome;
      campos.marca.value = marca ?? '';
      campos.preco.value = preco ?? '';
      campos.peso.value = peso ?? '';
      campos.unidade.value = unidade ?? UNIDADES[0];
      atualizarPrevia();
      campos.preco.focus();
    },
  };
}

export function renderizarSugestoes(container, bloco, sugestoes, aoEscolher) {
  bloco.classList.toggle('hidden', sugestoes.length === 0);
  container.replaceChildren(
    ...sugestoes.map((sugestao) =>
      criarElemento('button', { classe: 'chip', texto: sugestao.nome, atributos: { type: 'button' }, aoClicar: () => aoEscolher(sugestao) }),
    ),
  );
}
