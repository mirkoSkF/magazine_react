import React, { useState, useEffect } from "react";

const IndexPubblicazioni = ({ onReadArticle }) => {
  const [articoli, setArticoli] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10;

  const colors = {
    primary: "#007bff",
    dark: "#1a1a1a",
    lightGray: "#f8f9fa",
    border: "#dee2e6",
    accent: "#e63946",
  };

  useEffect(() => {
    fetch("http://localhost:8096/api/pagine")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => b.id - a.id);
        setArticoli(sorted);
      })
      .catch((err) => console.error("Errore caricamento:", err));
  }, []);

  const ultimoArticolo = articoli[0];
  const evidenza = articoli.slice(1, 4);
  const restanti = articoli.slice(4);

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentLinkArticles = restanti.slice(indexOfFirstArticle, indexOfLastArticle);

  if (articoli.length === 0) return <div style={{ textAlign: "center", padding: "50px" }}>Caricamento Magazine...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "20px auto", padding: "0 20px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>
      
      {/* 1. SEZIONE TOP: IN EVIDENZA (Usa le nuove copertine) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {evidenza.map((a) => (
          <div key={a.id} style={smallCardStyle}>
            {/* AGGIUNTA: Immagine di copertina anche per i piccoli box */}
            <div style={{ width: '100%', height: '150px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                {a.copertina ? (
                    <img src={`data:image/jpeg;base64,${a.copertina}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cover" />
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' }}>No Image</div>
                )}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: colors.primary, textTransform: 'uppercase' }}>In Evidenza</span>
            <h3 style={{ fontSize: '18px', margin: '10px 0', lineHeight: '1.3' }}>
                {/* USA IL TITOLO REALE */}
                {a.titolo || `Articolo #${a.id}`}
            </h3>
            <p style={previewTextStyle}>{extractText(a, 80)}</p>
            <span onClick={() => onReadArticle(a.id)} style={{ ...linkStyle, cursor: 'pointer' }}>Leggi tutto →</span>
          </div>
        ))}
      </div>

      {/* 2. SEZIONE CENTRALE: ULTIM'ORA */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px", borderTop: `2px solid ${colors.dark}`, paddingTop: "20px" }}>
        <section>
          <div style={{ backgroundColor: colors.accent, color: 'white', display: 'inline-block', padding: '2px 10px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>ULTIM'ORA</div>
          
          {/* USA IL TITOLO REALE */}
          <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px', lineHeight: '1.1', fontFamily: 'Georgia, serif' }}>
            {ultimoArticolo.titolo || `Articolo #${ultimoArticolo.id}`}
          </h1>

          {/* AGGIUNTA: Visualizzazione dinamica della Copertina Principale */}
          <div style={{ width: '100%', height: '450px', backgroundColor: '#eee', borderRadius: '8px', overflow: 'hidden', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            {ultimoArticolo.copertina ? (
                <img 
                    src={`data:image/jpeg;base64,${ultimoArticolo.copertina}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    alt="Copertina Principale" 
                />
            ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    Immagine Articolo Principale
                </div>
            )}
          </div>

          <div style={{ fontSize: '20px', lineHeight: '1.6', color: '#333', textAlign: 'justify', fontFamily: 'Georgia, serif' }}>
            {extractText(ultimoArticolo, 400)}...
          </div>
          <button onClick={() => onReadArticle(ultimoArticolo.id)} style={btnStyle}>Leggi l'articolo completo</button>
        </section>

        {/* 3. SIDEBAR ARCHIVIO */}
        <aside style={{ borderLeft: `1px solid ${colors.border}`, paddingLeft: '20px' }}>
          <h2 style={{ fontSize: '20px', borderBottom: `1px solid ${colors.dark}`, paddingBottom: '10px', marginBottom: '20px' }}>Archivio</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {currentLinkArticles.map(a => (
              <li key={a.id} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: `1px solid #eee` }}>
                <span style={{ fontSize: '12px', color: colors.primary }}>{new Date(a.dataPubblicazione).toLocaleDateString()}</span>
                <span 
                  onClick={() => onReadArticle(a.id)} 
                  style={{ display: 'block', color: colors.dark, cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}
                >
                  {/* USA IL TITOLO REALE */}
                  {a.titolo || `Articolo #${a.id}`}
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
};

// Pulizia della funzione helper: ora estraiamo solo il testo per l'anteprima
const extractText = (articolo, length) => {
  if (!articolo.moduli?.[0]?.contenuto) return "";
  const temp = document.createElement('div');
  temp.innerHTML = articolo.moduli[0].contenuto;
  return temp.innerText.substring(0, length);
};

// --- STILI ---
const smallCardStyle = { padding: '20px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };
const previewTextStyle = { fontSize: '14px', color: '#666', lineHeight: '1.4', marginBottom: '15px' };
const linkStyle = { fontSize: '13px', color: '#007bff', textDecoration: 'none', fontWeight: 'bold' };
const btnStyle = { marginTop: '30px', padding: '12px 25px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default IndexPubblicazioni;