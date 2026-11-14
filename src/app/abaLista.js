import { chaveDoItem, criarItem } from '../domain/item.js';
import {
  buscarSugestao,
  calcularComparativoMensal,
  criarRegistroHistorico,
  listarItensConhecidos,
  listarMercadosRecentes,
  listarSugestoesFrequentes,
  ordenarRegistrosRecentes,
} from '../domain/historico.js';
import { calcularEconomia, calcularCustoBeneficio, criarIndiceHistorico } from '../domain/economia.js';
import { contarNoCarrinho, encontrarDuplicado, estaNoCarrinho, somarQuantidade } from '../domain/lista.js';
import { criarSessaoPlanejando, estaComprando, iniciarCompra } from '../domain/sessao.js';
import { UNIDADE_PADRAO } from '../utils/calculos.js';
import { memorizar } from '../utils/memorizar.js';
import { manterTelaLigada } from '../utils/telaLigada.js';
import { vibrar } from '../utils/vibracao.js';

import { mostrarToast } from '../components/toast.js';
import { renderizarResumo } from '../components/resumo.js';
import { renderizarBarraAcao } from '../components/barraAcao.js';
import { renderizarHeroVazio } from '../components/heroVazio.js';
import { renderizarLista } from '../components/listaItens.js';
import { renderizarHistorico } from '../components/historico.js';
import { renderizarComparativo } from '../components/comparativo.js';
import { iniciarFormItem, renderizarSugestoes } from '../components/formItem.js';
import { mostrarAvisoDuplicado, ocultarAvisoDuplicado } from '../components/avisoDuplicado.js';
import { iniciarSheetMercado } from '../components/sheetMercado.js';
import { iniciarSheetEditarItem } from '../components/sheetEditarItem.js';
import { iniciarSheetFinalizar } from '../components/sheetFinalizar.js';
import { MODOS, iniciarReaproveitarLista } from '../components/reaproveitarLista.js';

import { aplicarComDesfazer } from './desfazer.js';
import { aoAtualizar, atualizarEstado, estado } from './store.js';

const $ = (seletor) => document.querySelector(seletor);

// Cálculos sobre o histórico: só refeitos quando o histórico muda (e não a cada toque na lista).
const indiceDoHistorico = memorizar(criarIndiceHistorico);
const registroMaisRecente = memorizar((registros) => ordenarRegistrosRecentes(registros)[0]);
const comparativoMensal = memorizar(calcularComparativoMensal);
const sugestoesFrequentes = memorizar((registros) => listarSugestoesFrequentes(registros));
const itensConhecidos = memorizar(listarItensConhecidos);
const mercadosRecentes = memorizar((registros) => listarMercadosRecentes(registros));

const comprando = () => estaComprando(estado.sessao);
const buscarItem = (id) => estado.itens.find((item) => item.id === id);
const trocarItem = (id, trocar) => estado.itens.map((item) => (item.id === id ? trocar(item) : item));

/** Aba Lista: planejar em casa, comprar no mercado e consultar o histórico. */
export function iniciarAbaLista() {
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

  /* ---------- Adicionar itens ---------- */
  function criarItemDaEntrada(dados) {
    const item = criarItem(dados);
    // No mercado, informar o preço já coloca o item no carrinho.
    if (comprando() && dados.preco !== null) item.compra = { preco: dados.preco, quantidade: dados.quantidade };
    return item;
  }

  function depoisDeAdicionar() {
    ocultarAvisoDuplicado(elementos.avisoDuplicado);
    formItem.limpar();
    if (comprando()) vibrar();
  }

  function adicionarItem(dados) {
    atualizarEstado({ itens: [...estado.itens, criarItemDaEntrada(dados)] });
    depoisDeAdicionar();
  }

  function somarAoExistente(existente, quantidade) {
    atualizarEstado({ itens: trocarItem(existente.id, (item) => somarQuantidade(item, quantidade)) });
    depoisDeAdicionar();
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
    tentarAdicionar({
      nome,
      marca: marca ?? '',
      preco: preco ?? null,
      quantidade: 1,
      peso: peso ?? null,
      unidade: unidade ?? UNIDADE_PADRAO,
      categoria: categoria ?? '',
    });
  }

  /* ---------- Ações das linhas ---------- */
  function alterarQuantidade(id, quantidade) {
    atualizarEstado({
      itens: trocarItem(id, (item) => (estaNoCarrinho(item) ? { ...item, compra: { ...item.compra, quantidade } } : { ...item, quantidade })),
    });
  }

  function pegar(id, preco) {
    atualizarEstado({ itens: trocarItem(id, (atual) => ({ ...atual, compra: { preco, quantidade: atual.quantidade } })) });
    vibrar();
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
  const comecarCompra = () => sheetMercado.abrir(mercadosRecentes(estado.registros));

  const voltarAPlanejar = () => atualizarEstado({ sessao: criarSessaoPlanejando() });

  const abrirFinalizacao = () => {
    const economia = calcularEconomia(estado.itens, indiceDoHistorico(estado.registros));
    sheetFinalizar.abrir({ itens: estado.itens, sessao: estado.sessao, economia });
  };

  function finalizarCompra() {
    const noCarrinho = estado.itens.filter(estaNoCarrinho);
    if (noCarrinho.length === 0) return;

    const economia = calcularEconomia(estado.itens, indiceDoHistorico(estado.registros));
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
    const indiceHistorico = indiceDoHistorico(estado.registros);
    const economia = calcularEconomia(estado.itens, indiceHistorico);
    const ultimoRegistro = registroMaisRecente(estado.registros);
    const mostrarHero = !emCompra && estado.itens.length === 0 && !estado.planejando;
    const naAbaLista = estado.aba === 'lista';

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
      visivel: naAbaLista && (emCompra || !mostrarHero),
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
      sugestoesFrequentes(estado.registros).filter((sugestao) => !naLista.has(chaveDoItem(sugestao))),
      adicionarSugestao,
    );
    renderizarComparativo(elementos.comparativo, comparativoMensal(estado.registros));
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
  const formItem = iniciarFormItem({
    formulario: elementos.formItem,
    aoAdicionar: tentarAdicionar,
    aoDigitar: () => ocultarAvisoDuplicado(elementos.avisoDuplicado),
    buscarSugestao: (texto) => buscarSugestao(itensConhecidos(estado.registros), texto),
  });

  const sheetMercado = iniciarSheetMercado({
    dialog: $('#sheet-mercado'),
    aoConfirmar: (mercado) => atualizarEstado({ sessao: iniciarCompra(mercado), planejando: true }),
  });

  const sheetEditar = iniciarSheetEditarItem({
    dialog: $('#sheet-editar'),
    aoSalvar: salvarEdicao,
    aoExcluir: removerItem,
    obterCustoBeneficio: (item) => calcularCustoBeneficio(item, indiceDoHistorico(estado.registros)),
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

  // O navegador pode soltar a trava de tela ao trocar de aba: pedimos de novo ao voltar.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') manterTelaLigada(comprando());
  });

  aoAtualizar(renderizar);
  renderizar();
}
