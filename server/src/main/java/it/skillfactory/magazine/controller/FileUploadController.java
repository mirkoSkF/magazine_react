package it.skillfactory.magazine.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
public class FileUploadController {

    // Definiamo il percorso assoluto sul server o relativo. 
    // Puoi impostare una cartella "uploads" nella root dell'applicazione.
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + File.separator + "uploads";

    @PostMapping("/immagine")
    public ResponseEntity<?> uploadImmagine(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Il file inviato è vuoto.");
        }

        try {
            // 1. Assicuriamoci che la cartella di destinazione esista
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 2. Generiamo un nome univoco per evitare sovrascritture causate da file con lo stesso nome
            String estensione = "";
            String nomeOriginale = file.getOriginalFilename();
            if (nomeOriginale != null && nomeOriginale.contains(".")) {
                estensione = nomeOriginale.substring(nomeOriginale.lastIndexOf("."));
            }
            String nuovoNomeFile = UUID.randomUUID().toString() + estensione;

            // 3. Salviamo il file fisicamente nel filesystem del server
            Path percorsoFile = Paths.get(UPLOAD_DIR, nuovoNomeFile);
            Files.write(percorsoFile, file.getBytes());

            // 4. Ritorniamo l'URL pubblico che punterà alla risorsa statica
            // Nel punto successivo configureremo Spring per mappare la cartella /uploads/ sul percorso web /uploads/
            String urlPubblico = "https://magazine.skillfactory.it/uploads/" + nuovoNomeFile;

            Map<String, String> risposta = new HashMap<>();
            risposta.put("location", urlPubblico); // "location" è lo standard richiesto da TinyMCE
            risposta.put("url", urlPubblico);

            return ResponseEntity.ok(risposta);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Errore durante il salvataggio del file sul server.");
        }
    }
}