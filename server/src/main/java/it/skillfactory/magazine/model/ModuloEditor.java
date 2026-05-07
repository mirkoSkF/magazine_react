package it.skillfactory.magazine.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModuloEditor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo; // "TESTO" o "IMMAGINE"
    
    @Lob // Usiamo Lob perché se il testo è lungo o l'immagine è Base64 serve spazio
    @Column(columnDefinition = "LONGTEXT")
    private String contenuto; 

    // Posizionamento libero (il "DTP" che dicevamo)
    private double coordinataX;
    private double coordinataY;
    private double larghezza;
    private double altezza;

    // Stile specifico per questo singolo modulo
    private String fontFamily;   // es. "Arial"
    private String fontWeight;   // es. "bold"
    private int fontSize;        // es. 18
    private String colore;       // es. "#ff0000"

    @ManyToOne
    @JoinColumn(name = "pagina_id")
    @JsonIgnore // Fondamentale: evita che il JSON impazzisca tra Pagina -> Modulo -> Pagina
    private PaginaMagazine pagina;
}