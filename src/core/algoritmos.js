/**
 * algoritmos.js — codigo Java de cada exercicio + o roteiro de passos.
 *
 * IMPORTANTE: aqui NAO existe gabarito. Este arquivo so guarda as PERGUNTAS
 * (em que linha o depurador esta, que comando executar, quais variaveis anotar).
 * Os valores esperados sao calculados apenas em `validador/gabarito.mjs`, que
 * fica fora do bundle do site — assim o aluno nao acha a resposta no DevTools.
 *
 * Os tres algoritmos tem numero de passos FIXO, independente da matricula:
 * so os valores mudam. Isso e o que permite um roteiro linear e uma correcao
 * automatica simples.
 */

/* --- acoes do depurador ------------------------------------------- */
/* Sem atalhos de teclado de proposito: o keymap muda de versao para versao do
   IntelliJ e em notebook ainda depende da tecla Fn. O aluno acha o comando
   pelo NOME, no botao da barra do depurador ou no menu Run. */
const INTO = {
  nome: 'Step Into',
  resumo: 'entra no metodo chamado nesta linha',
}
const OVER = {
  nome: 'Step Over',
  resumo: 'executa a linha inteira sem entrar em metodos',
}
const OUT = {
  nome: 'Step Out',
  resumo: 'termina o metodo atual e volta para quem chamou',
}
const RESUME = {
  nome: 'Resume Program',
  resumo: 'segue ate o proximo breakpoint',
}

/* --- atalhos para declarar campos --------------------------------- */
const num = (id, rotulo, ajuda) => ({ id, rotulo: rotulo ?? id, tipo: 'int', ajuda })
const arr = (id, rotulo, ajuda) => ({ id, rotulo: rotulo ?? id, tipo: 'array', ajuda })
const esc = (id, rotulo, opcoes, ajuda) => ({ id, rotulo, tipo: 'escolha', opcoes, ajuda })
const txt = (id, rotulo, ajuda) => ({ id, rotulo, tipo: 'texto', ajuda })

const SIM_NAO = ['Sim', 'Não']

/* ================================================================== */
/* 1. CALIBRADOR — cadeia de chamadas, sem laco                        */
/* ================================================================== */

