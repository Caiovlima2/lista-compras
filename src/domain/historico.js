import { normalizarTexto } from '../utils/texto.js';
import { gerarId } from '../utils/id.js';

/** Monta o registro da compra a partir dos itens que foram para o carrinho. */
export function criarRegistroHistorico(itensNoCarrinho, { mercado, inicio, economia, agora = new Date() }) {
  const itens = itensNoCarrinho.map(({ id, nome, marca, peso, unidade, preco: estimado, compra }) => ({
    id,
    nome,
    marca,
    peso,
    unidade,
    preco: compra.preco,
    quantidade: compra.quantidade,
    precoEstimado: estimado,
  }));

  return {
    id: gerarId(),
    data: agora.toISOString(),
    mercado,
    inicio,
    fim: agora.toISOString(),
    itens,
    total: itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0),
    economia,
  };
}

const porDataCrescente = (a, b) => new Date(a.data) - new Date(b.data);
const porDataDecrescente = (a, b) => porDataCrescente(b, a);

export const ordenarRegistrosRecentes = (registros) => [...registros].sort(porDataDecrescente);

/** Total gasto por mês (hora local) e variação percentual em relação ao mês anterior. */
export function calcularComparativoMensal(registros) {
  const porMes = new Map();

  [...registros].sort(porDataCrescente).forEach(({ data, total }) => {
    const d = new Date(data);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const atual = porMes.get(chave) ?? { chave, total: 0, compras: 0 };
    porMes.set(chave, { ...atual, total: atual.total + total, compras: atual.compras + 1 });
  });

  const meses = [...porMes.values()];
  return meses
    .map((mes, indice) => {
      const anterior = meses[indice - 1];
      const variacao = anterior && anterior.total > 0 ? ((mes.total - anterior.total) / anterior.total) * 100 : null;
      return { ...mes, variacao };
    })
    .reverse();
}

/** Mercados já usados, do mais recente para o mais antigo, sem repetir. */
export function listarMercadosRecentes(registros, limite = 5) {
  const vistos = new Map();
  ordenarRegistrosRecentes(registros).forEach(({ mercado }) => {
    const chave = normalizarTexto(mercado ?? '');
    if (chave && !vistos.has(chave)) vistos.set(chave, mercado);
  });
  return [...vistos.values()].slice(0, limite);
}

/** Itens mais comprados, com os dados da compra mais recente de cada um. */
export function listarSugestoesFrequentes(registros, limite = 8) {
  const contagem = new Map();

  [...registros].sort(porDataCrescente).forEach(({ itens }) => {
    itens.forEach((item) => {
      const chave = normalizarTexto(item.nome);
      const atual = contagem.get(chave);
      contagem.set(chave, { item, vezes: (atual?.vezes ?? 0) + 1 });
    });
  });

  return [...contagem.values()]
    .sort((a, b) => b.vezes - a.vezes)
    .slice(0, limite)
    .map(({ item }) => item);
}
