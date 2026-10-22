import { criarElemento, icone } from '../utils/dom.js';

let container = null;
let temporizador = null;

export function iniciarToast(elemento) {
  container = elemento;
}

export function esconderToast() {
  clearTimeout(temporizador);
  container?.replaceChildren();
}

/** Aviso temporário com ação opcional (ex.: "Desfazer"). Não bloqueia a tela. */
export function mostrarToast({ mensagem, rotuloAcao, aoAcao, duracao = 5000 }) {
  if (!container) return;
  clearTimeout(temporizador);

  container.replaceChildren(
    criarElemento(
      'div',
      {
        classe: 'mx-4 flex items-center gap-3 rounded-lg bg-on-surface px-4 py-3 text-body-md text-surface shadow-lg',
        atributos: { role: 'status' },
      },
      icone('info', 'text-xl'),
      criarElemento('p', { classe: 'min-w-0 flex-1', texto: mensagem }),
      rotuloAcao
        ? criarElemento('button', {
            classe: 'min-h-12 cursor-pointer px-2 text-label-lg text-primary-fixed',
            texto: rotuloAcao,
            atributos: { type: 'button' },
            aoClicar: () => {
              esconderToast();
              aoAcao?.();
            },
          })
        : null,
    ),
  );

  temporizador = setTimeout(esconderToast, duracao);
}
