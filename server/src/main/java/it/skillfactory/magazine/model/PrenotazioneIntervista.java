package it.skillfactory.magazine.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data 
@NoArgsConstructor 
@AllArgsConstructor
@Builder
public class PrenotazioneIntervista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Dati dell'azienda
    private String azienda;
    private String referente;
    private String email;
    private String telefono;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String messaggio;

    // Tracciamento sicurezza (dal tuo React deviceId)
    private String deviceId;

    // Metadati
    private LocalDateTime dataInvio = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private StatoPrenotazione stato = StatoPrenotazione.NUOVA;
}

// Enum per la gestione dei flussi nella dashboard futura
enum StatoPrenotazione {
    NUOVA, IN_CONTATTO, PROGRAMMATA, ARCHIVIATA
}