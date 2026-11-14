import { arredondar } from '../../utils/numero.js';

/** Arredonda para cima, no múltiplo de `passo` (tolerando imprecisão de decimais). */
const arredondarParaCima = (valor, passo) => arredondar(Math.ceil(valor / passo - 1e-9) * passo);

const somar = (valores) => valores.reduce((total, valor) => total + valor, 0);

/**
 * Calculadora genérica: lê a descrição do tipo de evento (ex.: churrasco.js) e devolve
 * a meta de carne e as quantidades de cada item. Não conhece tela nem armazenamento.
 */
export function calcularEvento(evento, definicao) {
  const { duracao, convidados, cortes, ajustes } = evento;

  const cabecas = somar(definicao.convidados.map(({ id }) => convidados[id] ?? 0));
  const equivalentes = somar(definicao.convidados.map(({ id, fator }) => (convidados[id] ?? 0) * fator));

  const meta = arredondarParaCima(equivalentes * definicao.carne.gramasPorPessoa[duracao], definicao.carne.passo);
  const tenho = somar(cortes.map((corte) => corte.gramas));

  const itens = definicao.itens.map(({ id, nome, categoria, unidade, passo, base, porPessoa }) => {
    const pessoas = base === 'cabecas' ? cabecas : equivalentes;
    const calculada = arredondarParaCima(pessoas * porPessoa[duracao], passo);
    return {
      id,
      nome,
      categoria,
      unidade,
      passo,
      calculada,
      quantidade: ajustes[id]?.quantidade ?? calculada,
      emCasa: Boolean(ajustes[id]?.emCasa),
    };
  });

  return {
    cabecas,
    equivalentes,
    carne: { meta, tenho, faltam: Math.max(0, meta - tenho), excesso: Math.max(0, tenho - meta) },
    itens,
  };
}
