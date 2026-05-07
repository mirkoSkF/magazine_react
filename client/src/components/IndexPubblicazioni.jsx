import React, { useState, useEffect } from "react";

const IndexPubblicazioni = () => {
  const [articoli, setArticoli] = useState([]);
  const [expanded, setExpanded] = useState({});

  const colors = {
    primary: "#007bff",
    dark: "#343a40",
    lightGray: "#f8f9fa",
    border: "#dee2e6",
    white: "#ffffff",
    textMuted: "#6c757d",
  };

  useEffect(() => {
    // Carica tutti gli articoli (pubblici)
    fetch("http://localhost:8096/api/pagine")
      .then((res) => res.json())
      .then((data) => {
        // Ordiniamo per ID decrescente per vedere i più recenti in alto
        const sorted = data.sort((a, b) => b.id - a.id);
        setArticoli(sorted);
      })
      .catch((err) =>
        console.error("Errore nel caricamento del magazine:", err),
      );
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>
      <style>{`
        .article-card {
          background: ${colors.white};
          border-radius: 12px;
          border: 1px solid ${colors.border};
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          padding: 40px;
          margin-bottom: 50px;
          transition: transform 0.2s ease;
        }
        
        .article-content {
          text-align: justify;
          hyphens: auto;
          word-break: break-word;
          font-family: 'Georgia', serif;
        }

        /* Gestione Immagini e Video */
        .article-content img, 
        .article-content iframe { 
          max-width: 100%; 
          display: block;
          margin: 25px auto;
          border-radius: 8px; 
        }

        /* Forza le proporzioni 16:9 per i video di YouTube */
        .article-content iframe {
          width: 100%;
          aspect-ratio: 16 / 9;
          border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .content-preview {
          overflow: hidden;
          position: relative;
          transition: max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .preview-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100px;
          background: linear-gradient(transparent, ${colors.white});
        }

        .author-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid ${colors.primary};
          background: ${colors.lightGray};
        }

        .btn-expand {
          background: ${colors.white};
          color: ${colors.primary};
          border: 2px solid ${colors.primary};
          padding: 10px 25px;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 700;
          margin-top: 25px;
          display: block;
          width: fit-content;
          transition: all 0.3s;
        }

        .btn-expand:hover {
          background: ${colors.primary};
          color: white;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }
      `}</style>

      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h1
          style={{
            color: colors.dark,
            fontSize: "42px",
            fontWeight: "800",
            marginBottom: "10px",
          }}
        >
          Magazine
        </h1>
        <p style={{ color: colors.textMuted, fontSize: "18px" }}>
          Le ultime pubblicazioni dai nostri editori
        </p>
      </div>

      {articoli.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            color: colors.textMuted,
          }}
        >
          Caricamento articoli in corso...
        </div>
      ) : (
        articoli.map((a) => {
          const isExpanded = expanded[a.id];
          return (
            <article key={a.id} className="article-card">
              {/* HEADER ARTICOLO: Info Autore e Data */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "30px",
                  borderBottom: `1px solid ${colors.lightGray}`,
                  paddingBottom: "20px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {a.autore?.fotoProfilo ? (
                    <img
                      src={`data:image/jpeg;base64,${a.autore.fotoProfilo}`}
                      className="author-avatar"
                      alt="Avatar"
                      style={{ margin: "0 15px 0 0" }} // Reset margin dell'impostazione globale
                    />
                  ) : (
                    <div
                      className="author-avatar"
                      style={{
                        margin: "0 15px 0 0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        color: colors.primary,
                      }}
                    >
                      {a.autore?.nome?.charAt(0) || "S"}
                    </div>
                  )}
                  <div>
                    <div
                      style={{
                        fontWeight: "700",
                        color: colors.dark,
                        fontSize: "16px",
                      }}
                    >
                      {a.autore
                        ? `${a.autore.nome} ${a.autore.cognome}`
                        : "Redazione Skill Factory"}
                    </div>
                    <div style={{ fontSize: "13px", color: colors.textMuted }}>
                      Editore Certificato
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: colors.primary,
                      textTransform: "uppercase",
                    }}
                  >
                    Pubblicazione #{a.id}
                  </div>
                  <div style={{ fontSize: "13px", color: colors.textMuted }}>
                    {a.dataPubblicazione
                      ? new Date(a.dataPubblicazione).toLocaleString("it-IT", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : // Fallback se la data è assente nei vecchi record
                        "7 Maggio 2026, 13:15"}
                  </div>
                </div>
              </div>

              {/* CONTENUTO ARTICOLO */}
              <div
                className="content-preview"
                style={{ maxHeight: isExpanded ? "none" : "500px" }}
              >
                {a.moduli?.map((m, i) => (
                  <div
                    key={i}
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: m.contenuto }}
                    style={{
                      fontSize: "19px",
                      lineHeight: "1.8",
                      color: "#333",
                    }}
                  />
                ))}
                {!isExpanded && <div className="preview-overlay" />}
              </div>

              <button className="btn-expand" onClick={() => toggleExpand(a.id)}>
                {isExpanded ? "Leggi meno" : "Continua a leggere"}
              </button>
            </article>
          );
        })
      )}
    </div>
  );
};

export default IndexPubblicazioni;