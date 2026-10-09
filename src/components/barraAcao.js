import { criarElemento, icone } from '../utils/dom.js';

/** Botões fixos no rodapé: mudam conforme a fase da lista. */
export function renderizarBarraAcao(container, { comprando, temItens, aoComecar, aoFinalizar, aoVoltar }) {
  if (!comprando) {
    container.replaceChildren(
      criarElemento(
        'button',
        { classe: 'btn btn-primary w-full', atributos: { type: 'button', disabled: !temItens }, aoClicar: aoComecar },
        icone('shopping_cart_checkout'),
        'Começar compra',
      ),
    );
    return;
  }

  container.replaceChildren(
    criarElemento(
      'button',
      { classe: 'btn btn-ghost', atributos: { type: 'button' }, aoClicar: aoVoltar },
      icone('edit_note'),
      'Voltar a planejar',
    ),
    criarElemento(
      'button',
      { classe: 'btn btn-primary flex-1', atributos: { type: 'button' }, aoClicar: aoFinalizar },
      icone('check_circle'),
      'Finalizar e salvar',
    ),
  );
}
