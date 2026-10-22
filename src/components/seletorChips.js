import { criarElemento } from '../utils/dom.js';

/** Grupo de chips de escolha única (radios estilizados). Funciona dentro de <form> com FormData. */
export function renderizarChips(container, { nome, opcoes, valor = '', aoMudar }) {
  container.replaceChildren(
    ...opcoes.map(({ valor: valorOpcao, rotulo }) => {
      const radio = criarElemento('input', {
        classe: 'sr-only',
        atributos: { type: 'radio', name: nome, value: valorOpcao, checked: valorOpcao === valor },
      });
      radio.addEventListener('change', () => aoMudar?.(valorOpcao));

      return criarElemento(
        'label',
        { classe: 'chip has-checked:border-primary has-checked:bg-primary has-checked:text-on-primary has-focus-visible:outline-2 has-focus-visible:outline-primary' },
        radio,
        rotulo,
      );
    }),
  );
}

export function selecionarChip(container, valor) {
  container.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.checked = radio.value === valor;
  });
}

export const lerChip = (container) => container.querySelector('input[type="radio"]:checked')?.value ?? '';
