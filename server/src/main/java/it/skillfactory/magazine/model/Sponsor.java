package it.skillfactory.magazine.model;

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
    private String posizione; // Esempio: "SIDEBAR", "BOTTOM"

    @Column(nullable = false)
    private String tipoPagina; // Esempio: "HOME", "ARTICOLO"

    private int clickCount = 0;

    private boolean attivo = true;

    private LocalDate dataScadenza;

    public Sponsor() {}

    // Getter e Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomeAzienda() { return nomeAzienda; }
    public void setNomeAzienda(String nomeAzienda) { this.nomeAzienda = nomeAzienda; }

    public String getLinkSito() { return linkSito; }
    public void setLinkSito(String linkSito) { this.linkSito = linkSito; }

    public String getBannerImage() { return bannerImage; }
    public void setBannerImage(String bannerImage) { this.bannerImage = bannerImage; }

    public String getPosizione() { return posizione; }
    public void setPosizione(String posizione) { this.posizione = posizione; }

    public String getTipoPagina() { return tipoPagina; }
    public void setTipoPagina(String tipoPagina) { this.tipoPagina = tipoPagina; }

    public int getClickCount() { return clickCount; }
    public void setClickCount(int clickCount) { this.clickCount = clickCount; }

    public boolean isAttivo() { return attivo; }
    public void setAttivo(boolean attivo) { this.attivo = attivo; }

    public LocalDate getDataScadenza() { return dataScadenza; }
    public void setDataScadenza(LocalDate dataScadenza) { this.dataScadenza = dataScadenza; }
}