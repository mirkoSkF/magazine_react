import React, { useState, useEffect } from 'react';
import MagazineEditor from './components/MagazineEditor';
import DashboardEditore from './components/DashboardEditore';
import IndexPubblicazioni from './components/IndexPubblicazioni';
import ArticoloSingolo from './components/ArticoloSingolo';
import Login from './components/Login';
import FormIntervista from './components/FormIntervista';
import DashboardInterviste from './components/DashboardInterviste';
import DettaglioIntervista from './components/DettaglioIntervista';
import PaginaEventi from './components/PaginaEventi';

// --- CONFIGURAZIONE GOOGLE ANALYTICS ---
const GA_TRACKING_ID = 'G-QTHTD72WRZ'; 

// Funzione helper per caricare Google Analytics dinamicamente in modalità Consent Mode v2
const caricaGoogleAnalytics = (consensoDato = false) => {
  if (!GA_TRACKING_ID) return;

  const statoConsenso = consensoDato ? 'granted' : 'denied';

  // Se lo script non è ancora stato caricato nel DOM
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    function gtag(){ window.dataLayer.push(arguments); }
    window.gtag = gtag;

    // 1. STATO DI DEFAULT GDPR (Consent Mode v2): Blocca lo storage analitico/advertising finché non c'è consenso
    gtag('consent', 'default', {
      'analytics_storage': statoConsenso,
      'ad_storage': statoConsenso,
      'ad_user_data': statoConsenso,
      'ad_personalization': statoConsenso
    });

    // Iniezione dello script di Google Tag Manager / GA4
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.async = true;
    document.head.appendChild(script);

    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID);

    console.log("Google Analytics caricato con stato consenso:", statoConsenso);
  } else {
    // Se lo script è già presente, aggiorna lo stato del consenso (Consent Mode v2)
    window.gtag('consent', 'update', {
      'analytics_storage': statoConsenso,
      'ad_storage': statoConsenso,
      'ad_user_data': statoConsenso,
      'ad_personalization': statoConsenso
    });
    console.log("Stato consenso Google Analytics aggiornato a:", statoConsenso);
  }
};

