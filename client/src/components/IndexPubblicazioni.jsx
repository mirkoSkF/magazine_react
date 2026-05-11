import React, { useState, useEffect } from "react";

const IndexPubblicazioni = ({ onReadArticle, onPrivacyClick }) => {
  const [tuttiContenuti, setTuttiContenuti] = useState([]);
  const [pageArticoli, setPageArticoli] = useState(1);
  const [pageSondaggi, setPageSondaggi] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(true); 
  const itemsPerPage = 5;

  const colors = {
    primary: "#007bff",
    dark: "#1a1a1a",
    lightGray: "#f8f9fa",
    border: "#dee2e6",
    pollFocus: "#003d82",
    accent: "#e63946"
  };

  const forceHyphenation = (text) => {
    if (!text) return "";
    let processed = text.replace(/&nbsp;/g, ' ');
    return processed.replace(/([a-zA-ZàèéìòùÀÈÉÌÒÙ]{6})([a-zA-ZàèéìòùÀÈÉÌÒÙ]{3,})/g, (match, p1, p2) => {
      return `${p1}&shy;${p2}`;
    });
  };

  useEffect(() => {
    fetch("http://localhost:8096/api/pagine")
      .then((res) => res.json())
      .then((data) => setTuttiContenuti(data.sort((a, b) => b.id - a.id)))
      .catch((err) => console.error("Errore:", err));
    
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
    return plainText.length > length ? plainText.substring(0, length) + "..." : plainText;
  };

  const getAutore = (a) => {
    let nome = a.nomeAutore || "";
    let cognome = a.cognomeAutore || "";
    if (!nome.trim() && a.utente) {
      nome = a.utente.nome || "";
      cognome = a.utente.cognome || "";
    } else if (!nome.trim() && a.autore) {
      nome = a.autore.nome || "";
      cognome = a.autore.cognome || "";
    }
    const firma = `${nome} ${cognome}`.trim();
    return firma || "Redazione";
  };

  const soloArticoli = tuttiContenuti.filter(c => c.tipo?.toUpperCase() !== "SONDAGGIO");
  const soloSondaggi = tuttiContenuti.filter(c => c.tipo?.toUpperCase() === "SONDAGGIO");

  const archivioArtBase = soloArticoli.slice(4);
  const totalPagesArt = Math.ceil(archivioArtBase.length / itemsPerPage);
  const currentArchivioArt = archivioArtBase.slice((pageArticoli - 1) * itemsPerPage, pageArticoli * itemsPerPage);

  const archivioSonBase = soloSondaggi.slice(1);
  const totalPagesSon = Math.ceil(archivioSonBase.length / itemsPerPage);
  const currentSondaggi = archivioSonBase.slice((pageSondaggi - 1) * itemsPerPage, pageSondaggi * itemsPerPage);

  if (tuttiContenuti.length === 0) return <div style={{ textAlign: "center", padding: "50px", fontFamily: "Arial" }}>Caricamento...</div>;

  const ultimoArticolo = soloArticoli[0] || {};
  const evidenza = soloArticoli.slice(1, 4);
  const ultimoSondaggio = soloSondaggi[0];

  const listItemStyle = { marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' };

  const Pagination = ({ total, current, setPage }) => {
    if (total <= 1) return null; 
    return (
      <div style={{ display: 'flex', gap: '5px', marginTop: '15px', flexWrap: 'wrap', paddingBottom: '20px' }}>
        {[...Array(total)].map((_, i) => (
          <button
            key={i}
            onClick={() => { setPage(i + 1); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
            style={{
              padding: '5px 12px', cursor: 'pointer',
              backgroundColor: current === i + 1 ? colors.primary : 'white',
              color: current === i + 1 ? 'white' : colors.dark,
              border: `1px solid ${current === i + 1 ? colors.primary : colors.border}`,
              borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', transition: 'all 0.2s'
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
        .read-more-btn:active { transform: translateY(-1px); }
        .poll-card-main { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important; }
        .poll-card-main:hover {
          background-color: #004ba0 !important;
          transform: translateY(-4px);
          box-shadow: 0 8px 15px rgba(0,61,130,0.3) !important;
        }
        .privacy-link { color: inherit; text-decoration: underline; cursor: pointer; transition: opacity 0.2s; }
        .privacy-link:hover { opacity: 0.7; }
      `}</style>

      {/* Sezione Card in Evidenza */}
      <div className="grid-evidenza" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }}>
        {evidenza.map((a) => (
          <div key={a.id} style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: '100%', height: '140px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
              {a.copertina && (
                <img 
                  src={`data:image/jpeg;base64,${a.copertina}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} 
                  alt="Cover" 
                />
              )}
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: colors.primary, textTransform: 'uppercase', marginBottom: '8px' }}>In Evidenza</span>
            <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', fontWeight: '700', flexGrow: 1, lineHeight: '1.2', color: colors.dark }}>{a.titolo}</h3>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px', fontStyle: 'italic', borderTop: '1px solid #f0f0f0', paddingTop: '10px' }}>
              di <span style={{ fontWeight: '600', color: '#444', fontStyle: 'normal' }}>{getAutore(a)}</span>
            </p>
            <span onClick={() => onReadArticle(a.id)} style={{ color: colors.primary, cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'inline-block' }}>Leggi →</span>
          </div>
        ))}
      </div>

      <div className="main-layout" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px", borderTop: `3px solid ${colors.dark}`, paddingTop: "25px" }}>
        <section>
          <div style={{ backgroundColor: colors.accent, color: 'white', display: 'inline-block', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', borderRadius: '2px' }}>ULTIM'ORA</div>
          <h1 className="main-title" style={{ fontSize: '42px', fontWeight: '700', marginBottom: '20px', lineHeight: '1.1' }}>{ultimoArticolo.titolo}</h1>
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
          <button className="read-more-btn" onClick={() => onReadArticle(ultimoArticolo.id)} style={{ padding: '15px 40px', backgroundColor: colors.dark, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: 'all 0.3s ease', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            Continua a leggere
          </button>
        </section>

        <aside className="sidebar-aside" style={{ borderLeft: `1px solid ${colors.border}`, paddingLeft: '30px' }}>
          <h2 style={{ fontSize: '20px', borderBottom: `2px solid ${colors.dark}`, paddingBottom: '8px', marginBottom: '15px' }}>Archivio Articoli</h2>
          {currentArchivioArt.length > 0 ? (
            <><ul style={{ listStyle: 'none', padding: 0 }}>{currentArchivioArt.map(a => (<li key={a.id} style={listItemStyle}><span onClick={() => onReadArticle(a.id)} style={{ cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '4px' }}>{a.titolo}</span><small style={{color: '#888', fontStyle: 'italic'}}>di {getAutore(a)}</small></li>))}</ul><Pagination total={totalPagesArt} current={pageArticoli} setPage={setPageArticoli} /></>
          ) : (<p style={{ fontSize: '13px', color: '#999' }}>Nessun articolo precedente.</p>)}
          
          <div style={{ marginTop: '45px' }}>
            <h2 style={{ fontSize: '20px', borderBottom: `2px solid ${colors.primary}`, paddingBottom: '8px', marginBottom: '15px' }}>Sondaggi</h2>
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
            
            <p style={{ fontSize: '11px', color: '#888', marginBottom: '20px', lineHeight: '1.4' }}>
              Partecipando ai nostri sondaggi o candidandoti per un'intervista, accetti il trattamento dei dati secondo la nostra {" "}
              <span className="privacy-link" style={{ color: colors.primary }} onClick={onPrivacyClick}>
                Privacy Policy
              </span>.
            </p>

            <ul style={{ listStyle: 'none', padding: 0 }}>{currentSondaggi.map(s => (<li key={s.id} style={listItemStyle}><span onClick={() => onReadArticle(s.id)} style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#444' }}>📊 {s.titolo}</span></li>))}</ul>
            <Pagination total={totalPagesSon} current={pageSondaggi} setPage={setPageSondaggi} />
          </div>
        </aside>
      </div>

      {/* Banner Cookie Integrato */}
      {showCookieBanner && (
        <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", backgroundColor: "rgba(26, 26, 26, 0.95)", color: "white", padding: "15px 20px", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", gap: "20px", boxShadow: "0 -2px 10px rgba(0,0,0,0.3)", flexWrap: "wrap" }}>
          <p style={{ fontSize: "13px", margin: 0, maxWidth: "800px" }}>
            Questo magazine utilizza cookie tecnici per garantirti la migliore esperienza. I dati delle aziende candidate sono trattati in conformità al GDPR. 
            <span className="privacy-link" style={{ marginLeft: "5px" }} onClick={onPrivacyClick}>
              Leggi l'informativa
            </span>.
          </p>
          <button onClick={acceptCookies} style={{ backgroundColor: colors.primary, color: "white", border: "none", padding: "8px 20px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "13px" }}>
            Accetta tutto
          </button>
        </div>
      )}
    </div>
  );
};

export default IndexPubblicazioni;