const calibrador = {
  id: 'calibrador',
  classe: 'Calibrador',
  titulo: 'Cadeia de chamadas',
  sinopse:
    'Metodos que chamam metodos, sem nenhum laco. O foco e enxergar a pilha de chamadas subindo e descendo com Step Into e Step Out.',
  breakpoints: [
    { rotulo: 'BP1', linha: 'int resultado = calibrar(base, fator);', onde: 'main()' },
    { rotulo: 'BP2', linha: 'int parcial = n1 * n2;', onde: 'combinar()' },
    { rotulo: 'BP3', linha: 'int reduzido = valor - passo;', onde: 'normalizar()' },
  ],

  codigo: ({ base, fator }) => `public class Calibrador {

    public static void main(String[] args) {
        int base = ${base};
        int fator = ${fator};

        int resultado = calibrar(base, fator); // BP1
        System.out.println("Resultado final: " + resultado);
    }

    public static int calibrar(int x, int y) {
        int bruto = combinar(x, y);
        int limpo = normalizar(bruto, y);
        return limpo;
    }

    public static int combinar(int n1, int n2) {
        int parcial = n1 * n2; // BP2
        int extra = compensar(parcial);
        return extra;
    }

    public static int normalizar(int valor, int passo) {
        int reduzido = valor - passo; // BP3
        int ajustado = arredondar(reduzido);
        return ajustado;
    }

    public static int compensar(int z) {
        return z + 7;
    }

    public static int arredondar(int z) {
        return z / 2;
    }
}
`,

  passos: [
    {
      local: 'BP1 · main()',
      linha: 'int resultado = calibrar(base, fator);',
      contexto:
        'O depurador parou ANTES de executar esta linha. Nada dela rodou ainda: ' +
        '`resultado` ainda nao tem valor nenhum.',
      dica:
        'Este primeiro passo e so para voce achar o painel Variables e conferir que ' +
        'colou o codigo certo. Os dois numeros sao os mesmos que estao escritos no ' +
        'main() — e para ser assim mesmo. Do passo 2 em diante os valores passam a ' +
        'aparecer so no painel, e nao mais no codigo.',
      campos: [
        num('base', 'base', 'o que aparece em Variables'),
        num('fator', 'fator', 'o que aparece em Variables'),
      ],
      acao: INTO,
    },
    {
      local: 'calibrar()',
      linha: 'int bruto = combinar(x, y);',
      contexto: 'Voce entrou em calibrar(). Repare como base/fator viraram x/y.',
      campos: [num('x'), num('y')],
      acao: INTO,
    },
    {
      local: 'BP2 · combinar()',
      linha: 'int parcial = n1 * n2;',
      contexto: 'Segundo nivel da pilha. Olhe a aba Frames: main → calibrar → combinar.',
      campos: [num('n1'), num('n2')],
      acao: OVER,
    },
    {
      local: 'combinar()',
      linha: 'int extra = compensar(parcial);',
      contexto: 'A multiplicacao ja foi executada.',
      campos: [num('parcial')],
      acao: INTO,
    },
    {
      local: 'compensar()',
      linha: 'return z + 7;',
      contexto: 'Metodo curto, so para praticar o Step Out.',
      campos: [num('z')],
      acao: OUT,
    },
    {
      local: 'combinar() · de volta',
      linha: 'int extra = compensar(parcial);',
      contexto:
        'Voce voltou para a MESMA linha de onde saiu. Com o Show Method Return Values '
        + 'ligado, o valor devolvido aparece em Variables como um item '
        + '"Returned value". Se voce nao ligou, esse item nao existe — e ai o jeito '
        + 'e calcular pela linha do return.',
      campos: [
        num(
          'retorno_compensar',
          'valor devolvido por compensar()',
          'se nao aparecer em Variables, calcule pela linha `return z + 7;`',
        ),
        esc('extra_definido', 'A variavel `extra` ja tem valor neste momento?', SIM_NAO),
      ],
      acao: OVER,
    },
    {
      local: 'combinar()',
      linha: 'return extra;',
      contexto: 'Agora sim a atribuicao aconteceu.',
      campos: [num('parcial'), num('extra')],
      acao: OUT,
    },
    {
      local: 'calibrar() · de volta',
      linha: 'int bruto = combinar(x, y);',
      contexto: 'Voce desceu um nivel na pilha de chamadas.',
      campos: [
        num(
          'retorno_combinar',
          'valor devolvido por combinar()',
          'se nao aparecer em Variables, e o valor de `extra` do passo anterior',
        ),
      ],
      acao: OVER,
    },
    {
      local: 'calibrar()',
      linha: 'int limpo = normalizar(bruto, y);',
      contexto: 'bruto acabou de ser atribuido.',
      campos: [num('x'), num('y'), num('bruto')],
      acao: INTO,
    },
    {
      local: 'BP3 · normalizar()',
      linha: 'int reduzido = valor - passo;',
      contexto: 'Terceiro breakpoint. Confira quem virou quem nos parametros.',
      campos: [num('valor'), num('passo')],
      acao: OVER,
    },
    {
      local: 'normalizar()',
      linha: 'int ajustado = arredondar(reduzido);',
      contexto:
        'ATENCAO: agora e Step Over, e nao Step Into. Observe a diferenca.',
      campos: [num('reduzido')],
      acao: OVER,
    },
    {
      local: 'normalizar()',
      linha: 'return ajustado;',
      contexto:
        'arredondar() usa divisao inteira (/). Confira se o resultado bate com o que voce esperava.',
      campos: [
        num('ajustado'),
        esc(
          'entrou_arredondar',
          'O Step Over fez o depurador entrar dentro de arredondar()?',
          SIM_NAO,
        ),
      ],
      acao: OUT,
    },
    {
      local: 'calibrar() · de volta',
      linha: 'int limpo = normalizar(bruto, y);',
      contexto: 'De novo na linha da chamada, com o retorno pendurado.',
      campos: [
        num(
          'retorno_normalizar',
          'valor devolvido por normalizar()',
          'se nao aparecer em Variables, e o valor de `ajustado` do passo anterior',
        ),
      ],
      acao: OVER,
    },
    {
      local: 'calibrar()',
      linha: 'return limpo;',
      contexto: 'Ultimo passo antes de voltar para main().',
      campos: [num('bruto'), num('limpo')],
      acao: OUT,
    },
    {
      local: 'BP1 · main() · de volta',
      linha: 'int resultado = calibrar(base, fator);',
      contexto: 'Voltamos ao ponto de partida, na mesma linha do BP1.',
      campos: [
        num(
          'retorno_calibrar',
          'valor devolvido por calibrar()',
          'se nao aparecer em Variables, e o valor de `limpo` do passo anterior',
        ),
        esc('resultado_definido', 'A variavel `resultado` ja tem valor?', SIM_NAO),
      ],
      acao: OVER,
    },
    {
      local: 'main()',
      linha: 'System.out.println("Resultado final: " + resultado);',
      contexto: 'Agora resultado esta atribuido.',
      campos: [num('resultado')],
      acao: RESUME,
    },
    {
      local: 'Fim da execucao',
      linha: null,
      contexto: 'O programa terminou. Olhe a aba Console.',
      campos: [
        num('saida_console', 'numero impresso no console'),
        txt(
          'conclusao',
          'Com suas palavras: qual a diferenca pratica entre Step Into e Step Over?',
        ),
      ],
      acao: null,
    },
  ],
}

