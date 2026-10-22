/** Feedback tátil curto (só funciona em aparelhos que suportam). */
export function vibrar(padrao = 15) {
  try {
    navigator.vibrate?.(padrao);
  } catch {
    /* sem suporte: ignora */
  }
}