// --- COMPONENTE COOKIE BANNER ---
const CookieBanner = ({ onOpenPrivacy, showBanner, setShowBanner }) => {
  if (!showBanner) return null;

  const handleAccept = () => {
    localStorage.setItem('consenso_cookie', 'accettati');
    setShowBanner(false);
    caricaGoogleAnalytics(true); // Attiva il tracciamento GA al click su "Accetta"
  };

  const handleReject = () => {
    localStorage.setItem('consenso_cookie', 'rifiutati');
    setShowBanner(false);
    caricaGoogleAnalytics(false); // Mantiene GA bloccato o limita il tracciamento
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#212529',
      color: '#ffffff',
      padding: '20px 30px',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.25)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      borderTop: '3px solid #007bff'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: '1.5', color: '#e0e0e0' }}>
          Questo sito utilizza cookie tecnici necessari al suo funzionamento e, previo tuo consenso, cookie di analisi/tracciamento per migliorare l'esperienza di navigazione.
          Puoi liberamente prestare, rifiutare o revocare il tuo consenso in qualsiasi momento. Per ulteriori dettagli consulta la nostra{' '}
          <span
            onClick={onOpenPrivacy}
            style={{ color: '#4da6ff', textDecoration: 'underline', cursor: 'pointer' }}
          >
            Privacy Policy
          </span>.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={handleReject}
            style={{
              padding: '8px 18px',
              backgroundColor: 'transparent',
              border: '1px solid #ffffff',
              color: '#ffffff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Rifiuta tutti
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: '8px 18px',
              backgroundColor: '#007bff',
              border: 'none',
              color: '#ffffff',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Accetta tutti
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRIVACY INTEGRATO CON TESTO INTEGRALE ---
const PrivacyContent = ({ onBack }) => (
  <div style={{
    padding: '40px 20px',
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'left',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    lineHeight: '1.6',
    color: '#333',
    maxHeight: '80vh',
    overflowY: 'auto'
  }}>
    <button
      onClick={onBack}
      style={{
        cursor: 'pointer', marginBottom: '30px', padding: '10px 20px',
        backgroundColor: '#007bff', color: 'white', border: 'none',
        borderRadius: '4px', fontWeight: 'bold'
      }}
    >
      &larr; Torna al Magazine
    </button>

    <h1 style={{ fontSize: '22px', borderBottom: '2px solid #007bff', paddingBottom: '10px', color: '#333' }}>
      INFORMATIVA SUL TRATTAMENTO DEI DATI PERSONALI DI COLORO CHE CONSULTANO IL SITO INTERNET
    </h1>

    <p>Gentile Utente, ai sensi dell’art. 13 del regolamento (UE) n.2016/679 del Parlamento Europeo e del Consiglio del 27/04/2016, di seguito GDPR, la Società SKILL FACTORY S.R.L., La informa di quanto segue:</p>

    <h3 style={{ fontSize: '18px', marginTop: '20px' }}>A) Finalità del trattamento dei dati e base giuridica</h3>
    <p>I Suoi dati personali sono trattati dalla SKILL FACTORY S.R.L. in qualità di Titolare del trattamento per le seguenti Finalità di Servizio:</p>
    <p><strong>A1)</strong> Acquisizione, trattamento e conservazione anche digitale di dati personali ai fini della navigazione sul sito www.skillfactory.it onde garantire la sicurezza del Sito e delle informazioni sullo stesso scambiate. Il sito si avvale inoltre del servizio di analisi statistica Google Analytics (fornito da Google Ireland Limited) per raccogliere dati aggregati sul traffico e sull'utilizzo delle pagine, attivato esclusivamente previo esplicito consenso dell'utente;</p>
    <p><strong>A2)</strong> Acquisizione, trattamento e conservazione anche digitale di dati personali degli interessati (quali dati anagrafici, numero di telefono ed indirizzo e-mail) per consentire l’erogazione dei servizi da lei richiesti...</p>
    <p><strong>A3)</strong> Acquisizione, trattamento e conservazione anche digitale di dati personali degli utenti, quali dati anagrafici, codice fiscale, cv per l’esecuzione di un contratto di cui l’interessato è parte o all’esecuzione di misure precontrattuali dettate su richiesta dello stesso, per l’iscrizione e partecipazione a corsi di formazione di potenziali risorse con inserimento sulla piattaforma Skillbook nella sezione utenti e conseguente inserimento lavorativo;</p>
    <p><strong>A4)</strong> Acquisizione, trattamento e conservazione anche digitale di dati personali dei discenti, quali dati anagrafici, numero di telefono ed indirizzo e-mail per consentire l’erogazione del servizio di newsletter, attivabile con la sua espressa indicazione al momento della compilazione del relativo form;</p>
    <p><strong>A5)</strong> Acquisizione, trattamento e conservazione anche digitale di dati personali per attività di mail marketing, social media marketing, digital marketing, servizi, news, blogging, attività promozionali ed eventi;</p>
    <p><strong>A6)</strong> I dati degli utenti sono gestiti dalla piattaforma Skillbook cui si accede automaticamente dopo la registrazione sul sito www.skillfactory.it, e possono essere ceduti a terzi e ad aziende per facilitare l’inserimento lavorativo;</p>
    <p><strong>A7)</strong> Adempiere agli obblighi previsti dalla legge, da un regolamento, dalla normativa comunitaria o da un ordine dell’Autorità...</p>
    <p><strong>A8)</strong> Esercitare i diritti del Titolare, ad esempio il diritto di difesa in giudizio (es. art. 24 Cost.);</p>
    <p>Le informazioni che seguono riguardano esclusivamente il predetto Sito. Non riguardano canali diversi dal Sito e, nella specie, non riguardano altri siti internet, pagine e/o servizi raggiungibili tramite link ipertestuali pubblicati in questo Sito.</p>

    <h3 style={{ fontSize: '18px', marginTop: '20px' }}>B) Natura del conferimento dei dati</h3>
    <p>I Suoi dati personali oggetto del trattamento sono raccolti direttamente dal soggetto interessato. La base giuridica per il trattamento dei dati tecnici di navigazione di cui al punto A1) è il legittimo interesse del Titolare ai sensi dell’art. 6, comma 1 lett. f del Regolamento. L'attivazione dei cookie analitici di Google Analytics per le finalità di analisi del traffico di cui al punto A1) richiede invece il Suo consenso espresso ai sensi dell'art. 6, par. 1, lett. a del Regolamento, prestabile e revocabile in qualsiasi momento tramite il banner cookie o la voce "Gestisci Cookie". La base giuridica per il trattamento dei dati per le finalità di cui ai punti A2), A3) e A4) è l’art. 6 comma 1 lett. b del Regolamento...</p>
    <p>La base giuridica per il trattamento dei dati per le finalità di cui al punto A5) e A6) è l’art.6. par.1 lett. a del Regolamento, in quanto i suoi dati potranno essere trattati lecitamente solo previo suo consenso, specifico, separato, espresso, documentato, preventivo e del tutto facoltativo...</p>
    <p>La base giuridica per il trattamento dei dati per le finalità di cui ai punti A7) e A8) è l’ adempimento di un obbligo legale ai sensi dell’art. 6, comma 1 lett. c del Regolamento.</p>

    <h3 style={{ fontSize: '18px', marginTop: '20px' }}>C) Modalità di trattamento dei dati</h3>
    <p>Il trattamento dei suoi Dati Personali è realizzato per mezzo delle operazioni indicate all’art. 4 punto 2 del GDPR e precisely: raccolta, registrazione, organizzazione, conservazione, consultazione, elaborazione, estrazione, utilizzo, cancellazione e distruzione dei dati...</p>

    <h3 style={{ fontSize: '18px', marginTop: '20px' }}>E) Periodo di conservazione</h3>
    <p>In ogni caso, si prevede la conservazione dei dati per un periodo massimo di:</p>
    <ul>
      <li>Dati relativi alla formazione = 2 anni</li>
      <li>CV su Skillbook = 2 anni</li>
      <li>Newsletter = 2 anni</li>
      <li>Marketing e Cookie analitici = 2 anni</li>
    </ul>

    <h3 style={{ fontSize: '18px', marginTop: '20px' }}>G) Titolare del trattamento e responsabile della protezione dei dati personali</h3>
    <p>
      <strong>Il Titolare del Trattamento</strong> è SKILL FACTORY S.R.L., con sede legale in Via Sedivola n. 30 - 80059 - Torre del Greco (Na) e sede operativa in Centro Direzionale di Napoli is. E2 scala A – 80143 Napoli (Na).<br />
      <strong>DPO:</strong> Silvio Tortora Maione, email: silvio@itadvice.it
    </p>
  </div>
);

