import React, { useState, useEffect } from "react";

const PaginaEventi = ({ onReadEvent, onBackToHome }) => {
  const [eventi, setEventi] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Mostrati in griglia 3x2 o 2x3

  const colors = {
    primary: "#007bff",
    dark: "#1a1a1a",
    lightGray: "#f8f9fa",
    border: "#dee2e6",
    accent: "#e63946"
  };

  useEffect(() => {
    fetch("https://magazine.skillfactory.it/api/pagine")
      .then((res) => res.json())
      .then((data) => {
        // Filtriamo solo i contenuti di tipo EVENTO che non sono bozze, ordinati dal più recente
        const soloEventi = data
          .filter(item => item.tipo?.toUpperCase() === "EVENTO" && item.bozza === false)
          .sort((a, b) => b.id - a.id);
        setEventi(soloEventi);
      })
      .catch((err) => console.error("Errore caricamento eventi:", err));
  }, []);

  // Estrazione del testo dai moduli dell'evento (identico alla logica dell'index)
  const extractText = (evento, length) => {
    if (!evento.moduli || evento.moduli.length === 0) return "";
    const testoCompleto = evento.moduli
      .filter(m => m.tipo !== "IMMAGINE")
      .map(m => m.contenuto)
      .join(" ");
    
    const temp = document.createElement('div');
    temp.innerHTML = testoCompleto;
    const plainText = temp.innerText || temp.textContent || "";
    
    return length ? (plainText.length > length ? plainText.substring(0, length) + "..." : plainText) : plainText;
  };

  // Filtraggio per la ricerca locale degli eventi
  const eventiFiltrati = eventi.filter(evento => {
    const searchLower = searchTerm.toLowerCase();
    const nelTitolo = evento.titolo?.toLowerCase().includes(searchLower);
    const nelCorpo = extractText(evento).toLowerCase().includes(searchLower);
    return nelTitolo || nelCorpo;
  });

  // Paginazione
  const totalPages = Math.ceil(eventiFiltrati.length / itemsPerPage);
  const currentEventi = eventiFiltrati.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const Pagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentPage(i + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: currentPage === i + 1 ? colors.primary : 'white',
              color: currentPage === i + 1 ? 'white' : colors.dark,
              border: `1px solid ${currentPage === i + 1 ? colors.primary : colors.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div lang="it" style={{ maxWidth: "1200px", margin: "20px auto", padding: "0 20px", fontFamily: "Arial, sans-serif" }}>
      <style>{`
        .grid-eventi {
          display: flex;
          flex-direction: column;
          gap: 30px;
          width: 100%;
        }
        .evento-card {
          background-color: #fff;
          border: 1px solid ${colors.border};
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          width: 100%;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: auto;
        }
        .evento-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
      `}</style>

      {/* HEADER PAGINA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <button 
            onClick={onBackToHome}
            style={{ background: "none", border: "none", color: colors.primary, cursor: "pointer", fontWeight: "bold", padding: 0, marginBottom: "10px", display: "block" }}
          >
            &larr; Torna alla Home
          </button>
          <h1 style={{ margin: 0, fontSize: "36px", fontWeight: "700", color: colors.dark }}>Eventi in Programma</h1>
        </div>

        {/* BARRA DI RICERCA EVENTI */}
        <input
          type="text"
          placeholder="Cerca eventi..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Resetta alla prima pagina durante la ricerca
          }}
          style={{
            padding: "10px 20px",
            fontSize: "15px",
            borderRadius: "20px",
            border: `1px solid ${colors.border}`,
            width: "100%",
            maxWidth: "300px"
          }}
        />
      </div>

      <hr style={{ border: "none", borderTop: `3px solid ${colors.dark}`, marginBottom: "35px" }} />

      {/* GRIGLIA EVENTI (ORA LISTA A LARGHEZZA INTERA) */}
      {currentEventi.length > 0 ? (
        <div className="grid-eventi">
          {currentEventi.map((evento) => (
            <div key={evento.id} className="evento-card">
              {/* IMMAGINE DI COPERTINA EVENTO - ADATTABILE */}
              <div style={{ width: "100%", height: "auto", maxHeight: "400px", backgroundColor: "#eee", overflow: "hidden", position: "relative" }}>
                {evento.copertina ? (
                  <img
                    src={`data:image/jpeg;base64,${evento.copertina}`}
                    alt={evento.titolo}
                    style={{ width: "100%", height: "auto", maxHeight: "400px", objectFit: "cover", objectPosition: "center", display: "block" }}
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", color: "#999", fontSize: "14px" }}>
                    Nessuna immagine disponibile
                  </div>
                )}
                <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: colors.accent, color: "white", padding: "4px 10px", fontSize: "11px", fontWeight: "bold", borderRadius: "3px", textTransform: "uppercase" }}>
                  Evento
                </div>
              </div>

              {/* CORPO DELLA CARD */}
              <div style={{ padding: "25px", display: "flex", flexDirection: "column", height: "auto" }}>
                <h2 style={{ fontSize: "22px", margin: "0 0 12px 0", fontWeight: "700", lineHeight: "1.3", color: colors.dark }}>
                  {evento.titolo}
                </h2>
                
                {/* ESTRATTO DEL CORPO EVENTO */}
                <p style={{ fontSize: "15px", color: "#555", lineHeight: "1.6", margin: "0 0 20px 0", textAlign: "justify" }}>
                  {extractText(evento, 180)}
                </p>

                <button
                  onClick={() => onReadEvent(evento.id)}
                  style={{
                    width: "100%",
                    maxWidth: "200px",
                    padding: "12px",
                    backgroundColor: colors.dark,
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px",
                    transition: "background-color 0.2s",
                    alignSelf: "flex-start"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.primary}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.dark}
                >
                  Scopri i dettagli &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#666", backgroundColor: colors.lightGray, borderRadius: "8px", border: `1px solid ${colors.border}` }}>
          <p style={{ fontSize: "18px", margin: 0 }}>Nessun evento trovato corrispondente ai criteri di ricerca.</p>
        </div>
      )}

      {/* PAGINAZIONE */}
      <Pagination />
    </div>
  );
};

export default PaginaEventi;
