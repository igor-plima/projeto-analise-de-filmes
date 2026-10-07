package br.com.senac.cinema.repository;

import br.com.senac.cinema.model.Analise;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AnaliseRepository extends JpaRepository<Analise, Long> {

    // JPQL com parâmetro nomeado: o valor nunca é concatenado ao SQL (protege contra SQL Injection).
    @Query("select a from Analise a where a.filme.id = :filmeId order by a.id asc")
    List<Analise> buscarPorFilme(@Param("filmeId") Long filmeId);
}
