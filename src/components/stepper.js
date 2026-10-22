import { criarElemento, icone } from '../utils/dom.js';
import { arredondar, lerNumero } from '../utils/numero.js';

const formatarValor = (valor) => String(valor).replace('.', ',');

/**
 * Controle [−] 2 [+]. O número do meio também aceita digitação (ex.: 0,5).
 * Dispara um evento "input" ao mudar, para formulários atualizarem prévias.
 */
export function criarStepper({ valor = 1, minimo = 1, nome, rotulo = 'Quantidade', compacto = false, aoMudar }) {
  const tamanho = compacto ? 'size-9' : 'size-10';
  const campo = criarElemento('input', {
    classe: `${compacto ? 'w-9' : 'w-11'} rounded-md bg-transparent text-center text-body-lg font-bold tabular-nums outline-none focus:bg-surface-container-lowest`,
    atributos: { type: 'text', inputmode: 'decimal', name: nome, value: formatarValor(valor), 'aria-label': rotulo },
  });

  const ler = () => lerNumero(campo.value);

  const botao = (simbolo, descricao) =>
    criarElemento(
      'button',
      {
        classe: `${tamanho} grid shrink-0 cursor-pointer place-items-center rounded-full bg-surface-container-lowest text-on-surface shadow-sm transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35`,
        atributos: { type: 'button', 'aria-label': descricao },
      },
      icone(simbolo, 'text-xl'),
    );

  const menos = botao('remove', `Diminuir ${rotulo.toLowerCase()}`);
  const mais = botao('add', `Aumentar ${rotulo.toLowerCase()}`);

  const atualizarBotoes = () => {
    menos.disabled = (ler() ?? minimo) <= minimo;
  };

  const definir = (novoValor) => {
    campo.value = formatarValor(novoValor);
    atualizarBotoes();
  };

  const mudar = (novoValor) => {
    definir(novoValor);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    aoMudar?.(novoValor);
  };

  menos.addEventListener('click', () => mudar(Math.max(minimo, arredondar((ler() ?? minimo) - 1))));
  mais.addEventListener('click', () => mudar(arredondar((ler() ?? 0) + 1)));

  campo.addEventListener('change', () => {
    const digitado = ler();
    mudar(digitado !== null && digitado > 0 ? digitado : minimo);
  });
  campo.addEventListener('focus', () => campo.select());

  atualizarBotoes();

  const elemento = criarElemento(
    'div',
    { classe: 'inline-flex items-center gap-1 rounded-xl border border-outline-variant bg-surface-container p-1' },
    menos,
    campo,
    mais,
  );

  return { elemento, ler: () => ler() ?? minimo, definir };
}
