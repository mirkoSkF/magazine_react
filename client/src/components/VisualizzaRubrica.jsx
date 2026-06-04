import React, { useState } from "react";

const VisualizzaRubrica = ({ rubrica, tuttiContenuti, onReadArticle, onBack, getAutore }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const colors = {
    primary: "#007bff",
    dark: "#1a1a1a",
    border: "#dee2e6",
    lightGray: "#f8f9fa"
  };

  // Forza la sillabazione del testo per evitare rotture del layout
  const forceHyphenation = (text) => {
    if (!text) return "";
    let processed = text.replace(/&nbsp;/g, ' ');
    return processed.replace(/([a-zA-ZàèéìòùÀÈÉÌÒÙ]{6})([a-zA-ZàèéìòùÀÈÉÌÒÙ]{3,})/g, (match, p1, p2) => {
      return `${p1}&shy;${p2}`;
    });
  };

  // Estrae il testo puro eliminando i tag HTML dei moduli
  const extractText = (articolo, length) => {
    if (!articolo.moduli || articolo.moduli.length === 0) return "";
    const testoCompleto = articolo.moduli
      .filter(m => m.tipo !== "IMMAGINE")
      .map(m => m.contenuto)
      .join(" ");
    const temp = document.createElement('div');
    temp.innerHTML = testoCompleto;
    const plainText = temp.innerText || temp.textContent || "";
    return length ? (plainText.length > length ? plainText.substring(0, length) + "..." : plainText) : plainText;
  };

  // Filtra i contenuti per la rubrica corrente (confronto case-insensitive e trim)
  const articoliRubrica = tuttiContenuti.filter(c => {
    if (!c.rubrica || !rubrica) return false;
    return c.rubrica.trim().toUpperCase() === rubrica.trim().toUpperCase();
  });

  // Logica di paginazione interna alla rubrica
  const totalPages = Math.ceil(articoliRubrica.length / itemsPerPage);
  const currentArticoli = articoliRubrica.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ minHeight: "70vh", marginTop: "20px" }}>
      {/* Intestazione Rubrica */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "3px solid #17a2b8", paddingBottom: "15px" }}>
        <h2 style={{ margin: 0, textTransform: "uppercase", color: colors.dark, fontSize: "28px", fontWeight: "700" }}>
          Rubrica: <span style={{ color: "#17a2b8" }}>{rubrica}</span> ({articoliRubrica.length})
        </h2>
        <button
          onClick={onBack}
          style={{
            padding: "8px 16px",
            backgroundColor: colors.dark,
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "14px",
            transition: "all 0.2s"
          }}
        >
          ← Torna alla Home
        </button>
      </div>

      {/* Lista degli Articoli */}
      {currentArticoli.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px" }}>
          {currentArticoli.map((art) => (
            <div
              key={art.id}
              style={{
                border: `1px solid ${colors.border}`,
                padding: "25px",
                borderRadius: "8px",
                backgroundColor: "#fff",
                boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
                display: "flex",
                flexDirection: "column",
                gap: "15px"
              }}
            >
              <h3 style={{ fontSize: "24px", fontWeight: "700", margin: 0, color: colors.dark }}>
                {art.titolo}
              </h3>
              
              {art.copertina && (
                <div style={{ width: "100%", height: "300px", backgroundColor: "#eee", borderRadius: "6px", overflow: "hidden" }}>
                  <img
                    src={`data:image/jpeg;base64,${art.copertina}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
                    alt="Copertina Articolo"
                  />
                </div>
              )}

              <p style={{ fontSize: "14px", color: "#666", margin: 0, fontStyle: "italic" }}>
                di <strong>{getAutore(art)}</strong> — Pubblicato il {new Date(art.dataPubblicazione).toLocaleDateString('it-IT')}
              </p>

              <div
                style={{ fontSize: "16px", color: "#444", lineHeight: "1.7", textAlign: "justify" }}
                dangerouslySetInnerHTML={{ __html: forceHyphenation(extractText(art, 450)) }}
              />

              <div>
                <button
                  onClick={() => onReadArticle(art.id)}
                  style={{
                    padding: "12px 25px",
                    backgroundColor: "#17a2b8",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "14px"
                  }}
                >
                  Leggi l'articolo completo →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#666", fontSize: "16px" }}>Nessun articolo presente in questa rubrica.</p>
      )}

      {/* Paginazione Interna */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "5px", marginTop: "30px", flexWrap: "wrap", justifyContent: "center" }}>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentPage(i + 1);
                window.scrollTo({ top: 200, behavior: "smooth" });
              }}
              style={{
                padding: "8px 14px",
                cursor: "pointer",
                backgroundColor: currentPage === i + 1 ? "#17a2b8" : "white",
                color: currentPage === i + 1 ? "white" : colors.dark,
                border: `1px solid ${currentPage === i + 1 ? "#17a2b8" : colors.border}`,
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Pulsante di Fondo per tornare indietro */}
      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", color: colors.primary, cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
        >
          ← Chiudi rubrica e mostra tutta la Home
        </button>
      </div>
    </div>
  );
};

export default VisualizzaRubrica;
