import React, { useState, useEffect, useMemo } from 'react';

const FormIntervista = () => {
  const [formData, setFormData] = useState({
    azienda: '',
    email: '',
    telefono: '',
    messaggio: '',
    referente: '',
    website: '', // HONEYPOT
    accettaPrivacy: false,      // Obbligatorio
    accettaMarketing: false,    // Facoltativo
    accettaCessioneTerzi: false  // Facoltativo
  });

  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); 

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

  useEffect(() => {
    const checkCooldown = () => {
      const lastSubmit = localStorage.getItem(`last_submit_${deviceId}`);
      if (lastSubmit) {
        const now = Date.now();
        const diff = now - parseInt(lastSubmit);
        const cooldown = 600000; 
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
    
    if (formData.website) return;

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
      const response = await fetch('http://localhost:8096/api/interviste/prenota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, deviceId })
      });

      if (response.ok) {
        setStatus({ type: 'success', msg: 'Richiesta inviata con successo!' });
        localStorage.setItem(`last_submit_${deviceId}`, Date.now().toString());
        setTimeLeft(10);
        setFormData({ 
            azienda: '', email: '', telefono: '', messaggio: '', referente: '', website: '',
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

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '15px', border: '1px solid #dee2e6', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontWeight: '800' }}>Racconta la tua Azienda</h2>
      {/* CORRETTO marginBottom da 300px a 20px */}
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#666', marginBottom: '20px' }}>Invia la candidatura per un'intervista dedicata.</p>

      <form onSubmit={handleSubmit}>
        <input type="text" name="website" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} style={{ display: 'none' }} tabIndex="-1" />

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Nome Azienda *</label>
          <input required type="text" style={inputStyle} value={formData.azienda} onChange={(e) => setFormData({...formData, azienda: e.target.value})} />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle}>Referente *</label>
            <input required type="text" style={inputStyle} value={formData.referente} onChange={(e) => setFormData({...formData, referente: e.target.value})} />
          </div>
          <div style={{ ...inputGroupStyle, flex: 1 }}>
            <label style={labelStyle}>Telefono *</label>
            <input required type="tel" style={inputStyle} value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
          </div>
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Email Aziendale *</label>
          <input required type="email" style={inputStyle} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </div>

        <div style={inputGroupStyle}>
          <label style={labelStyle}>Perché dovremmo intervistarti?</label>
          <textarea rows="4" style={{...inputStyle, resize: 'none'}} value={formData.messaggio} onChange={(e) => setFormData({...formData, messaggio: e.target.value})} />
        </div>

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
            <label style={checkboxContainerStyle}>
                <input type="checkbox" required checked={formData.accettaPrivacy} onChange={e => setFormData({...formData, accettaPrivacy: e.target.checked})} />
                <span style={checkboxLabelStyle}>Ho letto e accettato l'<a href="#">informativa sulla privacy</a> (obbligatorio)</span>
            </label>

            <label style={checkboxContainerStyle}>
                <input type="checkbox" checked={formData.accettaMarketing} onChange={e => setFormData({...formData, accettaMarketing: e.target.checked})} />
                <span style={checkboxLabelStyle}>Accetto il trattamento per la finalità di marketing come indicato nel punto A5) dell' <a href="#">informativa sulla privacy</a> (facoltativo)</span>
            </label>

            <label style={checkboxContainerStyle}>
                <input type="checkbox" checked={formData.accettaCessioneTerzi} onChange={e => setFormData({...formData, accettaCessioneTerzi: e.target.checked})} />
                <span style={checkboxLabelStyle}>Accetto il trattamento per la finalità di cessione dei dati a terzi come indicato nel punto A6) dell' <a href="#">informativa sulla privacy</a> (facoltativo)</span>
            </label>
        </div>

        {status.msg && (
          <div style={{ padding: '15px', borderRadius: '8px', marginBottom: '20px', backgroundColor: status.type === 'success' ? '#d4edda' : '#f8d7da', color: status.type === 'success' ? '#155724' : '#721c24', textAlign: 'center', fontSize: '14px' }}>
            {status.msg}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting || timeLeft > 0 || !formData.accettaPrivacy}
          style={{ 
            width: '100%', padding: '15px', 
            backgroundColor: (isSubmitting || timeLeft > 0 || !formData.accettaPrivacy) ? '#6c757d' : '#007bff', 
            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', 
            cursor: (isSubmitting || timeLeft > 0 || !formData.accettaPrivacy) ? 'not-allowed' : 'pointer', fontSize: '16px'
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