package it.skillfactory.magazine.controller;

import it.skillfactory.magazine.model.PrenotazioneIntervista;
import it.skillfactory.magazine.repository.PrenotazioneIntervistaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviste")
@CrossOrigin(origins = "*") // Assicurati che CORS sia attivo se necessario
public class IntervistaController {

    @Autowired
    private PrenotazioneIntervistaRepository repository;

    @PostMapping("/prenota")
    public ResponseEntity<?> prenotaIntervista(@RequestBody PrenotazioneIntervista prenotazione) {
        try {
            // Validazione lato server minima per la privacy obbligatoria
            if (!prenotazione.isAccettaPrivacy()) {
                return ResponseEntity.badRequest().body("È necessario accettare l'informativa sulla privacy.");
            }
            return ResponseEntity.ok(repository.save(prenotazione));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore salvataggio");
        }
    }

    @GetMapping("/elenco")
    public ResponseEntity<?> getTutteLePrenotazioni() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDettaglio(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> elimina(@PathVariable Long id) {
        try {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}