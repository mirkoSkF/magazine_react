package it.skillfactory.magazine.repository;

import it.skillfactory.magazine.model.PrenotazioneIntervista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrenotazioneIntervistaRepository extends JpaRepository<PrenotazioneIntervista, Long> {
    // Qui potrai aggiungere filtri, ad esempio per cercare per azienda
}