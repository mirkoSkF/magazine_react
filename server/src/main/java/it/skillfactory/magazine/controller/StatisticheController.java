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

        dto.setTotArticoli(paginaRepo.countByTipo("ARTICOLO"));
        dto.setTotSondaggi(paginaRepo.countByTipo("SONDAGGIO"));
        dto.setTotRubriche(paginaRepo.countByTipo("RUBRICA"));
        dto.setTotEditoriali(paginaRepo.countByTipo("EDITORIALE"));
        dto.setTotEventi(paginaRepo.countByTipo("EVENTO"));
        dto.setTotVisualizzazioni(Optional.ofNullable(paginaRepo.sumTotalVisualizzazioni()).orElse(0L));
        dto.setTotClickSponsor(Optional.ofNullable(sponsorRepo.sumTotalClicks()).orElse(0L));

        List<Object[]> pagineStats = paginaRepo.findStatsGroupByDay(targetMonth, targetYear);
        List<Object[]> clickStats = new ArrayList<>(); 

        Map<Integer, Object[]> pagineMap = pagineStats.stream()
                .collect(Collectors.toMap(r -> ((Number) r[0]).intValue(), r -> r));
        
        Map<Integer, Long> clickMap = clickStats.stream()
                .collect(Collectors.toMap(
                    r -> ((Number) r[0]).intValue(), 
                    r -> ((Number) r[1]).longValue()
                ));

        List<DataPunto> graficoDati = new ArrayList<>();
        int giorniMese = YearMonth.of(targetYear, targetMonth).lengthOfMonth();

        for (int d = 1; d <= giorniMese; d++) {
            DataPunto punto = new DataPunto();
            punto.setLabel(d + "/" + targetMonth);

            if (pagineMap.containsKey(d)) {
                Object[] r = pagineMap.get(d);
                
                punto.setArticoli(((Number) r[1]).longValue());
                punto.setSondaggi(((Number) r[2]).longValue());
                punto.setRubriche(((Number) r[3]).longValue());
                punto.setEditoriali(((Number) r[4]).longValue());
                punto.setEventi(((Number) r[5]).longValue());
                punto.setVisualizzazioni(((Number) r[6]).longValue());
            }
            
            punto.setClickSponsor(clickMap.getOrDefault(d, 0L));
            graficoDati.add(punto);
        }

        dto.setGraficoDati(graficoDati);
        return dto;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class StatisticheFullDTO {
        private long totArticoli, totSondaggi, totRubriche, totEditoriali, totEventi, totVisualizzazioni, totClickSponsor;
        private List<DataPunto> graficoDati;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class DataPunto {
        private String label;
        private long articoli = 0, sondaggi = 0, rubriche = 0, editoriali = 0, eventi = 0, visualizzazioni = 0, clickSponsor = 0;
    }
}
