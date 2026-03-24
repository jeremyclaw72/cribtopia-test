import React, { useState } from 'react';

const LOGO = "https://media.base44.com/images/public/69b1a2ff64aa2c797de555bf/b3c405919_IMG_6232.png";

export default function ContractDrafter() {
  const [contractType, setContractType] = useState('fsbo');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a2540, #1a3a5c)', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      {/* Nav */}
      <nav style={{ padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <img src={LOGO} style={{ height: 32, borderRadius: 7 }} alt="Cribtopia" />
        <span style={{ fontWeight: 800, fontSize: 16 }}>Cribtopia</span>
        <span style={{ marginLeft: 'auto' }} />
        <a href="#/" style={{ color: '#10b981', textDecoration: 'none' }}>← Home</a>
      </nav>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: 40 }}>
        <h1 style={{ margin: '0 0 30px' }}>📝 Contract Drafter</h1>
        <p style={{ opacity: 0.7, marginBottom: 30 }}>Generate state-specific real estate contracts for your transaction.</p>

        {/* Contract Type Selection */}
        <div style={{ marginBottom: 30 }}>
          <label style={{ display: 'block', marginBottom: 10, fontWeight: 600 }}>Select Contract Type:</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { id: 'fsbo', label: 'FSBO Purchase', icon: '🏡' },
              { id: 'rental', label: 'Rental Lease', icon: '🔑' },
              { id: 'rent_to_own', label: 'Rent-to-Own', icon: '📋' },
            ].map(type => (
              <button key={type.id} onClick={() => setContractType(type.id)} style={{ padding: '14px 20px', borderRadius: 10, border: 'none', background: contractType === type.id ? '#10b981' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Placeholder */}
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: '0 0 20px' }}>Property Details</h2>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, opacity: 0.8 }}>Property Address</label>
            <input type="text" placeholder="123 Main Street, Denver, CO 80202" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, opacity: 0.8 }}>Sale Price</label>
              <input type="text" placeholder="$450,000" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, opacity: 0.8 }}>Closing Date</label>
              <input type="date" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
            </div>
          </div>

          <button style={{ width: '100%', padding: '14px 28px', background: 'linear-gradient(135deg, #0ea5e9, #10b981)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16 }}>
            Generate Contract
          </button>
        </div>

        <p style={{ marginTop: 20, opacity: 0.6, fontSize: 14, textAlign: 'center' }}>
          ⚠️ Demo mode: Connect to Base44 backend for AI-powered contract generation.
        </p>
      </div>
    </div>
  );
}