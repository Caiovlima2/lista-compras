/** Mostra um aviso discreto quando o aparelho está sem internet. O app continua funcionando. */
export function iniciarStatusConexao(elemento) {
  const atualizar = () => elemento.classList.toggle('hidden', navigator.onLine);
  addEventListener('online', atualizar);
  addEventListener('offline', atualizar);
  atualizar();
}
