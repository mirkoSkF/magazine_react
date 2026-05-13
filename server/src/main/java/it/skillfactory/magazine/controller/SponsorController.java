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
@CrossOrigin(origins = "*")
public class SponsorController {

    @Autowired
    private SponsorRepository sponsorRepository;

    // =========================
    // RANDOM SPONSOR
    // =========================

    @GetMapping("/random")
    public ResponseEntity<Sponsor> getRandomSponsor(
            @RequestParam String posizione,
            @RequestParam String tipoPagina) {

        List<Sponsor> attivi =
                sponsorRepository.findByPosizioneAndTipoPaginaAndAttivoTrue(
                        posizione,
                        tipoPagina
                );

        if (attivi.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        Collections.shuffle(attivi);

        Sponsor sponsor = attivi.get(0);

        if (sponsor.getClickCount() == null) {
            sponsor.setClickCount(0);
        }

        return ResponseEntity.ok(sponsor);
    }

    // =========================
    // INCREMENTO CLICK
    // =========================

    @PatchMapping("/{id}/click")
    public ResponseEntity<?> incrementaClick(@PathVariable Long id) {

        return sponsorRepository.findById(id).map(sponsor -> {

            Integer current = sponsor.getClickCount();

            if (current == null) {
                current = 0;
            }

            sponsor.setClickCount(current + 1);

            sponsorRepository.saveAndFlush(sponsor);

            return ResponseEntity.ok(sponsor);

        }).orElse(ResponseEntity.notFound().build());
    }

    // =========================
    // GET ALL
    // =========================

    @GetMapping
    public List<Sponsor> getAll() {

        List<Sponsor> sponsors = sponsorRepository.findAll();

        sponsors.forEach(s -> {
            if (s.getClickCount() == null) {
                s.setClickCount(0);
            }
        });

        return sponsors;
    }

    // =========================
    // CREA
    // =========================

    @PostMapping
    public Sponsor creaSponsor(@RequestBody Sponsor sponsor) {

        if (sponsor.getClickCount() == null) {
            sponsor.setClickCount(0);
        }

        return sponsorRepository.save(sponsor);
    }

    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> elimina(@PathVariable Long id) {

        return sponsorRepository.findById(id).map(sponsor -> {

            sponsorRepository.delete(sponsor);

            return ResponseEntity.ok().build();

        }).orElse(ResponseEntity.notFound().build());
    }
}