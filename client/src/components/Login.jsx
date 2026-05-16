import React, { useState, useEffect } from 'react';

const Login = ({ onLoginSuccess, colors }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // Flag per capire se mostrare il mascheramento fake (attivo solo all'inizio se c'è autofill/cache)
  const [useFakeMask, setUseFakeMask] = useState(true);

  // STATO PER IL MODALE
  const [modal, setModal] = useState({
    show: false,
    message: '',
    type: 'error'
  });

  // STATO PER HOVER BOTTONI
  const [isHoverLogin, setIsHoverLogin] = useState(false);
  const [isHoverRetry, setIsHoverRetry] = useState(false);

  // Se l'utente preme la X o svuota la password manualmente, disattiviamo definitivamente la maschera fake
  const handleClearPassword = () => {
    setPassword('');
    setUseFakeMask(false); 
  };

  // Se l'utente digita manualmente da zero, togliamo la maschera fake per fargli vedere la lunghezza reale
  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (val === '') {
      setUseFakeMask(false);
    }
  };

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
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 20px',
        minHeight: '80vh'
      }}
    >
      {/* MODALE */}
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
                color: 'white', border: 'none', borderRadius: '12px',
                cursor: 'pointer', fontWeight: '700', transition: 'all 0.3s ease',
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

        /* PASSWORD MASK CORRETTA (Attiva solo quando esplicitamente richiesto) */
        .fake-password-input,
        .fake-password-input:focus,
        .fake-password-input:active {
          color: transparent !important;
          text-shadow: 0 0 0 transparent !important;
          -webkit-text-fill-color: transparent !important;
          caret-color: transparent !important;
        }

        /* Chrome Autofill */
        .fake-password-input:-webkit-autofill {
          -webkit-text-fill-color: transparent !important;
          transition: background-color 999999s ease-in-out 0s;
        }

        /* ANIMAZIONE DEL CURSORE FINTO */
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .fake-caret {
          display: inline-block;
          width: 2px;
          height: 19px;
          background-color: #111;
          margin-left: 2px;
          animation: blink 1s step-end infinite;
          vertical-align: middle;
        }

        /* STILI PULSANTI DI AZIONE INTERNI ALL'INPUT */
        .input-action-btn {
          display: flex;
          align-items: center;
          justifyContent: center;
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: #9ca3af;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .input-action-btn:hover {
          color: #4b5563;
          background-color: #f3f4f6;
        }
      `}</style>

      <form
        onSubmit={handleLogin}
        style={{
          background: colors.white, padding: '45px', borderRadius: '24px',
          border: `1px solid ${colors.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
          width: '100%', maxWidth: '400px'
        }}
      >
        <h2 style={{ textAlign: 'center', color: colors.dark, marginBottom: '10px', fontWeight: '900', letterSpacing: '-1px', fontSize: '28px' }}>
          AREA EDITORI
        </h2>
        <p style={{ textAlign: 'center', color: '#888', fontSize: '14px', marginBottom: '35px', fontWeight: '500' }}>
          Accesso riservato alla redazione
        </p>

        {/* USERNAME */}
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '800', color: '#444', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Username
        </label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            className="login-input"
            placeholder="nome.cognome"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ ...inputStyle(colors), transition: 'all 0.3s', paddingRight: '45px' }}
            required
          />
          {username && (
            <button
              type="button"
              className="input-action-btn"
              onClick={() => setUsername('')}
              style={{ position: 'absolute', right: '14px', zIndex: 3 }}
              title="Cancella testo"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        {/* PASSWORD */}
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '800', color: '#444', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '20px' }}>
          Password
        </label>

        {/* CONTENITORE PASSWORD */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={`login-input ${(!showPassword && useFakeMask && password) ? 'fake-password-input' : ''}`}
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{
              ...inputStyle(colors),
              transition: 'all 0.3s',
              position: 'relative',
              zIndex: 1,
              paddingRight: '80px'
            }}
            required
          />

          {/* LAYER GRAFICO CON I PALLINI E IL CURSORE FINTO (Solo se useFakeMask è attivo) */}
          {!showPassword && useFakeMask && (password || isFocused) && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '16px',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                zIndex: 2,
                color: '#111',
                fontSize: '18px',
                letterSpacing: '2px',
                fontFamily: 'sans-serif',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {password && <span>••••••••</span>}
              {isFocused && <span className="fake-caret" />}
            </div>
          )}

          {/* GRUPPO DI PULSANTI DI AZIONE */}
          <div style={{ position: 'absolute', right: '12px', display: 'flex', gap: '6px', alignItems: 'center', zIndex: 3 }}>
            {/* Tasto Cancella Password (X) */}
            {password && (
              <button
                type="button"
                className="input-action-btn"
                onClick={handleClearPassword}
                title="Cancella password"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}

            {/* Tasto Mostra/Nascondi Occhio */}
            <button
              type="button"
              className="input-action-btn"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Nascondi password" : "Mostra password"}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          onMouseEnter={() => setIsHoverLogin(true)}
          onMouseLeave={() => setIsHoverLogin(false)}
          style={loginBtnStyle(colors, isHoverLogin)}
        >
          ACCEDI
        </button>
      </form>
    </div>
  );
};

const inputStyle = (colors) => ({
  width: '100%', padding: '16px', borderRadius: '12px', border: `2px solid ${colors.border}`,
  fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#f9fafb', fontFamily: 'inherit'
});

const loginBtnStyle = (colors, isHover) => ({
  width: '100%', padding: '18px', background: isHover ? '#000' : colors.primary,
  color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800',
  marginTop: '35px', fontSize: '13px', letterSpacing: '1.5px',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  transform: isHover ? 'translateY(-3px)' : 'translateY(0)',
  boxShadow: isHover ? '0 12px 24px rgba(0,0,0,0.15)' : 'none'
});

export default Login;