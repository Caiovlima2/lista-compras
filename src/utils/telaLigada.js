let sentinela = null;

/** Impede a tela de apagar enquanto o modo mercado está ativo. */
export async function manterTelaLigada(ativo) {
  if (!('wakeLock' in navigator)) return;

  try {
    if (ativo && !sentinela) {
      sentinela = await navigator.wakeLock.request('screen');
      sentinela.addEventListener('release', () => {
        sentinela = null;
      });
    } else if (!ativo && sentinela) {
      await sentinela.release();
      sentinela = null;
    }
  } catch {
    /* o navegador pode negar (economia de bateria, aba em segundo plano) */
  }
}
