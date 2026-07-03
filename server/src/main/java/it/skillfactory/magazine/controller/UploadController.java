package it.skillfactory.magazine.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    // Configura il percorso di salvataggio sul server (Default: cartella "uploads" nella cartella corrente di esecuzione)
    @Value("${magazine.upload.dir:./uploads}")
    private String uploadDir;

    // Configura l'URL di base pubblico dove le immagini saranno visibili (es. https://magazine.skillfactory.it/uploads/)
    @Value("${magazine.upload.base-url:https://magazine.skillfactory.it/uploads/}")
    private String baseUrl;

    @PostMapping("/immagine")
    public ResponseEntity<?> uploadImmagine(@RequestParam("file") MultipartFile file, Authentication auth) {
        // Verifica di sicurezza aggiuntiva (comunque garantita da Spring Security)
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato.");
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Il file inviato è vuoto.");
        }

        // Verifica che sia effettivamente un'immagine
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body("Il file deve essere un'immagine valida.");
        }

        try {
            // Crea la directory dei file se non esiste sul disco
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Estrae l'estensione originale del file (es. .jpg, .png)
            String estensioneOriginale = "";
            String nomeOriginale = file.getOriginalFilename();
            if (nomeOriginale != null && nomeOriginale.contains(".")) {
                estensioneOriginale = nomeOriginale.substring(nomeOriginale.lastIndexOf("."));
            } else {
                // Fallback standard se l'estensione non viene rilevata
                estensioneOriginale = ".jpg";
            }

            // Genera un nome di file sicuro e univoco tramite UUID per evitare sovrascritture accidentali
            String nuovoNomeFile = UUID.randomUUID().toString() + estensioneOriginale;

            // Percorso assoluto del file sul disco fisso
            Path percorsoSalvataggio = Paths.get(uploadDir).toAbsolutePath().resolve(nuovoNomeFile);
            Files.copy(file.getInputStream(), percorsoSalvataggio);

            // Costruisce l'URL pubblico da ritornare all'editor React TinyMCE
            String urlImmagineCompleto = baseUrl + nuovoNomeFile;

            // TinyMCE si aspetta una chiave "location" (o configurabile "url") con l'indirizzo dell'immagine
            Map<String, String> rispostaSuccesso = new HashMap<>();
            rispostaSuccesso.put("location", urlImmagineCompleto);

            return ResponseEntity.ok(rispostaSuccesso);

        } catch (IOException e) {
            System.err.println("Errore durante il salvataggio fisico dell'immagine: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Impossibile salvare l'immagine sul server.");
        }
    }
}