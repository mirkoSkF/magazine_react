package it.skillfactory.magazine.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
public class PaginaMagazine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private int numeroPagina;
    
    private LocalDateTime dataPubblicazione = LocalDateTime.now();

    @OneToMany(mappedBy = "pagina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ModuloEditor> moduli = new ArrayList<>();

    // --- INTEGRAZIONE: RELAZIONE CON L'UTENTE ---
    @ManyToOne
    @JoinColumn(name = "autore_id")
    private Utente autore;
}
