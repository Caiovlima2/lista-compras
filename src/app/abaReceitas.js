import { criarItensDeOrigem } from '../domain/item.js';
import { separarRepetidos } from '../domain/lista.js';
import { criarReceita, duplicarReceita, listarItensDaReceita } from '../domain/receitas/receita.js';
import { criarElemento, icone } from '../utils/dom.js';

import { criarDetalheReceita } from '../components/receitas/detalheReceita.js';
import { criarEditorReceita } from '../components/receitas/editorReceita.js';
import { criarListaReceitas } from '../components/receitas/listaReceitas.js';
import { mostrarToast } from '../components/toast.js';

import { aplicarComDesfazer } from './desfazer.js';
import { aoAtualizar, atualizarEstado, estado } from './store.js';

const $ = (seletor) => document.querySelector(seletor);

const TELA_INICIAL = { aberta: null, modo: 'ver', porcoes: null, emCasa: {} };
const NOVA = 'nova';

const buscarReceita = (id) => estado.receitas.find((receita) => receita.id === id);

/** Aba Receitas: lista com busca, tela da receita (porções e lista de compras) e editor. */
export function iniciarAbaReceitas() {
  const raiz = $('#aba-receitas');
  const barra = $('#barra-receita');

  const lista = criarListaReceitas({ aoCriar: () => irPara({ aberta: NOVA, modo: 'editar' }), aoAbrir: (id) => irPara({ aberta: id, modo: 'ver' }) });
  let tela = null; // { chave, componente } da receita ou editor aberto

  const irPara = (parcial) => {
    atualizarEstado({ telaReceitas: { ...TELA_INICIAL, ...parcial } });
    window.scrollTo(0, 0);
  };
  const mudarTela = (parcial) => atualizarEstado({ telaReceitas: { ...estado.telaReceitas, ...parcial } });

  /* ---------- Ações ---------- */
  function salvar(dados) {
    const existente = buscarReceita(estado.telaReceitas.aberta);
    const campos = { nome: dados.nome, porcoes: dados.porcoes, anotacoes: dados.anotacoes, ingredientes: dados.ingredientes.filter((ingrediente) => ingrediente.nome.trim()) };

    if (existente) {
      atualizarEstado({ receitas: estado.receitas.map((receita) => (receita.id === existente.id ? { ...criarReceita(campos), id: existente.id, criadoEm: existente.criadoEm } : receita)) });
      irPara({ aberta: existente.id, modo: 'ver' });
      return;
    }

    const nova = criarReceita(campos);
    atualizarEstado({ receitas: [...estado.receitas, nova] });
    irPara({ aberta: nova.id, modo: 'ver' });
  }

  function duplicar(receita) {
    const copia = duplicarReceita(receita);
    aplicarComDesfazer(`"${copia.nome}" criada`, { receitas: [...estado.receitas, copia], telaReceitas: { ...TELA_INICIAL, aberta: copia.id } });
  }

  const excluir = (receita) =>
    aplicarComDesfazer(`"${receita.nome}" excluída`, { receitas: estado.receitas.filter((atual) => atual.id !== receita.id), telaReceitas: TELA_INICIAL });

  function enviarParaLista(receita, ingredientesEscalados) {
    const descricoes = listarItensDaReceita(ingredientesEscalados, estado.telaReceitas.emCasa);
    const { aAdicionar, repetidos } = separarRepetidos(estado.itens, criarItensDeOrigem(descricoes, { tipo: 'receita', nome: receita.nome }));

    if (aAdicionar.length === 0) {
      mostrarToast({ mensagem: 'Esses itens já estão na sua lista' });
      return;
    }
    const complemento = repetidos > 0 ? ` (${repetidos} já estavam na lista)` : '';
    aplicarComDesfazer(`${aAdicionar.length} ${aAdicionar.length === 1 ? 'item adicionado' : 'itens adicionados'} à lista${complemento}`, {
      itens: [...estado.itens, ...aAdicionar],
      planejando: true,
    });
  }

  /* ---------- Barra fixa da receita ---------- */
  function renderizarBarra(receita, ingredientesEscalados) {
    const quantidade = listarItensDaReceita(ingredientesEscalados, estado.telaReceitas.emCasa).length;
    barra.style.display = '';
    barra.replaceChildren(
      criarElemento('p', { classe: 'min-w-0 flex-1 text-label-lg', texto: `${quantidade} ${quantidade === 1 ? 'item' : 'itens'} a comprar` }),
      criarElemento('button', { classe: 'btn btn-primary shrink-0', atributos: { type: 'button', disabled: quantidade === 0 }, aoClicar: () => enviarParaLista(receita, ingredientesEscalados) }, icone('playlist_add'), 'Adicionar à lista'),
    );
  }

  /* ---------- Renderização ---------- */
  function mostrar(chave, criar) {
    if (tela?.chave !== chave) {
      tela = { chave, componente: criar() };
      raiz.replaceChildren(tela.componente.elemento);
    }
    return tela.componente;
  }

  function renderizar() {
    if (estado.aba !== 'receitas') {
      barra.style.display = 'none';
      return;
    }

    const { aberta, modo, porcoes, emCasa } = estado.telaReceitas;
    const receita = buscarReceita(aberta);

    // Receita que não existe mais (por exemplo, excluída): volta para a lista.
    if (aberta && aberta !== NOVA && !receita) {
      irPara({});
      return;
    }

    if (!aberta) {
      barra.style.display = 'none';
      mostrar('lista', () => lista).atualizar(estado.receitas);
      return;
    }

    if (modo === 'editar') {
      barra.style.display = ''; // o conteúdo da barra é do editor
      mostrar(`editar|${aberta}`, () =>
        criarEditorReceita({ receita, barra, acoes: { salvar, cancelar: () => irPara(receita ? { aberta, modo: 'ver' } : {}) } }),
      );
      return;
    }

    const detalhe = mostrar(`ver|${aberta}`, () =>
      criarDetalheReceita({
        receita,
        acoes: {
          voltar: () => irPara({}),
          editar: () => irPara({ aberta, modo: 'editar' }),
          duplicar: () => duplicar(receita),
          excluir: () => excluir(receita),
          alterarPorcoes: (valor) => mudarTela({ porcoes: valor }),
          alternarEmCasa: (id) => mudarTela({ emCasa: { ...estado.telaReceitas.emCasa, [id]: !estado.telaReceitas.emCasa[id] } }),
        },
      }),
    );
    renderizarBarra(receita, detalhe.atualizar({ porcoes: porcoes ?? receita.porcoes, emCasa }));
  }

  aoAtualizar(renderizar);
  renderizar();
}
