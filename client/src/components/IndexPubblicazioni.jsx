import React, { useState, useEffect } from "react";

const IndexPubblicazioni = ({ onReadArticle }) => {
  const [articoli, setArticoli] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 8;

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
  const totalPages = Math.ceil(restanti.length / articlesPerPage);

  if (articoli.length === 0) return <div style={{ textAlign: "center", padding: "50px", fontFamily: "Arial, sans-serif" }}>Caricamento...</div>;

  const titleStyle = {
    fontFamily: "Arial, Helvetica, sans-serif !important",
    color: colors.dark,
    lineHeight: '1.2',
    fontWeight: '700'
  };

  const bodyStyle = {
    fontFamily: "Arial, Helvetica, sans-serif !important",
    lineHeight: '1.6'
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "20px auto", padding: "0 20px", ...bodyStyle }}>
      
      {/* 1. SEZIONE TOP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {evidenza.map((a) => (
          <div key={a.id} style={smallCardStyle}>
            <div style={{ width: '100%', height: '160px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                {a.copertina ? (
                    <img src={`data:image/jpeg;base64,${a.copertina}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cover" />
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '12px' }}>No Image</div>
                )}
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: colors.primary, textTransform: 'uppercase', ...bodyStyle }}>In Evidenza</span>
            <h3 style={{ ...titleStyle, fontSize: '22px', margin: '10px 0' }}>{a.titolo || `Articolo #${a.id}`}</h3>
            <p style={{ ...previewTextStyle, ...bodyStyle }}>{extractText(a, 90)}</p>
            <span onClick={() => onReadArticle(a.id)} style={{ ...linkStyle, cursor: 'pointer', ...bodyStyle }}>Leggi tutto →</span>
          </div>
        ))}
      </div>

      {/* 2. SEZIONE CENTRALE */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px", borderTop: `3px solid ${colors.dark}`, paddingTop: "25px" }}>
        <section>
          <div style={{ backgroundColor: colors.accent, color: 'white', display: 'inline-block', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px', borderRadius: '2px', ...bodyStyle }}>ULTIM'ORA</div>
          <h1 style={{ ...titleStyle, fontSize: '48px', marginBottom: '25px', letterSpacing: '-1.5px' }}>{ultimoArticolo.titolo}</h1>
          <div style={{ width: '100%', height: '480px', backgroundColor: '#eee', borderRadius: '8px', overflow: 'hidden', marginBottom: '25px' }}>
            {ultimoArticolo.copertina && <img src={`data:image/jpeg;base64,${ultimoArticolo.copertina}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Main" />}
          </div>
          <div style={{ ...bodyStyle, fontSize: '19px', color: '#333', textAlign: 'justify' }}>{extractText(ultimoArticolo, 450)}...</div>
          <button onClick={() => onReadArticle(ultimoArticolo.id)} style={{ ...btnStyle, ...bodyStyle }}>Continua a leggere</button>
        </section>

        {/* 3. SIDEBAR ARCHIVIO - MASSIMA COMPATTEZZA */}
        <aside style={{ borderLeft: `1px solid ${colors.border}`, paddingLeft: '30px' }}>
          <h2 style={{ fontSize: '24px', borderBottom: `2px solid ${colors.dark}`, paddingBottom: '12px', marginBottom: '20px', ...titleStyle }}>Archivio</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {currentLinkArticles.map(a => (
              <li key={a.id} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: `1px solid #f5f5f5` }}>
                <span style={{ fontSize: '10px', color: colors.primary, fontWeight: '700', ...bodyStyle, textTransform: 'uppercase' }}>
                    {new Date(a.dataPubblicazione).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span 
                  onClick={() => onReadArticle(a.id)} 
                  style={{ 
                      display: 'block', 
                      ...titleStyle,
                      cursor: 'pointer', 
                      fontSize: '16px',
                      marginTop: '2px' 
                  }}
                >
                  {a.titolo || `Articolo #${a.id}`}
                </span>
              </li>
            ))}
          </ul>

          {/* PAGINAZIONE MINIMALE */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: '5px', marginTop: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => {
                    setCurrentPage(i + 1);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  style={{
                    padding: '5px 9px',
                    backgroundColor: currentPage === i + 1 ? colors.dark : 'white',
                    color: currentPage === i + 1 ? 'white' : colors.dark,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    fontFamily: 'Arial, sans-serif'
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

const extractText = (articolo, length) => {
  if (!articolo.moduli?.[0]?.contenuto) return "";
  const temp = document.createElement('div');
  temp.innerHTML = articolo.moduli[0].contenuto;
  return temp.innerText.substring(0, length);
};

const smallCardStyle = { padding: '20px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px' };
const previewTextStyle = { fontSize: '15px', color: '#666', marginBottom: '15px' };
const linkStyle = { fontSize: '13px', color: '#007bff', textDecoration: 'none', fontWeight: 'bold' };
const btnStyle = { marginTop: '35px', padding: '15px 35px', backgroundColor: '#1a1a1a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' };

export default IndexPubblicazioni;