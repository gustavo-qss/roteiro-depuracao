# Roteiro de Depuração

Site da atividade de depuração passo a passo — *Análise e Projeto de Algoritmos*.

O aluno informa a matrícula, confirma o próprio nome, recebe **um programa Java com
valores calculados a partir da matrícula dele**, monta no IntelliJ com três breakpoints
e então percorre um roteiro guiado anotando o valor das variáveis em cada parada. No
fim, baixa um `.json` com todas as respostas.

Como cada aluno recebe números diferentes, não adianta copiar do colega: os valores
anotados só fecham se a depuração foi feita de verdade.

---

## Os três algoritmos

O sorteio é a **soma dos 9 dígitos da matrícula, módulo 3** — dá para conferir na mão.

| Algoritmo | Foco | Passos |
|---|---|:--:|
| `Calibrador` | Cadeia de chamadas sem laço. Step Into × Step Out, e a diferença entre "o método retornou" e "a variável recebeu". | 17 |
| `Inspetor` | Busca do maior valor num vetor. Resume (F9) para pular de volta em volta do laço. | 19 |
| `Ordenador` | Uma passada de bubble sort com um método `void` que troca elementos. Mostra o array sendo alterado por referência. | 24 |

Os três têm **número de passos fixo**, independente da matrícula — só os valores mudam.
É isso que permite um roteiro linear e correção automática.

Na turma atual (37 alunos) a distribuição fica em 11 `Calibrador`, 10 `Inspetor` e
16 `Ordenador`.

---

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173/roteiro-depuracao/` (o `base` faz parte da URL).

---

## Publicar no GitHub Pages

O jeito mais simples é dar a esta pasta um repositório próprio:

```bash
cd depuracao/site
git init && git add . && git commit -m "Roteiro de depuração"
gh repo create roteiro-depuracao --public --source=. --push
```

Depois, no GitHub: **Settings → Pages → Source: GitHub Actions**.

O workflow em `.github/workflows/deploy.yml` já monta o `BASE_URL` a partir do nome do
repositório, então não é preciso editar nada. O site sai em
`https://<usuario>.github.io/roteiro-depuracao/`.

> Se preferir manter tudo dentro de um repositório maior, mova
> `.github/workflows/deploy.yml` para a raiz do repositório, acrescente
> `working-directory: depuracao/site` nos passos de `npm`, e ajuste o `path` do
> upload para `depuracao/site/dist`.

---

## Trocar a lista da turma

São **dois** arquivos, de propósito:

| Arquivo | Vai para o ar? | Conteúdo |
|---|:--:|---|
| `validador/alunos-completo.csv` | não (no `.gitignore`) | `261072045,BEATRIZ KRULEWSKI MARTINS` |
| `public/alunos.csv` | sim | `261072045,BEATRIZ K. M.` |

Edite o **completo** e regere o público:

```bash
node validador/encurtar-nomes.mjs             # regrava public/alunos.csv
node validador/encurtar-nomes.mjs --conferir  # só mostra, sem escrever
```

O script avisa se dois alunos colidirem no nome curto. O `public/alunos.csv` é lido em
tempo de execução — trocar a turma não exige mexer em código, mas exige um novo push.

Trocar a turma **muda o sorteio automaticamente**: quem tem outra matrícula recebe
outro algoritmo e outros números.

### Por que os nomes vão cortados

Para achar o nome pela matrícula, o site precisa ler a lista da turma — então o arquivo
publicado é legível por qualquer um que tenha a URL, e isso valeria mesmo com o
repositório privado. Publicando só o primeiro nome + iniciais, o aluno ainda se
reconhece na confirmação, mas quem baixar o CSV não leva a lista nominal completa.

Há também um `public/robots.txt` e um `<meta name="robots" content="noindex">`, que
mantêm a página fora dos buscadores. Nenhum dos dois esconde nada de quem tem o link —
são contra indexação, não contra acesso.

Na correção o nome completo volta: o `corrigir.mjs` lê o
`validador/alunos-completo.csv` da sua máquina e usa ele no relatório, ignorando o nome
curto que veio no envio.

---

## Corrigir as entregas

Junte os `.json` que os alunos enviaram numa pasta e rode:

```bash
node validador/corrigir.mjs respostas/                     # resumo
node validador/corrigir.mjs respostas/ --detalhe           # aponta cada erro
node validador/corrigir.mjs respostas/ --csv notas.csv     # exporta as notas
```

Saída:

```
261072045  BEATRIZ KRULEWSKI MARTINS
  calibrador  ████████████████████ 28/28 (100%)
```

Regras de comparação: números por valor inteiro; arrays posição a posição
(`12, 7, 30` == `{12,7,30}`); alternativas sem acento e sem diferenciar maiúsculas.
Os campos de texto livre (`observacao`, `conclusao`) **não entram na nota** — aparecem
com `--detalhe` para você ler.

O corretor também acusa arquivo adulterado: se o `algoritmo.id` do JSON não bater com
o que a matrícula sorteia, a entrega é rejeitada.

Para conferir um caso na mão:

```bash
node validador/gabarito.mjs 261072045
```

---

## Estrutura

```
src/
  core/
    derivacao.js     matrícula → algoritmo + valores de entrada   (compartilhado)
    algoritmos.js    código Java + roteiro de passos              (SEM gabarito)
  components/        as quatro telas + o bloco de código
  lib/csv.js         leitor do alunos.csv
validador/
  gabarito.mjs           simula os algoritmos e produz os valores esperados
  corrigir.mjs           corrige os .json entregues
  encurtar-nomes.mjs     gera o public/alunos.csv a partir do completo
  alunos-completo.csv    lista nominal da turma (fora do git)
public/
  alunos.csv         a turma, com nome + iniciais
  robots.txt         mantém a página fora dos buscadores
```

**O gabarito nunca entra no bundle do site.** `validador/` não é importado por nenhum
arquivo de `src/`, então o aluno não acha as respostas abrindo o DevTools. O site sabe
apenas *quais perguntas fazer*; *quais respostas esperar* só existe aqui no seu lado.

Se mexer em `src/core/algoritmos.js` (ordem dos passos, ids dos campos), ajuste
`validador/gabarito.mjs` na mesma medida — os dois casam pelo `id` de cada campo — e
suba o `VERSAO` em `src/App.vue` para invalidar o rascunho salvo no navegador dos alunos.

---

## Verificação

O conteúdo foi conferido compilando e rodando de verdade:

- os 45 programas da turma compilam com `javac` e a saída no console bate com o
  `saida_console` previsto pelo gabarito;
- os valores intermediários (estado do array no meio da troca, `maior` a cada volta,
  `trocas`) foram conferidos com versões instrumentadas dos algoritmos.
