import React, { useEffect, useState } from 'react';

const RubricheDashboard = () => {
  const [articoli, setArticoli] = useState([]);
  
  const rubriche = [
    { id: 'RUBRICA_1', nome: 'Tecnologia' },
    { id: 'RUBRICA_2', nome: 'Lifestyle' },
    { id: 'RUBRICA_3', nome: 'Cultura' },
    { id: 'RUBRICA_4', nome: 'Economia' },
    { id: 'RUBRICA_5', nome: 'Sport' },
    { id: 'RUBRICA_6', nome: 'Viaggi' }
  ];

  useEffect(() => {
    // Sostituisci con il tuo endpoint reale di fetch di tutti gli articoli
    fetch('https://magazine.skillfactory.it/api/pagine', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setArticoli(data))
      .catch(err => console.error("Errore fetch:", err));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Le tue Rubriche</h1>
      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {rubriche.map(r => (
          <div key={r.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h2 style={{ color: '#007bff' }}>{r.nome}</h2>
            <ul>
              {articoli
                .filter(a => a.rubrica === r.id)
                .map(a => <li key={a.id}>{a.titolo}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RubricheDashboard;
