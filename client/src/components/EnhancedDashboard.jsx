import React from 'react';
import DashboardEditore from './DashboardEditore';

const QuickStatsHeader = ({ conteggioArticoli }) => {
  const stats = [
    { label: "Articoli Totali", value: conteggioArticoli || "0", icon: "📝" },
    { label: "Sponsor Attivi", value: "Monitoraggio", icon: "🤝" }, 
    { label: "Visualizzazioni", value: "Live", icon: "📈" }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
      {stats.map((s, i) => (
        <div key={i} style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '24px' }}>{s.icon}</div>
          <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', marginTop: '5px' }}>{s.label}</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
};

const EnhancedDashboard = (props) => {
  return (
    <div className="enhanced-dashboard" style={{ background: '#f8f9fa', minHeight: '100vh', paddingTop: '1px', paddingBottom: '50px' }}>
      {/* Header con statistiche rapide */}
      <QuickStatsHeader />
      
      {/* Richiamiamo DashboardEditore che al suo interno 
          contiene già la lista articoli, il profilo e GestioneSponsor
      */}
      <DashboardEditore {...props} />
    </div>
  );
};

export default EnhancedDashboard;