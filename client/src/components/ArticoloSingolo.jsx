import React, { useEffect, useState } from 'react';

const ArticoloSingolo = ({ id, onBack }) => {
  const [articolo, setArticolo] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`http://localhost:8096/api/pagine/${id}`)
        .then(res => res.json())
        .then(data => setArticolo(data))
        .catch(err => console.error("Errore caricamento articolo:", err));
    }
  }, [id]);

  if (!articolo) return <div style={{ textAlign: 'center', padding: '50px' }}>Caricamento...</div>;

  const autore = articolo.autore;

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Barra di navigazione */}
      <nav style={{ padding: '20px', borderBottom: '1px solid #eee', maxWidth: '900px', margin: '0 auto' }}>
        <button 
          onClick={onBack} 
          style={{ background: 'none', border: 'none', color: '#007bff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
        >
          ← Torna al Magazine
        </button>
      </nav>

      <article style={{ maxWidth: '900px', margin: '40px auto', padding: '0 40px' }}>
        
        {/* SEZIONE AUTORE - STILE DASHBOARD */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '30px' }}>
          <div style={{ position: 'relative' }}>
            {autore?.fotoProfilo ? (
              <img 
                src={`data:image/jpeg;base64,${autore.fotoProfilo}`} 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginRight: '20px' }} 
                alt="Avatar" 
              />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ccc', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                {autore?.nome?.charAt(0)}{autore?.cognome?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '20px' }}>{autore?.nome} {autore?.cognome}</h3>
            <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>
              Pubblicato il {new Date(articolo.dataPubblicazione).toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>

        {/* TITOLO ARTICOLO CON PROGRESSIVO */}
        <h1 style={{ fontSize: '42px', fontFamily: 'Georgia, serif', lineHeight: '1.2', marginBottom: '20px' }}>
          {/* Aggiunto il progressivo ID qui */}
          {articolo.titolo || "Articolo"} #{articolo.id}
        </h1>

        {/* CONTENUTO HTML */}
        <div style={{ textAlign: 'justify' }}>
          {articolo.moduli?.map((m, i) => (
            <div 
              key={i} 
              style={{ fontSize: '19px', lineHeight: '1.8', fontFamily: 'Georgia, serif', color: '#333', marginBottom: '20px' }}
              dangerouslySetInnerHTML={{ __html: m.contenuto }} 
            />
          ))}
        </div>
      </article>
    </div>
  );
};

export default ArticoloSingolo;