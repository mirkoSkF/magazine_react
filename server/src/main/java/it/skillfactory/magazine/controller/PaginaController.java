package it.skillfactory.magazine.controller;

import it.skillfactory.magazine.model.PaginaMagazine;
import it.skillfactory.magazine.model.Utente;
import it.skillfactory.magazine.repository.PaginaRepository;
import it.skillfactory.magazine.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pagine")
public class PaginaController {

    @Autowired
    private PaginaRepository paginaRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return paginaRepository.findAllLight().stream().map(obj -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", obj[0]);
            map.put("titolo", obj[1]);
            map.put("dataPubblicazione", obj[2]);
            map.put("visualizzazioni", obj[3]);
            map.put("tipo", obj[4]);
            map.put("bozza", obj[5]);
            map.put("autore", obj[6]);
            map.put("copertina", obj[7]); 
            map.put("rubrica", obj[8]); // Mappatura della rubrica nella risposta leggera
            map.put("sottotitolo", obj[9]); // Mappatura del sottotitolo ricavato dall'indice 9 della query light
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<PaginaMagazine> getById(
            @PathVariable Long id,
            HttpServletRequest request,
            @RequestParam(required = false) String fingerprint) {

        String voterId = (fingerprint != null) ? fingerprint : request.getRemoteAddr();

        return paginaRepository.findById(id) 
                .map(p -> {
                    if (p.getIdentificativiVotanti() != null && p.getIdentificativiVotanti().contains(voterId)) {
                        p.setGiaVotato(true);
                    }
                    calcolaStatisticheSondaggio(p);
                    return ResponseEntity.ok(p);
                }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mie")
    public List<PaginaMagazine> getMiePagine(Authentication auth) {
        Utente u = utenteRepository
                .findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        List<PaginaMagazine> pagine = paginaRepository.findByAutoreId(u.getId());
        pagine.forEach(this::calcolaStatisticheSondaggio);
        return pagine;
    }

    @PostMapping
    public PaginaMagazine salva(@RequestBody PaginaMagazine pagina, Authentication auth) {
        Utente u = utenteRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utente autenticato non trovato"));

        pagina.setAutore(u);
        if (pagina.getModuli() != null) {
            pagina.getModuli().forEach(modulo -> modulo.setPagina(pagina));
        }
        return paginaRepository.save(pagina);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<PaginaMagazine> aggiorna(
            @PathVariable Long id,
            @RequestBody PaginaMagazine mod,
            Authentication auth) {

        return paginaRepository.findById(id).map(esistente -> {
            if (!esistente.getAutore().getUsername().equals(auth.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).<PaginaMagazine>build();
            }

            esistente.setTitolo(mod.getTitolo());
            esistente.setSottotitolo(mod.getSottotitolo()); // Aggiornamento del valore sottotitolo nel record persistito
            esistente.setCopertina(mod.getCopertina());
            esistente.setNumeroPagina(mod.getNumeroPagina()); 
            esistente.setTipo(mod.getTipo());
            esistente.setBozza(mod.isBozza()); 
            esistente.setRubrica(mod.getRubrica()); // Assegnazione del valore rubrica al record persistito

            if (mod.getModuli() != null) {
                esistente.getModuli().clear();
                mod.getModuli().forEach(m -> {
                    m.setPagina(esistente);
                    esistente.getModuli().add(m);
                });
            }

            if (mod.getVotiSondaggio() != null) esistente.setVotiSondaggio(mod.getVotiSondaggio());
            if (mod.getIdentificativiVotanti() != null) esistente.setIdentificativiVotanti(mod.getIdentificativiVotanti());
            if (mod.getIdentificativiVisualizzazioni() != null) esistente.setIdentificativiVisualizzazioni(mod.getIdentificativiVisualizzazioni());

            PaginaMagazine salvata = paginaRepository.save(esistente);
            calcolaStatisticheSondaggio(salvata);
            return ResponseEntity.ok(salvata);
        }).orElse(ResponseEntity.<PaginaMagazine>notFound().build()); // 🛠️ CORRETTO: Tipizzato esplicitamente per l'inferenza del compilatore
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> elimina(@PathVariable Long id, Authentication auth) {
        return paginaRepository.findById(id).map(esistente -> {
            if (!esistente.getAutore().getUsername().equals(auth.getName())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Non autorizzato");
            }
            paginaRepository.delete(esistente);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/view")
    @Transactional 
    public ResponseEntity<?> incrementaVisualizzazioni(@PathVariable Long id, @RequestParam(required = false) String fingerprint, HttpServletRequest request) {
        String viewerId = (fingerprint != null) ? fingerprint : request.getRemoteAddr();
        return paginaRepository.findById(id).map(p -> {
            if (p.getIdentificativiVisualizzazioni() != null && p.getIdentificativiVisualizzazioni().contains(viewerId)) {
                return ResponseEntity.ok().build();
            }
            p.setVisualizzazioni(p.getVisualizzazioni() + 1);
            if (p.getIdentificativiVisualizzazioni() == null) p.setIdentificativiVisualizzazioni(new HashSet<>());
            p.getIdentificativiVisualizzazioni().add(viewerId);
            paginaRepository.save(p);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/vota")
    @Transactional 
    public ResponseEntity<?> votaSondaggio(@PathVariable Long id, @RequestBody Map<String, String> payload, HttpServletRequest request) {
        String scelta = payload.get("scelta");
        String fingerprint = payload.get("fingerprint"); 
        String voterId = (fingerprint != null && !fingerprint.trim().isEmpty()) ? fingerprint : request.getRemoteAddr();

        if (scelta == null || scelta.trim().isEmpty()) return ResponseEntity.badRequest().build();

        return paginaRepository.findById(id).map(p -> {
            if (p.getIdentificativiVotanti() != null && p.getIdentificativiVotanti().contains(voterId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Già votato");
            }
            if (p.getVotiSondaggio() == null) p.setVotiSondaggio(new HashMap<>());
            p.getVotiSondaggio().put(scelta, p.getVotiSondaggio().getOrDefault(scelta, 0) + 1);
            if (p.getIdentificativiVotanti() == null) p.setIdentificativiVotanti(new HashSet<>());
            p.getIdentificativiVotanti().add(voterId);
            paginaRepository.saveAndFlush(p);
            return ResponseEntity.ok(p.getVotiSondaggio());
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getStats(@PathVariable Long id) {
        return paginaRepository.findById(id).map(p -> ResponseEntity.ok(p.getVotiSondaggio())).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/pubblica")
    @Transactional
    public ResponseEntity<?> pubblica(@PathVariable Long id, Authentication auth) {
        return paginaRepository.findById(id).map(esistente -> {
            if (!esistente.getAutore().getUsername().equals(auth.getName())) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            esistente.setBozza(false);
            esistente.setDataPubblicazione(LocalDateTime.now()); 
            paginaRepository.save(esistente);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/share/{id}", produces = org.springframework.http.MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> renderSharePage(@PathVariable Long id) {
        PaginaMagazine pagina = paginaRepository.findById(id).orElse(null);
        String titolo = "Magazine Skill Factory";
        String urlImmagine = "https://magazine.skillfactory.it/logoSF.png"; 

        if (pagina != null) {
            titolo = pagina.getTitolo();
            if (pagina.getCopertina() != null) urlImmagine = pagina.getCopertina();
        }

        String html = "<!doctype html><html><head><title>" + titolo + "</title>"
                + "<meta property='og:title' content='" + titolo + "'>"
                + "<meta property='og:image' content='" + urlImmagine + "'>"
                + "<script>window.location.href = 'https://magazine.skillfactory.it/?articolo=" + id + "';</script>"
                + "</head><body></body></html>";
        return ResponseEntity.ok(html);
    }

    private void calcolaStatisticheSondaggio(PaginaMagazine p) {
        int totale = (p.getVotiSondaggio() != null) ? p.getVotiSondaggio().values().stream().mapToInt(Integer::intValue).sum() : 0;
        p.setTotaleVotanti(totale);
        Map<String, Double> percentuali = new HashMap<>();
        if (totale > 0 && p.getVotiSondaggio() != null) {
            p.getVotiSondaggio().forEach((k, v) -> percentuali.put(k, Math.round(((double) v / totale) * 1000.0) / 10.0));
        }
        p.setPercentualiSondaggio(percentuali);
    }
}