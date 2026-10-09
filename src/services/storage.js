// Único arquivo que conhece o localStorage.
const CHAVES = {
  itens: 'lista-compras',
  historico: 'lista-compras-historico',
  sessao: 'lista-compras-sessao',
  tema: 'lista-compras-tema',
};

function ler(chave, valorPadrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : valorPadrao;
  } catch {
    return valorPadrao;
  }
}

function gravar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* armazenamento cheio ou bloqueado: o app continua funcionando em memória */
  }
}

export const carregarItens = () => ler(CHAVES.itens, []);
export const salvarItens = (itens) => gravar(CHAVES.itens, itens);

export const carregarHistorico = () => ler(CHAVES.historico, []);
export const salvarHistorico = (registros) => gravar(CHAVES.historico, registros);

export const carregarSessao = () => ler(CHAVES.sessao, {});
export const salvarSessao = (sessao) => gravar(CHAVES.sessao, sessao);

export const carregarTema = () => ler(CHAVES.tema, null);
export const salvarTema = (tema) => gravar(CHAVES.tema, tema);
