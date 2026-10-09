export const FASES = {
  PLANEJANDO: 'planejando',
  COMPRANDO: 'comprando',
};

export const criarSessaoPlanejando = () => ({ fase: FASES.PLANEJANDO, mercado: '', inicio: null });

export const iniciarCompra = (mercado, agora = new Date()) => ({
  fase: FASES.COMPRANDO,
  mercado: mercado.trim(),
  inicio: agora.toISOString(),
});

export const estaComprando = (sessao) => sessao.fase === FASES.COMPRANDO;

export function normalizarSessao(bruta) {
  return { ...criarSessaoPlanejando(), ...bruta };
}
