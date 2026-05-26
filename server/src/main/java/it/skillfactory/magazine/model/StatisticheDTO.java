package it.skillfactory.magazine.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StatisticheDTO {
    private long totArticoli;
    private long totRubriche;
    private long totSondaggi;
    private long totEditoriali; // AGGIUNTO
    private long totEventi;      // AGGIUNTO
    private long totVisualizzazioni;
    private long totClickSponsor;
    private List<DataPunto> graficoDati;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DataPunto {
        private String label; 
        private long articoli;
        private long rubriche;
        private long sondaggi;
        private long editoriali; // AGGIUNTO
        private long eventi;     // AGGIUNTO
        private long visualizzazioni;
        private long clickSponsor;
    }
}
