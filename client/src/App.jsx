import React, { useState, useEffect } from 'react';
import MagazineEditor from './components/MagazineEditor';
import DashboardEditore from './components/DashboardEditore';
import IndexPubblicazioni from './components/IndexPubblicazioni';
import ArticoloSingolo from './components/ArticoloSingolo';
import Login from './components/Login';
import FormIntervista from './components/FormIntervista';
import DashboardInterviste from './components/DashboardInterviste';
import DettaglioIntervista from './components/DettaglioIntervista';
import PaginaEventi from './components/PaginaEventi'; // Importazione del nuovo componente

// --- COMPONENTE PRIVACY INTEGRATO CON TESTO INTEGRALE ---
const PrivacyContent = ({ onBack }) => (
  <div style={{
    padding: '40px 20px',
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'left',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    lineHeight: '1.6',
    color: '#333',
    maxHeight: '80vh',
    overflowY: 'auto'
  }}>
    <button
      onClick={onBack}
      style={{
        cursor: 'pointer', marginBottom: '30px', padding: '10px 20px',
        backgroundColor: '#007bff', color: 'white', border: 'none',
        borderRadius: '4px', fontWeight: 'bold'
      }}
    >
      &larr; Torna al Magazine
    </button>

    <h1 style={{ fontSize: '22px', borderBottom: '2px solid #007bff', paddingBottom: '10px', color: '#333' }}>
      INFORMATIVA SUL TRATTAMENTO DEI DATI PERSONALI DI COLORO CHE CONSULTANO IL SITO INTERNET
    </h1>

    <p>Gentile Utente, ai sensi dell’art. 13 del regolamento (UE) n.2016/679 del Parlamento Europeo e del Consiglio del 27/04/2016, di seguito GDPR, la Società SKILL FACTORY S.R.L., La informa di quanto segue:</p>

    <h3 style={{ fontSize: '18px', marginTop: '20px' }}>A) Finalità del trattamento dei dati e base giuridica</h3>
    <p>I Suoi dati personali sono trattati dalla SKILL FACTORY S.R.L. in qualità di Titolare del trattamento per le seguenti Finalità di Servizio:</p>
    <p><strong>A1)</strong> Acquisizione, trattamento e conservazione anche digitale di dati personali ai fini della navigazione sul sito www.skillfactory.it onde garantire la sicurezza del Sito e delle informazioni sullo stesso scambiate...</p>
    <p><strong>A2)</strong> Acquisizione, trattamento e conservazione anche digitale di dati personali degli interessati (quali dati anagrafici, numero di telefono ed indirizzo e-mail) per consentire l’erogazione dei servizi da lei richiesti...</p>
    <p><strong>A3)</strong> Acquisizione, trattamento e conservazione anche digitale di dati personali degli utenti, quali dati anagrafici, codice fiscale, cv per l’esecuzione di un contratto di cui l’interessato è parte o all’esecuzione di misure precontrattuali dettate su richiesta dello stesso, per l’iscrizione e partecipazione a corsi di formazione di potenziali risorse con inserimento sulla piattaforma Skillbook nella sezione utenti e conseguente inserimento lavorativo;</p>
    <p><strong>A4)</strong> Acquisizione, trattamento e conservazione anche digitale di dati personali dei discenti, quali dati anagrafici, numero di telefono ed indirizzo e-mail per consentire l’erogazione del servizio di newsletter, attivabile con la sua espressa indicazione al momento della compilazione del relativo form;</p>
    <p><strong>A5)</strong> Acquisizione, trattamento e conservazione anche digitale di dati personali per attività di mail marketing, social media marketing, digital marketing, servizi, news, blogging, attività promozionali ed eventi;</p>
    <p><strong>A6)</strong> I dati degli utenti sono gestiti dalla piattaforma Skillbook cui si accede automaticamente dopo la registrazione sul sito www.skillfactory.it, e possono essere ceduti a terzi e ad aziende per facilitare l’inserimento lavorativo;</p>
    <p><strong>A7)</strong> Adempiere agli obblighi previsti dalla legge, da un regolamento, dalla normativa comunitaria o da un ordine dell’Autorità...</p>
    <p><strong>A8)</strong> Esercitare i diritti del Titolare, ad esempio il diritto di difesa in giudizio (es. art. 24 Cost.);</p>
    <p>Le informazioni che seguono riguardano esclusivamente il predetto Sito. Non riguardano canali diversi dal Sito e, nella specie, non riguardano altri siti internet, pagine e/o servizi raggiungibili tramite link ipertestuali pubblicati in questo Sito.</p>

    <h3 style={{ fontSize: '18px', marginTop: '20px' }}>B) Natura del conferimento dei dati</h3>
    <p>I Suoi dati personali oggetto del trattamento sono raccolti direttamente dal soggetto interessato. La base giuridica per il trattamento dei dati per le finalità di cui al punto A1) è il legittimo interesse del Titolare ai sensi dell’art. 6, comma 1 lett. f del Regolamento e non richiede il suo consenso. La base giuridica per il trattamento dei dati per le finalità di cui ai punti A2), A3) e A4) è l’art. 6 comma 1 lett. b del Regolamento...</p>
    <p>La base giuridica per il trattamento dei dati per le finalità di cui al punto A5) e A6) è l’art.6. par.1 lett. a del Regolamento, in quanto i suoi dati potranno essere trattati lecitamente solo previo suo consenso, specifico, separato, espresso, documentato, preventivo e del tutto facoltativo...</p>
    <p>La base giuridica per il trattamento dei dati per le finalità di cui ai punti A7) e A8) è l’ adempimento di un obbligo legale ai sensi dell’art. 6, comma 1 lett. c del Regolamento.</p>

    <h3 style={{ fontSize: '18px', marginTop: '20px' }}>C) Modalità di trattamento dei dati</h3>
    <p>Il trattamento dei suoi Dati Personali è realizzato per mezzo delle operazioni indicate all’art. 4 punto 2 del GDPR e precisely: raccolta, registrazione, organizzazione, conservazione, consultazione, elaborazione, estrazione, utilizzo, cancellazione e distruzione dei dati...</p>

    <h3 style={{ fontSize: '18px', marginTop: '20px' }}>E) Periodo di conservazione</h3>
    <p>In ogni caso, si prevede la conservazione dei dati per un periodo massimo di:</p>
    <ul>
      <li>Dati relativi alla formazione = 2 anni</li>
      <li>CV su Skillbook = 2 anni</li>
      <li>Newsletter = 2 anni</li>
      <li>Marketing = 2 anni</li>
    </ul>

    <h3 style={{ fontSize: '18px', marginTop: '20px' }}>G) Titolare del trattamento e responsabile della protezione dei dati personali</h3>
    <p>
      <strong>Il Titolare del Trattamento</strong> è SKILL FACTORY S.R.L., con sede legale in Via Sedivola n. 30 - 80059 - Torre del Greco (Na) e sede operativa in Centro Direzionale di Napoli is. E2 scala A – 80143 Napoli (Na).<br />
      <strong>DPO:</strong> Silvio Tortora Maione, email: silvio@itadvice.it
    </p>
  </div>
);

