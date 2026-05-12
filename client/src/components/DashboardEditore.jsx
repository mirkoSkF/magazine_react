import React, { useState, useEffect } from 'react';
import GestioneSponsor from './GestioneSponsor'; // Assicurati che il file sia nella stessa cartella

const DashboardEditore = ({ onEdit }) => {
  const [articoli, setArticoli] = useState([]);
  const [utente, setUtente] = useState(null);
  
  // --- NUOVO STATO PER NAVIGAZIONE SPONSOR ---
  const [view, setView] = useState('CONTENUTI'); // Può essere 'CONTENUTI' o 'SPONSOR'

  // STATO PER LA RICERCA E PAGINAZIONE
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [pwdForm, setPwdForm] = useState({
    vecchiaPassword: '',
    nuovaPassword: ''
  });

  const [pwdMsg, setPwdMsg] = useState({
    testo: '',
    tipo: ''
  });

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

  // Reset della pagina quando si cerca
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const extractText = (item) => {
    if (!item.moduli) return item.contenuto || '';
    const textParts = item.moduli
      .filter((m) => m.tipo !== 'IMMAGINE')
      .map((m) => m.testo || '');
    const fullHtml = textParts.join(' ');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullHtml;
    return tempDiv.innerText || tempDiv.textContent || '';
  };

  const getAutore = (item) => {
    if (item.autoreNome) return `${item.autoreNome} ${item.autoreCognome || ''}`;
    if (item.utente) return `${item.utente.nome} ${item.utente.cognome}`;
    if (item.autore) return `${item.autore.nome} ${item.autore.cognome}`;
    return "Autore Sconosciuto";
  };

  const caricaDati = async () => {
    if (!token) return;
    try {
      const resUser = await fetch('http://localhost:8096/api/profilo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resUser.ok) {
        const dataUser = await resUser.json();
        setUtente(dataUser);
      }

      const resArt = await fetch('http://localhost:8096/api/pagine/mie', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resArt.ok) {
        const dataArt = await resArt.json();
        setArticoli(dataArt);
      }
    } catch (err) {
      console.error("Errore di connessione:", err);
    }
  };

  useEffect(() => {
    caricaDati();
  }, []);

  // LOGICA DI FILTRAGGIO
  const articoliFiltrati = articoli.filter(a => {
    const search = searchTerm.toLowerCase();
    const titolo = a.titolo?.toLowerCase() || '';
    const testoPulito = extractText(a).toLowerCase();
    const autore = getAutore(a).toLowerCase();
    const dataFormatted = new Date(a.dataPubblicazione).toLocaleDateString('it-IT');

    return (
      titolo.includes(search) || 
      testoPulito.includes(search) || 
      dataFormatted.includes(search) ||
      autore.includes(search)
    );
  });

  // --- LOGICA DI PAGINAZIONE ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = articoliFiltrati.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(articoliFiltrati.length / itemsPerPage);

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:8096/api/profilo/upload-foto', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) caricaDati();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCambiaPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8096/api/profilo/cambia-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
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
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) caricaDati();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'SONDAGGIO': return { text: 'POLL', background: colors.accent };
      case 'RUBRICA': return { text: 'RUB', background: '#17a2b8' };
      default: return { text: 'ART', background: '#6c757d' };
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        .dashboard-header { display: flex; gap: 20px; margin-bottom: 30px; align-items: stretch; }
        .btn-aggiorna { transition: all 0.3s ease; }
        .btn-aggiorna:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .btn-modifica { background: transparent; color: ${colors.primary}; border: 1px solid ${colors.primary}; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.25s ease; min-width: 90px; white-space: nowrap; }
        .btn-modifica:hover { background: ${colors.primary}; color: white; }
        .btn-elimina { background: transparent; color: ${colors.danger}; border: 1px solid ${colors.danger}; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.25s ease; min-width: 90px; white-space: nowrap; }
        .btn-elimina:hover { background: ${colors.danger}; color: white; }
        .table-wrapper { width: 100%; border-radius: 12px; border: 1px solid ${colors.border}; background: ${colors.white}; overflow: hidden; }
        .dashboard-table { width: 100%; border-collapse: collapse; }
        .dashboard-table tbody tr:hover { background: #fafafa; }
        .title-text { font-weight: 600; color: ${colors.dark}; font-size: 15px; line-height: 1.35; word-break: break-word; }
        .actions-cell { display: flex; justify-content: flex-end; align-items: center; gap: 10px; }
        .search-input { padding: 12px 15px; width: 100%; max-width: 400px; border-radius: 8px; border: 1px solid ${colors.border}; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: ${colors.primary}; }
        
        .pagination-controls { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px; }
        .btn-page { padding: 8px 16px; border-radius: 6px; border: 1px solid ${colors.border}; background: white; cursor: pointer; font-size: 14px; transition: all 0.2s; }
        .btn-page:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-page:not(:disabled):hover { background: ${colors.lightGray}; border-color: ${colors.primary}; }

        @media (max-width: 950px) { .dashboard-header { flex-direction: column; } .user-panel, .security-panel { width: 100% !important; } }
        @media (max-width: 768px) {
          .dashboard-table thead { display: none; }
          .dashboard-table tr { display: block; border-bottom: 1px solid #ececec; padding: 14px; }
          .dashboard-table td { display: block; border: none !important; padding: 8px 0 !important; text-align: left !important; }
          .actions-cell { justify-content: flex-start; }
          .search-input { max-width: 100%; }
        }
      `}</style>

      {/* HEADER: PROFILO E SICUREZZA */}
      <div className="dashboard-header">
        <div className="user-panel" style={{ flex: 2, display: 'flex', alignItems: 'center', background: colors.white, padding: '20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
          <div className="user-info-container" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {utente?.fotoProfilo ? (
              <img src={`data:image/jpeg;base64,${utente.fotoProfilo}`} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginRight: '20px' }} alt="Avatar" />
            ) : (
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ccc', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '24px' }}>
                {utente?.nome?.charAt(0)}{utente?.cognome?.charAt(0)}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, wordBreak: 'break-word' }}>{utente?.nome} {utente?.cognome}</h3>
              <p style={{ color: '#666', margin: '5px 0 12px 0', fontSize: '14px' }}>{utente?.ruolo}</p>
              <input type="file" onChange={handleFotoUpload} style={{ fontSize: '11px', maxWidth: '100%' }} />
            </div>
          </div>
        </div>

        <div className="security-panel" style={{ flex: 1, background: colors.white, padding: '20px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', textTransform: 'uppercase', color: colors.dark }}>Sicurezza</h4>
          <form onSubmit={handleCambiaPassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="password" placeholder="Vecchia password" value={pwdForm.vecchiaPassword} onChange={e => setPwdForm({...pwdForm, vecchiaPassword: e.target.value})} style={inputStyle} required />
            <input type="password" placeholder="Nuova password" value={pwdForm.nuovaPassword} onChange={e => setPwdForm({...pwdForm, nuovaPassword: e.target.value})} style={inputStyle} required />
            <button type="submit" className="btn-aggiorna" style={btnPwdStyle(colors.primary)}>Aggiorna</button>
          </form>
          {pwdMsg.testo && <p style={{ fontSize: '11px', color: colors[pwdMsg.tipo], marginTop: '8px', fontWeight: '600' }}>{pwdMsg.testo}</p>}
        </div>
      </div>

      {/* TITOLO E BARRA DI RICERCA / SWITCH SPONSOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px', gap: '15px' }}>
        <h2 style={{ color: colors.dark, fontWeight: '700', margin: 0 }}>
          {view === 'CONTENUTI' ? 'Gestione Contenuti' : 'Gestione Sponsor'}
        </h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
          {view === 'CONTENUTI' && (
            <input 
              type="text" 
              className="search-input" 
              placeholder="Cerca per titolo o data..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          )}
          
          <button 
            onClick={() => setView(view === 'CONTENUTI' ? 'SPONSOR' : 'CONTENUTI')}
            style={{ 
              background: view === 'CONTENUTI' ? colors.accent : colors.primary, 
              color: 'white', border: 'none', padding: '12px 20px', 
              borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {view === 'CONTENUTI' ? '📢 Gestisci Sponsor' : '📄 Torna ai Contenuti'}
          </button>
        </div>
      </div>

      {/* RENDER CONDIZIONALE: TABELLA O COMPONENTE SPONSOR */}
      {view === 'CONTENUTI' ? (
        <>
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr style={{ background: colors.lightGray, borderBottom: `2px solid ${colors.border}` }}>
                  <th style={{ ...thStyle, width: '90px' }}>Tipo</th>
                  <th style={thStyle}>Titolo</th>
                  <th style={{ ...thStyle, width: '120px', textAlign: 'center' }}>Data</th>
                  <th style={{ ...thStyle, width: '90px', textAlign: 'center' }}>Visite</th>
                  <th style={{ ...thStyle, width: '220px', textAlign: 'right' }}>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map(a => {
                    const badge = getTipoBadge(a.tipo);
                    return (
                      <tr key={a.id}>
                        <td style={tdStyle}>
                          <span style={{ fontSize: '10px', padding: '5px 10px', borderRadius: '5px', background: badge.background, color: colors.white, letterSpacing: '0.5px', fontWeight: 'bold' }}>
                            {badge.text}
                          </span>
                        </td>
                        <td style={tdStyle} className="title-cell">
                          <div className="title-text">{a.titolo}</div>
                          <div style={{ fontSize: '11px', color: '#999' }}>ID #{a.id} • {getAutore(a)}</div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          {new Date(a.dataPubblicazione).toLocaleDateString('it-IT')}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{ fontWeight: 'bold', color: colors.primary }}>{a.visualizzazioni || 0}</span>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <div className="actions-cell">
                            <button onClick={() => onEdit(a.id)} className="btn-modifica">Modifica</button>
                            <button onClick={() => elimina(a.id)} className="btn-elimina">Elimina</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                      {searchTerm ? "Nessun risultato trovato." : "Nessun contenuto disponibile."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* CONTROLLI PAGINAZIONE */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="btn-page"
              >
                Indietro
              </button>
              <span style={{ fontSize: '14px', color: colors.dark, fontWeight: '600' }}>
                Pagina {currentPage} di {totalPages}
              </span>
              <button 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="btn-page"
              >
                Avanti
              </button>
            </div>
          )}
        </>
      ) : (
        /* COMPONENTE GESTIONE SPONSOR */
        <GestioneSponsor colors={colors} />
      )}
    </div>
  );
};

const thStyle = { padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: '#6c757d', fontWeight: '700' };
const tdStyle = { padding: '18px 20px', borderBottom: '1px solid #f1f3f5', verticalAlign: 'middle' };
const inputStyle = { padding: '10px 12px', borderRadius: '6px', border: '1px solid #dee2e6', fontSize: '13px', width: '100%' };
const btnPwdStyle = (color) => ({ background: color, color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' });

export default DashboardEditore;