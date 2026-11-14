import { arredondar } from '../../utils/numero.js';

/** Arredonda para cima, no múltiplo de `passo` (tolerando imprecisão de decimais). Nunca devolve -0. */
const arredondarParaCima = (valor, passo) => arredondar(Math.ceil(valor / passo - 1e-9) * passo) || 0;

const somar = (valores) => valores.reduce((total, valor) => total + valor, 0);

function calcularCarne({ evento, definicao, equivalentes }) {
  const { gramasPorPessoa, passo, tipos } = definicao.carne;
  const total = equivalentes * gramasPorPessoa[evento.duracao];
  const somaPesos = somar(tipos.filter((tipo) => evento.carnes.includes(tipo.id)).map((tipo) => tipo.peso));

  // A carne total se divide entre os tipos escolhidos, na proporção dos pesos.
  const porTipo = tipos.map(({ id, rotulo, icone, peso, nomePadrao }) => {
    const selecionado = evento.carnes.includes(id);
    const meta = selecionado ? arredondarParaCima((total * peso) / somaPesos, passo) : 0;
    const tenho = selecionado ? somar(evento.cortes.filter((corte) => corte.categoria === id).map((corte) => corte.gramas)) : 0;
    return { id, rotulo, icone, nomePadrao, selecionado, meta, tenho, faltam: Math.max(0, meta - tenho), excesso: Math.max(0, tenho - meta) };
  });

  return {
    meta: somar(porTipo.map((tipo) => tipo.meta)),
    tenho: somar(porTipo.map((tipo) => tipo.tenho)),
    faltam: somar(porTipo.map((tipo) => tipo.faltam)),
    excesso: somar(porTipo.map((tipo) => tipo.excesso)),
    tipos: porTipo,
  };
}

/**
 * Calculadora genérica: lê a descrição do tipo de evento (ex.: churrasco.js) e devolve
 * as metas de carne e as quantidades dos complementos. Não conhece tela nem armazenamento.
 */
export function calcularEvento(evento, definicao) {
  const { duracao, convidados, ajustes } = evento;

  const cabecas = somar(definicao.convidados.map(({ id }) => convidados[id] ?? 0));
  const equivalentes = somar(definicao.convidados.map(({ id, fator }) => (convidados[id] ?? 0) * fator));

  const complementos = definicao.complementos.map(({ id, nome, icone, grupo, ingredientes }) => ({
    id,
    nome,
    icone,
    grupo,
    selecionado: evento.complementos.includes(id),
    ingredientes: ingredientes.map(({ id: idIngrediente, nome: nomeIngrediente, categoria, unidade, passo, base, porPessoa }) => {
      const calculada = arredondarParaCima((base === 'cabecas' ? cabecas : equivalentes) * porPessoa[duracao], passo);
      return {
        id: idIngrediente,
        nome: nomeIngrediente,
        categoria,
        unidade,
        passo,
        calculada,
        quantidade: ajustes[idIngrediente]?.quantidade ?? calculada,
        emCasa: Boolean(ajustes[idIngrediente]?.emCasa),
      };
    }),
  }));

  return { cabecas, equivalentes, carne: calcularCarne({ evento, definicao, equivalentes }), complementos };
}

/** Ingredientes dos complementos marcados (os únicos que contam para a lista de compras). */
export const listarIngredientesEscolhidos = (calculo) =>
  calculo.complementos.filter((complemento) => complemento.selecionado).flatMap((complemento) => complemento.ingredientes);
