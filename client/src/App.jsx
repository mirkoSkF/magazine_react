import React, { useState, useEffect } from 'react';
import MagazineEditor from './components/MagazineEditor';
// Carichiamo i file "Enhanced" che fanno da guscio a quelli originali
import DashboardEditore from './components/EnhancedDashboard';
import IndexPubblicazioni from './components/EnhancedIndex';
import ArticoloSingolo from './components/ArticoloSingolo'; 
import Login from './components/Login';
import FormIntervista from './components/FormIntervista';
import DashboardInterviste from './components/DashboardInterviste';
import DettaglioIntervista from './components/DettaglioIntervista';

// --- COMPONENTE: SPONSOR CAROUSEL (ROTAZIONE 5 SECONDI) ---
const SponsorCarousel = ({ posizione }) => {
  const [sponsors, setSponsors] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Carichiamo tutti gli sponsor per la posizione specifica
    fetch(`http://localhost:8096/api/sponsors`)
      .then(res => res.json())
      .then(data => {
        const filtrati = data.filter(s => s.posizione === posizione && s.attivo);
        setSponsors(filtrati);
      })
      .catch(() => {});
  }, [posizione]);

  useEffect(() => {
    // Timer per la rotazione ogni 5 secondi
    if (sponsors.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sponsors.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [sponsors]);

  const trackClick = (id) => {
    if (id) {
      fetch(`http://localhost:8096/api/sponsors/${id}/click`, { method: 'PATCH' });
    }
  };

  if (sponsors.length === 0) return null;
  const current = sponsors[currentIndex];

  return (
    <div style={{ textAlign: 'center', padding: '15px', background: '#fff', border: '1px solid #eee', borderRadius: '12px', margin: '20px 0' }}>
      <small style={{ color: '#aaa', display: 'block', marginBottom: '8px', fontSize: '10px', letterSpacing: '1px' }}>PARTNER SKILL FACTORY</small>
      <div style={{ position: 'relative', minHeight: '90px', display: 'flex', justifyContent: 'center' }}>
        <a href={current.linkSito} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(current.id)}>
          <img 
            src={current.bannerImage} 
            alt={current.nomeAzienda} 
            style={{ width: '100%', maxWidth: '728px', height: 'auto', borderRadius: '4px', cursor: 'pointer', transition: 'opacity 0.5s ease' }} 
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

// --- NUOVO COMPONENTE: COOKIE BANNER (PRIVACY) ---
const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(!localStorage.getItem('cookie-consent'));
  if (!isVisible) return null;

  const handleConsent = (status) => {
    localStorage.setItem('cookie-consent', status);
    setIsVisible(false);
  };

  return (
    <div style={{
      position: 'fixed', bottom: '20px', left: '20px', right: '20px',
      background: '#fff', padding: '20px', boxShadow: '0 0 20px rgba(0,0,0,0.2)',
      borderRadius: '8px', zIndex: 9999, borderLeft: '5px solid #007bff'
    }}>
      <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#333' }}>
        Questo sito utilizza cookie tecnici e di partner terzi per migliorare l'esperienza e mostrare sponsor pertinenti.
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => handleConsent('accepted')} style={{ padding: '8px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Accetta</button>
        <button onClick={() => handleConsent('declined')} style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Rifiuta</button>
      </div>
    </div>
  );
};

// --- COMPONENTE PRIVACY INTEGRATO ---
const PrivacyContent = ({ onBack }) => (
  <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', textAlign: 'left', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', lineHeight: '1.6', color: '#333', maxHeight: '80vh', overflowY: 'auto' }}>
    <button onClick={onBack} style={{ cursor: 'pointer', marginBottom: '30px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
      &larr; Torna al Magazine
    </button>
    <h1 style={{ fontSize: '22px', borderBottom: '2px solid #007bff', paddingBottom: '10px', color: '#333' }}>INFORMATIVA SUL TRATTAMENTO DEI DATI PERSONALI</h1>
    <p>Gentile Utente, ai sensi dell'art. 13 del regolamento (UE) n.2016/679 (GDPR), la Società SKILL FACTORY S.R.L. La informa di quanto segue:</p>
    <h3 style={{ fontSize: '18px', marginTop: '20px' }}>A) Finalità del trattamento</h3>
    <p><strong>A1)</strong> Navigazione e sicurezza del sito.<br/><strong>A9) Gestione Sponsorizzazioni:</strong> Il sito mostra banner di partner terzi. I dati possono essere usati in forma anonima per statistiche di visualizzazione e click.</p>
    <h3 style={{ fontSize: '18px', marginTop: '20px' }}>G) Titolare del trattamento</h3>
    <p><strong>SKILL FACTORY S.R.L.</strong>, Via Sedivola n. 30 - Torre del Greco (Na).<br/>DPO: Silvio Tortora Maione, email: silvio@itadvice.it</p>
  </div>
);

const colors = { primary: '#007bff', dark: '#343a40', lightGray: '#f8f9fa', border: '#dee2e6', white: '#ffffff' };

