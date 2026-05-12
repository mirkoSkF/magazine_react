package it.skillfactory.magazine.controller;

import it.skillfactory.magazine.model.PaginaMagazine;
import it.skillfactory.magazine.model.Utente;
import it.skillfactory.magazine.repository.PaginaRepository;
import it.skillfactory.magazine.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

import java.util.HashSet;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pagine")
public class PaginaController {

    @Autowired
    private PaginaRepository paginaRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    @GetMapping
    public List<PaginaMagazine> getAll() {
        return paginaRepository.findAll();
    }

    // MODIFICATO: Incremento univoco delle visualizzazioni
    @PutMapping("/{id}/view")
    public ResponseEntity<?> incrementaVisualizzazioni(
            @PathVariable Long id,
            @RequestParam(required = false) String fingerprint,
            HttpServletRequest request) {

        // Identifichiamo l'utente (Hardware ID o IP)
        String viewerId = (fingerprint != null)
                ? fingerprint
                : request.getRemoteAddr();

        return paginaRepository.findById(id).map(p -> {

            // Se l'utente è già stato tracciato non incrementiamo
            if (p.getIdentificativiVotanti() != null &&
                    p.getIdentificativiVotanti().contains(viewerId)) {

                return ResponseEntity.ok().build();
            }

            p.setVisualizzazioni(p.getVisualizzazioni() + 1);

            if (p.getIdentificativiVotanti() == null) {
                p.setIdentificativiVotanti(new HashSet<>());
            }

            p.getIdentificativiVotanti().add(viewerId);

            paginaRepository.save(p);

            return ResponseEntity.ok().build();

        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/vota")
    public ResponseEntity<?> votaSondaggio(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            HttpServletRequest request,
            Authentication authentication) {

        String scelta = payload.get("scelta");
        String fingerprint = payload.get("fingerprint");

        String identificativoUtente = (fingerprint != null)
                ? fingerprint
                : request.getRemoteAddr();

        // BLOCCO EDITORI
        if (authentication != null) {

            Utente utente = utenteRepository
                    .findByUsername(authentication.getName())
                    .orElse(null);

            if (utente != null &&
                    utente.getRuolo() != null &&
                    utente.getRuolo().toString().equalsIgnoreCase("EDITORE")) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("Gli editori non possono votare.");
            }
        }

        return paginaRepository.findById(id).map(p -> {

            if (p.getIdentificativiVotanti() != null &&
                    p.getIdentificativiVotanti().contains(identificativoUtente)) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body("Hai già partecipato.");
            }

            Map<String, Integer> voti = p.getVotiSondaggio();

            voti.put(
                    scelta,
                    voti.getOrDefault(scelta, 0) + 1
            );

            p.setVotiSondaggio(voti);

            if (p.getIdentificativiVotanti() == null) {
                p.setIdentificativiVotanti(new HashSet<>());
            }

            p.getIdentificativiVotanti().add(identificativoUtente);

            paginaRepository.save(p);

            return ResponseEntity.ok(voti);

        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaginaMagazine> getById(
            @PathVariable Long id,
            HttpServletRequest request,
            @RequestParam(required = false) String fingerprint) {

        String voterId = (fingerprint != null)
                ? fingerprint
                : request.getRemoteAddr();

        return paginaRepository.findById(id)
                .map(p -> {

                    if (p.getIdentificativiVotanti() != null &&
                            p.getIdentificativiVotanti().contains(voterId)) {

                        p.setGiaVotato(true);
                    }

                    return ResponseEntity.ok(p);

                }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getStats(@PathVariable Long id) {

        return paginaRepository.findById(id)
                .map(p -> ResponseEntity.ok(p.getVotiSondaggio()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mie")
    public List<PaginaMagazine> getMiePagine(Authentication auth) {

        Utente u = utenteRepository
                .findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        return paginaRepository.findByAutoreId(u.getId());
    }

    @PostMapping
    public PaginaMagazine salva(
            @RequestBody PaginaMagazine pagina,
            Authentication auth) {

        Utente u = utenteRepository
                .findByUsername(auth.getName())
                .orElseThrow();

        pagina.setAutore(u);

        if (pagina.getModuli() != null) {

            pagina.getModuli().forEach(modulo ->
                    modulo.setPagina(pagina)
            );
        }

        return paginaRepository.save(pagina);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaginaMagazine> aggiorna(
            @PathVariable Long id,
            @RequestBody PaginaMagazine mod,
            Authentication auth) {

        return paginaRepository.findById(id).map(esistente -> {

            if (!esistente.getAutore()
                    .getUsername()
                    .equals(auth.getName())) {

                return ResponseEntity
                        .status(403)
                        .<PaginaMagazine>build();
            }

            esistente.setTitolo(mod.getTitolo());
            esistente.setCopertina(mod.getCopertina());
            esistente.setNumeroPagina(mod.getNumeroPagina());
            esistente.setTipo(mod.getTipo());

            if (mod.getModuli() != null) {

                esistente.getModuli().clear();

                mod.getModuli().forEach(m -> {
                    m.setPagina(esistente);
                    esistente.getModuli().add(m);
                });
            }

            return ResponseEntity.ok(
                    paginaRepository.save(esistente)
            );

        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> elimina(
            @PathVariable Long id,
            Authentication auth) {

        return paginaRepository.findById(id).map(esistente -> {

            if (!esistente.getAutore()
                    .getUsername()
                    .equals(auth.getName())) {

                return ResponseEntity
                        .status(403)
                        .body("Non sei autorizzato a eliminare questo articolo");
            }

            paginaRepository.delete(esistente);

            return ResponseEntity.ok().build();

        }).orElse(ResponseEntity.notFound().build());
    }
}