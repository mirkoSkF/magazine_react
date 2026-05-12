package it.skillfactory.magazine.controller;

import it.skillfactory.magazine.model.Sponsor;
import it.skillfactory.magazine.repository.SponsorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/sponsors")
@CrossOrigin(origins = "*") // Assicurati di gestire i CORS se necessario
public class SponsorController {

    @Autowired 
    private SponsorRepository sponsorRepository;

    // --- PUBBLICI ---
    
    @GetMapping("/random")
    public ResponseEntity<Sponsor> getRandomSponsor(
            @RequestParam String posizione,
            @RequestParam String tipoPagina) { // Parametro aggiunto
        
        // Cerchiamo solo gli sponsor che corrispondono a TUTTI i criteri
        List<Sponsor> attivi = sponsorRepository.findByPosizioneAndTipoPaginaAndAttivoTrue(posizione, tipoPagina);
        
        if (attivi.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        Collections.shuffle(attivi);
        return ResponseEntity.ok(attivi.get(0));
    }

    @PatchMapping("/{id}/click")
    public ResponseEntity<?> incrementaClick(@PathVariable Long id) {
        return sponsorRepository.findById(id).map(s -> {
            s.setClickCount(s.getClickCount() + 1);
            sponsorRepository.save(s);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- PROTETTI (Richiedono Token) ---

    @GetMapping
    public List<Sponsor> getAll() {
        return sponsorRepository.findAll();
    }

    @PostMapping
    public Sponsor creaSponsor(@RequestBody Sponsor sponsor) {
        // Se il clickCount non è inviato, inizializzalo a 0
        return sponsorRepository.save(sponsor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> elimina(@PathVariable Long id) {
        return sponsorRepository.findById(id).map(s -> {
            sponsorRepository.delete(s);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}