import React, { useEffect, useState, useMemo } from 'react';

const ArticoloSingolo = ({ id, onBack }) => {
  const [articolo, setArticolo] = useState(null);
  const [votoEffettuato, setVotoEffettuato] = useState(false);
  const [stats, setStats] = useState({});
  const [isVoting, setIsVoting] = useState(false);
  const [copiato, setCopiato] = useState(false);
  const [sponsors, setSponsors] = useState([]);

  const token = localStorage.getItem('token');
  const ruolo = localStorage.getItem('ruolo');

  const isEditore = token && ruolo && ruolo.toUpperCase() === 'ROLE_EDITORE';

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

  const handleBannerClick = async (sponsorId) => {
    const clickedSponsors = JSON.parse(localStorage.getItem('clicked_sponsors') || '[]');
    if (clickedSponsors.includes(sponsorId)) return;
    try {
      const res = await fetch(`https://magazine.skillfactory.it/api/sponsors/${sponsorId}/click`, { method: 'PATCH' });
      if (res.ok) {
        clickedSponsors.push(sponsorId);
        localStorage.setItem('clicked_sponsors', JSON.stringify(clickedSponsors));
      }
    } catch (err) { console.error("Errore registrazione click:", err); }
  };

  const forceHyphenation = (html) => {
    if (!html) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    doc.querySelectorAll('img').forEach(img => {
      const currentStyle = img.getAttribute('style') || '';
      img.classList.add('article-image');
      img.setAttribute('style', `${currentStyle}; max-width:100%; height:auto; border-radius:8px;`);
      const styleLower = currentStyle.toLowerCase();
      if (styleLower.includes('float: left')) img.style.margin = '15px 30px 20px 0';
      else if (styleLower.includes('float: right')) img.style.margin = '15px 0 20px 30px';
      else { img.style.display = 'block'; img.style.margin = '30px auto'; }
    });

    const processNode = (node) => {
      if (node.nodeType === 3) {
        let text = node.nodeValue.replace(/&nbsp;/g, ' ');
        node.nodeValue = text.replace(/([a-zA-ZàèéìòùÀÈÉÌÒÙ]{5,})/g, (word) => {
          if (word.length < 10) return word;
          return word.slice(0, Math.floor(word.length / 2)) + '\u00AD' + word.slice(Math.floor(word.length / 2));
        });
      } else if (node.nodeType === 1 && node.tagName !== 'IMG' && node.tagName !== 'SCRIPT') {
        node.childNodes.forEach(child => processNode(child));
      }
    };
    processNode(doc.body);
    return doc.body.innerHTML;
  };

  useEffect(() => {
    if (id) {
      fetch(`https://magazine.skillfactory.it/api/pagine/${id}/view`, { method: 'PUT' }).catch(err => console.error(err));
      const giaVotatoLocal = localStorage.getItem(voteKey) === 'true';
      if (giaVotatoLocal) setVotoEffettuato(true);

      fetch(`https://magazine.skillfactory.it/api/pagine/${id}?fingerprint=${deviceId}`)
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

      fetch('https://magazine.skillfactory.it/api/sponsors')
        .then(res => res.json())
        .then(data => {
          const filtrati = data.filter(s => s.attivo && s.tipoPagina === 'ARTICOLO' && s.posizione === 'BOTTOM');
          setSponsors(filtrati);
        })
        .catch(err => console.error("Errore sponsor:", err));
    }
  }, [id, voteKey, deviceId]);

  const handleVote = (opzione) => {
    if (isEditore || votoEffettuato || isVoting) return;
    setIsVoting(true);
    fetch(`https://magazine.skillfactory.it/api/pagine/${id}/vota`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ scelta: opzione, fingerprint: deviceId })
    })
    .then(async (res) => {
      if (res.status === 403) {
        setVotoEffettuato(true);
        localStorage.setItem(voteKey, 'true');
        return null;
      }
      return await res.json();
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentArticleUrl)
      .then(() => {
        setCopiato(true);
        setTimeout(() => setCopiato(false), 2000);
      })
      .catch(err => console.error("Errore durante la copia del link:", err));
  };

  if (!articolo) return <div style={{ textAlign: 'center', padding: '50px' }}>Caricamento...</div>;

  const totalVoti = Object.values(stats).reduce((a, b) => a + b, 0);
  const autore = articolo.autore;
  const bottomBanners = sponsors.slice(0, 2);
  const currentArticleUrl = `${window.location.origin}/?articolo=${id}`;

  return (
    <div lang="it" style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        .module-text { text-align: justify !important; text-justify: inter-word !important; hyphens: auto !important; overflow-wrap: anywhere !important; word-break: normal !important; line-break: auto !important; letter-spacing: -0.1px; word-spacing: -1px; }
        .module-text p { margin-bottom: 20px; }
        .banner-container { width: 70%; transition: width 0.3s ease; }
        .banner-hover:hover { transform: scale(1.01); filter: brightness(1.05); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
        .social-btn { border-radius: 50%; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; text-decoration: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease; border: none; cursor: pointer; }
        .social-btn:hover { transform: translateY(-3px) scale(1.05); filter: brightness(1.15); box-shadow: 0 6px 12px rgba(0,0,0,0.2); }
        .poll-option-btn { display: block; width: 100%; padding: 16px; margin-bottom: 12px; background-color: #fff; border: 2px solid #007bff; color: #007bff; border-radius: 10px; cursor: pointer; font-weight: bold; transition: all 0.2s ease; }
        .poll-option-btn:hover:not(:disabled) { background-color: #f0f7ff !important; transform: translateY(-1px); }
        .mobile-share { display: none !important; margin-top: 30px; justify-content: center; }
        @media (max-width: 768px) { .author-avatar-container { display: none !important; } .article-container { flex-direction: column !important; } .sidebar-share { display: none !important; } .mobile-share { display: flex !important; } article { padding: 0 15px !important; } }
      `}</style>

      <nav style={{ padding: '20px', borderBottom: '1px solid #eee', maxWidth: '1200px', margin: '0 auto' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#007bff', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>&larr; Torna al Magazine</button>
      </nav>

      <div className="article-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '40px', position: 'relative' }}>
        
        <aside className="sidebar-share" style={{ width: '50px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '40px', position: 'sticky', top: '100px', height: 'fit-content' }}>
          <button onClick={handleCopyLink} title="Copia link articolo" className="social-btn" style={{ backgroundColor: copiato ? '#28a745' : '#6c757d', color: 'white' }}>
            {copiato ? <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg> : <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>}
          </button>
        </aside>

        <div style={{ flexGrow: 1, maxWidth: '900px' }}>
          <article style={{ margin: '40px 0', padding: '0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '30px' }}>
              <div className="author-avatar-container" style={{ display: 'flex', alignItems: 'center' }}>
                {autore?.fotoProfilo ? <img src={`data:image/jpeg;base64,${autore.fotoProfilo}`} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginRight: '20px' }} alt="Avatar" /> : <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ccc', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>{autore?.nome?.charAt(0)}{autore?.cognome?.charAt(0)}</div>}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{autore?.nome} {autore?.cognome}</h3>
                <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>Pubblicato il {articolo.dataPubblicazione ? new Date(articolo.dataPubblicazione).toLocaleDateString('it-IT') : ''}</p>
              </div>
            </div>

            <h1 className="article-title" style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '30px', lineHeight: '1.2' }}>{articolo.titolo}</h1>

            <div className="article-body">
              {articolo.moduli?.map((m, i) => {
                if (articolo.tipo === "SONDAGGIO") {
                  const opzioni = parsePollOptions(m.contenuto);
                  return (
                    <div key={i} style={{ background: '#f8f9fa', padding: '30px', borderRadius: '15px', border: '2px solid #007bff', marginBottom: '40px' }}>
                      <h3 style={{ marginBottom: '10px', color: '#333' }}>{(votoEffettuato || isEditore) ? "Risultati in tempo reale" : "Esprimi la tua preferenza"}</h3>
                      <p style={{ color: '#666', marginBottom: '25px', fontSize: '14px' }}>Partecipanti totali: <b>{totalVoti}</b></p>
                      {opzioni.map((opt, idx) => {
                        const nVoti = stats[opt] || 0;
                        const percent = totalVoti > 0 ? Math.round((nVoti / totalVoti) * 100) : 0;
                        return (votoEffettuato || isEditore) ? (
                          <div key={idx} style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span>{opt}</span><b>{percent}%</b></div>
                            <div style={{ height: '10px', background: '#e9ecef', borderRadius: '5px', overflow: 'hidden' }}><div style={{ width: `${percent}%`, height: '100%', background: '#007bff' }} /></div>
                          </div>
                        ) : <button key={idx} onClick={() => handleVote(opt)} disabled={isVoting} className="poll-option-btn">{opt}</button>;
                      })}
                    </div>
                  );
                } else {
                  return <div key={i} className="module-text" style={{ fontSize: '18px', lineHeight: '1.7', marginBottom: '25px' }} dangerouslySetInnerHTML={{ __html: forceHyphenation(m.contenuto) }} />;
                }
              })}
            </div>
            
            <div className="mobile-share">
              <button onClick={handleCopyLink} className="social-btn" style={{ backgroundColor: copiato ? '#28a745' : '#6c757d', color: 'white' }}>
                {copiato ? <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg> : <svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" /></svg>}
              </button>
            </div>
          </article>

          {bottomBanners.length > 0 && (
            <div style={{ width: '100%', marginTop: '40px', marginBottom: '60px', borderTop: '1px solid #eee', paddingTop: '35px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontSize: '10px', color: '#999', marginBottom: '20px', textTransform: 'uppercase' }}>Sponsor</p>
              {bottomBanners.map(s => (
                <a key={s.id} href={s.linkSito} target="_blank" rel="noopener noreferrer" onClick={() => handleBannerClick(s.id)} className="banner-container" style={{ display: 'block', marginBottom: '30px' }}>
                  <img className="banner-hover" src={s.bannerImage} alt={s.nomeAzienda} style={{ width: '100%', height: 'auto', borderRadius: '10px' }} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticoloSingolo;
