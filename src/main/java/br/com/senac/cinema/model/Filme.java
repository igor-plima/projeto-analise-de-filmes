package br.com.senac.cinema.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "filme")
public class Filme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Informe o título do filme.")
    @Size(max = 150, message = "O título deve ter no máximo 150 caracteres.")
    @Column(nullable = false, length = 150)
    private String titulo;

    @NotBlank(message = "Informe a sinopse.")
    @Size(max = 1000, message = "A sinopse deve ter no máximo 1000 caracteres.")
    @Column(nullable = false, length = 1000)
    private String sinopse;

    @NotBlank(message = "Selecione o gênero.")
    @Size(max = 50, message = "O gênero deve ter no máximo 50 caracteres.")
    @Column(nullable = false, length = 50)
    private String genero;

    @NotNull(message = "Informe o ano de lançamento.")
    @Min(value = 1888, message = "O ano deve ser maior ou igual a 1888.")
    @Max(value = 2100, message = "O ano deve ser menor ou igual a 2100.")
    @Column(name = "ano_lancamento", nullable = false)
    private Integer anoLancamento;

    @JsonIgnore
    @OneToMany(mappedBy = "filme", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<Analise> analises = new ArrayList<>();

    public Filme() {
    }

    /** Média das notas das análises; null quando ainda não há análises. */
    @JsonIgnore
    public Double getMedia() {
        if (analises.isEmpty()) {
            return null;
        }
        return analises.stream()
                .mapToInt(Analise::getNota)
                .average()
                .orElse(0.0);
    }

    // O id é somente leitura na API: o cliente não consegue escolher/sobrescrever o id.
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getSinopse() {
        return sinopse;
    }

    public void setSinopse(String sinopse) {
        this.sinopse = sinopse;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public Integer getAnoLancamento() {
        return anoLancamento;
    }

    public void setAnoLancamento(Integer anoLancamento) {
        this.anoLancamento = anoLancamento;
    }

    public List<Analise> getAnalises() {
        return analises;
    }

    public void setAnalises(List<Analise> analises) {
        this.analises = analises;
    }
}
