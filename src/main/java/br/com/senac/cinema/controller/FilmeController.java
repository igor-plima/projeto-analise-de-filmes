package br.com.senac.cinema.controller;

import java.util.List;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Controlador das PÁGINAS (front-end).
 * Ele apenas entrega o HTML; os dados são carregados e enviados pelo JavaScript
 * (jQuery/AJAX) que consome a API REST em /api/...
 */
@Controller
public class FilmeController {

    // Lê o cookie "tema" enviado pelo navegador (padrão: claro) e disponibiliza para todas as páginas.
    @ModelAttribute("tema")
    public String tema(@CookieValue(name = TemaController.COOKIE_TEMA, defaultValue = TemaController.CLARO) String tema) {
        return TemaController.normalizar(tema);
    }

    @ModelAttribute("generos")
    public List<String> generos() {
        return List.of("Ação", "Animação", "Aventura", "Comédia", "Documentário",
                "Drama", "Ficção científica", "Musical", "Romance", "Suspense", "Terror");
    }

    @GetMapping("/")
    public String inicio() {
        return "redirect:/filmes";
    }

    // Lista de filmes (GET /api/filmes + DELETE /api/filmes/{id})
    @GetMapping("/filmes")
    public String listar() {
        return "filmes/lista";
    }

    // Formulário de cadastro (POST /api/filmes)
    @GetMapping("/filmes/novo")
    public String novo() {
        return "filmes/form";
    }

    // Formulário de edição (GET + PUT /api/filmes/{id})
    @GetMapping("/filmes/{id}/editar")
    public String editar(@PathVariable Long id, Model model) {
        model.addAttribute("filmeId", id);
        return "filmes/form";
    }

    // Detalhes do filme + análises (GET/POST/PUT/DELETE de análises)
    @GetMapping("/filmes/{id}")
    public String detalhes(@PathVariable Long id, Model model) {
        model.addAttribute("filmeId", id);
        return "filmes/detalhes";
    }
}
