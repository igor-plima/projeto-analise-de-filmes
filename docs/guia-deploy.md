# Guia de publicação (deploy) do WAR

## 1) Gerar o WAR no NetBeans
1. Botão direito no projeto > **Limpar e Construir (Clean and Build)**.
2. O arquivo é criado em `target/cinema-avaliacoes.war`. Esse arquivo não é versionado no Git (ver `.gitignore`).

## 2) Requisitos do servidor (boas práticas)
- **Java 17** (JDK ou JRE 17+).
- **Apache Tomcat 10.1.x** (Spring Boot 3 usa Jakarta EE 10; o Tomcat 9 NÃO é compatível).
- **MySQL 8** com o banco criado pelo script `banco/script-cinema.sql`.

## 3) Configuração (sem senhas dentro do código)
Defina as variáveis de ambiente do Tomcat, por exemplo no arquivo `bin/setenv.sh` (Linux) ou `bin\setenv.bat` (Windows):

    export SPRING_PROFILES_ACTIVE=prod
    export DB_HOST=localhost
    export DB_PORT=3306
    export DB_NAME=cinema
    export DB_USER=cinema_app
    export DB_PASSWORD='SENHA_FORTE_AQUI'

Em produção, troque a senha padrão do usuário `cinema_app` (comando `ALTER USER`).

## 4) Publicar
1. Copie `cinema-avaliacoes.war` para a pasta `webapps/` do Tomcat (ou use o Gerenciador do Tomcat > "Implantar").
2. Inicie/reinicie o Tomcat.
3. Acesse `http://SERVIDOR:8080/cinema-avaliacoes/` (o nome do WAR define o caminho).

## 5) Conferência
- Páginas abrem, cadastro/edição/exclusão funcionam e o tema escuro persiste.
- API: `http://SERVIDOR:8080/cinema-avaliacoes/api/filmes`.
- No Postman, altere a variável `baseUrl` da coleção para `http://SERVIDOR:8080/cinema-avaliacoes`.
- Logs: `logs/catalina.out` (Linux) ou `logs/` do Tomcat.

## 6) Boas práticas aplicadas
- WAR sem o Tomcat embutido (excluído no empacotamento), inicializado por `ServletInitializer`.
- Perfil `prod` (cache de templates ligado, sem SQL no log) e credenciais por variáveis de ambiente.
- Estrutura do banco controlada pelo script (`ddl-auto=validate`) e usuário do banco com privilégios mínimos.
- Cookie de tema com `HttpOnly`, `SameSite=Lax`, `Secure` quando em HTTPS e `Path` restrito ao contexto.
- Erros da API sem stack trace; HTTPS recomendado em produção (proxy reverso/Nginx ou conector TLS do Tomcat).
