package it.skillfactory.magazine.repository;

import it.skillfactory.magazine.model.PaginaMagazine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaginaRepository extends JpaRepository<PaginaMagazine, Long> {
    // Qui Spring creerà automaticamente tutti i metodi per salvare, 
    // cancellare e cercare le pagine.
}