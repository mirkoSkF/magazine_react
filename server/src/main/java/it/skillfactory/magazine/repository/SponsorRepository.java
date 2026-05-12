package it.skillfactory.magazine.repository;

import it.skillfactory.magazine.model.Sponsor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SponsorRepository extends JpaRepository<Sponsor, Long> {
    
    // Filtra per posizione, tipo pagina e assicura che sia attivo
    List<Sponsor> findByPosizioneAndTipoPaginaAndAttivoTrue(String posizione, String tipoPagina);
    
    // Se ti serve ancora il vecchio metodo (opzionale)
    List<Sponsor> findByPosizioneAndAttivoTrue(String posizione);
}