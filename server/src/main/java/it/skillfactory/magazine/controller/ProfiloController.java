package it.skillfactory.magazine.controller;

import it.skillfactory.magazine.model.Utente;
import it.skillfactory.magazine.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/profilo")
public class ProfiloController {

    @Autowired
    private UtenteRepository utenteRepository;

    @GetMapping
    public Utente getMioProfilo(Authentication auth) {
        return utenteRepository.findByUsername(auth.getName()).orElseThrow();
    }

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
}