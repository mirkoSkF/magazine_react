import React, { useEffect, useState, useMemo } from 'react';

const ArticoloSingolo = ({ id, onBack }) => {
  const [articolo, setArticolo] = useState(null);
  const [votoEffettuato, setVotoEffettuato] = useState(false);
  const [stats, setStats] = useState({});
  const [isVoting, setIsVoting] = useState(false);
  const [copiato, setCopiato] = useState(false);

  // Stato sponsor
  const [sponsors, setSponsors] = useState([]);

  // STATO PER IL BOTTONE TORNA SU (AGGIUNTO)
  const [showScrollTop, setShowScrollTop] = useState(false);

  const token = localStorage.getItem('token');
  const ruolo = localStorage.getItem('ruolo');

  const isEditore =
    token &&
    ruolo &&
    ruolo.toUpperCase() === 'ROLE_EDITORE';

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

  const voteKey = useMemo(
            () => `poll_voted_${id}_${deviceId}`,
    [id, deviceId]
  );

  // CLICK BANNER
  const handleBannerClick = async (sponsorId) => {
    const clickedSponsors = JSON.parse(
      localStorage.getItem('clicked_sponsors') || '[]'
    );

    if (clickedSponsors.includes(sponsorId)) return;

    try {
      const res = await fetch(
        `https://magazine.skillfactory.it/api/sponsors/${sponsorId}/click`,
        {
          method: 'PATCH'
        }
      );

      if (res.ok) {
        clickedSponsors.push(sponsorId);

        localStorage.setItem(
          'clicked_sponsors',
          JSON.stringify(clickedSponsors)
        );
      }
    } catch (err) {
      console.error("Errore registrazione click:", err);
    }
  };

  // GESTIONE TESTO + IMMAGINI
  const forceHyphenation = (html) => {
    if (!html) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // MARGINI AUTOMATICI IMMAGINI
    doc.querySelectorAll('img').forEach(img => {
      const currentStyle = img.getAttribute('style') || '';

      // Classe responsive
      img.classList.add('article-image');

      img.setAttribute(
        'style',
        `
          ${currentStyle};
          max-width:100%;
          height:auto;
          border-radius:8px;
        `
      );

      const styleLower = currentStyle.toLowerCase();

      if (styleLower.includes('float: left')) {
        img.style.margin = '15px 30px 20px 0';
      }
      else if (styleLower.includes('float: right')) {
        img.style.margin = '15px 0 20px 30px';
      }
      else {
        img.style.display = 'block';
        img.style.margin = '30px auto';
      }
    });

    const processNode = (node) => {
      if (node.nodeType === 3) {
        let text = node.nodeValue.replace(/&nbsp;/g, ' ');

        node.nodeValue = text.replace(
          /([a-zA-ZàèéìòùÀÈÉÌÒÙ]{5,})/g,
          (word) => {
            if (word.length < 10) return word;

            return (
              word.slice(0, Math.floor(word.length / 2)) +
              '\u00AD' +
              word.slice(Math.floor(word.length / 2))
            );
          }
        );
      } else if (
        node.nodeType === 1 &&
        node.tagName !== 'IMG'
      ) {
        node.childNodes.forEach(child => processNode(child));
      }
    };

    processNode(doc.body);

    return doc.body.innerHTML;
  };

  // EFFECT PER IL MONITORAGGIO DELLO SCROLL (AGGIUNTO)
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScrollTop && window.pageYOffset > 400) {
        setShowScrollTop(true);
      } else if (showScrollTop && window.pageYOffset <= 400) {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScrollTop]);

  // FUNZIONE DI SCROLL AL TOP (AGGIUNTA)
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    if (id) {
      fetch(
        `https://magazine.skillfactory.it/api/pagine/${id}/view`,
        { method: 'PUT' }
      ).catch(err => console.error(err));

      const giaVotatoLocal =
        localStorage.getItem(voteKey) === 'true';

      if (giaVotatoLocal) {
        setVotoEffettuato(true);
      }

      fetch(
        `https://magazine.skillfactory.it/api/pagine/${id}?fingerprint=${deviceId}`
      )
        .then(res => res.json())
        .then(data => {
          setArticolo(data);
          setStats(data.votiSondaggio || {});

          if (data.giaVotato) {
            setVotoEffettuato(true);

            localStorage.setItem(voteKey, 'true');
          }
        })
        .catch(err =>
          console.error("Errore caricamento:", err)
        );

      fetch('https://magazine.skillfactory.it/api/sponsors')
        .then(res => res.json())
        .then(data => {
          const filtrati = data.filter(
            s =>
              s.attivo &&
              s.tipoPagina === 'ARTICOLO' &&
              s.posizione === 'BOTTOM'
          );

          setSponsors(filtrati);
        })
        .catch(err =>
          console.error("Errore sponsor:", err)
        );
    }
  }, [id, voteKey, deviceId]);

  const handleVote = (opzione) => {
    if (isEditore) return;
    if (votoEffettuato || isVoting) return;

    setIsVoting(true);

    fetch(
      `https://magazine.skillfactory.it/api/pagine/${id}/vota`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {})
        },
        body: JSON.stringify({
          scelta: opzione,
          fingerprint: deviceId
        })
      }
    )
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
      .catch(err =>
        console.error("Errore voto:", err)
      )
      .finally(() => setIsVoting(false));
  };

  const parsePollOptions = (htmlContent) => {
    const doc = new DOMParser()
      .parseFromString(htmlContent, 'text/html');

    const items = Array.from(
      doc.querySelectorAll('li')
    ).map(li => li.innerText.trim());

    return items.length > 0
      ? items
      : htmlContent
          .replace(/<[^>]*>/g, '')
          .split('\n')
          .filter(t => t.trim() !== '');
  };

  // FUNZIONE COPIA LINK
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentArticleUrl)
      .then(() => {
        setCopiato(true);
        setTimeout(() => setCopiato(false), 2000);
      })
      .catch(err => console.error("Errore durante la copia del link:", err));
  };

  if (!articolo) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Caricamento...
      </div>
    );
  }

  const totalVoti = Object
    .values(stats)
    .reduce((a, b) => a + b, 0);

  const autore = articolo.autore;
  const bottomBanners = sponsors.slice(0, 2);

  // Costruzione corretta degli URL per la condivisione
  const currentArticleUrl = `${window.location.origin}/?articolo=${id}`;
  const articleTitleEncoded = encodeURIComponent(articolo.titolo || '');
  const articleUrlEncoded = encodeURIComponent(currentArticleUrl);

  return (
    <div
      lang="it"
      style={{
        backgroundColor: '#fff',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <style>{`
        .module-text {
          text-align: justify !important;
          text-justify: inter-word !important;
          hyphens: auto !important;
          overflow-wrap: anywhere !important;
          word-break: normal !important;
          line-break: auto !important;
          letter-spacing: -0.1px;
          word-spacing: -1px;
        }

        .module-text p {
          margin-bottom: 20px;
        }

        .banner-container {
          width: 70%;
          transition: width 0.3s ease;
        }

        .banner-hover:hover {
          transform: scale(1.01);
          filter: brightness(1.05);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }

        /* Effetti hover e transizioni per i bottoni social */
        .social-btn {
          border-radius: 50%;
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          text-decoration: none;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
        }

        .social-btn:hover {
          transform: translateY(-3px) scale(1.05);
          filter: brightness(1.15);
          box-shadow: 0 6px 12px rgba(0,0,0,0.2);
        }

        .social-btn:active {
          transform: translateY(0) scale(1);
        }

        /* Bottoni del sondaggio */
        .poll-option-btn {
          display: block;
          width: 100%;
          padding: 16px;
          margin-bottom: 12px;
          background-color: #fff;
          border: 2px solid #007bff;
          color: #007bff;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .poll-option-btn:hover:not(:disabled) {
          background-color: #f0f7ff !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 123, 255, 0.1);
        }

        .poll-option-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        /* Bottone Torna Su con stili e transizioni (AGGIUNTO) */
        .back-to-top-btn {
          position: fixed;
          bottom: 40px;
          right: calc(50% - 600px + 20px); 
          z-index: 999;
          background-color: #007bff;
          color: white;
          border: none;
          padding: 12px 20px;
          font-weight: bold;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
        }

        .back-to-top-btn.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .back-to-top-btn:hover {
          background-color: #0056b3;
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0, 56, 179, 0.3);
        }

        .back-to-top-btn:active {
          transform: translateY(0);
        }

        /* DESKTOP MEDIO */
        @media (min-width: 769px) and (max-width: 1024px) {
          .article-image {
            float: none !important;
            display: block !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-top: 25px !important;
            margin-bottom: 25px !important;
            width: 60% !important;
            max-width: 60% !important;
            height: auto !important;
          }
          .banner-container {
            width: 85% !important;
          }
          .back-to-top-btn {
            right: 40px !important;
          }
        }

        /* TABLET + MOBILE */
        @media (max-width: 768px) {
          .article-container {
            flex-direction: column !important;
          }
          .sidebar-share {
            display: none !important;
          }
          article {
            padding: 0 15px !important;
            border-left: none !important;
          }
          .article-title {
            font-size: 28px !important;
          }
          .banner-container {
            width: 100% !important;
          }
          .article-image {
            float: none !important;
            clear: both !important;
            display: block !important;
            margin-left: auto !important;
            margin-right: auto !important;
            margin-top: 20px !important;
            margin-bottom: 20px !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
          }
          .module-text {
            text-align: justify !important;
            text-justify: inter-word !important;
            word-spacing: -0.7px !important;
            letter-spacing: -0.1px !important;
            hyphens: auto !important;
          }
          .back-to-top-btn {
            right: 20px !important;
            bottom: 20px !important;
            padding: 10px 16px !important;
            font-size: 13px !important;
          }
        }
      `}</style>

      {/* NAV */}
      <nav
        style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          &larr; Torna al Magazine
        </button>
      </nav>

      {/* CONTENITORE CON LAYOUT A DUE COLONNE */}
      <div
        className="article-container"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          gap: '40px',
          position: 'relative'
        }}
      >
        {/* BARRA LATERALE CONDIVISIONE */}
        <aside
          className="sidebar-share"
          style={{
            width: '50px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '40px',
            position: 'sticky',
            top: '100px',
            height: 'fit-content'
          }}
        >
          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${articleTitleEncoded}%20${articleUrlEncoded}`}
            target="_blank"
            role="noopener noreferrer"
            title="Condividi su WhatsApp"
            className="social-btn"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.734-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.528 1.981 14.062.953 11.453.953c-5.441 0-9.866 4.372-9.87 9.802-.001 1.777.475 3.51 1.378 5.042l-.95 3.472 3.593-.933zM17.3 14.38c-.32-.16-1.89-.93-2.185-1.04-.294-.11-.51-.16-.724.16-.214.32-.83 1.04-1.016 1.25-.187.21-.374.24-.694.08-.32-.16-1.353-.5-2.577-1.6-.952-.85-1.594-1.9-1.782-2.22-.187-.32-.02-.49.14-.65.144-.14.32-.37.48-.56.16-.19.21-.32.32-.54.11-.22.05-.41-.03-.57-.08-.16-.724-1.75-.992-2.4-.26-.63-.526-.55-.724-.56-.187-.01-.4-.01-.614-.01-.214 0-.56.08-.854.4-.294.32-1.123 1.1-1.123 2.68 0 1.58 1.15 3.11 1.31 3.32.16.22 2.26 3.45 5.476 4.84.765.33 1.363.53 1.83.68.77.24 1.472.21 2.025.13.617-.09 1.89-.77 2.156-1.48.266-.71.266-1.32.187-1.45-.08-.13-.294-.21-.614-.37z"/>
            </svg>
          </a>

          {/* Copia Link */}
          <button
            onClick={handleCopyLink}
            title="Copia link articolo"
            className="social-btn"
            style={{ 
              backgroundColor: copiato ? '#28a745' : '#6c757d', 
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease'
            }}
          >
            {copiato ? (
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            ) : (
              <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
              </svg>
            )}
          </button>
        </aside>

        {/* COLONNA CONTENUTO ARTICOLO */}
        <div style={{ flexGrow: 1, maxWidth: '900px' }}>
          <article style={{ margin: '40px 0', padding: '0 20px' }}>
            {/* AUTORE */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #dee2e6',
                marginBottom: '30px'
              }}
            >
              {autore?.fotoProfilo ? (
                <img
                  src={`data:image/jpeg;base64,${autore.fotoProfilo}`}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginRight: '20px'
                  }}
                  alt="Avatar"
                />
              ) : (
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#ccc',
                    marginRight: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  {autore?.nome?.charAt(0)}
                  {autore?.cognome?.charAt(0)}
                </div>
              )}

              <div>
                <h3 style={{ margin: 0 }}>
                  {autore?.nome} {autore?.cognome}
                </h3>
                <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>
                  Pubblicato il{' '}
                  {new Date(articolo.dataPubblicazione).toLocaleDateString('it-IT')}
                </p>
              </div>
            </div>

            <h1
              className="article-title"
              style={{
                fontSize: '42px',
                fontWeight: 'bold',
                marginBottom: '30px',
                lineHeight: '1.2'
              }}
            >
              {articolo.titolo}
            </h1>

            {/* AVVISO EDITORE */}
            {articolo.tipo === "SONDAGGIO" && isEditore && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'linear-gradient(to right, #fff9e6, #fff)',
                  borderLeft: '5px solid #ffc107',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '35px',
                  gap: '15px'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#856404" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span style={{ color: '#856404', fontWeight: '600', fontSize: '15px' }}>
                  Modalità Visualizzazione:{' '}
                  <span style={{ fontWeight: '400' }}>
                    Come Editore, puoi consultare i risultati ma non partecipare alla votazione.
                  </span>
                </span>
              </div>
            )}

            <div className="article-body">
              {articolo.moduli?.map((m, i) => {
                if (articolo.tipo === "SONDAGGIO") {
                  const opzioni = parsePollOptions(m.contenuto);

                  return (
                    <div
                      key={i}
                      style={{
                        background: '#f8f9fa',
                        padding: '30px',
                        borderRadius: '15px',
                        border: '2px solid #007bff',
                        marginBottom: '40px'
                      }}
                    >
                      <h3 style={{ marginBottom: '10px', color: '#333' }}>
                        {(votoEffettuato || isEditore)
                          ? "Risultati in tempo reale"
                          : "Esprimi la tua preferenza"}
                      </h3>

                      <p style={{ color: '#666', marginBottom: '25px', fontSize: '14px' }}>
                        Partecipanti totali: <b>{totalVoti}</b>
                      </p>

                      {opzioni.map((opt, idx) => {
                        const nVoti = stats[opt] || 0;
                        const percent = totalVoti > 0 ? Math.round((nVoti / totalVoti) * 100) : 0;

                        return (votoEffettuato || isEditore)
                          ? (
                            <div key={idx} style={{ marginBottom: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', gap: '15px' }}>
                                <span style={{ fontSize: '15px' }}>{opt}</span>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ color: '#666', fontSize: '13px', marginRight: '8px' }}>
                                    ({nVoti} {nVoti === 1 ? 'voto' : 'voti'})
                                  </span>
                                  <b style={{ color: '#007bff' }}>{percent}%</b>
                                </div>
                              </div>
                              <div style={{ height: '10px', background: '#e9ecef', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ width: `${percent}%`, height: '100%', background: '#007bff', transition: 'width 1s' }} />
                              </div>
                            </div>
                          )
                          : (
                            <button
                              key={idx}
                              onClick={() => handleVote(opt)}
                              disabled={isVoting}
                              className="poll-option-btn"
                            >
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
                    className="module-text"
                    style={{ fontSize: '18px', lineHeight: '1.7', marginBottom: '25px' }}
                    dangerouslySetInnerHTML={{ __html: forceHyphenation(m.contenuto) }}
                  />
                );
              })}
            </div>
          </article>

          {/* BANNER IN FONDO */}
          {bottomBanners.length > 0 && (
            <div
              style={{
                width: '100%',
                marginTop: '40px',
                marginBottom: '60px',
                borderTop: '1px solid #eee',
                paddingTop: '35px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                clear: 'both'
              }}
            >
              <p style={{ fontSize: '10px', color: '#999', textAlign: 'center', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Sponsor
              </p>

              {bottomBanners.map(s => (
                <a
                  key={s.id}
                  href={s.linkSito}
                  target="_blank"
                  role="noopener noreferrer"
                  onClick={() => handleBannerClick(s.id)}
                  className="banner-container"
                  style={{ display: 'block', marginBottom: '30px', textDecoration: 'none' }}
                >
                  <img
                    className="banner-hover"
                    src={s.bannerImage}
                    alt={s.nomeAzienda}
                    style={{ width: '100%', height: 'auto', borderRadius: '10px', border: '1px solid #eee', transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)' }}
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTONE TORNA SU (AGGIUNTO) */}
      <button
        onClick={scrollToTop}
        className={`back-to-top-btn ${showScrollTop ? 'visible' : ''}`}
        title="Torna all'inizio della pagina"
      >
        <span>Torna su</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default ArticoloSingolo;
