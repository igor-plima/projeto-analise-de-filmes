package br.com.senac.cinema.controller;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Guarda a preferência de tema (claro/escuro) do usuário em um COOKIE.
 * O navegador devolve o cookie em toda requisição, então o servidor já entrega
 * a página no tema correto, mesmo depois de fechar e abrir o navegador.
 */
@RestController
@RequestMapping("/tema")
public class TemaController {

    public static final String COOKIE_TEMA = "tema";
    public static final String CLARO = "claro";
    public static final String ESCURO = "escuro";

    /** Aceita somente valores conhecidos; qualquer outra coisa (cookie adulterado) vira "claro". */
    public static String normalizar(String valor) {
        return ESCURO.equals(valor) ? ESCURO : CLARO;
    }

    // POST /tema   (corpo: tema=claro | tema=escuro)
    @PostMapping
    public ResponseEntity<Map<String, String>> definir(@RequestParam("tema") String tema,
                                                       HttpServletRequest request) {
        if (!CLARO.equals(tema) && !ESCURO.equals(tema)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tema inválido. Use 'claro' ou 'escuro'.");
        }

        // Path = contexto da aplicação (ex.: /cinema-avaliacoes no Tomcat), para o cookie
        // não ser enviado a outras aplicações hospedadas no mesmo servidor.
        String caminho = request.getContextPath().isEmpty() ? "/" : request.getContextPath();

        ResponseCookie cookie = ResponseCookie.from(COOKIE_TEMA, tema)
                .path(caminho)
                .maxAge(Duration.ofDays(365))   // persiste por 1 ano
                .httpOnly(true)                 // JavaScript não consegue ler/alterar o cookie
                .secure(request.isSecure())     // só trafega por HTTPS quando o site usa HTTPS
                .sameSite("Lax")                // não é enviado em requisições vindas de outros sites
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("tema", tema));
    }
}
