import React, { useState } from 'react';

const LoginForm = ({ onLogin, colors }) => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(u, p);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: colors.lightGray }}>
      <form onSubmit={handleSubmit} style={{ background: colors.white, padding: '40px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: colors.dark }}>Area Riservata</h2>
        <input type="text" placeholder="Username" value={u} onChange={(e) => setU(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" value={p} onChange={(e) => setP(e.target.value)} style={inputStyle} />
        <button type="submit" style={{ width: '100%', padding: '12px', background: colors.primary, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
          Accedi
        </button>
      </form>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' };

export default LoginForm;