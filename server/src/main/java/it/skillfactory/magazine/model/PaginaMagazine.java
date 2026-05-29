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
@NamedEntityGraph(
    name = "PaginaMagazine.full",
    attributeNodes = {
        @NamedAttributeNode("moduli"),
        @NamedAttributeNode("votiSondaggio"),
        @NamedAttributeNode("identificativiVotanti"),
        @NamedAttributeNode("identificativiVisualizzazioni"),
        @NamedAttributeNode("autore")
    }
)
public class PaginaMagazine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private int numeroPagina;
    
    private String titolo;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String copertina; 
    
    private LocalDateTime dataPubblicazione = LocalDateTime.now();

    @Column(columnDefinition = "int default 0")
    private int visualizzazioni;

    private String tipo = "ARTICOLO"; // "ARTICOLO" o "SONDAGGIO"

    @Column(name = "bozza", columnDefinition = "boolean default true", nullable = false)
    private boolean bozza = true; 

    @OneToMany(mappedBy = "pagina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ModuloEditor> moduli = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "autore_id")
    private Utente autore;

    @ElementCollection
    @CollectionTable(name = "pagina_voti_sondaggio", joinColumns = @JoinColumn(name = "pagina_id"))
    @MapKeyColumn(name = "opzione_scelta")
    @Column(name = "conteggio_voti")
    private Map<String, Integer> votiSondaggio = new HashMap<>();

    @ElementCollection
    @CollectionTable(name = "pagina_identificativi_votanti", joinColumns = @JoinColumn(name = "pagina_id"))
    @Column(name = "identificativo_utente")
    private Set<String> identificativiVotanti = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "pagina_identificativi_visualizzazioni", joinColumns = @JoinColumn(name = "pagina_id"))
    @Column(name = "identificativo_visualizzatore")
    private Set<String> identificativiVisualizzazioni = new HashSet<>();

    @Transient
    private boolean giaVotato;

    @Transient
    private int totaleVotanti;

    @Transient
    private Map<String, Double> percentualiSondaggio = new HashMap<>();
}
