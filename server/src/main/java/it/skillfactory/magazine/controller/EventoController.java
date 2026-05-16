package it.skillfactory.magazine.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import it.skillfactory.magazine.model.Evento;
import it.skillfactory.magazine.repository.EventoRepository;
import java.util.List;

@RestController
@RequestMapping("/api/eventi")
@CrossOrigin(origins = "*") 
public class EventoController {

    @Autowired
    private EventoRepository eventoRepository;

    @GetMapping
    public List<Evento> getAllEventi() {
        return eventoRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Evento> createEvento(@RequestBody Evento evento) {
        Evento salvato = eventoRepository.save(evento);
        return ResponseEntity.ok(salvato);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvento(@PathVariable Long id) {
        return eventoRepository.findById(id)
                .map(evento -> {
                    eventoRepository.delete(evento);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}