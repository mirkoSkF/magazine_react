import React, { useState, useEffect } from 'react';

const DettaglioIntervista = ({ id, onBack }) => {
    const [intervista, setIntervista] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- STATO PER MODAL CUSTOM ---
    const [modal, setModal] = useState({ 
        show: false, 
        message: '', 
        type: 'alert', // 'alert' o 'confirm'
        onConfirm: null 
    });

    // Colori di riferimento (coerenti con il resto della dashboard)
    const colors = {
        primary: '#007bff',
        danger: '#dc3545',
        success: '#28a745',
        dark: '#333',
        border: '#dee2e6'
    };

    const customAlert = (msg) => {
        setModal({ show: true, message: msg, type: 'alert', onConfirm: null });
    };

    const customConfirm = (msg, action) => {
        setModal({ show: true, message: msg, type: 'confirm', onConfirm: action });
    };

    useEffect(() => {
        const fetchIntervista = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://magazine.skillfactory.it/api/interviste/${id}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error("Richiesta non trovata.");
                const data = await response.json();
                setIntervista(data);
            } catch (err) {
                setError(err.message);
                customAlert("Errore nel recupero dei dati: " + err.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchIntervista();
    }, [id]);

    const handleElimina = () => {
        customConfirm("Sei sicuro di voler rimuovere questa candidatura?", async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://magazine.skillfactory.it/api/interviste/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    onBack(); // Torna indietro dopo l'eliminazione
                } else {
                    customAlert("Impossibile eliminare la candidatura.");
                }
            } catch (err) {
                console.error(err);
                customAlert("Errore durante l'eliminazione.");
            }
        });
    };

    const isDataExpired = () => {
        if (!intervista?.dataInvio) return false; 
        const dataInvio = new Date(intervista.dataInvio);
        const oggi = new Date();
        const differenzaTempo = oggi.getTime() - dataInvio.getTime();
        const giorniTrascorsi = differenzaTempo / (1000 * 3600 * 24);
        return giorniTrascorsi > 730; 
    };

    if (loading) return <div style={msgStyle}>Caricamento in corso...</div>;
    if (error) return <div style={{...msgStyle, color: 'red'}}>Errore: {error}</div>;

    const renderConsent = (val) => (
        <span style={{
            ...badgeStyle,
            backgroundColor: val ? '#d4edda' : '#f8d7da',
            color: val ? '#155724' : '#721c24'
        }}>
            {val ? 'SÌ' : 'NO'}
        </span>
    );

    return (
        <div style={containerStyle}>
            {/* --- MODAL RENDERING --- */}
            {modal.show && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            {modal.type === 'alert' ? (
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                            ) : (
                                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                            )}
                        </div>
                        <p style={modalTextStyle}>{modal.message}</p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            {modal.type === 'confirm' && (
                                <button 
                                    onClick={() => setModal({ ...modal, show: false })} 
                                    className="btn-modal-secondary"
                                >
                                    Annulla
                                </button>
                            )}
                            <button 
                                onClick={() => { if(modal.onConfirm) modal.onConfirm(); setModal({ ...modal, show: false }); }} 
                                className={modal.type === 'confirm' ? 'btn-modal-danger' : 'btn-modal-primary'}
                            >
                                {modal.type === 'confirm' ? 'Sì, Rimuovi' : 'Ho capito'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .btn-detail { transition: all 0.3s ease !important; cursor: pointer; font-weight: bold; }
                .btn-back:hover { background-color: #e2e6ea !important; transform: translateY(-1px); }
                .btn-delete:hover { background-color: #dc3545 !important; color: white !important; transform: translateY(-1px); }
                
                .btn-modal-secondary { padding: 12px 24px; border-radius: 10px; border: 1px solid #dee2e6; background: #f8f9fa; color: #666; cursor: pointer; font-weight: 600; transition: all 0.2s ease; }
                .btn-modal-primary { padding: 12px 30px; border-radius: 10px; border: none; background: ${colors.primary}; color: white; cursor: pointer; font-weight: bold; transition: all 0.2s ease; }
                .btn-modal-primary:hover { transform: scale(1.05); filter: brightness(1.1); }

                /* Hover elegante per il tasto di rimozione */
                .btn-modal-danger { 
                    padding: 12px 30px; 
                    border-radius: 10px; 
                    border: none; 
                    background: ${colors.danger}; 
                    color: white; 
                    cursor: pointer; 
                    font-weight: bold; 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 6px rgba(220, 53, 69, 0.15);
                }

                .btn-modal-danger:hover { 
                    background-color: #c82333; 
                    transform: translateY(-2px); 
                    box-shadow: 0 8px 15px rgba(220, 53, 69, 0.3);
                }

                .btn-modal-danger:active {
                    transform: translateY(0);
                    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.2);
                }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={titleStyle}>Dettaglio Candidatura</h2>
                <div style={{textAlign: 'right'}}>
                    <span style={{ color: '#6c757d', display: 'block', fontSize: '12px' }}>ID: #{id}</span>
                    {intervista?.dataInvio && (
                        <span style={{ color: '#6c757d', fontSize: '12px' }}>
                            Inviato il: {new Date(intervista.dataInvio).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            {isDataExpired() && (
                <div style={warningBannerStyle}>
                    <strong>⚠️ Dati da aggiornare:</strong> Questa candidatura è stata inviata più di 2 anni fa. 
                </div>
            )}
            
            <div style={cardStyle}>
                <div style={infoRow}>
                    <span style={labelStyle}>Azienda:</span>
                    <span style={{...valueStyle, fontWeight: 'bold'}}>{intervista?.azienda}</span>
                </div>
                <div style={infoRow}>
                    <span style={labelStyle}>Referente:</span>
                    <span style={valueStyle}>{intervista?.referente}</span>
                </div>
                <div style={infoRow}>
                    <span style={labelStyle}>Email:</span>
                    <span style={{ ...valueStyle, color: '#007bff' }}>{intervista?.email}</span>
                </div>
                <div style={infoRow}>
                    <span style={labelStyle}>Telefono:</span>
                    <span style={valueStyle}>{intervista?.telefono}</span>
                </div>

                <div style={consentContainerStyle}>
                    <span style={{...labelStyle, display: 'block', marginBottom: '12px', color: '#555'}}>Consensi Privacy:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={consentRowStyle}>
                            <span style={{ fontSize: '13px', color: '#666' }}>A5 - Marketing:</span>
                            {renderConsent(intervista?.accettaMarketing)}
                        </div>
                        <div style={consentRowStyle}>
                            <span style={{ fontSize: '13px', color: '#666' }}>A6 - Cessione Terzi:</span>
                            {renderConsent(intervista?.accettaCessioneTerzi)}
                        </div>
                    </div>
                </div>

                <div style={messaggioSectionStyle}>
                    <span style={{...labelStyle, display: 'block', marginBottom: '10px'}}>Motivi dell'intervista:</span>
                    <div style={messaggioBoxStyle}>
                        {intervista?.messaggio || "Nessuna descrizione fornita."}
                    </div>
                </div>
            </div>

            <div style={buttonContainer}>
                <button onClick={onBack} className="btn-detail btn-back" style={backButtonStyle}>
                    Indietro
                </button>
                <button onClick={handleElimina} className="btn-detail btn-delete" style={deleteButtonStyle}>
                    Rimuovi Candidato
                </button>
            </div>
        </div>
    );
};

// --- STILI ---
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
const modalContentStyle = { background: 'white', padding: '35px', borderRadius: '20px', maxWidth: '420px', width: '90%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', animation: 'modalFadeIn 0.3s ease' };
const modalTextStyle = { fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '30px', lineHeight: '1.4' };

const msgStyle = { padding: '50px', textAlign: 'center' };
const containerStyle = { padding: '20px', maxWidth: '850px', margin: '0 auto' };
const titleStyle = { fontSize: '26px', margin: 0, color: '#333' };
const cardStyle = { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const infoRow = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f8f9fa' };
const labelStyle = { fontWeight: '600', color: '#888', fontSize: '12px', textTransform: 'uppercase' };
const valueStyle = { color: '#333', fontSize: '16px' };
const messaggioBoxStyle = { background: '#f8f9fa', padding: '20px', borderRadius: '10px', fontStyle: 'italic', color: '#555', lineHeight: '1.6', borderLeft: '4px solid #007bff' };
const buttonContainer = { marginTop: '30px', display: 'flex', gap: '20px' };
const consentContainerStyle = { marginTop: '20px', padding: '15px', background: '#fdfdfd', borderRadius: '10px', border: '1px solid #f1f1f1' };
const consentRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const messaggioSectionStyle = { marginTop: '25px', paddingTop: '20px', borderTop: '2px solid #f8f9fa' };

const backButtonStyle = { flex: 1, padding: '15px', border: '1px solid #dee2e6', borderRadius: '10px', backgroundColor: '#f8f9fa', color: '#333', transition: 'all 0.3s ease' };
const deleteButtonStyle = { flex: 1, padding: '15px', border: '2px solid #dc3545', borderRadius: '10px', backgroundColor: '#fff', color: '#dc3545', transition: 'all 0.3s ease' };
const badgeStyle = { padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', minWidth: '40px', textAlign: 'center' };
const warningBannerStyle = { backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '10px', border: '1px solid #ffeeba', marginBottom: '20px', fontSize: '14px' };

export default DettaglioIntervista;
