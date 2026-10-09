import { criarElemento } from '../utils/dom.js';
import { abrirSheet, configurarFechamento } from './sheet.js';

/** Sheet "Onde você vai comprar?". O nome é opcional. */
export function iniciarSheetMercado({ dialog, aoConfirmar }) {
  const formulario = dialog.querySelector('#form-mercado');
  const campo = formulario.elements.mercado;
  const recentes = dialog.querySelector('#mercados-recentes');

  configurarFechamento(dialog);

  const confirmar = (nome) => {
    dialog.close();
    aoConfirmar(nome);
  };

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    confirmar(campo.value);
  });
  dialog.querySelector('#pular-mercado').addEventListener('click', () => confirmar(''));

  return {
    abrir(mercadosRecentes) {
      campo.value = '';
      recentes.replaceChildren(
        ...mercadosRecentes.map((nome) =>
          criarElemento('button', { classe: 'chip', texto: nome, atributos: { type: 'button' }, aoClicar: () => confirmar(nome) }),
        ),
      );
      abrirSheet(dialog);
      campo.focus();
    },
  };
}
