import {
  ajustarIngredienteDoPlano,
  alterarMarmitas,
  alternarReceitaDoPlano,
  consolidarIngredientes,
  definirPorcoesDaReceita,
  listarItensDoPlano,
} from '../../domain/marmitas/marmitas.js';
import { criarEditorMarmitas } from '../../components/eventos/editorMarmitas.js';
import { atualizarEstado, estado } from '../store.js';

/** Liga o editor das marmitas da semana às regras. Mesmo formato de montarChurrasco. */
export function montarMarmitas({ alterar, voltar, excluir }) {
  const editor = criarEditorMarmitas({
    acoes: {
      voltar,
      excluir,
      renomear: (nome) => alterar((atual) => ({ ...atual, nome })),
      alterarData: (data) => alterar((atual) => ({ ...atual, data })),
      alterarMarmitas: (quantidade) => alterar((atual) => alterarMarmitas(atual, quantidade)),
      alternarReceita: (id) => alterar((atual) => alternarReceitaDoPlano(atual, id)),
      definirPorcoes: (id, porcoes) => alterar((atual) => definirPorcoesDaReceita(atual, id, porcoes)),
      ajustarQuantidade: (chave, quantidade) => alterar((atual) => ajustarIngredienteDoPlano(atual, chave, { quantidade })),
      alternarEmCasa: (chave) => alterar((atual) => ajustarIngredienteDoPlano(atual, chave, { emCasa: !atual.ajustes[chave]?.emCasa })),
      // Abre o formulário de nova receita na aba Receitas.
      criarReceita: () => {
        atualizarEstado({ telaReceitas: { aberta: 'nova', modo: 'editar', porcoes: null, emCasa: {} } });
        location.hash = 'receitas';
      },
    },
  });

  return {
    elemento: editor.elemento,

    atualizar(plano) {
      const ingredientes = consolidarIngredientes(plano, estado.receitas);
      editor.atualizar({ plano, receitas: estado.receitas, ingredientes });
      return { itens: listarItensDoPlano(ingredientes), emCasa: ingredientes.filter((ingrediente) => ingrediente.emCasa).length };
    },
  };
}
