import { calcularEvento, listarIngredientesEscolhidos } from '../../domain/eventos/calculadora.js';
import {
  adicionarCorte,
  ajustarItem,
  alterarConfiguracao,
  alterarCorteFaltante,
  alternarCarne,
  alternarComplemento,
  obterDefinicao,
  removerCorte,
} from '../../domain/eventos/evento.js';
import { listarItensDoEvento } from '../../domain/eventos/paraLista.js';
import { criarEditorEvento } from '../../components/eventos/editorEvento.js';

/**
 * Liga o editor do churrasco às regras. `alterar(mudar)` aplica uma mudança ao evento aberto.
 * Todo tipo de evento oferece `montar` e devolve { elemento, atualizar(evento) -> { itens, emCasa } }.
 */
export function montarChurrasco({ evento, alterar, voltar, excluir }) {
  const definicao = obterDefinicao(evento.tipo);

  const editor = criarEditorEvento({
    definicao,
    acoes: {
      voltar,
      excluir,
      renomear: (nome) => alterar((atual) => ({ ...atual, nome })),
      alterarData: (data) => alterar((atual) => ({ ...atual, data })),
      alterarDuracao: (duracao) => alterar((atual) => alterarConfiguracao(atual, { duracao })),
      alterarConvidado: (id, quantidade) => alterar((atual) => alterarConfiguracao(atual, { convidados: { ...atual.convidados, [id]: quantidade } })),
      alternarCarne: (idTipo) => alterar((atual) => alternarCarne(atual, idTipo)),
      alterarCorteFaltante: (idTipo, nome) => alterar((atual) => alterarCorteFaltante(atual, idTipo, nome)),
      adicionarCorte: (corte) => alterar((atual) => adicionarCorte(atual, corte)),
      removerCorte: (id) => alterar((atual) => removerCorte(atual, id)),
      alternarComplemento: (id) => alterar((atual) => alternarComplemento(atual, id)),
      ajustarQuantidade: (id, quantidade) => alterar((atual) => ajustarItem(atual, id, { quantidade })),
      alternarEmCasa: (id) => alterar((atual) => ajustarItem(atual, id, { emCasa: !atual.ajustes[id]?.emCasa })),
    },
  });

  return {
    elemento: editor.elemento,

    atualizar(atual) {
      const calculo = calcularEvento(atual, definicao);
      editor.atualizar({ evento: atual, calculo });
      return {
        itens: listarItensDoEvento(calculo, atual),
        emCasa: listarIngredientesEscolhidos(calculo).filter((ingrediente) => ingrediente.emCasa).length,
      };
    },
  };
}
