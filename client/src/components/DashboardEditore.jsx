import React, { useState, useEffect } from 'react';
// UNICA AGGIUNTA: Import del componente Sponsor
import GestioneSponsor from './GestioneSponsor';

// --- COMPONENTE PRINCIPALE DASHBOARD ---
const DashboardEditore = ({ onEdit }) => {
  const [articoli, setArticoli] = useState([]);
  const [utente, setUtente] = useState(null);
  const [pwdForm, setPwdForm] = useState({ vecchiaPassword: '', nuovaPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ testo: '', tipo: '' });

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
    if (!token) return;
    try {
      const resUser = await fetch('http://localhost:8096/api/profilo', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (resUser.ok) {
        const dataUser = await resUser.json();
        setUtente(dataUser);
      }
      const resArt = await fetch('http://localhost:8096/api/pagine/mie', { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      if (resArt.ok) {
        const dataArt = await resArt.json();
        setArticoli(dataArt);
      }
    } catch (err) { 
      console.error("Errore di connessione:", err); 
    }
  };

  useEffect(() => { caricaDati(); }, []);

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
    } catch (err) { console.error(err); }
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
    } catch (err) { setPwdMsg({ testo: "Errore connessione", tipo: 'danger' }); }
  };

  const elimina = async (id) => {
    if (window.confirm("Eliminare definitivamente questo contenuto?")) {
      try {
        const res = await fetch(`http://localhost:8096/api/pagine/${id}`, { 
          method: 'DELETE', 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (res.ok) caricaDati();
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      <style>
        {`
          .dashboard-header { display: flex; gap: 20px; margin-bottom: 30px; }
          .btn-aggiorna { transition: all 0.3s ease; }
          .btn-aggiorna:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          .btn-aggiorna:active { transform: translateY(0); }
          .btn-modifica { background: transparent; color: ${colors.primary}; border: 1px solid ${colors.primary}; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.3s ease; }
          .btn-modifica:hover { background: ${colors.primary}; color: white; }
          .btn-elimina { background: transparent; color: ${colors.danger}; border: 1px solid ${colors.danger}; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.3s ease; margin-left: 10px; }
          .btn-elimina:hover { background: ${colors.danger}; color: white; }
          .table-responsive { width: 100%; overflow-x: auto; background: ${colors.white}; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid ${colors.border}; margin-bottom: 40px; }
          .actions-cell { display: flex; justify-content: flex-end; align-items: center; gap: 10px; }
          @media (max-width: 900px) {
            .dashboard-header { flex-direction: column; }
            .user-panel, .security-panel { flex: none !important; width: 100% !important; box-sizing: border-box; }
            .actions-cell { flex-direction: column; gap: 8px; align-items: flex-end; }
            .btn-elimina { margin-left: 0; }
          }
          @media (max-width: 600px) {
            .user-info-container { flex-direction: column; text-align: center; }
            .user-info-container img, .user-info-container .placeholder-avatar { margin-right: 0 !important; margin-bottom: 15px; }
            .dashboard-container { padding: 10px !important; }
            th, td { padding: 10px !important; font-size: 13px; }
          }
        `}
      </style>

      {/* PANNELLO UTENTE */}
      <div className="dashboard-header">
        <div className="user-panel" style={{ flex: 2, display: 'flex', alignItems: 'center', background: colors.white, padding: '20px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
          <div className="user-info-container" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {utente?.fotoProfilo ? (
              <img src={`data:image/jpeg;base64,${utente.fotoProfilo}`} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginRight: '20px' }} alt="Avatar" />
            ) : (
              <div className="placeholder-avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ccc', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                {utente?.nome?.charAt(0)}{utente?.cognome?.charAt(0)}
              </div>
            )}
            <div>
              <h3 style={{ margin: 0 }}>{utente?.nome} {utente?.cognome}</h3>
              <p style={{ color: '#666', margin: '5px 0', fontSize: '14px' }}>{utente?.ruolo}</p>
              <input type="file" onChange={handleFotoUpload} style={{ fontSize: '11px', maxWidth: '100%' }} />
            </div>
          </div>
        </div>

        <div className="security-panel" style={{ flex: 1, background: colors.white, padding: '20px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', textTransform: 'uppercase', color: colors.dark }}>Sicurezza</h4>
          <form onSubmit={handleCambiaPassword} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input type="password" placeholder="Vecchia password" value={pwdForm.vecchiaPassword} onChange={e => setPwdForm({...pwdForm, vecchiaPassword: e.target.value})} style={inputStyle} required />
            <input type="password" placeholder="Nuova password" value={pwdForm.nuovaPassword} onChange={e => setPwdForm({...pwdForm, nuovaPassword: e.target.value})} style={inputStyle} required />
            <button type="submit" className="btn-aggiorna" style={btnPwdStyle(colors.primary)}>Aggiorna</button>
          </form>
          {pwdMsg.testo && <p style={{ fontSize: '11px', color: colors[pwdMsg.tipo], marginTop: '5px', fontWeight: '600' }}>{pwdMsg.testo}</p>}
        </div>
      </div>

      <h2 style={{ color: colors.dark, fontWeight: '600', marginBottom: '20px' }}>Gestione Contenuti</h2>

      <div className="table-responsive">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
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
                      fontSize: '10px', padding: '4px 10px', borderRadius: '4px', 
                      background: a.tipo === 'SONDAGGIO' ? colors.accent : '#6c757d',
                      color: colors.white,
                      letterSpacing: '0.5px',
                      fontWeight: 'bold'
                    }}>
                      {a.tipo === 'SONDAGGIO' ? 'POLL' : 'ART'}
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
                  <td className="actions-cell" style={{ ...tdStyle, textAlign: 'right' }}>
                    <button onClick={() => onEdit(a.id)} className="btn-modifica">Modifica</button>
                    <button onClick={() => elimina(a.id)} className="btn-elimina">Elimina</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>Nessun contenuto trovato.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* AGGIUNTA: Richiamo del componente Sponsor passandogli i colori */}
      <GestioneSponsor colors={colors} />

    </div>
  );
};

const thStyle = { padding: '15px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#6c757d', fontWeight: '700' };
const tdStyle = { padding: '18px 20px', borderBottom: '1px solid #f1f3f5' };
const rowStyle = { transition: 'background-color 0.2s ease' };
const inputStyle = { padding: '8px 10px', borderRadius: '4px', border: '1px solid #dee2e6', fontSize: '13px' };
const btnPwdStyle = (color) => ({ background: color, color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' });

export default DashboardEditore;