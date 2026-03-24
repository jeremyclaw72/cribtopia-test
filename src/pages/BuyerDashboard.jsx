import React, { useState } from 'react';

const LOGO = "https://media.base44.com/images/public/69b1a2ff64aa2c797de555bf/b3c405919_IMG_6232.png";
const API_URL = 'http://100.104.178.26:3000';

const OFFER_STATUSES = ['pending', 'accepted', 'rejected', 'countered'];
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
];
const FINANCING_TYPES = ['Cash', 'Conventional', 'FHA', 'VA', 'USDA'];

const getListingImage = (listing) => {
  if (listing.photos && listing.photos.length > 0 && listing.photos[0]) {
    return listing.photos[0];
  }
  return PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];
};

export default function BuyerDashboard() {
  // Use URL hash to persist view state
  const getInitialView = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'browse' || hash === 'offers' || hash === 'activity') {
      return hash;
    }
    return 'browse'; // Default to browse
  };

  const [view, setView] = useState(getInitialView);
  const [offers, setOffers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [form, setForm] = useState({
    listing_id: '',
    buyer_name: '',
    buyer_email: '',
    buyer_phone: '',
    offer_amount: '',
    earnest_money: '',
    financing_type: 'Cash',
    closing_date: '',
    contingencies: '',
    message: ''
  });

  // Update URL hash when view changes
  const handleViewChange = (newView) => {
    setView(newView);
    window.location.hash = newView;
  };

  React.useEffect(() => {
    fetchData();
    // Listen for hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'browse' || hash === 'offers' || hash === 'activity') {
        setView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listingsRes, offersRes] = await Promise.all([
        fetch(`${API_URL}/api/listings`),
        fetch(`${API_URL}/api/offers`)
      ]);
      const listingsData = await listingsRes.json();
      const offersData = await offersRes.json();
      console.log('Fetched listings:', listingsData);
      setListings(listingsData || []);
      setOffers(offersData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  const handleMakeOffer = (listing) => {
    setSelectedListing(listing);
    setForm({
      ...form,
      listing_id: listing.id,
      offer_amount: listing.price
    });
    setShowOfferForm(true);
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/api/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          offer_amount: parseFloat(form.offer_amount) || 0,
          earnest_money: parseFloat(form.earnest_money) || 0
        })
      });

      if (res.ok) {
        setMessage('✅ Offer submitted successfully! The seller will be notified.');
        setShowOfferForm(false);
        setForm({
          listing_id: '',
          buyer_name: '',
          buyer_email: '',
          buyer_phone: '',
          offer_amount: '',
          earnest_money: '',
          financing_type: 'Cash',
          closing_date: '',
          contingencies: '',
          message: ''
        });
        fetchData();
      } else {
        setMessage('❌ Failed to submit offer. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting offer:', err);
      setMessage('❌ Error connecting to server.');
    }

    setSaving(false);
  };

  const formatPrice = (price, type) => {
    const num = parseFloat(price);
    if (isNaN(num)) return '$0';
    if (type === 'Rental') return `$${num.toLocaleString()}/mo`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a2540, #1a3a5c)', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      {/* Nav */}
      <nav style={{ padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <img src={LOGO} style={{ height: 32, borderRadius: 7 }} alt="Cribtopia" />
        <span style={{ fontWeight: 800, fontSize: 16 }}>Cribtopia</span>
        <span style={{ marginLeft: 'auto' }} />
        <a href="#/" style={{ color: '#10b981', textDecoration: 'none' }}>← Home</a>
      </nav>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 40 }}>
        <h1 style={{ margin: '0 0 30px' }}>👤 Buyer Dashboard</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
          <button onClick={() => handleViewChange('browse')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: view === 'browse' ? '#0ea5e9' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Browse</button>
          <button onClick={() => handleViewChange('offers')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: view === 'offers' ? '#0ea5e9' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>My Offers</button>
          <button onClick={() => handleViewChange('activity')} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: view === 'activity' ? '#0ea5e9' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Activity</button>
        </div>

        {message && (
          <div style={{ padding: '12px 16px', marginBottom: 20, borderRadius: 8, background: message.startsWith('✅') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', border: `1px solid ${message.startsWith('✅') ? '#10b981' : '#ef4444'}` }}>
            {message}
          </div>
        )}

        {view === 'activity' && (
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ margin: '0 0 20px' }}>Your Activity</h2>
            {offers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ opacity: 0.7, marginBottom: 20 }}>You haven't made any offers yet.</p>
                <button onClick={() => handleViewChange('browse')} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #0ea5e9, #10b981)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Browse Properties</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {offers.map(offer => {
                  const listing = listings.find(l => l.id === offer.listing_id);
                  return (
                    <div key={offer.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{listing?.address || 'Unknown Property'}</div>
                        <div style={{ opacity: 0.7, fontSize: 14 }}>{listing?.city}, {listing?.state}</div>
                        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: offer.status === 'accepted' ? '#10b981' : offer.status === 'rejected' ? '#ef4444' : 'rgba(255,255,255,0.2)' }}>{offer.status}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>${parseFloat(offer.offer_amount).toLocaleString()}</div>
                        <div style={{ fontSize: 12, opacity: 0.6 }}>{new Date(offer.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {view === 'offers' && (
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ margin: '0 0 20px' }}>Your Offers</h2>
            {loading ? (
              <p style={{ opacity: 0.7 }}>Loading...</p>
            ) : offers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ opacity: 0.7, marginBottom: 20 }}>You haven't made any offers yet.</p>
                <button onClick={() => handleViewChange('browse')} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #0ea5e9, #10b981)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Browse Properties</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {offers.map(offer => {
                  const listing = listings.find(l => l.id === offer.listing_id);
                  return (
                    <div key={offer.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{listing?.address || 'Unknown Property'}</div>
                          <div style={{ opacity: 0.7, fontSize: 14 }}>{listing?.city}, {listing?.state}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>${parseFloat(offer.offer_amount).toLocaleString()}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: offer.status === 'accepted' ? '#10b981' : offer.status === 'rejected' ? '#ef4444' : 'rgba(255,255,255,0.2)' }}>{offer.status}</span>
                        {offer.counter_amount && <span style={{ fontSize: 12, opacity: 0.7 }}>Counter: ${parseFloat(offer.counter_amount).toLocaleString()}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {view === 'browse' && (
          <div>
            <h2 style={{ margin: '0 0 20px' }}>Browse Properties</h2>
            {loading ? (
              <p style={{ opacity: 0.7 }}>Loading...</p>
            ) : listings.length === 0 ? (
              <p style={{ opacity: 0.7 }}>No properties available.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {listings.map(listing => (
                  <div key={listing.id} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ height: 140, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <img 
                        src={getListingImage(listing)} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt={listing.address}
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGES[0]; }}
                      />
                      <span style={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8, 
                        padding: '4px 10px', 
                        borderRadius: 20, 
                        fontSize: 11, 
                        fontWeight: 700, 
                        background: listing.listing_type === 'FSBO' ? '#10b981' : listing.listing_type === 'Rental' ? '#f59e0b' : '#0ea5e9' 
                      }}>
                        {listing.listing_type}
                      </span>
                    </div>
                    <div style={{ padding: 16 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{formatPrice(listing.price, listing.listing_type)}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{listing.address}</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>{listing.city}, {listing.state}</div>
                      <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{listing.bedrooms} bed • {listing.bathrooms} bath • {listing.sqft?.toLocaleString()} sqft</div>
                      <button 
                        onClick={() => handleMakeOffer(listing)}
                        style={{ 
                          width: '100%', 
                          marginTop: 12, 
                          padding: '10px', 
                          background: 'linear-gradient(135deg, #0ea5e9, #10b981)', 
                          border: 'none', 
                          borderRadius: 8, 
                          color: 'white', 
                          fontWeight: 600, 
                          cursor: 'pointer' 
                        }}
                      >
                        Make Offer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Offer Form Modal */}
      {showOfferForm && selectedListing && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20 }} onClick={() => setShowOfferForm(false)}>
          <div style={{ background: 'linear-gradient(135deg, #0a2540, #1a3a5c)', borderRadius: 20, maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Make an Offer</h2>
              <button onClick={() => setShowOfferForm(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ padding: 24 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{selectedListing.address}</div>
                <div style={{ opacity: 0.7 }}>{selectedListing.city}, {selectedListing.state}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 8 }}>{formatPrice(selectedListing.price, selectedListing.listing_type)}</div>
              </div>

              <form onSubmit={handleSubmitOffer}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Your Name *</label>
                    <input name="buyer_name" value={form.buyer_name} onChange={e => setForm({...form, buyer_name: e.target.value})} required style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 16 }} placeholder="John Smith" />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Email *</label>
                    <input name="buyer_email" type="email" value={form.buyer_email} onChange={e => setForm({...form, buyer_email: e.target.value})} required style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 16 }} placeholder="john@example.com" />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Phone</label>
                    <input name="buyer_phone" value={form.buyer_phone} onChange={e => setForm({...form, buyer_phone: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 16 }} placeholder="(555) 123-4567" />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Offer Amount *</label>
                    <input name="offer_amount" type="number" value={form.offer_amount} onChange={e => setForm({...form, offer_amount: e.target.value})} required style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 16 }} placeholder="450000" />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Financing Type</label>
                    <select name="financing_type" value={form.financing_type} onChange={e => setForm({...form, financing_type: e.target.value})} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 16 }}>
                      {FINANCING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Message to Seller</label>
                    <textarea name="message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 16, resize: 'vertical' }} placeholder="Add a personal message to the seller..." />
                  </div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                  <button type="submit" disabled={saving} style={{ flex: 1, padding: '14px 28px', background: 'linear-gradient(135deg, #0ea5e9, #10b981)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', fontSize: 16, opacity: saving ? 0.7 : 1 }}>
                    {saving ? 'Submitting...' : 'Submit Offer'}
                  </button>
                  <button type="button" onClick={() => setShowOfferForm(false)} style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}