import { calcularTotal } from './lista.js';
import { gerarId } from '../utils/id.js';

export function criarRegistroHistorico(itens) {
  return {
    id: gerarId(),
    data: new Date().toISOString(),
    itens: [...itens],
    total: calcularTotal(itens),
  };
}

/**
 * Soma os totais por mês e calcula a variação em relação ao mês anterior.
 * @returns {{ mes: string, total: number, variacao: number | null }[]}
 */
export function calcularComparativoMensal(registros) {
  const totaisPorMes = somarTotaisPorMes(registros);
  const meses = Object.keys(totaisPorMes).sort();

  return meses.map((mes, indice) => {
    const totalAnterior = indice > 0 ? totaisPorMes[meses[indice - 1]] : null;
    return {
      mes,
      total: totaisPorMes[mes],
      variacao: calcularVariacaoPercentual(totalAnterior, totaisPorMes[mes]),
    };
  });
}

function somarTotaisPorMes(registros) {
  return registros.reduce((totais, { data, total }) => {
    const mes = chaveDoMes(data);
    return { ...totais, [mes]: (totais[mes] ?? 0) + total };
  }, {});
}

function calcularVariacaoPercentual(anterior, atual) {
  if (!anterior) return null;
  return ((atual - anterior) / anterior) * 100;
}

// Usa o fuso local para uma compra feita à noite não cair no mês seguinte.
function chaveDoMes(dataIso) {
  const data = new Date(dataIso);
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${data.getFullYear()}-${mes}`;
}