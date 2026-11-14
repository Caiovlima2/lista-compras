import './style.css';
import { registerSW } from 'virtual:pwa-register';

import { iniciarAbaEventos } from './app/abaEventos.js';
import { iniciarAbaLista } from './app/abaLista.js';
import { atualizarEstado, estado } from './app/store.js';

import { iniciarTema } from './components/temaToggle.js';
import { iniciarToast, mostrarToast } from './components/toast.js';
import { iniciarStatusConexao } from './components/statusConexao.js';
import { iniciarBannerInstalar } from './components/bannerInstalar.js';
import { iniciarRelogio } from './components/resumo.js';
import { iniciarAbas } from './components/abas.js';
import { renderizarEmBreve } from './components/abaEmBreve.js';

const $ = (seletor) => document.querySelector(seletor);

const ABAS = [
  { id: 'lista', rotulo: 'Lista', icone: 'checklist' },
  { id: 'eventos', rotulo: 'Eventos', icone: 'celebration' },
  { id: 'receitas', rotulo: 'Receitas', icone: 'menu_book' },
];

iniciarTema({ botao: $('#alternar-tema'), icone: $('#icone-tema') });
iniciarToast($('#toast'));
iniciarStatusConexao($('#status-offline'));
iniciarRelogio();

iniciarBannerInstalar({
  container: $('#banner-instalar'),
  dispensado: Boolean(estado.preferencias.bannerDispensado),
  aoDispensar: () => atualizarEstado({ preferencias: { ...estado.preferencias, bannerDispensado: true } }),
});

registerSW({ immediate: true, onOfflineReady: () => mostrarToast({ mensagem: 'Pronto: o app já funciona sem internet', duracao: 4000 }) });

iniciarAbaLista();

iniciarAbaEventos();
renderizarEmBreve($('#aba-receitas'), {
  nomeIcone: 'menu_book',
  titulo: 'Receitas',
  texto: 'Em breve: guarde suas receitas e transforme em lista de compras.',
});

iniciarAbas({
  abas: ABAS,
  navTopo: $('#abas-topo'),
  navRodape: $('#abas-rodape'),
  aoMudar: (aba) => atualizarEstado({ aba }),
});
