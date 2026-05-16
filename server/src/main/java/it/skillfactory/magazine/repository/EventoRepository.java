package it.skillfactory.magazine.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import it.skillfactory.magazine.model.Evento;

@Repository
public interface EventoRepository extends JpaRepository<Evento, Long> {
    // Eventuali query personalizzate per intervalli di date (es. tra inizio e fine mese)
}