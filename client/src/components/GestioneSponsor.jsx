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

  // FIX INPUT FILE
  const fileInputRef = useRef(null);

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

        // FIX CLICK COUNT NULL/UNDEFINED
        const normalized = data.map(s => ({
          ...s,
          clickCount: Number(s.clickCount || s.clicks || 0)
        }));

        setSponsors(normalized);
      } 
      else if (res.status === 403) {
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

  // 2. GESTIONE UPLOAD IMMAGINE
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          bannerImage: reader.result
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  // CONTEGGI LIMITI
  const homeSidebarCount = sponsors.filter(
    s =>
      s.attivo &&
      s.tipoPagina === 'HOME' &&
      s.posizione === 'SIDEBAR'
  ).length;

  const homeBottomCount = sponsors.filter(
    s =>
      s.attivo &&
      s.tipoPagina === 'HOME' &&
      s.posizione === 'BOTTOM'
  ).length;

  const articoloBottomCount = sponsors.filter(
    s =>
      s.attivo &&
      s.tipoPagina === 'ARTICOLO' &&
      s.posizione === 'BOTTOM'
  ).length;

  // CONTROLLO DISPONIBILITÀ
  const isLimitReached = (() => {

    // HOME + SIDEBAR => MAX 3
    if (
      form.tipoPagina === 'HOME' &&
      form.posizione === 'SIDEBAR' &&
      homeSidebarCount >= 3
    ) {
      return true;
    }

    // HOME + BOTTOM => MAX 2
    if (
      form.tipoPagina === 'HOME' &&
      form.posizione === 'BOTTOM' &&
      homeBottomCount >= 2
    ) {
      return true;
    }

    // ARTICOLO => SOLO BOTTOM => MAX 2
    if (
      form.tipoPagina === 'ARTICOLO' &&
      articoloBottomCount >= 2
    ) {
      return true;
    }

    return false;
  })();

  // TESTO BLOCCO
  const getLimitMessage = () => {

    if (
      form.tipoPagina === 'HOME' &&
      form.posizione === 'SIDEBAR' &&
      homeSidebarCount >= 3
    ) {
      return 'Limite raggiunto: massimo 3 banner laterali nella Home.';
    }

    if (
      form.tipoPagina === 'HOME' &&
      form.posizione === 'BOTTOM' &&
      homeBottomCount >= 2
    ) {
      return 'Limite raggiunto: massimo 2 banner inferiori nella Home.';
    }

    if (
      form.tipoPagina === 'ARTICOLO' &&
      articoloBottomCount >= 2
    ) {
      return 'Limite raggiunto: massimo 2 banner inferiori nella Pagina Articolo.';
    }

    return '';
  };

  // 3. SALVATAGGIO
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (isLimitReached) {
      return;
    }

    // FIX CONTROLLO IMMAGINE
    if (!form.bannerImage || form.bannerImage.trim() === '') {
      return alert("Per favore, carica un'immagine per il banner.");
    }

    setLoading(true);

    try {

      const payload = {
        ...form,

        // FORZIAMO AUTOMATICAMENTE BOTTOM SU ARTICOLO
        posizione:
          form.tipoPagina === 'ARTICOLO'
            ? 'BOTTOM'
            : form.posizione
      };

      const res = await fetch('http://localhost:8096/api/sponsors', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {

        const nuovoSponsor = await res.json().catch(() => null);

        alert("Sponsor aggiunto con successo!");

        // FIX AGGIUNTA IMMEDIATA IN LISTA
        if (nuovoSponsor) {
          setSponsors(prev => [
            ...prev,
            {
              ...nuovoSponsor,
              clickCount: Number(
                nuovoSponsor.clickCount ||
                nuovoSponsor.clicks ||
                0
              )
            }
          ]);
        } else {
          await caricaSponsors();
        }

        // RESET FORM
        setForm({
          nomeAzienda: '',
          linkSito: '',
          tipoPagina: 'HOME',
          posizione: 'SIDEBAR',
          bannerImage: '',
          attivo: true
        });

        // FIX RESET INPUT FILE
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (err) {
      console.error("Errore nel salvataggio:", err);
    } finally {
      setLoading(false);
    }
  };

  // 4. RIMOZIONE
  const eliminaSponsor = async (id) => {

    if (!window.confirm("Sei sicuro di voler rimuovere questo sponsor?")) return;

    try {
      const res = await fetch(
        `http://localhost:8096/api/sponsors/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (res.ok) {

        // FIX RIMOZIONE IMMEDIATA
        setSponsors(prev =>
          prev.filter(s => s.id !== id)
        );
      }
    } catch (err) {
      console.error("Errore durante l'eliminazione:", err);
    }
  };

  return (
    <div
      style={{
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        marginTop: '30px',
        boxShadow: '0 8px 25px rgba(0,0,0,0.05)'
      }}
    >
      <style>{`
        .sponsor-btn {
          transition: all 0.25s ease;
        }

        .sponsor-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
          box-shadow: 0 8px 18px rgba(0,0,0,0.12);
        }

        .danger-btn {
          padding: 8px 14px;
          border-radius: 8px;
          position: relative;
        }

        .danger-btn:hover {
          color: ${colors.danger} !important;
          background: rgba(255,0,0,0.04);
          text-decoration: none !important;
          box-shadow: 0 0 0 2px ${colors.danger};
          transform: translateY(-1px);
        }

        .table-row:hover {
          background: rgba(0,0,0,0.025);
        }

        .disabled-btn {
          opacity: 0.45;
          cursor: not-allowed !important;
          transform: none !important;
          box-shadow: none !important;
        }

        .file-preview {
          margin-top: 8px;
          font-size: 12px;
          color: #666;
          font-weight: 600;
        }

        @media (max-width: 768px) {

          .responsive-grid-2,
          .responsive-grid-3 {
            grid-template-columns: 1fr !important;
          }

          .table-wrapper {
            overflow-x: auto;
          }
        }
      `}</style>

      <h3
        style={{
          marginTop: 0,
          color: colors.dark,
          borderBottom: `2px solid ${colors.primary}`,
          paddingBottom: '10px'
        }}
      >
        📢 Gestione Banner Pubblicitari
      </h3>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginBottom: '40px',
          background: colors.lightGray,
          padding: '20px',
          borderRadius: '10px'
        }}
      >
        <div
          className="responsive-grid-2"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px'
          }}
        >
          <div>
            <label style={labelStyle}>
              Nome Azienda
            </label>

            <input
              type="text"
              value={form.nomeAzienda}
              onChange={e =>
                setForm({
                  ...form,
                  nomeAzienda: e.target.value
                })
              }
              required
              style={inputStyle}
              placeholder="Es: Pizzeria da Ciro"
            />
          </div>

          <div>
            <label style={labelStyle}>
              Link Sito Web
            </label>

            <input
              type="url"
              value={form.linkSito}
              onChange={e =>
                setForm({
                  ...form,
                  linkSito: e.target.value
                })
              }
              required
              style={inputStyle}
              placeholder="https://..."
            />
          </div>
        </div>

        <div
          className="responsive-grid-3"
          style={{
            display: 'grid',
            gridTemplateColumns:
              form.tipoPagina === 'HOME'
                ? '1fr 1fr 1fr'
                : '1fr 1fr',
            gap: '15px',
            alignItems: 'end'
          }}
        >
          {/* DESTINAZIONE */}
          <div>
            <label style={labelStyle}>
              Destinazione
            </label>

            <select
              value={form.tipoPagina}
              onChange={e =>
                setForm({
                  ...form,
                  tipoPagina: e.target.value,

                  posizione:
                    e.target.value === 'ARTICOLO'
                      ? 'BOTTOM'
                      : 'SIDEBAR'
                })
              }
              style={inputStyle}
            >
              <option value="HOME">
                Home Page
              </option>

              <option value="ARTICOLO">
                Pagina Articolo
              </option>
            </select>
          </div>

          {/* POSIZIONE SOLO IN HOME */}
          {form.tipoPagina === 'HOME' && (
            <div>
              <label style={labelStyle}>
                Posizione
              </label>

              <select
                value={form.posizione}
                onChange={e =>
                  setForm({
                    ...form,
                    posizione: e.target.value
                  })
                }
                style={inputStyle}
              >
                <option value="SIDEBAR">
                  Laterale (Sidebar)
                </option>

                <option value="BOTTOM">
                  In basso (Footer/Bottom)
                </option>
              </select>
            </div>
          )}

          {/* FILE */}
          <div>
            <label style={labelStyle}>
              Banner (Immagine)
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                fontSize: '12px',
                width: '100%'
              }}
            />

            {form.bannerImage && (
              <div className="file-preview">
                ✅ Immagine caricata
              </div>
            )}
          </div>
        </div>

        {/* AVVISO LIMITI */}
        {isLimitReached && (
          <div
            style={{
              background: '#fff3cd',
              border: '1px solid #ffe69c',
              color: '#856404',
              padding: '12px 15px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            ⚠️ {getLimitMessage()}
          </div>
        )}

        {/* BOTTONE */}
        <button
          type="submit"
          disabled={isLimitReached || loading}
          className={`sponsor-btn ${isLimitReached ? 'disabled-btn' : ''}`}
          style={{
            background:
              isLimitReached
                ? '#b5b5b5'
                : colors.success,
            color: 'white',
            border: 'none',
            padding: '14px',
            borderRadius: '8px',
            cursor:
              isLimitReached
                ? 'not-allowed'
                : 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            marginTop: '10px'
          }}
        >
          {loading
            ? 'Caricamento...'
            : '+ AGGIUNGI SPONSOR NELL\'ELENCO'}
        </button>
      </form>

      {/* HEADER LISTA */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          gap: '15px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <h4
            style={{
              margin: 0,
              color: colors.dark
            }}
          >
            Sponsor Configurati
          </h4>

          <small style={{ color: '#666' }}>
            Home: max 3 Sidebar / 2 Bottom — Articolo: max 2 Bottom
          </small>
        </div>
      </div>

      {/* TABELLA */}
      <div className="table-wrapper">
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr
              style={{
                background: colors.dark,
                color: 'white'
              }}
            >
              <th style={thStyle}>Azienda</th>
              <th style={thStyle}>Target</th>
              <th style={thStyle}>Posizione</th>
              <th style={thStyle}>Click</th>
              <th
                style={{
                  ...thStyle,
                  textAlign: 'center'
                }}
              >
                Azioni
              </th>
            </tr>
          </thead>

          <tbody>
            {sponsors.length > 0 ? (
              sponsors.map(s => (
                <tr
                  key={s.id}
                  className="table-row"
                  style={{
                    borderBottom: `1px solid ${colors.border}`,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <td style={tdStyle}>
                    <strong>
                      {s.nomeAzienda}
                    </strong>

                    <br />

                    <small
                      style={{
                        color: colors.primary
                      }}
                    >
                      {s.linkSito}
                    </small>
                  </td>

                  <td style={tdStyle}>
                    {s.tipoPagina}
                  </td>

                  <td style={tdStyle}>
                    {s.posizione}
                  </td>

                  <td style={tdStyle}>
                    <span
                      style={{
                        background: colors.primary,
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        minWidth: '24px',
                        textAlign: 'center'
                      }}
                    >
                      {Number(s.clickCount || 0)}
                    </span>
                  </td>

                  <td
                    style={{
                      ...tdStyle,
                      textAlign: 'center'
                    }}
                  >
                    <button
                      onClick={() =>
                        eliminaSponsor(s.id)
                      }
                      className="danger-btn sponsor-btn"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: colors.danger,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      Rimuovi
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: '25px',
                    textAlign: 'center',
                    color: '#999'
                  }}
                >
                  Nessun sponsor configurato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  fontSize: '12px',
  fontWeight: 'bold',
  color: '#555'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  boxSizing: 'border-box',
  transition: 'all 0.2s ease'
};

const thStyle = {
  padding: '14px',
  textAlign: 'left',
  fontSize: '13px'
};

const tdStyle = {
  padding: '14px',
  fontSize: '14px'
};

export default GestioneSponsor;