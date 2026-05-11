import React, { useState, useEffect } from 'react';
import MagazineEditor from './components/MagazineEditor';
import DashboardEditore from './components/DashboardEditore';
import IndexPubblicazioni from './components/IndexPubblicazioni';
import ArticoloSingolo from './components/ArticoloSingolo'; 
import Login from './components/Login';
import FormIntervista from './components/FormIntervista';
// NUOVI IMPORT
import DashboardInterviste from './components/DashboardInterviste';
import DettaglioIntervista from './components/DettaglioIntervista';

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
  };

  return (
    <div style={{ 
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
      background: colors.lightGray, 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflowX: 'hidden'
    }}>
      <style>{`
        .nav-link {
          background: none;
          border: none;
          color: ${colors.dark};
          font-weight: 500;
          font-size: 15px;
          cursor: pointer;
          padding: 8px 0;
          position: relative;
          transition: all 0.3s ease;
          white-space: nowrap;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-link:hover { color: ${colors.primary}; }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: ${colors.primary};
          transition: width 0.3s ease;
        }
        .nav-link:hover::after, .active-link::after { width: 100%; }
        .active-link { color: ${colors.primary} !important; font-weight: 700; }
        .logout-link { color: #dc3545 !important; }
        .logout-link:hover { opacity: 0.8; }
        .mobile-menu-toggle {
          display: none;
          background: none;
          border: none;
          color: ${colors.primary};
          font-size: 32px;
          cursor: pointer;
          line-height: 1;
        }
        @media (max-width: 1024px) {
          .nav-bar { padding: 10px 20px !important; height: 70px !important; }
          .mobile-menu-toggle { display: block; }
          .nav-links {
            display: ${isMobileMenuOpen ? 'flex' : 'none'} !important;
            position: absolute;
            top: 100%; left: 0; width: 100%;
            flex-direction: column;
            background: ${colors.white};
            padding: 20px 0;
            box-shadow: 0 15px 25px rgba(0,0,0,0.08);
            gap: 5px !important;
            z-index: 999;
          }
          .nav-link { width: 100%; padding: 15px 0; font-size: 17px; }
          .nav-link::after { bottom: 10px; left: 25%; max-width: 50%; }
        }
        @media (min-width: 1025px) {
          .nav-links {
            display: flex !important;
            position: static !important;
            flex-direction: row !important;
            width: auto !important;
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
            gap: 30px !important;
          }
        }
      `}</style>

      <nav className="nav-bar" style={navBarStyle}>
        <div 
          style={{ fontWeight: '800', fontSize: '24px', letterSpacing: '-0.5px', color: colors.primary, cursor: 'pointer' }}
          onClick={() => navigateTo('index')}
        >
          Magazine.<span style={{ color: colors.dark }}>SkillFactory.it</span>
        </div>
        
        <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className="nav-links">
          <button 
            className={`nav-link ${view === 'index' ? 'active-link' : ''}`}
            onClick={() => navigateTo('index')}
          >
            Leggi Magazine
          </button>

          {/* VISIBILE SOLO SE NON LOGGATO */}
          {!isLoggedIn && (
            <button 
              className={`nav-link ${view === 'intervista' ? 'active-link' : ''}`}
              onClick={() => navigateTo('intervista')}
            >
              Prenota Intervista
            </button>
          )}

          {!isLoggedIn ? (
            <button 
              className={`nav-link ${view === 'login' ? 'active-link' : ''}`}
              onClick={() => navigateTo('login')}
            >
              Area Riservata
            </button>
          ) : (
            <>
              <button 
                className={`nav-link ${view === 'dashboard' ? 'active-link' : ''}`}
                onClick={() => navigateTo('dashboard')}
              >
                Dashboard
              </button>

              <button 
                className={`nav-link ${view === 'admin-interviste' ? 'active-link' : ''}`}
                onClick={() => navigateTo('admin-interviste')}
              >
                Richieste Interviste
              </button>

              <button 
                className={`nav-link ${view === 'editor' ? 'active-link' : ''}`}
                onClick={() => { handleNewArticle(); setIsMobileMenuOpen(false); }}
              >
                + Nuovo Articolo
              </button>
              
              <button 
                className="nav-link logout-link"
                onClick={handleLogout}
              >
                Esci ({getDisplayName()})
              </button>
            </>
          )}
        </div>
      </nav>

      <main style={{ 
        paddingTop: '40px',
        paddingBottom: '60px', 
        flex: '1',
        width: '100%',
        maxWidth: '1100px', 
        margin: '0 auto', 
        boxSizing: 'border-box',
        paddingLeft: '20px',
        paddingRight: '20px'
      }}>
        {view === 'index' && <IndexPubblicazioni onReadArticle={handleReadArticle} />}
        
        {view === 'articolo' && (
          <ArticoloSingolo 
            id={selectedArticleId} 
            onBack={() => setView('index')} 
          />
        )}

        {view === 'intervista' && <FormIntervista />}

        {view === 'login' && !isLoggedIn && (
          <Login onLoginSuccess={handleLoginSuccess} colors={colors} />
        )}

        {isLoggedIn && (
          <>
            {view === 'dashboard' && <DashboardEditore onEdit={handleEdit} />}
            
            {view === 'admin-interviste' && (
              <DashboardInterviste 
                onSwitchView={navigateTo}
                onSelectIntervista={(id) => {
                  setSelectedArticleId(id);
                  setView('dettaglio-intervista');
                }}
              />
            )}

            {view === 'dettaglio-intervista' && (
              <DettaglioIntervista 
                id={selectedArticleId} 
                onBack={() => setView('admin-interviste')} 
              />
            )}

            {view === 'editor' && <MagazineEditor editId={editId} />}
          </>
        )}
      </main>

      <footer style={footerStyle}>© Copyright - Skill Factory 2026</footer>
    </div>
  );
}

const navBarStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '0 5%', 
  background: colors.white, 
  boxShadow: '0 4px 12px rgba(0,0,0,0.03)', 
  position: 'sticky', 
  top: 0, 
  zIndex: 1000,
  height: '80px'
};

const footerStyle = { 
  background: colors.dark, 
  color: colors.white, 
  textAlign: 'center', 
  padding: '30px 10px', 
  fontSize: '14px', 
  borderTop: `4px solid ${colors.primary}`,
  marginTop: 'auto'
};

export default App;