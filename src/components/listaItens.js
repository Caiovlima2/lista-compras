import { criarElemento, sincronizarFilhos } from '../utils/dom.js';
import { formatarPreco } from '../utils/formatadores.js';
import { calcularCustoBeneficio } from '../domain/economia.js';
import { agruparPorCategoria } from '../domain/categorias.js';
import { FILTROS, calcularSubtotalExibido, contarPendentes, itensAComprar, itensEmCasa } from '../domain/lista.js';
import { criarLinhaMercado, criarLinhaPlanejamento } from './itemLinha.js';

/**
 * Cache das linhas já desenhadas: só recria a linha cujo conteúdo mudou.
 * Isso mantém o foco e o teclado no campo que o usuário está usando.
 */
const cache = new Map();

function obterLinha(item, comprando, indiceHistorico, acoes) {
  const custoBeneficio = calcularCustoBeneficio(item, indiceHistorico);
  const assinatura = JSON.stringify([item, comprando, custoBeneficio]);
  const guardada = cache.get(item.id);
  if (guardada?.assinatura === assinatura) return guardada.no;

  const no = comprando ? criarLinhaMercado(item, { custoBeneficio, acoes }) : criarLinhaPlanejamento(item, { custoBeneficio, acoes });
  cache.set(item.id, { assinatura, no });
  return no;
}

function criarCabecalhoGrupo({ rotulo, itens }, comprando) {
  const pendentes = contarPendentes(itens);
  const total = itens.reduce((soma, item) => soma + calcularSubtotalExibido(item), 0);

  return criarElemento(
    'li',
    { classe: 'flex items-center justify-between gap-2 px-1 pt-3', atributos: { role: 'heading', 'aria-level': 3 } },
    criarElemento(
      'div',
      { classe: 'flex items-center gap-2' },
      criarElemento('span', { classe: 'text-label-lg tracking-wide text-on-surface-variant uppercase', texto: rotulo }),
      criarElemento('span', { classe: 'text-body-sm text-outline', texto: `(${itens.length})` }),
      comprando && pendentes > 0 ? criarElemento('span', { classe: 'badge-alerta', texto: `${pendentes} pendentes` }) : null,
    ),
    criarElemento('span', { classe: 'text-label-md tabular-nums text-on-surface-variant', texto: formatarPreco(total) }),
  );
}

const criarVazio = (texto) =>
  criarElemento('li', { classe: 'rounded-lg border border-dashed border-outline-variant p-6 text-center text-on-surface-variant', texto });

const criarCabecalhoSecao = (rotulo, quantidade) =>
  criarElemento(
    'li',
    { classe: 'flex items-center gap-2 px-1 pt-4', atributos: { role: 'heading', 'aria-level': 2 } },
    criarElemento('span', { classe: 'text-label-lg text-on-surface', texto: rotulo }),
    criarElemento('span', { classe: 'text-body-sm text-outline', texto: `(${quantidade})` }),
  );

function textoVazio({ comprando, filtro, temEmCasa }) {
  if (comprando) return 'Nada no carrinho ainda. Caminhe pelos corredores e use a barra acima para adicionar o que for pegando.';
  if (filtro === FILTROS.EM_CASA) return 'Nenhum item marcado como "Já tenho".';
  if (temEmCasa) return 'Tudo o que você precisa já está em casa.';
  return 'Sua lista está vazia. Adicione itens acima ou use uma lista anterior.';
}

/**
 * No mercado, só aparece o que precisa ser comprado. No planejamento, o filtro escolhe entre
 * "a comprar" e "já tenho"; com os dois visíveis, cada grupo ganha um título.
 */
export function renderizarLista(container, { itens, comprando, agrupar, filtro, indiceHistorico, acoes }) {
  cache.forEach((_, id) => {
    if (!itens.some((item) => item.id === id)) cache.delete(id);
  });

  const emCasa = itensEmCasa(itens);
  const aComprarVisiveis = comprando || filtro !== FILTROS.EM_CASA ? itensAComprar(itens) : [];
  const emCasaVisiveis = !comprando && filtro !== FILTROS.A_COMPRAR ? emCasa : [];

  if (aComprarVisiveis.length === 0 && emCasaVisiveis.length === 0) {
    sincronizarFilhos(container, [criarVazio(textoVazio({ comprando, filtro, temEmCasa: emCasa.length > 0 }))]);
    return;
  }

  const linha = (item) => obterLinha(item, comprando, indiceHistorico, acoes);
  const comTitulos = aComprarVisiveis.length > 0 && emCasaVisiveis.length > 0;

  const nosAComprar = agrupar
    ? agruparPorCategoria(aComprarVisiveis).flatMap((grupo) => [criarCabecalhoGrupo(grupo, comprando), ...grupo.itens.map(linha)])
    : aComprarVisiveis.map(linha);

  sincronizarFilhos(container, [
    comTitulos ? criarCabecalhoSecao('A comprar', aComprarVisiveis.length) : null,
    ...nosAComprar,
    comTitulos ? criarCabecalhoSecao('Já tenho em casa', emCasaVisiveis.length) : null,
    ...emCasaVisiveis.map(linha),
  ].filter(Boolean));
}
