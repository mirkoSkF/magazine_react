import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const MagazineEditor = ({ editId }) => {
  const editorRef = useRef(null);

  const [content, setContent] = useState('');
  const [zoom, setZoom] = useState(100);
  const [titolo, setTitolo] = useState('');
  const [sottotitolo, setSottotitolo] = useState('');
  const [copertina, setCopertina] = useState(null);
  const [tipo, setTipo] = useState('ARTICOLO');
  const [rubrica, setRubrica] = useState('NESSUNA'); // Stato rubrica

  const [publishHover, setPublishHover] = useState(false);
  const [modal, setModal] = useState({ show: false, message: '', type: 'confirm', onConfirm: null });

  const token = localStorage.getItem('token');
  const authHeader = { 'Authorization': `Bearer ${token}` };

  const colors = {
    primary: '#007bff', dark: '#343a40', lightGray: '#f1f3f4',
    border: '#dee2e6', white: '#ffffff', success: '#28a745',
    accent: '#e63946', hoverBlue: '#0056b3'
  };

  useEffect(() => {
    if (editId) {
      fetch(`https://magazine.skillfactory.it/api/pagine/${editId}`, { headers: authHeader })
        .then(res => res.json())
        .then(data => {
          setTitolo(data.titolo || '');
          setSottotitolo(data.sottotitolo || '');
          setCopertina(data.copertina || null);
          setTipo(data.tipo || 'ARTICOLO');
          setRubrica(data.rubrica || 'NESSUNA');
          if (data.moduli?.length > 0) setContent(data.moduli[0].contenuto);
        })
        .catch(err => console.error("Errore:", err));
    }
  }, [editId]);

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCopertina(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    }
  };

  const executePublish = async () => {
    let currentContent = editorRef.current ? editorRef.current.getContent() : content;
    if (sottotitolo.trim()) {
      currentContent = `<p style="font-size: 18px; color: #666; font-style: italic;">${sottotitolo.trim()}</p>` + currentContent;
    }

    const payload = {
      titolo, sottotitolo, copertina, tipo,
      rubrica: rubrica === 'NESSUNA' ? null : rubrica, // Gestione Articolo Libero
      numeroPagina: 1,
      moduli: [{ tipo: "TESTO_TINY", contenuto: currentContent }]
    };

    const response = await fetch(editId ? `https://magazine.skillfactory.it/api/pagine/${editId}` : 'https://magazine.skillfactory.it/api/pagine', {
      method: editId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify(payload)
    });

    if (response.ok) setModal({ show: true, message: "Salvato con successo!", type: 'success' });
    else setModal({ show: true, message: "Errore salvataggio", type: 'error' });
  };

  return (
    <div style={{ backgroundColor: colors.lightGray, minHeight: '100vh', padding: '40px' }}>
      {/* Controlli Rubrica */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', background: 'white', padding: '20px', borderRadius: '12px' }}>
        <div style={{ flex: 1 }}>
          <label>Tipo</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: '100%' }}>
            <option value="ARTICOLO">Articolo</option>
            <option value="RUBRICA">Rubrica</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label>Rubrica</label>
          <select value={rubrica} onChange={(e) => setRubrica(e.target.value)} style={{ width: '100%' }}>
            <option value="NESSUNA">-- Articolo Libero --</option>
            <option value="TECH">Tecnologia</option>
            <option value="FOOD">Food</option>
            <option value="VIAGGI">Viaggi</option>
            <option value="CULTURA">Cultura</option>
            <option value="SPORT">Sport</option>
            <option value="ECONOMIA">Economia</option>
          </select>
        </div>
      </div>

      <input type="text" value={titolo} onChange={(e) => setTitolo(e.target.value)} placeholder="Titolo" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
      <input type="text" value={sottotitolo} onChange={(e) => setSottotitolo(e.target.value)} placeholder="Sottotitolo" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />

      <Editor
        onInit={(evt, editor) => editorRef.current = editor}
        value={content}
        onEditorChange={(newContent) => setContent(newContent)}
        init={{ height: 500, plugins: ['link', 'image', 'code'], toolbar: 'bold italic | code' }}
      />

      <button onClick={() => setModal({ show: true, message: "Confermi la pubblicazione?", type: 'confirm', onConfirm: executePublish })} style={{ marginTop: '20px', padding: '15px' }}>
        Salva / Pubblica
      </button>

      {/* Modal e resto del codice invariato... */}
      {modal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '20px' }}>
            <p>{modal.message}</p>
            <button onClick={() => { if(modal.onConfirm) modal.onConfirm(); setModal({ ...modal, show: false }); }}>Procedi</button>
            <button onClick={() => setModal({ ...modal, show: false })}>Chiudi</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MagazineEditor;
