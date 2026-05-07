package it.skillfactory.magazine.controller;

import it.skillfactory.magazine.model.PaginaMagazine;
import it.skillfactory.magazine.model.Utente;
import it.skillfactory.magazine.repository.PaginaRepository;
import it.skillfactory.magazine.repository.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pagine")
public class PaginaController {

	@Autowired private PaginaRepository paginaRepository;
	@Autowired private UtenteRepository utenteRepository;

	// 1. Metodo per la lista generale
	@GetMapping
	public List<PaginaMagazine> getAll() {
		return paginaRepository.findAll();
	}

	// 2. Metodo per le MIE pagine (Messo PRIMA di quello con {id})
	@GetMapping("/mie")
	public List<PaginaMagazine> getMiePagine(Authentication auth) {
		Utente u = utenteRepository.findByUsername(auth.getName())
				.orElseThrow(() -> new RuntimeException("Utente non trovato"));
		return paginaRepository.findByAutoreId(u.getId());
	}

	// 3. Metodo per caricare una singola pagina nell'editor
	@GetMapping("/{id}")
	public ResponseEntity<PaginaMagazine> getById(@PathVariable Long id) {
		return paginaRepository.findById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	// 4. Metodo per salvare (Pubblica)
	@PostMapping
	public PaginaMagazine salva(@RequestBody PaginaMagazine pagina, Authentication auth) {
		Utente u = utenteRepository.findByUsername(auth.getName()).orElseThrow();
		pagina.setAutore(u); 
		if (pagina.getModuli() != null) {
			pagina.getModuli().forEach(modulo -> modulo.setPagina(pagina));
		}
		return paginaRepository.save(pagina);
	}

	// 5. Metodo per modificare (Salva modifiche)
	@PutMapping("/{id}")
	public ResponseEntity<PaginaMagazine> aggiorna(@PathVariable Long id, @RequestBody PaginaMagazine mod, Authentication auth) {
		return paginaRepository.findById(id).map(esistente -> {
			// Controllo sicurezza autore
			if (!esistente.getAutore().getUsername().equals(auth.getName())) {
				return ResponseEntity.status(403).<PaginaMagazine>build();
			}
			esistente.setNumeroPagina(mod.getNumeroPagina());
			if (mod.getModuli() != null) {
				esistente.getModuli().clear();
				mod.getModuli().forEach(m -> { 
					m.setPagina(esistente); 
					esistente.getModuli().add(m); 
				});
			}
			return ResponseEntity.ok(paginaRepository.save(esistente));
		}).orElse(ResponseEntity.notFound().build());
	}

	// 6. Metodo per eliminare un articolo
	@DeleteMapping("/{id}")
	public ResponseEntity<?> elimina(@PathVariable Long id, Authentication auth) {
		return paginaRepository.findById(id).map(esistente -> {

			// CONTROLLO DI SICUREZZA: 
			// Verifichiamo che chi prova a cancellare sia l'effettivo autore
			if (!esistente.getAutore().getUsername().equals(auth.getName())) {
				return ResponseEntity.status(403).body("Non sei autorizzato a eliminare questo articolo");
			}

			paginaRepository.delete(esistente);
			return ResponseEntity.ok().build();

		}).orElse(ResponseEntity.notFound().build());
	}
}