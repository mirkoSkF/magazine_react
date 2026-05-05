import React, { useState } from 'react';
import MagazineEditor from './components/MagazineEditor';
import DashboardEditore from './components/DashboardEditore';
import IndexPubblicazioni from './components/IndexPubblicazioni';

// Palette Skillfactory Training
const colors = {
  primary: '#007bff',
  dark: '#343a40',
  lightGray: '#f8f9fa',
  border: '#dee2e6',
  white: '#ffffff'
};

function App() {
  const [view, setView] = useState('index'); 
  const [editId, setEditId] = useState(null);

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
      flexDirection: 'column' // Necessario per spingere il footer in basso
    }}>
      <style>{`
        /* Effetti Desktop e Transizioni */
        .nav-btn {
          transition: all 0.3s ease-in-out !important;
        }
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

        /* --- RESPONSIVE LOGIC --- */
        @media (max-width: 992px) {
          .nav-bar { padding: 15px 20px !important; }
        }

        @media (max-width: 768px) {
          .nav-bar {
            flex-direction: column !important;
            gap: 15px;
            text-align: center;
          }
          .nav-links {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }
          .nav-btn {
            flex: 1;
            min-width: 120px;
            padding: 8px 10px !important;
            font-size: 13px !important;
          }
        }

        @media (max-width: 480px) {
          .nav-links { flex-direction: column; width: 100%; }
          .nav-btn { width: 100%; }
        }
      `}</style>

      <nav className="nav-bar" style={navBarStyle}>
        <div style={{ fontWeight: '700', fontSize: '22px', color: colors.primary, letterSpacing: '-0.5px' }}>
          MAGAZINE.<span style={{ color: colors.dark }}>SKILLFACTORY</span>
        </div>
        
        <div className="nav-links" style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={`nav-btn ${view === 'index' ? 'active-nav-btn' : ''}`}
            style={view === 'index' ? activeBtn : btnStyle} 
            onClick={() => setView('index')}
          >
            Leggi Magazine
          </button>
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
        </div>
      </nav>

      {/* flex: 1 permette al main di occupare tutto lo spazio disponibile spingendo il footer in fondo */}
      <main style={{ paddingBottom: '40px', flex: '1' }}>
        {view === 'index' && <IndexPubblicazioni />}
        {view === 'dashboard' && <DashboardEditore onEdit={handleEdit} />}
        {view === 'editor' && <MagazineEditor editId={editId} />}
      </main>

      <footer style={footerStyle}>
        © Copyright - Skill Factory 2026
      </footer>
    </div>
  );
}

// --- STILI UI ---
const navBarStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  padding: '15px 60px', 
  background: colors.white, 
  boxShadow: '0 2px 10px rgba(0,0,0,.05)',
  position: 'sticky', 
  top: 0, 
  zIndex: 1000 
};

const footerStyle = {
  background: colors.dark,
  color: colors.white,
  textAlign: 'center',
  padding: '20px 10px',
  fontSize: '14px',
  fontWeight: '500',
  letterSpacing: '0.5px',
  borderTop: `3px solid ${colors.primary}` // Un richiamo al blu per continuità
};

const btnStyle = { 
  background: 'transparent', 
  color: colors.primary, 
  border: `1px solid ${colors.primary}`, 
  padding: '8px 22px', 
  borderRadius: '4px', 
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '14px',
  outline: 'none',
  whiteSpace: 'nowrap'
};

const activeBtn = { 
  ...btnStyle, 
  background: colors.primary, 
  color: colors.white 
};

export default App;