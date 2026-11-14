import { criarEventoDoTipo } from '../domain/eventos/tipos.js';
import { criarItensDeOrigem } from '../domain/item.js';
import { separarRepetidos } from '../domain/lista.js';
import { TIPO_MARMITAS } from '../domain/marmitas/marmitas.js';
import { criarElemento, icone } from '../utils/dom.js';

import { renderizarListaEventos } from '../components/eventos/listaEventos.js';
import { mostrarToast } from '../components/toast.js';

import { aplicarComDesfazer } from './desfazer.js';
import { montarChurrasco } from './eventos/churrascoUI.js';
import { montarMarmitas } from './eventos/marmitasUI.js';
import { aoAtualizar, atualizarEstado, estado } from './store.js';

const $ = (seletor) => document.querySelector(seletor);

/** Cada tipo de evento tem um "montar" que devolve { elemento, atualizar(evento) -> { itens, emCasa } }. */
const MONTADORES = { churrasco: montarChurrasco, [TIPO_MARMITAS]: montarMarmitas };

const eventoAberto = () => estado.eventos.find((evento) => evento.id === estado.eventoAberto) ?? null;

/** Aba Eventos: lista de eventos e, ao abrir um, o editor do tipo dele. */
export function iniciarAbaEventos() {
  const raiz = $('#aba-eventos');
  const barra = $('#barra-evento');

  let editor = null;
  let idDoEditor = null;
  let itensParaLista = [];

  /* ---------- Ações ---------- */
  const alterarAberto = (mudar) =>
    atualizarEstado({ eventos: estado.eventos.map((evento) => (evento.id === estado.eventoAberto ? mudar(evento) : evento)) });

  function criar(tipo) {
    const evento = criarEventoDoTipo(tipo);
    atualizarEstado({ eventos: [...estado.eventos, evento], eventoAberto: evento.id });
    window.scrollTo(0, 0);
  }

  function excluirAberto() {
    const evento = eventoAberto();
    aplicarComDesfazer(`"${evento.nome}" excluído`, {
      eventos: estado.eventos.filter((atual) => atual.id !== evento.id),
      eventoAberto: null,
    });
  }

  function enviarParaLista() {
    const evento = eventoAberto();
    const novos = criarItensDeOrigem(itensParaLista, { tipo: evento.tipo, nome: evento.nome });

    // Quem já está na lista (mesmo nome e marca) não é duplicado.
    const { aAdicionar, repetidos } = separarRepetidos(estado.itens, novos);
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

  /* ---------- Barra fixa com o botão "Adicionar à lista" ---------- */
  function renderizarBarra(quantidade, emCasa) {
    barra.style.display = '';
    barra.replaceChildren(
      criarElemento(
        'div',
        { classe: 'min-w-0 flex-1' },
        criarElemento('p', { classe: 'text-label-lg', texto: `${quantidade} ${quantidade === 1 ? 'item' : 'itens'} a comprar` }),
        criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: `${emCasa} já em casa` }),
      ),
      criarElemento(
        'button',
        { classe: 'btn btn-primary shrink-0', atributos: { type: 'button', disabled: quantidade === 0 }, aoClicar: enviarParaLista },
        icone('playlist_add'),
        'Adicionar à lista',
      ),
    );
  }

  /* ---------- Renderização ---------- */
  function renderizar() {
    if (estado.aba !== 'eventos') {
      barra.style.display = 'none';
      return;
    }

    const aberto = eventoAberto();
    if (!aberto) {
      editor = null;
      idDoEditor = null;
      barra.style.display = 'none';
      renderizarListaEventos(raiz, { eventos: estado.eventos, receitas: estado.receitas, aoCriar: criar, aoAbrir: (id) => atualizarEstado({ eventoAberto: id }) });
      return;
    }

    if (idDoEditor !== aberto.id) {
      editor = MONTADORES[aberto.tipo]({ evento: aberto, alterar: alterarAberto, voltar: () => atualizarEstado({ eventoAberto: null }), excluir: excluirAberto });
      idDoEditor = aberto.id;
      raiz.replaceChildren(editor.elemento);
    }

    const { itens, emCasa } = editor.atualizar(aberto);
    itensParaLista = itens;
    renderizarBarra(itens.length, emCasa);
  }

  aoAtualizar(renderizar);
  renderizar();
}
