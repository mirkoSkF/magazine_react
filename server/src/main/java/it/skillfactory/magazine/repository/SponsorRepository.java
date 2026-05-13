package it.skillfactory.magazine.repository;

import it.skillfactory.magazine.model.Sponsor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SponsorRepository extends JpaRepository<Sponsor, Long> {
    
    List<Sponsor> findByPosizioneAndTipoPaginaAndAttivoTrue(String posizione, String tipoPagina);
    
    List<Sponsor> findByPosizioneAndAttivoTrue(String posizione);

    // Calcola la somma totale usando il tuo campo clickCount
    @Query("SELECT SUM(s.clickCount) FROM Sponsor s")
    Long sumTotalClicks();

    /**
     * Recupera i click giornalieri raggruppati per giorno del mese.
     * Richiede un'entità che logga i singoli eventi di click.
     */
    @Query("SELECT DAY(c.dataClick), COUNT(c) " +
           "FROM ClickSponsor c " +
           "WHERE MONTH(c.dataClick) = :month AND YEAR(c.dataClick) = :year " +
           "GROUP BY DAY(c.dataClick)")
    List<Object[]> findClicksGroupByDay(@Param("month") int month, @Param("year") int year);
}