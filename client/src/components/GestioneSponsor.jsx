import React, { useState, useEffect } from 'react';

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
  
  const token = localStorage.getItem('token');

  // 1. CARICAMENTO ELENCO
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
        setSponsors(data);
      } else if (res.status === 403) {
        console.error("Errore 403: Permessi insufficienti o token scaduto.");
      }
    } catch (err) {
      console.error("Errore durante il recupero degli sponsor:", err);
    }
  };

  useEffect(() => { 
    caricaSponsors(); 
    // Opzionale: ricarica ogni 30 secondi per vedere i nuovi click in tempo reale
    const interval = setInterval(caricaSponsors, 30000);
    return () => clearInterval(interval);
  }, []);

  // 2. GESTIONE UPLOAD IMMAGINE
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, bannerImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. SALVATAGGIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bannerImage) return alert("Per favore, carica un'immagine per il banner.");
    
    try {
      const res = await fetch('http://localhost:8096/api/sponsors', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        alert("Sponsor aggiunto con successo!");
        setForm({ nomeAzienda: '', linkSito: '', tipoPagina: 'HOME', posizione: 'SIDEBAR', bannerImage: '', attivo: true });
        caricaSponsors(); // Ricarica la lista
      }
    } catch (err) {
      console.error("Errore nel salvataggio:", err);
    }
  };

  // 4. RIMOZIONE
  const eliminaSponsor = async (id) => {
    if (!window.confirm("Sei sicuro di voler rimuovere questo sponsor?")) return;
    
    try {
      const res = await fetch(`http://localhost:8096/api/sponsors/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        caricaSponsors(); // Aggiorna la lista dopo l'eliminazione
      }
    } catch (err) {
      console.error("Errore durante l'eliminazione:", err);
    }
  };

  /**
   * NOTA PER IL PROGRAMMATORE:
   * Per evitare che lo stesso utente clicchi più volte, nel componente PUBBLICO 
   * (dove l'utente vede il banner) dovresti usare questa funzione:
   * 
   * const handleBannerClick = async (sponsorId) => {
   *   const clickedSponsors = JSON.parse(localStorage.getItem('clicked_sponsors') || '[]');
   *   if (clickedSponsors.includes(sponsorId)) return; // Già cliccato, non inviare al server
   * 
   *   const res = await fetch(`http://localhost:8096/api/sponsors/${sponsorId}/click`, { method: 'PATCH' });
   *   if (res.ok) {
   *     clickedSponsors.push(sponsorId);
   *     localStorage.setItem('clicked_sponsors', JSON.stringify(clickedSponsors));
   *   }
   * };
   */

  return (
    <div style={{ background: 'white', padding: '25px', borderRadius: '8px', border: `1px solid ${colors.border}`, marginTop: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0, color: colors.dark, borderBottom: `2px solid ${colors.primary}`, paddingBottom: '10px' }}>
        📢 Gestione Banner Pubblicitari
      </h3>
      
      {/* FORM DI INSERIMENTO */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px', background: colors.lightGray, padding: '20px', borderRadius: '6px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={labelStyle}>Nome Azienda</label>
            <input type="text" value={form.nomeAzienda} onChange={e => setForm({...form, nomeAzienda: e.target.value})} required style={inputStyle} placeholder="Es: Pizzeria da Ciro" />
          </div>
          <div>
            <label style={labelStyle}>Link Sito Web</label>
            <input type="url" value={form.linkSito} onChange={e => setForm({...form, linkSito: e.target.value})} required style={inputStyle} placeholder="https://..." />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Destinazione</label>
            <select value={form.tipoPagina} onChange={e => setForm({...form, tipoPagina: e.target.value})} style={inputStyle}>
              <option value="HOME">Home Page</option>
              <option value="ARTICOLO">Pagina Articolo</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Posizione</label>
            <select value={form.posizione} onChange={e => setForm({...form, posizione: e.target.value})} style={inputStyle}>
              <option value="SIDEBAR">Laterale (Sidebar)</option>
              <option value="BOTTOM">In basso (Footer/Bottom)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Banner (Immagine)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '12px', width: '100%' }} />
          </div>
        </div>

        <button type="submit" style={{ background: colors.success, color: 'white', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }}>
          + AGGIUNGI SPONSOR NELL'ELENCO
        </button>
      </form>

      {/* ELENCO SPONSOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0, color: colors.dark }}>Sponsor Attivi</h4>
        <button onClick={caricaSponsors} style={{ fontSize: '12px', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', border: `1px solid ${colors.border}` }}>
          🔄 Aggiorna Click
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
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
                <tr key={s.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={tdStyle}>
                    <strong>{s.nomeAzienda}</strong><br/>
                    <small style={{ color: colors.primary }}>{s.linkSito}</small>
                  </td>
                  <td style={tdStyle}>{s.tipoPagina}</td>
                  <td style={tdStyle}>{s.posizione}</td>
                  <td style={tdStyle}>
                    <span style={{ background: colors.primary, color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                      {s.clickCount || 0}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <button 
                      onClick={() => eliminaSponsor(s.id)} 
                      style={{ background: 'none', border: 'none', color: colors.danger, cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}
                    >
                      Rimuovi
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Nessun sponsor configurato.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Stili interni
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold', color: '#555' };
const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const thStyle = { padding: '12px', textAlign: 'left', fontSize: '13px' };
const tdStyle = { padding: '12px', fontSize: '14px' };

export default GestioneSponsor;