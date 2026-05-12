package it.skillfactory.magazine.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat; // Se Eclipse dà errore qui, premi Ctrl+Shift+O
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

    // NUOVI CAMPI PRIVACY
    private boolean accettaPrivacy;      
    private boolean accettaMarketing;    
    private boolean accettaCessioneTerzi; 

    // Tracciamento sicurezza
    private String deviceId;

    // Metadati
    @Builder.Default
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dataInvio = LocalDateTime.now();

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private StatoPrenotazione stato = StatoPrenotazione.NUOVA;
}

// Rimosso "public" per evitare conflitti nello stesso file
enum StatoPrenotazione {
    NUOVA, IN_CONTATTO, PROGRAMMATA, ARCHIVIATA
}