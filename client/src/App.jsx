import React, { useState, useEffect } from 'react';
import MagazineEditor from './components/MagazineEditor';
import DashboardEditore from './components/DashboardEditore';
import IndexPubblicazioni from './components/IndexPubblicazioni';
import ArticoloSingolo from './components/ArticoloSingolo'; // Nuovo Componente
import Login from './components/Login';

const colors = {
  primary: '#007bff',
  dark: '#343a40',
  lightGray: '#f8f9fa',
  border: '#dee2e6',
  white: '#ffffff'
};

function App() {
  const [view, setView] = useState('index'); 
  const [selectedArticleId, setSelectedArticleId] = useState(null); // ID per la lettura
  const [editId, setEditId] = useState(null); // ID per la modifica
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

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

  // Funzione per andare a leggere un articolo
  const handleReadArticle = (id) => {
    setSelectedArticleId(id);
    setView('articolo');
    window.scrollTo(0, 0); // Torna in alto
  };

  const handleEdit = (id) => {
    setEditId(id);
    setView('editor');
  };

  const handleNewArticle = () => {
    setEditId(null);
    setView('editor');
  };

  return (
    <div style={{ 
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
      background: colors.lightGray, 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        .nav-btn { transition: all 0.3s ease-in-out !important; }
        .nav-btn:hover {
          background-color: ${colors.primary} !important;
          color: ${colors.white} !important;
          box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
        }
        .active-nav-btn {
          background-color: ${colors.primary} !important;
          color: ${colors.white} !important;
          cursor: default;
        }
      `}</style>

      <nav className="nav-bar" style={navBarStyle}>
        <div 
          style={{ fontWeight: '700', fontSize: '22px', color: colors.primary, cursor: 'pointer' }}
          onClick={() => setView('index')}
        >
          Magazine.<span style={{ color: colors.dark }}>SkillFactory.it</span>
        </div>
        
        <div className="nav-links" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            className={`nav-btn ${view === 'index' ? 'active-nav-btn' : ''}`}
            style={view === 'index' ? activeBtn : btnStyle} 
            onClick={() => setView('index')}
          >
            Leggi Magazine
          </button>

          {!isLoggedIn ? (
            <button 
              className={`nav-btn ${view === 'login' ? 'active-nav-btn' : ''}`}
              style={view === 'login' ? activeBtn : btnStyle} 
              onClick={() => setView('login')}
            >
              Area Riservata
            </button>
          ) : (
            <>
              <button 
                className={`nav-btn ${view === 'dashboard' ? 'active-nav-btn' : ''}`}
                style={view === 'dashboard' ? activeBtn : btnStyle} 
                onClick={() => setView('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`nav-btn ${view === 'editor' ? 'active-nav-btn' : ''}`}
                style={view === 'editor' ? activeBtn : btnStyle} 
                onClick={handleNewArticle}
              >
                + Nuovo Articolo
              </button>
              
              <button 
                className="nav-btn"
                style={btnLogoutStyle} 
                onClick={handleLogout}
              >
                Esci ({getDisplayName()})
              </button>
            </>
          )}
        </div>
      </nav>

      <main style={{ paddingBottom: '40px', flex: '1' }}>
        {/* Passiamo handleReadArticle all'indice per gestire i click */}
        {view === 'index' && <IndexPubblicazioni onReadArticle={handleReadArticle} />}
        
        {/* Vista Articolo Singolo */}
        {view === 'articolo' && (
          <ArticoloSingolo 
            id={selectedArticleId} 
            onBack={() => setView('index')} 
          />
        )}

        {view === 'login' && !isLoggedIn && (
          <Login onLoginSuccess={handleLoginSuccess} colors={colors} />
        )}

        {isLoggedIn && (
          <>
            {view === 'dashboard' && <DashboardEditore onEdit={handleEdit} />}
            {view === 'editor' && <MagazineEditor editId={editId} />}
          </>
        )}
      </main>

      <footer style={footerStyle}>© Copyright - Skill Factory 2026</footer>
    </div>
  );
}

// ... (stili invariati)
const navBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 60px', background: colors.white, boxShadow: '0 2px 10px rgba(0,0,0,.05)', position: 'sticky', top: 0, zIndex: 1000 };
const footerStyle = { background: colors.dark, color: colors.white, textAlign: 'center', padding: '20px 10px', fontSize: '14px', borderTop: `3px solid ${colors.primary}` };
const btnStyle = { background: 'transparent', color: colors.primary, border: `1px solid ${colors.primary}`, padding: '8px 22px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', outline: 'none', whiteSpace: 'nowrap' };
const activeBtn = { ...btnStyle, background: colors.primary, color: colors.white };
const btnLogoutStyle = { ...btnStyle, color: '#dc3545', border: '1px solid #dc3545', background: '#fff5f5' };

export default App;