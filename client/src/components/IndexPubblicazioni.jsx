import React, { useState, useEffect } from "react";

const IndexPubblicazioni = ({ onReadArticle, onPrivacyClick }) => {
  const [tuttiContenuti, setTuttiContenuti] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCorrente, setFiltroCorrente] = useState("HOME");
  const [rubricaAttiva, setRubricaAttiva] = useState("");
  const [pageArticoli, setPageArticoli] = useState(1);
  const [pageRubriche, setPageRubriche] = useState(1);
  const [pageSondaggi, setPageSondaggi] = useState(1);
  const [pageEditoriali, setPageEditoriali] = useState(1); // Nuovo stato per paginazione editoriali
  const [showCookieBanner, setShowCookieBanner] = useState(true);

  const [sponsorLaterale, setSponsorLaterale] = useState([]);
  const [sponsorFondo, setSponsorFondo] = useState([]);

  // STATO PER IL BOTTONE TORNA SU (AGGIUNTO DA ARTICOLOSINGOLO)
  const [showScrollTop, setShowScrollTop] = useState(false);

  const itemsPerPage = 5;

  const colors = {
    primary: "#007bff",
    dark: "#1a1a1a",
    lightGray: "#f8f9fa",
    border: "#dee2e6",
    pollFocus: "#003d82",
    accent: "#e63946",
    editorial: "#6f42c1" // Colore dedicato per distinguere visivamente gli editoriali
  };

  const forceHyphenation = (text) => {
    if (!text) return "";
    let processed = text.replace(/&nbsp;/g, ' ');
    return processed.replace(/([a-zA-ZàèéìòùÀÈÉÌÒÙ]{6})([a-zA-ZàèéìòùÀÈÉÌÒÙ]{3,})/g, (match, p1, p2) => {
      return `${p1}&shy;${p2}`;
    });
  };

  // GESTIONE CLICK E AGGIORNAMENTO CONTATORE
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

  // EFFECT PER IL MONITORAGGIO DELLO SCROLL (AGGIUNTO DA ARTICOLOSINGOLO)
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

  // FUNZIONE DI SCROLL AL TOP (AGGIUNTA DA ARTICOLOSINGOLO)
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // OTTIMIZZAZIONE CARICAMENTO INIZIALE PARALLELO
  useEffect(() => {
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
      .catch((err) => console.error("Errore caricamento API parallelo:", err));

    const consent = localStorage.getItem("cookie-consent");
    if (consent) setShowCookieBanner(false);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "true");
    setShowCookieBanner(false);
  };

  const extractText = (articolo, length) => {
    if (!articolo.moduli || articolo.moduli.length === 0) return "";
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
  let nome = a.nomeAutore || "";
  let cognome = a.cognomeAutore || "";

  if (!nome.trim() && a.utente) {
    nome = a.utente.nome || "";
    cognome = a.utente.cognome || "";
  }

  let firma = `${nome} ${cognome}`.trim();

  // 🔥 QUI È IL PUNTO IMPORTANTE
  const username = a.autore || "";

  console.log("autore raw:", username);

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

  const contenutiPubblicati = tuttiContenuti.filter(item => item.bozza === false);

  const contenutiFiltrati = contenutiPubblicati.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const nelTitolo = item.titolo?.toLowerCase().includes(searchLower);
    const nellAutore = getAutore(item).toLowerCase().includes(searchLower);
    const nelTesto = extractText(item).toLowerCase().includes(searchLower);
    return nelTitolo || nellAutore || nelTesto;
  });

  const soloArticoli = contenutiPubblicati.filter(
    c => c.tipo?.toUpperCase() !== "SONDAGGIO" && 
         c.tipo?.toUpperCase() !== "RUBRICA" && 
         c.tipo?.toUpperCase() !== "EVENTO" &&
         c.tipo?.toUpperCase() !== "EDITORIALE"
  );
  const soloRubriche = contenutiPubblicati.filter(c => c.tipo?.toUpperCase() === "RUBRICA");
  const soloSondaggi = contenutiPubblicati.filter(c => c.tipo?.toUpperCase() === "SONDAGGIO");
  const soloEditoriali = contenutiPubblicati.filter(c => c.tipo?.toUpperCase() === "EDITORIALE");

  const archivioArtBase = soloArticoli.slice(4);
  const totalPagesArt = Math.ceil(archivioArtBase.length / itemsPerPage);
  const currentArchivioArt = archivioArtBase.slice((pageArticoli - 1) * itemsPerPage, pageArticoli * itemsPerPage);

  const inEvidenzaRubriche = soloRubriche.slice(0, 2);
  const archivioRubricheBase = soloRubriche.slice(2);
  const totalPagesRubriche = Math.ceil(archivioRubricheBase.length / itemsPerPage);
  const currentRubriche = archivioRubricheBase.slice((pageRubriche - 1) * itemsPerPage, pageRubriche * itemsPerPage);

  const archivioSonBase = soloSondaggi.slice(1);
  const totalPagesSon = Math.ceil(archivioSonBase.length / itemsPerPage);
  const currentSondaggi = archivioSonBase.slice((pageSondaggi - 1) * itemsPerPage, pageSondaggi * itemsPerPage);

  const ultimoEditoriale = soloEditoriali[0] || {};
  const archivioEdiBase = soloEditoriali.slice(1);
  const totalPagesEdi = Math.ceil(archivioEdiBase.length / itemsPerPage);
  const currentEditoriali = archivioEdiBase.slice((pageEditoriali - 1) * itemsPerPage, pageEditoriali * itemsPerPage);

  if (tuttiContenuti.length === 0)
    return <div style={{ textAlign: "center", padding: "50px", fontFamily: "Arial" }}>Caricamento...</div>;

  const ultimoArticolo = soloArticoli[0] || {};
  const evidenza = soloArticoli.slice(1, 4);
  const ultimoSondaggio = soloSondaggi[0];

  const listItemStyle = {
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #f0f0f0'
  };

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

  return (
    <div lang="it" style={{ maxWidth: "1200px", margin: "20px auto", padding: "0 20px", fontFamily: "Arial, sans-serif", position: "relative" }}>
      <style>{`
        @media (max-width: 992px) {
          .main-layout { grid-template-columns: 1fr !important; }
          .sidebar-aside { border-left: none !important; border-top: 1px solid ${colors.border}; padding-left: 0 !important; padding-top: 30px; }
          .grid-evidenza { grid-template-columns: repeat(3, 1fr) !important; gap: 10px !important; }
          .grid-rubriche-evidenza { grid-template-columns: 1fr !important; }
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

        .rubrica-card-hub {
          transition: all 0.3s ease;
          border: 1px solid #dee2e6;
        }
        .rubrica-card-hub:hover {
          transform: translateY(-2px);
          border-color: #17a2b8 !important;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
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

        .back-to-top-btn:active {
          transform: translateY(0);
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .back-to-top-btn {
            right: 40px !important;
          }
        }

        @media (max-width: 768px) {
          .back-to-top-btn {
            right: 20px !important;
            bottom: 20px !important;
            padding: 10px 16px !important;
            font-size: 13px !important;
          }
        }
      `}</style>

      {/* BARRA DI RICERCA */}
      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <input
          type="text"
          className="search-input"
          placeholder="Cerca per titolo, autore o parole nel testo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "12px 20px",
            fontSize: "16px",
            borderRadius: "30px",
            border: `1px solid ${colors.border}`,
            transition: "all 0.3s"
          }}
        />
      </div>
      <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    marginBottom: "30px",
    flexWrap: "wrap",
    fontWeight: "bold"
  }}
