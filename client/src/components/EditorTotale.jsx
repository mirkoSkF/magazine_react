import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const EditorTotale = ({ initialHtml, initialCss, onSave, onExit }) => {
  // Stati per le modifiche correnti
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [activeTab, setActiveTab] = useState('html'); // Gestisce lo scambio tra HTML e CSS

  // Effetto per iniettare il CSS in tempo reale nell'anteprima
  useEffect(() => {
    const styleId = 'live-preview-css';
    let styleTag = document.getElementById(styleId);
    
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    
    styleTag.innerHTML = css;
    
    // Pulizia quando si chiude l'editor
    return () => {
      if (styleTag) styleTag.innerHTML = initialCss;
    };
  }, [css, initialCss]);

  // Funzione di ripristino (Reset)
  const handleReset = () => {
    const conferma = window.confirm(
      "ATTENZIONE: Ripristinando le condizioni originali perderai tutte le modifiche non salvate in questa sessione. Continuare?"
    );
    if (conferma) {
      setHtml(initialHtml);
      setCss(initialCss);
    }
  };

  // Stili CSS-in-JS per l'interfaccia
  const styles = {
    overlay: {
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: '#1e1e1e', zIndex: 10000, display: 'flex', flexDirection: 'column'
    },
    header: {
      height: '50px', background: '#2d2d2d', display: 'flex', 
      justifyContent: 'space-between', alignItems: 'center', padding: '0 20px',
      borderBottom: '1px solid #444'
    },
    tabBtn: (active) => ({
      padding: '10px 20px', backgroundColor: active ? '#1e1e1e' : 'transparent',
      color: active ? '#007bff' : '#ccc', border: 'none', cursor: 'pointer',
      fontWeight: 'bold', borderBottom: active ? '2px solid #007bff' : 'none'
    }),
    saveBtn: {
      backgroundColor: '#28a745', color: 'white', border: 'none',
      padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
    },
    resetBtn: {
      backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d',
      padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.header}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={styles.tabBtn(activeTab === 'html')} onClick={() => setActiveTab('html')}>HTML</button>
          <button style={styles.tabBtn(activeTab === 'css')} onClick={() => setActiveTab('css')}>CSS</button>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button style={styles.resetBtn} onClick={handleReset}>🔄 Ripristina Originale</button>
          <button style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }} onClick={onExit}>Annulla</button>
          <button style={styles.saveBtn} onClick={() => onSave(html, css)}>Salva Modifiche</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LATO EDITOR */}
        <div style={{ width: '45%', borderRight: '1px solid #444' }}>
          <Editor
            height="100%"
            theme="vs-dark"
            language={activeTab}
            value={activeTab === 'html' ? html : css}
            onChange={(val) => activeTab === 'html' ? setHtml(val) : setCss(val)}
            options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: 'on' }}
          />
        </div>

        {/* LATO ANTEPRIMA */}
        <div style={{ width: '55%', backgroundColor: 'white', overflowY: 'auto', padding: '20px' }}>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
};

export default EditorTotale;