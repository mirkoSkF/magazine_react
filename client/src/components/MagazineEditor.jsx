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
  // Stato aggiunto per la gestione della rubrica
  const [rubrica, setRubrica] = useState('NESSUNA');

  const [publishHover, setPublishHover] = useState(false);

  const [modal, setModal] = useState({
    show: false,
    message: '',
    type: 'confirm',
    onConfirm: null
  });

  const token = localStorage.getItem('token');
  const authHeader = { 'Authorization': `Bearer ${token}` };

  const colors = {
    primary: '#007bff',
    dark: '#343a40',
    lightGray: '#f1f3f4',
    border: '#dee2e6',
    white: '#ffffff',
    success: '#28a745',
    accent: '#e63946',
    hoverBlue: '#0056b3',
    hoverGray: '#e2e6ea'
  };

  useEffect(() => {
    if (editId) {
      fetch(`https://magazine.skillfactory.it/api/pagine/${editId}`, {
        headers: authHeader
      })
        .then(res => res.json())
        .then(data => {
          setTitolo(data.titolo || '');
          setSottotitolo(data.sottotitolo || '');
          setCopertina(data.copertina || null);
          setTipo(data.tipo || 'ARTICOLO');
          // Caricamento rubrica
          setRubrica(data.rubrica || 'NESSUNA');
          if (data.moduli?.length > 0) {
            setContent(data.moduli[0].contenuto);
          }
        })
        .catch(err => console.error("Errore caricamento:", err));
    } else {
      setContent('');
      setTitolo('');
      setSottotitolo('');
      setCopertina(null);
      setTipo('ARTICOLO');
      setRubrica('NESSUNA');
    }
  }, [editId]);

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setCopertina(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateEditorZoom = (newZoom) => {
    setZoom(newZoom);
    if (editorRef.current) {
      const doc = editorRef.current.getDoc();
      const body = doc.body;
      const zoomValue = newZoom / 100;
      body.style.zoom = zoomValue;
      const images = body.querySelectorAll('img');
      images.forEach(img => {
        img.style.height = 'auto';
        img.style.maxWidth = '100%';
        if (img.style.float === 'left') img.style.margin = '10px 25px 15px 0';
        if (img.style.float === 'right') img.style.margin = '10px 0 15px 25px';
      });
    }
  };

  const handleZoomIn = () => updateEditorZoom(Math.min(zoom + 10, 200));
  const handleZoomOut = () => updateEditorZoom(Math.max(zoom - 10, 50));

  const executePublish = async () => {
    let currentContent = editorRef.current ? editorRef.current.getContent() : content;
    
    if (sottotitolo.trim()) {
      const subtitleHtml = `<p class="magazine-subtitle" style="font-size: 18px; color: #666; font-style: italic; margin-bottom: 25px; font-family: Arial, Helvetica, sans-serif;">${sottotitolo.trim()}</p>`;
      currentContent = subtitleHtml + currentContent;
    }

    const payload = {
      titolo: titolo,
      sottotitolo: sottotitolo,
      copertina: copertina,
      tipo: tipo,
      // Logica: se 'NESSUNA', invia null al database
      rubrica: rubrica === 'NESSUNA' ? null : rubrica,
      numeroPagina: 1,
      moduli: [{
        tipo: "TESTO_TINY",
        contenuto: currentContent,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 14
      }]
    };

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `https://magazine.skillfactory.it/api/pagine/${editId}` : 'https://magazine.skillfactory.it/api/pagine';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setModal({
          show: true,
          message: editId ? "Modifiche salvate correttamente!" : "Contenuto pubblicato con successo!",
          type: 'success'
        });
      } else {
        setModal({ show: true, message: "Errore dal server: " + response.status, type: 'error' });
      }
    } catch (error) {
      setModal({ show: true, message: "Errore di connessione al database.", type: 'error' });
    }
  };

  const handlePublish = () => {
    const currentContent = editorRef.current ? editorRef.current.getContent() : content;
    if (!titolo.trim()) {
      setModal({ show: true, message: "Attenzione: Inserisci un titolo prima di procedere.", type: 'error' });
      return;
    }
    if (!currentContent || currentContent.trim() === "" || currentContent === '<p></p>') {
      setModal({ show: true, message: "Attenzione: Il contenuto non può essere vuoto.", type: 'error' });
      return;
    }
    setModal({
      show: true,
      message: editId ? "Confermi di voler aggiornare questo contenuto?" : "Aggiungere la bozza nella dashboard?",
      type: 'confirm',
      onConfirm: executePublish
    });
  };

  return (
    <div style={{ backgroundColor: colors.lightGray, minHeight: '100vh', position: 'relative' }}>
      {modal.show && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '16px', maxWidth: '450px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>{modal.type === 'success' ? '✅' : modal.type === 'error' ? '❌' : '⚠️'}</div>
            <h3 style={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '22px', fontWeight: '800', color: colors.dark, marginBottom: '10px' }}>
              {modal.type === 'confirm' ? 'Richiesta di Conferma' : 'Notifica'}
            </h3>
            <p style={{ fontFamily: 'Arial', color: '#666', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>{modal.message}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {modal.type === 'confirm' ? (
                <>
                  <button onClick={() => setModal({ ...modal, show: false })} style={{ ...btnBase, background: '#f8f9fa', color: '#333', border: '1px solid #ddd' }}>Annulla</button>
                  <button onClick={() => { modal.onConfirm(); setModal({ ...modal, show: false }); }} style={{ ...btnBase, background: colors.primary, color: 'white' }}>Procedi</button>
                </>
              ) : (
                <button onClick={() => setModal({ ...modal, show: false })} style={{ ...btnBase, background: modal.type === 'error' ? colors.accent : colors.success, color: 'white' }}>Ho capito</button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mobile-warning { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: ${colors.dark}; color: white; z-index: 9999; padding: 40px; text-align: center; flex-direction: column; justify-content: center; align-items: center; font-family: Arial, sans-serif; }
        .floating-controls { position: fixed; right: 25px; top: 100px; display: flex; flex-direction: column; align-items: flex-end; gap: 15px; z-index: 2000; }
        .zoom-container { display: flex; flex-direction: column; align-items: center; gap: 5px; background: white; padding: 10px; border-radius: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        @media (max-width: 768px) { .mobile-warning { display: flex; } body { overflow: hidden; } }
      `}</style>

      <div className="mobile-warning">
        <h2>Editor non disponibile</h2>
        <button onClick={() => window.location.href = '/dashboard'} style={{ ...btnBase, background: '#ffffff', color: colors.dark }}>⬅️ Torna alla Home</button>
      </div>

      <div className="floating-controls">
        <button onClick={handlePublish} onMouseEnter={() => setPublishHover(true)} onMouseLeave={() => setPublishHover(false)} style={floatingButtonStyle(editId ? colors.success : colors.primary, publishHover)}>
          {editId ? "Salva Modifiche" : "Crea bozza"}
        </button>
        <div className="zoom-container">
          <button onClick={handleZoomOut} style={zoomButtonStyle}> − </button>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', minWidth: '35px', textAlign: 'center' }}>{zoom}%</span>
          <button onClick={handleZoomIn} style={zoomButtonStyle}> + </button>
        </div>
      </div>

      <div style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            
            {/* Controlli Tipo e Rubrica */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: colors.primary, textTransform: 'uppercase' }}>Tipo</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                  <option value="ARTICOLO">Articolo</option>
                  <option value="RUBRICA">Rubrica</option>
                  <option value="EDITORIALE">Editoriale</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: colors.primary, textTransform: 'uppercase' }}>Rubrica</label>
                <select value={rubrica} onChange={(e) => setRubrica(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                  <option value="NESSUNA">-- Articolo Libero --</option>
                  <option value="TECH">Tecnologia</option>
                  <option value="FOOD">Food</option>
                  <option value="VIAGGI">Viaggi</option>
                </select>
              </div>
            </div>

            <input type="text" placeholder="Titolo" value={titolo} onChange={(e) => setTitolo(e.target.value)} style={{ width: '100%', fontSize: '28px', fontWeight: 'bold', border: 'none', borderBottom: `2px solid ${colors.border}`, outline: 'none', marginBottom: '10px', paddingBottom: '10px' }} />
            <input type="text" placeholder="Sottotitolo opzionale..." value={sottotitolo} onChange={(e) => setSottotitolo(e.target.value)} style={{ width: '100%', fontSize: '18px', fontStyle: 'italic', border: 'none', borderBottom: `1px dashed ${colors.border}`, outline: 'none', marginBottom: '20px', paddingBottom: '8px', color: '#666' }} />
            
            <input type="file" onChange={handleCoverUpload} accept="image/*" />
            {copertina && <img src={`data:image/jpeg;base64,${copertina}`} alt="Cover" style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px' }} />}
          </div>

          <Editor
            onInit={(evt, editor) => { editorRef.current = editor; }}
            value={content}
            onEditorChange={(newContent) => setContent(newContent)}
            init={{
              height: 800,
              menubar: true,
              plugins: ['link', 'image', 'code', 'table', 'lists'],
              toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter | bullist numlist | link image | code',
              content_style: 'body { font-family: Arial; font-size: 14px; }'
            }}
          />
        </div>
      </div>
    </div>
  );
};

const btnBase = { padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const floatingButtonStyle = (color, isHover) => ({
  background: isHover ? '#0056b3' : color, color: 'white', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', border: 'none'
});
const zoomButtonStyle = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' };

export default MagazineEditor;
