const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarPreco(valor) {
  return moeda.format(valor);
}

export function formatarData(iso) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// '2026-10' -> 'Outubro de 2026'
export function formatarMes(chave) {
  const [ano, mes] = chave.split('-').map(Number);
  const texto = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// 12.345 -> '+12,3%'
export function formatarVariacao(percentual) {
  const numero = percentual.toLocaleString('pt-BR', {
    signDisplay: 'exceptZero',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return `${numero}%`;
}

export function formatarQuantidade(total) {
  return `${total} ${total === 1 ? 'item' : 'itens'}`;
}

export function formatarTituloItem({ nome, marca }) {
  return marca ? `${nome} - ${marca}` : nome;
}

export function formatarPesoItem({ peso, unidade }) {
  return peso ? `${peso} ${unidade}` : '';
}

// Ex.: '2 × R$ 5,00 · 500 g · R$ 10,00/kg'
export function formatarDetalheItem(item) {
  const { quantidade = 1, preco, precoBase, rotuloBase } = item;

  return [
    quantidade > 1 && `${quantidade} × ${formatarPreco(preco)}`,
    formatarPesoItem(item),
    precoBase && `${formatarPreco(precoBase)}/${rotuloBase}`,
  ]
    .filter(Boolean)
    .join(' · ');
}