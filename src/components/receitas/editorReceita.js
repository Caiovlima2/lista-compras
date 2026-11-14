import { criarElemento, icone } from '../../utils/dom.js';
import { UNIDADES, UNIDADE_PADRAO } from '../../utils/calculos.js';
import { lerNumero } from '../../utils/numero.js';
import { listarPendencias } from '../../domain/receitas/receita.js';
import { gerarId } from '../../utils/id.js';
import { criarStepper } from '../stepper.js';
import { lerChip, renderizarChips } from '../seletorChips.js';

const OPCOES_UNIDADE = UNIDADES.map((unidade) => ({ valor: unidade, rotulo: unidade }));

/**
 * Formulário de receita (nova ou existente). Os dados ficam nos campos até apertar "Salvar";
 * "Cancelar" descarta tudo. A barra fixa mostra as pendências e o botão de salvar.
 */
export function criarEditorReceita({ receita, barra, acoes }) {
  /* ---------- Nome, porções e anotações ---------- */
  const campoNome = criarElemento('input', { classe: 'campo', atributos: { id: 'receita-nome', type: 'text', placeholder: 'Ex.: Frango com legumes', enterkeyhint: 'next', value: receita?.nome ?? '' } });
  const stepperPorcoes = criarStepper({ valor: receita?.porcoes ?? 4, minimo: 1, rotulo: 'Porções' });
  const campoAnotacoes = criarElemento('textarea', { classe: 'campo min-h-24 py-2', atributos: { id: 'receita-anotacoes', rows: 4, placeholder: 'Modo de preparo, dicas, tempo de forno... (opcional)' }, texto: receita?.anotacoes ?? '' });

  /* ---------- Ingredientes ---------- */
  const listaIngredientes = criarElemento('ul', { classe: 'space-y-3' });
  const linhas = [];
  let sequencia = 0;

  function adicionarLinha(ingrediente = {}) {
    sequencia += 1;
    const numero = sequencia;
    const campoIngrediente = criarElemento('input', { classe: 'campo', atributos: { type: 'text', placeholder: 'Nome do ingrediente', 'aria-label': `Nome do ingrediente ${numero}`, enterkeyhint: 'next', value: ingrediente.nome ?? '' } });
    const campoQuantidade = criarElemento('input', { classe: 'campo max-w-32', atributos: { inputmode: 'decimal', placeholder: 'Qtd', 'aria-label': `Quantidade do ingrediente ${numero}`, value: ingrediente.quantidade ? String(ingrediente.quantidade).replace('.', ',') : '' } });
    const unidades = criarElemento('div', { classe: 'flex flex-wrap gap-2' });
    renderizarChips(unidades, { nome: `unidade-${numero}`, opcoes: OPCOES_UNIDADE, valor: ingrediente.unidade ?? UNIDADE_PADRAO });

    const linha = { id: ingrediente.id ?? gerarId(), campoIngrediente, campoQuantidade, unidades };
    const elemento = criarElemento(
      'li',
      { classe: 'card space-y-3 p-3' },
      criarElemento(
        'div',
        { classe: 'flex items-center justify-between' },
        criarElemento('span', { classe: 'text-label-md text-on-surface-variant', texto: `Ingrediente ${numero}` }),
        criarElemento('button', { classe: 'btn btn-ghost size-12 min-h-0 p-0 text-error', atributos: { type: 'button', 'aria-label': `Remover ingrediente ${numero}` }, aoClicar: () => {
          linhas.splice(linhas.indexOf(linha), 1);
          elemento.remove();
          atualizarBarra();
        } }, icone('delete')),
      ),
      campoIngrediente,
      criarElemento('div', { classe: 'flex flex-wrap items-center gap-3' }, campoQuantidade, unidades),
    );
    linha.elemento = elemento;
    linhas.push(linha);
    listaIngredientes.append(elemento);
    return linha;
  }

  /* ---------- Leitura e validação ---------- */
  const lerDados = () => ({
    nome: campoNome.value,
    porcoes: stepperPorcoes.ler(),
    anotacoes: campoAnotacoes.value,
    ingredientes: linhas.map(({ id, campoIngrediente, campoQuantidade, unidades }) => ({
      id,
      nome: campoIngrediente.value,
      quantidade: lerNumero(campoQuantidade.value),
      unidade: lerChip(unidades) || UNIDADE_PADRAO,
    })),
  });

  function atualizarBarra() {
    const dados = lerDados();
    const pendencias = listarPendencias(dados);
    barra.style.display = '';
    barra.replaceChildren(
      criarElemento(
        'div',
        { classe: 'min-w-0 flex-1' },
        pendencias.length === 0
          ? criarElemento('p', { classe: 'text-label-lg text-primary', texto: 'Tudo certo para salvar' })
          : criarElemento('p', { classe: 'text-label-lg text-error', texto: `${pendencias.length} ${pendencias.length === 1 ? 'pendência' : 'pendências'}` }),
        criarElemento('p', { classe: 'truncate text-body-sm text-on-surface-variant', texto: pendencias[0] ?? 'Revise os ingredientes' }),
      ),
      criarElemento('button', { classe: 'btn btn-primary shrink-0', atributos: { type: 'button', disabled: pendencias.length > 0 }, aoClicar: () => acoes.salvar(dados) }, icone('check_circle'), 'Salvar receita'),
    );
  }

  const adicionarOutra = () => {
    const linha = adicionarLinha();
    linha.campoIngrediente.focus();
    atualizarBarra();
  };

  (receita?.ingredientes.length ? receita.ingredientes : [{}, {}, {}]).forEach(adicionarLinha);

  const elemento = criarElemento(
    'div',
    { classe: 'space-y-6' },
    criarElemento(
      'div',
      { classe: 'flex items-center justify-between gap-2' },
      criarElemento('h2', { classe: 'text-headline-md', texto: receita ? 'Editar receita' : 'Nova receita' }),
      criarElemento('button', { classe: 'btn btn-ghost min-h-10 px-4', atributos: { type: 'button' }, aoClicar: acoes.cancelar }, 'Cancelar'),
    ),
    criarElemento('section', { classe: 'card space-y-4 p-4' }, criarElemento('div', {}, criarElemento('label', { classe: 'rotulo', texto: 'Nome da receita', atributos: { for: 'receita-nome' } }), campoNome), criarElemento('div', { classe: 'flex items-center justify-between gap-3' }, criarElemento('div', {}, criarElemento('p', { classe: 'text-label-lg', texto: 'Rendimento' }), criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: 'Para quantas porções são as quantidades' })), stepperPorcoes.elemento)),
    criarElemento(
      'section',
      { classe: 'space-y-3' },
      criarElemento('div', {}, criarElemento('h3', { classe: 'text-headline-sm', texto: 'Ingredientes' }), criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: 'Informe a quantidade e escolha a unidade' })),
      listaIngredientes,
      criarElemento('button', { classe: 'btn btn-tonal w-full', atributos: { type: 'button' }, aoClicar: adicionarOutra }, icone('add_circle'), 'Adicionar ingrediente'),
    ),
    criarElemento('section', {}, criarElemento('label', { classe: 'rotulo', texto: 'Anotações', atributos: { for: 'receita-anotacoes' } }), campoAnotacoes),
  );

  elemento.addEventListener('input', atualizarBarra);
  elemento.addEventListener('change', atualizarBarra);
  atualizarBarra();

  return { elemento };
}
