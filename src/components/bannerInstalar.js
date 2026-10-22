import { criarElemento, icone } from '../utils/dom.js';

const jaInstalado = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const ehIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

/**
 * Convite para instalar o app (funciona offline depois de instalado).
 * - Android/Chrome: botão "Instalar" usa o evento beforeinstallprompt.
 * - iPhone: não existe botão, então mostramos as instruções do Safari.
 */
export function iniciarBannerInstalar({ container, dispensado, aoDispensar }) {
  if (jaInstalado() || dispensado) return;

  let eventoInstalacao = null;

  const esconder = () => container.replaceChildren();

  const dispensar = () => {
    esconder();
    aoDispensar();
  };

  const mostrar = ({ comBotao }) => {
    container.replaceChildren(
      criarElemento(
        'div',
        { classe: 'flex gap-3 rounded-lg bg-tertiary-container p-4 text-on-tertiary-container shadow-sm' },
        icone('install_mobile', 'text-3xl'),
        criarElemento(
          'div',
          { classe: 'min-w-0 flex-1 space-y-2' },
          criarElemento('p', { classe: 'text-label-lg', texto: 'Instale para usar sem sinal' }),
          criarElemento('p', {
            classe: 'text-body-md',
            texto: comBotao
              ? 'Funciona offline nos corredores fechados e subsolos de mercado.'
              : 'No Safari, toque em Compartilhar e depois em "Adicionar à Tela de Início".',
          }),
          criarElemento(
            'div',
            { classe: 'flex gap-2' },
            comBotao
              ? criarElemento('button', {
                  classe: 'btn btn-primary',
                  texto: 'Instalar',
                  atributos: { type: 'button' },
                  aoClicar: async () => {
                    eventoInstalacao.prompt();
                    await eventoInstalacao.userChoice;
                    esconder();
                  },
                })
              : null,
            criarElemento('button', { classe: 'btn btn-ghost', texto: comBotao ? 'Agora não' : 'Entendi', atributos: { type: 'button' }, aoClicar: dispensar }),
          ),
        ),
      ),
    );
  };

  addEventListener('beforeinstallprompt', (evento) => {
    evento.preventDefault();
    eventoInstalacao = evento;
    mostrar({ comBotao: true });
  });
  addEventListener('appinstalled', esconder);

  if (ehIos()) mostrar({ comBotao: false });
}
