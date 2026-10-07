# Roteiro de testes

Com o MySQL ligado (script `banco/script-cinema.sql`) e a aplicação rodando, execute os testes abaixo.

## 1) API REST (Postman)

1. Postman > Import > selecione `postman/Cinema-API.postman_collection.json`.
2. Execute as requisições **na ordem numérica** (as variáveis `filmeId` e `analiseId` são preenchidas automaticamente).
3. Em cada uma, clique em Send e confira o status, o corpo da resposta e a aba "Test Results" (testes em verde).

| # | Requisição | Método e URL | Resultado esperado |
|---|---|---|---|
| 01 | Criar filme | POST /api/filmes | 201 Created + Location |
| 02 | Listar filmes | GET /api/filmes | 200 OK |
| 03 | Buscar filme | GET /api/filmes/{id} | 200 OK |
| 04 | Atualizar filme | PUT /api/filmes/{id} | 200 OK |
| 05 | Criar análise | POST /api/filmes/{id}/analises | 201 Created |
| 06 | Listar análises do filme | GET /api/filmes/{id}/analises | 200 OK |
| 07 | Buscar análise | GET /api/analises/{id} | 200 OK |
| 08 | Atualizar análise | PUT /api/analises/{id} | 200 OK |
| 09 | Filme inválido | POST /api/filmes | 400 + lista de erros por campo |
| 10 | Nota inválida | POST /api/filmes/{id}/analises | 400 |
| 11 | Filme inexistente | GET /api/filmes/999999 | 404 |
| 12 | Texto malicioso | POST /api/filmes | 201; o texto é gravado literalmente e a tabela continua existindo |
| 13 | Excluir análise | DELETE /api/analises/{id} | 204 No Content |
| 14 | Excluir filme | DELETE /api/filmes/{id} | 204 No Content |
| 15 | Filme excluído | GET /api/filmes/{id} | 404 |

Dica: no MySQL Workbench, rode `SELECT * FROM filme;` e `SELECT * FROM analise;` antes e depois
para comprovar que os dados realmente persistem no banco.

## 2) Front-end (jQuery/AJAX)

Com o MySQL ligado e a aplicação rodando, abra http://localhost:8080 e teste cada funcionalidade.
Cada ação abaixo dispara uma requisição AJAX (jQuery) para a API REST. Para ver as requisições:
F12 no navegador > aba **Rede (Network)** > filtro **Fetch/XHR**.

| # | Ação na tela | Requisição enviada | Resultado esperado |
|---|---|---|---|
| 1 | Abrir `/filmes` | GET /api/filmes | tabela com os filmes (ou aviso de lista vazia) |
| 2 | Cadastrar filme (formulário válido) | POST /api/filmes | volta à lista com mensagem de sucesso |
| 3 | Cadastrar filme com campos vazios | POST /api/filmes | 400: erros aparecem ao lado de cada campo |
| 4 | Clicar em "Detalhes" | GET /api/filmes/{id} e GET /api/filmes/{id}/analises | dados do filme e suas análises |
| 5 | Clicar em "Editar" (lista ou detalhes) e salvar | GET + PUT /api/filmes/{id} | filme atualizado na lista |
| 6 | Adicionar análise | POST /api/filmes/{id}/analises | análise aparece na lista; média atualizada |
| 7 | Adicionar análise com nota 99 | POST /api/filmes/{id}/analises | 400: erro no campo nota |
| 8 | Clicar em "Editar" de uma análise e salvar | PUT /api/analises/{id} | análise atualizada |
| 9 | Clicar em "Excluir" de uma análise | DELETE /api/analises/{id} | análise removida |
| 10 | Clicar em "Excluir filme" (lista ou detalhes) | DELETE /api/filmes/{id} | filme e análises removidos |
| 11 | Abrir `/filmes/999999` | GET /api/filmes/999999 | 404: mensagem "Filme não encontrado" |

Confira também no MySQL: `SELECT * FROM filme;` e `SELECT * FROM analise;`.

## 3) Tema claro/escuro (cookie)

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Abrir `/filmes` pela primeira vez | tema claro; botão "Tema escuro" |
| 2 | Clicar em "Tema escuro" | página escurece sem recarregar; botão vira "Tema claro" |
| 3 | F12 > Rede > requisição `tema` (POST) | status 200; cabeçalho de resposta `Set-Cookie: tema=escuro; Max-Age=31536000; Path=...; HttpOnly; SameSite=Lax` |
| 4 | F12 > Aplicativo > Cookies > localhost | cookie `tema = escuro`, HttpOnly marcado, SameSite Lax |
| 5 | Atualizar a página (F5) e navegar por Detalhes, Cadastrar e Editar | todas as páginas continuam no tema escuro (sem "piscar" claro) |
| 6 | Fechar o navegador, abrir de novo em `/filmes` | tema escuro mantido (cookie persistente de 1 ano) |
| 7 | Clicar em "Tema claro" | volta ao claro; cookie passa a `tema = claro` |
| 8 | Apagar o cookie `tema` (Aplicativo > Cookies > excluir) e atualizar | volta ao tema claro padrão |
| 9 | Editar o valor do cookie para `abc` e atualizar | tema claro (valor inválido é ignorado pelo servidor) |
| 10 | Postman: POST /tema com `tema=roxo` | 400 Bad Request |

Teste também no tema escuro: cadastrar/editar/excluir filmes e análises, mensagens de sucesso e de erro (legibilidade).
