import React from 'react';

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0a2540 0%, #1a4a7a 100%)',
      color: 'white',
      fontFamily: 'sans-serif',
      padding: 40
    }}>
      <h1 style={{ fontSize: 48, margin: 0 }}>🏠 Cribtopia</h1>
      <p style={{ fontSize: 20, opacity: 0.8 }}>Test Home Page - Working!</p>
      
      <div style={{ marginTop: 30, display: 'flex', gap: 20 }}>
        <a href="#/SellerDashboard" style={{ 
          padding: '15px 30px', 
          background: '#10b981', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: 10,
          fontWeight: 'bold'
        }}>
          Seller Dashboard
        </a>
        <a href="#/BuyerDashboard" style={{ 
          padding: '15px 30px', 
          background: '#0ea5e9', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: 10,
          fontWeight: 'bold'
        }}>
          Buyer Dashboard
        </a>
      </div>
      
      <div style={{ marginTop: 40, padding: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 10 }}>
        <h2>Mock Listings</h2>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ padding: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 10, width: 200 }}>
            <h3 style={{ margin: '0 0 10px 0' }}>123 Main St</h3>
            <p style={{ margin: '0 0 5px 0', opacity: 0.8 }}>Denver, CO</p>
            <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>$450,000</p>
          </div>
          <div style={{ padding: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 10, width: 200 }}>
            <h3 style={{ margin: '0 0 10px 0' }}>456 Oak Ave</h3>
            <p style={{ margin: '0 0 5px 0', opacity: 0.8 }}>Aurora, CO</p>
            <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>$320,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}