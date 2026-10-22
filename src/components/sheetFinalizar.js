import { criarElemento, icone } from '../utils/dom.js';
import {
  formatarDiferenca,
  formatarHora,
  formatarMinutos,
  formatarPreco,
  formatarQuantidade,
  formatarTituloItem,
  formatarVariacao,
} from '../utils/formatadores.js';
import { calcularDiferenca, calcularDiferencaDoItem, calcularMetaDoCarrinho, calcularTotalNoCarrinho, contarPendentes, estaNoCarrinho } from '../domain/lista.js';
import { abrirSheet, configurarFechamento } from './sheet.js';

function criarCartaoResumo({ itens, sessao, economia, agora }) {
  const total = calcularTotalNoCarrinho(itens);
  const meta = calcularMetaDoCarrinho(itens);
  const diferenca = calcularDiferenca(itens);
  const percentual = meta > 0 ? (diferenca / meta) * 100 : 0;
  const quantidade = itens.filter(estaNoCarrinho).length;
  const duracao = agora - new Date(sessao.inicio).getTime();

  const avisoDiferenca =
    Math.abs(diferenca) < 0.005
      ? criarElemento('p', { classe: 'badge-neutro', texto: 'Exatamente como o previsto' })
      : criarElemento(
          'p',
          { classe: `${diferenca < 0 ? 'badge-bom' : 'badge-alerta'} text-label-lg` },
          icone(diferenca < 0 ? 'savings' : 'trending_up', 'text-base'),
          diferenca < 0
            ? `Você economizou ${formatarPreco(-diferenca)} vs. estimado (${formatarVariacao(percentual)})`
            : `${formatarPreco(diferenca)} acima do estimado (${formatarVariacao(percentual)})`,
        );

  return [
    criarElemento(
      'p',
      { classe: 'flex items-center gap-2 text-body-md text-on-surface-variant' },
      icone('storefront', 'text-xl'),
      `${sessao.mercado || 'Compra sem local'} · ${formatarHora(sessao.inicio)} às ${formatarHora(new Date(agora).toISOString())} (${formatarMinutos(duracao)})`,
    ),
    criarElemento(
      'div',
      { classe: 'flex items-end justify-between gap-3' },
      criarElemento(
        'div',
        {},
        criarElemento('p', { classe: 'text-label-md text-on-surface-variant', texto: 'TOTAL NO CARRINHO' }),
        criarElemento('p', { classe: 'text-headline-xl text-primary tabular-nums', texto: formatarPreco(total) }),
        criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: `${quantidade} ${quantidade === 1 ? 'item conferido' : 'itens conferidos'}` }),
      ),
      meta > 0
        ? criarElemento(
            'div',
            { classe: 'text-right' },
            criarElemento('p', { classe: 'text-label-md text-on-surface-variant', texto: 'Meta inicial' }),
            criarElemento('p', { classe: 'text-body-lg text-on-surface-variant tabular-nums line-through', texto: formatarPreco(meta) }),
          )
        : null,
    ),
    meta > 0 ? avisoDiferenca : null,
    economia > 0
      ? criarElemento('p', { classe: 'badge-bom text-label-lg' }, icone('history', 'text-base'), `${formatarPreco(economia)} mais barato que na última compra`)
      : null,
  ];
}

function criarLinhaConferida(item) {
  const diferenca = calcularDiferencaDoItem(item);
  return criarElemento(
    'li',
    { classe: 'card flex items-center gap-3 p-3' },
    icone('check_circle', 'text-primary'),
    criarElemento(
      'div',
      { classe: 'min-w-0 flex-1' },
      criarElemento('p', { classe: 'truncate text-body-lg', texto: formatarTituloItem(item) }),
      criarElemento('p', { classe: 'text-body-sm text-on-surface-variant', texto: `${formatarQuantidade(item.compra.quantidade)} × ${formatarPreco(item.compra.preco)}` }),
    ),
    criarElemento(
      'div',
      { classe: 'text-right' },
      criarElemento('p', { classe: 'text-label-lg tabular-nums', texto: formatarPreco(item.compra.preco * item.compra.quantidade) }),
      diferenca !== null && Math.abs(diferenca) >= 0.005
        ? criarElemento('p', { classe: `text-label-md ${diferenca < 0 ? 'text-primary' : 'text-secondary'}`, texto: formatarDiferenca(diferenca) })
        : null,
    ),
  );
}

/** Sheet "Conferir e finalizar": resumo antes de arquivar a compra no histórico. */
export function iniciarSheetFinalizar({ dialog, aoConfirmar }) {
  const resumo = dialog.querySelector('#finalizar-resumo');
  const lista = dialog.querySelector('#finalizar-itens');
  const pendentes = dialog.querySelector('#finalizar-pendentes');
  const botaoSalvar = dialog.querySelector('#finalizar-salvar');

  configurarFechamento(dialog);
  botaoSalvar.addEventListener('click', () => {
    dialog.close();
    aoConfirmar();
  });

  return {
    abrir({ itens, sessao, economia }) {
      const noCarrinho = itens.filter(estaNoCarrinho);
      const restantes = contarPendentes(itens);

      resumo.replaceChildren(...criarCartaoResumo({ itens, sessao, economia, agora: Date.now() }).filter(Boolean));
      lista.replaceChildren(...noCarrinho.map(criarLinhaConferida));
      pendentes.replaceChildren(
        ...(restantes > 0
          ? [criarElemento(
              'div',
              { classe: 'flex gap-2 rounded-lg bg-secondary-container/50 p-3 text-body-md' },
              icone('shopping_cart', 'text-secondary'),
              criarElemento(
                'p',
                {},
                criarElemento('strong', { texto: `${restantes} ${restantes === 1 ? 'item não comprado' : 'itens não comprados'}. ` }),
                'Eles permanecem na sua lista para a próxima compra.',
              ),
            )]
          : []),
      );

      botaoSalvar.disabled = noCarrinho.length === 0;
      abrirSheet(dialog);
    },
  };
}
