package br.com.senac.cinema.controller;

import br.com.senac.cinema.exception.RecursoNaoEncontradoException;
import br.com.senac.cinema.model.Analise;
import br.com.senac.cinema.model.Filme;
import br.com.senac.cinema.repository.AnaliseRepository;
import br.com.senac.cinema.repository.FilmeRepository;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api")
public class AnaliseRestController {

    private final AnaliseRepository analiseRepository;
    private final FilmeRepository filmeRepository;

    public AnaliseRestController(AnaliseRepository analiseRepository, FilmeRepository filmeRepository) {
        this.analiseRepository = analiseRepository;
        this.filmeRepository = filmeRepository;
    }

    // GET /api/filmes/{filmeId}/analises
    @GetMapping("/filmes/{filmeId}/analises")
    public List<Analise> listarDoFilme(@PathVariable Long filmeId) {
        if (!filmeRepository.existsById(filmeId)) {
            throw new RecursoNaoEncontradoException("Filme não encontrado: id " + filmeId);
        }
        return analiseRepository.buscarPorFilme(filmeId);
    }

    // POST /api/filmes/{filmeId}/analises
    @PostMapping("/filmes/{filmeId}/analises")
    public ResponseEntity<Analise> criar(@PathVariable Long filmeId, @Valid @RequestBody Analise dados) {
        Filme filme = filmeRepository.findById(filmeId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Filme não encontrado: id " + filmeId));
        dados.setId(null);
        dados.setFilme(filme);
        Analise salva = analiseRepository.save(dados);
        URI local = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/analises/{id}").buildAndExpand(salva.getId()).toUri();
        return ResponseEntity.created(local).body(salva);
    }

    // GET /api/analises/{id}
    @GetMapping("/analises/{id}")
    public Analise buscar(@PathVariable Long id) {
        return buscarOuFalhar(id);
    }

    // PUT /api/analises/{id}
    @PutMapping("/analises/{id}")
    public Analise atualizar(@PathVariable Long id, @Valid @RequestBody Analise dados) {
        Analise existente = buscarOuFalhar(id);
        existente.setAnalise(dados.getAnalise());
        existente.setNota(dados.getNota());
        return analiseRepository.save(existente);
    }

    // DELETE /api/analises/{id}
    @DeleteMapping("/analises/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        Analise existente = buscarOuFalhar(id);
        analiseRepository.delete(existente);
        return ResponseEntity.noContent().build();
    }

    private Analise buscarOuFalhar(Long id) {
        return analiseRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Análise não encontrada: id " + id));
    }
}
