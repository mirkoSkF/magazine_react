package it.skillfactory.magazine.controller;

import it.skillfactory.magazine.model.PrenotazioneIntervista;
import it.skillfactory.magazine.repository.PrenotazioneIntervistaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviste")
public class IntervistaController {

    @Autowired
    private PrenotazioneIntervistaRepository repository;

    @PostMapping("/prenota")
    public ResponseEntity<?> prenotaIntervista(@RequestBody PrenotazioneIntervista prenotazione) {
        try {
            return ResponseEntity.ok(repository.save(prenotazione));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore salvataggio");
        }
    }

    @GetMapping("/elenco")
    public ResponseEntity<?> getTutteLePrenotazioni() {
        return ResponseEntity.ok(repository.findAll());
    }

    // AGGIUNGI SOLO QUESTI DUE PER IL FUNZIONAMENTO DEI TASTI
    @GetMapping("/{id}")
    public ResponseEntity<?> getDettaglio(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> elimina(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}