function App() {
  const [view, setView] = useState('index'); 
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
  }, []);

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
  };

  const handleReadArticle = (id) => {
    setSelectedArticleId(id);
    setView('articolo');
    window.scrollTo(0, 0);
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
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", background: colors.lightGray, minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <style>{`
        .nav-link { background: none; border: none; color: ${colors.dark}; font-weight: 500; font-size: 15px; cursor: pointer; padding: 8px 0; position: relative; transition: all 0.3s ease; white-space: nowrap; text-decoration: none; display: flex; align-items: center; justify-content: center; }
        .nav-link:hover { color: ${colors.primary}; }
        .nav-link::after { content: ''; position: absolute; width: 0; height: 2px; bottom: 0; left: 0; background-color: ${colors.primary}; transition: width 0.3s ease; }
        .nav-link:hover::after, .active-link::after { width: 100%; }
        .active-link { color: ${colors.primary} !important; font-weight: 700; }
        .logout-link { color: #dc3545 !important; }
        .mobile-menu-toggle { display: none; background: none; border: none; color: ${colors.primary}; font-size: 32px; cursor: pointer; line-height: 1; }
        @media (max-width: 1024px) { .nav-bar { padding: 10px 20px !important; height: 70px !important; } .mobile-menu-toggle { display: block; } .nav-links { display: ${isMobileMenuOpen ? 'flex' : 'none'} !important; position: absolute; top: 100%; left: 0; width: 100%; flex-direction: column; background: ${colors.white}; padding: 20px 0; box-shadow: 0 15px 25px rgba(0,0,0,0.08); gap: 5px !important; z-index: 999; } .nav-link { width: 100%; padding: 15px 0; font-size: 17px; } }
        @media (min-width: 1025px) { .nav-links { display: flex !important; position: static !important; flex-direction: row !important; width: auto !important; background: transparent !important; box-shadow: none !important; padding: 0 !important; gap: 30px !important; } }
      `}</style>

      <nav className="nav-bar" style={navBarStyle}>
        <div style={{ fontWeight: '800', fontSize: '24px', letterSpacing: '-0.5px', color: colors.primary, cursor: 'pointer' }} onClick={() => navigateTo('index')}>
          Magazine.<span style={{ color: colors.dark }}>SkillFactory.it</span>
        </div>
        <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? '✕' : '☰'}</button>
        <div className="nav-links">
          <button className={`nav-link ${view === 'index' ? 'active-link' : ''}`} onClick={() => navigateTo('index')}>Leggi Magazine</button>
          {!isLoggedIn && <button className={`nav-link ${view === 'intervista' ? 'active-link' : ''}`} onClick={() => navigateTo('intervista')}>Prenota Intervista</button>}
          {!isLoggedIn ? (
            <button className={`nav-link ${view === 'login' ? 'active-link' : ''}`} onClick={() => navigateTo('login')}>Area Riservata</button>
          ) : (
            <>
              <button className={`nav-link ${view === 'dashboard' ? 'active-link' : ''}`} onClick={() => navigateTo('dashboard')}>Dashboard</button>
              <button className={`nav-link ${view === 'admin-interviste' ? 'active-link' : ''}`} onClick={() => navigateTo('admin-interviste')}>Richieste Interviste</button>
              <button className={`nav-link ${view === 'editor' ? 'active-link' : ''}`} onClick={() => handleNewArticle()}>+ Nuovo Articolo</button>
              <button className="nav-link logout-link" onClick={handleLogout}>Esci ({getDisplayName()})</button>
            </>
          )}
        </div>
      </nav>

      <main style={mainContainerStyle}>
        {view === 'index' && (
          <>
            <SponsorCarousel posizione="HOME_TOP" />
            <IndexPubblicazioni onReadArticle={handleReadArticle} onPrivacyClick={() => setView('privacy')} />
          </>
        )}
        {view === 'articolo' && (
          <>
            <ArticoloSingolo id={selectedArticleId} onBack={() => setView('index')} />
            <SponsorCarousel posizione="ARTICOLO_BOTTOM" />
          </>
        )}
        {view === 'intervista' && <FormIntervista onPrivacyClick={() => setView('privacy')} />}
        {view === 'privacy' && <PrivacyContent onBack={() => setView('index')} />}
        {view === 'login' && !isLoggedIn && <Login onLoginSuccess={handleLoginSuccess} colors={colors} />}
        {isLoggedIn && (
          <>
            {view === 'dashboard' && <DashboardEditore onEdit={handleEdit} />}
            {view === 'admin-interviste' && <DashboardInterviste onSwitchView={navigateTo} onSelectIntervista={(id) => { setSelectedArticleId(id); setView('dettaglio-intervista'); }} />}
            {view === 'dettaglio-intervista' && <DettaglioIntervista id={selectedArticleId} onBack={() => setView('admin-interviste')} />}
            {view === 'editor' && <MagazineEditor editId={editId} />}
          </>
        )}
      </main>

      <footer style={footerStyle}>
        &copy; Copyright - Skill Factory 2026 | 
        <span onClick={() => setView('privacy')} style={{ cursor: 'pointer', marginLeft: '10px', textDecoration: 'underline' }}>Privacy Policy</span>
      </footer>
      <CookieBanner />
    </div>
  );
}

const navBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 5%', background: colors.white, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 1000, height: '80px' };
const mainContainerStyle = { paddingTop: '40px', paddingBottom: '60px', flex: '1', width: '100%', maxWidth: '1100px', margin: '0 auto', boxSizing: 'border-box', paddingLeft: '20px', paddingRight: '20px' };
const footerStyle = { background: colors.dark, color: colors.white, textAlign: 'center', padding: '30px 10px', fontSize: '14px', borderTop: `4px solid ${colors.primary}`, marginTop: 'auto' };

export default App;