/* ================================================================== */
/* 2. INSPETOR — busca do maior valor em um array                      */
/* ================================================================== */

const inspetor = {
  id: 'inspetor',
  classe: 'Inspetor',
  titulo: 'Busca do maior valor',
  sinopse:
    'Um laco que percorre um vetor procurando o maior numero. O foco e usar o Resume Program para pular de uma volta do laco para a proxima.',
  breakpoints: [
    { rotulo: 'BP1', linha: 'int resultado = analisar(leituras);', onde: 'main()' },
    { rotulo: 'BP2', linha: 'if (ehMaior(v[i], maior)) {', onde: 'encontrarMaior()' },
    { rotulo: 'BP3', linha: 'int soma = valor + quantidade;', onde: 'ajustar()' },
  ],

  codigo: ({ leituras }) => `public class Inspetor {

    public static void main(String[] args) {
        int[] leituras = {${leituras.join(', ')}};

        int resultado = analisar(leituras); // BP1
        System.out.println("Resultado final: " + resultado);
    }

    public static int analisar(int[] dados) {
        int maior = encontrarMaior(dados);
        int ajustado = ajustar(maior, dados.length);
        return ajustado;
    }

    public static int encontrarMaior(int[] v) {
        int maior = v[0];
        for (int i = 1; i < v.length; i++) {
            if (ehMaior(v[i], maior)) { // BP2
                maior = v[i];
            }
        }
        return maior;
    }

    public static boolean ehMaior(int candidato, int atual) {
        return candidato > atual;
    }

    public static int ajustar(int valor, int quantidade) {
        int soma = valor + quantidade; // BP3
        return dobrar(soma);
    }

    public static int dobrar(int z) {
        return z * 2;
    }
}
`,

  passos: [
    {
      local: 'BP1 · main()',
      linha: 'int resultado = analisar(leituras);',
      contexto:
        'O depurador parou ANTES de executar esta linha. Clique na setinha ao lado de '
        + '`leituras`, no painel Variables, para abrir o vetor.',
      dica:
        'Este primeiro passo e so para voce achar o painel Variables e conferir que '
        + 'colou o codigo certo. Os numeros sao os mesmos que estao escritos no main() '
        + '— e para ser assim mesmo. Do passo 2 em diante os valores passam a aparecer '
        + 'so no painel, e nao mais no codigo.',
      campos: [arr('leituras', 'leituras', 'os 5 numeros, separados por virgula')],
      acao: INTO,
    },
    {
      local: 'analisar()',
      linha: 'int maior = encontrarMaior(dados);',
      contexto: 'O array nao foi copiado: `dados` aponta para o mesmo vetor de `leituras`.',
      campos: [arr('dados')],
      acao: INTO,
    },
    {
      local: 'encontrarMaior()',
      linha: 'int maior = v[0];',
      contexto: 'O candidato inicial e sempre a primeira posicao.',
      campos: [arr('v')],
      acao: OVER,
    },
    {
      local: 'encontrarMaior()',
      linha: 'for (int i = 1; i < v.length; i++) {',
      contexto: 'O laco comeca em 1, porque a posicao 0 ja virou o candidato.',
      campos: [num('maior')],
      acao: OVER,
    },
    {
      local: 'BP2 · 1a parada',
      linha: 'if (ehMaior(v[i], maior)) {',
      contexto: 'Primeira volta do laco.',
      campos: [num('i'), num('v_i', 'v[i]'), num('maior')],
      acao: INTO,
    },
    {
      local: 'ehMaior()',
      linha: 'return candidato > atual;',
      contexto: 'Metodo que devolve boolean, e nao int.',
      campos: [
        num('candidato'),
        num('atual'),
        esc('retorno_ehMaior', 'O que ehMaior() vai devolver?', ['true', 'false']),
      ],
      acao: OUT,
    },
    {
      local: 'encontrarMaior() · de volta',
      linha: 'if (ehMaior(v[i], maior)) {',
      contexto: 'O teste do if ja tem resposta, mas o corpo ainda nao rodou.',
      campos: [
        esc('entra_no_if', 'O depurador vai executar a linha `maior = v[i];`?', SIM_NAO),
      ],
      acao: RESUME,
    },
    {
      local: 'BP2 · 2a parada',
      linha: 'if (ehMaior(v[i], maior)) {',
      contexto: 'O Resume pulou direto para a proxima volta do laco.',
      campos: [
        num('i'),
        num('v_i', 'v[i]'),
        num('maior'),
        esc('atualiza', 'Nesta volta, `maior` vai ser atualizado?', SIM_NAO),
      ],
      acao: RESUME,
    },
    {
      local: 'BP2 · 3a parada',
      linha: 'if (ehMaior(v[i], maior)) {',
      contexto: 'Continue anotando antes de seguir.',
      campos: [
        num('i'),
        num('v_i', 'v[i]'),
        num('maior'),
        esc('atualiza', 'Nesta volta, `maior` vai ser atualizado?', SIM_NAO),
      ],
      acao: RESUME,
    },
    {
      local: 'BP2 · 4a parada',
      linha: 'if (ehMaior(v[i], maior)) {',
      contexto: 'Esta e a ultima volta do laco.',
      campos: [
        num('i'),
        num('v_i', 'v[i]'),
        num('maior'),
        esc('atualiza', 'Nesta volta, `maior` vai ser atualizado?', SIM_NAO),
      ],
      acao: RESUME,
    },
    {
      local: 'BP3 · ajustar()',
      linha: 'int soma = valor + quantidade;',
      contexto: 'O Resume nao parou mais no BP2 — pense no motivo antes de responder.',
      campos: [
        num('valor'),
        num('quantidade'),
        esc('por_que_pulou', 'Por que o depurador nao parou mais no BP2?', [
          'O laco terminou: i chegou a v.length',
          'O breakpoint BP2 foi desativado sozinho',
          'O metodo encontrarMaior() deu erro',
        ]),
      ],
      acao: OVER,
    },
    {
      local: 'ajustar()',
      linha: 'return dobrar(soma);',
      contexto: 'Aqui a chamada esta dentro do proprio return.',
      campos: [num('soma')],
      acao: INTO,
    },
    {
      local: 'dobrar()',
      linha: 'return z * 2;',
      contexto: 'Ultimo nivel da pilha.',
      campos: [num('z')],
      acao: OUT,
    },
    {
      local: 'ajustar() · de volta',
      linha: 'return dobrar(soma);',
      contexto: 'De volta ao return de ajustar().',
      campos: [
        num(
          'retorno_dobrar',
          'valor devolvido por dobrar()',
          'se nao aparecer em Variables, calcule pela linha `return z * 2;`',
        ),
      ],
      acao: OUT,
    },
    {
      local: 'analisar() · de volta',
      linha: 'int ajustado = ajustar(maior, dados.length);',
      contexto: 'Repare que `ajustado` ainda nao recebeu nada.',
      campos: [
        num('maior'),
        num(
          'retorno_ajustar',
          'valor devolvido por ajustar()',
          'se nao aparecer em Variables, e o mesmo valor que dobrar() acabou de devolver',
        ),
      ],
      acao: OVER,
    },
    {
      local: 'analisar()',
      linha: 'return ajustado;',
      contexto: 'Agora a atribuicao aconteceu.',
      campos: [num('ajustado')],
      acao: OUT,
    },
    {
      local: 'BP1 · main() · de volta',
      linha: 'int resultado = analisar(leituras);',
      contexto: 'Voltamos para main().',
      campos: [
        num(
          'retorno_analisar',
          'valor devolvido por analisar()',
          'se nao aparecer em Variables, e o valor de `ajustado` do passo anterior',
        ),
      ],
      acao: OVER,
    },
    {
      local: 'main()',
      linha: 'System.out.println("Resultado final: " + resultado);',
      contexto: 'Ultima linha antes do fim.',
      campos: [num('resultado')],
      acao: RESUME,
    },
    {
      local: 'Fim da execucao',
      linha: null,
      contexto: 'O programa terminou. Olhe a aba Console.',
      campos: [
        num('saida_console', 'numero impresso no console'),
        txt(
          'conclusao',
          'Com suas palavras: para que serviu o Resume Program neste exercicio?',
        ),
      ],
      acao: null,
    },
  ],
}

