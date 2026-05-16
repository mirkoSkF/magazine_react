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
import java.util.HashMap;
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
		List<PaginaMagazine> pagine = paginaRepository.findAll();
		pagine.forEach(this::calcolaStatisticheSondaggio);
		return pagine;
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
	public PaginaMagazine salva(
			@RequestBody PaginaMagazine pagina,
			Authentication auth) {

		Utente u = utenteRepository
				.findByUsername(auth.getName())
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
			esistente.setCopertina(mod.getCopertina());
			esistente.setNumeroPagina(mod.getNumeroPagina());
			esistente.setTipo(mod.getTipo());
			esistente.setBozza(mod.isBozza()); 

			if (mod.getModuli() != null) {
				esistente.getModuli().clear();
				mod.getModuli().forEach(m -> {
					m.setPagina(esistente);
					esistente.getModuli().add(m);
				});
			}

			if (mod.getVotiSondaggio() != null && !mod.getVotiSondaggio().isEmpty()) {
				esistente.setVotiSondaggio(mod.getVotiSondaggio());
			}
			if (mod.getIdentificativiVotanti() != null && !mod.getIdentificativiVotanti().isEmpty()) {
				esistente.setIdentificativiVotanti(mod.getIdentificativiVotanti());
			}
			if (mod.getIdentificativiVisualizzazioni() != null && !mod.getIdentificativiVisualizzazioni().isEmpty()) {
				esistente.setIdentificativiVisualizzazioni(mod.getIdentificativiVisualizzazioni());
			}

			PaginaMagazine salvata = paginaRepository.save(esistente);
			calcolaStatisticheSondaggio(salvata);
			return ResponseEntity.ok(salvata);
		}).orElse(ResponseEntity.notFound().build());
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<?> elimina(
			@PathVariable Long id,
			Authentication auth) {

		return paginaRepository.findById(id).map(esistente -> {
			if (!esistente.getAutore().getUsername().equals(auth.getName())) {
				return ResponseEntity
						.status(HttpStatus.FORBIDDEN)
						.body("Non sei autorizzato a eliminare questo articolo");
			}

			paginaRepository.delete(esistente);
			return ResponseEntity.ok().build();
		}).orElse(ResponseEntity.notFound().build());
	}

	@PutMapping("/{id}/view")
	@Transactional 
	public ResponseEntity<?> incrementaVisualizzazioni(
			@PathVariable Long id,
			@RequestParam(required = false) String fingerprint,
			HttpServletRequest request) {

		String viewerId = (fingerprint != null) ? fingerprint : request.getRemoteAddr();

		return paginaRepository.findById(id).map(p -> {
			if (p.getIdentificativiVisualizzazioni() != null && p.getIdentificativiVisualizzazioni().contains(viewerId)) {
				return ResponseEntity.ok().build();
			}

			p.setVisualizzazioni(p.getVisualizzazioni() + 1);

			if (p.getIdentificativiVisualizzazioni() == null) {
				p.setIdentificativiVisualizzazioni(new HashSet<>());
			}
			p.getIdentificativiVisualizzazioni().add(viewerId);

			paginaRepository.save(p);
			return ResponseEntity.ok().build();
		}).orElse(ResponseEntity.notFound().build());
	}

	@PutMapping("/{id}/vota")
	@Transactional 
	public ResponseEntity<?> votaSondaggio(
			@PathVariable Long id,
			@RequestBody Map<String, String> payload,
			HttpServletRequest request,
			Authentication authentication) {

		String scelta = payload.get("scelta");
		String fingerprint = payload.get("fingerprint"); 
		String voterId = (fingerprint != null && !fingerprint.trim().isEmpty()) ? fingerprint : request.getRemoteAddr();

		if (scelta == null || scelta.trim().isEmpty()) {
			return ResponseEntity.badRequest().body("Scelta del sondaggio non valida");
		}

		return paginaRepository.findById(id).map(p -> {
			if (p.getIdentificativiVotanti() != null && p.getIdentificativiVotanti().contains(voterId)) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Hai già votato in questo sondaggio");
			}

			if (p.getIdentificativiVotanti() == null) {
				p.setIdentificativiVotanti(new HashSet<>());
			}
			if (p.getVotiSondaggio() == null) {
				p.setVotiSondaggio(new HashMap<>());
			}

			int votiAttuali = p.getVotiSondaggio().getOrDefault(scelta, 0);
			p.getVotiSondaggio().put(scelta, votiAttuali + 1);

			p.getIdentificativiVotanti().add(voterId);

			PaginaMagazine paginaSalvata = paginaRepository.saveAndFlush(p);

			return ResponseEntity.ok(paginaSalvata.getVotiSondaggio());

		}).orElse(ResponseEntity.notFound().build());
	}

	@GetMapping("/{id}/stats")
	public ResponseEntity<?> getStats(@PathVariable Long id) {
		return paginaRepository.findById(id)
				.map(p -> ResponseEntity.ok(p.getVotiSondaggio()))
				.orElse(ResponseEntity.notFound().build());
	}

	@PatchMapping("/{id}/pubblica")
	@Transactional
	public ResponseEntity<?> pubblica(
			@PathVariable Long id,
			Authentication auth) {

		return paginaRepository.findById(id).map(esistente -> {
			if (!esistente.getAutore().getUsername().equals(auth.getName())) {
				return ResponseEntity
						.status(HttpStatus.FORBIDDEN)
						.body("Non sei autorizzato a pubblicare questo articolo");
			}

			esistente.setBozza(false);
			esistente.setDataPubblicazione(LocalDateTime.now()); 

			paginaRepository.save(esistente);
			return ResponseEntity.ok().build();
		}).orElse(ResponseEntity.notFound().build());
	}

	private void calcolaStatisticheSondaggio(PaginaMagazine p) {
		int totale = 0;
		if (p.getVotiSondaggio() != null) {
			totale = p.getVotiSondaggio().values().stream().mapToInt(Integer::intValue).sum();
		}
		p.setTotaleVotanti(totale);

		Map<String, Double> percentuali = new HashMap<>();
		if (totale > 0 && p.getVotiSondaggio() != null) {
			for (Map.Entry<String, Integer> entry : p.getVotiSondaggio().entrySet()) {
				double pct = ((double) entry.getValue() / totale) * 100;
				percentuali.put(entry.getKey(), Math.round(pct * 10.0) / 10.0);
			}
		}
		p.setPercentualiSondaggio(percentuali);
	}
}