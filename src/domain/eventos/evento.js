import { gerarId } from '../../utils/id.js';
import { CHURRASCO } from './churrasco.js';

/** Tipos de evento conhecidos. Para criar um novo tipo, descreva as regras e registre aqui. */
export const TIPOS = { [CHURRASCO.tipo]: CHURRASCO };

export const obterDefinicao = (tipo) => TIPOS[tipo];

/**
 * Um evento.
 * - convidados: { [id do tipo de convidado]: quantidade }
 * - carnes: ids dos tipos de carne escolhidos (vermelha, frango...)
 * - cortes: carnes que já existem em casa: { id, nome, gramas, categoria (id do tipo de carne) }
 * - corteFaltante: { [id do tipo de carne]: nome do corte que será comprado para completar }
 * - complementos: ids dos complementos que o usuário marcou (pão de alho, arroz...)
 * - ajustes: mudanças feitas à mão sobre cada ingrediente: { quantidade?, emCasa? }
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
    carnes: [...definicao.carnesPadrao],
    cortes: [],
    corteFaltante: {},
    complementos: [],
    ajustes: {},
    criadoEm: agora.toISOString(),
  };
}

/** Garante o formato atual em eventos salvos. Tipo desconhecido vira null (e é descartado). */
export function normalizarEvento(bruto) {
  const definicao = TIPOS[bruto?.tipo];
  if (!definicao) return null;

  const { id: _id, ...padrao } = criarEvento(bruto.tipo);
  const tipoPadrao = definicao.carnesPadrao[0];
  return {
    ...padrao,
    ...bruto,
    convidados: { ...definicao.convidadosPadrao, ...bruto.convidados },
    // Eventos antigos: todo corte era "carne vermelha" e o corte faltante era um texto só.
    cortes: (bruto.cortes ?? []).map((corte) => ({ categoria: tipoPadrao, ...corte })),
    corteFaltante: typeof bruto.corteFaltante === 'string' ? { [tipoPadrao]: bruto.corteFaltante } : (bruto.corteFaltante ?? {}),
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

export const adicionarCorte = (evento, { nome, gramas, categoria }) => ({
  ...evento,
  cortes: [...evento.cortes, { id: gerarId(), nome: nome.trim(), gramas, categoria }],
});

const alternarEm = (lista, id) => (lista.includes(id) ? lista.filter((atual) => atual !== id) : [...lista, id]);

export const alternarCarne = (evento, idTipo) => ({ ...evento, carnes: alternarEm(evento.carnes, idTipo) });

export const alternarComplemento = (evento, idComplemento) => ({ ...evento, complementos: alternarEm(evento.complementos, idComplemento) });

export const alterarCorteFaltante = (evento, idTipo, nome) => ({ ...evento, corteFaltante: { ...evento.corteFaltante, [idTipo]: nome } });

export const removerCorte = (evento, idCorte) => ({ ...evento, cortes: evento.cortes.filter((corte) => corte.id !== idCorte) });
