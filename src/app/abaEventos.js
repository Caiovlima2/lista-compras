import { calcularEvento } from '../domain/eventos/calculadora.js';
import {
  adicionarCorte,
  ajustarItem,
  alterarConfiguracao,
  criarEvento,
  obterDefinicao,
  removerCorte,
} from '../domain/eventos/evento.js';
import { criarItensDoEvento, listarItensDoEvento } from '../domain/eventos/paraLista.js';
import { encontrarDuplicado } from '../domain/lista.js';
import { criarElemento, icone } from '../utils/dom.js';

import { renderizarListaEventos } from '../components/eventos/listaEventos.js';
import { criarEditorEvento } from '../components/eventos/editorEvento.js';
import { mostrarToast } from '../components/toast.js';

import { aplicarComDesfazer } from './desfazer.js';
import { aoAtualizar, atualizarEstado, estado } from './store.js';

const $ = (seletor) => document.querySelector(seletor);

const eventoAberto = () => estado.eventos.find((evento) => evento.id === estado.eventoAberto) ?? null;

/** Aba Eventos: lista de eventos e, ao abrir um, o editor com a calculadora. */
export function iniciarAbaEventos() {
  const raiz = $('#aba-eventos');
  const barra = $('#barra-evento');

  let editor = null;
  let idDoEditor = null;

  /* ---------- Ações ---------- */
  const trocarEvento = (id, mudar) =>
    atualizarEstado({ eventos: estado.eventos.map((evento) => (evento.id === id ? mudar(evento) : evento)) });

  const alterarAberto = (mudar) => trocarEvento(estado.eventoAberto, mudar);

  function criar(tipo) {
    const evento = criarEvento(tipo);
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
    const calculo = calcularEvento(evento, obterDefinicao(evento.tipo));
    const novos = criarItensDoEvento(listarItensDoEvento(calculo, evento), evento);

    // Quem já está na lista (mesmo nome e marca) não é duplicado.
    const aAdicionar = novos.filter((item) => !encontrarDuplicado(estado.itens, item));
    const repetidos = novos.length - aAdicionar.length;
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

  const acoesDoEditor = {
    voltar: () => atualizarEstado({ eventoAberto: null }),
    excluir: excluirAberto,
    renomear: (nome) => alterarAberto((evento) => ({ ...evento, nome })),
    alterarData: (data) => alterarAberto((evento) => ({ ...evento, data })),
    alterarCorteFaltante: (corteFaltante) => alterarAberto((evento) => ({ ...evento, corteFaltante })),
    alterarDuracao: (duracao) => alterarAberto((evento) => alterarConfiguracao(evento, { duracao })),
    alterarConvidado: (id, quantidade) =>
      alterarAberto((evento) => alterarConfiguracao(evento, { convidados: { ...evento.convidados, [id]: quantidade } })),
    adicionarCorte: (corte) => alterarAberto((evento) => adicionarCorte(evento, corte)),
    removerCorte: (id) => alterarAberto((evento) => removerCorte(evento, id)),
    ajustarQuantidade: (id, quantidade) => alterarAberto((evento) => ajustarItem(evento, id, { quantidade })),
    alternarEmCasa: (id) => alterarAberto((evento) => ajustarItem(evento, id, { emCasa: !evento.ajustes[id]?.emCasa })),
  };

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
      renderizarListaEventos(raiz, { eventos: estado.eventos, aoCriar: criar, aoAbrir: (id) => atualizarEstado({ eventoAberto: id }) });
      return;
    }

    const definicao = obterDefinicao(aberto.tipo);
    if (idDoEditor !== aberto.id) {
      editor = criarEditorEvento({ definicao, acoes: acoesDoEditor });
      idDoEditor = aberto.id;
      raiz.replaceChildren(editor.elemento);
    }

    const calculo = calcularEvento(aberto, definicao);
    editor.atualizar({ evento: aberto, calculo });
    renderizarBarra(listarItensDoEvento(calculo, aberto).length, calculo.itens.filter((item) => item.emCasa).length);
  }

  aoAtualizar(renderizar);
  renderizar();
}
