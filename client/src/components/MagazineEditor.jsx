import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const MagazineEditor = ({ editId }) => {
  const editorRef = useRef(null);
  const [content, setContent] = useState('');
  const [zoom, setZoom] = useState(100);
  
  // NUOVI STATI PER TITOLO E COPERTINA
  const [titolo, setTitolo] = useState('');
  const [copertina, setCopertina] = useState(null);

  const token = localStorage.getItem('token');
  const authHeader = { 'Authorization': `Bearer ${token}` };

  const colors = {
    primary: '#007bff',
    dark: '#343a40',
    lightGray: '#f1f3f4',
    border: '#dee2e6',
    white: '#ffffff',
    success: '#28a745'
  };

  useEffect(() => {
    if (editId) {
      fetch(`http://localhost:8096/api/pagine/${editId}`, { headers: authHeader })
        .then(res => res.json())
        .then(data => {
          setTitolo(data.titolo || '');
          setCopertina(data.copertina || null);
          if (data.moduli?.length > 0) {
            setContent(data.moduli[0].contenuto);
          }
        })
        .catch(err => console.error("Errore caricamento:", err));
    } else {
      setContent('');
      setTitolo('');
      setCopertina(null);
    }
  }, [editId]);

  // Gestione Upload Copertina (Logica Base64 come profilo)
  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Rimuoviamo il prefisso data:image/...;base64, se presente per coerenza col DB
        const base64String = reader.result.split(',')[1];
        setCopertina(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateEditorZoom = (newZoom) => {
    setZoom(newZoom);
    if (editorRef.current) {
      const body = editorRef.current.getDoc().body;
      body.style.zoom = newZoom / 100;
    }
  };

  const handleZoomIn = () => updateEditorZoom(Math.min(zoom + 10, 200));
  const handleZoomOut = () => updateEditorZoom(Math.max(zoom - 10, 50));

  const handlePublish = async () => {
    const currentContent = editorRef.current ? editorRef.current.getContent() : content;
    
    if (!titolo.trim()) {
      alert("Inserisci un titolo per l'articolo!");
      return;
    }

    if (!currentContent || currentContent.trim() === "" || currentContent === '<p></p>') {
      alert("L'articolo è vuoto!");
      return;
    }

    const payload = {
      titolo: titolo,
      copertina: copertina,
      numeroPagina: 1,
      moduli: [{
        tipo: "TESTO_TINY",
        contenuto: currentContent,
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 18
      }]
    };

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `http://localhost:8096/api/pagine/${editId}` : 'http://localhost:8096/api/pagine';

    try {
      const response = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json', ...authHeader }, 
        body: JSON.stringify(payload) 
      });
      if (response.ok) alert(editId ? "Articolo aggiornato!" : "Articolo pubblicato!");
      else alert("Errore dal server: " + response.status);
    } catch (error) {
      alert("Errore di connessione.");
    }
  };

  return (
    <div style={{ backgroundColor: colors.lightGray, minHeight: '100vh', position: 'relative' }}>
      
      {/* Bottoni Floating */}
      <div style={{
        position: 'fixed',
        right: '25px',
        top: '100px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        zIndex: 2000
      }}>
        <button onClick={handlePublish} style={floatingButtonStyle(colors.primary)} title="Salva">💾</button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: 'white', padding: '10px', borderRadius: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <button onClick={handleZoomIn} style={zoomButtonStyle}>+</button>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666' }}>{zoom}%</span>
          <button onClick={handleZoomOut} style={zoomButtonStyle}>−</button>
        </div>
      </div>

      <div style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SEZIONE EDITORIALE: TITOLO E COPERTINA */}
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <input 
              type="text"
              placeholder="Inserisci il titolo dell'articolo..."
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              style={{ 
                width: '100%', 
                fontSize: '28px', 
                fontWeight: 'bold', 
                border: 'none', 
                borderBottom: `2px solid ${colors.border}`,
                outline: 'none',
                marginBottom: '20px',
                paddingBottom: '10px',
                fontFamily: 'Georgia, serif'
              }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>Immagine di Copertina</label>
                <input type="file" onChange={handleCoverUpload} accept="image/*" style={{ fontSize: '14px' }} />
              </div>
              {copertina && (
                <div style={{ width: '150px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                  <img src={`data:image/jpeg;base64,${copertina}`} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>

          {/* EDITOR TINYMCE */}
          <div style={{ 
            background: 'white', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden'
          }}>
            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              onInit={(evt, editor) => {
                  editorRef.current = editor;
                  editor.getDoc().body.style.zoom = zoom / 100;
              }}
              value={content}
              init={{
                min_height: 600,
                menubar: true,
                language: 'it', 
                branding: false,
                promotion: false,
                license_key: 'gpl',
                statusbar: true,
                elementpath: true,
                image_advtab: true,
                image_margins: true,
                valid_children: '+body[style],+p[style],+span[style]',
                valid_styles: {
                  '*': 'font-family,font-size,color,background-color,text-align,margin,margin-top,margin-right,margin-bottom,margin-left,padding,float,display,width,height,border'
                },
                extended_valid_elements: 'p[style|align],div[style|align],span[style],img[class|src|border=0|alt|title|hspace|vspace|width|height|align|style]',
                verify_html: false,
                inline_styles: true,
                forced_root_block: 'p',
                font_family_formats: 'Arial=arial,helvetica,sans-serif; Georgia=georgia,palatino,serif; Courier New=courier new,courier,monospace;',
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'wordcount', 'help', 'emoticons',
                  'autosave', 'directionality', 'pagebreak', 'nonbreaking', 'visualchars', 'autoresize'
                ],
                toolbar_mode: 'wrap',
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor emoticons | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | lineheight removeformat | charmap anchor pagebreak | visualblocks visualchars code fullscreen preview | help',
                content_style: `
                  body { 
                    font-family: Arial, Helvetica, sans-serif; 
                    font-size: 18px; 
                    line-height: 1.8; 
                    color: #333; 
                    padding: 40px !important; 
                    text-align: justify;
                    margin: 0 !important;
                    box-sizing: border-box;
                  }
                  img { max-width: 100%; height: auto; display: block; margin: 25px auto; border-radius: 8px; }
                `,
                setup: (editor) => {
                  editor.on('GetContent', (e) => {
                    const div = document.createElement('div');
                    div.innerHTML = e.content;
                    div.querySelectorAll('p, span, div, li, td').forEach(el => {
                      if (!el.style.fontFamily) el.style.fontFamily = 'Arial, Helvetica, sans-serif';
                      if (!el.style.fontSize) el.style.fontSize = '18px';
                    });
                    e.content = div.innerHTML;
                  });
                }
              }}
              onEditorChange={(newContent) => setContent(newContent)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const floatingButtonStyle = (color) => ({
  background: color, color: 'white', border: 'none', width: '45px', height: '45px', borderRadius: '12px',
  cursor: 'pointer', fontSize: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
});

const zoomButtonStyle = { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#555', padding: '5px' };

export default MagazineEditor;