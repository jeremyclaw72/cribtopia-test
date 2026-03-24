import React, { useState, useEffect } from 'react';

const LOGO = "https://media.base44.com/images/public/69b1a2ff64aa2c797de555bf/b3c405919_IMG_6232.png";

export default function BuyerDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[BuyerDashboard] Component mounted');
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', background: '#0a2540', minHeight: '100vh', color: 'white' }}>
        <img src={LOGO} style={{ height: 60, marginBottom: 20 }} alt="Cribtopia" />
        <p>Loading Buyer Dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, background: '#0a2540', minHeight: '100vh', color: 'white' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
          <img src={LOGO} style={{ height: 40, marginRight: 15 }} alt="Cribtopia" />
          <h1 style={{ margin: 0 }}>Buyer Dashboard</h1>
        </div>
        
        <p style={{ marginBottom: 20 }}>Welcome to your Buyer Dashboard.</p>
        
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 10 }}>
          <h2 style={{ marginTop: 0 }}>Your Offers</h2>
          <p>You have no active offers yet.</p>
          <p>Browse properties on the home page to make an offer!</p>
        </div>
        
        <p style={{ marginTop: 20 }}>
          <a href="/" style={{ color: '#10b981' }}>← Back to Home</a>
        </p>
      </div>
    </div>
  );
}