const colors = {
  primary: '#007bff',
  dark: '#343a40',
  lightGray: '#f8f9fa',
  border: '#dee2e6',
  white: '#ffffff'
};

function App() {
  const [view, setView] = useState('index');
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [showCookieBanner, setShowCookieBanner] = useState(false);

  useEffect(() => {
    // CAMBIO TITOLO SCHEDA BROWSER
    document.title = "Magazine SkillFactory";

    // CONTROLLO STATO CONSENSO COOKIE E CARICAMENTO GOOGLE ANALYTICS
    const consenso = localStorage.getItem('consenso_cookie');
    if (!consenso) {
      setShowCookieBanner(true);
      // Carica lo script di GA in stato bloccato (denied) in attesa della decisione dell'utente
      caricaGoogleAnalytics(false);
    } else if (consenso === 'accettati') {
      caricaGoogleAnalytics(true);
    } else {
      caricaGoogleAnalytics(false);
    }

    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);

    // INTERCETTAZIONE LINK DI CONDIVISIONE ALL'AVVIO
    const params = new URLSearchParams(window.location.search);
    const articoloId = params.get('articolo');
    const vistaParam = params.get('vista');

    if (articoloId) {
      setSelectedArticleId(articoloId);
      setView('articolo');
    } else if (vistaParam === 'prenotazione') {
      setView('intervista');
    }

    // GESTIONE DEL TASTO INDIETRO DEL BROWSER
    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentArticoloId = currentParams.get('articolo');
      const currentVista = currentParams.get('vista');

      if (currentArticoloId) {
        setSelectedArticleId(currentArticoloId);
        setView('articolo');
      } else if (currentVista === 'prenotazione') {
        setView('intervista');
      } else {
        setSelectedArticleId(null);
        setView('index');
      }
    };

    window.addEventListener('popstate', handlePopState);
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      // utenti loggati: navbar sempre visibile
      if (isLoggedIn) {
        setShowNavbar(true);
        return;
      }

      if (window.scrollY > lastScrollY && window.scrollY > 150) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLoggedIn]);

  const getDisplayName = () => {
    const rawName = localStorage.getItem('username') || 'Utente';
    const firstName = rawName.split('.')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setView('index');
    window.history.pushState({}, '', window.location.origin + window.location.pathname);
  };

  const handleReadArticle = (id) => {
    setSelectedArticleId(id);
    setView('articolo');
    // Sincronizza l'URL in modo che rifletta l'ID dell'articolo letto
    window.history.pushState({}, '', `?articolo=${id}`);
    window.scrollTo(0, 0);

    // Invia l'evento page_view a Google Analytics solo se l'utente ha accettato i cookie
    if (window.gtag && localStorage.getItem('consenso_cookie') === 'accettati') {
      window.gtag('event', 'page_view', {
        page_path: `/?articolo=${id}`,
        page_title: `Articolo ${id}`
      });
    }
  };

  const handleEdit = (id) => {
    setEditId(id);
    setView('editor');
  };

  const handleNewArticle = () => {
    setEditId(null);
    setView('editor');
  };

  const navigateTo = (newView) => {
    setView(newView);
    setIsMobileMenuOpen(false);

    if (newView === 'index') {
      setSelectedArticleId(null);
      window.history.pushState({}, '', window.location.origin + window.location.pathname);
    } else if (newView === 'intervista') {
      window.history.pushState({}, '', '?vista=prenotazione');
    } else {
      window.history.pushState({}, '', window.location.origin + window.location.pathname);
    }

    window.scrollTo(0, 0);
  };

  const navBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 30px',
    background: colors.white,
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    position: 'fixed',
    top: showNavbar ? 0 : '-90px',
    zIndex: 1000,
    height: '80px',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'top 0.3s ease'
  };

  return (
    <div style={{
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      background: colors.lightGray, minHeight: '100vh', display: 'flex',
      flexDirection: 'column', overflowX: 'hidden'
    }}>
      <style>{`
        .nav-link {
          background: none; border: none; color: ${colors.dark};
          font-weight: 500; font-size: 15px; cursor: pointer;
          padding: 8px 0; position: relative; transition: all 0.3s ease;
          white-space: nowrap; text-decoration: none; display: flex;
          align-items: center; justify-content: center;
        }
        .nav-link:hover { color: ${colors.primary}; }
        .nav-link::after {
          content: ''; position: absolute; width: 0; height: 2px;
          bottom: 0; left: 0; background-color: ${colors.primary};
          transition: width 0.3s ease;
        }
        .nav-link:hover::after, .active-link::after { width: 100%; }
        .active-link { color: ${colors.primary} !important; font-weight: 700; }
        .logout-link { color: #dc3545 !important; }
        .mobile-menu-toggle {
          display: none; background: none; border: none; color: ${colors.primary};
          font-size: 32px; cursor: pointer; line-height: 1;
        }
        @media (max-width: 1024px) {
          .nav-bar { padding: 10px 20px !important; height: 70px !important; }
          .mobile-menu-toggle { display: block; }
          .nav-links {
            display: ${isMobileMenuOpen ? 'flex' : 'none'} !important;
            position: absolute; top: 100%; left: 0; width: 100%;
            flex-direction: column; background: ${colors.white};
            padding: 20px 0; box-shadow: 0 15px 25px rgba(0,0,0,0.08);
            gap: 5px !important; z-index: 999;
          }
          .nav-link { width: 100%; padding: 15px 0; font-size: 17px; }
        }
        @media (min-width: 1025px) {
          .nav-links {
            display: flex !important; position: static !important;
            flex-direction: row !important; width: auto !important;
            background: transparent !important; box-shadow: none !important;
            padding: 0 !important; gap: 30px !important;
          }
        }
      `}</style>

      <nav className="nav-bar" style={navBarStyle}>
        <div
          style={{ fontWeight: '800', fontSize: '24px', letterSpacing: '-0.5px', color: 'orange', cursor: 'pointer' }}
          onClick={() => navigateTo('index')}
        >
          <div
            onClick={() => setView('home')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              maxWidth: '240px'
            }}
          >
            <div
              onClick={() => setView('home')}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                maxWidth: '240px'
              }}
            >
              <img
                src="/Logo_brand.png"
                alt="Logo Skill Factory"
                style={{
                  height: '45px',
                  width: 'auto',
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>

        <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className="nav-links">
          {isLoggedIn && (
            <button className={`nav-link ${view === 'index' ? 'active-link' : ''}`} onClick={() => navigateTo('index')}>
              Anteprima Magazine
            </button>
          )}

          {!isLoggedIn ? (
            <button className={`nav-link ${view === 'login' ? 'active-link' : ''}`} onClick={() => navigateTo('login')}>
              Area Riservata
            </button>
          ) : (
            <>
              <button className={`nav-link ${view === 'dashboard' ? 'active-link' : ''}`} onClick={() => navigateTo('dashboard')}>
                Dashboard
              </button>

              <button className={`nav-link ${view === 'editor' ? 'active-link' : ''}`} onClick={() => handleNewArticle()}>
                + Nuovo Articolo
              </button>
              <button className="nav-link logout-link" onClick={handleLogout}>
                Esci ({getDisplayName()})
              </button>
            </>
          )}
        </div>
      </nav>

      <main style={mainContainerStyle}>
        {view === 'index' && (
          <IndexPubblicazioni
            onReadArticle={handleReadArticle}
            onPrivacyClick={() => setView('privacy')}
          />
        )}

        {view === 'eventi' && (
          <PaginaEventi
            onReadEvent={handleReadArticle}
            onBackToHome={() => navigateTo('index')}
          />
        )}

        {view === 'articolo' && (
          <ArticoloSingolo
            id={selectedArticleId}
            onBack={() => {
              setView('index');
              setSelectedArticleId(null);
              window.history.pushState({}, '', window.location.origin + window.location.pathname);
            }}
          />
        )}

        {view === 'intervista' && <FormIntervista onPrivacyClick={() => setView('privacy')} />}

        {view === 'privacy' && <PrivacyContent onBack={() => navigateTo('index')} />}

        {view === 'login' && !isLoggedIn && <Login onLoginSuccess={handleLoginSuccess} colors={colors} />}

        {isLoggedIn && (
          <>
            {view === 'dashboard' && <DashboardEditore onEdit={handleEdit} />}
            {view === 'admin-interviste' && (
              <DashboardInterviste
                onSwitchView={navigateTo}
                onSelectIntervista={(id) => { setSelectedArticleId(id); setView('dettaglio-intervista'); }}
              />
            )}
            {view === 'dettaglio-intervista' && <DettaglioIntervista id={selectedArticleId} onBack={() => setView('admin-interviste')} />}
            {view === 'editor' && (
              <MagazineEditor
                editId={editId}
                onBack={() => setView('dashboard')}
              />
            )}
          </>
        )}
      </main>

      {/* BANNER COOKIE */}
      <CookieBanner
        showBanner={showCookieBanner}
        setShowBanner={setShowCookieBanner}
        onOpenPrivacy={() => navigateTo('privacy')}
      />

      <footer style={footerStyle}>
        <div
          style={{
            marginBottom: "15px",
            fontSize: "15px",
            fontWeight: "500",
          }}
        >
          <strong>Contatti</strong>
          <br />
          <a
            href="mailto:redazione@skillfactory.it"
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            ✉️ redazione@skillfactory.it
          </a>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: "15px",
            fontSize: "14px",
          }}
        >
          &copy; Copyright - Skill Factory 2026 |
          <span
            onClick={() => setView("privacy")}
            style={{
              cursor: "pointer",
              marginLeft: "10px",
              textDecoration: "underline",
            }}
          >
            Privacy Policy
          </span>
           &nbsp;|
          <span
            onClick={() => setShowCookieBanner(true)}
            style={{
              cursor: "pointer",
              marginLeft: "10px",
              textDecoration: "underline",
            }}
          >
            Gestisci Cookie
          </span>
        </div>
      </footer>
    </div>
  );
}

const mainContainerStyle = {
  paddingTop: '55px',
  paddingBottom: '60px',
  flex: '1',
  width: '100%',
  maxWidth: '100%',
  margin: '0',
  boxSizing: 'border-box',
  paddingLeft: '30px',
  paddingRight: '30px'
};

const footerStyle = {
  background: colors.dark, color: colors.white, textAlign: 'center',
  padding: '30px 10px', fontSize: '14px', borderTop: `4px solid ${colors.primary}`,
  marginTop: 'auto',
  borderTopLeftRadius: '550px',
  borderTopRightRadius: '550px',
};

export default App;