import './style.css';
import { registerSW } from 'virtual:pwa-register';

import {
  carregarHistorico,
  carregarItens,
  carregarPreferencias,
  carregarSessao,
  salvarHistorico,
  salvarItens,
  salvarPreferencias,
  salvarSessao,
} from './services/storage.js';
import { chaveDoItem, criarItem, normalizarItem } from './domain/item.js';
import {
  buscarSugestao,
  calcularComparativoMensal,
  criarRegistroHistorico,
  listarItensConhecidos,
  listarMercadosRecentes,
  listarSugestoesFrequentes,
  ordenarRegistrosRecentes,
} from './domain/historico.js';
import { calcularEconomia, criarIndiceHistorico, calcularCustoBeneficio } from './domain/economia.js';
import { contarNoCarrinho, encontrarDuplicado, estaNoCarrinho, somarQuantidade } from './domain/lista.js';
import { criarSessaoPlanejando, estaComprando, iniciarCompra, normalizarSessao } from './domain/sessao.js';
import { manterTelaLigada } from './utils/telaLigada.js';
import { vibrar } from './utils/vibracao.js';

import { iniciarTema } from './components/temaToggle.js';
import { iniciarToast, mostrarToast } from './components/toast.js';
import { iniciarStatusConexao } from './components/statusConexao.js';
import { iniciarBannerInstalar } from './components/bannerInstalar.js';
import { iniciarRelogio, renderizarResumo } from './components/resumo.js';
import { renderizarBarraAcao } from './components/barraAcao.js';
import { renderizarHeroVazio } from './components/heroVazio.js';
import { renderizarLista } from './components/listaItens.js';
import { renderizarHistorico } from './components/historico.js';
import { renderizarComparativo } from './components/comparativo.js';
import { iniciarFormItem, renderizarSugestoes } from './components/formItem.js';
import { mostrarAvisoDuplicado, ocultarAvisoDuplicado } from './components/avisoDuplicado.js';
import { iniciarSheetMercado } from './components/sheetMercado.js';
import { iniciarSheetEditarItem } from './components/sheetEditarItem.js';
import { iniciarSheetFinalizar } from './components/sheetFinalizar.js';
import { MODOS, iniciarReaproveitarLista } from './components/reaproveitarLista.js';

const $ = (seletor) => document.querySelector(seletor);

const elementos = {
  resumo: $('#resumo'),
  heroVazio: $('#hero-vazio'),
  secaoForm: $('#secao-form'),
  tituloForm: $('#titulo-form'),
  formItem: $('#form-item'),
  avisoDuplicado: $('#aviso-duplicado'),
  sugestoes: $('#sugestoes'),
  sugestoesBloco: $('#sugestoes-bloco'),
  secaoLista: $('#secao-lista'),
  tituloLista: $('#titulo-lista'),
  lista: $('#lista'),
  usarAnterior: $('#usar-anterior'),
  alternarAgrupar: $('#alternar-agrupar'),
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
  preferencias: carregarPreferencias(),
  // Só existe na tela: se o usuário já escolheu "planejar com calma"
  planejando: false,
};

let renderizacaoAgendada = false;

/**
 * A tela é redesenhada logo após o evento atual terminar. Assim, um campo que perde o foco
 * (e dispara "change") não provoca um redesenho no meio de outro redesenho.
 */
function agendarRenderizacao() {
  if (renderizacaoAgendada) return;
  renderizacaoAgendada = true;
  queueMicrotask(() => {
    renderizacaoAgendada = false;
    renderizar();
  });
}

function atualizarEstado(parcial) {
  Object.assign(estado, parcial);
  salvarItens(estado.itens);
  salvarHistorico(estado.registros);
  salvarSessao(estado.sessao);
  salvarPreferencias(estado.preferencias);
  agendarRenderizacao();
}

/** Aplica a mudança e oferece "Desfazer" por alguns segundos, sem pedir confirmação. */
function aplicarComDesfazer(mensagem, parcial) {
  const anterior = { itens: estado.itens, registros: estado.registros, sessao: estado.sessao };
  atualizarEstado(parcial);
  mostrarToast({ mensagem, rotuloAcao: 'Desfazer', aoAcao: () => atualizarEstado(anterior) });
}

const buscarItem = (id) => estado.itens.find((item) => item.id === id);
const trocarItem = (id, trocar) => estado.itens.map((item) => (item.id === id ? trocar(item) : item));
const comprando = () => estaComprando(estado.sessao);

/* ---------- Adicionar itens ---------- */
function criarItemDaEntrada(dados) {
  const item = criarItem(dados);
  // No mercado, informar o preço já coloca o item no carrinho.
  if (comprando() && dados.preco !== null) item.compra = { preco: dados.preco, quantidade: dados.quantidade };
  return item;
}

function adicionarItem(dados) {
  atualizarEstado({ itens: [...estado.itens, criarItemDaEntrada(dados)] });
  ocultarAvisoDuplicado(elementos.avisoDuplicado);
  formItem.limpar();
  if (comprando()) vibrar();
}

