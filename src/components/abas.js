import { criarElemento, icone } from '../utils/dom.js';

const CLASSE_TOPO = {
  ativa: 'btn btn-tonal min-h-10 px-4',
  inativa: 'btn btn-ghost min-h-10 px-4',
};
const CLASSE_RODAPE = {
  ativa: 'flex min-h-14 cursor-pointer flex-col items-center justify-center text-label-md text-primary',
  inativa: 'flex min-h-14 cursor-pointer flex-col items-center justify-center text-label-md text-on-surface-variant',
};

/**
 * Abas do app (barra do topo no computador, barra de baixo no celular).
 * A aba aberta fica no endereço (#eventos), então o botão "voltar" e os links funcionam.
 * Cada aba precisa de um elemento com id "aba-<id>" no HTML.
 */
export function iniciarAbas({ abas, navTopo, navRodape, aoMudar }) {
  const botoes = [];

  const criarBotao = (aba, classes, comIcone) => {
    const botao = criarElemento(
      'button',
      { atributos: { type: 'button' }, aoClicar: () => (location.hash = aba.id) },
      comIcone ? icone(aba.icone) : null,
      aba.rotulo,
    );
    botoes.push({ id: aba.id, botao, classes });
    return botao;
  };

  navTopo.replaceChildren(...abas.map((aba) => criarBotao(aba, CLASSE_TOPO, false)));
  navRodape.replaceChildren(...abas.map((aba) => criarBotao(aba, CLASSE_RODAPE, true)));

  const abaDoEndereco = () => {
    const id = location.hash.slice(1);
    return abas.some((aba) => aba.id === id) ? id : abas[0].id;
  };

  function abrir(idAtivo) {
    botoes.forEach(({ id, botao, classes }) => {
      const ativo = id === idAtivo;
      botao.className = ativo ? classes.ativa : classes.inativa;
      if (ativo) botao.setAttribute('aria-current', 'page');
      else botao.removeAttribute('aria-current');
    });
    abas.forEach(({ id }) => document.getElementById(`aba-${id}`).classList.toggle('hidden', id !== idAtivo));
    window.scrollTo(0, 0);
    aoMudar(idAtivo);
  }

  window.addEventListener('hashchange', () => abrir(abaDoEndereco()));
  abrir(abaDoEndereco());
}
