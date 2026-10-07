package br.com.senac.cinema.controller;

import br.com.senac.cinema.exception.RecursoNaoEncontradoException;
import br.com.senac.cinema.model.Filme;
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
@RequestMapping("/api/filmes")
public class FilmeRestController {

    private final FilmeRepository filmeRepository;

    public FilmeRestController(FilmeRepository filmeRepository) {
        this.filmeRepository = filmeRepository;
    }

    // GET /api/filmes
    @GetMapping
    public List<Filme> listar() {
        return filmeRepository.findAll();
    }

    // GET /api/filmes/{id}
    @GetMapping("/{id}")
    public Filme buscar(@PathVariable Long id) {
        return buscarOuFalhar(id);
    }

    // POST /api/filmes
    @PostMapping
    public ResponseEntity<Filme> criar(@Valid @RequestBody Filme dados) {
        dados.setId(null); // garante INSERT, nunca sobrescreve um registro existente
        Filme salvo = filmeRepository.save(dados);
        URI local = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(salvo.getId()).toUri();
        return ResponseEntity.created(local).body(salvo);
    }

    // PUT /api/filmes/{id}
    @PutMapping("/{id}")
    public Filme atualizar(@PathVariable Long id, @Valid @RequestBody Filme dados) {
        Filme existente = buscarOuFalhar(id);
        existente.setTitulo(dados.getTitulo());
        existente.setSinopse(dados.getSinopse());
        existente.setGenero(dados.getGenero());
        existente.setAnoLancamento(dados.getAnoLancamento());
        return filmeRepository.save(existente);
    }

    // DELETE /api/filmes/{id}  (apaga também as análises do filme)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        Filme existente = buscarOuFalhar(id);
        filmeRepository.delete(existente);
        return ResponseEntity.noContent().build();
    }

    private Filme buscarOuFalhar(Long id) {
        return filmeRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Filme não encontrado: id " + id));
    }
}
