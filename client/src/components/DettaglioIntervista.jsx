import React, { useState, useEffect } from 'react';

const DettaglioIntervista = ({ id, onBack }) => {
    const [intervista, setIntervista] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div style={msgStyle}>Caricamento in corso...</div>;
    if (error) return <div style={{...msgStyle, color: 'red'}}>Errore: {error}</div>;

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={titleStyle}>Dettaglio Candidatura</h2>
                <span style={{ color: '#6c757d' }}>ID: #{id}</span>
            </div>
            
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

                {/* Sezione Motivi/Messaggio */}
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
                    style={backButtonStyle}
                    onMouseOver={(e) => e.target.style.background = '#e2e6ea'}
                    onMouseOut={(e) => e.target.style.background = '#f8f9fa'}
                >
                    Indietro
                </button>
                
                <button 
                    onClick={handleElimina}
                    style={deleteButtonStyle}
                    onMouseOver={(e) => {
                        e.target.style.background = '#dc3545';
                        e.target.style.color = '#fff';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.color = '#dc3545';
                    }}
                >
                    Rimuovi Candidato
                </button>
            </div>
        </div>
    );
};

// Stili Inline
const msgStyle = { padding: '50px', textAlign: 'center' };
const containerStyle = { padding: '20px', maxWidth: '850px', margin: '0 auto' };
const titleStyle = { fontSize: '26px', margin: 0, color: '#333' };
const cardStyle = { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #eee' };
const infoRow = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f8f9fa' };
const labelStyle = { fontWeight: '600', color: '#888', fontSize: '14px', uppercase: 'true' };
const valueStyle = { color: '#333', fontSize: '16px' };
const messaggioBoxStyle = { background: '#f8f9fa', padding: '20px', borderRadius: '10px', fontStyle: 'italic', color: '#555', lineHeight: '1.6', borderLeft: '4px solid #007bff' };
const buttonContainer = { marginTop: '30px', display: 'flex', gap: '20px' };
const backButtonStyle = { flex: 1, padding: '15px', border: '1px solid #dee2e6', background: '#f8f9fa', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' };
const deleteButtonStyle = { flex: 1, padding: '15px', border: '2px solid #dc3545', background: '#fff', color: '#dc3545', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' };

export default DettaglioIntervista;