function somarAoExistente(existente, quantidade) {
  atualizarEstado({ itens: trocarItem(existente.id, (item) => somarQuantidade(item, quantidade)) });
  ocultarAvisoDuplicado(elementos.avisoDuplicado);
  formItem.limpar();
  if (comprando()) vibrar();
}

function tentarAdicionar(dados) {
  const existente = encontrarDuplicado(estado.itens, dados);
  if (!existente) return adicionarItem(dados);

  const quantidadeAtual = estaNoCarrinho(existente) ? existente.compra.quantidade : existente.quantidade;
  mostrarAvisoDuplicado(elementos.avisoDuplicado, {
    nome: existente.nome,
    quantidadeTotal: quantidadeAtual + dados.quantidade,
    aoSomar: () => somarAoExistente(existente, dados.quantidade),
    aoManterSeparado: () => adicionarItem(dados),
  });
}

function adicionarSugestao({ nome, marca, preco, peso, unidade, categoria }) {
  tentarAdicionar({ nome, marca: marca ?? '', preco: preco ?? null, quantidade: 1, peso: peso ?? null, unidade: unidade ?? 'g', categoria: categoria ?? '' });
}

/* ---------- Ações das linhas ---------- */
function alterarQuantidade(id, quantidade) {
  atualizarEstado({
    itens: trocarItem(id, (item) => (estaNoCarrinho(item) ? { ...item, compra: { ...item.compra, quantidade } } : { ...item, quantidade })),
  });
}

function pegar(id, preco) {
  const item = buscarItem(id);
  atualizarEstado({ itens: trocarItem(id, (atual) => ({ ...atual, compra: { preco, quantidade: atual.quantidade } })) });
  vibrar();
  return item;
}

function alternarCarrinho(id) {
  const item = buscarItem(id);

  if (estaNoCarrinho(item)) {
    aplicarComDesfazer(`"${item.nome}" saiu do carrinho`, { itens: trocarItem(id, (atual) => ({ ...atual, compra: null })) });
  } else if (item.preco !== null) {
    pegar(id, item.preco);
  } else {
    // Sem preço, não dá para assumir: leva direto ao campo para digitar.
    document.querySelector(`[data-preco-id="${id}"]`)?.focus();
  }
}

const alterarPrecoCompra = (id, preco) =>
  atualizarEstado({ itens: trocarItem(id, (item) => ({ ...item, compra: { ...item.compra, preco } })) });

const removerItem = (id) => {
  const item = buscarItem(id);
  aplicarComDesfazer(`"${item.nome}" removido`, { itens: estado.itens.filter((atual) => atual.id !== id) });
};

function salvarEdicao(id, { preco, quantidade, ...resto }) {
  atualizarEstado({
    itens: trocarItem(id, (item) =>
      estaNoCarrinho(item)
        ? { ...item, ...resto, compra: { preco: preco ?? item.compra.preco, quantidade } }
        : { ...item, ...resto, preco, quantidade },
    ),
  });
}

/* ---------- Fluxo da compra ---------- */
const comecarCompra = () => sheetMercado.abrir(listarMercadosRecentes(estado.registros));

const voltarAPlanejar = () => atualizarEstado({ sessao: criarSessaoPlanejando() });

const abrirFinalizacao = () => {
  const economia = calcularEconomia(estado.itens, criarIndiceHistorico(estado.registros));
  sheetFinalizar.abrir({ itens: estado.itens, sessao: estado.sessao, economia });
};

function finalizarCompra() {
  const noCarrinho = estado.itens.filter(estaNoCarrinho);
  if (noCarrinho.length === 0) return;

  const economia = calcularEconomia(estado.itens, criarIndiceHistorico(estado.registros));
  const registro = criarRegistroHistorico(noCarrinho, { mercado: estado.sessao.mercado, inicio: estado.sessao.inicio, economia });

  atualizarEstado({
    registros: [...estado.registros, registro],
    itens: estado.itens.filter((item) => !estaNoCarrinho(item)),
    sessao: criarSessaoPlanejando(),
  });
  vibrar([30, 40, 30]);
  mostrarToast({ mensagem: 'Compra salva no histórico' });
}

/* ---------- Histórico ---------- */
const excluirRegistro = (id) =>
  aplicarComDesfazer('Lista salva excluída', { registros: estado.registros.filter((registro) => registro.id !== id) });

function aplicarListaCopiada({ itens, modo }) {
  const substituir = modo === MODOS.SUBSTITUIR;
  atualizarEstado({ itens: substituir ? itens : [...estado.itens, ...itens], planejando: true });
}

/* ---------- Renderização ---------- */
let faseAnterior = null;

