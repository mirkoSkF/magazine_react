import React, { useState, useEffect } from 'react';

const DashboardEditore = ({ onEdit }) => {
  const [articoli, setArticoli] = useState([]);
  const authHeader = { 'Authorization': 'Basic ' + btoa('admin:123') };

  const colors = {
    primary: '#007bff',
    dark: '#343a40',
    lightGray: '#f8f9fa',
    border: '#dee2e6',
    white: '#ffffff',
    danger: '#dc3545'
  };

  const carica = () => {
    fetch('http://localhost:8096/api/pagine', { headers: authHeader })
      .then(res => res.json())
      .then(setArticoli)
      .catch(err => console.error("Errore nel caricamento:", err));
  };

  useEffect(carica, []);

  const elimina = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questo articolo? L'azione è irreversibile.")) {
      await fetch(`http://localhost:8096/api/pagine/${id}`, { 
        method: 'DELETE', 
        headers: authHeader 
      });
      carica();
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Iniezione CSS per gestire gli stati Hover in modo fluido */}
      <style>{`
        .btn-sf-primary:hover {
          background-color: ${colors.primary} !important;
          color: white !important;
        }
        .btn-sf-danger:hover {
          background-color: ${colors.danger} !important;
          color: white !important;
        }
        button {
          transition: all 0.3s ease !important;
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: colors.dark, fontWeight: '600' }}>Gestione Contenuti Magazine</h2>
        <span style={{ fontSize: '14px', color: '#6c757d' }}>{articoli.length} articoli totali</span>
      </div>

      <div style={{ background: colors.white, borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: colors.lightGray, borderBottom: `2px solid ${colors.border}` }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>ANTEPRIMA CONTENUTO</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>AZIONI</th>
            </tr>
          </thead>
          <tbody>
            {articoli.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>Nessun articolo trovato.</td>
              </tr>
            ) : (
              articoli.map(a => (
                <tr 
                  key={a.id} 
                  style={rowStyle}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.lightGray}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={tdStyle}>
                    <span style={{ color: colors.primary, fontWeight: 'bold' }}>#{a.id}</span>
                  </td>
                  <td style={{ ...tdStyle, color: '#555', fontSize: '14px' }}>
                    {a.moduli?.[0]?.contenuto.replace(/<[^>]*>?/gm, '').substring(0, 80)}...
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button 
                      onClick={() => onEdit(a.id)} 
                      className="btn-sf-primary"
                      style={actionBtnStyle(colors.primary)}
                    >
                      Gestisci
                    </button>
                    <button 
                      onClick={() => elimina(a.id)} 
                      className="btn-sf-danger"
                      style={actionBtnStyle(colors.danger)}
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- STILI INTERNI (IMMUTATI) ---
const thStyle = {
  padding: '15px 20px',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#495057'
};

const tdStyle = {
  padding: '18px 20px',
  borderBottom: '1px solid #eee'
};

const rowStyle = {
  transition: 'background-color 0.2s ease'
};

const actionBtnStyle = (color) => ({
  background: 'transparent',
  color: color,
  border: `1px solid ${color}`,
  padding: '6px 15px',
  borderRadius: '4px',
  marginLeft: '10px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500'
});

export default DashboardEditore;