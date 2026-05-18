import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const CalendarioTeams = ({ colors }) => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Stato per gestire la modale di conferma rimozione personalizzata
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Recupero del token per le chiamate autenticate
  const token = localStorage.getItem('token');

  // Stato per il nuovo evento o evento selezionato
  const [newEvent, setNewEvent] = useState({
    id: null,
    titolo: '',
    descrizione: '',
    start: '',
    end: '',
    backgroundColor: '#007bff'
  });

  // Carica gli eventi dal backend all'avvio
  useEffect(() => {
    fetchEventi();
  }, []);

  const fetchEventi = async () => {
    try {
      const response = await fetch('http://localhost:8096/api/eventi', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        
        // Mappiamo i dati per essere sicuri che FullCalendar legga "title" correttamente
        const mappedData = data.map(evt => ({
          ...evt,
          id: evt.id,
          title: evt.titolo || evt.title,
          start: evt.start,
          end: evt.end
        }));
        
        setEvents(mappedData);
      }
    } catch (error) {
      console.error("Errore nel caricamento degli eventi:", error);
    }
  };

  // Intercetta il click/selezione sulla griglia oraria per NUOVO slot vuoto
  const handleSelectSlot = (selectInfo) => {
    let dataInizio = selectInfo.startStr;
    let dataFine = selectInfo.endStr;

    // FIX MESE: Se la stringa ha lunghezza 10 (es. "2026-05-18"), significa che siamo in vista mese
    if (dataInizio.length === 10) {
      dataInizio = `${dataInizio}T09:00`;
      // Nella vista mese, endStr è il giorno successivo a mezzanotte, quindi usiamo lo stesso giorno di inizio
      dataFine = `${selectInfo.startStr}T10:00`;
    } else {
      // Vista settimana/giorno: tagliamo i primi 16 caratteri (YYYY-MM-DDTHH:mm)
      dataInizio = dataInizio.slice(0, 16);
      dataFine = dataFine.slice(0, 16);
    }

    setNewEvent({
      id: null,
      titolo: '',
      descrizione: '',
      start: dataInizio,
      end: dataFine,
      backgroundColor: colors?.primary || '#007bff'
    });
    setShowModal(true);
  };

  // Intercetta il click su un evento ESISTENTE
  const handleEventClick = (clickInfo) => {
    const eventoCliccato = clickInfo.event;
    
    const dataInizio = eventoCliccato.start ? new Date(eventoCliccato.start.getTime() - eventoCliccato.start.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
    const dataFine = eventoCliccato.end ? new Date(eventoCliccato.end.getTime() - eventoCliccato.end.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : dataInizio;

    setNewEvent({
      id: eventoCliccato.id,
      titolo: eventoCliccato.title || '',
      descrizione: eventoCliccato.extendedProps?.descrizione || '',
      start: dataInizio,
      end: dataFine,
      backgroundColor: eventoCliccato.backgroundColor || colors?.primary || '#007bff'
    });
    setShowModal(true);
  };

  // Invia il nuovo evento (o aggiornato) al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...newEvent,
      title: newEvent.titolo 
    };

    try {
      const response = await fetch('http://localhost:8096/api/eventi', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowModal(false);
        fetchEventi();
      }
    } catch (error) {
      console.error("Errore nel salvataggio dell'evento:", error);
    }
  };

  // Sostituto dell'alert di conferma: apre la modale custom
  const handleEliminaEvento = () => {
    if (!newEvent.id) return;
    setShowConfirmDelete(true);
  };

  // Esegue l'effettiva rimozione dell'evento dal backend dopo la conferma custom
  const eseguiEliminaEffettiva = async () => {
    try {
      const response = await fetch(`http://localhost:8096/api/eventi/${newEvent.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setShowConfirmDelete(false);
        setShowModal(false);
        fetchEventi();
      } else {
        console.error("Impossibile eliminare l'evento dal server");
      }
    } catch (error) {
      console.error("Errore durante l'eliminazione dell'evento:", error);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        
        locale="it"
        buttonText={{
          today: 'Oggi',
          month: 'Mese',
          week: 'Settimana',
          day: 'Giorno'
        }}

        firstDay={1}
        slotMinTime="09:00:00"
        slotMaxTime="19:00:00"
        allDaySlot={false}
        selectable={true}
        selectMirror={true}
        
        select={handleSelectSlot}
        eventClick={handleEventClick}
        
        events={events}
        height="auto"
        slotEventOverlap={false}
      />

      {/* --- REGOLE CSS PER HOVER DETTAGLIATO --- */}
      <style>{`
        .fc .fc-timegrid-col.fc-day-today {
          background-color: rgba(0, 123, 255, 0.05) !important;
        }
        .fc .fc-daygrid-day.fc-day-today {
          background-color: rgba(0, 123, 255, 0.05) !important;
        }

        /* Hover per ogni singolo quadratino orario (settimana/giorno) */
        .fc .fc-timegrid-slots td:hover {
          background-color: rgba(0, 123, 255, 0.04) !important;
          cursor: pointer;
        }

        /* Hover per ogni singola cella del giorno (vista mese) */
        .fc .fc-daygrid-day:hover {
          background-color: rgba(0, 123, 255, 0.04) !important;
          cursor: pointer;
        }
        
        /* Hover specifico per il giorno corrente (evita sovrapposizioni opache strane) */
        .fc .fc-timegrid-col.fc-day-today:hover,
        .fc .fc-daygrid-day.fc-day-today:hover {
          background-color: rgba(0, 123, 255, 0.08) !important;
        }

        .fc-event {
          cursor: pointer !important;
          transition: transform 0.15s ease, filter 0.15s ease !important;
          border: none !important;
          border-radius: 6px !important;
        }
        
        .fc-event:hover {
          filter: brightness(0.95);
          transform: translateY(-1px);
        }

        .fc-timegrid-slot {
          height: 60px !important; 
        }

        .fc-event-main {
          padding: 6px 8px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          line-height: 1.2 !important;
          white-space: normal !important;
          word-break: break-word !important;
          color: #fff !important;
        }

        /* Vista mensile */
        .fc-daygrid-event {
          white-space: normal !important;
          align-items: flex-start !important;
        }
        .fc-daygrid-event-dot {
          margin-top: 5px !important;
        }

        /* Effetti hover bottoni */
        .btn-confirm-delete {
          transition: background-color 0.2s ease, transform 0.1s ease;
        }
        .btn-confirm-delete:hover {
          background-color: #dc3545 !important;
          color: #fff !important;
          transform: translateY(-1px);
        }
        .btn-cancel-delete {
          transition: background-color 0.2s ease, transform 0.1s ease;
        }
        .btn-cancel-delete:hover {
          background-color: #e2e6ea !important;
          transform: translateY(-1px);
        }

        .btn-modal-delete {
          transition: background-color 0.2s ease, transform 0.1s ease;
        }
        .btn-modal-delete:hover {
          background-color: #dc3545 !important;
          color: #fff !important;
          transform: translateY(-1px);
        }

        .btn-modal-cancel {
          transition: background-color 0.2s ease, transform 0.1s ease;
        }
        .btn-modal-cancel:hover {
          background-color: #e2e6ea !important;
          transform: translateY(-1px);
        }

        .btn-modal-save {
          transition: filter 0.2s ease, transform 0.1s ease;
        }
        .btn-modal-save:hover {
          filter: brightness(0.9);
          transform: translateY(-1px);
        }
      `}</style>

      {/* MODALE DI CONFERMA ELIMINAZIONE PERSONALE */}
      {showConfirmDelete && (
        <div style={{ ...modalOverlayStyle, zIndex: 10000 }}>
          <div style={{ ...modalContentStyle(colors), maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
            <h3 style={{ marginTop: 0, fontWeight: '800', color: colors?.dark || '#111' }}>
              Conferma Eliminazione
            </h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '25px' }}>
              Sei sicuro di voler eliminare questo evento? L'azione non è reversibile.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button 
                type="button"
                className="btn-cancel-delete"
                onClick={() => setShowConfirmDelete(false)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', fontWeight: '600', cursor: 'pointer' }}
              >
                Annulla
              </button>
              <button 
                type="button"
                className="btn-confirm-delete"
                onClick={eseguiEliminaEffettiva}
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  border: '1px solid #dc3545', 
                  background: 'rgba(220, 53, 69, 0.1)', 
                  color: '#dc3545', 
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Conferma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DI PROGRAMMAZIONE / VISUALIZZAZIONE EVENTO */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle(colors)}>
            <h3 style={{ marginTop: 0, fontWeight: '800', color: colors?.dark || '#111' }}>
              {newEvent.id ? 'Dettagli / Modifica Evento' : 'Programma Nuovo Evento'}
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              <div>
                <label style={labelStyle}>Titolo Evento</label>
                <input 
                  type="text" 
                  required
                  style={inputStyle}
                  value={newEvent.titolo}
                  onChange={e => setNewEvent({...newEvent, titolo: e.target.value})}
                  placeholder="Es. Riunione di Redazione"
                />
              </div>

              <div>
                <label style={labelStyle}>Descrizione</label>
                <textarea 
                  style={inputStyle}
                  rows="3"
                  value={newEvent.descrizione}
                  onChange={e => setNewEvent({...newEvent, descrizione: e.target.value})}
                  placeholder="Aggiungi dettagli..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Inizio</label>
                  <input 
                    type="datetime-local" 
                    required
                    style={inputStyle}
                    value={newEvent.start}
                    onChange={e => setNewEvent({...newEvent, start: e.target.value})}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Fine</label>
                  <input 
                    type="datetime-local" 
                    required
                    style={inputStyle}
                    value={newEvent.end}
                    onChange={e => setNewEvent({...newEvent, end: e.target.value})}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                {newEvent.id && (
                  <button 
                    type="button" 
                    className="btn-modal-delete"
                    onClick={handleEliminaEvento}
                    style={{ 
                      padding: '10px 15px', 
                      borderRadius: '8px', 
                      border: '1px solid #dc3545', 
                      background: 'rgba(220, 53, 69, 0.1)', 
                      color: '#dc3545', 
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginRight: 'auto' 
                    }}
                  >
                    Elimina
                  </button>
                )}

                <button 
                  type="button" 
                  className="btn-modal-cancel"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
                >
                  Annulla
                </button>
                <button 
                  type="submit" 
                  className="btn-modal-save"
                  style={{ 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    background: colors?.primary || '#007bff', 
                    color: '#fff', 
                    fontWeight: '600',
                    cursor: 'pointer' 
                  }}
                >
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 9999,
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  backdropFilter: 'blur(4px)'
};

const modalContentStyle = (colors) => ({
  background: 'white', padding: '30px', borderRadius: '16px',
  maxWidth: '470px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
  fontFamily: 'system-ui, sans-serif'
});

const labelStyle = {
  display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: '#555', textTransform: 'uppercase'
};

const inputStyle = {
  width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '14px'
};

export default CalendarioTeams;