function renderizar() {
  const emCompra = comprando();
  const indiceHistorico = criarIndiceHistorico(estado.registros);
  const economia = calcularEconomia(estado.itens, indiceHistorico);
  const ultimoRegistro = ordenarRegistrosRecentes(estado.registros)[0];
  const mostrarHero = !emCompra && estado.itens.length === 0 && !estado.planejando;

  renderizarResumo(elementos.resumo, { itens: estado.itens, sessao: estado.sessao, comprando: emCompra, economia });
  renderizarHeroVazio(elementos.heroVazio, {
    visivel: mostrarHero,
    ultimoRegistro,
    aoComecarNoMercado: comecarCompra,
    aoPlanejar: () => atualizarEstado({ planejando: true }),
    aoUsarUltima: () => reaproveitar.abrir(ultimoRegistro.id),
  });
  renderizarBarraAcao(elementos.barraAcao, {
    comprando: emCompra,
    visivel: !mostrarHero,
    aoComecar: comecarCompra,
    aoFinalizar: abrirFinalizacao,
    aoVoltar: voltarAPlanejar,
  });

  elementos.secaoForm.classList.toggle('hidden', mostrarHero);
  elementos.secaoLista.classList.toggle('hidden', mostrarHero);
  elementos.tituloForm.textContent = emCompra ? 'Adição rápida no corredor' : 'Novo item';
  elementos.tituloLista.textContent = emCompra ? `No mercado · ${contarNoCarrinho(estado.itens)}/${estado.itens.length}` : 'Lista atual';
  elementos.alternarAgrupar.checked = Boolean(estado.preferencias.agrupar);
  formItem.definirModo(emCompra);

  renderizarLista(elementos.lista, {
    itens: estado.itens,
    comprando: emCompra,
    agrupar: Boolean(estado.preferencias.agrupar),
    indiceHistorico,
    acoes: { alterarQuantidade, alternarCarrinho, alterarPrecoCompra, pegar, editar: (id) => sheetEditar.abrir(buscarItem(id)), remover: removerItem },
  });

  const naLista = new Set(estado.itens.map(chaveDoItem));
  renderizarSugestoes(
    elementos.sugestoes,
    elementos.sugestoesBloco,
    listarSugestoesFrequentes(estado.registros).filter((sugestao) => !naLista.has(chaveDoItem(sugestao))),
    adicionarSugestao,
  );
  renderizarComparativo(elementos.comparativo, calcularComparativoMensal(estado.registros));
  renderizarHistorico(elementos.historico, elementos.contadorHistorico, estado.registros, {
    copiar: (id) => reaproveitar.abrir(id),
    excluir: excluirRegistro,
  });

  if (faseAnterior !== emCompra) {
    manterTelaLigada(emCompra);
    faseAnterior = emCompra;
  }
}

/* ---------- Inicialização ---------- */
iniciarTema({ botao: $('#alternar-tema'), icone: $('#icone-tema') });
iniciarToast($('#toast'));
iniciarStatusConexao($('#status-offline'));
iniciarRelogio();

iniciarBannerInstalar({
  container: $('#banner-instalar'),
  dispensado: Boolean(estado.preferencias.bannerDispensado),
  aoDispensar: () => atualizarEstado({ preferencias: { ...estado.preferencias, bannerDispensado: true } }),
});

registerSW({ immediate: true, onOfflineReady: () => mostrarToast({ mensagem: 'Pronto: o app já funciona sem internet', duracao: 4000 }) });

// O navegador pode soltar a trava de tela ao trocar de aba: pedimos de novo ao voltar.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') manterTelaLigada(comprando());
});

const conhecidos = () => listarItensConhecidos(estado.registros);

const formItem = iniciarFormItem({
  formulario: elementos.formItem,
  aoAdicionar: tentarAdicionar,
  aoDigitar: () => ocultarAvisoDuplicado(elementos.avisoDuplicado),
  buscarSugestao: (texto) => buscarSugestao(conhecidos(), texto),
});

const sheetMercado = iniciarSheetMercado({
  dialog: $('#sheet-mercado'),
  aoConfirmar: (mercado) => atualizarEstado({ sessao: iniciarCompra(mercado), planejando: true }),
});

const sheetEditar = iniciarSheetEditarItem({
  dialog: $('#sheet-editar'),
  aoSalvar: salvarEdicao,
  aoExcluir: removerItem,
  obterCustoBeneficio: (item) => calcularCustoBeneficio(item, criarIndiceHistorico(estado.registros)),
});

const sheetFinalizar = iniciarSheetFinalizar({ dialog: $('#sheet-finalizar'), aoConfirmar: finalizarCompra });

const reaproveitar = iniciarReaproveitarLista({
  dialog: $('#sheet-reaproveitar'),
  obterRegistros: () => estado.registros,
  aoConfirmar: aplicarListaCopiada,
});

elementos.usarAnterior.addEventListener('click', () => reaproveitar.abrir());
elementos.alternarAgrupar.addEventListener('change', () =>
  atualizarEstado({ preferencias: { ...estado.preferencias, agrupar: elementos.alternarAgrupar.checked } }),
);

renderizar();
