# Projeto Análise de Filmes

Sistema web para uma casa cultural com sala de cinema: cadastre filmes, registre **análises com nota (0 a 10)** e consulte tudo por páginas web ou por uma **API REST**.

## Funcionalidades
- Cadastro, edição, listagem e exclusão de **filmes**
- Cadastro, edição e exclusão de **análises** de cada filme, com cálculo da média das notas
- **API REST** completa (GET, POST, PUT e DELETE) para filmes e análises
- Front-end em **jQuery/AJAX** que consome a própria API
- **Tema claro/escuro** salvo em **cookie** (persiste entre visitas)
- Empacotamento em **WAR** para publicação em servidor Tomcat

## Tecnologias
Java 17 · Spring Boot 3.3 (Web, Validation, Data JPA) · Thymeleaf · MySQL 8 · jQuery 3.7 · Maven

## Estrutura
```
├── banco/script-cinema.sql        # criação do banco, tabelas e usuário da aplicação
├── docs/                          # guia de deploy e roteiro de testes
├── postman/                       # coleção do Postman com 15 requisições de teste
└── src/main
    ├── java/br/com/senac/cinema
    │   ├── controller/            # páginas, API REST e tema (cookie)
    │   ├── model/                 # entidades Filme e Analise
    │   ├── repository/            # acesso ao banco (Spring Data JPA)
    │   └── exception/             # tratamento padronizado de erros da API
    └── resources
        ├── templates/             # páginas Thymeleaf
        └── static/                # CSS e JavaScript (cinema.js + jQuery)
```

## Como executar
**Pré-requisitos:** Java 17, Maven e MySQL 8.

1. Execute o script `banco/script-cinema.sql` no MySQL (cria o banco `cinema`, as tabelas e o usuário `cinema_app`).
2. Na pasta do projeto, rode:
   ```
   mvn spring-boot:run
   ```
   (ou abra o projeto no NetBeans/IntelliJ e execute a classe `CinemaApplication`).
3. Acesse http://localhost:8080

A conexão com o banco usa as variáveis de ambiente `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`.
Os valores padrão (`localhost`, `3306`, `cinema`, `cinema_app`, `Cinema_Dev_7Kq2xP`) servem **somente para desenvolvimento local**;
em qualquer outro ambiente, troque a senha do usuário do banco e informe-a por variável de ambiente.

## API REST
| Método | URL | Descrição |
|---|---|---|
| GET | `/api/filmes` | lista os filmes |
| GET | `/api/filmes/{id}` | busca um filme |
| POST | `/api/filmes` | cria um filme |
| PUT | `/api/filmes/{id}` | atualiza um filme |
| DELETE | `/api/filmes/{id}` | exclui o filme e suas análises |
| GET | `/api/filmes/{id}/analises` | lista as análises de um filme |
| POST | `/api/filmes/{id}/analises` | cria uma análise |
| GET | `/api/analises/{id}` | busca uma análise |
| PUT | `/api/analises/{id}` | atualiza uma análise |
| DELETE | `/api/analises/{id}` | exclui uma análise |
| POST | `/tema` | grava o tema escolhido (`claro` ou `escuro`) em cookie |

Exemplo de corpo para `POST /api/filmes`:
```json
{
  "titulo": "Cidade de Deus",
  "sinopse": "A vida de jovens em uma comunidade do Rio de Janeiro.",
  "genero": "Drama",
  "anoLancamento": 2002
}
```
Importe `postman/Cinema-API.postman_collection.json` no Postman para testar todas as rotas.

## Segurança
- Consultas parametrizadas via JPA (proteção contra SQL Injection)
- Validação de entrada (Bean Validation) na API e nos formulários, além de restrições (CHECK) no banco
- Campos como `id` não podem ser definidos pelo cliente (evita *mass assignment*)
- Usuário do banco com privilégios mínimos (somente SELECT, INSERT, UPDATE e DELETE)
- Credenciais fora do código-fonte (variáveis de ambiente)
- Respostas de erro padronizadas, sem *stack trace*
- Dados exibidos na página com `.text()` (proteção contra XSS)
- Cookie de tema com `HttpOnly`, `SameSite=Lax`, `Secure` em HTTPS e `Path` restrito à aplicação

## Testes e publicação
- Roteiro de testes (API, front-end e tema): [`docs/roteiro-de-testes.md`](docs/roteiro-de-testes.md)
- Gerar o WAR (`mvn clean package` → `target/cinema-avaliacoes.war`) e publicar no Tomcat 10.1: [`docs/guia-deploy.md`](docs/guia-deploy.md)

## Observações
- Projeto criado como parte do curso Técnico em Desenvolvimento de Sistemas (SENAC São Paulo).
- O jQuery 3.7.1 (licença MIT) acompanha o projeto em `src/main/resources/static/js/`.
- O arquivo `nbactions.xml` configura o botão "Executar" do NetBeans para este projeto WAR; pode ser ignorado em outras IDEs.
