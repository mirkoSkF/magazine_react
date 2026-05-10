import React, { useEffect, useState, useMemo } from 'react';

const ArticoloSingolo = ({ id, onBack }) => {
  const [articolo, setArticolo] = useState(null);
  const [votoEffettuato, setVotoEffettuato] = useState(false);
  const [stats, setStats] = useState({});
  const [isVoting, setIsVoting] = useState(false);

  // 1. Generiamo il Fingerprint (Indipendente dall'articolo)
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

  // 2. Definiamo la chiave del voto (Dipende da id e deviceId, che sono già disponibili)
  const voteKey = useMemo(() => `poll_voted_${id}_${deviceId}`, [id, deviceId]);

  // 3. Funzione di Sillabazione Avanzata (per eliminare gli spazi bianchi enormi)
  const forceHyphenation = (html) => {
    if (!html) return "";
    // Trasforma spazi bloccanti in spazi normali e inserisce soft-hyphen in parole lunghe
    let processed = html.replace(/&nbsp;/g, ' ');
    return processed.replace(/([a-zA-ZàèéìòùÀÈÉÌÒÙ]{5,})/g, (word) => {
      if (word.length < 9) return word;
      // Inserisce il trattino invisibile dopo la 5a o 6a lettera
      return word.slice(0, 6) + '&shy;' + word.slice(6);
    });
  };

  // Caricamento Dati
  useEffect(() => {
    if (id) {
      // Incremento visualizzazioni
      fetch(`http://localhost:8096/api/pagine/${id}/view`, { method: 'PUT' })
        .catch(err => console.error("Errore contatore visite:", err));

      // Controllo voto locale
      const giaVotatoLocal = localStorage.getItem(voteKey) === 'true';
      if (giaVotatoLocal) setVotoEffettuato(true);

      // Fetch articolo
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
    }
  }, [id, voteKey, deviceId]);

  const handleVote = (opzione) => {
    if (votoEffettuato || isVoting) return;
    setIsVoting(true);
    fetch(`http://localhost:8096/api/pagine/${id}/vota`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scelta: opzione, fingerprint: deviceId })
    })
    .then(async (res) => {
      if (res.status === 403) {
        setVotoEffettuato(true);
        localStorage.setItem(voteKey, 'true');
        return null;
      }
      return res.json();
    })
    .then(nuoviVoti => {
      if (nuoviVoti) {
        localStorage.setItem(voteKey, 'true'); 
        setStats(nuoviVoti);
        setVotoEffettuato(true);
      }
    })
    .catch(err => console.error("Errore voto:", err))
    .finally(() => setIsVoting(false));
  };

  const parsePollOptions = (htmlContent) => {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    const items = Array.from(doc.querySelectorAll('li')).map(li => li.innerText.trim());
    return items.length > 0 ? items : htmlContent.replace(/<[^>]*>/g, '').split('\n').filter(t => t.trim() !== '');
  };

  // Guard Clause: Se articolo non è ancora caricato, non renderizziamo il corpo
  if (!articolo) return <div style={{ textAlign: 'center', padding: '50px' }}>Caricamento...</div>;

  const totalVoti = Object.values(stats).reduce((a, b) => a + b, 0);
  const autore = articolo.autore;

  return (
    <div lang="it" style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ padding: '20px', borderBottom: '1px solid #eee', maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#007bff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
          ← Torna al Magazine
        </button>
      </nav>

      <article style={{ maxWidth: '900px', margin: '40px auto', padding: '0 40px' }}>
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

        <h1 style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '30px', lineHeight: '1.2', hyphens: 'auto' }}>{articolo.titolo}</h1>

        <div className="article-body">
          {articolo.moduli?.map((m, i) => {
            if (articolo.tipo === "SONDAGGIO") {
              const opzioni = parsePollOptions(m.contenuto);
              return (
                <div key={i} style={{ background: '#f8f9fa', padding: '30px', borderRadius: '15px', border: '2px solid #007bff', marginBottom: '40px' }}>
                  <h3 style={{ marginBottom: '25px', color: '#333' }}>{votoEffettuato ? "Risultati del sondaggio" : "Cosa ne pensi?"}</h3>
                  {opzioni.map((opt, idx) => {
                    const nVoti = stats[opt] || 0;
                    const percent = totalVoti > 0 ? Math.round((nVoti / totalVoti) * 100) : 0;
                    return votoEffettuato ? (
                      <div key={idx} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '16px', fontWeight: '500' }}>{opt}</span> 
                          <b>{percent}%</b>
                        </div>
                        <div style={{ height: '12px', background: '#e9ecef', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: '#007bff', transition: 'width 1s ease-out' }} />
                        </div>
                      </div>
                    ) : (
                      <button key={idx} onClick={() => handleVote(opt)} disabled={isVoting} style={{ display: 'block', width: '100%', padding: '16px', marginBottom: '10px', backgroundColor: '#fff', border: '2px solid #007bff', color: '#007bff', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>
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
                style={{ 
                  fontSize: '19px', 
                  lineHeight: '1.8', 
                  marginBottom: '25px', 
                  textAlign: 'justify', 
                  color: '#333',
                  hyphens: 'auto',
                  WebkitHyphens: 'auto',
                  textJustify: 'distribute', // Migliore per evitare buchi bianchi
                  wordBreak: 'normal',
                  overflowWrap: 'break-word',
                  letterSpacing: '-0.01em' // Aiuta a compattare le righe difficili
                }} 
                dangerouslySetInnerHTML={{ __html: forceHyphenation(m.contenuto) }} 
              />
            );
          })}
        </div>
      </article>
    </div>
  );
};

export default ArticoloSingolo;
