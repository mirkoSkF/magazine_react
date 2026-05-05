package it.skillfactory.magazine.controller;

import it.skillfactory.magazine.model.PaginaMagazine;
import it.skillfactory.magazine.repository.PaginaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pagine")
public class PaginaController {

    @Autowired
    private PaginaRepository paginaRepository;

    @GetMapping
    public List<PaginaMagazine> getAll() {
        return paginaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaginaMagazine> getById(@PathVariable Long id) {
        return paginaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public PaginaMagazine salva(@RequestBody PaginaMagazine pagina) {
        if (pagina.getModuli() != null) {
            pagina.getModuli().forEach(modulo -> modulo.setPagina(pagina));
        }
        return paginaRepository.save(pagina);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaginaMagazine> aggiorna(@PathVariable Long id, @RequestBody PaginaMagazine paginaModificata) {
        return paginaRepository.findById(id)
            .map(paginaEsistente -> {
                paginaEsistente.setNumeroPagina(paginaModificata.getNumeroPagina());
                if (paginaModificata.getModuli() != null) {
                    paginaEsistente.getModuli().clear();
                    paginaModificata.getModuli().forEach(m -> {
                        m.setPagina(paginaEsistente);
                        paginaEsistente.getModuli().add(m);
                    });
                }
                return ResponseEntity.ok(paginaRepository.save(paginaEsistente));
            }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> elimina(@PathVariable Long id) {
        return paginaRepository.findById(id)
            .map(p -> {
                paginaRepository.delete(p);
                return ResponseEntity.ok().build();
            }).orElse(ResponseEntity.notFound().build());
    }
}