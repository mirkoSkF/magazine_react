import React, { useState, useEffect } from 'react';

const IndexPubblicazioni = () => {
  const [articoli, setArticoli] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true); // Stato per il caricamento

  const colors = {
    primary: '#007bff',
    dark: '#343a40',
    lightGray: '#f8f9fa',
    border: '#dee2e6',
    white: '#ffffff'
  };

  useEffect(() => {
    fetch('http://localhost:8096/api/pagine')
      .then(res => {
        if (!res.ok) throw new Error("Errore nel recupero dati");
        return res.json();
      })
      .then(data => {
        setArticoli(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Errore:", err);
        setLoading(false);
      });
  }, []);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 1. Vista durante il caricamento
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif', color: '#666' }}>
        Caricamento articoli in corso...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: colors.dark, textAlign: 'center', marginBottom: '40px', fontWeight: '700' }}>
        Magazine Pubblicazioni
      </h1>

      {/* 2. Gestione caso nessun articolo */}
      {articoli.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999' }}>Al momento non ci sono pubblicazioni disponibili.</p>
      ) : (
        articoli.map(a => {
          const isExpanded = expanded[a.id];
          return (
            <article key={a.id} className="article-card" style={cardStyle(colors)}>
              <div style={{ color: colors.primary, fontWeight: 'bold', marginBottom: '15px', fontSize: '14px' }}>
                PUBBLICAZIONE #{a.id}
              </div>

              <div style={{ 
                maxHeight: isExpanded ? 'none' : '400px', 
                overflow: 'hidden', 
                position: 'relative',
                transition: 'max-height 0.5s ease-in-out' // Transizione fluida
              }}>
                {a.moduli?.map((m, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: m.contenuto }} 
                       style={{ fontSize: '18px', lineHeight: '1.7', color: '#444', textAlign: 'justify' }} />
                ))}
                {!isExpanded && <div style={overlayStyle(colors)} />}
              </div>

              <button 
                className="btn-expand" 
                onClick={() => toggleExpand(a.id)} 
                style={expandBtnStyle(colors)}
                onMouseOver={(e) => e.target.style.background = colors.primary + '10'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                {isExpanded ? 'Leggi meno' : 'Leggi tutto l\'articolo'}
              </button>
            </article>
          );
        })
      )}
    </div>
  );
};

// --- STILI ---
const cardStyle = (colors) => ({ 
  background: colors.white, 
  borderRadius: '12px', 
  border: `1px solid ${colors.border}`, 
  padding: '40px', 
  marginBottom: '30px',
  boxShadow: '0 2px 15px rgba(0,0,0,0.05)' 
});

const overlayStyle = (colors) => ({ 
  position: 'absolute', 
  bottom: 0, 
  left: 0, 
  width: '100%', 
  height: '100px', 
  background: `linear-gradient(transparent, ${colors.white})` 
});

const expandBtnStyle = (colors) => ({ 
  background: 'transparent', 
  color: colors.primary, 
  border: `1.5px solid ${colors.primary}`, 
  padding: '10px 25px', 
  borderRadius: '6px', 
  cursor: 'pointer', 
  fontWeight: '600', 
  marginTop: '25px',
  transition: 'all 0.2s ease'
});

export default IndexPubblicazioni;