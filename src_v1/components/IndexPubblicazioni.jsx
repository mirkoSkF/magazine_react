import React, { useState, useEffect } from 'react';

const IndexPubblicazioni = () => {
  const [articoli, setArticoli] = useState([]);
  const [expanded, setExpanded] = useState({});

  const colors = {
    primary: '#007bff',
    dark: '#343a40',
    lightGray: '#f8f9fa',
    border: '#dee2e6',
    white: '#ffffff'
  };

  useEffect(() => {
    fetch('http://localhost:8096/api/pagine')
      .then(res => res.json())
      .then(setArticoli)
      .catch(err => console.error("Errore:", err));
  }, []);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <style>{`
        .article-card {
          background: ${colors.white};
          border-radius: 8px;
          border: 1px solid ${colors.border};
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          padding: 40px;
          margin-bottom: 30px;
        }
        
        /* Gestione Testo Giustificato e Sillabazione */
        .article-content {
          text-align: justify;
          hyphens: auto;
          -webkit-hyphens: auto;
          -ms-hyphens: auto;
          word-break: break-word;
        }

        /* Ottimizzazione per schermi piccoli: rimuoviamo il giustificato se lo spazio è troppo poco */
        @media (max-width: 600px) {
          .article-card { padding: 20px; }
          .article-content {
            text-align: left; /* Evita buchi enormi su smartphone */
            hyphens: none;
          }
        }

        .content-preview {
          overflow: hidden;
          position: relative;
          transition: max-height 0.5s ease;
        }
        .preview-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 80px;
          background: linear-gradient(transparent, ${colors.white});
        }
        .btn-expand {
          background: transparent;
          color: ${colors.primary};
          border: 1px solid ${colors.primary};
          padding: 8px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 20px;
          transition: all 0.3s;
        }
        .btn-expand:hover {
          background: ${colors.primary};
          color: white;
        }
        article img { 
          max-width: 100%; 
          height: auto; 
          border-radius: 4px; 
          display: block;
          margin: 20px auto;
        }
      `}</style>

      <h1 style={{ color: colors.dark, textAlign: 'center', marginBottom: '40px', fontWeight: '700' }}>
        Magazine Pubblicazioni
      </h1>

      {articoli.map(a => {
        const isExpanded = expanded[a.id];
        return (
          <article key={a.id} className="article-card">
            <div style={{ color: colors.primary, fontWeight: 'bold', marginBottom: '15px', fontSize: '14px' }}>
              PUBBLICAZIONE #{a.id}
            </div>

            <div 
              className="content-preview" 
              style={{ maxHeight: isExpanded ? 'none' : '400px' }}
            >
              {a.moduli?.map((m, i) => (
                <div 
                  key={i} 
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: m.contenuto }} 
                  style={{ fontSize: '18px', lineHeight: '1.7', color: '#444' }} 
                />
              ))}
              {!isExpanded && <div className="preview-overlay" />}
            </div>

            <button 
              className="btn-expand" 
              onClick={() => toggleExpand(a.id)}
            >
              {isExpanded ? 'Chiudi' : 'Estendi articolo'}
            </button>
          </article>
        );
      })}
    </div>
  );
};

export default IndexPubblicazioni;