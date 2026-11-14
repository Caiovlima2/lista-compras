import { mostrarToast } from '../components/toast.js';
import { atualizarEstado, estado } from './store.js';

/** Aplica a mudança e oferece "Desfazer" por alguns segundos, sem pedir confirmação. */
export function aplicarComDesfazer(mensagem, parcial) {
  const anterior = { itens: estado.itens, registros: estado.registros, sessao: estado.sessao };
  atualizarEstado(parcial);
  mostrarToast({ mensagem, rotuloAcao: 'Desfazer', aoAcao: () => atualizarEstado(anterior) });
}
