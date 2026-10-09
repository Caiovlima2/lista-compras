import { criarElemento, icone } from '../utils/dom.js';
import { formatarDiferenca, formatarPreco, formatarTituloItem } from '../utils/formatadores.js';
import { estaNoCarrinho } from '../domain/lista.js';
import { abrirSheet, configurarFechamento } from './sheet.js';

/** Sheet "Quanto custou?": registra preço e quantidade reais de um item. */
export function iniciarSheetPreco({ dialog, aoConfirmar, aoRemoverDoCarrinho }) {
  const formulario = dialog.querySelector('#form-preco');
  const { preco, quantidade } = formulario.elements;
  const titulo = dialog.querySelector('#preco-item');
  const diferenca = dialog.querySelector('#preco-diferenca');
  const botaoRemover = dialog.querySelector('#preco-remover');
  let itemAtual = null;

  configurarFechamento(dialog);

  const atualizarDiferenca = () => {
    diferenca.replaceChildren();
    if (!itemAtual || itemAtual.preco === null || !preco.value || !quantidade.value) return;

    const previsto = itemAtual.preco * itemAtual.quantidade;
    const pago = Number(preco.value) * Number(quantidade.value);
    const delta = pago - previsto;
    const acima = delta > 0.005;
    const abaixo = delta < -0.005;

    diferenca.append(
      criarElemento(
        'span',
        { classe: acima ? 'badge-alerta' : abaixo ? 'badge-bom' : 'badge-neutro' },
        icone(acima ? 'trending_up' : abaixo ? 'trending_down' : 'check', 'text-base'),
        acima || abaixo ? `${formatarDiferenca(delta)} vs. previsto (${formatarPreco(previsto)})` : 'Igual ao previsto',
      ),
    );
  };

  formulario.addEventListener('input', atualizarDiferenca);

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    dialog.close();
    aoConfirmar(itemAtual.id, { preco: Number(preco.value), quantidade: Number(quantidade.value) });
  });

  botaoRemover.addEventListener('click', () => {
    dialog.close();
    aoRemoverDoCarrinho(itemAtual.id);
  });

  return {
    abrir(item) {
      itemAtual = item;
      titulo.textContent = formatarTituloItem(item);
      preco.value = item.compra?.preco ?? item.preco ?? '';
      quantidade.value = item.compra?.quantidade ?? item.quantidade;
      botaoRemover.classList.toggle('hidden', !estaNoCarrinho(item));
      atualizarDiferenca();
      abrirSheet(dialog);
      preco.select();
    },
  };
}
