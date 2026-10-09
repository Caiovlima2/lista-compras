import { carregarTema, salvarTema } from '../services/storage.js';

const prefereEscuro = () => matchMedia('(prefers-color-scheme: dark)').matches;

export function iniciarTema({ botao, icone }) {
  const raiz = document.documentElement;

  const atualizarIcone = () => {
    icone.textContent = raiz.classList.contains('dark') ? 'light_mode' : 'dark_mode';
  };

  const tema = carregarTema();
  raiz.classList.toggle('dark', tema ? tema === 'escuro' : prefereEscuro());
  atualizarIcone();

  botao.addEventListener('click', () => {
    const escuro = raiz.classList.toggle('dark');
    salvarTema(escuro ? 'escuro' : 'claro');
    atualizarIcone();
  });
}
