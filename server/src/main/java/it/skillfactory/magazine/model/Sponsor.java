package it.skillfactory.magazine.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "sponsors")
public class Sponsor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeAzienda;

    @Column(nullable = false)
    private String linkSito;

    @Column(columnDefinition = "LONGTEXT")
    private String bannerImage;

    @Column(nullable = false)
    private String posizione;

    @Column(nullable = false)
    private String tipoPagina;

    @Column(nullable = false)
    private Integer clickCount = 0;

    @Column(nullable = false)
    private boolean attivo = true;

    private LocalDate dataScadenza;

    public Sponsor() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNomeAzienda() {
        return nomeAzienda;
    }

    public void setNomeAzienda(String nomeAzienda) {
        this.nomeAzienda = nomeAzienda;
    }

    public String getLinkSito() {
        return linkSito;
    }

    public void setLinkSito(String linkSito) {
        this.linkSito = linkSito;
    }

    public String getBannerImage() {
        return bannerImage;
    }

    public void setBannerImage(String bannerImage) {
        this.bannerImage = bannerImage;
    }

    public String getPosizione() {
        return posizione;
    }

    public void setPosizione(String posizione) {
        this.posizione = posizione;
    }

    public String getTipoPagina() {
        return tipoPagina;
    }

    public void setTipoPagina(String tipoPagina) {
        this.tipoPagina = tipoPagina;
    }

    @JsonProperty("clickCount")
    public Integer getClickCount() {
        return clickCount == null ? 0 : clickCount;
    }

    public void setClickCount(Integer clickCount) {
        this.clickCount = clickCount == null ? 0 : clickCount;
    }

    public boolean isAttivo() {
        return attivo;
    }

    public void setAttivo(boolean attivo) {
        this.attivo = attivo;
    }

    public LocalDate getDataScadenza() {
        return dataScadenza;
    }

    public void setDataScadenza(LocalDate dataScadenza) {
        this.dataScadenza = dataScadenza;
    }
}