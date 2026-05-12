import React, { useState, useEffect } from 'react';

const DettaglioIntervista = ({ id, onBack }) => {
    const [intervista, setIntervista] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Stati per gestire l'hover
    const [isBackHovered, setIsBackHovered] = useState(false);
    const [isDeleteHovered, setIsDeleteHovered] = useState(false);

    useEffect(() => {
        const fetchIntervista = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8096/api/interviste/${id}`, {
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
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchIntervista();
    }, [id]);

    const handleElimina = async () => {
        if (window.confirm("Sei sicuro di voler rimuovere questa candidatura?")) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:8096/api/interviste/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    alert("Candidatura rimossa con successo.");
                    onBack(); 
                }
            } catch (err) {
                console.error(err);
            }
        }
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
                    Contattare l'utente per confermare la validità dei dati.
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

                <div style={{ marginTop: '20px', padding: '15px', background: '#fdfdfd', borderRadius: '10px', border: '1px solid #f1f1f1' }}>
                    <span style={{...labelStyle, display: 'block', marginBottom: '12px', color: '#555'}}>Consensi Privacy:</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>A5 - Marketing:</span>
                            {renderConsent(intervista?.accettaMarketing)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>A6 - Cessione Terzi:</span>
                            {renderConsent(intervista?.accettaCessioneTerzi)}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '2px solid #f8f9fa' }}>
                    <span style={{...labelStyle, display: 'block', marginBottom: '10px'}}>Motivi dell'intervista:</span>
                    <div style={messaggioBoxStyle}>
                        {intervista?.messaggio || "Nessuna descrizione fornita."}
                    </div>
                </div>
            </div>

            <div style={buttonContainer}>
                <button 
                    onClick={onBack} 
                    onMouseEnter={() => setIsBackHovered(true)}
                    onMouseLeave={() => setIsBackHovered(false)}
                    style={{
                        ...backButtonStyle,
                        backgroundColor: isBackHovered ? '#e2e6ea' : '#f8f9fa'
                    }}
                >
                    Indietro
                </button>
                
                <button 
                    onClick={handleElimina} 
                    onMouseEnter={() => setIsDeleteHovered(true)}
                    onMouseLeave={() => setIsDeleteHovered(false)}
                    style={{
                        ...deleteButtonStyle,
                        backgroundColor: isDeleteHovered ? '#dc3545' : '#fff',
                        color: isDeleteHovered ? '#fff' : '#dc3545'
                    }}
                >
                    Rimuovi Candidato
                </button>
            </div>
        </div>
    );
};

// Stili base (senza modifiche)
const msgStyle = { padding: '50px', textAlign: 'center' };
const containerStyle = { padding: '20px', maxWidth: '850px', margin: '0 auto' };
const titleStyle = { fontSize: '26px', margin: 0, color: '#333' };
const cardStyle = { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const infoRow = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f8f9fa' };
const labelStyle = { fontWeight: '600', color: '#888', fontSize: '12px', textTransform: 'uppercase' };
const valueStyle = { color: '#333', fontSize: '16px' };
const messaggioBoxStyle = { background: '#f8f9fa', padding: '20px', borderRadius: '10px', fontStyle: 'italic', color: '#555', lineHeight: '1.6', borderLeft: '4px solid #007bff' };
const buttonContainer = { marginTop: '30px', display: 'flex', gap: '20px' };

const backButtonStyle = { 
    flex: 1, 
    padding: '15px', 
    border: '1px solid #dee2e6', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease' // Transizione fluida
};

const deleteButtonStyle = { 
    flex: 1, 
    padding: '15px', 
    border: '2px solid #dc3545', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    transition: 'all 0.2s ease' // Transizione fluida per colore e sfondo
};

const badgeStyle = { padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', minWidth: '40px', textAlign: 'center' };
const warningBannerStyle = { backgroundColor: '#fff3cd', color: '#856404', padding: '15px', borderRadius: '10px', border: '1px solid #ffeeba', marginBottom: '20px', fontSize: '14px' };

export default DettaglioIntervista;