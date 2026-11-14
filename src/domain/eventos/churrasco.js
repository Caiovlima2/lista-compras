/**
 * Regras do churrasco, escritas como DADOS: a calculadora genérica (calculadora.js) só lê esta descrição.
 * Para ajustar uma quantidade, basta mudar os números aqui. Outros tipos de evento seguem o mesmo formato.
 *
 * - fator: quanto cada tipo de convidado come em relação a um homem (1 = porção inteira)
 * - base 'equivalentes': conta os convidados já multiplicados pelo fator (comida)
 * - base 'cabecas': conta uma por pessoa, sem fator (bebida, descartáveis)
 * - porPessoa: quantidade por pessoa, na unidade do item, para cada duração
 * - passo: o cálculo sempre arredonda para cima neste múltiplo (e o botão +/− anda neste passo)
 */
export const CHURRASCO = {
  tipo: 'churrasco',
  rotulo: 'Churrasco',
  icone: 'outdoor_grill',

  duracoes: [
    { valor: 'almoco', rotulo: 'Só almoço', icone: 'wb_sunny' },
    { valor: 'dia', rotulo: 'Dia todo', icone: 'timelapse' },
  ],
  duracaoPadrao: 'almoco',

  convidados: [
    { id: 'homens', rotulo: 'Homens', icone: 'man', fator: 1, nota: 'Porção inteira' },
    { id: 'mulheres', rotulo: 'Mulheres', icone: 'woman', fator: 0.8, nota: '80% da porção' },
    { id: 'criancas', rotulo: 'Crianças', icone: 'child_care', fator: 0.5, nota: '50% da porção' },
  ],
  convidadosPadrao: { homens: 3, mulheres: 2, criancas: 0 },

  // Carne total por pessoa (já inclui linguiça e petiscos), em gramas
  carne: { gramasPorPessoa: { almoco: 450, dia: 800 }, passo: 50 },

  cortesSugeridos: ['Picanha', 'Cupim', 'Fraldinha', 'Maminha', 'Alcatra', 'Ancho', 'Chorizo', 'Costela', 'Assado de tira', 'Bananinha', 'Linguiça', 'Frango (tulipa)', 'Coração de frango'],

  itens: [
    { id: 'pao-alho', nome: 'Pão de alho', categoria: 'Padaria', unidade: 'un', passo: 1, base: 'equivalentes', porPessoa: { almoco: 2, dia: 2 } },
    { id: 'arroz', nome: 'Arroz', categoria: 'Mercearia', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 70, dia: 70 } },
    { id: 'farinha', nome: 'Farinha de mandioca (farofa)', categoria: 'Mercearia', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 50, dia: 50 } },
    { id: 'batata', nome: 'Batata (maionese)', categoria: 'Hortifrúti', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 70, dia: 70 } },
    { id: 'cenoura', nome: 'Cenoura (maionese)', categoria: 'Hortifrúti', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 40, dia: 40 } },
    { id: 'ovos', nome: 'Ovos (maionese)', categoria: 'Mercearia', unidade: 'un', passo: 1, base: 'equivalentes', porPessoa: { almoco: 0.6, dia: 0.6 } },
    { id: 'maionese', nome: 'Maionese', categoria: 'Mercearia', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 45, dia: 45 } },
    { id: 'tomate', nome: 'Tomate (vinagrete)', categoria: 'Hortifrúti', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 80, dia: 80 } },
    { id: 'cebola', nome: 'Cebola (vinagrete)', categoria: 'Hortifrúti', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 25, dia: 25 } },
    { id: 'refrigerante', nome: 'Refrigerante', categoria: 'Mercearia', unidade: 'L', passo: 0.5, base: 'cabecas', porPessoa: { almoco: 0.9, dia: 2 } },
    { id: 'carvao', nome: 'Carvão', categoria: 'Outros', unidade: 'kg', passo: 0.5, base: 'equivalentes', porPessoa: { almoco: 1, dia: 1.2 } },
    { id: 'copos', nome: 'Copos descartáveis', categoria: 'Outros', unidade: 'un', passo: 5, base: 'cabecas', porPessoa: { almoco: 3, dia: 5 } },
    { id: 'pratos', nome: 'Pratos descartáveis', categoria: 'Outros', unidade: 'un', passo: 5, base: 'cabecas', porPessoa: { almoco: 2, dia: 4 } },
  ],
};
