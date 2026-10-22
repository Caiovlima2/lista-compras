export const CATEGORIAS = ['Hortifrúti', 'Laticínios', 'Carnes', 'Padaria', 'Mercearia', 'Limpeza', 'Higiene', 'Outros'];

export const SEM_CATEGORIA = 'Sem categoria';

/** Agrupa itens por categoria, na ordem da lista acima. "Sem categoria" fica por último. */
export function agruparPorCategoria(itens) {
  const grupos = new Map([...CATEGORIAS, ''].map((categoria) => [categoria, []]));

  itens.forEach((item) => {
    const chave = grupos.has(item.categoria) ? item.categoria : '';
    grupos.get(chave).push(item);
  });

  return [...grupos.entries()]
    .filter(([, lista]) => lista.length > 0)
    .map(([categoria, lista]) => ({ categoria, rotulo: categoria || SEM_CATEGORIA, itens: lista }));
}
