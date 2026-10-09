const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 });

export const formatarPreco = (valor) => moeda.format(valor);

export const formatarQuantidade = (quantidade) => numero.format(quantidade);

export const formatarPesoItem = ({ peso, unidade }) => (peso > 0 ? `${numero.format(peso)} ${unidade}` : '');

export const formatarPrecoBase = ({ valor, rotulo }) => `${moeda.format(valor)}/${rotulo}`;

export const formatarTituloItem = ({ nome, marca }) => (marca ? `${nome} · ${marca}` : nome);

/** "+R$ 2,00" ou "−R$ 1,50" */
export function formatarDiferenca(valor) {
  const sinal = valor > 0 ? '+' : valor < 0 ? '−' : '';
  return `${sinal}${moeda.format(Math.abs(valor))}`;
}

export const formatarVariacao = (percentual) =>
  `${percentual > 0 ? '+' : percentual < 0 ? '−' : ''}${Math.abs(percentual).toFixed(1).replace('.', ',')}%`;

export const formatarData = (iso) => new Date(iso).toLocaleDateString('pt-BR');

export const formatarHora = (iso) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

/** Recebe "2026-10" e devolve "outubro de 2026". */
export function formatarMes(chave) {
  const [ano, mes] = chave.split('-').map(Number);
  return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}
