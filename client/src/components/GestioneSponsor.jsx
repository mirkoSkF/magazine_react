import React, { useState, useEffect, useRef } from 'react';

const GestioneSponsor = ({ colors }) => {
  const [sponsors, setSponsors] = useState([]);
  const [form, setForm] = useState({ 
    nomeAzienda: '', 
    linkSito: '', 
    tipoPagina: 'HOME', 
    posizione: 'SIDEBAR', 
    bannerImage: '', 
    attivo: true 
  });

  const [loading, setLoading] = useState(false);

  // --- STATO PER MODAL CUSTOM ---
  const [modal, setModal] = useState({ 
    show: false, 
    message: '', 
    type: 'alert', // 'alert' o 'confirm'
    onConfirm: null 
  });

  const customAlert = (msg) => {
    setModal({ show: true, message: msg, type: 'alert', onConfirm: null });
  };

  const customConfirm = (msg, action) => {
    setModal({ show: true, message: msg, type: 'confirm', onConfirm: action });
  };

  const fileInputRef = useRef(null);
  const token = localStorage.getItem('token');

  const caricaSponsors = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8096/api/sponsors', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const normalized = data.map(s => ({
          ...s,
          clickCount: Number(s.clickCount || s.clicks || 0)
        }));
        setSponsors(normalized);
      } else if (res.status === 403) {
        console.error("Errore 403: Permessi insufficienti o token scaduto.");
      }
    } catch (err) {
      console.error("Errore durante il recupero degli sponsor:", err);
    }
  };

  useEffect(() => { 
    caricaSponsors(); 
    const interval = setInterval(caricaSponsors, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, bannerImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const homeSidebarCount = sponsors.filter(s => s.attivo && s.tipoPagina === 'HOME' && s.posizione === 'SIDEBAR').length;
  const homeBottomCount = sponsors.filter(s => s.attivo && s.tipoPagina === 'HOME' && s.posizione === 'BOTTOM').length;
  const articoloBottomCount = sponsors.filter(s => s.attivo && s.tipoPagina === 'ARTICOLO' && s.posizione === 'BOTTOM').length;

  const isLimitReached = (() => {
    if (form.tipoPagina === 'HOME' && form.posizione === 'SIDEBAR' && homeSidebarCount >= 3) return true;
    if (form.tipoPagina === 'HOME' && form.posizione === 'BOTTOM' && homeBottomCount >= 2) return true;
    if (form.tipoPagina === 'ARTICOLO' && articoloBottomCount >= 2) return true;
    return false;
  })();

  const getLimitMessage = () => {
    if (form.tipoPagina === 'HOME' && form.posizione === 'SIDEBAR' && homeSidebarCount >= 3) return 'Limite raggiunto: massimo 3 banner laterali nella Home.';
    if (form.tipoPagina === 'HOME' && form.posizione === 'BOTTOM' && homeBottomCount >= 2) return 'Limite raggiunto: massimo 2 banner inferiori nella Home.';
    if (form.tipoPagina === 'ARTICOLO' && articoloBottomCount >= 2) return 'Limite raggiunto: massimo 2 banner inferiori nella Pagina Articolo.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || isLimitReached) return;
    if (!form.bannerImage || form.bannerImage.trim() === '') {
      return customAlert("Per favore, carica un'immagine per il banner.");
    }

    setLoading(true);
    try {
      const payload = { ...form, posizione: form.tipoPagina === 'ARTICOLO' ? 'BOTTOM' : form.posizione };
      const res = await fetch('http://localhost:8096/api/sponsors', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const nuovoSponsor = await res.json().catch(() => null);
        customAlert("Sponsor aggiunto con successo!");
        if (nuovoSponsor) {
          setSponsors(prev => [...prev, { ...nuovoSponsor, clickCount: Number(nuovoSponsor.clickCount || nuovoSponsor.clicks || 0) }]);
        } else {
          await caricaSponsors();
        }
        setForm({ nomeAzienda: '', linkSito: '', tipoPagina: 'HOME', posizione: 'SIDEBAR', bannerImage: '', attivo: true });
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error("Errore nel salvataggio:", err);
    } finally {
      setLoading(false);
    }
  };

  const eliminaSponsor = (id) => {
    customConfirm("Sei sicuro di voler rimuovere questo sponsor?", async () => {
      try {
        const res = await fetch(`http://localhost:8096/api/sponsors/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setSponsors(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        console.error("Errore durante l'eliminazione:", err);
      }
    });
  };

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: `1px solid ${colors.border}`, marginTop: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.05)', position: 'relative' }}>
      
      {/* --- MODAL RENDERING RAFFINATO --- */}
      {modal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '35px', borderRadius: '20px', maxWidth: '420px', width: '90%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', animation: 'modalFadeIn 0.3s ease' }}>
            
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              {modal.type === 'alert' ? (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              ) : (
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              )}
            </div>

            <p style={{ fontSize: '18px', fontWeight: '600', color: colors.dark, marginBottom: '30px', lineHeight: '1.4' }}>
              {modal.message}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {modal.type === 'confirm' && (
                <button 
                  onClick={() => setModal({ ...modal, show: false })} 
                  style={{ padding: '12px 24px', borderRadius: '10px', border: `1px solid ${colors.border}`, background: '#f8f9fa', color: '#666', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.3s ease' }}
                  onMouseOver={(e) => { e.target.style.background = '#e9ecef'; e.target.style.borderColor = '#adb5bd'; }}
                  onMouseOut={(e) => { e.target.style.background = '#f8f9fa'; e.target.style.borderColor = colors.border; }}>
                  Annulla
                </button>
              )}
              <button 
                onClick={() => { if(modal.onConfirm) modal.onConfirm(); setModal({ ...modal, show: false }); }} 
                style={{ padding: '12px 30px', borderRadius: '10px', border: 'none', background: modal.type === 'confirm' ? colors.danger : colors.primary, color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.3s ease' }}
                onMouseOver={(e) => { e.target.style.transform = 'scale(1.05)'; e.target.style.filter = 'brightness(1.1)'; }}
                onMouseOut={(e) => { e.target.style.transform = 'scale(1)'; e.target.style.filter = 'brightness(1)'; }}>
                {modal.type === 'confirm' ? 'Sì, Rimuovi' : 'Ho capito'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .sponsor-btn { transition: all 0.25s ease; }
        .sponsor-btn:hover { transform: translateY(-2px); filter: brightness(1.05); box-shadow: 0 8px 18px rgba(0,0,0,0.12); }
        
        /* HOVER ELEGANTE BOTTONE RIMUOVI */
        .danger-btn { 
          padding: 6px 12px; 
          border-radius: 6px; 
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .danger-btn:hover { 
          color: white !important; 
          background: ${colors.danger} !important; 
          box-shadow: 0 4px 10px rgba(220, 53, 69, 0.3);
          transform: scale(1.05);
        }

        .table-row:hover { background: rgba(0,0,0,0.025); }
        .disabled-btn { opacity: 0.45; cursor: not-allowed !important; transform: none !important; }
      `}</style>

      <h3 style={{ marginTop: 0, color: colors.dark, borderBottom: `2px solid ${colors.primary}`, paddingBottom: '10px' }}>📢 Gestione Banner Pubblicitari</h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px', background: colors.lightGray, padding: '20px', borderRadius: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={labelStyle}>Nome Azienda</label>
            <input type="text" value={form.nomeAzienda} onChange={e => setForm({ ...form, nomeAzienda: e.target.value })} required style={inputStyle} placeholder="Es: Pizzeria da Ciro" />
          </div>
          <div>
            <label style={labelStyle}>Link Sito Web</label>
            <input type="url" value={form.linkSito} onChange={e => setForm({ ...form, linkSito: e.target.value })} required style={inputStyle} placeholder="https://..." />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: form.tipoPagina === 'HOME' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '15px', alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Destinazione</label>
            <select value={form.tipoPagina} onChange={e => setForm({ ...form, tipoPagina: e.target.value, posizione: e.target.value === 'ARTICOLO' ? 'BOTTOM' : 'SIDEBAR' })} style={inputStyle}>
              <option value="HOME">Home Page</option>
              <option value="ARTICOLO">Pagina Articolo</option>
            </select>
          </div>
          {form.tipoPagina === 'HOME' && (
            <div>
              <label style={labelStyle}>Posizione</label>
              <select value={form.posizione} onChange={e => setForm({ ...form, posizione: e.target.value })} style={inputStyle}>
                <option value="SIDEBAR">Laterale (Sidebar)</option>
                <option value="BOTTOM">In basso (Footer/Bottom)</option>
              </select>
            </div>
          )}
          <div>
            <label style={labelStyle}>Banner (Immagine)</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '12px', width: '100%' }} />
          </div>
        </div>

        {isLimitReached && (
          <div style={{ background: '#fff3cd', border: '1px solid #ffe69c', color: '#856404', padding: '12px 15px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
            ⚠️ {getLimitMessage()}
          </div>
        )}

        <button type="submit" disabled={isLimitReached || loading} className={`sponsor-btn ${isLimitReached ? 'disabled-btn' : ''}`}
          style={{ background: isLimitReached ? '#b5b5b5' : colors.success, color: 'white', border: 'none', padding: '14px', borderRadius: '8px', cursor: isLimitReached ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>
          {loading ? 'Caricamento...' : '+ AGGIUNGI SPONSOR NELL\'ELENCO'}
        </button>
      </form>

      <div className="table-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: colors.dark, color: 'white' }}>
              <th style={thStyle}>Azienda</th>
              <th style={thStyle}>Target</th>
              <th style={thStyle}>Posizione</th>
              <th style={thStyle}>Click</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {sponsors.length > 0 ? (
              sponsors.map(s => (
                <tr key={s.id} className="table-row" style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={tdStyle}>
                    <strong>{s.nomeAzienda}</strong><br />
                    <small style={{ color: colors.primary }}>{s.linkSito}</small>
                  </td>
                  <td style={tdStyle}>{s.tipoPagina}</td>
                  <td style={tdStyle}>{s.posizione}</td>
                  <td style={tdStyle}>
                    <span style={{ background: colors.primary, color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                      {Number(s.clickCount || 0)}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button onClick={() => eliminaSponsor(s.id)} className="danger-btn sponsor-btn"
                      style={{ background: 'none', border: 'none', color: colors.danger, cursor: 'pointer', fontWeight: 'bold' }}>
                      Rimuovi
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" style={{ padding: '25px', textAlign: 'center', color: '#999' }}>Nessun sponsor configurato.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#555' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' };
const thStyle = { padding: '14px', textAlign: 'left', fontSize: '13px' };
const tdStyle = { padding: '14px', fontSize: '14px' };

export default GestioneSponsor;