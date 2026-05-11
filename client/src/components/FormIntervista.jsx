import React, { useState, useEffect, useMemo } from 'react';

const FormIntervista = () => {
  const [formData, setFormData] = useState({
    azienda: '',
    email: '',
    telefono: '',
    messaggio: '',
    referente: '',
    website: '' // HONEYPOT
  });

  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 

  // 1. Logica di Fingerprinting per identificare il dispositivo
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

  // 2. Controllo del blocco temporale (10 minuti)
  useEffect(() => {
    const checkCooldown = () => {
      const lastSubmit = localStorage.getItem(`last_submit_${deviceId}`);
      if (lastSubmit) {
        const now = Date.now();
        const diff = now - parseInt(lastSubmit);
        const cooldown = 600000; // 10 minuti in millisecondi (10 * 60 * 1000)

        if (diff < cooldown) {
          setTimeLeft(Math.ceil((cooldown - diff) / 60000));
        } else {
          setTimeLeft(0);
        }
      }
    };

    checkCooldown();
    const timer = setInterval(checkCooldown, 30000); // Controlla ogni 30 secondi
    return () => clearInterval(timer);
  }, [deviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 3. Controllo HONEYPOT
    if (formData.website) {
      console.warn("Spam detectato tramite honeypot");
      return;
    }

    // 4. Controllo Cooldown
    if (timeLeft > 0) {
      setStatus({ 
        type: 'error', 
        msg: `Per motivi di sicurezza, puoi inviare una sola richiesta ogni 10 minuti. Riprova tra ${timeLeft} min.` 
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', msg: '' });

    try {
      const response = await fetch('http://localhost:8096/api/interviste/prenota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, deviceId })
      });

      if (response.ok) {
        setStatus({ type: 'success', msg: 'Richiesta inviata con successo! Verrai ricontattato dalla redazione.' });
        
        // 5. Imposta il timestamp nel localStorage per attivare il blocco
        const now = Date.now().toString();
        localStorage.setItem(`last_submit_${deviceId}`, now);
        setTimeLeft(10); // Blocca subito per 10 minuti
        
        setFormData({ azienda: '', email: '', telefono: '', messaggio: '', referente: '', website: '' });
      } else {
        throw new Error();
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Si è verificato un errore durante l\'invio. Riprova più tardi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '15px', border: '1px solid #dee2e6', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontWeight: '800' }}>Racconta la tua Azienda</h2>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '30px' }}>
        Invia la tua candidatura per un'intervista dedicata.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Campo Honeypot - Invisibile all'utente */}
        <input 
          type="text" 
          name="website" 
          value={formData.website} 
          onChange={(e) => setFormData({...formData, website: e.target.value})}
          style={{ display: 'none' }} 
          tabIndex="-1" 
          autoComplete="off" 
        />

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Nome Azienda *</label>
          <input 
            required 
            type="text" 
            style={inputStyle} 
            value={formData.azienda}
            onChange={(e) => setFormData({...formData, azienda: e.target.value})}
            placeholder="Skill Factory SRL"
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle}>Referente *</label>
            <input 
              required 
              type="text" 
              style={inputStyle} 
              value={formData.referente}
              onChange={(e) => setFormData({...formData, referente: e.target.value})}
              placeholder="Nome e Cognome"
            />
          </div>
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle}>Telefono *</label>
            <input 
              required 
              type="tel" 
              style={inputStyle} 
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              placeholder="081 1234567"
            />
          </div>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Email Aziendale *</label>
          <input 
            required 
            type="email" 
            style={inputStyle} 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="contatti@azienda.it"
          />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Perché dovremmo intervistarti?</label>
          <textarea 
            rows="4" 
            style={{...inputStyle, resize: 'none'}}
            value={formData.messaggio}
            onChange={(e) => setFormData({...formData, messaggio: e.target.value})}
            placeholder="Parlaci dei tuoi progetti o dell'innovazione della tua azienda..."
          />
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
          disabled={isSubmitting || timeLeft > 0}
          style={{ 
            width: '100%', 
            padding: '15px', 
            backgroundColor: (isSubmitting || timeLeft > 0) ? '#6c757d' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: 'bold', 
            cursor: (isSubmitting || timeLeft > 0) ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            transition: 'background 0.3s'
          }}
        >
          {isSubmitting ? 'Invio in corso...' : timeLeft > 0 ? `Blocco anti-spam (${timeLeft} min)` : 'Invia Candidatura'}
        </button>
      </form>
    </div>
  );
};

const inputGroupStyle = { marginBottom: '20px' };
const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px', color: '#555' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '15px' };

export default FormIntervista;