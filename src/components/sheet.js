/** Fecha o <dialog> ao clicar no fundo escuro ou em qualquer [data-fechar]. */
export function configurarFechamento(dialog) {
  dialog.addEventListener('click', (evento) => {
    if (evento.target === dialog) dialog.close();
  });
  dialog.querySelectorAll('[data-fechar]').forEach((botao) => botao.addEventListener('click', () => dialog.close()));
}

export function abrirSheet(dialog) {
  if (!dialog.open) dialog.showModal();
}
