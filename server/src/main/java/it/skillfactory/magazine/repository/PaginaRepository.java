package it.skillfactory.magazine.repository;

import it.skillfactory.magazine.model.PaginaMagazine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaginaRepository extends JpaRepository<PaginaMagazine, Long> {
    // Trova articoli per ID autore
    List<PaginaMagazine> findByAutoreId(Long autoreId);
}