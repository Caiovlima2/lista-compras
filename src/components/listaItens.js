import { criarElemento } from '../utils/dom.js';
import { calcularCustoBeneficio } from '../domain/economia.js';
import { criarLinhaMercado, criarLinhaPlanejamento } from './itemLinha.js';

export function renderizarLista(container, { itens, comprando, indiceHistorico, acoes }) {
  if (itens.length === 0) {
    container.replaceChildren(
      criarElemento('li', {
        classe: 'rounded-lg border border-dashed border-outline-variant p-6 text-center text-on-surface-variant',
        texto: 'Sua lista está vazia. Adicione itens acima ou use uma lista anterior.',
      }),
    );
    return;
  }

  const linhas = itens.map((item) => {
    const custoBeneficio = calcularCustoBeneficio(item, indiceHistorico);
    return comprando
      ? criarLinhaMercado(item, {
          custoBeneficio,
          aoAlternarCarrinho: () => acoes.alternarCarrinho(item.id),
          aoRegistrar: () => acoes.registrarPreco(item.id),
        })
      : criarLinhaPlanejamento(item, { custoBeneficio, aoRemover: () => acoes.remover(item.id) });
  });

  container.replaceChildren(...linhas);
}
