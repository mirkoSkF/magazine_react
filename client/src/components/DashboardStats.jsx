import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const DashboardStats = ({ colors }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [period, setPeriod] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ];

  // Usiamo useCallback per evitare ricreazioni inutili della funzione
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Sessione scaduta o token mancante");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const url = `https://magazine.skillfactory.it/api/stats?month=${period.month}&year=${period.year}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const json = await res.json();
        setStats(json);
      } else if (res.status === 403) {
        setError("Accesso negato (403). Verifica i permessi del tuo account.");
      } else {
        setError(`Errore server: ${res.status}`);
      }
    } catch (err) {
      console.error("Errore di connessione:", err);
      setError("Impossibile connettersi al server.");
    } finally {
      setLoading(false);
    }
  }, [period.month, period.year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const cardStyle = {
    background: 'white', padding: '20px', borderRadius: '12px',
    border: `1px solid ${colors?.border || '#eee'}`, textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)', flex: "1 1 180px"
  };

  const chartContainerStyle = {
    background: 'white', padding: '25px', borderRadius: '15px',
    border: `1px solid ${colors?.border || '#eee'}`, marginBottom: '30px',
    height: '400px', width: '100%',
    minHeight: '400px' // Previene l'errore width/height -1 di Recharts
  };

  if (error) return <div style={{color: 'red', padding: '20px'}}>{error}</div>;

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      
      {/* SELETTORE PERIODO */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '25px', background: '#f1f3f5', padding: '15px', borderRadius: '10px' }}>
        <select 
          value={period.month} 
          onChange={(e) => setPeriod({...period, month: parseInt(e.target.value)})}
          style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${colors?.border || '#ccc'}`, cursor: 'pointer' }}
        >
          {monthNames.map((name, index) => (
            <option key={index + 1} value={index + 1}>{name}</option>
          ))}
        </select>
        <select 
          value={period.year} 
          onChange={(e) => setPeriod({...period, year: parseInt(e.target.value)})}
          style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${colors?.border || '#ccc'}`, cursor: 'pointer' }}
        >
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* CARD STATISTICHE */}
      {stats && (
        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <div style={cardStyle}>
            <h4 style={{ color: '#666', fontSize: '13px' }}>Articoli</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: colors?.dark }}>{stats.totArticoli}</p>
          </div>
          <div style={cardStyle}>
            <h4 style={{ color: '#666', fontSize: '13px' }}>Sondaggi</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: colors?.accent }}>{stats.totSondaggi}</p>
          </div>
          <div style={cardStyle}>
            <h4 style={{ color: '#666', fontSize: '13px' }}>Rubriche</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#9b59b6' }}>{stats.totRubriche}</p>
          </div>
          <div style={cardStyle}>
            <h4 style={{ color: '#666', fontSize: '13px' }}>Views Totali</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: colors?.primary }}>{stats.totVisualizzazioni?.toLocaleString()}</p>
          </div>
          <div style={cardStyle}>
            <h4 style={{ color: '#666', fontSize: '13px' }}>Click Sponsor</h4>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: colors?.success }}>{stats.totClickSponsor}</p>
          </div>
        </div>
      )}

      {/* GRAFICI */}
      <div style={chartContainerStyle}>
        <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Visualizzazioni Giornaliere</h3>
        {!loading && stats ? (
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={stats.graficoDati}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="label" fontSize={11} tickMargin={10} />
              <YAxis fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="visualizzazioni" name="Visualizzazioni" stroke={colors?.primary} fill={colors?.primary} fillOpacity={0.1} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p>Caricamento dati...</p>}
      </div>

      <div style={chartContainerStyle}>
        <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Distribuzione Contenuti</h3>
        {!loading && stats ? (
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={stats.graficoDati}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="label" fontSize={11} />
              <YAxis fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f5f5f5'}} />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="articoli" name="Articoli" fill={colors?.accent} radius={[4, 4, 0, 0]} />
              <Bar dataKey="sondaggi" name="Sondaggi" fill={colors?.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="rubriche" name="Rubriche" fill="#9b59b6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p>Caricamento dati...</p>}
      </div>
    </div>
  );
};

export default DashboardStats;
