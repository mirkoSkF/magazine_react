package it.skillfactory.magazine.model;

import jakarta.persistence.*;
import lombok.*;
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

    // Cambia JoinColumn con mappedBy
    @OneToMany(mappedBy = "pagina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ModuloEditor> moduli = new ArrayList<>();
}