const colors = {
  primary: '#007bff',
  dark: '#343a40',
  lightGray: '#f8f9fa',
  border: '#dee2e6',
  white: '#ffffff'
};

function App() {
  const [view, setView] = useState('index');
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    // CAMBIO TITOLO SCHEDA BROWSER
    document.title = "Magazine SkillFactory";

    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);

    // INTERCETTAZIONE LINK DI CONDIVISIONE ALL'AVVIO
    const params = new URLSearchParams(window.location.search);
    const articoloId = params.get('articolo');
    if (articoloId) {
      setSelectedArticleId(articoloId);
      setView('articolo');
    }

    // GESTIONE DEL TASTO INDIETRO DEL BROWSER
    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentArticoloId = currentParams.get('articolo');
      if (currentArticoloId) {
        setSelectedArticleId(currentArticoloId);
        setView('articolo');
      } else {
        setSelectedArticleId(null);
        setView('index');
      }
    };

    window.addEventListener('popstate', handlePopState);
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      // utenti loggati: navbar sempre visibile
      if (isLoggedIn) {
        setShowNavbar(true);
        return;
      }

      if (window.scrollY > lastScrollY && window.scrollY > 150) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLoggedIn]);

  const getDisplayName = () => {
    const rawName = localStorage.getItem('username') || 'Utente';
    const firstName = rawName.split('.')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setView('index');
    window.history.pushState({}, '', window.location.origin + window.location.pathname);
  };

  const handleReadArticle = (id) => {
    setSelectedArticleId(id);
    setView('articolo');
    // Sincronizza l'URL in modo che rifletta l'ID dell'articolo letto
    window.history.pushState({}, '', `?articolo=${id}`);
    window.scrollTo(0, 0);
  };

  const handleEdit = (id) => {
    setEditId(id);
    setView('editor');
  };

  const handleNewArticle = () => {
    setEditId(null);
    setView('editor');
  };

  const navigateTo = (newView) => {
    setView(newView);
    setIsMobileMenuOpen(false);
    if (newView === 'index') {
      setSelectedArticleId(null);
      window.history.pushState({}, '', window.location.origin + window.location.pathname);
    }
    window.scrollTo(0, 0);
  };
  const navBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 30px',
    background: colors.white,
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    position: 'fixed',
    top: showNavbar ? 0 : '-90px',
    zIndex: 1000,
    height: '80px',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'top 0.3s ease'
  };
  return (
    <div style={{
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      background: colors.lightGray, minHeight: '100vh', display: 'flex',
      flexDirection: 'column', overflowX: 'hidden'
    }}>
      <style>{`
        .nav-link {
          background: none; border: none; color: ${colors.dark};
          font-weight: 500; font-size: 15px; cursor: pointer;
          padding: 8px 0; position: relative; transition: all 0.3s ease;
          white-space: nowrap; text-decoration: none; display: flex;
          align-items: center; justify-content: center;
        }
        .nav-link:hover { color: ${colors.primary}; }
        .nav-link::after {
          content: ''; position: absolute; width: 0; height: 2px;
          bottom: 0; left: 0; background-color: ${colors.primary};
          transition: width 0.3s ease;
        }
        .nav-link:hover::after, .active-link::after { width: 100%; }
        .active-link { color: ${colors.primary} !important; font-weight: 700; }
        .logout-link { color: #dc3545 !important; }
        .mobile-menu-toggle {
          display: none; background: none; border: none; color: ${colors.primary};
          font-size: 32px; cursor: pointer; line-height: 1;
        }
        @media (max-width: 1024px) {
          .nav-bar { padding: 10px 20px !important; height: 70px !important; }
          .mobile-menu-toggle { display: block; }
          .nav-links {
            display: ${isMobileMenuOpen ? 'flex' : 'none'} !important;
            position: absolute; top: 100%; left: 0; width: 100%;
            flex-direction: column; background: ${colors.white};
            padding: 20px 0; box-shadow: 0 15px 25px rgba(0,0,0,0.08);
            gap: 5px !important; z-index: 999;
          }
          .nav-link { width: 100%; padding: 15px 0; font-size: 17px; }
        }
        @media (min-width: 1025px) {
          .nav-links {
            display: flex !important; position: static !important;
            flex-direction: row !important; width: auto !important;
            background: transparent !important; box-shadow: none !important;
            padding: 0 !important; gap: 30px !important;
          }
        }
      `}</style>

      <nav className="nav-bar" style={navBarStyle}>
        <div
          style={{ fontWeight: '800', fontSize: '24px', letterSpacing: '-0.5px', color: 'orange', cursor: 'pointer' }}
          onClick={() => navigateTo('index')}
        >
          {/* CONTENITORE LOGO NELLA NAVBAR */}
          <div
            onClick={() => setView('home')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              height: '100%', // Sfrutta l'altezza della navbar
              maxWidth: '240px' // Impedisce al logo di allargarsi troppo
            }}
          >
            <svg
              id="Livello_1"
              data-name="Livello 1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 630.98 165.84"
              style={{
                height: '45px', // Altezza ottimale per la navbar da 80px
                width: 'auto',   // Mantiene le proporzioni reali dell'SVG (630x165)
                display: 'block'
              }}
            >
              <defs>
                <style>
                  {`
          .cls-1 { fill: #001e4e; stroke-width: 0px; }
          .cls-2 { fill: #f5811d; stroke-width: 0px; }
        `}
                </style>
              </defs>
              <g id="Logo">
                <g id="Skill_Factory_Magazine" data-name="Skill Factory Magazine">
                  <g id="Magazine">
                    <g>
                      <path className="cls-2" d="m0,164.69v-66.97h12.82l28.51,47.26h-6.79l28.03-47.26h12.73l.19,66.97h-14.54l-.1-44.68h2.68l-22.39,37.6h-6.98l-22.87-37.6h3.25v44.68H0Z" />
                      <path className="cls-1" d="m96.15,164.69l29.85-66.97h15.31l29.95,66.97h-16.27l-24.49-59.13h6.12l-24.59,59.13h-15.88Zm14.93-14.35l4.11-11.77h34.44l4.21,11.77h-42.77Z" />
                      <path className="cls-1" d="m223.21,165.84c-5.3,0-10.16-.85-14.59-2.54-4.43-1.69-8.29-4.1-11.58-7.23-3.29-3.12-5.84-6.79-7.65-11-1.82-4.21-2.73-8.83-2.73-13.87s.91-9.66,2.73-13.87c1.82-4.21,4.39-7.88,7.7-11,3.32-3.12,7.21-5.53,11.67-7.22,4.46-1.69,9.38-2.54,14.73-2.54,5.93,0,11.27.99,16.03,2.97,4.75,1.98,8.75,4.85,12.01,8.61l-9.95,9.18c-2.42-2.55-5.07-4.45-7.94-5.69-2.87-1.24-6-1.87-9.38-1.87s-6.22.51-8.9,1.53c-2.68,1.02-4.99,2.49-6.94,4.4-1.95,1.91-3.44,4.18-4.5,6.79-1.05,2.62-1.58,5.52-1.58,8.71s.53,6,1.58,8.61c1.05,2.62,2.55,4.9,4.5,6.84,1.94,1.95,4.24,3.43,6.89,4.45,2.65,1.02,5.56,1.53,8.75,1.53s6.04-.49,8.95-1.48,5.73-2.66,8.47-5.02l8.8,11.19c-3.64,2.74-7.86,4.85-12.68,6.32-4.82,1.46-9.62,2.2-14.4,2.2Zm27.07-8.52l-14.16-2.01v-25.16h14.16v27.17Z" />
                      <path className="cls-1" d="m269.41,164.69l29.85-66.97h15.31l29.95,66.97h-16.27l-24.49-59.13h6.12l-24.59,59.13h-15.88Zm14.93-14.35l4.11-11.77h34.44l4.21,11.77h-42.77Z" />
                      <path className="cls-1" d="m360.78,164.69v-10.05l41.43-49.94,1.91,5.65h-42.57v-12.63h56.35v10.05l-41.33,49.94-1.91-5.64h44.68v12.63h-58.55Z" />
                      <path className="cls-1" d="m442.87,164.69v-66.97h15.5v66.97h-15.5Z" />
                      <path className="cls-1" d="m487.83,164.69v-66.97h12.82l39.51,48.22h-6.22v-48.22h15.31v66.97h-12.72l-39.61-48.22h6.22v48.22h-15.31Z" />
                      <path className="cls-1" d="m578.72,164.69v-66.97h50.61v12.44h-35.21v42.1h36.45v12.44h-51.85Zm14.25-27.94v-12.06h32.24v12.06h-32.24Z" />
                    </g>
                  </g>
                  <g id="Factory">
                    <g>
                      <path className="cls-1" d="m246.63,63.87V6.82h43.11v10.6h-29.91v46.45h-13.2Zm12.22-20.78v-10.59h27.38v10.59h-27.38Z" />
                      <g id="A">
                        <g>
                          <polygon className="cls-2" points="283.08 65.01 317.43 0 351.78 65.01 337.49 65.01 317.43 26.37 297.6 65.01 283.08 65.01" />
                          <circle className="cls-2" cx="317.43" cy="58.27" r="7.83" />
                        </g>
                      </g>
                      <path className="cls-1" d="m379.07,64.84c-4.4,0-8.49-.72-12.27-2.16s-7.05-3.49-9.82-6.15c-2.77-2.66-4.93-5.79-6.48-9.37-1.55-3.59-2.32-7.52-2.32-11.82s.78-8.23,2.32-11.82c1.55-3.59,3.72-6.71,6.52-9.37,2.8-2.66,6.07-4.71,9.82-6.15,3.75-1.44,7.85-2.16,12.31-2.16,4.94,0,9.41.86,13.41,2.57s7.35,4.23,10.07,7.54l-8.47,7.82c-1.96-2.23-4.13-3.9-6.52-5.01-2.39-1.11-5-1.67-7.82-1.67-2.66,0-5.11.44-7.33,1.3-2.23.87-4.16,2.12-5.79,3.75s-2.89,3.56-3.79,5.79c-.9,2.23-1.34,4.7-1.34,7.42s.45,5.19,1.34,7.42c.9,2.23,2.16,4.16,3.79,5.79,1.63,1.63,3.56,2.88,5.79,3.75,2.23.87,4.67,1.3,7.33,1.3,2.83,0,5.43-.56,7.82-1.67,2.39-1.11,4.56-2.81,6.52-5.09l8.47,7.82c-2.72,3.32-6.07,5.84-10.07,7.58s-8.49,2.61-13.49,2.61Z" />
                      <path className="cls-1" d="m421.78,63.87V17.57h-18.26V6.82h49.72v10.76h-18.25v46.29h-13.2Z" />
                      <path className="cls-1" d="m487.47,64.84c-4.51,0-8.68-.73-12.51-2.2-3.83-1.47-7.15-3.53-9.94-6.19-2.8-2.66-4.97-5.79-6.52-9.37-1.55-3.59-2.33-7.5-2.33-11.74s.78-8.15,2.33-11.74c1.55-3.59,3.73-6.71,6.56-9.37,2.83-2.66,6.14-4.73,9.95-6.19s7.93-2.2,12.39-2.2,8.65.73,12.43,2.2,7.06,3.53,9.86,6.19,4.99,5.77,6.56,9.33c1.57,3.56,2.36,7.48,2.36,11.78s-.79,8.16-2.36,11.78c-1.57,3.61-3.76,6.74-6.56,9.37-2.8,2.64-6.09,4.69-9.86,6.15-3.78,1.47-7.89,2.2-12.35,2.2Zm-.08-11.25c2.55,0,4.9-.43,7.05-1.3,2.15-.87,4.03-2.12,5.66-3.75,1.63-1.63,2.89-3.56,3.79-5.79.9-2.23,1.35-4.7,1.35-7.42s-.45-5.19-1.35-7.42c-.9-2.23-2.15-4.16-3.75-5.79-1.61-1.63-3.49-2.88-5.66-3.75-2.17-.87-4.54-1.3-7.09-1.3s-4.9.44-7.05,1.3c-2.15.87-4.03,2.12-5.66,3.75s-2.9,3.56-3.79,5.79c-.9,2.23-1.34,4.7-1.34,7.42s.45,5.12,1.34,7.38,2.15,4.2,3.75,5.83c1.6,1.63,3.49,2.88,5.66,3.75,2.17.87,4.53,1.3,7.09,1.3Z" />
                      <path className="cls-1" d="m525.44,63.87V6.82h24.37c7.93,0,14.1,1.83,18.5,5.5,4.4,3.67,6.6,8.73,6.6,15.2,0,4.24-1.01,7.89-3.01,10.96-2.01,3.07-4.87,5.42-8.56,7.05-3.7,1.63-8.1,2.44-13.2,2.44h-17.36l5.87-5.79v21.68h-13.2Zm13.2-20.21l-5.87-6.19h16.62c4.08,0,7.12-.88,9.13-2.65,2.01-1.76,3.02-4.2,3.02-7.29s-1.01-5.6-3.02-7.34c-2.01-1.74-5.05-2.61-9.13-2.61h-16.62l5.87-6.28v32.35Zm23.07,20.21l-14.26-20.7h14.1l14.42,20.7h-14.26Z" />
                      <path className="cls-1" d="m595.61,63.87v-23.31l3.02,7.99-25.1-41.73h14.01l19.24,32.03h-8.07l19.32-32.03h12.96l-25.1,41.73,2.93-7.99v23.31h-13.2Z" />
                    </g>
                  </g>
                  <g id="Skill">
                    <g>
                      <path className="cls-1" d="m23.51,64.84c-4.56,0-8.94-.61-13.12-1.83-4.19-1.22-7.55-2.81-10.11-4.77l4.48-9.94c2.44,1.74,5.34,3.17,8.68,4.28,3.34,1.11,6.72,1.67,10.15,1.67,2.61,0,4.71-.26,6.32-.78,1.6-.52,2.78-1.24,3.55-2.16s1.14-1.98,1.14-3.18c0-1.52-.6-2.73-1.79-3.63s-2.77-1.63-4.73-2.2c-1.96-.57-4.11-1.11-6.48-1.63-2.36-.52-4.73-1.15-7.09-1.92-2.36-.76-4.52-1.74-6.48-2.93-1.96-1.19-3.55-2.77-4.77-4.73-1.22-1.96-1.83-4.45-1.83-7.5,0-3.26.88-6.24,2.65-8.92,1.76-2.69,4.43-4.84,7.99-6.44s8.03-2.4,13.41-2.4c3.59,0,7.12.42,10.6,1.26,3.48.84,6.55,2.11,9.21,3.79l-4.07,10.02c-2.66-1.52-5.33-2.65-7.99-3.38-2.66-.73-5.27-1.1-7.82-1.1s-4.65.3-6.28.9-2.8,1.37-3.51,2.32c-.71.95-1.06,2.05-1.06,3.3,0,1.47.6,2.65,1.79,3.55s2.77,1.62,4.73,2.16c1.96.54,4.12,1.09,6.48,1.63,2.36.54,4.73,1.17,7.09,1.88s4.52,1.66,6.48,2.85c1.96,1.2,3.55,2.77,4.77,4.73,1.22,1.96,1.83,4.43,1.83,7.42,0,3.21-.9,6.14-2.69,8.8-1.79,2.66-4.47,4.81-8.03,6.44s-8.06,2.44-13.49,2.44Z" />
                      <path className="cls-1" d="m54.72,63.87V6.82h13.12v57.05h-13.12Zm11.82-13.04l-.73-15.24,27.3-28.77h14.67l-24.61,26.49-7.33,7.82-9.29,9.7Zm27.22,13.04l-20.29-24.86,8.64-9.37,27.06,34.23h-15.4Z" />
                      <path className="cls-1" d="m112.99,63.87V6.82h13.2v57.05h-13.2Z" />
                      <path className="cls-1" d="m137.69,63.87V6.82h13.2v46.29h28.61v10.76h-41.81Z" />
                      <path className="cls-1" d="m184.87,63.87V6.82h13.2v46.29h28.61v10.76h-41.81Z" />
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>

        <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className="nav-links">
          {isLoggedIn && (
            <button className={`nav-link ${view === 'index' ? 'active-link' : ''}`} onClick={() => navigateTo('index')}>
              Anteprima Magazine
            </button>
          )}
          {/* Nuova voce di menu visibile in modalità visitatore / non loggato */}
          {/*!isLoggedIn && (
            <button className={`nav-link ${view === 'eventi' ? 'active-link' : ''}`} onClick={() => navigateTo('eventi')}>
              Eventi
            </button>
          )}

          {!isLoggedIn && (
            <button className={`nav-link ${view === 'intervista' ? 'active-link' : ''}`} onClick={() => navigateTo('intervista')}>
              Prenota Intervista
            </button>
          )*/}

          {!isLoggedIn ? (
            <button className={`nav-link ${view === 'login' ? 'active-link' : ''}`} onClick={() => navigateTo('login')}>
              Area Riservata
            </button>
          ) : (
            <>
              <button className={`nav-link ${view === 'dashboard' ? 'active-link' : ''}`} onClick={() => navigateTo('dashboard')}>
                Dashboard
              </button>

              <button className={`nav-link ${view === 'editor' ? 'active-link' : ''}`} onClick={() => handleNewArticle()}>
                + Nuovo Articolo
              </button>
              <button className="nav-link logout-link" onClick={handleLogout}>
                Esci ({getDisplayName()})
              </button>
            </>
          )}
        </div>
      </nav>

      <main style={mainContainerStyle}>
        {view === 'index' && (
          <IndexPubblicazioni
            onReadArticle={handleReadArticle}
            onPrivacyClick={() => setView('privacy')}
          />
        )}

        {/* Render del nuovo componente dedicato alla pagina degli eventi */}
        {view === 'eventi' && (
          <PaginaEventi
            onReadEvent={handleReadArticle}
            onBackToHome={() => navigateTo('index')}
          />
        )}

        {view === 'articolo' && (
          <ArticoloSingolo
            id={selectedArticleId}
            onBack={() => {
              setView('index');
              setSelectedArticleId(null);
              window.history.pushState({}, '', window.location.origin + window.location.pathname);
            }}
          />
        )}

        {view === 'intervista' && <FormIntervista onPrivacyClick={() => setView('privacy')} />}

        {view === 'privacy' && <PrivacyContent onBack={() => navigateTo('index')} />}

        {view === 'login' && !isLoggedIn && <Login onLoginSuccess={handleLoginSuccess} colors={colors} />}

        {isLoggedIn && (
          <>
            {view === 'dashboard' && <DashboardEditore onEdit={handleEdit} />}
            {view === 'admin-interviste' && (
              <DashboardInterviste
                onSwitchView={navigateTo}
                onSelectIntervista={(id) => { setSelectedArticleId(id); setView('dettaglio-intervista'); }}
              />
            )}
            {view === 'dettaglio-intervista' && <DettaglioIntervista id={selectedArticleId} onBack={() => setView('admin-interviste')} />}
            {view === 'editor' && <MagazineEditor editId={editId} />}
          </>
        )}
      </main>

      <footer style={footerStyle}>
        &copy; Copyright - Skill Factory 2026 |
        <span
          onClick={() => setView('privacy')}
          style={{ cursor: 'pointer', marginLeft: '10px', textDecoration: 'underline' }}
        >
          Privacy Policy
        </span>
      </footer>
    </div>
  );
}

const navBarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 30px',           // 👈 Padding fisso generoso per staccare il logo dal bordo dello schermo
  background: colors.white,
  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  position: 'fixed',
  top: 0,
  zIndex: 1000,
  height: '80px',
  width: '100%',               // 👈 Forza la navbar al 100% del monitor
  boxSizing: 'border-box'
};

const mainContainerStyle = {
  paddingTop: '55px',
  paddingBottom: '60px',
  flex: '1',
  width: '100%',               // 👈 Prende tutto lo spazio
  maxWidth: '100%',            // 👈 Forza l'estensione totale rimuovendo i limiti in % inferiori
  margin: '0',                 // 👈 Rimuove il "0 auto" che stringe al centro
  boxSizing: 'border-box',
  paddingLeft: '30px',         // Stacca i contenuti dal bordo sinistro dello schermo
  paddingRight: '30px'         // Stacca i contenuti dal bordo destro dello schermo
};

const footerStyle = {
  background: colors.dark, color: colors.white, textAlign: 'center',
  padding: '30px 10px', fontSize: '14px', borderTop: `4px solid ${colors.primary}`,
  marginTop: 'auto'
};

export default App;
