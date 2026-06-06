import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

const MagazineEditor = ({ editId }) => {
  const editorRef = useRef(null);

  const [content, setContent] = useState('');
  const [zoom, setZoom] = useState(100);

  const [titolo, setTitolo] = useState('');
  const [sottotitolo, setSottotitolo] = useState(''); // Stato per il sottotitolo opzionale
  const [rubrica, setRubrica] = useState('');         // Stato aggiunto per la gestione del campo rubrica (String)
  const [copertina, setCopertina] = useState(null);
  const [tipo, setTipo] = useState('ARTICOLO');

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

  // Array delle 6 rubriche per il menu di selezione
  const opzioniRubriche = [
    { value: 'FORMATORE', label: '📚 Il Formatore' },
    { value: 'QUALITA', label: '📚 Formazione & Qualità' },
    { value: 'IFP', label: '🌍 Ecosistema IFP' },
    { value: 'DIGITALI', label: '💻 Competenze Digitali' },
    { value: 'AI', label: '💻 AI & Formazione' },
    { value: 'LAVORO', label: '📚 Orientamento & Lavoro' }
  ];

  useEffect(() => {
    if (editId) {
      fetch(`https://magazine.skillfactory.it/api/pagine/${editId}`, {
        headers: authHeader
      })
        .then(res => res.json())
        .then(data => {
          setTitolo(data.titolo || '');
          setSottotitolo(data.sottotitolo || ''); // Carica il sottotitolo se esistente
          setRubrica(data.rubrica || '');         // Carica il valore della rubrica dal DB
          setCopertina(data.copertina || null);
          setTipo(data.tipo || 'ARTICOLO');
          if (data.moduli?.length > 0) {
            setContent(data.moduli[0].contenuto);
          }
        })
        .catch(err => console.error("Errore caricamento:", err));
    } else {
      setContent('');
      setTitolo('');
      setSottotitolo(''); // Reset in caso di nuova pagina
      setRubrica('');     // Reset della rubrica
      setCopertina(null);
      setTipo('ARTICOLO');
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
    
    // Se l'utente ha inserito un sottotitolo, lo inietta formattato in testa al contenuto HTML
    if (sottotitolo.trim()) {
      const subtitleHtml = `<p class="magazine-subtitle" style="font-size: 18px; color: #666; font-style: italic; margin-bottom: 25px; font-family: Arial, Helvetica, sans-serif;">${sottotitolo.trim()}</p>`;
      currentContent = subtitleHtml + currentContent;
    }

    const payload = {
      titolo: titolo,
      sottotitolo: sottotitolo, // Aggiunto al payload generale nel caso servisse al backend
      rubrica: rubrica,         // Inserito nel payload mappando il campo String del backend
      copertina: copertina,
      tipo: tipo,
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
    // Validazione opzionale: se l'utente mette tipo "RUBRICA", lo forziamo a scegliere quale rubrica sia
    if (tipo === "RUBRICA" && !rubrica) {
      setModal({ show: true, message: "Attenzione: Seleziona una rubrica per i contenuti di tipo Rubrica.", type: 'error' });
      return;
    }
    // Il sottotitolo viene saltato dai controlli di validazione per renderlo opzionale
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
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white', padding: '40px', borderRadius: '16px',
            maxWidth: '450px', width: '90%', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: 'none'
          }}>
            <div style={{ fontSize: '50px', marginBottom: '20px' }}>
              {modal.type === 'success' ? '✅' : modal.type === 'error' ? '❌' : '⚠️'}
            </div>
            <h3 style={{ fontFamily: 'Inter, Arial, sans-serif', fontSize: '22px', fontWeight: '800', color: colors.dark, marginBottom: '10px' }}>
              {modal.type === 'confirm' ? 'Richiesta di Conferma' : 'Notifica'}
            </h3>
            <p style={{ fontFamily: 'Arial', color: '#666', fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
              {modal.message}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {modal.type === 'confirm' ? (
                <>
                  <button 
                    onClick={() => setModal({ ...modal, show: false })}
                    onMouseOver={(e) => { e.target.style.background = '#e2e6ea'; }}
                    onMouseOut={(e) => { e.target.style.background = '#f8f9fa'; }}
                    style={{ ...btnBase, background: '#f8f9fa', color: '#333', border: '1px solid #ddd' }}
                  > Annulla </button>
                  <button 
                    onClick={() => { modal.onConfirm(); setModal({ ...modal, show: false }); }}
                    onMouseOver={(e) => { e.target.style.background = colors.hoverBlue; }}
                    onMouseOut={(e) => { e.target.style.background = colors.primary; }}
                    style={{ ...btnBase, background: colors.primary, color: 'white' }}
                  > Procedi </button>
                </>
              ) : (
                <button 
                  onClick={() => setModal({ ...modal, show: false })}
                  onMouseOver={(e) => { e.target.style.background = modal.type === 'error' ? '#bd2130' : '#1e7e34'; }}
                  onMouseOut={(e) => { e.target.style.background = modal.type === 'error' ? colors.accent : colors.success; }}
                  style={{ ...btnBase, background: modal.type === 'error' ? colors.accent : colors.success, color: 'white' }}
                > Ho capito </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .mobile-warning {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: ${colors.dark};
            color: white;
            z-index: 9999;
            padding: 40px;
            text-align: center;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: Arial, sans-serif;
          }

          .floating-controls {
            position: fixed;
            right: 25px;
            top: 100px;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 15px;
            z-index: 2000;
          }

          .zoom-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            background: white;
            padding: 10px;
            border-radius: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }

          @media (max-width: 768px) {
            .mobile-warning { display: flex; }
            body { overflow: hidden; }
          }

          @media (max-width: 1024px) {
            .floating-controls {
              position: sticky; top: 10px; right: 0;
              flex-direction: row; justify-content: center;
              margin-bottom: 20px; width: 100%; padding: 10px;
              box-sizing: border-box;
            }
            .zoom-container { flex-direction: row !important; padding: 5px 15px !important; border-radius: 50px !important; }
          }
        `}
      </style>

      <div className="mobile-warning">
        <div style={{ fontSize: '50px', marginBottom: '20px' }}> 📱 </div>
        <h2>Editor non disponibile</h2>
        <p style={{ marginBottom: '30px' }}> L'interfaccia di scrittura richiede uno schermo più ampio (Tablet o PC). </p>
        <button
          onClick={() => window.location.href = '/dashboard'}
          onMouseOver={(e) => { e.target.style.background = '#f1f3f4'; }}
          onMouseOut={(e) => { e.target.style.background = '#ffffff'; }}
          style={{
            ...btnBase,
            background: '#ffffff',
            color: colors.dark,
            padding: '12px 30px',
            borderRadius: '30px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ⬅️ Torna alla Home
        </button>
      </div>

      <div className="floating-controls">
        <button
          onClick={handlePublish}
          onMouseEnter={() => setPublishHover(true)}
          onMouseLeave={() => setPublishHover(false)}
          style={floatingButtonStyle(editId ? colors.success : colors.primary, publishHover)}
        >
          {editId ? "Salva Modifiche" : "Crea bozza"}
        </button>

        <div className="zoom-container">
          <button onClick={handleZoomOut} style={zoomButtonStyle}> − </button>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', fontFamily: 'Arial', minWidth: '35px', textAlign: 'center' }}>
            {zoom}%
          </span>
          <button onClick={handleZoomIn} style={zoomButtonStyle}> + </button>
        </div>
      </div>

      <div style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: `1px solid ${colors.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: colors.primary, textTransform: 'uppercase', fontFamily: 'Arial' }}>
                  Tipo di Contenuto
                </label>
                <select
                  value={tipo}
                  onChange={(e) => {
                    const nuovoTipo = e.target.value;
                    setTipo(nuovoTipo);
                    // Se non è né articolo né rubrica, svuota il campo rubrica per pulizia payload
                    if (nuovoTipo !== "ARTICOLO" && nuovoTipo !== "RUBRICA") {
                      setRubrica('');
                    }
                    if (nuovoTipo === "SONDAGGIO" && (!content || content === '<p></p>')) {
                      setContent('<ul><li>Opzione 1</li><li>Opzione 2</li></ul>');
                    }
                  }}
                  style={{ padding: '5px 10px', borderRadius: '4px', border: `1px solid ${colors.border}`, fontFamily: 'Arial', fontSize: '12px', fontWeight: 'bold' }}
                >
                  <option value="ARTICOLO">📰 Articolo Standard</option>
                  <option value="EDITORIALE">✍️ Editoriale</option>
                  <option value="SONDAGGIO">📊 Sondaggio Interattivo</option>
                  <option value="EVENTO">📅 Evento</option>
                </select>
              </div>

              {/* MENU DI ASSOCIAZIONE RUBRICA: visibile se il tipo è ARTICOLO oppure RUBRICA */}
              {(tipo === "ARTICOLO" || tipo === "RUBRICA") && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057', textTransform: 'uppercase', fontFamily: 'Arial' }}>
                    Associa a Rubrica
                  </label>
                  <select
                    value={rubrica}
                    onChange={(e) => setRubrica(e.target.value)}
                    style={{ 
                      padding: '5px 10px', 
                      borderRadius: '4px', 
                      border: `1px solid ${rubrica ? colors.primary : colors.border}`, 
                      fontFamily: 'Arial', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      backgroundColor: rubrica ? '#e7f1ff' : '#ffffff'
                    }}
                  >
                    <option value="">-- Articolo Libero (Nessuna Rubrica) --</option>
                    {opzioniRubriche.map((opz) => (
                      <option key={opz.value} value={opz.value}>{opz.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder={
                tipo === "SONDAGGIO" ? "Inserisci la domanda del sondaggio..." : 
                tipo === "RUBRICA" ? "Inserisci il titolo della rubrica..." : 
                tipo === "EVENTO" ? "Inserisci il titolo dell'evento..." :
                tipo === "EDITORIALE" ? "Inserisci il titolo dell'editoriale..." :
                "Inserisci il titolo dell'articolo..."
              }
              value={titolo}
              onChange={(e) => setTitolo(e.target.value)}
              style={{ width: '100%', fontSize: '28px', fontWeight: 'bold', border: 'none', borderBottom: `2px solid ${tipo === "SONDAGGIO" ? colors.accent : colors.border}`, outline: 'none', marginBottom: '10px', paddingBottom: '10px', fontFamily: 'Arial, Helvetica, sans-serif' }}
            />

            {/* Input per il sottotitolo opzionale */}
            <input
              type="text"
              placeholder="Inserisci un sottotitolo opzionale..."
              value={sottotitolo}
              onChange={(e) => setSottotitolo(e.target.value)}
              style={{ width: '100%', fontSize: '18px', fontWeight: 'normal', fontStyle: 'italic', border: 'none', borderBottom: `1px dashed ${colors.border}`, outline: 'none', marginBottom: '20px', paddingBottom: '8px', color: '#666', fontFamily: 'Arial, Helvetica, sans-serif' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#666', marginBottom: '8px', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  Immagine di Copertina
                </label>
                <input type="file" onChange={handleCoverUpload} accept="image/*" style={{ fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif' }} />
              </div>
              {copertina && (
                <div style={{ width: '150px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
                  <img src={`data:image/jpeg;base64,${copertina}`} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>

          <div style={{ background: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '10px 20px', background: colors.lightGray, borderBottom: `1px solid ${colors.border}`, fontSize: '13px', color: '#666', fontFamily: 'Arial' }}>
              {
                tipo === "SONDAGGIO" ? "⚠️ Importante: Elenca le opzioni di voto usando un elenco puntato" : 
                tipo === "RUBRICA" ? "Scrivi il contenuto della rubrica qui sotto" : 
                tipo === "EVENTO" ? "Inserisci i dettagli e la descrizione dell'evento qui sotto" :
                tipo === "EDITORIALE" ? "Scrivi il corpo dell'editoriale qui sotto" :
                "Scrivi il corpo dell'articolo qui sotto"
              }
            </div>

            <Editor
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              onInit={(evt, editor) => {
                editorRef.current = editor;
                const body = editor.getDoc().body;
                body.style.zoom = zoom / 100;
              }}
              value={content}
              init={{
                min_height: 1200, 
                menubar: true,
                language: 'it',
                language_url: '/tinymce/langs/it.js',
                branding: false,
                promotion: false,
                license_key: 'gpl',
                statusbar: true,
                elementpath: true,
                image_advtab: true,
                image_margins: true,
                valid_children: '+body[style],+p[style],+span[style]',
                valid_styles: { '*': 'font-family,font-size,color,background-color,text-align,margin,margin-top,margin-right,margin-bottom,margin-left,padding,float,display,width,height,border' },
                extended_valid_elements: 'p[style|align],div[style|align],span[style],img[class|src|border=0|alt|title|hspace|vspace|width|height|align|style]',
                verify_html: false,
                inline_styles: true,
                forced_root_block: 'p',
                font_family_formats: "Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;Comic Sans MS=comic sans ms,sans-serif;Courier New=courier new,courier;Georgia=georgia,palatino;Helvetica=helvetica;Impact=impact,chicago;Inter=Inter,sans-serif;Lato=Lato,sans-serif;Montserrat=Montserrat,sans-serif;Open Sans=Open Sans,sans-serif;Oswald=Oswald,sans-serif;Playfair Display=playfair display,serif;Poppins=Poppins,sans-serif;Roboto=Roboto,sans-serif;Tahoma=tahoma,arial,helvetica,sans-serif;Times New Roman=times new roman,times;Trebuchet MS=trebuchet ms,geneva;Verdana=verdana,geneva;",
                plugins: ['advlist','autolink','lists','link','image','charmap','anchor','searchreplace','visualblocks','code','fullscreen','insertdatetime','media','table','wordcount','help','autosave','directionality','pagebreak','nonbreaking','visualchars'],
                toolbar_mode: 'wrap',
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | lineheight removeformat | charmap anchor pagebreak | visualblocks visualchars code fullscreen | help',
                content_style: `
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lato:wght@400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Oswald:wght@400;700&family=Playfair+Display:wght@700&family=Poppins:wght@400;700&family=Roboto:wght@400;700&display=swap');
                  body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.7; color: #333; padding: 40px !important; margin: 0 !important; box-sizing: border-box; }
                  img { max-width: 100%; height: auto !important; display: block; margin: 25px auto; border-radius: 8px; transition: margin 0.2s ease; }
                  img[style*="float: left"] { margin: 10px 25px 15px 0 !important; float: left; }
                  img[style*="float: right"] { margin: 10px 0 15px 25px !important; float: right; }
                  figure.image { margin: 25px auto !important; }
                  figure.image.image-style-align-left, figure.image.image-style-float-left { margin: 10px 25px 15px 0 !important; }
                  figure.image.image-style-align-right, figure.image.image-style-float-right { margin: 10px 0 15px 25px !important; }
                `,
                setup: (editor) => {
                  editor.on('NodeChange', () => {
                    const images = editor.getBody().querySelectorAll('img');
                    images.forEach(img => {
                      img.style.maxWidth = '100%';
                      img.style.height = 'auto';
                      if (img.style.float === 'left') img.style.margin = '10px 25px 15px 0';
                      if (img.style.float === 'right') img.style.margin = '10px 0 15px 25px';
                    });
                  });

                  editor.on('GetContent', (e) => {
                    const div = document.createElement('div');
                    div.innerHTML = e.content;
                    div.querySelectorAll('p, span, div, li, td').forEach(el => {
                      if (!el.style.fontFamily) el.style.fontFamily = 'Arial, Helvetica, sans-serif';
                      if (!el.style.fontSize) el.style.fontSize = '14px';
                      
                      if (!el.style.textAlign) {
                        el.style.textAlign = 'left';
                      }
                    });
                    div.querySelectorAll('img').forEach(img => {
                      img.style.maxWidth = '100%';
                      img.style.height = 'auto';
                      if (img.style.float === 'left') img.style.margin = '10px 25px 15px 0';
                      if (img.style.float === 'right') img.style.margin = '10px 0 15px 25px';
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

const btnBase = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: '0.3s',
  fontWeight: '600',
  fontSize: '14px',
  fontFamily: 'Inter, Arial, sans-serif'
};

const floatingButtonStyle = (color, isHover) => ({
  background: isHover ? (color === '#007bff' ? '#0056b3' : '#1e7e34') : color,
  color: 'white',
  border: 'none',
  padding: '0 25px',
  height: '48px',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '700',
  boxShadow: isHover ? '0 12px 24px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
  fontFamily: 'Inter, Arial, sans-serif',
  transition: 'all 0.3s ease',
  transform: isHover ? 'translateY(-2px)' : 'translateY(0)'
});

const zoomButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '20px',
  cursor: 'pointer',
  color: '#555',
  padding: '5px'
};

export default MagazineEditor;
