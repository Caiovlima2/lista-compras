const CHAVES = {
  itens: 'lista-compras',
  historico: 'lista-compras-historico',
};

function ler(chave) {
  try {
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    console.error(`Não foi possível ler "${chave}" do armazenamento.`, erro);
    return [];
  }
}

function gravar(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

export const carregarItens = () => ler(CHAVES.itens);
export const salvarItens = (itens) => gravar(CHAVES.itens, itens);

export const carregarHistorico = () => ler(CHAVES.historico);
export const salvarHistorico = (registros) => gravar(CHAVES.historico, registros);