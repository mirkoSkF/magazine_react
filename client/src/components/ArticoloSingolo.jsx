import React, { useEffect, useState } from 'react';

const ArticoloSingolo = ({ id, onBack }) => {
  const [articolo, setArticolo] = useState(null);
  const [votoEffettuato, setVotoEffettuato] = useState(false);
  const [stats, setStats] = useState({});

  // Recuperiamo lo username dell'utente loggato per rendere il voto unico per account
  const currentUser = localStorage.getItem('username') || 'anonimo';
  const voteStorageKey = `voted_poll_${id}_user_${currentUser}`;

  useEffect(() => {
    if (id) {
      // 1. Caricamento dati articolo
      fetch(`http://localhost:8096/api/pagine/${id}`)
        .then(res => res.json())
        .then(data => {
          setArticolo(data);
          setStats(data.votiSondaggio || {});
          
          // Controlla se QUESTO utente specifico ha già votato questo sondaggio
          if (localStorage.getItem(voteStorageKey)) {
            setVotoEffettuato(true);
          }
        })
        .catch(err => console.error("Errore caricamento:", err));

      // 2. Tracking visualizzazione unica per sessione
      const viewStorageKey = `viewed_page_${id}`;
      if (!sessionStorage.getItem(viewStorageKey)) {
        fetch(`http://localhost:8096/api/pagine/${id}/view`, { method: 'PUT' })
          .then(res => { if (res.ok) sessionStorage.setItem(viewStorageKey, 'true'); });
      }
    }
  }, [id, voteStorageKey]);

  const handleVote = (opzione) => {
    fetch(`http://localhost:8096/api/pagine/${id}/vota`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scelta: opzione })
    })
    .then(res => res.json())
    .then(nuoviVoti => {
      setStats(nuoviVoti);
      setVotoEffettuato(true);
      // Salviamo il voto associandolo all'utente corrente
      localStorage.setItem(voteStorageKey, 'true');
    })
    .catch(err => console.error("Errore voto:", err));
  };

  const parsePollOptions = (htmlContent) => {
    const doc = new DOMParser().parseFromString(htmlContent, 'text/html');
    return Array.from(doc.querySelectorAll('li')).map(li => li.innerText);
  };

  if (!articolo) return <div style={{ textAlign: 'center', padding: '50px' }}>Caricamento...</div>;

  const totalVoti = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ padding: '20px', borderBottom: '1px solid #eee', maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#007bff', fontWeight: 'bold', cursor: 'pointer' }}>← Torna al Magazine</button>
      </nav>

      <article style={{ maxWidth: '900px', margin: '40px auto', padding: '0 40px' }}>
        {/* Intestazione Autore */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
          {articolo.autore?.fotoProfilo && <img src={`data:image/jpeg;base64,${articolo.autore.fotoProfilo}`} style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '15px' }} alt="Autore" />}
          <div>
            <h4 style={{ margin: 0 }}>{articolo.autore?.nome} {articolo.autore?.cognome}</h4>
            <span style={{ fontSize: '12px', color: '#666' }}>{new Date(articolo.dataPubblicazione).toLocaleDateString()}</span>
          </div>
        </div>

        <h1 style={{ fontSize: '36px', marginBottom: '30px' }}>{articolo.titolo}</h1>

        <div style={{ textAlign: 'justify' }}>
          {articolo.moduli?.map((m, i) => {
            if (articolo.tipo === "SONDAGGIO") {
              const opzioni = parsePollOptions(m.contenuto);
              return (
                <div key={i} style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #dee2e6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{votoEffettuato ? "Risultati del sondaggio:" : "Fai la tua scelta:"}</p>
                    {votoEffettuato && <span style={{ fontSize: '14px', color: '#666' }}>Totale voti: {totalVoti}</span>}
                  </div>
                  
                  {opzioni.map((opt, idx) => {
                    const nVoti = stats[opt] || 0;
                    const percent = totalVoti > 0 ? Math.round((nVoti / totalVoti) * 100) : 0;

                    return votoEffettuato ? (
                      <div key={idx} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                          <span>{opt}</span>
                          <span>{percent}% ({nVoti})</span>
                        </div>
                        <div style={{ height: '8px', background: '#eee', borderRadius: '4px' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: '#007bff', borderRadius: '4px', transition: 'width 0.5s' }}></div>
                        </div>
                      </div>
                    ) : (
                      <button key={idx} onClick={() => handleVote(opt)} style={pollButtonStyle}>{opt}</button>
                    );
                  })}
                </div>
              );
            }
            return <div key={i} style={{ fontSize: '18px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: m.contenuto }} />;
          })}
        </div>
      </article>
    </div>
  );
};

const pollButtonStyle = {
  display: 'block', width: '100%', padding: '12px', marginBottom: '10px',
  textAlign: 'left', backgroundColor: 'white', border: '1px solid #007bff',
  borderRadius: '6px', color: '#007bff', cursor: 'pointer', fontWeight: '500'
};

export default ArticoloSingolo;