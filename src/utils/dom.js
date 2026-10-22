/**
 * Cria um elemento de forma segura (usa textContent, nunca innerHTML).
 * Filhos nulos/falsos são ignorados, o que facilita condicionais.
 */
export function criarElemento(tag, { classe, texto, atributos = {}, aoClicar } = {}, ...filhos) {
  const elemento = document.createElement(tag);

  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;

  Object.entries(atributos).forEach(([nome, valor]) => {
    if (valor === false || valor === null || valor === undefined) return;
    elemento.setAttribute(nome, valor === true ? '' : valor);
  });

  if (aoClicar) elemento.addEventListener('click', aoClicar);

  elemento.append(...filhos.flat().filter((filho) => filho !== null && filho !== undefined && filho !== false));
  return elemento;
}

/** Ícone do Material Symbols. */
export function icone(nome, classe = '') {
  return criarElemento('span', {
    classe: `material-symbols-outlined ${classe}`.trim(),
    texto: nome,
    atributos: { 'aria-hidden': 'true' },
  });
}

/**
 * Atualiza os filhos de um container reaproveitando os nós que já estão na posição certa.
 * Assim, campos que não mudaram mantêm o foco (e o teclado aberto) durante a renderização.
 */
export function sincronizarFilhos(container, novosFilhos) {
  novosFilhos.forEach((no, indice) => {
    if (container.children[indice] !== no) container.insertBefore(no, container.children[indice] ?? null);
  });
  while (container.children.length > novosFilhos.length) container.lastElementChild.remove();
}
