import React, { useState, useEffect, useMemo } from 'react';

const FormIntervista = ({ onPrivacyClick }) => {
  const [formData, setFormData] = useState({
    azienda: '',                // Conterrà il titolo dell'evento selezionato
    email: '',
    telefono: '',
    messaggio: '',
    referente: '',
    website: '',                 // HONEYPOT
    accettaPrivacy: false,       // Obbligatorio
    accettaMarketing: false,     // Facoltativo
    accettaCessioneTerzi: false  // Facoltativo
  });

  const [eventi, setEventi] = useState([]);
  const [loadingEventi, setLoadingEventi] = useState(true);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 

  // Fingerprint del dispositivo per gestione Cooldown/Anti-Spam
  const deviceId = useMemo(() => {
    const nav = window.navigator;
    const screen = window.screen;
    const str = `${nav.userAgent}${nav.language}${screen.colorDepth}${screen.width}${screen.height}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return `dev_form_${Math.abs(hash)}`;
  }, []);

  // 1. Caricamento degli eventi dall'API pagine
  useEffect(() => {
    fetch("https://magazine.skillfactory.it/api/pagine")
      .then((res) => res.json())
      .then((data) => {
        // Filtra solo gli eventi visibili (tipo EVENTO e non bozza)
        const eventiDisponibili = data.filter(
          (item) => item.tipo?.toUpperCase() === "EVENTO" && item.bozza === false
        );
        setEventi(eventiDisponibili);
        
        // Imposta il primo evento come valore di default se presente
        if (eventiDisponibili.length > 0) {
          setFormData((prev) => ({ ...prev, azienda: eventiDisponibili[0].titolo }));
        }
      })
      .catch((err) => {
        console.error("Errore nel caricamento degli eventi:", err);
      })
      .finally(() => {
        setLoadingEventi(false);
      });
  }, []);

  // 2. Controllo Cooldown anti-spam
  useEffect(() => {
    const checkCooldown = () => {
      const lastSubmit = localStorage.getItem(`last_submit_${deviceId}`);
      if (lastSubmit) {
        const now = Date.now();
        const diff = now - parseInt(lastSubmit);
        const cooldown = 600000; // 10 minuti
        if (diff < cooldown) {
          setTimeLeft(Math.ceil((cooldown - diff) / 60000));
        } else {
          setTimeLeft(0);
        }
      }
    };
    checkCooldown();
    const timer = setInterval(checkCooldown, 30000);
    return () => clearInterval(timer);
  }, [deviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.website) return; // Honeypot bot protection

    if (!formData.accettaPrivacy) {
        setStatus({ type: 'error', msg: 'Devi accettare l\'informativa sulla privacy per procedere.' });
        return;
    }

    if (timeLeft > 0) {
      setStatus({ 
        type: 'error', 
        msg: `Attendi ${timeLeft} min prima di un nuovo invio.` 
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', msg: '' });

    try {
      const response = await fetch('https://magazine.skillfactory.it/api/interviste/prenota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, deviceId })
      });

      if (response.ok) {
        setStatus({ type: 'success', msg: 'Richiesta inviata con successo!' });
        localStorage.setItem(`last_submit_${deviceId}`, Date.now().toString());
        setTimeLeft(10);
        setFormData({ 
            azienda: eventi.length > 0 ? eventi[0].titolo : '', 
            email: '', telefono: '', messaggio: '', referente: '', website: '',
            accettaPrivacy: false, accettaMarketing: false, accettaCessioneTerzi: false 
        });
      } else {
        throw new Error();
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Errore durante l\'invio.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkboxContainerStyle = { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '15px', cursor: 'pointer' };
  const checkboxLabelStyle = { fontSize: '13px', color: '#444', lineHeight: '1.4' };

  const noEventiDisponibili = !loadingEventi && eventi.length === 0;

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '40px auto', 
      padding: '30px', 
      backgroundColor: '#f8f9fa', 
      borderRadius: '15px', 
      border: '1px solid #dee2e6', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* OVERLAY OSCURANTE SE NON CI SONO EVENTI DISPONIBILI */}
      {noEventiDisponibili && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(248, 249, 250, 0.92)',
          backdropFilter: 'blur(3px)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            padding: '25px 30px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #dee2e6',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
          }}>
            <span style={{ fontSize: '30px', display: 'block', marginBottom: '10px' }}>📅</span>
            <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '20px', fontWeight: 'bold' }}>
              Non ci sono eventi in programmazione
            </h3>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Torna a trovarci presto per scoprire i prossimi appuntamenti.
            </p>
          </div>
        </div>
      )}

      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontWeight: '800' }}>
        Prenota un evento
      </h2>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        Invia senza impegno la tua candidatura.
      </p>

      <form onSubmit={handleSubmit} style={{ opacity: noEventiDisponibili ? 0.4 : 1 }}>
        {/* HONEYPOT FIELD */}
        <input 
          type="text" 
          name="website" 
          value={formData.website} 
          onChange={(e) => setFormData({...formData, website: e.target.value})} 
          style={{ display: 'none' }} 
          tabIndex="-1" 
        />

        {/* SELEZIONE EVENTO DA DROPDOWN */}
        <div style={inputGroupStyle}>
          <label style={labelStyle}>Seleziona Evento *</label>
          {loadingEventi ? (
            <select disabled style={inputStyle}>
              <option>Caricamento eventi in corso...</option>
            </select>
          ) : (
            <select 
              required 
              style={inputStyle} 
              value={formData.azienda} 
              onChange={(e) => setFormData({...formData, azienda: e.target.value})}
              disabled={noEventiDisponibili}
            >
              {eventi.length === 0 && <option value="">Nessun evento disponibile</option>}
              {eventi.map((ev) => (
                <option key={ev.id} value={ev.titolo}>
                  {ev.titolo}
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle}>Nome e Cognome *</label>
            <input 
              required 
              placeholder='Marco Rossi' 
              type="text" 
              style={inputStyle} 
              value={formData.referente} 
              onChange={(e) => setFormData({...formData, referente: e.target.value})}
              disabled={noEventiDisponibili}
            />
          </div>
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle}>Telefono </label>
            <input 
              type="tel" 
              style={inputStyle} 
              value={formData.telefono} 
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              disabled={noEventiDisponibili}
            />
          </div>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Email *</label>
          <input 
            required 
            type="email" 
            style={inputStyle} 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            disabled={noEventiDisponibili}
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Eventuali domande e curiosità</label>
          <textarea 
            rows="4" 
            style={{...inputStyle, resize: 'none'}} 
            value={formData.messaggio} 
            onChange={(e) => setFormData({...formData, messaggio: e.target.value})}
            disabled={noEventiDisponibili}
          />
        </div>

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
            <label style={checkboxContainerStyle}>
                <input 
                  type="checkbox" 
                  required 
                  checked={formData.accettaPrivacy} 
                  onChange={e => setFormData({...formData, accettaPrivacy: e.target.checked})} 
                  disabled={noEventiDisponibili}
                />
                <span style={checkboxLabelStyle}>Ho letto e accettato l'<a href="#" onClick={(e) => { e.preventDefault(); if(onPrivacyClick) onPrivacyClick(); }}>informativa sulla privacy</a> (obbligatorio)</span>
            </label>

            <label style={checkboxContainerStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.accettaMarketing} 
                  onChange={e => setFormData({...formData, accettaMarketing: e.target.checked})} 
                  disabled={noEventiDisponibili}
                />
                <span style={checkboxLabelStyle}>Accetto il trattamento per la finalità di marketing come indicato nel punto A5) dell' <a href="#" onClick={(e) => { e.preventDefault(); if(onPrivacyClick) onPrivacyClick(); }}>informativa sulla privacy</a> (facoltativo)</span>
            </label>

            <label style={checkboxContainerStyle}>
                <input 
                  type="checkbox" 
                  checked={formData.accettaCessioneTerzi} 
                  onChange={e => setFormData({...formData, accettaCessioneTerzi: e.target.checked})} 
                  disabled={noEventiDisponibili}
                />
                <span style={checkboxLabelStyle}>Accetto il trattamento per la finalità di cessione dei dati a terzi come indicato nel punto A6) dell' <a href="#" onClick={(e) => { e.preventDefault(); if(onPrivacyClick) onPrivacyClick(); }}>informativa sulla privacy</a> (facoltativo)</span>
            </label>
        </div>

        {status.msg && (
          <div style={{ 
            padding: '15px', 
            borderRadius: '8px', 
            marginBottom: '20px', 
            backgroundColor: status.type === 'success' ? '#d4edda' : '#f8d7da', 
            color: status.type === 'success' ? '#155724' : '#721c24', 
            textAlign: 'center', 
            fontSize: '14px' 
          }}>
            {status.msg}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting || timeLeft > 0 || !formData.accettaPrivacy || noEventiDisponibili}
          style={{ 
            width: '100%', 
            padding: '15px', 
            backgroundColor: (isSubmitting || timeLeft > 0 || !formData.accettaPrivacy || noEventiDisponibili) ? '#6c757d' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: 'bold', 
            cursor: (isSubmitting || timeLeft > 0 || !formData.accettaPrivacy || noEventiDisponibili) ? 'not-allowed' : 'pointer', 
            fontSize: '16px'
          }}
        >
          {isSubmitting ? 'Invio in corso...' : timeLeft > 0 ? `Blocco anti-spam (${timeLeft} min)` : 'Prenota'}
        </button>
      </form>
    </div>
  );
};

const inputGroupStyle = { marginBottom: '20px' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#555' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '15px', backgroundColor: '#fff' };

export default FormIntervista;