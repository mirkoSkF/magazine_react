import React, { useRef, useEffect, useState, useMemo } from 'react'; // Aggiunto useMemo
import JoditEditor from 'jodit-react';

const MagazineEditor = ({ editId }) => {
  const editor = useRef(null);
  const [content, setContent] = useState('');

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

  // USEMEMO: Fondamentale per evitare che i popup si chiudano!
  // Impedisce a React di ricreare l'oggetto config a ogni render.
  const config = useMemo(() => ({
    readonly: false,
    placeholder: 'Inizia a scrivere...',
    uploader: { insertImageAsBase64URI: true },
    language: 'it',
    iframe: true, // Sblocca la visualizzazione dei video nell'editor
    iframeStyle: 'html{margin:0;padding:0;} img{max-width:100%;height:auto;}', // Stile interno frame
    style: { fontFamily: 'Arial, sans-serif', fontSize: '18px' },
    // Queste opzioni aiutano a stabilizzare i popup (link, immagini, video)
    askBeforePasteFromWord: false,
    askBeforePasteHTML: false,
    width: '100%',
    height: 500,
  }), []);

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
          ...authHeader
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editId ? "Articolo aggiornato!" : "Articolo pubblicato!");
      } else {
        alert("Errore dal server: " + response.status);
      }
    } catch (error) {
      alert("Errore di connessione.");
    }
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
        <JoditEditor 
          ref={editor}
          value={content} 
          config={config} 
          // onChange è più lento ma onBlur a volte "taglia" l'ultimo inserimento se chiudi subito
          onBlur={newContent => setContent(newContent)} 
        />
      </div>
    </div>
  );
};

export default MagazineEditor;