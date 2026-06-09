import React, { useState, useEffect, useRef } from "react";

const IndexPubblicazioni = ({ onReadArticle, onPrivacyClick }) => {
  const [tuttiContenuti, setTuttiContenuti] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCorrente, setFiltroCorrente] = useState("HOME");
  const [rubricaAttiva, setRubricaAttiva] = useState("");
  const [pageArticoli, setPageArticoli] = useState(1);
  const [pageRubriche, setPageRubriche] = useState(1);
  const [pageSondaggi, setPageSondaggi] = useState(1);
  const [pageEditoriali, setPageEditoriali] = useState(1);
  const [showCookieBanner, setShowCookieBanner] = useState(true);

  const [sponsorLaterale, setSponsorLaterale] = useState([]);
  const [sponsorFondo, setSponsorFondo] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const itemsPerPage = 5;
  const fetchAvviata = useRef(false);
  // Lista delle rubriche censite nell'applicazione
  const listaRubriche = [
    { key: "FORMATORE", label: "Il formatore" },
    { key: "QUALITA", label: "Formazione & Qualità" },
    { key: "IFP", label: "Ecosistema IFP" },
    { key: "DIGITALI", label: "Competenze Digitali" },
    { key: "AI", label: "AI & Formazione" },
    { key: "LAVORO", label: "Orientamento & Lavoro" }
  ];

  const colors = {
    primary: "#007bff",
    dark: "#1a1a1a",
    lightGray: "#f8f9fa",
    border: "#dee2e6",
    pollFocus: "#003d82",
    accent: "#e63946",
    editorial: "#6f42c1",
    rubriche: "#17a2b8"
  };

  const normalizzaStringa = (str) => {
    if (!str) return "";
    return str
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const forceHyphenation = (text) => {
    if (!text) return "";
    let processed = text.replace(/&nbsp;/g, ' ');
    return processed.replace(/([a-zA-ZàèéìòùÀÈÉÌÒÙ]{6})([a-zA-ZàèéìòùÀÈÉÌÒÙ]{3,})/g, (match, p1, p2) => {
      return `${p1}&shy;${p2}`;
    });
  };

  const handleSponsorClick = (id, link) => {
    const storageKey = `clicked_sponsor_${id}`;
    const hasClicked = localStorage.getItem(storageKey);

    if (!hasClicked) {
      fetch(`https://magazine.skillfactory.it/api/sponsors/${id}/click`, {
        method: 'PATCH'
      })
        .then(() => {
          localStorage.setItem(storageKey, 'true');
        })
        .catch((err) => {
          console.error("Errore registrazione click:", err);
        })
        .finally(() => {
          window.open(link, '_blank', 'noopener,noreferrer');
        });
    } else {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScrollTop && window.pageYOffset > 400) {
        setShowScrollTop(true);
      } else if (showScrollTop && window.pageYOffset <= 400) {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScrollTop]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    // Se la chiamata è già stata avviata o completata, ci fermiamo subito
    if (fetchAvviata.current) return;

    // Segnamo immediatamente che la chiamata è partita
    fetchAvviata.current = true;

    Promise.all([
      fetch("https://magazine.skillfactory.it/api/pagine").then((res) => res.json()),
      fetch("https://magazine.skillfactory.it/api/sponsors").then((res) => res.json())
    ])
      .then(([pagineData, sponsorsData]) => {
        setTuttiContenuti(pagineData.sort((a, b) => b.id - a.id));

        const attivi = sponsorsData.filter(s => s.attivo && s.tipoPagina === 'HOME');

        const sidebar = attivi
          .filter(s => s.posizione === 'SIDEBAR')
          .slice(0, 3)
          .map(s => ({ id: s.id, immagine: s.bannerImage, link: s.linkSito }));

        const bottom = attivi
          .filter(s => s.posizione === 'BOTTOM')
          .slice(0, 2)
          .map(s => ({ id: s.id, immagine: s.bannerImage, link: s.linkSito }));

        setSponsorLaterale(sidebar);
        setSponsorFondo(bottom);
      })
      .catch((err) => {
        console.error("Errore caricamento API parallelo:", err);
        // In caso di errore pesante, puoi resettarlo per permettere un riprovo
        // fetchAvviata.current = false;
      });

    const consent = localStorage.getItem("cookie-consent");
    if (consent) setShowCookieBanner(false);
  }, []); // Array di dipendenze vuoto

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "true");
    setShowCookieBanner(false);
  };

  const extractText = (articolo, length) => {
    if (!articolo || !articolo.moduli || articolo.moduli.length === 0) return "";
    const testoCompleto = articolo.moduli
      .filter(m => m.tipo !== "IMMAGINE")
      .map(m => m.contenuto)
      .join(" ");
    const temp = document.createElement('div');
    temp.innerHTML = testoCompleto;
    const plainText = temp.innerText || temp.textContent || "";
    return length ? (plainText.length > length ? plainText.substring(0, length) + "..." : plainText) : plainText;
  };

  const getAutore = (a) => {
    if (!a) return "Redazione";
    let nome = a.nomeAutore || "";
    let cognome = a.cognomeAutore || "";

    if (!nome.trim() && a.utente) {
      nome = a.utente.nome || "";
      cognome = a.utente.cognome || "";
    }

    let firma = `${nome} ${cognome}`.trim();
    const username = a.autore || "";

    if (!firma && username) {
      if (username.includes('.')) {
        const parti = username.split('.');
        const nomeFormattato = parti[0].charAt(0).toUpperCase() + parti[0].slice(1);
        const cognomeFormattato = parti[1].charAt(0).toUpperCase() + parti[1].slice(1);
        return `${nomeFormattato} ${cognomeFormattato}`;
      }
      return username.charAt(0).toUpperCase() + username.slice(1);
    }

    return firma || "Redazione";
  };

  if (tuttiContenuti.length === 0)
    return <div style={{ textAlign: "center", padding: "50px", fontFamily: "Arial" }}>Caricamento...</div>;

  // Filtro contenuti pubblicati non in bozza
  const contenutiPubblicatiBase = tuttiContenuti.filter(item => item.bozza === false);

  // Separazione flussi nativi puri
  // Separazione flussi nativi puri (Se siamo in NEWS, escludiamo a monte gli articoli con rubrica)
  const soloArticoli = contenutiPubblicatiBase.filter(c => {
    if (c.tipo?.toUpperCase() !== "ARTICOLO") return false;
    if (filtroCorrente === "NEWS") {
      return !c.rubrica || c.rubrica.trim() === "";
    }
    return true;
  });
  const soloSondaggi = contenutiPubblicatiBase.filter(c => c.tipo?.toUpperCase() === "SONDAGGIO");
  const soloEditoriali = contenutiPubblicatiBase.filter(c => c.tipo?.toUpperCase() === "EDITORIALE");
  const soloEventi = contenutiPubblicatiBase.filter(c => c.tipo?.toUpperCase() === "EVENTO");

  const soloRubriche = rubricaAttiva !== ""
    ? contenutiPubblicatiBase.filter(item => normalizzaStringa(item.rubrica) === normalizzaStringa(rubricaAttiva))
    : contenutiPubblicatiBase.filter(c => c.tipo?.toUpperCase() === "RUBRICA");

  // Determinazione articolo principale del blocco centrale
  let ultimoContenutoPrincipale = null;
  if (rubricaAttiva !== "") {
    ultimoContenutoPrincipale = soloRubriche[0] || null;
  } else {
    ultimoContenutoPrincipale = soloArticoli[0] || null;
  }

  // Lista eventi per la sidebar
  const eventiSidebar = soloEventi;

  // Esclusione primo piano dalle evidenze e archivio
  const idArticoloCentrale = (rubricaAttiva === "" && ultimoContenutoPrincipale) ? ultimoContenutoPrincipale.id : null;
  const articoliSenzaCentrale = idArticoloCentrale ? soloArticoli.filter(a => a.id !== idArticoloCentrale) : soloArticoli;

  // Le 3 Evidenze sotto il primo piano (in HOME e senza rubriche attive)
  const evidenza = (filtroCorrente === "HOME" && rubricaAttiva === "") ? articoliSenzaCentrale.slice(0, 3) : [];

  // Archivio Articoli (Paginato)
  // Archivio Articoli (Paginato)
  let archivioArtBase = [];
  if (rubricaAttiva === "") {
    if (filtroCorrente === "NEWS") {
      // Sotto il filtro NEWS, non ci sono le 3 evidenze in alto, quindi escludiamo solo il primo piano centrale
      archivioArtBase = idArticoloCentrale ? soloArticoli.filter(a => a.id !== idArticoloCentrale) : soloArticoli;
    } else {
      // Sotto il filtro HOME ("Tutto"), escludiamo il primo piano centrale e saltiamo i 3 finiti in evidenza
      archivioArtBase = idArticoloCentrale ? articoliSenzaCentrale.slice(3) : soloArticoli;
    }
  }
  const totalPagesArt = Math.ceil(archivioArtBase.length / itemsPerPage);
  const currentArchivioArt = archivioArtBase.slice((pageArticoli - 1) * itemsPerPage, pageArticoli * itemsPerPage);

  // Archivio Rubriche Paginato (Usato nel blocco centrale se una rubrica è attiva)
  const archivioRubricheBase = rubricaAttiva !== "" ? soloRubriche.slice(1) : [];
  const totalPagesRubriche = Math.ceil(archivioRubricheBase.length / itemsPerPage);
  const currentRubriche = archivioRubricheBase.slice((pageRubriche - 1) * itemsPerPage, pageRubriche * itemsPerPage);

  // Archivio Sondaggi
  const archivioSonBase = soloSondaggi.slice(1);
  const totalPagesSon = Math.ceil(archivioSonBase.length / itemsPerPage);
  const currentSondaggi = archivioSonBase.slice((pageSondaggi - 1) * itemsPerPage, pageSondaggi * itemsPerPage);

  // Editoriali
  const ultimoEditoriale = soloEditoriali[0] || null;
  const archivioEdiBase = soloEditoriali.slice(1);
  const totalPagesEdi = Math.ceil(archivioEdiBase.length / itemsPerPage);
  const currentEditoriali = archivioEdiBase.slice((pageEditoriali - 1) * itemsPerPage, pageEditoriali * itemsPerPage);

  const ultimoSondaggio = soloSondaggi[0];

  // Logica della barra di ricerca e filtri Navbar globali
  const contenutiFiltrati = contenutiPubblicatiBase.filter(item => {
    if (rubricaAttiva !== "") return normalizzaStringa(item.rubrica) === normalizzaStringa(rubricaAttiva);
    if (filtroCorrente === "NEWS") return item.tipo?.toUpperCase() === "ARTICOLO" && (!item.rubrica || item.rubrica.trim() === "");
    if (filtroCorrente === "EVENTI") return item.tipo?.toUpperCase() === "EVENTO";
    if (filtroCorrente === "EDITORIALI") return item.tipo?.toUpperCase() === "EDITORIALE";
    return true;
  }).filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.titolo?.toLowerCase().includes(searchLower) ||
      getAutore(item).toLowerCase().includes(searchLower) ||
      extractText(item).toLowerCase().includes(searchLower)
    );
  });

  const listItemStyle = {
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #f0f0f0'
  };

  const rubricaLinkStyle = (isActive) => ({
    display: 'block',
    padding: '8px 12px',
    margin: '4px 0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: isActive ? 'white' : '#333',
    backgroundColor: isActive ? colors.rubriche : 'transparent',
    transition: 'all 0.2s ease',
    borderLeft: isActive ? `4px solid ${colors.dark}` : '4px solid transparent'
  });

  const Pagination = ({ total, current, setPage }) => {
    if (total <= 1) return null;
    return (
      <div style={{ display: 'flex', gap: '5px', marginTop: '15px', flexWrap: 'wrap', paddingBottom: '20px' }}>
        {[...Array(total)].map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setPage(i + 1);
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="pagination-btn"
            style={{
              padding: '5px 12px',
              cursor: 'pointer',
              backgroundColor: current === i + 1 ? colors.primary : 'white',
              color: current === i + 1 ? 'white' : colors.dark,
              border: `1px solid ${current === i + 1 ? colors.primary : colors.border}`,
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  const getNavbarItemStyle = (isActive) => ({
    cursor: "pointer",
    borderBottom: isActive ? `2px solid ${colors.primary}` : "none",
    color: isActive ? colors.primary : colors.dark,
    paddingBottom: "2px"
  });
  
  // Funzione helper per convertire la key della rubrica nella label estesa
  const getNomeRubrica = (keyRubrica) => {
    if (!keyRubrica) return "";
    const rubrica = listaRubriche.find(r => r.key === normalizzaStringa(keyRubrica));
    return rubrica ? rubrica.label : keyRubrica;
  };

  return (
    <div lang="it" style={{ maxWidth: "1150px", margin: "20px auto", padding: "0 20px", fontFamily: "Arial, sans-serif", position: "relative" }}>
      <style>{`
        @media (max-width: 992px) {
          .main-layout { grid-template-columns: 1fr !important; }
          .sidebar-aside { border-left: none !important; border-top: 1px solid ${colors.border}; padding-left: 0 !important; padding-top: 30px; }
          .grid-evidenza { grid-template-columns: repeat(3, 1fr) !important; gap: 10px !important; }
        }

        @media (max-width: 600px) {
          .grid-evidenza { grid-template-columns: 1fr !important; gap: 20px !important; }
          .main-title { font-size: 32px !important; }
          .main-image-container { height: auto !important; min-height: 250px !important; }
          .read-more-btn { width: 100%; }
        }

        .read-more-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
          background-color: #333 !important;
        }

        .editorial-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important;
          background-color: #5a32a3 !important;
        }

        .pagination-btn:hover {
          background-color: ${colors.lightGray} !important;
          border-color: ${colors.primary} !important;
          color: ${colors.primary} !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.05);
        }

        .poll-card-main {
          transition: all 0.3s ease !important;
        }

        .poll-card-main:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
          background-color: #0056b3 !important;
        }

        .banner-hover {
          transition: all 0.4s ease-in-out !important;
          cursor: pointer;
        }

        .banner-hover:hover {
          transform: scale(1.02);
          filter: brightness(1.1);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }

        .rubrica-item-link:hover {
          background-color: ${colors.lightGray} !important;
          color: ${colors.rubriche} !important;
          padding-left: 18px !important;
        }

        .back-to-top-btn {
          position: fixed;
          bottom: 40px;
          right: calc(50% - 600px + 20px); 
          z-index: 999;
          background-color: #007bff;
          color: white;
          border: none;
          padding: 12px 20px;
          font-weight: bold;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
        }

        .back-to-top-btn.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .back-to-top-btn:hover {
          background-color: #0056b3;
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0, 56, 179, 0.3);
        }
      `}</style>

      {/* BARRA DI RICERCA */}
      <div 
        style={{ 
          marginTop: "5%",
          marginBottom: "30px", 
          display: "flex",          // 👈 Forza un layout Flexbox
          justifyContent: "center", // 👈 Centra perfettamente l'input in orizzontale
          width: "100%",            // 👈 Occupa tutto lo spazio del contenitore principale
          boxSizing: "border-box"
        }}
      >
        <input
          type="text"
          className="search-input"
          placeholder="Cerca per titolo, autore o parole nel testo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "12px 20px",
            fontSize: "16px",
            borderRadius: "30px",
            border: `1px solid ${colors.border}`,
            transition: "all 0.3s",
            boxSizing: "border-box", // 👈 Evita che il padding alteri la larghezza del 100% su smartphone
            margin: "0 auto"         // 👈 Ulteriore sicurezza per il centraggio nativo dell'elemento block
          }}
        />
      </div>

      {/* NAVBAR DI FILTRAGGIO */}
      <div style={{ display: "flex", justifyContent: "center", gap: "30px", marginBottom: "30px", flexWrap: "wrap", fontWeight: "bold" }}>
        <span
          style={getNavbarItemStyle(filtroCorrente === "NEWS" && rubricaAttiva === "")}
          onClick={() => {
            setFiltroCorrente("NEWS");
            setRubricaAttiva("");
            setPageArticoli(1);
          }}
        >
          News
        </span>

        <select
          value={rubricaAttiva}
          onChange={(e) => {
            const val = e.target.value;
            setRubricaAttiva(val);
            if (val !== "") {
              setFiltroCorrente("RUBRICA");
              setPageRubriche(1);
            } else {
              setFiltroCorrente("HOME");
            }
          }}
          style={{
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            color: rubricaAttiva !== "" ? colors.primary : colors.dark,
            borderBottom: rubricaAttiva !== "" ? `2px solid ${colors.primary}` : "none",
            paddingBottom: "2px",
            backgroundColor: "transparent",

            // MODIFICHE PER DIMENSIONE E ADERENZA MASSIMA:
            fontSize: "inherit",         // Eredita la dimensione esatta delle altre voci di menu
            width: "95px",               // Larghezza fissa millimetrica per la parola "Rubriche" + freccia
            paddingRight: "0px",         // Azzera padding superflui a destra
            paddingLeft: "0px",          // Azzera padding superflui a sinistra
            textOverflow: "ellipsis",    // Mette i tre puntini se una selezione successiva è più lunga
            whiteSpace: "nowrap",
            overflow: "hidden",
            outline: "none"
          }}
        >
          <option value="" disabled hidden>Rubriche</option>
          <option value="FORMATORE">Il formatore</option>
          <option value="QUALITA">Formazione & Qualità</option>
          <option value="IFP">Ecosistema IFP</option>
          <option value="DIGITALI">Competenze Digitali</option>
          <option value="AI">AI & Formazione</option>
          <option value="LAVORO">Orientamento & Lavoro</option>
        </select>

        <span
          style={getNavbarItemStyle(filtroCorrente === "EVENTI" && rubricaAttiva === "")}
          onClick={() => {
            setFiltroCorrente("EVENTI");
            setRubricaAttiva("");
          }}
        >
          Eventi
        </span>

        <span
          style={getNavbarItemStyle(filtroCorrente === "EDITORIALI" && rubricaAttiva === "")}
          onClick={() => {
            setFiltroCorrente("EDITORIALI");
            setRubricaAttiva("");
            setPageEditoriali(1);
          }}
        >
          Editoriali
        </span>

        <span
          style={getNavbarItemStyle(colors.primary)}
          style={getNavbarItemStyle(filtroCorrente === "HOME" && rubricaAttiva === "")}
          onClick={() => {
            setFiltroCorrente("HOME");
            setRubricaAttiva("");
          }}
        >
          Tutto
        </span>
      </div>

      {searchTerm.trim() !== "" ? (
        <div style={{ minHeight: "60vh" }}>
          <h2 style={{ marginBottom: "20px", borderBottom: `2px solid ${colors.primary}`, paddingBottom: "10px" }}>
            Risultati per: "{searchTerm}" ({contenutiFiltrati.length})
          </h2>

          {contenutiFiltrati.length > 0 ? (
            <div style={{ display: "grid", gap: "20px" }}>
              {contenutiFiltrati.map(item => (
                <div
                  key={item.id}
                  onClick={() => onReadArticle(item.id)}
                  style={{
                    padding: "20px",
                    backgroundColor: colors.lightGray,
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: "bold", color: colors.primary, textTransform: "uppercase" }}>
                      {item.tipo || "ARTICOLO"}
                    </span>
                    <h3 style={{ margin: "5px 0", fontSize: "18px" }}>{item.titolo}</h3>
                    <small>di {getAutore(item)}</small>
                  </div>
                  <span style={{ color: colors.primary, fontWeight: "bold" }}>Leggi →</span>
                </div>
              ))}
            </div>
          ) : (
            <p>Nessun risultato trovato per la tua ricerca.</p>
          )}

          <button
            onClick={() => setSearchTerm("")}
            style={{ marginTop: "30px", background: "none", border: "none", color: colors.primary, cursor: "pointer", fontWeight: "bold" }}
          >
            ← Torna alla home
          </button>
        </div>
      ) : (
        <>
          {filtroCorrente === "HOME" && rubricaAttiva === "" && evidenza.length > 0 && (
            <div className="grid-evidenza" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }}>
              {evidenza.map((a) => (
                <div key={a.id} style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  {/* MODIFICATO: Inserito objectFit 'contain' e sfondo neutro per le 3 card in evidenza */}
                  <div style={{ width: '100%', height: '200px', backgroundColor: '#f1f3f4', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
                    {a.copertina && <img src={`data:image/jpeg;base64,${a.copertina}`} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} alt="Cover" />}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: a.rubrica && a.rubrica.trim() !== "" ? "#ff6b0b" : colors.primary, textTransform: 'uppercase', marginBottom: '8px' }}>
{a.rubrica && a.rubrica.trim() !== ""
    ? `Rubrica | ${getNomeRubrica(a.rubrica)}`
    : "Articolo"}
</span>
                  <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', fontWeight: '700', flexGrow: 1, lineHeight: '1.2', color: colors.dark }}>{a.titolo}</h3>
                  <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px', fontStyle: 'italic', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                    di <span style={{ fontWeight: '600', color: '#444', fontStyle: 'normal' }}>{getAutore(a)}</span>
                  </p>
                  <span onClick={() => onReadArticle(a.id)} style={{ color: colors.primary, cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'inline-block' }}>Leggi →</span>
                </div>
              ))}
            </div>
          )}

          <div className="main-layout" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px", borderTop: `3px solid ${colors.dark}`, paddingTop: "25px" }}>
            <section>

              {/* 1. SEZIONE PRIMO PIANO CENTRALE NATURALE (ARTICOLO O RUBRICA) */}
              {filtroCorrente !== "EDITORIALI" && filtroCorrente !== "EVENTI" && ultimoContenutoPrincipale && (
                <div style={{ border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '8px', marginBottom: '40px' }}>
                  <div style={{
                    backgroundColor: rubricaAttiva !== "" ? colors.rubriche : colors.accent,
                    color: 'white',
                    display: 'inline-block',
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    borderRadius: '2px',
                    textTransform: "uppercase"
                  }}>
                    {rubricaAttiva !== "" ? `RUBRICA: ${getNomeRubrica(rubricaAttiva)}` : "ULTIMO ARTICOLO"}
                  </div>

                  <h1 className="main-title" style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px', lineHeight: '1.1' }}>
                    {ultimoContenutoPrincipale.titolo}
                  </h1>
			{/* 🛑 NUOVO: SOTTOTITOLO DELL'ARTICOLO */}
{ultimoContenutoPrincipale.sottotitolo && (
  <p style={{ fontSize: '15px', color: '#555', margin: '-10px 0 20px 0', lineHeight: '1.4', fontWeight: 'normal', fontStyle: 'italic' }}>
    {ultimoContenutoPrincipale.sottotitolo}
  </p>
)}

{/* L'autore adesso è libero e indipendente: comparirà SEMPRE, anche senza sottotitolo */}
<p style={{ fontSize: '13px', color: '#555', marginBottom: '20px' }}>
  Scritto da <strong>{getAutore(ultimoContenutoPrincipale)}</strong>
</p>
                  {/* MODIFICATO: Altezza impostata su 'auto' con altezza massima per rendere l'immagine del primo piano centrale proporzionale e senza tagli */}
                  <div className="main-image-container" style={{ width: '100%', height: 'auto', maxHeight: '500px', backgroundColor: 'transparent', borderRadius: '8px', overflow: 'hidden', marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {ultimoContenutoPrincipale.copertina && (
                      <img src={`data:image/jpeg;base64,${ultimoContenutoPrincipale.copertina}`} style={{ width: '100%', height: 'auto', display: 'block' }} alt="Main" />
                    )}
                  </div>

                  <div
                    style={{ fontSize: '19px', color: '#333', lineHeight: '1.8', marginBottom: '35px', textAlign: "justify", textJustify: 'inter-word' }}
                    dangerouslySetInnerHTML={{ __html: forceHyphenation(extractText(ultimoContenutoPrincipale, 600)) }}
                  />

                  <button
                    className="read-more-btn"
                    onClick={() => onReadArticle(ultimoContenutoPrincipale.id)}
                    style={{ padding: '15px 40px', backgroundColor: colors.dark, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  >
                    Continua a leggere
                  </button>
                </div>
              )}

              {/* BLOCCO ARCHIVIO IN LINEA PER RUBRICA ATTIVA */}
              {filtroCorrente === "RUBRICA" && rubricaAttiva !== "" && currentRubriche.length > 0 && (
                <div style={{ marginBottom: "40px" }}>
                  <h3 style={{ fontSize: "22px", borderBottom: `2px solid ${colors.rubriche}`, paddingBottom: "10px", marginBottom: "20px" }}>
                    Altri articoli di questa rubrica
                  </h3>
                  <div style={{ display: "grid", gap: "15px" }}>
                    {currentRubriche.map(r => (
                      <div key={r.id} onClick={() => onReadArticle(r.id)} style={{ padding: "15px", backgroundColor: colors.lightGray, borderRadius: "6px", cursor: "pointer", border: `1px solid ${colors.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>{r.titolo}</h4>
                          <small>di {getAutore(r)}</small>
                        </div>
                        <span style={{ color: colors.rubriche, fontWeight: "bold" }}>Leggi →</span>
                      </div>
                    ))}
                  </div>
                  <Pagination total={totalPagesRubriche} current={pageRubriche} setPage={setPageRubriche} />
                </div>
              )}

              {/* FILTRO EVENTI: GUIDA LATERALE */}
              {filtroCorrente === "EVENTI" && (
                <div style={{ border: `1px solid ${colors.border}`, padding: '30px', borderRadius: '8px', marginBottom: '40px', backgroundColor: colors.lightGray, textAlign: 'center' }}>
                  <h2 style={{ color: colors.dark, marginBottom: '10px' }}>Calendario Eventi della Skill Factory</h2>
                  <p style={{ color: '#555', fontSize: '15px' }}>Trovi l'elenco completo di tutti i nostri appuntamenti, workshop e webinar all'interno della barra laterale dedicata.</p>
                </div>
              )}

              {/* FALLBACK IN CASO DI RUBRICA SELEZIONATA MA COMPLETAMENTE VUOTA */}
              {filtroCorrente === "RUBRICA" && !ultimoContenutoPrincipale && (
                <div style={{ border: `1px dashed ${colors.border}`, padding: '40px 20px', borderRadius: '8px', marginBottom: '40px', textAlign: 'center', backgroundColor: colors.lightGray }}>
                  <div style={{ backgroundColor: colors.rubriche, color: 'white', display: 'inline-block', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', borderRadius: '2px', textTransform: "uppercase" }}>
                    RUBRICA: {getNomeRubrica(rubricaAttiva)}
                  </div>
                  <h3 style={{ color: '#666', margin: '10px 0' }}>Nessun contenuto disponibile</h3>
                  <p style={{ color: '#999', fontSize: '14px' }}>Non ci sono ancora articoli pubblicati in questa specifica rubrica.</p>
                </div>
              )}

              {/* 2. SEZIONE EDITORIALE */}
              {ultimoEditoriale && (filtroCorrente === "HOME" || filtroCorrente === "EDITORIALI") && rubricaAttiva === "" && (
                <div style={{ border: `1px solid ${colors.editorial}`, padding: "25px", borderRadius: "8px", marginBottom: "40px", boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <div style={{ backgroundColor: colors.editorial, color: 'white', display: 'inline-block', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', borderRadius: '2px' }}>
                    EDITORIALE IN EVIDENZA
                  </div>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '15px', lineHeight: '1.2', color: colors.dark }}>{ultimoEditoriale.titolo}</h2>
                  {/* ✍️ CORRETTO: Sottotitolo dell'editoriale fuori dal tag h2 */}
{ultimoEditoriale.sottotitolo && (
  <p style={{ fontSize: '15px', color: '#555', margin: '0 0 15px 0', lineHeight: '1.4', fontStyle: 'italic' }}>
    {ultimoEditoriale.sottotitolo}
  </p>
)}
                  <p style={{ fontSize: '13px', color: '#555', marginBottom: '20px' }}>Scritto da <strong>{getAutore(ultimoEditoriale)}</strong></p>
                  {ultimoEditoriale.copertina && (
                    /* MODIFICATO: Modificato il contenitore dell'immagine dell'editoriale portando l'altezza a 'auto' con altezza massima per un ridimensionamento armonioso */
                    <div style={{ width: '100%', height: 'auto', maxHeight: '400px', backgroundColor: 'transparent', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                      <img src={`data:image/jpeg;base64,${ultimoEditoriale.copertina}`} style={{ width: '100%', height: 'auto', display: 'block' }} alt="Editoriale Cover" />
                    </div>
                  )}
                  <div style={{ fontSize: '16px', color: '#444', lineHeight: '1.7', marginBottom: '25px', textAlign: "justify" }} dangerouslySetInnerHTML={{ __html: forceHyphenation(extractText(ultimoEditoriale, 400)) }} />
                  <button className="editorial-btn" onClick={() => onReadArticle(ultimoEditoriale.id)} style={{ padding: '12px 30px', backgroundColor: colors.editorial, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    Continua a leggere
                  </button>
                </div>
              )}

              {/* FALLBACK EDITORIALI VUOTI */}
              {filtroCorrente === "EDITORIALI" && !ultimoEditoriale && (
                <div style={{ border: `1px dashed ${colors.border}`, padding: '40px 20px', borderRadius: '8px', marginBottom: '40px', textAlign: 'center', backgroundColor: colors.lightGray }}>
                  <h3 style={{ color: '#666' }}>Nessun editoriale presente</h3>
                </div>
              )}

              {/* SPONSOR IN BASSO */}
              {sponsorFondo.length > 0 && (
                <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
                  <span style={{ display: 'block', fontSize: '10px', color: '#999', marginBottom: '-15px', letterSpacing: '1px', textAlign: 'center' }}>SPONSOR</span>
                  {sponsorFondo.map((s, index) => (
                    <div key={index} style={{ width: '80%', overflow: 'hidden' }}>
                      <div onClick={() => handleSponsorClick(s.id, s.link)}>
                        <img className="banner-hover" src={s.immagine} alt={`Sponsor Fondo ${index + 1}`} style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SIDEBAR LATERALE */}
            <aside className="sidebar-aside" style={{ borderLeft: `1px solid ${colors.border}`, paddingLeft: '30px' }}>
              {sponsorLaterale.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '40px', alignItems: 'center' }}>
                  <span style={{ display: 'block', fontSize: '10px', color: '#999', marginBottom: '-10px', letterSpacing: '1px', textAlign: 'center' }}>SPONSOR</span>
                  {sponsorLaterale.map((s, index) => (
                    <div key={index} style={{ width: '80%', overflow: 'hidden' }}>
                      <div onClick={() => handleSponsorClick(s.id, s.link)}>
                        <img className="banner-hover" src={s.immagine} alt={`Sponsor Sidebar ${index + 1}`} style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ELENCO EVENTI */}
              {(filtroCorrente === "HOME" || filtroCorrente === "EVENTI") && rubricaAttiva === "" && (
                <div style={{ marginTop: filtroCorrente === "EVENTI" ? '0px' : '45px' }}>
                  <h2 style={{ fontSize: '20px', borderBottom: `2px solid ${colors.accent}`, paddingBottom: '8px', marginBottom: '15px' }}>Eventi</h2>
                  {eventiSidebar.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {eventiSidebar.map(ev => (
                        <li key={ev.id} style={listItemStyle}>
                          <span onClick={() => onReadArticle(ev.id)} style={{ cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '4px' }}>📅 {ev.titolo}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#999' }}>Nessun evento in programma.</p>
                  )}
                </div>
              )}

              {/* SEZIONE "LE RUBRICHE" - TRASFORMATA IN UN ELENCO DI FILTRAGGIO DIRETTO */}
              {(filtroCorrente === "HOME" || filtroCorrente === "RUBRICA") && (
                <div style={{ marginBottom: "35px" }}>
                  <h2 style={{ fontSize: '20px', borderBottom: `2px solid ${colors.rubriche}`, paddingBottom: '8px', marginBottom: '15px' }}>
                    Le Rubriche
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {listaRubriche.map((rub) => {
                      const isActive = rubricaAttiva === rub.key;
                      return (
                        <span
                          key={rub.key}
                          className="rubrica-item-link"
                          style={rubricaLinkStyle(isActive)}
                          onClick={() => {
                            setRubricaAttiva(rub.key);
                            setFiltroCorrente("RUBRICA");
                            setPageRubriche(1);
                          }}
                        >
                          	● {rub.label}
                        </span>
                      );
                    })}

                    {rubricaAttiva !== "" && (
                      <button
                        onClick={() => {
                          setRubricaAttiva("");
                          setFiltroCorrente("HOME");
                        }}
                        style={{
                          marginTop: '10px',
                          padding: '6px 12px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '12px'
                        }}
                      >
                        ❌ Rimuovi filtro rubrica
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* ARCHIVIO ARTICOLI */}
              {(filtroCorrente === "HOME" || filtroCorrente === "NEWS") && rubricaAttiva === "" && (
                <>
                  <h2 style={{ fontSize: '20px', borderBottom: `2px solid ${colors.dark}`, paddingBottom: '8px', marginBottom: '15px' }}>Archivio Articoli</h2>
                  {currentArchivioArt.length > 0 ? (
                    <>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {currentArchivioArt.map(a => (
                          <li key={a.id} style={listItemStyle}>
                            <span onClick={() => onReadArticle(a.id)} style={{ cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '4px' }}>{a.titolo}</span>
                            <small style={{ color: '#888', fontStyle: 'italic' }}>di {getAutore(a)}</small>
                          </li>
                        ))}
                      </ul>
                      <Pagination total={totalPagesArt} current={pageArticoli} setPage={setPageArticoli} />
                    </>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#999', marginBottom: '25px' }}>Nessun articolo precedente.</p>
                  )}
                </>
              )}

              {/* ARCHIVIO EDITORIALI */}
              {(filtroCorrente === "HOME" || filtroCorrente === "EDITORIALI") && rubricaAttiva === "" && (
                <div style={{ marginTop: filtroCorrente === "EDITORIALI" ? '0px' : '45px' }}>
                  <h2 style={{ fontSize: '20px', borderBottom: `2px solid ${colors.editorial}`, paddingBottom: '8px', marginBottom: '15px' }}>Editoriali Precedenti</h2>
                  {currentEditoriali.length > 0 ? (
                    <>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {currentEditoriali.map(e => (
                          <li key={e.id} style={listItemStyle}>
                            <span onClick={() => onReadArticle(e.id)} style={{ cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '4px' }}>✍️ {e.titolo}</span>
                            <small style={{ color: '#888', fontStyle: 'italic' }}>di {getAutore(e)}</small>
                          </li>
                        ))}
                      </ul>
                      <Pagination total={totalPagesEdi} current={pageEditoriali} setPage={setPageEditoriali} />
                    </>
                  ) : (
                    <p style={{ fontSize: '13px', color: '#999', marginBottom: '25px' }}>Nessun editoriale precedente.</p>
                  )}
                </div>
              )}

              {/* SEZIONE SONDAGGI */}
              {filtroCorrente === "HOME" && rubricaAttiva === "" && ultimoSondaggio?.id && (
                <div style={{ marginTop: '45px' }}>
                  <h2 style={{ fontSize: '20px', borderBottom: `2px solid ${colors.primary}`, paddingBottom: '8px', marginBottom: '15px' }}>Sondaggi</h2>
                  <div className="poll-card-main" onClick={() => onReadArticle(ultimoSondaggio.id)} style={{ backgroundColor: colors.pollFocus, padding: '20px', borderRadius: '8px', color: 'white', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '18px', margin: 0 }}>{ultimoSondaggio.titolo}</h3>
                    <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.8 }}>Vota ora →</p>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {currentSondaggi.map(s => (
                      <li key={s.id} style={listItemStyle}>
                        <span onClick={() => onReadArticle(s.id)} style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#444' }}>📊 {s.titolo}</span>
                      </li>
                    ))}
                  </ul>
                  <Pagination total={totalPagesSon} current={pageSondaggi} setPage={setPageSondaggi} />
                </div>
              )}
            </aside>
          </div>
        </>
      )}

      {showCookieBanner && (
        <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", backgroundColor: "rgba(26, 26, 26, 0.93)", color: "white", padding: "15px 20px", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", boxShadow: "0 -2px 10px rgba(0,0,0,0.3)", flexWrap: "wrap" }}>
          <p style={{ fontSize: "13px", margin: 0, maxWidth: "800px" }}>
            Questo magazine utilizza cookie tecnici per garantirti la migliore esperienza. I dati delle aziende candidate sono trattati in conformità al GDPR.
            <span className="privacy-link" style={{ marginLeft: "5px", cursor: "pointer", textDecoration: "underline" }} onClick={onPrivacyClick}>Leggi l'informativa</span>.
          </p>
          <button onClick={acceptCookies} style={{ backgroundColor: colors.primary, color: "white", border: "none", padding: "8px 20px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>Accetta tutto</button>
        </div>
      )}

      {/* BOTTONE TORNA SU */}
      <button onClick={scrollToTop} className={`back-to-top-btn ${showScrollTop ? 'visible' : ''}`} title="Torna all'inizio della pagina">
        <span>Torna su</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default IndexPubblicazioni;
