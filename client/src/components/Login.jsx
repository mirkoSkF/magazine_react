import React, { useState } from 'react';

const Login = ({ onLoginSuccess, colors }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
        // Salvataggio dati nel browser
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('ruolo', data.ruolo);
        onLoginSuccess();
      } else {
        alert("Credenziali errate. Controlla la console di Spring Boot per le password generate.");
      }
    } catch (error) {
      alert("Impossibile connettersi al server backend.");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px' }}>
      <form onSubmit={handleLogin} style={{ 
        background: colors.white, 
        padding: '40px', 
        borderRadius: '8px', 
        border: `1px solid ${colors.border}`, 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '400px' 
      }}>
        <h2 style={{ textAlign: 'center', color: colors.dark, marginBottom: '10px', fontWeight: '700' }}>AREA EDITORI</h2>
        <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '25px' }}>Inserisci le tue credenziali per gestire il magazine</p>
        
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Username</label>
        <input 
          type="text" 
          placeholder="es: mirko.onorato" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle(colors)}
          required
        />
        
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', marginTop: '15px' }}>Password</label>
        <input 
          type="password" 
          placeholder="••••••••" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle(colors)}
          required
        />
        
        <button type="submit" style={loginBtnStyle(colors)}>
          ACCEDI ORA
        </button>
      </form>
    </div>
  );
};

const inputStyle = (colors) => ({
  width: '100%', 
  padding: '12px', 
  borderRadius: '4px', 
  border: `1px solid ${colors.border}`,
  fontSize: '16px',
  boxSizing: 'border-box'
});

const loginBtnStyle = (colors) => ({
  width: '100%', 
  padding: '14px', 
  background: colors.primary, 
  color: 'white', 
  border: 'none', 
  borderRadius: '4px', 
  cursor: 'pointer', 
  fontWeight: '700',
  marginTop: '25px',
  fontSize: '14px',
  letterSpacing: '0.5px'
});

export default Login;