import React, { useState } from 'react';

const Login = ({ onLoginSuccess, colors }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // STATO PER IL MODALE
  const [modal, setModal] = useState({
    show: false,
    message: '',
    type: 'error'
  });

  // STATO PER HOVER BOTTONI
  const [isHoverLogin, setIsHoverLogin] = useState(false);
  const [isHoverRetry, setIsHoverRetry] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8096/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('ruolo', data.ruolo);
        onLoginSuccess();
      } else {
        setModal({
          show: true,
          message: "Credenziali non valide",
          type: 'error'
        });
      }
    } catch (error) {
      setModal({
        show: true,
        message: "Errore di connessione",
        type: 'error'
      });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px', minHeight: '80vh' }}>
      
      {/* MODALE ELEGANTE */}
      {modal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            background: 'white', padding: '40px', borderRadius: '24px',
            maxWidth: '350px', width: '90%', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: 'none',
            animation: 'modalIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>
              {/* CAMBIO ICONA QUI */}
              {modal.type === 'error' ? '⚠️' : '✅'}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: colors.dark, marginBottom: '10px', fontFamily: 'system-ui' }}>
              Oops!
            </h3>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '25px', fontWeight: '500' }}>
              {modal.message}
            </p>
            <button 
              onClick={() => setModal({ ...modal, show: false })}
              onMouseEnter={() => setIsHoverRetry(true)}
              onMouseLeave={() => setIsHoverRetry(false)}
              style={{ 
                padding: '12px 40px', 
                background: isHoverRetry ? colors.primary : colors.dark, 
                color: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                fontWeight: '700', 
                transition: 'all 0.3s ease',
                transform: isHoverRetry ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isHoverRetry ? '0 10px 20px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              Riprova
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .login-input:focus {
          border-color: ${colors.primary} !important;
          box-shadow: 0 0 0 4px rgba(0,123,255,0.1) !important;
          outline: none;
          background: white !important;
        }
      `}</style>

      <form onSubmit={handleLogin} style={{ 
        background: colors.white, 
        padding: '45px', 
        borderRadius: '24px', 
        border: `1px solid ${colors.border}`, 
        boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        width: '100%',
        maxWidth: '400px' 
      }}>
        <h2 style={{ textAlign: 'center', color: colors.dark, marginBottom: '10px', fontWeight: '900', letterSpacing: '-1px', fontSize: '28px' }}>AREA EDITORI</h2>
        <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', marginBottom: '35px', fontWeight: '500' }}>Accesso riservato alla redazione</p>
        
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '800', color: '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>Username</label>
        <input 
          type="text" 
          className="login-input"
          placeholder="nome.cognome" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          style={{ ...inputStyle(colors), transition: 'all 0.3s' }}
          required
        />
        
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '800', color: '#444', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '20px' }}>Password</label>
        <input 
          type="password" 
          className="login-input"
          placeholder="••••••••" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={{ ...inputStyle(colors), transition: 'all 0.3s' }}
          required
        />
        
        <button 
          type="submit" 
          onMouseEnter={() => setIsHoverLogin(true)}
          onMouseLeave={() => setIsHoverLogin(false)}
          style={loginBtnStyle(colors, isHoverLogin)}
        >
          ACCEDI AL DASHBOARD
        </button>
      </form>
    </div>
  );
};

const inputStyle = (colors) => ({
  width: '100%', 
  padding: '16px', 
  borderRadius: '12px', 
  border: `2px solid ${colors.border}`,
  fontSize: '16px',
  boxSizing: 'border-box',
  backgroundColor: '#f9fafb',
  fontFamily: 'inherit'
});

const loginBtnStyle = (colors, isHover) => ({
  width: '100%', 
  padding: '18px', 
  background: isHover ? '#000' : colors.primary, 
  color: 'white', 
  border: 'none', 
  borderRadius: '12px', 
  cursor: 'pointer', 
  fontWeight: '800',
  marginTop: '35px',
  fontSize: '13px',
  letterSpacing: '1.5px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: isHover ? 'translateY(-3px)' : 'translateY(0)',
  boxShadow: isHover ? '0 12px 24px rgba(0,0,0,0.15)' : 'none'
});

export default Login;