/* ================================================================== */
/* 3. ORDENADOR — uma passada de bubble sort, com troca                */
/* ================================================================== */

const ordenador = {
  id: 'ordenador',
  classe: 'Ordenador',
  titulo: 'Uma passada de ordenacao',
  sinopse:
    'Uma unica passada do bubble sort sobre quatro numeros, com um metodo `void` que troca elementos de lugar. O foco e ver o array sendo modificado dentro de outro metodo.',
  breakpoints: [
    { rotulo: 'BP1', linha: 'int resultado = processar(valores);', onde: 'main()' },
    { rotulo: 'BP2', linha: 'if (foraDeOrdem(v[i], v[i + 1])) {', onde: 'umaPassada()' },
    { rotulo: 'BP3', linha: 'int ultimo = v[v.length - 1];', onde: 'pontuar()' },
  ],

  codigo: ({ valores }) => `public class Ordenador {

    public static void main(String[] args) {
        int[] valores = {${valores.join(', ')}};

        int resultado = processar(valores); // BP1
        System.out.println("Resultado final: " + resultado);
    }

    public static int processar(int[] v) {
        int trocas = umaPassada(v);
        return pontuar(v, trocas);
    }

    public static int umaPassada(int[] v) {
        int trocas = 0;
        for (int i = 0; i < v.length - 1; i++) {
            if (foraDeOrdem(v[i], v[i + 1])) { // BP2
                trocar(v, i);
                trocas = trocas + 1;
            }
        }
        return trocas;
    }

    public static boolean foraDeOrdem(int esquerda, int direita) {
        return esquerda > direita;
    }

    public static void trocar(int[] v, int i) {
        int temp = v[i];
        v[i] = v[i + 1];
        v[i + 1] = temp;
    }

    public static int pontuar(int[] v, int trocas) {
        int ultimo = v[v.length - 1]; // BP3
        return combinar(ultimo, trocas);
    }

    public static int combinar(int a, int b) {
        return a * 10 + b;
    }
}
`,

  passos: [
    {
      local: 'BP1 · main()',
      linha: 'int resultado = processar(valores);',
      contexto:
        'O depurador parou ANTES de executar esta linha. Clique na setinha ao lado de '
        + '`valores`, no painel Variables, para abrir o vetor.',
      dica:
        'Este primeiro passo e so para voce achar o painel Variables e conferir que '
        + 'colou o codigo certo. Os numeros sao os mesmos que estao escritos no main() '
        + '— e para ser assim mesmo. Do passo 2 em diante os valores passam a aparecer '
        + 'so no painel, e nao mais no codigo.',
      campos: [arr('valores', 'valores', 'os 4 numeros, separados por virgula')],
      acao: INTO,
    },
    {
      local: 'processar()',
      linha: 'int trocas = umaPassada(v);',
      contexto: '`v` e o mesmo array de `valores` — nao houve copia.',
      campos: [arr('v')],
      acao: INTO,
    },
    {
      local: 'umaPassada()',
      linha: 'int trocas = 0;',
      contexto: 'O contador comeca zerado.',
      campos: [arr('v')],
      acao: OVER,
    },
    {
      local: 'umaPassada()',
      linha: 'for (int i = 0; i < v.length - 1; i++) {',
      contexto: 'Repare no `- 1`: o laco compara cada posicao com a seguinte.',
      campos: [num('trocas')],
      acao: OVER,
    },
    {
      local: 'BP2 · 1a parada',
      linha: 'if (foraDeOrdem(v[i], v[i + 1])) {',
      contexto: 'Primeira comparacao do vetor.',
      campos: [num('i'), num('v_i', 'v[i]'), num('v_i1', 'v[i + 1]')],
      acao: INTO,
    },
    {
      local: 'foraDeOrdem()',
      linha: 'return esquerda > direita;',
      contexto: 'Compare os nomes: v[i] virou `esquerda`, v[i+1] virou `direita`.',
      campos: [
        num('esquerda'),
        num('direita'),
        esc('retorno_foraDeOrdem', 'O que foraDeOrdem() vai devolver?', ['true', 'false']),
      ],
      acao: OUT,
    },
    {
      local: 'umaPassada() · de volta',
      linha: 'if (foraDeOrdem(v[i], v[i + 1])) {',
      contexto: 'Antes de executar o Step Over, preveja para onde o depurador vai pular.',
      campos: [
        esc('proxima_linha', 'Qual linha o depurador vai destacar agora?', [
          'trocar(v, i);',
          'for (int i = 0; i < v.length - 1; i++) {',
        ]),
      ],
      acao: OVER,
    },
    {
      local: 'umaPassada()',
      linha: 'trocar(v, i);',
      contexto: 'Anote o array ANTES da troca — ele vai mudar no proximo passo.',
      campos: [arr('v', 'v (antes da troca)')],
      acao: INTO,
    },
    {
      local: 'trocar()',
      linha: 'int temp = v[i];',
      contexto: 'Este metodo e `void`: ele nao devolve nada, so mexe no array.',
      campos: [num('i'), arr('v')],
      acao: OVER,
    },
    {
      local: 'trocar()',
      linha: 'v[i] = v[i + 1];',
      contexto: '`temp` guardou o valor que esta prestes a ser sobrescrito.',
      campos: [num('temp')],
      acao: OVER,
    },
    {
      local: 'trocar()',
      linha: 'v[i + 1] = temp;',
      contexto:
        'Olhe o array agora: a posicao i ja foi sobrescrita e existe um valor repetido. E por isso que `temp` precisa existir.',
      campos: [arr('v', 'v (no meio da troca)')],
      acao: OVER,
    },
    {
      local: 'trocar() · fim',
      linha: '}',
      contexto: 'A troca terminou.',
      campos: [
        arr('v', 'v (depois da troca)'),
        esc('void_devolve', 'trocar() vai devolver algum valor? Repare no tipo `void`.', SIM_NAO),
      ],
      acao: OUT,
    },
    {
      local: 'umaPassada() · de volta',
      linha: 'trocar(v, i);',
      contexto:
        'O array de main() tambem mudou, mesmo sem ninguem ter devolvido nada: array e passado por referencia.',
      campos: [arr('v'), num('trocas')],
      acao: OVER,
    },
    {
      local: 'umaPassada()',
      linha: 'trocas = trocas + 1;',
      contexto: 'Anote o contador ANTES de ele ser incrementado.',
      campos: [num('trocas', 'trocas (antes de incrementar)')],
      acao: RESUME,
    },
    {
      local: 'BP2 · 2a parada',
      linha: 'if (foraDeOrdem(v[i], v[i + 1])) {',
      contexto: 'Segunda comparacao.',
      campos: [
        num('i'),
        num('v_i', 'v[i]'),
        num('v_i1', 'v[i + 1]'),
        esc('vai_trocar', 'Vai haver troca nesta volta?', SIM_NAO),
      ],
      acao: RESUME,
    },
    {
      local: 'BP2 · 3a parada',
      linha: 'if (foraDeOrdem(v[i], v[i + 1])) {',
      contexto: 'Terceira e ultima comparacao.',
      campos: [
        num('i'),
        num('v_i', 'v[i]'),
        num('v_i1', 'v[i + 1]'),
        esc('vai_trocar', 'Vai haver troca nesta volta?', SIM_NAO),
      ],
      acao: RESUME,
    },
    {
      local: 'BP3 · pontuar()',
      linha: 'int ultimo = v[v.length - 1];',
      contexto:
        'O laco acabou. Compare o array de agora com o do primeiro passo: uma passada so nao ordena tudo, mas leva o maior valor para o fim.',
      campos: [arr('v', 'v (estado final)'), num('trocas')],
      acao: OVER,
    },
    {
      local: 'pontuar()',
      linha: 'return combinar(ultimo, trocas);',
      contexto: 'Ultima chamada do programa.',
      campos: [num('ultimo')],
      acao: INTO,
    },
    {
      local: 'combinar()',
      linha: 'return a * 10 + b;',
      contexto: 'Topo da pilha de chamadas.',
      campos: [num('a'), num('b')],
      acao: OUT,
    },
    {
      local: 'pontuar() · de volta',
      linha: 'return combinar(ultimo, trocas);',
      contexto: 'Voltamos ao return de pontuar().',
      campos: [
        num(
          'retorno_combinar',
          'valor devolvido por combinar()',
          'se nao aparecer em Variables, calcule pela linha `return a * 10 + b;`',
        ),
      ],
      acao: OUT,
    },
    {
      local: 'processar() · de volta',
      linha: 'return pontuar(v, trocas);',
      contexto: 'Penultimo nivel da pilha.',
      campos: [
        num('trocas'),
        num(
          'retorno_pontuar',
          'valor devolvido por pontuar()',
          'se nao aparecer em Variables, e o mesmo valor que combinar() acabou de devolver',
        ),
      ],
      acao: OUT,
    },
    {
      local: 'BP1 · main() · de volta',
      linha: 'int resultado = processar(valores);',
      contexto: 'De volta ao ponto de partida.',
      campos: [
        num(
          'retorno_processar',
          'valor devolvido por processar()',
          'se nao aparecer em Variables, e o mesmo valor que pontuar() acabou de devolver',
        ),
      ],
      acao: OVER,
    },
    {
      local: 'main()',
      linha: 'System.out.println("Resultado final: " + resultado);',
      contexto: 'Agora `resultado` esta atribuido.',
      campos: [num('resultado')],
      acao: RESUME,
    },
    {
      local: 'Fim da execucao',
      linha: null,
      contexto: 'O programa terminou. Olhe a aba Console.',
      campos: [
        num('saida_console', 'numero impresso no console'),
        txt(
          'conclusao',
          'Com suas palavras: por que o array de main() mudou se trocar() e `void`?',
        ),
      ],
      acao: null,
    },
  ],
}

/* ================================================================== */

export const CATALOGO = { calibrador, inspetor, ordenador }

export function algoritmoPorId(id) {
  const alg = CATALOGO[id]
  if (!alg) throw new Error(`Algoritmo desconhecido: ${id}`)
  return alg
}

/** Numera os passos a partir de 1, para uso na tela. */
export function passosNumerados(id) {
  return algoritmoPorId(id).passos.map((p, i) => ({ ...p, n: i + 1 }))
}
