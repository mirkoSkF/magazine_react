import React, { useEffect, useState } from 'react';

const DashboardInterviste = ({ onSelectIntervista }) => {
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch("https://magazine.skillfactory.it/api/interviste/elenco", {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Errore nel caricamento.");
        return res.json();
      })
      .then(data => {
        setPrenotazioni(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Caricamento...</div>;

  return (
    <div className="dashboard-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <style>
        {`
          @media (max-width: 600px) {
            .dashboard-container {
              padding: 10px !important;
            }

            .dashboard-title {
              font-size: 20px !important;
              margin-bottom: 15px !important;
            }

            thead { display: none; }
            
            tr { 
              display: block; 
              margin-bottom: 15px; 
              border: 1px solid #eee; 
              border-radius: 12px;
              padding: 15px;
              background: #fff;
              box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            td { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              padding: 10px 0 !important;
              border: none !important;
              font-size: 14px;
              border-bottom: 1px dashed #f0f0f0 !important;
              text-align: right;
              word-break: break-word;
              gap: 12px;
            }

            td:last-child {
              border-bottom: none !important;
              padding-top: 12px !important; 
              justify-content: flex-end; 
              gap: 15px;
            }

            td::before {
              content: attr(data-label);
              font-weight: bold;
              color: #888;
              text-transform: uppercase;
              font-size: 11px;
              flex-shrink: 0;
              margin-right: auto; 
              text-align: left;
            }

            .btn-action-mobile {
              width: 100% !important;
              max-width: 120px;
              text-align: center;
              margin: 0 !important;
              display: inline-block;
            }
          }
        `}
      </style>

      <h2 className="dashboard-title" style={{marginBottom: '20px', fontSize: '24px', fontWeight: '800'}}>Prenotazioni</h2>
      
      <div className="table-container" style={{ background: 'transparent', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
              <th style={cellHead}>Evento</th>
              <th style={cellHead}>Nominativo</th>
              <th style={cellHead}>Email</th>
              <th style={cellHead}>Azione</th>
            </tr>
          </thead>
          <tbody>
            {prenotazioni.length > 0 ? (
              prenotazioni.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                  <td style={cellStyle} data-label="Evento"><strong>{p.azienda}</strong></td>
                  <td style={cellStyle} data-label="Nominativo">{p.referente}</td>
                  <td style={cellStyle} data-label="Email">{p.email}</td>
                  <td style={cellStyle} data-label="Azione">
                    <button 
                      className="btn-action-mobile"
                      onClick={() => onSelectIntervista(p.id)} 
                      style={btnStyle}
                      onMouseOver={(e) => e.target.style.background = '#0056b3'}
                      onMouseOut={(e) => e.target.style.background = '#007bff'}
                    >
                      Visualizza
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{textAlign: 'center', padding: '30px', color: '#666'}}>
                  Nessuna richiesta presente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const cellHead = { padding: '15px', textAlign: 'left', color: '#666', fontWeight: 'bold' };
const cellStyle = { padding: '15px', textAlign: 'left' };
const btnStyle = { padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: '0.3s', fontWeight: '600', fontSize: '13px' };

export default DashboardInterviste;