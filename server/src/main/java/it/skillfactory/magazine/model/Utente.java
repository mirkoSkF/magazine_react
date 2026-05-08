package it.skillfactory.magazine.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    private String ruolo; 
    
    private String nome;
    private String cognome;

    // --- INTEGRAZIONE: FOTO PROFILO ---
    @Lob
    @Column(name = "foto_profilo", columnDefinition = "LONGTEXT")
    private String fotoProfilo;
}