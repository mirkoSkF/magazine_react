import React, { useEffect, useState, useMemo } from 'react';

const ArticoloSingolo = ({ id, onBack }) => {
  const [articolo, setArticolo] = useState(null);
  const [votoEffettuato, setVotoEffettuato] = useState(false);
  const [stats, setStats] = useState({});
  const [isVoting, setIsVoting] = useState(false);

  // --- STATI PER GLI SPONSOR ---
  const [sponsorSidebar, setSponsorSidebar] = useState(null);
  const [sponsorBottom, setSponsorBottom] = useState(null);

  const deviceId = useMemo(() => {
    const nav = window.navigator;
    const screen = window.screen;
    const str = `${nav.userAgent}${nav.language}${screen.colorDepth}${screen.width}${screen.height}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; 
    }
    return `dev_${Math.abs(hash)}`;
  }, []);

  const voteKey = useMemo(() => `poll_voted_${id}_${deviceId}`, [id, deviceId]);

  const handleSponsorClick = (sId, link) => {
    fetch(`http://localhost:8096/api/sponsors/${sId}/click`, { method: 'PATCH' })
      .catch(err => console.error("Errore click:", err));
    window.open(link, '_blank');
  };

  const forceHyphenation = (html) => {
    if (!html) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const processNode = (node) => {
      if (node.nodeType === 3) {
        let text = node.nodeValue.replace(/&nbsp;/g, ' ');
        node.nodeValue = text.replace(/([a-zA-ZàèéìòùÀÈÉÌÒÙ]{5,})/g, (word) => {
          if (word.length < 9) return word;
          return word.slice(0, 6) + '\u00AD' + word.slice(6);
        });
      } else if (node.nodeType === 1 && node.tagName !== 'IMG') {
        node.childNodes.forEach(child => processNode(child));
      }
    };
    processNode(doc.body);
    return doc.body.innerHTML;
  };

  // --- IL TUO EFFETTO AGGIORNATO ---
  useEffect(() => {
    if (id) {
      // 1. Incremento visite
      fetch(`http://localhost:8096/api/pagine/${id}/view`, { method: 'PUT' })
        .catch(err => console.error("Errore contatore visite:", err));

      const giaVotatoLocal = localStorage.getItem(voteKey) === 'true';
      if (giaVotatoLocal) setVotoEffettuato(true);

      // 2. Caricamento Articolo
      fetch(`http://localhost:8096/api/pagine/${id}?fingerprint=${deviceId}`)
        .then(res => res.json())
        .then(data => {
          setArticolo(data);
          setStats(data.votiSondaggio || {});
          if (data.giaVotato) {
            setVotoEffettuato(true);
            localStorage.setItem(voteKey, 'true');
          }
        })
        .catch(err => console.error("Errore caricamento:", err));

      // 3. CARICAMENTO SPONSOR SOLO PER "ARTICOLO"
      fetch("http://localhost:8096/api/sponsors/random?tipoPagina=ARTICOLO&posizione=SIDEBAR")
        .then(res => res.status === 200 ? res.json() : null)
        .then(data => setSponsorSidebar(data))
        .catch(() => setSponsorSidebar(null));

      fetch("http://localhost:8096/api/sponsors/random?tipoPagina=ARTICOLO&posizione=BOTTOM")
        .then(res => res.status === 200 ? res.json() : null)
        .then(data => setSponsorBottom(data))
        .catch(() => setSponsorBottom(null));
    }
  }, [id, voteKey, deviceId]);

  // ... (resto delle funzioni handleVote e parsePollOptions identiche)

  if (!articolo) return <div style={{ textAlign: 'center', padding: '50px' }}>Caricamento...</div>;

  const totalVoti = Object.values(stats).reduce((a, b) => a + b, 0);
  const autore = articolo.autore;

  return (
    <div lang="it" style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        .module-text { text-align: justify !important; text-justify: inter-word; hyphens: auto !important; -webkit-hyphens: auto !important; word-break: break-word; }
        .article-body img { max-width: 100% !important; height: auto !important; border-radius: 8px; margin: 20px auto !important; display: block !important; float: none !important; }
        @media (min-width: 1024px) {
          .article-body img[style*="float: left"], .article-body img[align="left"] { margin: 10px 25px 15px 0 !important; display: inline !important; float: left !important; max-width: 45% !important; }
          .article-body img[style*="float: right"], .article-body img[align="right"] { margin: 10px 0 15px 25px !important; display: inline !important; float: right !important; max-width: 45% !important; }
        }
      `}</style>

      {/* Navigazione */}
      <nav style={{ padding: '20px', borderBottom: '1px solid #eee', maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#007bff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
          ← Torna al Magazine
        </button>
      </nav>

      <article style={{ maxWidth: '900px', margin: '40px auto', padding: '0 40px' }}>
        {/* Intestazione Autore */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '30px' }}>
          {autore?.fotoProfilo ? (
            <img src={`data:image/jpeg;base64,${autore.fotoProfilo}`} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginRight: '20px' }} alt="Avatar" />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ccc', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
              {autore?.nome?.charAt(0)}{autore?.cognome?.charAt(0)}
            </div>
          )}
          <div>
            <h3 style={{ margin: 0 }}>{autore?.nome} {autore?.cognome}</h3>
            <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>
              Pubblicato il {new Date(articolo.dataPubblicazione).toLocaleDateString('it-IT')}
            </p>
          </div>
        </div>

        <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '30px', lineHeight: '1.2' }}>{articolo.titolo}</h1>

        <div className="article-body">
          {/* --- SPONSOR SIDEBAR (FLOAT LATERALE) --- */}
          {sponsorSidebar && (
            <div style={{ float: 'left', marginRight: '30px', marginBottom: '20px', maxWidth: '350px', textAlign: 'center' }}>
                <small style={{ display: 'block', fontSize: '10px', color: '#999', marginBottom: '5px' }}>SPONSOR</small>
                <img 
                  src={sponsorSidebar.bannerImage} 
                  alt={sponsorSidebar.nomeAzienda} 
                  onClick={() => handleSponsorClick(sponsorSidebar.id, sponsorSidebar.linkSito)}
                  style={{ width: '100%', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
                />
            </div>
          )}

          {/* Rendering dei moduli dell'articolo */}
          {articolo.moduli?.map((m, i) => (
             <div 
                key={i} 
                className="module-text"
                style={{ fontSize: '19px', lineHeight: '1.8', marginBottom: '25px', color: '#333' }} 
                dangerouslySetInnerHTML={{ __html: forceHyphenation(m.contenuto) }} 
             />
          ))}
          <div style={{ clear: 'both' }}></div>
        </div>

        {/* --- SPONSOR BOTTOM --- */}
        {sponsorBottom && (
          <div style={{ marginTop: '50px', borderTop: '2px solid #eee', paddingTop: '30px', textAlign: 'center' }}>
            <small style={{ display: 'block', fontSize: '10px', color: '#999', marginBottom: '10px' }}>PUBBLICITÀ</small>
            <img 
              src={sponsorBottom.bannerImage} 
              alt={sponsorBottom.nomeAzienda} 
              onClick={() => handleSponsorClick(sponsorBottom.id, sponsorBottom.linkSito)}
              style={{ maxWidth: '100%', borderRadius: '8px', cursor: 'pointer' }} 
            />
          </div>
        )}

        <div style={{ marginTop: '40px', paddingBottom: '60px' }}>
            <button onClick={onBack} style={{ background: '#333', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                ← Torna all'elenco
            </button>
        </div>
      </article>
    </div>
  );
};

export default ArticoloSingolo;