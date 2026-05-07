package it.skillfactory.magazine.controller;

import it.skillfactory.magazine.model.Utente;
import it.skillfactory.magazine.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/profilo")
public class ProfiloController {

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Recupera i dati dell'editore loggato
    @GetMapping
    public Utente getMioProfilo(Authentication auth) {
        return utenteRepository.findByUsername(auth.getName()).orElseThrow();
    }

    // Gestisce l'upload della foto profilo in Base64
    @PostMapping("/upload-foto")
    public ResponseEntity<?> uploadFoto(@RequestParam("file") MultipartFile file, Authentication auth) {
        try {
            Utente u = utenteRepository.findByUsername(auth.getName()).orElseThrow();
            String base64 = Base64.getEncoder().encodeToString(file.getBytes());
            u.setFotoProfilo(base64);
            utenteRepository.save(u);
            return ResponseEntity.ok(Map.of("foto", base64));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore upload");
        }
    }

    // NUOVO: Gestisce il cambio password
    @PostMapping("/cambia-password")
    public ResponseEntity<?> cambiaPassword(@RequestBody Map<String, String> payload, Authentication auth) {
        String vecchiaPassword = payload.get("vecchiaPassword");
        String nuovaPassword = payload.get("nuovaPassword");

        Utente u = utenteRepository.findByUsername(auth.getName()).orElseThrow();

        // Verifica se la vecchia password inserita corrisponde a quella nel DB
        if (!passwordEncoder.matches(vecchiaPassword, u.getPassword())) {
            return ResponseEntity.status(400).body("La vecchia password non è corretta");
        }

        // Cripta e salva la nuova password
        u.setPassword(passwordEncoder.encode(nuovaPassword));
        utenteRepository.save(u);

        return ResponseEntity.ok(Map.of("messaggio", "Password aggiornata con successo"));
    }
}