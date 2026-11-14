/**
 * Regras do churrasco, escritas como DADOS: a calculadora genérica (calculadora.js) só lê esta descrição.
 * Para ajustar uma quantidade, basta mudar os números aqui. Outros tipos de evento seguem o mesmo formato.
 *
 * - fator: quanto cada tipo de convidado come em relação a um homem (1 = porção inteira)
 * - carne.gramasPorPessoa: carne TOTAL por pessoa (todos os tipos juntos)
 * - carne.tipos[].peso: peso relativo do tipo. A carne total se divide entre os tipos escolhidos
 *   na proporção destes pesos (se só um tipo for escolhido, ele fica com tudo)
 * - complementos: o usuário marca o que quer. Cada um tem um ou mais ingredientes:
 *   - base 'equivalentes': conta os convidados já multiplicados pelo fator (comida)
 *   - base 'cabecas': conta uma por pessoa, sem fator (bebida, descartáveis)
 *   - porPessoa: quantidade por pessoa, na unidade do ingrediente, para cada duração
 *   - passo: o cálculo sempre arredonda para cima neste múltiplo (e o botão +/− anda neste passo)
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

  carne: {
    gramasPorPessoa: { almoco: 450, dia: 800 },
    passo: 50,
    tipos: [
      {
        id: 'vermelha',
        rotulo: 'Carne vermelha',
        icone: 'kebab_dining',
        peso: 480,
        nomePadrao: 'Carne vermelha para churrasco',
        cortesSugeridos: ['Picanha', 'Cupim', 'Fraldinha', 'Maminha', 'Alcatra', 'Ancho', 'Chorizo', 'Costela', 'Assado de tira', 'Bananinha'],
      },
      {
        id: 'linguica',
        rotulo: 'Linguiça',
        icone: 'lunch_dining',
        peso: 150,
        nomePadrao: 'Linguiça',
        cortesSugeridos: ['Linguiça toscana', 'Linguiça apimentada', 'Linguiça de frango'],
      },
      {
        id: 'frango',
        rotulo: 'Frango',
        icone: 'skillet',
        peso: 170,
        nomePadrao: 'Frango',
        cortesSugeridos: ['Tulipa', 'Coxa e sobrecoxa', 'Asa', 'Peito em cubos'],
      },
      {
        id: 'coracao',
        rotulo: 'Coração',
        icone: 'favorite',
        peso: 100,
        nomePadrao: 'Coração de frango',
        cortesSugeridos: ['Coração de frango'],
      },
    ],
  },
  carnesPadrao: ['vermelha'],

  complementos: [
    {
      id: 'pao-alho',
      nome: 'Pão de alho',
      icone: 'bakery_dining',
      grupo: 'Acompanhamentos',
      ingredientes: [{ id: 'pao-alho', nome: 'Pão de alho', categoria: 'Padaria', unidade: 'un', passo: 1, base: 'equivalentes', porPessoa: { almoco: 2, dia: 2 } }],
    },
    {
      id: 'arroz',
      nome: 'Arroz',
      icone: 'rice_bowl',
      grupo: 'Acompanhamentos',
      ingredientes: [{ id: 'arroz', nome: 'Arroz', categoria: 'Mercearia', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 70, dia: 70 } }],
    },
    {
      id: 'farofa',
      nome: 'Farofa',
      icone: 'grain',
      grupo: 'Acompanhamentos',
      ingredientes: [{ id: 'farinha', nome: 'Farinha de mandioca', categoria: 'Mercearia', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 50, dia: 50 } }],
    },
    {
      id: 'maionese-batata',
      nome: 'Maionese de batata',
      icone: 'soup_kitchen',
      grupo: 'Acompanhamentos',
      ingredientes: [
        { id: 'batata', nome: 'Batata', categoria: 'Hortifrúti', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 70, dia: 70 } },
        { id: 'cenoura', nome: 'Cenoura', categoria: 'Hortifrúti', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 40, dia: 40 } },
        { id: 'ovos', nome: 'Ovos', categoria: 'Mercearia', unidade: 'un', passo: 1, base: 'equivalentes', porPessoa: { almoco: 0.6, dia: 0.6 } },
        { id: 'maionese', nome: 'Maionese', categoria: 'Mercearia', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 45, dia: 45 } },
      ],
    },
    {
      id: 'vinagrete',
      nome: 'Vinagrete',
      icone: 'nutrition',
      grupo: 'Acompanhamentos',
      ingredientes: [
        { id: 'tomate', nome: 'Tomate', categoria: 'Hortifrúti', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 80, dia: 80 } },
        { id: 'cebola', nome: 'Cebola', categoria: 'Hortifrúti', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 25, dia: 25 } },
      ],
    },
    {
      id: 'queijo-coalho',
      nome: 'Queijo coalho',
      icone: 'egg_alt',
      grupo: 'Acompanhamentos',
      ingredientes: [{ id: 'queijo-coalho', nome: 'Queijo coalho', categoria: 'Laticínios', unidade: 'g', passo: 50, base: 'equivalentes', porPessoa: { almoco: 100, dia: 100 } }],
    },
    {
      id: 'refrigerante',
      nome: 'Refrigerante',
      icone: 'local_drink',
      grupo: 'Bebidas',
      ingredientes: [{ id: 'refrigerante', nome: 'Refrigerante', categoria: 'Mercearia', unidade: 'L', passo: 0.5, base: 'cabecas', porPessoa: { almoco: 0.9, dia: 2 } }],
    },
    {
      id: 'carvao',
      nome: 'Carvão',
      icone: 'local_fire_department',
      grupo: 'Outros',
      ingredientes: [{ id: 'carvao', nome: 'Carvão', categoria: 'Outros', unidade: 'kg', passo: 0.5, base: 'equivalentes', porPessoa: { almoco: 1, dia: 1.2 } }],
    },
    {
      id: 'copos',
      nome: 'Copos descartáveis',
      icone: 'local_cafe',
      grupo: 'Outros',
      ingredientes: [{ id: 'copos', nome: 'Copos descartáveis', categoria: 'Outros', unidade: 'un', passo: 5, base: 'cabecas', porPessoa: { almoco: 3, dia: 5 } }],
    },
    {
      id: 'pratos',
      nome: 'Pratos descartáveis',
      icone: 'dinner_dining',
      grupo: 'Outros',
      ingredientes: [{ id: 'pratos', nome: 'Pratos descartáveis', categoria: 'Outros', unidade: 'un', passo: 5, base: 'cabecas', porPessoa: { almoco: 2, dia: 4 } }],
    },
  ],
};
