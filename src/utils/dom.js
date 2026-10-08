/**
 * Cria um elemento do DOM de forma declarativa.
 * Usa textContent (nunca innerHTML), então não há risco de injetar HTML.
 */
export function criarElemento(tag, opcoes = {}, ...filhos) {
  const { classe, texto, atributos = {}, aoClicar } = opcoes;
  const elemento = document.createElement(tag);

  if (classe) elemento.className = classe;
  if (texto) elemento.textContent = texto;
  Object.entries(atributos).forEach(([nome, valor]) => elemento.setAttribute(nome, valor));
  if (aoClicar) elemento.addEventListener('click', aoClicar);
  elemento.append(...filhos.filter(Boolean));

  return elemento;
}