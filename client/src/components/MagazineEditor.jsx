import React, { useRef, useEffect, useState } from 'react';
import JoditEditor from 'jodit-react';

const MagazineEditor = ({ editId }) => {
  const editor = useRef(null);
  const [content, setContent] = useState('');

  // Recuperiamo il token salvato dal Login
  const token = localStorage.getItem('token');
  const authHeader = { 'Authorization': `Bearer ${token}` };

  const colors = {
    primary: '#007bff',
    dark: '#343a40',
    lightGray: '#f8f9fa',
    border: '#dee2e6',
    white: '#ffffff'
  };

  useEffect(() => {
    if (editId) {
      // Usiamo l'header con il token per caricare l'articolo
      fetch(`http://localhost:8096/api/pagine/${editId}`, { headers: authHeader })
        .then(res => res.json())
        .then(data => {
          if (data.moduli?.length > 0) {
            setContent(data.moduli[0].contenuto);
          }
        })
        .catch(err => console.error("Errore caricamento:", err));
    } else {
      setContent('');
    }
  }, [editId]);

  const handlePublish = async () => {
    if (!content || content.trim() === "" || content === '<p><br></p>') {
      alert("L'articolo è vuoto!");
      return;
    }

    const payload = {
      numeroPagina: 1,
      moduli: [{
        tipo: "TESTO_JODIT",
        contenuto: content,
        fontFamily: "Arial",
        fontSize: 18
      }]
    };

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `http://localhost:8096/api/pagine/${editId}` : 'http://localhost:8096/api/pagine';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          ...authHeader // Inviamo il token salvato nel localStorage
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editId ? "Articolo aggiornato!" : "Articolo pubblicato!");
      } else {
        alert("Errore dal server: " + response.status + " (Controlla il token)");
      }
    } catch (error) {
      alert("Errore di connessione al server.");
    }
  };

  // ... (mantiene il resto del tuo codice config e JSX originale)
  const config = {
    readonly: false,
    placeholder: 'Inizia a scrivere...',
    uploader: { insertImageAsBase64URI: true },
    language: 'it',
    style: { fontFamily: 'Arial, sans-serif', fontSize: '18px' }
  };

  return (
    <div>
      <div style={{ background: colors.white, padding: '15px 40px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}` }}>
        <h2 style={{color: colors.dark, margin: 0, fontSize: '20px'}}>{editId ? `Modifica #${editId}` : "Nuovo Articolo"}</h2>
        <button onClick={handlePublish} style={{ background: colors.primary, color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
          {editId ? "Salva Modifiche" : "Pubblica Ora"}
        </button>
      </div>
      <div style={{ maxWidth: '1100px', margin: '30px auto', background: 'white', padding: '15px', borderRadius: '8px', border: `1px solid ${colors.border}` }}>
        <JoditEditor value={content} config={config} onBlur={newContent => setContent(newContent)} />
      </div>
    </div>
  );
};

export default MagazineEditor;