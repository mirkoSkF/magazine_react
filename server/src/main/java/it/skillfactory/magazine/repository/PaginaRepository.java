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

    // AGGIORNATO: Aggiunto p.rubrica in coda alla SELECT leggera
    @Query("SELECT p.id, p.titolo, p.dataPubblicazione, p.visualizzazioni, p.tipo, p.bozza, a.username, p.copertina, p.rubrica " +
           "FROM PaginaMagazine p LEFT JOIN p.autore a")
    List<Object[]> findAllLight();

    @EntityGraph(value = "PaginaMagazine.full", type = EntityGraph.EntityGraphType.LOAD)
    @Query("SELECT p FROM PaginaMagazine p WHERE p.id = :id")
    PaginaMagazine findFullById(@Param("id") Long id);

    long countByTipo(String tipo);

    @Query("SELECT SUM(p.visualizzazioni) FROM PaginaMagazine p")
    Long sumTotalVisualizzazioni();

    @EntityGraph(value = "PaginaMagazine.full", type = EntityGraph.EntityGraphType.LOAD)
    List<PaginaMagazine> findByAutoreId(Long autoreId);

    @Query("SELECT DAY(p.dataPubblicazione), " +
           "COALESCE(SUM(CASE WHEN p.tipo = 'ARTICOLO' THEN 1 ELSE 0 END), 0), " +
           "COALESCE(SUM(CASE WHEN p.tipo = 'SONDAGGIO' THEN 1 ELSE 0 END), 0), " +
           "COALESCE(SUM(CASE WHEN p.tipo = 'RUBRICA' THEN 1 ELSE 0 END), 0), " + 
           "COALESCE(SUM(CASE WHEN p.tipo = 'EDITORIALE' THEN 1 ELSE 0 END), 0), " +
           "COALESCE(SUM(CASE WHEN p.tipo = 'EVENTO' THEN 1 ELSE 0 END), 0), " +
           "COALESCE(SUM(p.visualizzazioni), 0) " + 
           "FROM PaginaMagazine p " +
           "WHERE MONTH(p.dataPubblicazione) = :month AND YEAR(p.dataPubblicazione) = :year " +
           "GROUP BY DAY(p.dataPubblicazione)")
    List<Object[]> findStatsGroupByDay(@Param("month") int month, @Param("year") int year);
}