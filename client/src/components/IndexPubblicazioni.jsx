import React, { useState, useEffect } from "react";

const IndexPubblicazioni = ({ onReadArticle }) => {
  const [tuttiContenuti, setTuttiContenuti] = useState([]);
  const [pageArticoli, setPageArticoli] = useState(1);
  const [pageSondaggi, setPageSondaggi] = useState(1);
  const itemsPerPage = 5;

  const colors = {
    primary: "#007bff",
    dark: "#1a1a1a",
    lightGray: "#f8f9fa",
    border: "#dee2e6",
    pollFocus: "#003d82",
    accent: "#e63946"
  };

  useEffect(() => {
    fetch("http://localhost:8096/api/pagine")
      .then((res) => res.json())
      .then((data) => setTuttiContenuti(data.sort((a, b) => b.id - a.id)))
      .catch((err) => console.error("Errore:", err));
  }, []);

  // Integrazione: Aggiunto optional chaining ?. e toUpperCase() per rendere il filtro indistruttibile
  const soloArticoli = tuttiContenuti.filter(c => c.tipo?.toUpperCase() !== "SONDAGGIO");
  const soloSondaggi = tuttiContenuti.filter(c => c.tipo?.toUpperCase() === "SONDAGGIO");
  const ultimoSondaggio = soloSondaggi[0];

  // Logica paginazione (Originale)
  const currentArchivioArt = soloArticoli.slice(4).slice((pageArticoli - 1) * itemsPerPage, pageArticoli * itemsPerPage);
  const totalPagesArt = Math.ceil(soloArticoli.slice(4).length / itemsPerPage);
  const currentSondaggi = soloSondaggi.slice(1).slice((pageSondaggi - 1) * itemsPerPage, pageSondaggi * itemsPerPage);
  const totalPagesSon = Math.ceil(soloSondaggi.slice(1).length / itemsPerPage);

  if (tuttiContenuti.length === 0) return <div style={{ textAlign: "center", padding: "50px" }}>Caricamento...</div>;

  const ultimoArticolo = soloArticoli[0] || {};
  const evidenza = soloArticoli.slice(1, 4);

  const listItemStyle = { 
    marginBottom: '12px', 
    paddingBottom: '8px', 
    borderBottomWidth: '1px', 
    borderBottomStyle: 'solid', 
    borderBottomColor: '#f0f0f0' 
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "20px auto", padding: "0 20px", fontFamily: "Arial, sans-serif" }}>
      
      {/* Sezione Top Cards (Originale) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        {evidenza.map((a) => (
          <div key={a.id} style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
            <div style={{ width: '100%', height: '140px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
              {a.copertina && <img src={`data:image/jpeg;base64,${a.copertina}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cover" />}
            </div>
            <h3 style={{ fontSize: '18px', margin: '10px 0', fontWeight: '700' }}>{a.titolo}</h3>
            <span onClick={() => onReadArticle(a.id)} style={{ color: colors.primary, cursor: 'pointer', fontWeight: 'bold' }}>Leggi →</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "40px", borderTop: `3px solid ${colors.dark}`, paddingTop: "25px" }}>
        
        {/* Main Content (Originale) */}
        <section>
          <h1 style={{ fontSize: '42px', fontWeight: '700', marginBottom: '20px' }}>{ultimoArticolo.titolo}</h1>
          <div style={{ width: '100%', height: '400px', backgroundColor: '#eee', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
            {ultimoArticolo.copertina && <img src={`data:image/jpeg;base64,${ultimoArticolo.copertina}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Main" />}
          </div>
          <button onClick={() => onReadArticle(ultimoArticolo.id)} style={{ padding: '12px 30px', backgroundColor: colors.dark, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Continua a leggere</button>
        </section>

        {/* Sidebar */}
        <aside style={{ borderLeft: `1px solid ${colors.border}`, paddingLeft: '30px' }}>
          <h2 style={{ fontSize: '20px', borderBottom: `2px solid ${colors.dark}`, paddingBottom: '8px', marginBottom: '15px' }}>Archivio</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {currentArchivioArt.map(a => (
              <li key={a.id} style={listItemStyle}>
                <span onClick={() => onReadArticle(a.id)} style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>{a.titolo}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '40px' }}>
            <h2 style={{ fontSize: '20px', borderBottom: `2px solid ${colors.primary}`, paddingBottom: '8px', marginBottom: '15px' }}>Sondaggi</h2>
            
            {/* Sondaggio in evidenza (Originale) */}
            {ultimoSondaggio && (
              <div onClick={() => onReadArticle(ultimoSondaggio.id)} style={{ backgroundColor: colors.pollFocus, padding: '20px', borderRadius: '8px', color: 'white', cursor: 'pointer', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', margin: 0 }}>{ultimoSondaggio.titolo}</h3>
                <p style={{ fontSize: '12px', marginTop: '10px', opacity: 0.8 }}>Vota ora →</p>
              </div>
            )}

            {/* Integrazione: Lista archivio sondaggi mancante */}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {currentSondaggi.map(s => (
                <li key={s.id} style={listItemStyle}>
                  <span onClick={() => onReadArticle(s.id)} style={{ cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#444' }}>
                    📊 {s.titolo}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default IndexPubblicazioni;