/*
 * cinema.js - integra o front-end (páginas HTML) com a API REST do back-end.
 * Usa jQuery ($.ajax) para enviar as requisições GET, POST, PUT e DELETE.
 *
 * Segurança: todo texto vindo da API é inserido com .text() (nunca .html()),
 * o que impede a execução de scripts injetados nos dados (XSS).
 */
(function ($) {
    'use strict';

    /* =====================================================================
     * 0) CAMINHO BASE DA APLICAÇÃO
     * Localmente é "/", mas ao publicar o WAR no Tomcat vira "/cinema-avaliacoes/".
     * O valor vem do <meta name="base-url"> gerado pelo Thymeleaf.
     * ===================================================================== */
    var BASE = ($('meta[name="base-url"]').attr('content') || '/').replace(/\/$/, '');

    function caminhoApp(caminho) {
        return BASE + caminho;
    }

    // Toda requisição AJAX que começa com "/" recebe o caminho base automaticamente.
    $.ajaxPrefilter(function (opcoes) {
        if (opcoes.url && opcoes.url.charAt(0) === '/') {
            opcoes.url = caminhoApp(opcoes.url);
        }
    });

    /* =====================================================================
     * 1) CAMADA DE ACESSO À API (todas as requisições AJAX ficam aqui)
     * ===================================================================== */
    function enviarJson(metodo, url, dados) {
        return $.ajax({
            url: url,
            method: metodo,
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(dados),
            dataType: 'json'
        });
    }

    var API = {
        filmes: {
            listar: function () {                       // GET    /api/filmes
                return $.ajax({ url: '/api/filmes', method: 'GET', dataType: 'json' });
            },
            buscar: function (id) {                     // GET    /api/filmes/{id}
                return $.ajax({ url: '/api/filmes/' + id, method: 'GET', dataType: 'json' });
            },
            criar: function (dados) {                   // POST   /api/filmes
                return enviarJson('POST', '/api/filmes', dados);
            },
            atualizar: function (id, dados) {           // PUT    /api/filmes/{id}
                return enviarJson('PUT', '/api/filmes/' + id, dados);
            },
            excluir: function (id) {                    // DELETE /api/filmes/{id}
                return $.ajax({ url: '/api/filmes/' + id, method: 'DELETE' });
            }
        },
        analises: {
            listarDoFilme: function (filmeId) {         // GET    /api/filmes/{id}/analises
                return $.ajax({ url: '/api/filmes/' + filmeId + '/analises', method: 'GET', dataType: 'json' });
            },
            criar: function (filmeId, dados) {          // POST   /api/filmes/{id}/analises
                return enviarJson('POST', '/api/filmes/' + filmeId + '/analises', dados);
            },
            atualizar: function (id, dados) {           // PUT    /api/analises/{id}
                return enviarJson('PUT', '/api/analises/' + id, dados);
            },
            excluir: function (id) {                    // DELETE /api/analises/{id}
                return $.ajax({ url: '/api/analises/' + id, method: 'DELETE' });
            }
        }
    };

    /* =====================================================================
     * 2) FUNÇÕES AUXILIARES DE INTERFACE
     * ===================================================================== */
    function mostrarMensagem(tipo, texto) {
        var classe = (tipo === 'ok') ? 'msg-ok' : 'msg-erro';
        $('#mensagem').empty().append($('<div>').addClass(classe).text(texto));
    }

    // Mensagem que precisa sobreviver a um redirecionamento de página.
    function guardarMensagem(tipo, texto) {
        try {
            sessionStorage.setItem('mensagem', JSON.stringify({ tipo: tipo, texto: texto }));
        } catch (e) { /* armazenamento indisponível: ignora */ }
    }

    function mostrarMensagemGuardada() {
        try {
            var bruto = sessionStorage.getItem('mensagem');
            if (bruto) {
                sessionStorage.removeItem('mensagem');
                var m = JSON.parse(bruto);
                mostrarMensagem(m.tipo, m.texto);
            }
        } catch (e) { /* ignora */ }
    }

    function descreverErro(jqXHR) {
        if (jqXHR.status === 0) {
            return 'Não foi possível conectar ao servidor.';
        }
        var corpo = jqXHR.responseJSON;
        if (corpo && corpo.detail) {
            return corpo.detail;
        }
        return 'Erro inesperado (código ' + jqXHR.status + ').';
    }

    function limparErros($form) {
        $form.find('.erro').text('');
    }

    // Mostra os erros de validação (400) ao lado de cada campo.
    function tratarErroFormulario($form, jqXHR) {
        limparErros($form);
        var corpo = jqXHR.responseJSON;
        if (jqXHR.status === 400 && corpo && corpo.erros) {
            $.each(corpo.erros, function (campo, mensagem) {
                $form.find('.erro').filter(function () {
                    return $(this).attr('data-campo') === campo;
                }).text(mensagem);
            });
            mostrarMensagem('erro', 'Corrija os campos indicados.');
        } else {
            mostrarMensagem('erro', descreverErro(jqXHR));
        }
    }

    function lerInteiro(valor) {
        var n = parseInt(valor, 10);
        return isNaN(n) ? null : n;
    }

    /* =====================================================================
     * 3) PÁGINA: LISTA DE FILMES  (GET e DELETE)
     * ===================================================================== */
    function iniciarLista() {
        mostrarMensagemGuardada();
        carregarFilmes();

        $('#tabela-filmes').on('click', '.btn-excluir', function () {
            var id = $(this).attr('data-id');
            var titulo = $(this).attr('data-titulo');
            if (!window.confirm('Excluir o filme "' + titulo + '" e todas as suas análises?')) {
                return;
            }
            API.filmes.excluir(id)
                .done(function () {
                    mostrarMensagem('ok', 'Filme excluído com sucesso!');
                    carregarFilmes();
                })
                .fail(function (jqXHR) {
                    mostrarMensagem('erro', descreverErro(jqXHR));
                    carregarFilmes();
                });
        });
    }

    function carregarFilmes() {
        API.filmes.listar()
            .done(function (filmes) {
                var $corpo = $('#tabela-filmes tbody').empty();
                $.each(filmes, function (i, f) {
                    var $tr = $('<tr>');
                    $('<td>').text(f.titulo).appendTo($tr);
                    $('<td>').text(f.genero).appendTo($tr);
                    $('<td>').text(f.anoLancamento).appendTo($tr);

                    var $acoes = $('<td>').appendTo($tr);
                    $('<a>').addClass('btn btn-sm').attr('href', caminhoApp('/filmes/' + f.id)).text('Detalhes').appendTo($acoes);
                    $('<a>').addClass('btn btn-sm btn-sec').attr('href', caminhoApp('/filmes/' + f.id + '/editar')).text('Editar').appendTo($acoes);
                    $('<button type="button">').addClass('btn btn-sm btn-perigo btn-excluir')
                        .attr('data-id', f.id).attr('data-titulo', f.titulo).text('Excluir').appendTo($acoes);

                    $corpo.append($tr);
                });
                $('#carregando').hide();
                $('#sem-filmes').toggle(filmes.length === 0);
                $('#tabela-filmes').toggle(filmes.length > 0);
            })
            .fail(function (jqXHR) {
                $('#carregando').hide();
                mostrarMensagem('erro', descreverErro(jqXHR));
            });
    }

    /* =====================================================================
     * 4) PÁGINA: FORMULÁRIO DE FILME  (POST para cadastrar, PUT para editar)
     * ===================================================================== */
    function iniciarForm() {
        var filmeId = $('body').attr('data-filme-id'); // vazio no cadastro, preenchido na edição
        var $form = $('#form-filme');

        if (filmeId) {
            $('#titulo-pagina').text('Editar filme');
            API.filmes.buscar(filmeId)
                .done(function (f) {
                    $('#titulo').val(f.titulo);
                    $('#sinopse').val(f.sinopse);
                    selecionarGenero(f.genero);
                    $('#anoLancamento').val(f.anoLancamento);
                })
                .fail(function (jqXHR) {
                    mostrarMensagem('erro', descreverErro(jqXHR));
                    $form.hide();
                });
        }

        $form.on('submit', function (evento) {
            evento.preventDefault();
            limparErros($form);

            var dados = {
                titulo: $('#titulo').val(),
                sinopse: $('#sinopse').val(),
                genero: $('#genero').val(),
                anoLancamento: lerInteiro($('#anoLancamento').val())
            };

            var $botao = $('#btn-salvar').prop('disabled', true);
            var requisicao = filmeId ? API.filmes.atualizar(filmeId, dados) : API.filmes.criar(dados);

            requisicao
                .done(function () {
                    guardarMensagem('ok', filmeId ? 'Filme atualizado com sucesso!' : 'Filme cadastrado com sucesso!');
                    window.location.href = caminhoApp('/filmes');
                })
                .fail(function (jqXHR) {
                    tratarErroFormulario($form, jqXHR);
                })
                .always(function () {
                    $botao.prop('disabled', false);
                });
        });
    }

    // Garante que o gênero salvo apareça selecionado, mesmo que não esteja na lista padrão.
    function selecionarGenero(genero) {
        var $select = $('#genero');
        var existe = $select.find('option').filter(function () {
            return $(this).val() === genero;
        }).length > 0;
        if (!existe) {
            $('<option>').val(genero).text(genero).appendTo($select);
        }
        $select.val(genero);
    }

    /* =====================================================================
     * 5) PÁGINA: DETALHES DO FILME + ANÁLISES (GET, POST, PUT e DELETE)
     * ===================================================================== */
    function iniciarDetalhes() {
        var filmeId = $('body').attr('data-filme-id');
        var analises = [];          // cache da lista exibida
        var analiseEmEdicao = null; // id da análise em edição (null = adicionando nova)
        var $form = $('#form-analise');

        mostrarMensagemGuardada();
        carregarFilme();
        carregarAnalises();

        function carregarFilme() {
            API.filmes.buscar(filmeId)
                .done(function (f) {
                    $('#filme-titulo').text(f.titulo);
                    $('#filme-genero').text(f.genero);
                    $('#filme-ano').text(f.anoLancamento);
                    $('#filme-sinopse').text(f.sinopse);
                })
                .fail(function (jqXHR) {
                    $('#conteudo').hide();
                    mostrarMensagem('erro', descreverErro(jqXHR));
                });
        }

        function carregarAnalises() {
            API.analises.listarDoFilme(filmeId)
                .done(function (lista) {
                    analises = lista;
                    desenharAnalises();
                })
                .fail(function (jqXHR) {
                    mostrarMensagem('erro', descreverErro(jqXHR));
                });
        }

        function desenharAnalises() {
            var $lista = $('#lista-analises').empty();
            var soma = 0;

            $.each(analises, function (i, a) {
                soma += a.nota;
                var $item = $('<div>').addClass('analise');
                $('<span>').addClass('nota').text('Nota: ' + a.nota + '/10').appendTo($item);
                $('<p>').text(a.analise).appendTo($item);

                var $acoes = $('<div>').addClass('acoes').appendTo($item);
                $('<button type="button">').addClass('btn btn-sm btn-sec btn-editar-analise')
                    .attr('data-id', a.id).text('Editar').appendTo($acoes);
                $('<button type="button">').addClass('btn btn-sm btn-perigo btn-excluir-analise')
                    .attr('data-id', a.id).text('Excluir').appendTo($acoes);

                $lista.append($item);
            });

            $('#sem-analises').toggle(analises.length === 0);
            $('#filme-media').text(analises.length ? (soma / analises.length).toFixed(1) : 'sem análises');
        }

        function sairDoModoEdicao() {
            analiseEmEdicao = null;
            $form[0].reset();
            limparErros($form);
            $('#titulo-form-analise').text('Adicionar análise');
            $('#btn-salvar-analise').text('Enviar análise');
            $('#btn-cancelar-edicao').hide();
        }

        // --- Enviar o formulário: POST (nova análise) ou PUT (edição) ---
        $form.on('submit', function (evento) {
            evento.preventDefault();
            limparErros($form);

            var dados = {
                analise: $('#analise').val(),
                nota: lerInteiro($('#nota').val())
            };
            var editando = analiseEmEdicao !== null;
            var requisicao = editando
                ? API.analises.atualizar(analiseEmEdicao, dados)
                : API.analises.criar(filmeId, dados);

            var $botao = $('#btn-salvar-analise').prop('disabled', true);
            requisicao
                .done(function () {
                    sairDoModoEdicao();
                    mostrarMensagem('ok', editando ? 'Análise atualizada com sucesso!' : 'Análise adicionada com sucesso!');
                    carregarAnalises();
                })
                .fail(function (jqXHR) {
                    tratarErroFormulario($form, jqXHR);
                })
                .always(function () {
                    $botao.prop('disabled', false);
                });
        });

        // --- Botão "Editar" de uma análise: carrega os dados no formulário ---
        $('#lista-analises').on('click', '.btn-editar-analise', function () {
            var id = Number($(this).attr('data-id'));
            var alvo = null;
            $.each(analises, function (i, a) {
                if (a.id === id) { alvo = a; }
            });
            if (!alvo) { return; }

            analiseEmEdicao = alvo.id;
            limparErros($form);
            $('#analise').val(alvo.analise);
            $('#nota').val(alvo.nota);
            $('#titulo-form-analise').text('Editar análise');
            $('#btn-salvar-analise').text('Salvar alterações');
            $('#btn-cancelar-edicao').show();
            $('#analise').trigger('focus');
        });

        $('#btn-cancelar-edicao').on('click', sairDoModoEdicao);

        // --- Botão "Excluir" de uma análise: DELETE ---
        $('#lista-analises').on('click', '.btn-excluir-analise', function () {
            var id = Number($(this).attr('data-id'));
            if (!window.confirm('Excluir esta análise?')) {
                return;
            }
            API.analises.excluir(id)
                .done(function () {
                    if (analiseEmEdicao === id) { sairDoModoEdicao(); }
                    mostrarMensagem('ok', 'Análise excluída com sucesso!');
                    carregarAnalises();
                })
                .fail(function (jqXHR) {
                    mostrarMensagem('erro', descreverErro(jqXHR));
                    carregarAnalises();
                });
        });

        // --- Botão "Excluir filme": DELETE e volta para a lista ---
        $('#btn-excluir-filme').on('click', function () {
            if (!window.confirm('Excluir este filme e todas as suas análises?')) {
                return;
            }
            API.filmes.excluir(filmeId)
                .done(function () {
                    guardarMensagem('ok', 'Filme excluído com sucesso!');
                    window.location.href = caminhoApp('/filmes');
                })
                .fail(function (jqXHR) {
                    mostrarMensagem('erro', descreverErro(jqXHR));
                });
        });
    }

    /* =====================================================================
     * 6) TEMA CLARO/ESCURO (a preferência fica guardada em um cookie no servidor)
     * ===================================================================== */
    function aplicarTema(tema) {
        $('html').attr('data-tema', tema);
        $('#btn-tema').text(tema === 'escuro' ? 'Tema claro' : 'Tema escuro');
    }

    function iniciarTema() {
        $('#btn-tema').on('click', function () {
            var atual = $('html').attr('data-tema') === 'escuro' ? 'escuro' : 'claro';
            var novo = (atual === 'escuro') ? 'claro' : 'escuro';

            // POST /tema: o servidor valida o valor e responde com o cabeçalho Set-Cookie.
            $.ajax({ url: '/tema', method: 'POST', data: { tema: novo } })
                .done(function () {
                    aplicarTema(novo);
                })
                .fail(function (jqXHR) {
                    mostrarMensagem('erro', descreverErro(jqXHR));
                });
        });
    }

    /* =====================================================================
     * 7) INICIALIZAÇÃO: escolhe o que executar conforme a página aberta
     * ===================================================================== */
    $(function () {
        iniciarTema();
        var pagina = $('body').attr('data-pagina');
        if (pagina === 'lista') {
            iniciarLista();
        } else if (pagina === 'form') {
            iniciarForm();
        } else if (pagina === 'detalhes') {
            iniciarDetalhes();
        }
    });

})(jQuery);
