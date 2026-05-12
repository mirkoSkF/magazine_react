import React, { useState, useEffect } from 'react';

const SponsorCarousel = ({ posizione, tipoPagina }) => { // Aggiunta prop tipoPagina
  const [sponsors, setSponsors] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Carichiamo la lista completa degli sponsor per QUELLA posizione e QUEL tipo pagina
    // Nota: Ho aggiunto i parametri alla query
    fetch(`http://localhost:8096/api/sponsors/all?posizione=${posizione}&tipoPagina=${tipoPagina}`)
      .then(res => res.json())
      .then(data => {
        // Se il tuo backend non ha ancora un endpoint /all filtrato, 
        // per ora filtriamo qui, ma è meglio farlo lato Java
        const filtrati = data.filter(s => 
          s.posizione === posizione && 
          s.tipoPagina === tipoPagina && 
          s.attivo
        );
        setSponsors(filtrati);
      })
      .catch(err => console.error("Errore caricamento carosello:", err));
  }, [posizione, tipoPagina]);

  // ... (resto del codice del timer e handleTrackClick identico)

  if (sponsors.length === 0) return null;
  const current = sponsors[currentIndex];

  return (
    <div style={{ textAlign: 'center', padding: '15px', background: '#fff', border: '1px solid #eee', borderRadius: '12px', margin: '20px 0', clear: 'both' }}>
      <small style={{ color: '#aaa', display: 'block', marginBottom: '8px', fontSize: '10px', letterSpacing: '1px' }}>
        PARTNER SKILL FACTORY
      </small>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <a href={current.linkSito} target="_blank" rel="noopener noreferrer" onClick={() => handleTrackClick(current.id)}>
          <img 
            src={current.bannerImage} 
            alt={current.nomeAzienda} 
            style={{ width: '100%', maxWidth: '728px', height: 'auto', borderRadius: '4px' }} 
          />
        </a>
      </div>
      {sponsors.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '10px' }}>
          {sponsors.map((_, i) => (
            <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === currentIndex ? '#007bff' : '#ddd' }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SponsorCarousel;