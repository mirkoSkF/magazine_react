package it.skillfactory.magazine.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "eventi")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titolo;

    @Column(length = 1000)
    private String descrizione;

    @Column(name = "data_inizio", nullable = false)
    private LocalDateTime start; // Mappatura diretta FullCalendar

    @Column(name = "data_fine", nullable = false)
    private LocalDateTime end;   // Mappatura diretta FullCalendar

    @Column(name = "colore_sfondo")
    private String backgroundColor; 
}