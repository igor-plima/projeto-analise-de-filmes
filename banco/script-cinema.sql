-- =====================================================================
-- Script de criação do banco de dados - Cinema (Filmes e Análises)
-- SGBD: MySQL 8.x
-- Execute este script ANTES de iniciar a aplicação (MySQL Workbench:
-- File > Open SQL Script > Executar tudo / Ctrl+Shift+Enter).
-- =====================================================================

CREATE DATABASE IF NOT EXISTS cinema
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE cinema;

-- ---------------------------------------------------------------------
-- Tabela: filme
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS filme (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    titulo          VARCHAR(150)  NOT NULL,
    sinopse         VARCHAR(1000) NOT NULL,
    genero          VARCHAR(50)   NOT NULL,
    ano_lancamento  INT           NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT ck_filme_ano CHECK (ano_lancamento BETWEEN 1888 AND 2100)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: analise (cada análise pertence a um filme)
-- Ao excluir um filme, suas análises também são excluídas.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analise (
    id        BIGINT        NOT NULL AUTO_INCREMENT,
    filme_id  BIGINT        NOT NULL,
    texto     VARCHAR(1000) NOT NULL,
    nota      INT           NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_analise_filme FOREIGN KEY (filme_id)
        REFERENCES filme (id) ON DELETE CASCADE,
    CONSTRAINT ck_analise_nota CHECK (nota BETWEEN 0 AND 10)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- Segurança: usuário exclusivo da aplicação com privilégios mínimos
-- (somente manipular dados; sem DROP, CREATE, ALTER ou acesso a outros bancos).
-- Troque a senha em ambientes reais e informe-a pela variável DB_PASSWORD.
-- ---------------------------------------------------------------------
CREATE USER IF NOT EXISTS 'cinema_app'@'localhost' IDENTIFIED BY 'Cinema_Dev_7Kq2xP';
-- Garante a senha mesmo que o usuário já exista (permite executar o script mais de uma vez).
ALTER USER 'cinema_app'@'localhost' IDENTIFIED BY 'Cinema_Dev_7Kq2xP';
GRANT SELECT, INSERT, UPDATE, DELETE ON cinema.* TO 'cinema_app'@'localhost';
