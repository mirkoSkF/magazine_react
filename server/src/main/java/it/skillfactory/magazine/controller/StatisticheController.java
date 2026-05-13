package it.skillfactory.magazine.controller;

import it.skillfactory.magazine.repository.PaginaRepository;
import it.skillfactory.magazine.repository.SponsorRepository;
import lombok.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/stats", "/api/statistiche"})
@CrossOrigin(origins = "*")
public class StatisticheController {

    @Autowired private PaginaRepository paginaRepo;
    @Autowired private SponsorRepository sponsorRepo;

    @GetMapping
    public StatisticheFullDTO getDashboardStats(
            @RequestParam(value = "month", required = false) Integer month, 
            @RequestParam(value = "year", required = false) Integer year) {

        int targetMonth = (month == null) ? LocalDate.now().getMonthValue() : month;
        int targetYear = (year == null) ? LocalDate.now().getYear() : year;

        StatisticheFullDTO dto = new StatisticheFullDTO();

        // 1. Caricamento Totali Dashboard (Questi funzionano perché leggono i campi aggregati)
        dto.setTotArticoli(paginaRepo.countByTipo("ARTICOLO"));
        dto.setTotSondaggi(paginaRepo.countByTipo("SONDAGGIO"));
        dto.setTotRubriche(paginaRepo.countByTipo("RUBRICA"));
        dto.setTotVisualizzazioni(Optional.ofNullable(paginaRepo.sumTotalVisualizzazioni()).orElse(0L));
        dto.setTotClickSponsor(Optional.ofNullable(sponsorRepo.sumTotalClicks()).orElse(0L));

        // 2. Recupero dati raggruppati per i grafici
        List<Object[]> pagineStats = paginaRepo.findStatsGroupByDay(targetMonth, targetYear);
        
        // Temporaneamente usiamo una lista vuota per i click giornalieri finché non implementi ClickSponsor
        List<Object[]> clickStats = new ArrayList<>(); 

        Map<Integer, Object[]> pagineMap = pagineStats.stream()
                .collect(Collectors.toMap(r -> ((Number) r[0]).intValue(), r -> r));
        
        Map<Integer, Long> clickMap = clickStats.stream()
                .collect(Collectors.toMap(
                    r -> ((Number) r[0]).intValue(), 
                    r -> ((Number) r[1]).longValue()
                ));

        // 3. Generazione timeline completa del mese
        List<DataPunto> graficoDati = new ArrayList<>();
        int giorniMese = YearMonth.of(targetYear, targetMonth).lengthOfMonth();

        for (int d = 1; d <= giorniMese; d++) {
            DataPunto punto = new DataPunto();
            punto.setLabel(d + "/" + targetMonth);

            if (pagineMap.containsKey(d)) {
                Object[] r = pagineMap.get(d);
                // Indici attesi: 0:Giorno, 1:Articoli, 2:Sondaggi, 3:Rubriche, 4:Visualizzazioni
                punto.setArticoli(((Number) r[1]).longValue());
                punto.setSondaggi(((Number) r[2]).longValue());
                punto.setRubriche(((Number) r[3]).longValue());
                punto.setVisualizzazioni(((Number) r[4]).longValue());
            }
            
            // Sarà sempre 0L finché clickMap è vuota, evitando crash
            punto.setClickSponsor(clickMap.getOrDefault(d, 0L));
            graficoDati.add(punto);
        }

        dto.setGraficoDati(graficoDati);
        return dto;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class StatisticheFullDTO {
        private long totArticoli, totSondaggi, totRubriche, totVisualizzazioni, totClickSponsor;
        private List<DataPunto> graficoDati;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class DataPunto {
        private String label;
        private long articoli = 0, sondaggi = 0, rubriche = 0, visualizzazioni = 0, clickSponsor = 0;
    }
}