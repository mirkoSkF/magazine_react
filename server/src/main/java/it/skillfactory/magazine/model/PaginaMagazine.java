package it.skillfactory.magazine.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Entity
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
public class PaginaMagazine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private int numeroPagina;
    
    private String titolo;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String copertina; // Stringa Base64
    
    private LocalDateTime dataPubblicazione = LocalDateTime.now();

    @Column(columnDefinition = "int default 0")
    private int visualizzazioni;

    private String tipo = "ARTICOLO"; // "ARTICOLO" o "SONDAGGIO"

    @OneToMany(mappedBy = "pagina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ModuloEditor> moduli = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "autore_id")
    private Utente autore;

    // --- AGGIUNTA PER IL SONDAGGIO ---
    @ElementCollection
    @CollectionTable(name = "pagina_voti_sondaggio", joinColumns = @JoinColumn(name = "pagina_id"))
    @MapKeyColumn(name = "opzione_scelta")
    @Column(name = "conteggio_voti")
    private Map<String, Integer> votiSondaggio = new HashMap<>();

    // --- TRACCIAMENTO VOTANTI ---
    @ElementCollection
    @CollectionTable(name = "pagina_identificativi_votanti", joinColumns = @JoinColumn(name = "pagina_id"))
    @Column(name = "identificativo_utente")
    private Set<String> identificativiVotanti = new HashSet<>();

    // --- INTEGRAZIONE PER UI FLUIDA ---
    /**
     * Campo non persistente sul database. 
     * Viene popolato al volo dal Controller per dire al frontend 
     * se l'utente corrente ha già votato.
     */
    @Transient
    private boolean giaVotato;
}