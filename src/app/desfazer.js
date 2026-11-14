import { mostrarToast } from '../components/toast.js';
import { atualizarEstado, estado } from './store.js';

/** Aplica a mudança e oferece "Desfazer" por alguns segundos, sem pedir confirmação. */
export function aplicarComDesfazer(mensagem, parcial) {
  // Guarda só as partes do estado que esta ação vai mudar.
  const anterior = Object.fromEntries(Object.keys(parcial).map((chave) => [chave, estado[chave]]));
  atualizarEstado(parcial);
  mostrarToast({ mensagem, rotuloAcao: 'Desfazer', aoAcao: () => atualizarEstado(anterior) });
}
