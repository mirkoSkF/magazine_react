import React, { useState, useEffect } from "react";
import IndexPubblicazioni from "./IndexPubblicazioni";

/**
 * COMPONENTE AGGIUNTIVO: Sponsor Carousel
 * Non tocca il codice originale, viene renderizzato accanto.
 */
const SidebarSponsorCarousel = ({ colors }) => {
  const [sponsors, setSponsors] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8096/api/sponsors")
      .then(res => res.json())
      .then(data => setSponsors(data.filter(s => s.posizione === 'HOME_TOP')))
      .catch(err => console.error("Errore sponsor:", err));
  }, []);

  useEffect(() => {
    if (sponsors.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sponsors.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [sponsors]);

  if (sponsors.length === 0) return null;
  const current = sponsors[currentIndex];

  return (
    <div style={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: `1px solid #dee2e6` }}>
      <a href={current.linkSito} target="_blank" rel="noopener noreferrer">
        <img src={current.bannerImage} alt={current.nomeAzienda} style={{ width: '100%', display: 'block' }} />
      </a>
    </div>
  );
};

// WRAPPER PRINCIPALE
const EnhancedIndex = (props) => {
  return (
    <div className="page-wrapper">
      {/* In questo scenario, IndexPubblicazioni viene usato così com'è. 
          Le modifiche grafiche si gestiscono via CSS esterno o 
          iniettando i componenti necessari tramite le props se previsto.
      */}
      <IndexPubblicazioni {...props} />
    </div>
  );
};

export default EnhancedIndex;