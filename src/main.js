import './style.css';

import { carregarHistorico, carregarItens, carregarSessao, salvarHistorico, salvarItens, salvarSessao } from './services/storage.js';
import { criarItem, normalizarItem } from './domain/item.js';
import { calcularComparativoMensal, criarRegistroHistorico, listarMercadosRecentes, listarSugestoesFrequentes } from './domain/historico.js';
import { calcularEconomia, criarIndiceHistorico } from './domain/economia.js';
import { contarNoCarrinho, estaNoCarrinho } from './domain/lista.js';
import { criarSessaoPlanejando, estaComprando, iniciarCompra, normalizarSessao } from './domain/sessao.js';

import { iniciarTema } from './components/temaToggle.js';
import { renderizarResumo } from './components/resumo.js';
import { renderizarBarraAcao } from './components/barraAcao.js';
import { renderizarLista } from './components/listaItens.js';
import { renderizarHistorico } from './components/historico.js';
import { renderizarComparativo } from './components/comparativo.js';
import { iniciarFormItem, renderizarSugestoes } from './components/formItem.js';
import { iniciarSheetMercado } from './components/sheetMercado.js';
import { iniciarSheetPreco } from './components/sheetPreco.js';
import { MODOS, iniciarReaproveitarLista } from './components/reaproveitarLista.js';

const $ = (seletor) => document.querySelector(seletor);

const elementos = {
  resumo: $('#resumo'),
  secaoForm: $('#secao-form'),
  formItem: $('#form-item'),
  previa: $('#previa'),
  sugestoes: $('#sugestoes'),
  sugestoesBloco: $('#sugestoes-bloco'),
  tituloLista: $('#titulo-lista'),
  lista: $('#lista'),
  usarAnterior: $('#usar-anterior'),
  barraAcao: $('#barra-acao'),
  comparativo: $('#comparativo'),
  historico: $('#historico'),
  contadorHistorico: $('#contador-historico'),
};

/* ---------- Estado: tudo muda por atualizarEstado ---------- */
const estado = {
  itens: carregarItens().map(normalizarItem),
  registros: carregarHistorico(),
  sessao: normalizarSessao(carregarSessao()),
};

function atualizarEstado(parcial) {
  Object.assign(estado, parcial);
  salvarItens(estado.itens);
  salvarHistorico(estado.registros);
  salvarSessao(estado.sessao);
  renderizar();
}

const atualizarItem = (id, mudancas) =>
  atualizarEstado({ itens: estado.itens.map((item) => (item.id === id ? { ...item, ...mudancas } : item)) });

const buscarItem = (id) => estado.itens.find((item) => item.id === id);

/* ---------- Ações da lista ---------- */
function adicionarItem(dados) {
  atualizarEstado({ itens: [...estado.itens, criarItem(dados)] });
}

function removerItem(id) {
  atualizarEstado({ itens: estado.itens.filter((item) => item.id !== id) });
}

function alternarCarrinho(id) {
  const item = buscarItem(id);
  if (estaNoCarrinho(item)) return atualizarItem(id, { compra: null });
  // Sem estimativa não dá para assumir o preço: pergunta quanto custou.
  if (item.preco === null) return sheetPreco.abrir(item);
  atualizarItem(id, { compra: { preco: item.preco, quantidade: item.quantidade } });
}

const registrarPreco = (id) => sheetPreco.abrir(buscarItem(id));

/* ---------- Fluxo da compra ---------- */
const comecarCompra = () => sheetMercado.abrir(listarMercadosRecentes(estado.registros));

const voltarAPlanejar = () => atualizarEstado({ sessao: criarSessaoPlanejando() });

function finalizarCompra() {
  const noCarrinho = estado.itens.filter(estaNoCarrinho);
  if (noCarrinho.length === 0) {
    alert('Coloque pelo menos um item no carrinho antes de finalizar.');
    return;
  }

  const restantes = estado.itens.filter((item) => !estaNoCarrinho(item));
  if (restantes.length > 0 && !confirm(`${restantes.length} item(ns) ficaram fora do carrinho e continuarão na lista. Finalizar mesmo assim?`)) {
    return;
  }

  const economia = calcularEconomia(estado.itens, criarIndiceHistorico(estado.registros));
  const registro = criarRegistroHistorico(noCarrinho, { mercado: estado.sessao.mercado, inicio: estado.sessao.inicio, economia });

  atualizarEstado({
    registros: [...estado.registros, registro],
    itens: restantes,
    sessao: criarSessaoPlanejando(),
  });
}

/* ---------- Histórico ---------- */
function excluirRegistro(id) {
  if (!confirm('Excluir esta lista salva?')) return;
  atualizarEstado({ registros: estado.registros.filter((registro) => registro.id !== id) });
}

function aplicarListaCopiada({ itens, modo }) {
  const substituir = modo === MODOS.SUBSTITUIR;
  atualizarEstado({ itens: substituir ? itens : [...estado.itens, ...itens] });
}

/* ---------- Renderização ---------- */
function renderizar() {
  const comprando = estaComprando(estado.sessao);
  const indiceHistorico = criarIndiceHistorico(estado.registros);
  const economia = calcularEconomia(estado.itens, indiceHistorico);

  renderizarResumo(elementos.resumo, { itens: estado.itens, sessao: estado.sessao, comprando, economia });
  renderizarBarraAcao(elementos.barraAcao, {
    comprando,
    temItens: estado.itens.length > 0,
    aoComecar: comecarCompra,
    aoFinalizar: finalizarCompra,
    aoVoltar: voltarAPlanejar,
  });

  elementos.secaoForm.classList.toggle('hidden', comprando);
  elementos.tituloLista.textContent = comprando
    ? `No mercado · ${contarNoCarrinho(estado.itens)}/${estado.itens.length}`
    : 'Lista atual';

  renderizarLista(elementos.lista, {
    itens: estado.itens,
    comprando,
    indiceHistorico,
    acoes: { remover: removerItem, alternarCarrinho, registrarPreco },
  });

  renderizarSugestoes(elementos.sugestoes, elementos.sugestoesBloco, listarSugestoesFrequentes(estado.registros), (s) => formItem.preencher(s));
  renderizarComparativo(elementos.comparativo, calcularComparativoMensal(estado.registros));
  renderizarHistorico(elementos.historico, elementos.contadorHistorico, estado.registros, {
    copiar: (id) => reaproveitar.abrir(id),
    excluir: excluirRegistro,
  });
}

/* ---------- Inicialização ---------- */
iniciarTema({ botao: $('#alternar-tema'), icone: $('#icone-tema') });

const formItem = iniciarFormItem({ formulario: elementos.formItem, previa: elementos.previa, aoAdicionar: adicionarItem });

const sheetMercado = iniciarSheetMercado({
  dialog: $('#sheet-mercado'),
  aoConfirmar: (mercado) => atualizarEstado({ sessao: iniciarCompra(mercado) }),
});

const sheetPreco = iniciarSheetPreco({
  dialog: $('#sheet-preco'),
  aoConfirmar: (id, compra) => atualizarItem(id, { compra }),
  aoRemoverDoCarrinho: (id) => atualizarItem(id, { compra: null }),
});

const reaproveitar = iniciarReaproveitarLista({
  dialog: $('#sheet-reaproveitar'),
  obterRegistros: () => estado.registros,
  aoConfirmar: aplicarListaCopiada,
});

elementos.usarAnterior.addEventListener('click', () => reaproveitar.abrir());

renderizar();
