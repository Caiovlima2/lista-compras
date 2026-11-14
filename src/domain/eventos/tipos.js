import { calcularEvento } from './calculadora.js';
import { criarEvento, normalizarEvento, obterDefinicao } from './evento.js';
import { TIPO_MARMITAS, criarPlanoMarmitas, normalizarPlanoMarmitas } from '../marmitas/marmitas.js';

/** Tipos de evento que o usuário pode criar, na ordem em que aparecem. */
export const TIPOS_DE_EVENTO = [
  { tipo: 'churrasco', rotulo: 'Churrasco', icone: 'outdoor_grill', descricao: 'Calcula carnes, acompanhamentos e bebidas pelo número de convidados.' },
  { tipo: TIPO_MARMITAS, rotulo: 'Marmitas da semana', icone: 'takeout_dining', descricao: 'Junta os ingredientes das suas receitas e calcula a feira da semana.' },
];

export const obterTipoDeEvento = (tipo) => TIPOS_DE_EVENTO.find((atual) => atual.tipo === tipo);

export const criarEventoDoTipo = (tipo) => (tipo === TIPO_MARMITAS ? criarPlanoMarmitas() : criarEvento(tipo));

/** Normaliza um evento salvo, seja de qual tipo for. Tipo desconhecido vira null. */
export function normalizarEventoSalvo(bruto) {
  if (bruto?.tipo === TIPO_MARMITAS) return normalizarPlanoMarmitas(bruto);
  return normalizarEvento(bruto);
}

const plural = (quantidade, singular, pluralTexto) => `${quantidade} ${quantidade === 1 ? singular : pluralTexto}`;

/** Texto e selo do cartão do evento na lista. `selo` é null quando não há o que destacar. */
export function resumirEvento(evento, receitas) {
  if (evento.tipo === TIPO_MARMITAS) {
    const existentes = evento.receitas.filter((entrada) => receitas.some((receita) => receita.id === entrada.receitaId)).length;
    return { detalhe: `${plural(evento.marmitas, 'marmita', 'marmitas')} · ${plural(existentes, 'receita', 'receitas')}`, selo: null };
  }

  const { carne, cabecas } = calcularEvento(evento, obterDefinicao(evento.tipo));
  const selo =
    carne.meta === 0
      ? { ok: false, texto: 'Defina convidados e carne' }
      : carne.faltam === 0
        ? { ok: true, texto: 'Carne completa' }
        : { ok: false, texto: 'Falta carne' };
  return { detalhe: plural(cabecas, 'pessoa', 'pessoas'), selo };
}
