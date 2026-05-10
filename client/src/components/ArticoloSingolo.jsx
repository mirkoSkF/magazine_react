import React, { useEffect, useState } from 'react';

const ArticoloSingolo = ({ id, onBack }) => {
  const [articolo, setArticolo] = useState(null);
  const [votoEffettuato, setVotoEffettuato] = useState(false);
  const [stats, setStats] = useState({});
  const [isVoting, setIsVoting] = useState(false);

  const voteStorageKey = `poll_voted_${id}`;

  useEffect(() => {
    if (id) {
      setVotoEffettuato(localStorage.getItem(voteStorageKey) === 'true');

      // 1. Caricamento dati
      fetch(`http://localhost:8096/api/pagine/${id}`)
        .then(res => res.json())
        .then(data => {
          setArticolo(data);
          setStats(data.votiSondaggio || {});
        })
        .catch(err => console.error("Errore caricamento:", err));

      // 2. REINTEGRO LOGICA CONTATORE (Silenzioso)
      const viewStorageKey = `viewed_page_${id}`;
      if (!sessionStorage.getItem(viewStorageKey)) {
        fetch(`http://localhost:8096/api/pagine/${id}/view`, { 
          method: 'PUT' 
        })
        .then(res => {
          if (res.ok) sessionStorage.setItem(viewStorageKey, 'true');
        })
        .catch(err => console.error("Errore contatore visite:", err));
      }
    }
  }, [id, voteStorageKey]);

  const handleVote = (opzione) => {
    if (votoEffettuato || isVoting) return;
    setIsVoting(true);
    fetch(`http://localhost:8096/api/pagine/${id}/vota`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scelta: opzione })
    })
    .then(res => {
      if (!res.ok) throw new Error("Errore server");
      return res.json();
    })
    .then(nuoviVoti => {
      setStats(nuoviVoti);
      localStorage.setItem(voteStorageKey, 'true');
      setVotoEffettuato(true);
    })
    .catch(err => alert("Errore durante l'invio del voto."))
    .finally(() => setIsVoting(false));
  };

  const parsePollOptions = (htmlContent) => {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const items = Array.from(doc.querySelectorAll('li')).map(li => li.innerText.trim());
    return items.length > 0 ? items : htmlContent.replace(/<[^>]*>/g, '').split('\n').filter(t => t.trim() !== '');
  };

  if (!articolo) return <div style={{ textAlign: 'center', padding: '50px' }}>Caricamento...</div>;

  const totalVoti = Object.values(stats).reduce((a, b) => a + b, 0);
  const autore = articolo.autore;

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <nav style={{ padding: '20px', borderBottom: '1px solid #eee', maxWidth: '900px', margin: '0 auto' }}>
        <button 
          onClick={onBack} 
          style={{ background: 'none', border: 'none', color: '#007bff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
        >
          ← Torna al Magazine
        </button>
      </nav>

      <article style={{ maxWidth: '900px', margin: '40px auto', padding: '0 40px' }}>
        
        {/* SEZIONE AUTORE */}
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

        <h1 style={{ fontSize: '42px', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '30px', color: '#1a1a1a' }}>
          {articolo.titolo}
        </h1>

        <div style={{ textAlign: 'justify' }}>
          {articolo.moduli?.map((m, i) => {
            if (articolo.tipo === "SONDAGGIO") {
              const opzioni = parsePollOptions(m.contenuto);
              return (
                <div key={i} style={{ background: '#f8f9fa', padding: '30px', borderRadius: '15px', border: '2px solid #007bff', marginTop: '20px', textAlign: 'left' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '25px', color: '#333' }}>
                    {votoEffettuato ? "Risultati attuali" : "Cosa ne pensi?"}
                  </h3>
                  {opzioni.map((opt, idx) => {
                    const nVoti = stats[opt] || 0;
                    const percent = totalVoti > 0 ? Math.round((nVoti / totalVoti) * 100) : 0;
                    return votoEffettuato ? (
                      <div key={idx} style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '500' }}>{opt}</span>
                          <span style={{ fontWeight: 'bold', color: '#007bff' }}>{percent}%</span>
                        </div>
                        <div style={{ height: '12px', background: '#e9ecef', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: '#007bff', transition: 'width 1s ease-in-out', borderRadius: '6px' }} />
                        </div>
                      </div>
                    ) : (
                      <button key={idx} onClick={() => handleVote(opt)} disabled={isVoting} style={pollButtonStyle}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              );
            }
            return (
              <div 
                key={i} 
                style={{ fontSize: '19px', lineHeight: '1.8', color: '#333', marginBottom: '20px' }} 
                dangerouslySetInnerHTML={{ __html: m.contenuto }} 
              />
            );
          })}
        </div>
      </article>
    </div>
  );
};

const pollButtonStyle = {
  display: 'block', width: '100%', padding: '16px', marginBottom: '12px',
  backgroundColor: '#fff', border: '2px solid #007bff', color: '#007bff',
  borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
  textAlign: 'center'
};

export default ArticoloSingolo;