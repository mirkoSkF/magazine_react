import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const MagazineEditor = ({ editId }) => {
  const editorRef = useRef(null);
  const [content, setContent] = useState('');
  const [zoom, setZoom] = useState(100);

  const token = localStorage.getItem('token');
  const authHeader = { 'Authorization': `Bearer ${token}` };

  const colors = {
    primary: '#007bff',
    dark: '#343a40',
    lightGray: '#f1f3f4',
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

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

  const handlePublish = async () => {
    const currentContent = editorRef.current ? editorRef.current.getContent() : content;
    if (!currentContent || currentContent.trim() === "" || currentContent === '<p></p>') {
      alert("L'articolo è vuoto!");
      return;
    }

    const payload = {
      numeroPagina: 1,
      moduli: [{
        tipo: "TESTO_TINY",
        contenuto: currentContent,
        fontFamily: "Arial",
        fontSize: 18
      }]
    };

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `http://localhost:8096/api/pagine/${editId}` : 'http://localhost:8096/api/pagine';

    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...authHeader }, body: JSON.stringify(payload) });
      if (response.ok) alert(editId ? "Articolo aggiornato!" : "Articolo pubblicato!");
      else alert("Errore dal server: " + response.status);
    } catch (error) {
      alert("Errore di connessione.");
    }
  };

  return (
    <div style={{ backgroundColor: colors.lightGray, minHeight: '100vh', overflowX: 'auto' }}>
      <div style={{ 
        background: colors.white, 
        padding: '10px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{color: colors.dark, margin: 0, fontSize: '18px'}}>{editId ? `Modifica #${editId}` : "Nuovo Articolo"}</h2>
          <div style={{ display: 'flex', alignItems: 'center', background: '#eee', borderRadius: '4px', padding: '2px' }}>
            <button onClick={handleZoomOut} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px 10px', fontSize: '16px' }}>−</button>
            <span style={{ fontSize: '14px', minWidth: '45px', textAlign: 'center', fontWeight: 'bold' }}>{zoom}%</span>
            <button onClick={handleZoomIn} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '5px 10px', fontSize: '16px' }}>+</button>
          </div>
        </div>
        <button onClick={handlePublish} style={{ background: colors.primary, color: 'white', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
          {editId ? "Salva Modifiche" : "Pubblica Ora"}
        </button>
      </div>
      
      <div style={{ 
        width: `${210 * (zoom / 100)}mm`,
        minHeight: `${297 * (zoom / 100)}mm`,
        margin: '30px auto', 
        transition: 'all 0.1s linear', 
        transformOrigin: 'top center',
        background: 'white', 
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        border: `1px solid ${colors.border}`
      }}>
        <Editor
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          onInit={(evt, editor) => editorRef.current = editor}
          value={content}
          init={{
            height: `${297 * (zoom / 100)}mm`, 
            menubar: true,
            language: 'it', 
            branding: false,
            promotion: false,
            license_key: 'gpl',
            resize: false,

            // --- CONFIGURAZIONE MARGINI ANALITICI ---
            image_advtab: true, 
            image_dimensions: true,
            // SBLOCCA I 4 INPUT SEPARATI (Top, Right, Bottom, Left)
            image_margins: true, 
            
            // Permettiamo esplicitamente gli stili di margine nel codice HTML
            extended_valid_elements: 'img[class|src|border=0|alt|title|hspace|vspace|width|height|align|onmouseover|onmouseout|name|style]',
            
            // --- PROTEZIONE FONT ARIAL (Mantieni intatto) ---
            forced_root_block: 'p',
            forced_root_block_attrs: {
              'style': 'font-family: Arial, Helvetica, sans-serif; font-size: 18px;'
            },
            invalid_styles: 'font-family font-size',
            
            setup: (editor) => {
              editor.on('init', () => {
                editor.getDoc().body.style.fontFamily = 'Arial, Helvetica, sans-serif';
                editor.getDoc().body.style.fontSize = '18px';
                editor.getContainer().style.border = 'none';
              });

              editor.on('NodeChange', () => {
                const node = editor.selection.getNode();
                if (node && (node.nodeName === 'P' || node.nodeName === 'DIV') && !node.style.fontFamily) {
                    node.style.fontFamily = 'Arial, Helvetica, sans-serif';
                    node.style.fontSize = '18px';
                }
              });

              editor.on('GetContent', (e) => {
                const div = document.createElement('div');
                div.innerHTML = e.content;
                div.querySelectorAll('p, span, div, li, td').forEach(el => {
                  el.style.fontFamily = 'Arial, Helvetica, sans-serif';
                  el.style.fontSize = '18px';
                });
                e.content = div.innerHTML;
              });
            },

            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'wordcount', 'help', 'emoticons',
              'autosave', 'directionality', 'pagebreak', 'nonbreaking', 'visualchars'
            ],
            
            toolbar_mode: 'wrap',
            toolbar: 'undo redo | blocks fontfamily fontsize | ' +
              'bold italic underline strikethrough | forecolor backcolor emoticons | ' +
              'alignleft aligncenter alignright alignjustify | ' +
              'bullist numlist outdent indent | link image media table | ' +
              'lineheight removeformat | charmap anchor pagebreak | ' +
              'visualblocks visualchars code fullscreen preview | help',
            
            content_style: `
              body { 
                font-family: Arial, Helvetica, sans-serif; 
                font-size: 18px; 
                padding: 20mm; 
                background-color: white;
                zoom: ${zoom / 100};
              }
              img { max-width: 100%; height: auto; }
            `,
            media_live_embeds: true
          }}
          onEditorChange={(newContent) => setContent(newContent)}
        />
      </div>
    </div>
  );
};

export default MagazineEditor;