>
  <span
    style={{ cursor: "pointer" }}
    onClick={() => {
      setFiltroCorrente("NEWS");
      setRubricaAttiva("");
    }}
  >
    News
  </span>

  <select
    value={rubricaAttiva}
    onChange={(e) => {
      setRubricaAttiva(e.target.value);
      setFiltroCorrente("RUBRICA");
    }}
    style={{
      border: "none",
      fontWeight: "bold",
      cursor: "pointer"
    }}
  >
    <option value="">Rubriche ▼</option>
    <option value="FORMATORE">Formatore</option>
    <option value="QUALITA">Qualità</option>
    <option value="IFP">IFP</option>
    <option value="DIGITALI">Digitali</option>
    <option value="AI">AI</option>
    <option value="LAVORO">Lavoro</option>
  </select>

  <span
    style={{ cursor: "pointer" }}
    onClick={() => {
      setFiltroCorrente("EVENTI");
      setRubricaAttiva("");
    }}
  >
    Eventi
  </span>

  <span
    style={{ cursor: "pointer" }}
    onClick={() => {
      setFiltroCorrente("EDITORIALI");
      setRubricaAttiva("");
    }}
  >
    Editoriali
  </span>

  <span
    style={{ cursor: "pointer" }}
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
            style={{
              marginTop: "30px",
              background: "none",
              border: "none",
              color: colors.primary,
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            ← Torna alla home
          </button>
        </div>
      ) : (
        <>
          <div className="grid-evidenza" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }}>
            {evidenza.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: '15px',
                  backgroundColor: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '140px',
                    backgroundColor: '#eee',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '15px'
                  }}
                >
                  {a.copertina && (
                    <img
                      src={`data:image/jpeg;base64,${a.copertina}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                      alt="Cover"
                    />
                  )}
                </div>

                <span style={{ fontSize: '11px', fontWeight: '700', color: colors.primary, textTransform: 'uppercase', marginBottom: '8px' }}>
                  In Evidenza
                </span>

                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', fontWeight: '700', flexGrow: 1, lineHeight: '1.2', color: colors.dark }}>
                  {a.titolo}
                </h3>

                <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px', fontStyle: 'italic', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
                  di <span style={{ fontWeight: '600', color: '#444', fontStyle: 'normal' }}>{getAutore(a)}</span>
                </p>

                <span
                  onClick={() => onReadArticle(a.id)}
                  style={{ color: colors.primary, cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'inline-block' }}
                >
                  Leggi →
                </span>
              </div>
            ))}
          </div>

          <div className="main-layout" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px", borderTop: `3px solid ${colors.dark}`, paddingTop: "25px" }}>
            <section>
              
              {/* CORREZIONE: Blocco Ultimo Articolo con cornice e font 32px */}
              {ultimoArticolo.id && ultimoArticolo.bozza !== true && (
                <div style={{ border: `1px solid ${colors.border}`, padding: '20px', borderRadius: '8px', marginBottom: '40px' }}>
                  <div style={{ backgroundColor: colors.accent, color: 'white', display: 'inline-block', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', borderRadius: '2px' }}>
                    ULTIMO ARTICOLO
                  </div>

                  <h1 className="main-title" style={{ fontSize: '32px', fontWeight: '700', marginBottom: '20px', lineHeight: '1.1' }}>
                    {ultimoArticolo.titolo}
                  </h1>

                  <div className="main-image-container" style={{ width: '100%', height: '400px', backgroundColor: '#eee', borderRadius: '8px', overflow: 'hidden', marginBottom: '25px', display: 'flex', alignItems: 'center' }}>
                    {ultimoArticolo.copertina && (
                      <img
                        src={`data:image/jpeg;base64,${ultimoArticolo.copertina}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                        alt="Main"
                      />
                    )}
                  </div>

                  <div
                    style={{ fontSize: '19px', color: '#333', lineHeight: '1.8', marginBottom: '35px', textAlign: "justify", textJustify: 'inter-word' }}
                    dangerouslySetInnerHTML={{ __html: forceHyphenation(extractText(ultimoArticolo, 600)) }}
                  />

                  <button
                    className="read-more-btn"
                    onClick={() => onReadArticle(ultimoArticolo.id)}
                    style={{ padding: '15px 40px', backgroundColor: colors.dark, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  >
                    Continua a leggere
                  </button>
                </div>
              )}

              {/* INVERSIONE: Il blocco Editoriale ora è sotto */}
              {ultimoEditoriale.id && ultimoEditoriale.bozza !== true && (
                <div style={{ backgroundColor: "#fdf8ff", border: `1px solid ${colors.editorial}`, padding: "25px", borderRadius: "8px", marginBottom: "40px", boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <div style={{ backgroundColor: colors.editorial, color: 'white', display: 'inline-block', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', borderRadius: '2px', letterSpacing: '0.5px' }}>
                    EDITORIALE IN EVIDENZA
                  </div>

                  <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '15px', lineHeight: '1.2', color: colors.dark }}>
                    {ultimoEditoriale.titolo}
                  </h2>

                  <p style={{ fontSize: '13px', color: '#555', marginBottom: '20px' }}>
                    Scritto da <strong>{getAutore(ultimoEditoriale)}</strong>
                  </p>

                  {ultimoEditoriale.copertina && (
                    <div style={{ width: '100%', height: '300px', backgroundColor: '#eee', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px' }}>
                      <img
                        src={`data:image/jpeg;base64,${ultimoEditoriale.copertina}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                        alt="Editoriale Cover"
                      />
                    </div>
                  )}

                  <div
                    style={{ fontSize: '16px', color: '#444', lineHeight: '1.7', marginBottom: '25px', textAlign: "justify" }}
                    dangerouslySetInnerHTML={{ __html: forceHyphenation(extractText(ultimoEditoriale, 400)) }}
                  />

                  <button
                    className="editorial-btn"
                    onClick={() => onReadArticle(ultimoEditoriale.id)}
                    style={{ padding: '12px 30px', backgroundColor: colors.editorial, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  >
                    Leggi l'Editoriale completo
                  </button>
                </div>
              )}

              {/* SPONSOR FONDO */}
              {sponsorFondo.length > 0 && (
                <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center' }}>
                  <span style={{ display: 'block', fontSize: '10px', color: '#999', marginBottom: '-15px', letterSpacing: '1px', textAlign: 'center' }}>
                    SPONSOR
                  </span>

                  {sponsorFondo.map((s, index) => (
                    <div key={index} style={{ width: '80%', overflow: 'hidden' }}>
                      <div onClick={() => handleSponsorClick(s.id, s.link)}>
                        <img
                          className="banner-hover"
                          src={s.immagine}
                          alt={`Sponsor Fondo ${index + 1}`}
                          style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="sidebar-aside" style={{ borderLeft: `1px solid ${colors.border}`, paddingLeft: '30px' }}>
              {/* SPONSOR SIDEBAR */}
              {sponsorLaterale.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '40px', alignItems: 'center' }}>
                  <span style={{ display: 'block', fontSize: '10px', color: '#999', marginBottom: '-10px', letterSpacing: '1px', textAlign: 'center' }}>
                    SPONSOR
                  </span>

                  {sponsorLaterale.map((s, index) => (
                    <div key={index} style={{ width: '80%', overflow: 'hidden' }}>
                      <div onClick={() => handleSponsorClick(s.id, s.link)}>
                        <img
                          className="banner-hover"
                          src={s.immagine}
                          alt={`Sponsor Sidebar ${index + 1}`}
                          style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ARCHIVIO ARTICOLI */}
              <h2 style={{ fontSize: '20px', borderBottom: `2px solid ${colors.dark}`, paddingBottom: '8px', marginBottom: '15px' }}>
                Archivio Articoli
              </h2>

              {currentArchivioArt.length > 0 ? (
                <>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {currentArchivioArt.map(a => (
                      <li key={a.id} style={listItemStyle}>
                        <span
                          onClick={() => onReadArticle(a.id)}
                          style={{ cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '4px' }}
                        >
                          {a.titolo}
                        </span>
                        <small style={{ color: '#888', fontStyle: 'italic' }}>
                          di {getAutore(a)}
                        </small>
                      </li>
                    ))}
                  </ul>
                  <Pagination total={totalPagesArt} current={pageArticoli} setPage={setPageArticoli} />
                </>
              ) : (
                <p style={{ fontSize: '13px', color: '#999' }}>Nessun articolo precedente.</p>
              )}

              {/* ELENCO IMPAGINATO DEGLI EDITORIALI PRECEDENTI */}
              <div style={{ marginTop: '45px' }}>
                <h2 style={{ fontSize: '20px', borderBottom: `2px solid ${colors.editorial}`, paddingBottom: '8px', marginBottom: '15px' }}>
                  Editoriali Precedenti
                </h2>
                {currentEditoriali.length > 0 ? (
                  <>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {currentEditoriali.map(e => (
                        <li key={e.id} style={listItemStyle}>
                          <span
                            onClick={() => onReadArticle(e.id)}
                            style={{ cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '4px' }}
                          >
                            ✍️ {e.titolo}
                          </span>
                          <small style={{ color: '#888', fontStyle: 'italic' }}>
                            di {getAutore(e)}
                          </small>
                        </li>
                      ))}
                    </ul>
                    <Pagination total={totalPagesEdi} current={pageEditoriali} setPage={setPageEditoriali} />
                  </>
                ) : (
                  <p style={{ fontSize: '13px', color: '#999' }}>Nessun editoriale precedente.</p>
                )}
              </div>

              {/* ALTRE RUBRICHE */}
              <div style={{ marginTop: '45px' }}>
                <h2 style={{ fontSize: '20px', borderBottom: `2px solid #17a2b8`, paddingBottom: '8px', marginBottom: '15px' }}>
                  Altre Rubriche
                </h2>
                {currentRubriche.length > 0 ? (
                  <>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {currentRubriche.map(r => (
                        <li key={r.id} style={listItemStyle}>
                          <span
                            onClick={() => onReadArticle(r.id)}
                            style={{ cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '4px' }}
                          >
                            📚 {r.titolo}
                          </span>
                          <small style={{ color: '#888', fontStyle: 'italic' }}>
                            di {getAutore(r)}
                          </small>
                        </li>
                      ))}
                    </ul>
                    <Pagination total={totalPagesRubriche} current={pageRubriche} setPage={setPageRubriche} />
                  </>
                ) : (
                  <p style={{ fontSize: '13px', color: '#999' }}>Nessun'alta rubrica precedente.</p>
                )}
              </div>

              {/* SONDAGGI */}
              <div style={{ marginTop: '45px' }}>
                <h2 style={{ fontSize: '20px', borderBottom: `2px solid ${colors.primary}`, paddingBottom: '8px', marginBottom: '15px' }}>
                  Sondaggi
                </h2>
                {ultimoSondaggio && (
                  <div
                    className="poll-card-main"
                    onClick={() => onReadArticle(ultimoSondaggio.id)}
                    style={{ backgroundColor: colors.pollFocus, padding: '20px', borderRadius: '8px', color: 'white', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  >
                    <h3 style={{ fontSize: '18px', margin: 0 }}>{ultimoSondaggio.titolo}</h3>
                    <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.8 }}>Vota ora →</p>
                  </div>
                )}
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {currentSondaggi.map(s => (
                    <li key={s.id} style={listItemStyle}>
                      <span
                        onClick={() => onReadArticle(s.id)}
                        style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#444' }}
                      >
                        📊 {s.titolo}
                      </span>
                    </li>
                  ))}
                </ul>
                <Pagination total={totalPagesSon} current={pageSondaggi} setPage={setPageSondaggi} />
              </div>
            </aside>
          </div>
        </>
      )}

      {showCookieBanner && (
        <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", backgroundColor: "rgba(26, 26, 26, 0.95)", color: "white", padding: "15px 20px", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", boxShadow: "0 -2px 10px rgba(0,0,0,0.3)", flexWrap: "wrap" }}>
          <p style={{ fontSize: "13px", margin: 0, maxWidth: "800px" }}>
            Questo magazine utilizza cookie tecnici per garantirti la migliore esperienza. I dati delle aziende candidate sono trattati in conformità al GDPR.
            <span
              className="privacy-link"
              style={{ marginLeft: "5px", cursor: "pointer", textDecoration: "underline" }}
              onClick={onPrivacyClick}
            >
              Leggi l'informativa
            </span>.
          </p>
          <button
            onClick={acceptCookies}
            style={{ backgroundColor: colors.primary, color: "white", border: "none", padding: "8px 20px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}
          >
            Accetta tutto
          </button>
        </div>
      )}

      {/* BOTTONE TORNA SU (AGGIUNTO DA ARTICOLOSINGOLO) */}
      <button
        onClick={scrollToTop}
        className={`back-to-top-btn ${showScrollTop ? 'visible' : ''}`}
        title="Torna all'inizio della pagina"
      >
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
