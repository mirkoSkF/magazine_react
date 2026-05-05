import React, { useRef, useEffect, useState } from 'react';
import JoditEditor from 'jodit-react';

const MagazineEditor = ({ editId, auth }) => {
  const editor = useRef(null);
  const [content, setContent] = useState('');

  const colors = {
    primary: '#007bff',
    dark: '#343a40',
    lightGray: '#f8f9fa',
    border: '#dee2e6',
    white: '#ffffff'
  };

  useEffect(() => {
    if (editId) {
      // Per il caricamento dell'articolo singolo usiamo l'auth
      fetch(`http://localhost:8096/api/pagine/${editId}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.moduli?.length > 0) setContent(data.moduli[0].contenuto);
        })
        .catch(err => console.error("Errore caricamento:", err));
    } else {
      setContent('');
    }
  }, [editId, auth]);

  const handlePublish = async () => {
    if (!content.trim() || content === '<p><br></p>') {
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
          'Authorization': `Basic ${auth}` 
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editId ? "Articolo aggiornato!" : "Articolo pubblicato!");
      } else {
        alert("Errore dal server: " + response.status);
      }
    } catch (error) {
      alert("Errore di connessione al server.");
    }
  };

  const config = {
    readonly: false,
    placeholder: 'Inizia a scrivere il tuo articolo...',
    uploader: { insertImageAsBase64URI: true },
    language: 'it',
    style: { fontFamily: 'Arial, sans-serif', fontSize: '18px' }
  };

  return (
    <div style={{ background: colors.lightGray, minHeight: '100vh' }}>
      <div style={headerStyle(colors)}>
        <h2 style={{color: colors.dark, margin: 0, fontSize: '20px', fontWeight: '600'}}>
          {editId ? `Gestione Articolo #${editId}` : "Nuovo Contenuto Magazine"}
        </h2>
        <button onClick={handlePublish} style={pubBtnStyle(colors)}>
          {editId ? "Salva Modifiche" : "Pubblica Ora"}
        </button>
      </div>

      <div style={editorWrapperStyle(colors)}>
        <JoditEditor
          key={editId || 'new'}
          ref={editor}
          value={content}
          config={config}
          onBlur={newContent => setContent(newContent)}
        />
      </div>
      <style>{`.jodit-wysiwyg img { max-width: 100%; border-radius: 4px; margin: 10px; }`}</style>
    </div>
  );
};

const headerStyle = (colors) => ({ background: colors.white, padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, zIndex: 1000 });
const editorWrapperStyle = (colors) => ({ maxWidth: '1100px', margin: '30px auto', background: colors.white, borderRadius: '8px', padding: '15px', border: `1px solid ${colors.border}` });
const pubBtnStyle = (colors) => ({ background: colors.primary, color: colors.white, border: 'none', padding: '10px 25px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' });

export default MagazineEditor;