import { gerarId } from '../../utils/id.js';
import { CHURRASCO } from './churrasco.js';

/** Tipos de evento conhecidos. Para criar um novo tipo, descreva as regras e registre aqui. */
export const TIPOS = { [CHURRASCO.tipo]: CHURRASCO };

export const obterDefinicao = (tipo) => TIPOS[tipo];

/**
 * Um evento.
 * - convidados: { [id do tipo de convidado]: quantidade }
 * - cortes: carnes que já existem em casa, sempre em gramas
 * - corteFaltante: nome do corte que será comprado para completar a carne
 * - ajustes: mudanças feitas à mão sobre o cálculo, por item: { quantidade?, emCasa? }
 */
export function criarEvento(tipo, agora = new Date()) {
  const definicao = TIPOS[tipo];
  return {
    id: gerarId(),
    tipo,
    nome: definicao.rotulo,
    data: '',
    duracao: definicao.duracaoPadrao,
    convidados: { ...definicao.convidadosPadrao },
    cortes: [],
    corteFaltante: '',
    ajustes: {},
    criadoEm: agora.toISOString(),
  };
}

/** Garante o formato atual em eventos salvos. Tipo desconhecido vira null (e é descartado). */
export function normalizarEvento(bruto) {
  const definicao = TIPOS[bruto?.tipo];
  if (!definicao) return null;

  const { id: _id, ...padrao } = criarEvento(bruto.tipo);
  return {
    ...padrao,
    ...bruto,
    convidados: { ...definicao.convidadosPadrao, ...bruto.convidados },
    cortes: bruto.cortes ?? [],
    ajustes: bruto.ajustes ?? {},
  };
}

/**
 * Muda duração ou convidados. As quantidades ajustadas à mão voltam ao cálculo
 * (senão ficariam velhas para o novo público); só "já tenho" é mantido.
 */
export function alterarConfiguracao(evento, { duracao = evento.duracao, convidados = evento.convidados }) {
  const ajustes = Object.fromEntries(
    Object.entries(evento.ajustes)
      .filter(([, ajuste]) => ajuste.emCasa)
      .map(([id, ajuste]) => [id, { emCasa: true }]),
  );
  return { ...evento, duracao, convidados, ajustes };
}

export const ajustarItem = (evento, idItem, parcial) => ({
  ...evento,
  ajustes: { ...evento.ajustes, [idItem]: { ...evento.ajustes[idItem], ...parcial } },
});

export const adicionarCorte = (evento, { nome, gramas }) => ({
  ...evento,
  cortes: [...evento.cortes, { id: gerarId(), nome: nome.trim(), gramas }],
});

export const removerCorte = (evento, idCorte) => ({ ...evento, cortes: evento.cortes.filter((corte) => corte.id !== idCorte) });
