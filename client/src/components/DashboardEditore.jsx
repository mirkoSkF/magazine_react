import React, { useState, useEffect } from 'react';

const DashboardEditore = ({ onEdit }) => {
  const [articoli, setArticoli] = useState([]);
  const [utente, setUtente] = useState(null);
  
  // Stati per il nuovo form password
  const [pwdForm, setPwdForm] = useState({ vecchiaPassword: '', nuovaPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ testo: '', tipo: '' });

  const token = localStorage.getItem('token');
  const authHeader = { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json' 
  };

  const colors = {
    primary: '#007bff',
    dark: '#343a40',
    lightGray: '#f8f9fa',
    border: '#dee2e6',
    white: '#ffffff',
    danger: '#dc3545',
    success: '#28a745'
  };

  const caricaDati = async () => {
    try {
      const resUser = await fetch('http://localhost:8096/api/profilo', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const dataUser = await resUser.json();
      setUtente(dataUser);

      const resArt = await fetch('http://localhost:8096/api/pagine/mie', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const dataArt = await resArt.json();
      setArticoli(dataArt);
    } catch (err) { console.error("Errore caricamento:", err); }
  };

  useEffect(() => { caricaDati(); }, []);

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    await fetch('http://localhost:8096/api/profilo/upload-foto', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    caricaDati();
  };

  // NUOVA FUNZIONE: Cambio Password
  const handleCambiaPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8096/api/profilo/cambia-password', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify(pwdForm)
      });

      if (res.ok) {
        setPwdMsg({ testo: "Password aggiornata con successo!", tipo: 'success' });
        setPwdForm({ vecchiaPassword: '', nuovaPassword: '' });
      } else {
        const txt = await res.text();
        setPwdMsg({ testo: "Errore: Vecchia password errata", tipo: 'danger' });
      }
    } catch (err) {
      setPwdMsg({ testo: "Errore di connessione", tipo: 'danger' });
    }
  };

  const elimina = async (id) => {
    if (window.confirm("Eliminare l'articolo?")) {
      await fetch(`http://localhost:8096/api/pagine/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      caricaDati();
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        {/* PANNELLO UTENTE ESISTENTE */}
        <div style={{ flex: 2, display: 'flex', alignItems: 'center', background: colors.white, padding: '20px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
          <div style={{ position: 'relative' }}>
            {utente?.fotoProfilo ? (
              <img src={`data:image/jpeg;base64,${utente.fotoProfilo}`} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginRight: '20px' }} alt="Avatar" />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ccc', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>SF</div>
            )}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{utente?.nome} {utente?.cognome}</h3>
            <p style={{ color: '#666', margin: '5px 0' }}>{utente?.ruolo}</p>
            <input type="file" onChange={handleFotoUpload} style={{ fontSize: '12px' }} />
          </div>
        </div>

        {/* NUOVO PANNELLO: CAMBIO PASSWORD */}
        <div style={{ flex: 1, background: colors.white, padding: '20px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', color: colors.dark }}>Sicurezza</h4>
          <form onSubmit={handleCambiaPassword} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="password" placeholder="Vecchia password" 
              value={pwdForm.vecchiaPassword}
              onChange={e => setPwdForm({...pwdForm, vecchiaPassword: e.target.value})}
              style={inputStyle} required
            />
            <input 
              type="password" placeholder="Nuova password" 
              value={pwdForm.nuovaPassword}
              onChange={e => setPwdForm({...pwdForm, nuovaPassword: e.target.value})}
              style={inputStyle} required
            />
            <button type="submit" style={btnPwdStyle(colors.primary)}>Aggiorna</button>
          </form>
          {pwdMsg.testo && <p style={{ fontSize: '11px', color: colors[pwdMsg.tipo], marginTop: '5px', fontWeight: '600' }}>{pwdMsg.testo}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: colors.dark, fontWeight: '600' }}>I Miei Articoli</h2>
      </div>

      <div style={{ background: colors.white, borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: colors.lightGray, borderBottom: `2px solid ${colors.border}` }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>ANTEPRIMA</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>AZIONI</th>
            </tr>
          </thead>
          <tbody>
            {articoli.map(a => (
              <tr key={a.id} style={rowStyle}>
                <td style={tdStyle}>#{a.id}</td>
                <td style={tdStyle}>{a.moduli?.[0]?.contenuto.replace(/<[^>]*>?/gm, '').substring(0, 50)}...</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <button onClick={() => onEdit(a.id)} style={actionBtnStyle(colors.primary)}>Modifica</button>
                  <button onClick={() => elimina(a.id)} style={actionBtnStyle(colors.danger)}>Elimina</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = { padding: '15px 20px', fontSize: '13px', textTransform: 'uppercase', color: '#495057' };
const tdStyle = { padding: '18px 20px', borderBottom: '1px solid #eee' };
const rowStyle = { transition: 'background-color 0.2s ease' };
const actionBtnStyle = (color) => ({ background: 'transparent', color: color, border: `1px solid ${color}`, padding: '6px 15px', borderRadius: '4px', marginLeft: '10px', cursor: 'pointer', fontSize: '13px' });
const inputStyle = { padding: '6px 10px', borderRadius: '4px', border: '1px solid #dee2e6', fontSize: '13px' };
const btnPwdStyle = (color) => ({ background: color, color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' });

export default DashboardEditore;