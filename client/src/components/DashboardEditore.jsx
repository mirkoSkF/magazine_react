import React, { useState, useEffect } from 'react';

const DashboardEditore = ({ onEdit }) => {
  const [articoli, setArticoli] = useState([]);
  const [utente, setUtente] = useState(null);
  const [pwdForm, setPwdForm] = useState({ vecchiaPassword: '', nuovaPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ testo: '', tipo: '' });

  // Recupero del token dal localStorage
  const token = localStorage.getItem('token');
  
  const colors = {
    primary: '#007bff',
    dark: '#343a40',
    lightGray: '#f8f9fa',
    border: '#dee2e6',
    white: '#ffffff',
    danger: '#dc3545',
    success: '#28a745',
    accent: '#6f42c1' 
  };

  const caricaDati = async () => {
    if (!token) {
      console.warn("Nessun token trovato. Effettua il login.");
      return;
    }

    try {
      // 1. Caricamento Profilo Utente
      const resUser = await fetch('http://localhost:8096/api/profilo', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (resUser.ok) {
        const dataUser = await resUser.json();
        setUtente(dataUser);
      } else {
        console.error("Errore profilo:", resUser.status);
      }

      // 2. Caricamento Articoli Personali (mie)
      const resArt = await fetch('http://localhost:8096/api/pagine/mie', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (resArt.ok) {
        const dataArt = await resArt.json();
        setArticoli(dataArt);
      } else {
        console.error("Errore articoli:", resArt.status);
      }
    } catch (err) { 
      console.error("Errore di connessione al server:", err); 
    }
  };

  useEffect(() => { 
    caricaDati(); 
  }, []);

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('http://localhost:8096/api/profilo/upload-foto', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) caricaDati();
    } catch (err) {
      console.error("Errore upload:", err);
    }
  };

  const handleCambiaPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8096/api/profilo/cambia-password', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(pwdForm)
      });
      if (res.ok) {
        setPwdMsg({ testo: "Password aggiornata!", tipo: 'success' });
        setPwdForm({ vecchiaPassword: '', nuovaPassword: '' });
      } else {
        setPwdMsg({ testo: "Errore: vecchia password errata", tipo: 'danger' });
      }
    } catch (err) { 
      setPwdMsg({ testo: "Errore connessione", tipo: 'danger' }); 
    }
  };

  const elimina = async (id) => {
    if (window.confirm("Eliminare definitivamente questo contenuto?")) {
      try {
        const res = await fetch(`http://localhost:8096/api/pagine/${id}`, { 
          method: 'DELETE', 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (res.ok) caricaDati();
      } catch (err) {
        console.error("Errore eliminazione:", err);
      }
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      <style>
        {`
          .btn-modifica { background: transparent; color: ${colors.primary}; border: 1px solid ${colors.primary}; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.3s ease; margin-left: 10px; }
          .btn-modifica:hover { background: ${colors.primary}; color: white; }
          .btn-elimina { background: transparent; color: ${colors.danger}; border: 1px solid ${colors.danger}; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.3s ease; margin-left: 10px; }
          .btn-elimina:hover { background: ${colors.danger}; color: white; }
        `}
      </style>

      {/* PANNELLO UTENTE */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 2, display: 'flex', alignItems: 'center', background: colors.white, padding: '20px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
          <div>
            {utente?.fotoProfilo ? (
              <img src={`data:image/jpeg;base64,${utente.fotoProfilo}`} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginRight: '20px' }} alt="Avatar" />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ccc', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                {utente?.nome?.charAt(0)}{utente?.cognome?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{utente?.nome} {utente?.cognome}</h3>
            <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>{utente?.ruolo}</p>
            <input type="file" onChange={handleFotoUpload} style={{ fontSize: '11px' }} />
          </div>
        </div>

        <div style={{ flex: 1, background: colors.white, padding: '20px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', color: colors.dark }}>Sicurezza</h4>
          <form onSubmit={handleCambiaPassword} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input type="password" placeholder="Vecchia password" value={pwdForm.vecchiaPassword} onChange={e => setPwdForm({...pwdForm, vecchiaPassword: e.target.value})} style={inputStyle} required />
            <input type="password" placeholder="Nuova password" value={pwdForm.nuovaPassword} onChange={e => setPwdForm({...pwdForm, nuovaPassword: e.target.value})} style={inputStyle} required />
            <button type="submit" style={btnPwdStyle(colors.primary)}>Aggiorna</button>
          </form>
          {pwdMsg.testo && <p style={{ fontSize: '11px', color: colors[pwdMsg.tipo], marginTop: '5px', fontWeight: '600' }}>{pwdMsg.testo}</p>}
        </div>
      </div>

      <h2 style={{ color: colors.dark, fontWeight: '600', marginBottom: '20px' }}>Gestione Contenuti</h2>

      {/* TABELLA CONTENUTI */}
      <div style={{ background: colors.white, borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: colors.lightGray, borderBottom: `2px solid ${colors.border}` }}>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Titolo</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Data</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Visite</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {articoli.length > 0 ? (
              articoli.map(a => (
                <tr key={a.id} style={rowStyle}>
                  <td style={tdStyle}>
                    <span style={{ 
                      fontSize: '10px', padding: '3px 8px', borderRadius: '12px', 
                      background: a.tipo === 'SONDAGGIO' ? '#f3f0ff' : '#f1f3f5',
                      color: a.tipo === 'SONDAGGIO' ? colors.accent : '#495057',
                      fontWeight: 'bold', border: `1px solid ${a.tipo === 'SONDAGGIO' ? colors.accent : '#dee2e6'}`
                    }}>
                      {a.tipo === 'SONDAGGIO' ? '📊 POLL' : '📰 ART'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: '600', color: colors.dark, fontSize: '15px' }}>{a.titolo}</div>
                    <div style={{ fontSize: '11px', color: '#999' }}>ID #{a.id}</div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ fontSize: '14px' }}>{new Date(a.dataPubblicazione).toLocaleDateString('it-IT')}</div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: colors.primary }}>{a.visualizzazioni || 0}</span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button onClick={() => onEdit(a.id)} className="btn-modifica">Modifica</button>
                    <button onClick={() => elimina(a.id)} className="btn-elimina">Elimina</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                  Nessun contenuto trovato. Assicurati di aver effettuato il login correttamente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle = { padding: '15px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#6c757d', fontWeight: '700' };
const tdStyle = { padding: '18px 20px', borderBottom: '1px solid #f1f3f5' };
const rowStyle = { transition: 'background-color 0.2s ease' };
const inputStyle = { padding: '8px 10px', borderRadius: '4px', border: '1px solid #dee2e6', fontSize: '13px' };
const btnPwdStyle = (color) => ({ background: color, color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' });

export default DashboardEditore;