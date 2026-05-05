import React, { useState, useEffect } from 'react';
import MagazineEditor from './components/MagazineEditor';
import DashboardEditore from './components/DashboardEditore';
import IndexPubblicazioni from './components/IndexPubblicazioni';

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
  
  // CORRETTO: Usato useState invece di setAuth per l'inizializzazione
  const [auth, setAuth] = useState(() => localStorage.getItem('magazine_auth'));

  const handleLogin = (username, password) => {
    const hash = btoa(`${username}:${password}`);
    setAuth(hash);
    localStorage.setItem('magazine_auth', hash);
    setView('dashboard');
  };

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('magazine_auth');
    setView('index');
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

          {auth && (
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
            </>
          )}

          {!auth ? (
            <button className="nav-btn" style={btnStyle} onClick={() => setView('login')}>Area Editore</button>
          ) : (
            <button className="nav-btn" style={{...btnStyle, borderColor: '#dc3545', color: '#dc3545'}} onClick={handleLogout}>Esci</button>
          )}
        </div>
      </nav>

      <main style={{ paddingBottom: '40px', flex: '1' }}>
        {view === 'index' && <IndexPubblicazioni />}
        {view === 'login' && <LoginForm onLogin={handleLogin} colors={colors} />}
        {view === 'dashboard' && auth && <DashboardEditore onEdit={handleEdit} auth={auth} />}
        {view === 'editor' && auth && <MagazineEditor editId={editId} auth={auth} />}
      </main>

      <footer style={footerStyle}>
        © Copyright - Skill Factory 2026
      </footer>
    </div>
  );
}

const LoginForm = ({ onLogin, colors }) => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');

  const submit = (e) => {
    e.preventDefault();
    onLogin(u, p);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '60px' }}>
      <form onSubmit={submit} style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px' }}>
        <h2 style={{ textAlign: 'center', color: colors.dark, marginBottom: '30px' }}>Accesso Editore</h2>
        <input type="text" placeholder="Username" style={inputStyle} value={u} onChange={e => setU(e.target.value)} />
        <input type="password" placeholder="Password" style={inputStyle} value={p} onChange={e => setP(e.target.value)} />
        <button type="submit" style={{ ...btnStyle, background: colors.primary, color: 'white', width: '100%', marginTop: '20px', padding: '12px' }}>Accedi</button>
      </form>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', border: `1px solid ${colors.border}`, borderRadius: '4px', outline: 'none', boxSizing: 'border-box' };
const navBarStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 60px', background: colors.white, boxShadow: '0 2px 10px rgba(0,0,0,.05)', position: 'sticky', top: 0, zIndex: 1000 };
const footerStyle = { background: colors.dark, color: colors.white, textAlign: 'center', padding: '20px 10px', fontSize: '14px', borderTop: `3px solid ${colors.primary}` };
const btnStyle = { background: 'transparent', color: colors.primary, border: `1px solid ${colors.primary}`, padding: '8px 22px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' };
const activeBtn = { ...btnStyle, background: colors.primary, color: colors.white };

export default App;