import React, { useState, useEffect, useMemo } from 'react';
import GestioneSponsor from './GestioneSponsor';
import DashboardStats from './DashboardStats'; 
import CalendarioTeams from './CalendarioTeams'; 

const DashboardEditore = ({ onEdit }) => {
  const [articoli, setArticoli] = useState([]);
  const [utente, setUtente] = useState(null);
  
  // view può essere: 'CONTENUTI', 'SPONSOR', 'STATS', 'CALENDARIO'
  const [view, setView] = useState('CONTENUTI'); 

  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('TUTTI'); // TUTTI, ARTICOLO, RUBRICA, SONDAGGIO, EVENTO
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [pwdForm, setPwdForm] = useState({
    vecchiaPassword: '',
    nuovaPassword: ''
  });

  // Gestione visibilità password con icone standard
  const [showVecchia, setShowVecchia] = useState(false);
  const [showNuova, setShowNuova] = useState(false);

  const [pwdMsg, setPwdMsg] = useState({
    testo: '',
    tipo: ''
  });

  const [modal, setModal] = useState({
    show: false,
    message: '',
    type: 'confirm', 
    onConfirm: null
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, tipoFiltro]);

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
      const resUser = await fetch('https://magazine.skillfactory.it/api/profilo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resUser.ok) {
        const dataUser = await resUser.json();
        setUtente(dataUser);
      }

      const resArt = await fetch('https://magazine.skillfactory.it/api/pagine/mie', {
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

  const articoliFiltratiRisultato = useMemo(() => {
    const filtrati = articoli.filter(a => {
      if (tipoFiltro !== 'TUTTI') {
        const tipoElemento = a.tipo || 'ARTICOLO';
        if (tipoElemento !== tipoFiltro) return false;
      }

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

    return filtrati.sort((a, b) => {
      return new Date(b.dataPubblicazione) - new Date(a.dataPubblicazione);
    });
  }, [articoli, searchTerm, tipoFiltro]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = articoliFiltratiRisultato.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(articoliFiltratiRisultato.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [articoliFiltratiRisultato, totalPages, currentPage]);

  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('https://magazine.skillfactory.it/api/profilo/upload-foto', {
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
      const res = await fetch('https://magazine.skillfactory.it/api/profilo/cambia-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pwdForm)
      });
      if (res.ok) {
        setModal({
          show: true,
          message: "Password aggiornata con successo!",
          type: 'success'
        });
        setPwdForm({ vecchiaPassword: '', nuovaPassword: '' });
      } else {
        setPwdMsg({ testo: "Errore: vecchia password errata", tipo: 'danger' });
      }
    } catch (err) {
      setPwdMsg({ testo: "Errore connessione", tipo: 'danger' });
    }
  };

  const eseguiElimina = async (id) => {
    try {
      const res = await fetch(`https://magazine.skillfactory.it/api/pagine/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        caricaDati();
        setModal({ show: true, message: "Contenuto eliminato definitivamente.", type: 'success' });
      }
    } catch (err) {
      console.error(err);
      setModal({ show: true, message: "Errore durante l'eliminazione.", type: 'error' });
    }
  };

  const elimina = (id) => {
    setModal({
      show: true,
      message: "Sei sicuro di voler eliminare definitivamente questo contenuto? L'azione non è reversibile.",
      type: 'confirm',
      onConfirm: () => eseguiElimina(id)
    });
  };

  const eseguiPubblicaContenuto = async (id) => {
    try {
      const res = await fetch(`https://magazine.skillfactory.it/api/pagine/${id}/pubblica`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        caricaDati();
        setModal({ show: true, message: "Contenuto pubblicato con successo!", type: 'success' });
      } else {
        setModal({ show: true, message: "Impossibile pubblicare il contenuto.", type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setModal({ show: true, message: "Errore di connessione.", type: 'error' });
    }
  };

  // Logica per differenziare il messaggio del modale a seconda del tipo di contenuto
  const pubblicaContenuto = (articolo) => {
    const messaggio = articolo.tipo === 'EVENTO'
      ? "Vuoi pubblicare questo evento? Nota: l'evento pubblicato sarà raggiungibile attraverso il campo 'Eventi' della navbar in modalità utente."
      : "Vuoi pubblicare questo articolo nella Home del magazine? Nota: effettuando modifiche successive, l'articolo tornerà in modalità bozza e verrà temporaneamente rimosso dalla Home.";

    setModal({
      show: true,
      message: messaggio,
      type: 'confirm',
      onConfirm: () => eseguiPubblicaContenuto(articolo.id)
    });
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'SONDAGGIO': return { text: 'POLL', background: colors.accent };
      case 'RUBRICA': return { text: 'RUB', background: '#17a2b8' };
      case 'EVENTO': return { text: 'EVNT', background: '#fd7e14' };
      default: return { text: 'ART', background: '#6c757d' };
    }
  };

  return (
    <div className="dashboard-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* MODALE */}
      {modal.show && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: 'white', padding: '40px', borderRadius: '20px',
            maxWidth: '450px', width: '90%', textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: 'none'
          }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>
              {modal.type === 'success' ? '✅' : modal.type === 'error' ? '❌' : '⚠️'}
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: colors.dark, marginBottom: '15px' }}>
              {modal.type === 'confirm' ? 'Conferma Operazione' : 'Notifica'}
            </h3>
            <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.5', marginBottom: '30px' }}>
              {modal.message}
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              {modal.type === 'confirm' ? (
                <>
                  <button 
                    onClick={() => setModal({ ...modal, show: false })}
                    className="btn-aggiorna"
                    style={{ ...btnBaseModal, background: '#e9ecef', color: '#333' }}
                  > Annulla </button>
                  <button 
                    onClick={() => { modal.onConfirm(); setModal({ ...modal, show: false }); }}
                    className="btn-aggiorna"
                    style={{ 
                      ...btnBaseModal, 
                      background: modal.message.includes("eliminare") ? colors.danger : colors.success, 
                      color: 'white' 
                    }}
                  > Conferma </button>
                </>
              ) : (
                <button 
                  onClick={() => setModal({ ...modal, show: false })}
                  className="btn-aggiorna"
                  style={{ ...btnBaseModal, background: colors.primary, color: 'white' }}
                > Chiudi </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        .dashboard-header { display: flex; gap: 20px; margin-bottom: 30px; align-items: stretch; }
        .btn-aggiorna { transition: all 0.3s ease; border: none; cursor: pointer; }
        .btn-aggiorna:hover { filter: brightness(1.1); transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
        
        .btn-modifica { background: transparent; color: ${colors.primary}; border: 1px solid ${colors.primary}; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.25s ease; white-space: nowrap; }
        .btn-modifica:hover { background: ${colors.primary}; color: white; transform: translateY(-1px); }
        .btn-elimina { background: transparent; color: ${colors.danger}; border: 1px solid ${colors.danger}; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.25s ease; white-space: nowrap; }
        .btn-elimina:hover { background: ${colors.danger}; color: white; transform: translateY(-1px); }
        .btn-pubblica { background: transparent; color: ${colors.success}; border: 1px solid ${colors.success}; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.25s ease; white-space: nowrap; }
        .btn-pubblica:hover { background: ${colors.success}; color: white; transform: translateY(-1px); }
        
        .table-wrapper { width: 100%; border-radius: 12px; border: 1px solid ${colors.border}; background: ${colors.white}; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; }
        .dashboard-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .dashboard-table tbody tr:hover { background: #fafafa; }
        
        .title-cell { width: auto; }
        .title-text { font-weight: 600; color: ${colors.dark}; font-size: 14px; line-height: 1.4; word-break: break-word; overflow-wrap: break-word; }
        
        .actions-cell { display: flex; justify-content: flex-end; align-items: center; gap: 6px; flex-wrap: nowrap; }
        
        .search-input { padding: 12px 15px; width: 100%; max-width: 400px; border-radius: 8px; border: 1px solid ${colors.border}; font-size: 14px; outline: none; transition: all 0.3s ease; text-align: left; }
        .search-input:focus { border-color: ${colors.primary}; box-shadow: 0 0 0 3px rgba(0,123,255,0.1); }
        
        .filter-select { padding: 12px 15px; width: 100%; max-width: 400px; border-radius: 8px; border: 1px solid ${colors.border}; font-size: 14px; outline: none; transition: all 0.3s ease; background-color: ${colors.white}; cursor: pointer; color: ${colors.dark}; }
        .filter-select:focus { border-color: ${colors.primary}; box-shadow: 0 0 0 3px rgba(0,123,255,0.1); }

        .pagination-controls { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px; }
        .btn-page { padding: 8px 16px; border-radius: 6px; border: 1px solid ${colors.border}; background: white; cursor: pointer; font-size: 14px; transition: all 0.2s; }
        .btn-page:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-page:not(:disabled):hover { background: ${colors.lightGray}; border-color: ${colors.primary}; }

        .btn-view-switch {
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
          flex: 0 0 auto;
          font-size: 14px;
        }

        .btn-view-sponsor { background-color: ${colors.accent}; color: white; }
        .btn-view-sponsor:hover { background-color: #5a32a3; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(111, 66, 193, 0.3); }
        .btn-view-contenuti { background-color: ${colors.primary}; color: white; }
        .btn-view-contenuti:hover { background-color: #0056b3; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3); }
        .btn-view-stats { background-color: #fd7e14; color: white; }
        .btn-view-stats:hover { background-color: #e8590c; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(253, 126, 20, 0.3); }
        .btn-view-calendar { background-color: #00b5ad; color: white; }
        .btn-view-calendar:hover { background-color: #009c95; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0, 181, 173, 0.3); }

        .controls-block-container { display: flex; flex-direction: column; gap: 15px; align-items: flex-end; text-align: right; width: 100%; margin-bottom: 25px; }
        .buttons-horizontal-row { display: flex; gap: 10px; align-items: center; justify-content: flex-end; width: auto; flex-wrap: nowrap; }

        @media (max-width: 950px) { 
          .dashboard-header { flex-direction: column; } 
          .user-panel, .security-panel { width: 100% !important; } 
        }
        
        @media (max-width: 900px) {
          .table-wrapper { border: none; background: transparent; box-shadow: none; }
          .dashboard-table, .dashboard-table thead, .dashboard-table tbody, .dashboard-table th, .dashboard-table td, .dashboard-table tr { 
            display: block; 
          }
          .dashboard-table thead { display: none; }
          
          .dashboard-table tbody tr {
            background: ${colors.white};
            border: 1px solid ${colors.border};
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 15px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.04);
          }
          
          .dashboard-table td {
            padding: 8px 0;
            border-bottom: none;
            text-align: left !important;
            width: 100% !important;
          }
          
          .dashboard-table td.data-cell::before {
            content: "Data: ";
            font-weight: bold;
            color: #6c757d;
          }
          .dashboard-table td.visite-cell::before {
            content: "Visite: ";
            font-weight: bold;
            color: #6c757d;
          }
          
          .actions-cell {
            justify-content: flex-start;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
            border-top: 1px solid #f1f3f5;
            padding-top: 12px;
          }
          .btn-modifica, .btn-elimina, .btn-pubblica {
            flex: 1 1 calc(33.33% - 8px);
            min-width: 80px;
            text-align: center;
          }
        }

        @media (max-width: 576px) {
          .btn-view-switch {
            padding: 10px 12px;
            font-size: 12px;
            gap: 4px;
          }
          .search-input, .filter-select { max-width: 100%; }
          .buttons-horizontal-row { width: 100%; justify-content: space-between; }
          .controls-block-container { align-items: stretch; text-align: left; }
          .btn-modifica, .btn-elimina, .btn-pubblica {
            flex: 1 1 100%;
          }
        }
      `}</style>

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
            
            {/* Input Vecchia Password */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type={showVecchia ? "text" : "password"} 
                placeholder="Vecchia password" 
                value={pwdForm.vecchiaPassword} 
                onChange={e => setPwdForm({...pwdForm, vecchiaPassword: e.target.value})} 
                style={{ ...inputStyle, paddingRight: pwdForm.vecchiaPassword ? '55px' : '35px' }} 
                required 
              />
              {pwdForm.vecchiaPassword && (
                <span 
                  onClick={() => setPwdForm({...pwdForm, vecchiaPassword: ''})} 
                  style={{ position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#999', fontSize: '14px', userSelect: 'none' }}
                >
                  ✕
                </span>
              )}
              <span 
                onClick={() => setShowVecchia(!showVecchia)} 
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.4'}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '14px', userSelect: 'none', color: '#666', opacity: '0.4', transition: 'opacity 0.2s ease' }}
              >
                {showVecchia ? '👁️‍🗨️' : '👁'}
              </span>
            </div>

            {/* Input Nuova Password */}
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type={showNuova ? "text" : "password"} 
                placeholder="Nuova password" 
                value={pwdForm.nuovaPassword} 
                onChange={e => setPwdForm({...pwdForm, nuovaPassword: e.target.value})} 
                style={{ ...inputStyle, paddingRight: pwdForm.nuovaPassword ? '55px' : '35px' }} 
                required 
              />
              {pwdForm.nuovaPassword && (
                <span 
                  onClick={() => setPwdForm({...pwdForm, nuovaPassword: ''})} 
                  style={{ position: 'absolute', right: '35px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#999', fontSize: '14px', userSelect: 'none' }}
                >
                  ✕
                </span>
              )}
              <span 
                onClick={() => setShowNuova(!showNuova)} 
                onMouseEnter={(e) => e.target.style.opacity = '1'}
                onMouseLeave={(e) => e.target.style.opacity = '0.4'}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '14px', userSelect: 'none', color: '#666', opacity: '0.4', transition: 'opacity 0.2s ease' }}
              >
                {showNuova ? '👁️‍🗨️' : '👁'}
              </span>
            </div>

            <input type="submit" className="btn-aggiorna" style={btnPwdStyle(colors.primary)} value="Aggiorna" />
          </form>
          {pwdMsg.testo && <p style={{ fontSize: '11px', color: colors[pwdMsg.tipo], marginTop: '8px', fontWeight: '600' }}>{pwdMsg.testo}</p>}
        </div>
      </div>

      {/* Intestazione e Comandi */}
      <div className="controls-block-container">
        <h2 style={{ color: colors.dark, fontWeight: '700', margin: 0 }}>
          {view === 'CONTENUTI' ? 'Gestione Contenuti' : view === 'SPONSOR' ? 'Gestione Sponsor' : view === 'STATS' ? 'Report Statistiche' : 'Calendario Editoriale'}
        </h2>
        
        {view === 'CONTENUTI' && (
          <input 
            type="text" 
            className="search-input" 
            placeholder="Cerca per titolo o data..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        )}
        
        <div className="buttons-horizontal-row">
          {view === 'CONTENUTI' ? (
            <button 
              onClick={() => setView('STATS')}
              className="btn-view-switch btn-view-stats"
            >
              📊 Statistiche
            </button>
          ) : view === 'STATS' && (
            <button 
              onClick={() => setView('CONTENUTI')}
              className="btn-view-switch btn-view-contenuti"
            >
              📄 Torna ai Contenuti
            </button>
          )}
          
          {view === 'CONTENUTI' ? (
            <button 
              onClick={() => setView('CALENDARIO')}
              className="btn-view-switch btn-view-calendar"
            >
              📅 Calendario
            </button>
          ) : view === 'CALENDARIO' && (
            <button 
              onClick={() => setView('CONTENUTI')}
              className="btn-view-switch btn-view-contenuti"
            >
              📄 Torna ai Contenuti
            </button>
          )}
          
          {(view === 'CONTENUTI' || view === 'SPONSOR') && (
            <button 
              onClick={() => setView(view === 'CONTENUTI' ? 'SPONSOR' : 'CONTENUTI')}
              className={`btn-view-switch ${view === 'CONTENUTI' ? 'btn-view-sponsor' : 'btn-view-contenuti'}`}
            >
              {view === 'CONTENUTI' ? '📢 Sponsor' : '📄 Torna ai Contenuti'}
            </button>
          )}
        </div>

        {view === 'CONTENUTI' && (
          <select 
            className="filter-select"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            <option value="TUTTI">📋 Tutte le pubblicazioni</option>
            <option value="ARTICOLO">📰 Solo Articoli</option>
            <option value="RUBRICA">📚 Solo Rubriche</option>
            <option value="SONDAGGIO">📊 Solo Sondaggi</option>
            <option value="EVENTO">📅 Solo Eventi</option>
          </select>
        )}
      </div>

      {view === 'CONTENUTI' ? (
        <>
          <div className="table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr style={{ background: colors.lightGray, borderBottom: `2px solid ${colors.border}` }}>
                  <th style={{ ...thStyle, width: '75px' }}>Tipo</th>
                  <th style={thStyle}>Titolo</th>
                  <th style={{ ...thStyle, width: '110px', textRight: 'center' }}>Data</th>
                  <th style={{ ...thStyle, width: '70px', textAlign: 'center' }}>Visite</th>
                  <th style={{ ...thStyle, width: '250px', textAlign: 'right' }}>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map(a => {
                    const badge = getTipoBadge(a.tipo);
                    return (
                      <tr key={a.id}>
                        <td style={{ ...tdStyle, width: '75px' }}>
                          <span style={{ fontSize: '10px', padding: '5px 10px', borderRadius: '5px', background: badge.background, color: colors.white, letterSpacing: '0.5px', fontWeight: 'bold' }}>
                            {badge.text}
                          </span>
                        </td>
                        <td style={tdStyle} className="title-cell">
                          <div className="title-text">{a.titolo}</div>
                          <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>ID #{a.id} • {getAutore(a)} {a.bozza && <span style={{ color: colors.danger, fontWeight: 'bold', marginLeft: '5px' }}>(Bozza)</span>}</div>
                        </td>
                        <td style={{ ...tdStyle, width: '110px', textAlign: 'center' }} className="data-cell">
                          {new Date(a.dataPubblicazione).toLocaleDateString('it-IT')}
                        </td>
                        <td style={{ ...tdStyle, width: '70px', textAlign: 'center' }} className="visite-cell">
                          <span style={{ fontWeight: 'bold', color: colors.primary }}>{a.visualizzazioni || 0}</span>
                        </td>
                        <td style={{ ...tdStyle, width: '250px' }}>
                          <div className="actions-cell">
                            {a.bozza && (
                              <button onClick={() => pubblicaContenuto(a)} className="btn-pubblica">Pubblica</button>
                            )}
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
                      {searchTerm || tipoFiltro !== 'TUTTI' ? "Nessun risultato trovato." : "Nessun contenuto disponibile."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
      ) : view === 'SPONSOR' ? (
        <GestioneSponsor colors={colors} />
      ) : view === 'STATS' ? (
        <DashboardStats colors={colors} />
      ) : (
        <CalendarioTeams colors={colors} />
      )}
    </div>
  );
};

// Stili standard esterni definiti correttamente
const thStyle = { padding: '16px 15px', fontSize: '11px', textTransform: 'uppercase', color: '#6c757d', fontWeight: '700' };
const tdStyle = { padding: '15px 15px', borderBottom: '1px solid #f1f3f5', verticalAlign: 'middle' };
const inputStyle = { padding: '10px 12px', borderRadius: '6px', border: '1px solid #dee2e6', fontSize: '13px', width: '100%' };
const btnPwdStyle = (color) => ({ background: color, color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.3s ease' });

const btnBaseModal = {
  padding: '12px 25px',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontWeight: '700',
  fontSize: '14px',
  transition: 'all 0.3s ease'
};

export default DashboardEditore;
