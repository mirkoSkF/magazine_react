import React, { useRef, useEffect, useState } from 'react';
import JoditEditor from 'jodit-react';

const MagazineEditor = ({ editId }) => {
  const editor = useRef(null);
  const [content, setContent] = useState('');

  // Palette Skillfactory Training
  const colors = {
    primary: '#007bff',
    dark: '#343a40',
    lightGray: '#f8f9fa',
    border: '#dee2e6',
    white: '#ffffff'
  };

  useEffect(() => {
    if (editId) {
      fetch(`http://localhost:8096/api/pagine/${editId}`)
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
    const htmlContent = content; 

    if (!htmlContent || htmlContent.trim() === "" || htmlContent === '<p><br></p>') {
      alert("L'articolo è vuoto!");
      return;
    }

    const payload = {
      numeroPagina: 1,
      moduli: [{
        tipo: "TESTO_JODIT",
        contenuto: htmlContent,
        fontFamily: "Arial",
        fontSize: 18
      }]
    };

    const credentials = btoa("admin:123");
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `http://localhost:8096/api/pagine/${editId}` : 'http://localhost:8096/api/pagine';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}` 
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editId ? "Articolo aggiornato con successo!" : "Articolo pubblicato con successo!");
      } else {
        alert("Errore dal server: " + response.status);
      }
    } catch (error) {
      alert("Errore di connessione al server Spring Boot.");
    }
  };

  const config = {
    readonly: false,
    placeholder: 'Inizia a scrivere il tuo articolo...',
    uploader: { insertImageAsBase64URI: true },
    language: 'it',
    style: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      background: '#ffffff'
    }
  };

  // --- STILI AGGIORNATI STILE TRAINING ---
  const containerStyle = { background: colors.lightGray, minHeight: '100vh' };
  
  const headerStyle = { 
    background: colors.white, 
    padding: '15px 40px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    position: 'sticky', 
    top: 0, 
    zIndex: 1000,
    borderBottom: `1px solid ${colors.border}`,
    boxShadow: '0 2px 4px rgba(0,0,0,.05)'
  };

  const editorWrapperStyle = { 
    maxWidth: '1100px', 
    margin: '30px auto', 
    background: colors.white, 
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)', 
    padding: '15px',
    border: `1px solid ${colors.border}`
  };

  const pubBtnStyle = { 
    background: colors.primary, 
    color: colors.white, 
    border: 'none', 
    padding: '10px 25px', 
    borderRadius: '4px', 
    fontWeight: '600', 
    cursor: 'pointer',
    transition: 'background 0.2s'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={{color: colors.dark, margin: 0, fontSize: '20px', fontWeight: '600'}}>
          {editId ? `Gestione Articolo #${editId}` : "Nuovo Contenuto Magazine"}
        </h2>
        <button 
          onClick={handlePublish} 
          style={pubBtnStyle}
          onMouseOver={(e) => e.target.style.background = '#0056b3'}
          onMouseOut={(e) => e.target.style.background = colors.primary}
        >
          {editId ? "Salva Modifiche" : "Pubblica Ora"}
        </button>
      </div>

      <div style={editorWrapperStyle}>
        <JoditEditor
          key={editId || 'new'}
          ref={editor}
          value={content}
          config={config}
          onBlur={newContent => setContent(newContent)}
          onChange={() => {}}
        />
      </div>

      <style>{`
        .jodit-wysiwyg img { max-width: 100%; border-radius: 4px; margin: 10px; }
        .jodit-container { border: none !important; }
      `}</style>
    </div>
  );
};

export default MagazineEditor;