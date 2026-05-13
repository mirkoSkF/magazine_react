package it.skillfactory.magazine.repository;

import it.skillfactory.magazine.model.PaginaMagazine;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaginaRepository extends JpaRepository<PaginaMagazine, Long> {

    @EntityGraph(value = "PaginaMagazine.full", type = EntityGraph.EntityGraphType.LOAD)
    List<PaginaMagazine> findByAutoreId(Long autoreId);

    @Override
    @EntityGraph(value = "PaginaMagazine.full", type = EntityGraph.EntityGraphType.LOAD)
    List<PaginaMagazine> findAll();

    long countByTipo(String tipo);

    @Query("SELECT SUM(p.visualizzazioni) FROM PaginaMagazine p")
    Long sumTotalVisualizzazioni();

    @Query("SELECT DAY(p.dataPubblicazione), " +
           "SUM(CASE WHEN p.tipo = 'ARTICOLO' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN p.tipo = 'SONDAGGIO' THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN p.tipo = 'RUBRICA' THEN 1 ELSE 0 END), " + 
           "SUM(p.visualizzazioni) " + 
           "FROM PaginaMagazine p " +
           "WHERE MONTH(p.dataPubblicazione) = :month AND YEAR(p.dataPubblicazione) = :year " +
           "GROUP BY DAY(p.dataPubblicazione)")
    List<Object[]> findStatsGroupByDay(@Param("month") int month, @Param("year") int year);
}