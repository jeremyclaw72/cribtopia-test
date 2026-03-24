import React, { useState } from 'react';

const LOGO = "https://media.base44.com/images/public/69b1a2ff64aa2c797de555bf/b3c405919_IMG_6232.png";
const TYPE_COLORS = { FSBO: '#10b981', 'Rent-to-Own': '#0ea5e9', Rental: '#f59e0b', Vacation: '#8b5cf6' };
const BADGE_COLORS = {
  sold: '#ef4444',      // Red
  pending: '#f59e0b',   // Orange/Amber
  featured: '#0ea5e9',  // Blue/Teal
  just_listed: '#10b981', // Green
  pet_friendly: '#a16207' // Brown/Tan
};
const API_URL = 'http://100.104.178.26:3000';

// Auth helper
function useAuth() {
  const [user, setUser] = React.useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, logout };
}

// Placeholder images for when photos are missing
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
];

export default function Home() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  React.useEffect(() => {
    fetch(`${API_URL}/api/listings`)
      .then(res => res.json())
      .then(data => {
        setListings(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching listings:', err);
        setLoading(false);
      });
  }, []);

  const filtered = listings.filter(l => {
    const matchType = typeFilter === 'All' || l.listing_type === typeFilter;
    const q = search.toLowerCase();
    return matchType && (!q || l.address.toLowerCase().includes(q) || l.city.toLowerCase().includes(q));
  });

  // Get all photos for a listing
  const getAllPhotos = (listing) => {
    if (listing.photos && listing.photos.length > 0) {
      return listing.photos;
    }
    return [PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)]];
  };

  // Handle opening modal
  const openListingModal = (listing) => {
    setSelectedListing(listing);
    setCurrentPhotoIndex(0);
  };

  // Navigate photos
  const nextPhoto = () => {
    if (selectedListing) {
      const photos = getAllPhotos(selectedListing);
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (selectedListing) {
      const photos = getAllPhotos(selectedListing);
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const howItWorks = [
    { icon: '📋', title: 'List Your Property', desc: 'Create a listing in minutes — FSBO, Rental, Rent-to-Own, or Vacation.' },
    { icon: '💬', title: 'Receive Offers', desc: 'Buyers submit offers directly. You stay in full control.' },
    { icon: '📝', title: 'Generate Contracts', desc: 'AI drafts state-specific legal contracts instantly.' },
    { icon: '✅', title: 'Close the Deal', desc: 'Track every step of closing right inside the app.' },
  ];

  const footerLinks = [
    { label: 'Sell / Rent', path: '/SellerDashboard' },
    { label: 'Buyer Dashboard', path: '/BuyerDashboard' },
    { label: 'Contracts', path: '/ContractDrafter' },
    { label: 'FAQ', path: '/FAQAssistant' },
  ];

  const formatPrice = (price, type) => {
    const num = parseFloat(price);
    if (isNaN(num)) return '$0';
    if (type === 'Rental') return `$${num.toLocaleString()}/mo`;
    return `$${num.toLocaleString()}`;
  };

  const getListingImage = (listing) => {
    if (listing.photos && listing.photos.length > 0) {
      return listing.photos[0];
    }
    // Return a random placeholder
    return PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];
  };

  const auth = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0a2540, #1a4a7a)', fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      {/* Nav */}
      <nav style={{ padding: '0 12px', minHeight: 60, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, background: 'rgba(10,37,64,0.97)', zIndex: 100, flexWrap: 'wrap', justifyContent: 'center' }}>
        <img src={LOGO} style={{ height: 36, borderRadius: 8 }} alt="Cribtopia" />
        <span style={{ fontWeight: 800, fontSize: 16 }}>Cribtopia</span>
        <a href="#/SellerDashboard" style={{ color: '#fff', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', fontSize: 13, whiteSpace: 'nowrap' }}>Sell / Rent</a>
        <a href="#/BuyerDashboard" style={{ color: '#fff', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', fontSize: 13, whiteSpace: 'nowrap' }}>Buyer</a>
        <a href="#/ContractDrafter" style={{ color: '#fff', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', fontSize: 13, whiteSpace: 'nowrap' }}>Contracts</a>
        {auth.user ? (
          <>
            <span style={{ color: '#10b981', padding: '6px 12px', fontSize: 13 }}>👋 {auth.user.full_name || auth.user.email}</span>
            <button onClick={() => { auth.logout(); window.location.reload(); }} style={{ color: '#fff', textDecoration: 'none', padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', fontSize: 13, cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <a href="#/login" style={{ color: '#fff', textDecoration: 'none', padding: '7px 14px', borderRadius: 10, background: 'linear-gradient(135deg, #0ea5e9, #10b981)', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>Sign In</a>
        )}
        <a href="#/SellerDashboard" style={{ color: '#fff', textDecoration: 'none', padding: '7px 14px', borderRadius: 10, background: 'linear-gradient(135deg, #0ea5e9, #10b981)', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>List Property</a>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 20px 40px', maxWidth: 700, margin: '0 auto' }}>
        <img src={LOGO} style={{ height: 220, borderRadius: 20, marginBottom: 32, display: 'block', marginLeft: 'auto', marginRight: 'auto' }} alt="Cribtopia" />
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.15 }}>
          Buy, Sell &amp; Rent —<br />
          <span style={{ background: 'linear-gradient(135deg, #0ea5e9, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>No Agent Required</span>
        </h1>
        <p style={{ fontSize: 17, opacity: 0.8, margin: '0 0 32px', lineHeight: 1.7 }}>
          The platform that replaces real estate agents entirely.<br />
          FSBO reinvented — simple, modern, built for everyone.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <a href="#/SellerDashboard" style={{ padding: '14px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #0ea5e9, #10b981)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>📋 List Your Property</a>
          <a href="#/BuyerDashboard" style={{ padding: '14px 28px', borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>👤 Buyer Dashboard</a>
        </div>
        
        {/* Commission Savings Counter */}
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 16, padding: '20px 32px', marginBottom: 40, display: 'inline-block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
            <span style={{ fontSize: 28 }}>💰</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>Homeowners have saved</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>$1,247,850</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>in real estate commissions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ maxWidth: 600, margin: '0 auto 30px', padding: '0 20px' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by address or city..." style={{ width: '100%', padding: '14px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 30, padding: '0 20px' }}>
        {['All', 'FSBO', 'Rent-to-Own', 'Rental', 'Vacation'].map(type => (
          <button key={type} onClick={() => setTypeFilter(type)} style={{ padding: '8px 18px', borderRadius: 20, border: 'none', background: typeFilter === type ? '#10b981' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'background 0.2s' }}>{type}</button>
        ))}
      </div>

      {/* Listings */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 60px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ opacity: 0.7 }}>Loading listings...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filtered.map(listing => (
              <div 
                key={listing.id} 
                onClick={() => openListingModal(listing)}
                style={{ 
                  background: 'rgba(255,255,255,0.06)', 
                  borderRadius: 14, 
                  overflow: 'hidden', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
                  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <div style={{ height: 160, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <img 
                    src={getListingImage(listing)} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    alt={listing.address}
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGES[0]; }}
                  />
                  {/* Status badges (top left) - SOLD or PENDING */}
                  {listing.status?.toLowerCase() === 'sold' && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 10, 
                      left: 10, 
                      background: BADGE_COLORS.sold,
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      Sold
                    </div>
                  )}
                  {listing.status?.toLowerCase() === 'pending' && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 10, 
                      left: 10, 
                      background: BADGE_COLORS.pending,
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      Pending
                    </div>
                  )}
                  {/* Featured badge (top center) */}
                  {listing.featured && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 10, 
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: BADGE_COLORS.featured,
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      Featured
                    </div>
                  )}
                  {/* Listing type (top right) */}
                  <div style={{ 
                    position: 'absolute', 
                    top: 10, 
                    right: 10, 
                    background: TYPE_COLORS[listing.listing_type] || '#10b981',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700
                  }}>
                    {listing.listing_type}
                  </div>
                  {/* Just Listed badge (below type) */}
                  {listing.just_listed && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 38, 
                      right: 10, 
                      background: BADGE_COLORS.just_listed,
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700
                    }}>
                      Just Listed
                    </div>
                  )}
                  {/* Pet Friendly badge (bottom left) - for rentals/vacation */}
                  {listing.pet_friendly && (listing.listing_type === 'Rental' || listing.listing_type === 'Vacation') && (
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 10, 
                      left: 10, 
                      background: BADGE_COLORS.pet_friendly,
                      padding: '4px 10px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 600
                    }}>
                      🐾 Pet Friendly
                    </div>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981', marginBottom: 4 }}>{formatPrice(listing.price, listing.listing_type)}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{listing.address}</div>
                  <div style={{ fontSize: 13, opacity: 0.7 }}>{listing.city}, {listing.state} {listing.zip}</div>
                  <div style={{ fontSize: 12, opacity: 0.5, marginTop: 8, display: 'flex', gap: 12 }}>
                    <span>{listing.bedrooms} 🛏️</span>
                    <span>{listing.bathrooms} 🚿</span>
                    <span>{listing.sqft?.toLocaleString()} sqft</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listing Detail Modal */}
      {selectedListing && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            background: 'rgba(0,0,0,0.9)', 
            display: 'flex', 
            alignItems: 'flex-start', 
            justifyContent: 'center',
            zIndex: 10000,
            padding: 20,
            overflowY: 'auto'
          }}
          onClick={() => setSelectedListing(null)}
        >
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #0a2540, #1a3a5c)', 
              borderRadius: 20, 
              maxWidth: 800, 
              width: '100%',
              margin: '20px 0',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo Gallery */}
            <div style={{ position: 'relative' }}>
              {/* Main Image */}
              <div style={{ height: 350, position: 'relative', background: '#1a1a2e' }}>
                <img 
                  src={getAllPhotos(selectedListing)[currentPhotoIndex]} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px 20px 0 0' }}
                  alt={`${selectedListing.address} - photo ${currentPhotoIndex + 1}`}
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGES[0]; }}
                />
                
                {/* Photo Navigation */}
                {getAllPhotos(selectedListing).length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                      style={{ 
                        position: 'absolute', 
                        left: 12, 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.6)', 
                        border: 'none', 
                        color: 'white', 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >‹</button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                      style={{ 
                        position: 'absolute', 
                        right: 12, 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.6)', 
                        border: 'none', 
                        color: 'white', 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >›</button>
                  </>
                )}

                {/* Photo Counter */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: 12, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.7)', 
                  padding: '6px 16px', 
                  borderRadius: 20, 
                  fontSize: 13, 
                  fontWeight: 600 
                }}>
                  {currentPhotoIndex + 1} / {getAllPhotos(selectedListing).length}
                </div>

                {/* Close Button */}
                <button 
                  onClick={() => setSelectedListing(null)}
                  style={{ 
                    position: 'absolute', 
                    top: 12, 
                    right: 12, 
                    background: 'rgba(0,0,0,0.6)', 
                    border: 'none', 
                    color: 'white', 
                    width: 36, 
                    height: 36, 
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: 20,
                    fontWeight: 700
                  }}
                >×</button>

                {/* Status Badges - SOLD or PENDING */}
                {selectedListing.status?.toLowerCase() === 'sold' && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 12, 
                    left: 12, 
                    background: BADGE_COLORS.sold,
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    Sold
                  </div>
                )}
                {selectedListing.status?.toLowerCase() === 'pending' && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 12, 
                    left: 12, 
                    background: BADGE_COLORS.pending,
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    Pending
                  </div>
                )}
                {/* Featured Badge */}
                {selectedListing.featured && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 12, 
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: BADGE_COLORS.featured,
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    Featured
                  </div>
                )}
                {/* Just Listed Badge */}
                {selectedListing.just_listed && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 44, 
                    left: 12, 
                    background: BADGE_COLORS.just_listed,
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 700
                  }}>
                    Just Listed
                  </div>
                )}
                {/* Listing Type Badge */}
                <div style={{ 
                  position: 'absolute', 
                  bottom: 12, 
                  left: 12, 
                  background: TYPE_COLORS[selectedListing.listing_type] || '#10b981',
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700
                }}>
                  {selectedListing.listing_type}
                </div>
                {/* Pet Friendly Badge */}
                {selectedListing.pet_friendly && (selectedListing.listing_type === 'Rental' || selectedListing.listing_type === 'Vacation') && (
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 12, 
                    right: 12, 
                    background: BADGE_COLORS.pet_friendly,
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600
                  }}>
                    🐾 Pet Friendly
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {getAllPhotos(selectedListing).length > 1 && (
                <div style={{ display: 'flex', gap: 8, padding: '12px 12px 0', overflowX: 'auto', background: 'rgba(0,0,0,0.2)' }}>
                  {getAllPhotos(selectedListing).map((photo, index) => (
                    <button
                      key={index}
                      onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(index); }}
                      style={{
                        width: 60,
                        height: 45,
                        borderRadius: 8,
                        overflow: 'hidden',
                        border: currentPhotoIndex === index ? '2px solid #10b981' : '2px solid transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                        padding: 0,
                        background: 'none'
                      }}
                    >
                      <img 
                        src={photo} 
                        alt={`Thumbnail ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGES[0]; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div style={{ padding: 24 }}>
              {/* Video if exists */}
              {selectedListing.video_path && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 700 }}>🎬 Video Tour</h3>
                  <video 
                    src={selectedListing.video_path} 
                    controls 
                    style={{ width: '100%', borderRadius: 12 }}
                  />
                </div>
              )}

              {/* Price & Address */}
              <div style={{ fontSize: 32, fontWeight: 800, color: '#10b981', marginBottom: 4 }}>
                {formatPrice(selectedListing.price, selectedListing.listing_type)}
              </div>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{selectedListing.address}</div>
              <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 20 }}>{selectedListing.city}, {selectedListing.state} {selectedListing.zip}</div>

              {/* Key Facts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24, textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{selectedListing.bedrooms}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>Beds</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{selectedListing.bathrooms}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>Baths</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{selectedListing.sqft?.toLocaleString()}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>Sq Ft</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>{selectedListing.year_built || 'N/A'}</div>
                  <div style={{ fontSize: 12, opacity: 0.6 }}>Year Built</div>
                </div>
              </div>

              {/* Facts & Features */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>Facts and features</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ opacity: 0.6 }}>Lot Size</span>
                    <span style={{ fontWeight: 600 }}>{selectedListing.lot_size || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ opacity: 0.6 }}>Parking</span>
                    <span style={{ fontWeight: 600 }}>{selectedListing.parking || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ opacity: 0.6 }}>Heating</span>
                    <span style={{ fontWeight: 600 }}>{selectedListing.heating || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ opacity: 0.6 }}>Cooling</span>
                    <span style={{ fontWeight: 600 }}>{selectedListing.cooling || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ opacity: 0.6 }}>Flooring</span>
                    <span style={{ fontWeight: 600 }}>{selectedListing.flooring || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ opacity: 0.6 }}>Type</span>
                    <span style={{ fontWeight: 600 }}>{selectedListing.listing_type}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              {selectedListing.features && selectedListing.features.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>Features</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selectedListing.features.map((feature, i) => (
                      <span key={i} style={{ background: 'rgba(14,165,233,0.2)', color: '#0ea5e9', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>✓ {feature}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Neighborhood */}
              {selectedListing.neighborhood && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>Neighborhood</h3>
                  <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.6 }}>{selectedListing.neighborhood}</p>
                </div>
              )}

              {/* Description */}
              {selectedListing.description && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>Description</h3>
                  <p style={{ margin: 0, opacity: 0.8, lineHeight: 1.6 }}>{selectedListing.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <a 
                  href="#/BuyerDashboard" 
                  style={{ 
                    flex: 1, 
                    padding: '16px 24px', 
                    background: 'linear-gradient(135deg, #0ea5e9, #10b981)', 
                    borderRadius: 12, 
                    color: 'white', 
                    textDecoration: 'none', 
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 16
                  }}
                >
                  Make an Offer
                </a>
                <button 
                  onClick={() => setSelectedListing(null)}
                  style={{ 
                    padding: '16px 24px', 
                    background: 'rgba(255,255,255,0.1)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 12, 
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 16
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div style={{ background: 'rgba(0,0,0,0.25)', padding: '56px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 8px' }}>How Cribtopia Works</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', margin: '0 0 36px' }}>No agents. No commissions. Just technology.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
          {howItWorks.map((step, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 34, marginBottom: 12 }}>{step.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{step.title}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '28px 20px', textAlign: 'center' }}>
        <img src={LOGO} style={{ height: 28, opacity: 0.7, marginBottom: 10 }} alt="Cribtopia" />
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginBottom: 10 }}>© 2026 Cribtopia LLC • Lehigh Acres, FL • EIN 41-4797505</div>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
          {footerLinks.map((link, i) => (
            <a key={i} href={`#${link.path}`} style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none' }}>{link.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}