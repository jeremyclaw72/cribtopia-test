import React, { useState, useEffect } from 'react';

const LOGO = "https://media.base44.com/images/public/69b1a2ff64aa2c797de555bf/b3c405919_IMG_6232.png";

export default function SellerDashboard() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[SellerDashboard] Component mounted');
    
    // Simulate loading data
    setTimeout(() => {
      try {
        console.log('[SellerDashboard] Setting mock data');
        setListings([
          { id: '1', address: '123 Test St', city: 'Denver', price: 450000 },
          { id: '2', address: '456 Sample Ave', city: 'Aurora', price: 320000 },
        ]);
        setLoading(false);
      } catch (e) {
        console.error('[SellerDashboard] Error:', e);
        setError(e.message);
        setLoading(false);
      }
    }, 500);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', background: '#0a2540', minHeight: '100vh', color: 'white' }}>
        <img src={LOGO} style={{ height: 60, marginBottom: 20 }} alt="Cribtopia" />
        <p>Loading Seller Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, background: '#1a1a2e', minHeight: '100vh', color: 'white' }}>
        <h1>Error: {error}</h1>
        <a href="/" style={{ color: '#10b981' }}>← Back to Home</a>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, background: '#0a2540', minHeight: '100vh', color: 'white' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 30 }}>
          <img src={LOGO} style={{ height: 40, marginRight: 15 }} alt="Cribtopia" />
          <h1 style={{ margin: 0 }}>Seller Dashboard</h1>
        </div>
        
        <p style={{ marginBottom: 20 }}>Welcome to your Seller Dashboard. You have {listings.length} listings.</p>
        
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 10 }}>
          <h2 style={{ marginTop: 0 }}>Your Listings</h2>
          {listings.map(listing => (
            <div key={listing.id} style={{ background: 'rgba(255,255,255,0.1)', padding: 15, marginBottom: 10, borderRadius: 8 }}>
              <strong>{listing.address}</strong>
              <br />
              <span>{listing.city}</span>
              <br />
              <span style={{ color: '#10b981' }}>${listing.price.toLocaleString()}</span>
            </div>
          ))}
        </div>
        
        <p style={{ marginTop: 20 }}>
          <a href="/" style={{ color: '#10b981' }}>← Back to Home</a>
        </p>
      </div>
    </div>
  );
}