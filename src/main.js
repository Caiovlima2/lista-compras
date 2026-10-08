import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './style.css';

import {
  carregarItens,
  salvarItens,
  carregarHistorico,
  salvarHistorico,
} from './services/storage.js';
import { criarItem } from './domain/item.js';
import { calcularTotal } from './domain/lista.js';
import { criarRegistroHistorico, calcularComparativoMensal } from './domain/historico.js';
import { iniciarFormItem } from './components/formItem.js';
import { iniciarReaproveitamento } from './components/reaproveitarLista.js';
import { renderListaItens } from './components/listaItens.js';
import { renderHistorico } from './components/historico.js';
import { renderComparativo } from './components/comparativo.js';
import { formatarPreco } from './utils/formatadores.js';

const elementos = {
  form: document.querySelector('#form-item'),
  lista: document.querySelector('#lista'),
  total: document.querySelector('#total'),
  salvarLista: document.querySelector('#salvar-lista'),
  comparativo: document.querySelector('#comparativo'),
  historico: document.querySelector('#historico'),
  modalReaproveitar: document.querySelector('#modal-reaproveitar'),
};

const estado = {
  itens: carregarItens(),
  registros: carregarHistorico(),
};

// ---------- Atualização da tela ----------

function atualizarLista() {
  renderListaItens(elementos.lista, estado.itens, { aoRemover: removerItem });
  elementos.total.textContent = `Total: ${formatarPreco(calcularTotal(estado.itens))}`;
}

function atualizarHistorico() {
  renderHistorico(elementos.historico, estado.registros, { aoExcluir: excluirRegistro });
  renderComparativo(elementos.comparativo, calcularComparativoMensal(estado.registros));
}

// ---------- Mudanças de estado (sempre salvam e redesenham) ----------

function definirItens(novosItens) {
  estado.itens = novosItens;
  salvarItens(novosItens);
  atualizarLista();
}

function definirRegistros(novosRegistros) {
  estado.registros = novosRegistros;
  salvarHistorico(novosRegistros);
  atualizarHistorico();
}

// ---------- Ações do usuário ----------

function adicionarItens(dadosDosItens) {
  definirItens([...estado.itens, ...dadosDosItens.map(criarItem)]);
}

function removerItem(id) {
  definirItens(estado.itens.filter((item) => item.id !== id));
}

function salvarListaAtual() {
  if (estado.itens.length === 0) {
    alert('A lista está vazia.');
    return;
  }

  definirRegistros([...estado.registros, criarRegistroHistorico(estado.itens)]);

  if (confirm('Lista salva no histórico! Deseja limpar a lista atual?')) {
    definirItens([]);
  }
}

function excluirRegistro(id) {
  if (!confirm('Excluir esta lista do histórico?')) return;
  definirRegistros(estado.registros.filter((registro) => registro.id !== id));
}

// ---------- Inicialização ----------

iniciarFormItem(elementos.form, { aoAdicionar: (dados) => adicionarItens([dados]) });
iniciarReaproveitamento(elementos.modalReaproveitar, {
  obterRegistros: () => estado.registros,
  aoConfirmar: adicionarItens,
});
elementos.salvarLista.addEventListener('click', salvarListaAtual);

atualizarLista();
atualizarHistorico();