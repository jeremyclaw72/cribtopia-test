import React, { useState, useMemo } from 'react';

const LOGO = "https://media.base44.com/images/public/69b1a2ff64aa2c797de555bf/b3c405919_IMG_6232.png";
const API_URL = 'http://100.104.178.26:3000';

const LISTING_TYPES = ['FSBO', 'Rent-to-Own', 'Rental', 'Vacation'];
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];

const FEATURE_OPTIONS = ['Smart home', 'Security system', 'Sprinkler system', 'Pool', 'Outdoor kitchen', 'Solar panels', 'EV charger', 'Outdoor living space', 'Updated kitchen', 'New roof', 'Central A/C', 'Garage', 'Basement', 'Fireplace', 'Hardwood floors', 'Walk-in closets', 'Home office', 'Gym', 'Wine cellar'];

export default function SellerDashboard() {
  const [view, setView] = useState('listings');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    address: '',
    city: '',
    state: 'CO',
    zip: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    description: '',
    listing_type: 'FSBO',
    year_built: '',
    lot_size: '',
    parking: '',
    heating: '',
    cooling: '',
    flooring: '',
    features: [],
    neighborhood: '',
    photos: [],
    video_path: '',
    seller_name: '',
    seller_email: '',
    seller_phone: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Build map URL from address
  const mapUrl = useMemo(() => {
    const parts = [form.address, form.city, form.state, form.zip].filter(Boolean);
    if (parts.length >= 2) {
      const address = encodeURIComponent(parts.join(', '));
      return `https://maps.google.com/maps?q=${address}&z=17&output=embed`;
    }
    return null;
  }, [form.address, form.city, form.state, form.zip]);

  // Fetch listings from API
  React.useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/listings`);
      const data = await res.json();
      setListings(data || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setListings([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch(`${API_URL}/api/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price) || 0,
          bedrooms: parseFloat(form.bedrooms) || null,
          bathrooms: parseFloat(form.bathrooms) || null,
          sqft: parseInt(form.sqft) || null,
          year_built: parseInt(form.year_built) || null,
          features: form.features.length > 0 ? form.features : null,
          photos: form.photos.length > 0 ? form.photos : null,
          video_path: form.video_path || null
        })
      });
      
      if (res.ok) {
        setMessage('✅ Listing created successfully!');
        setShowForm(false);
        setForm({
          address: '',
          city: '',
          state: 'CO',
          zip: '',
          price: '',
          bedrooms: '',
          bathrooms: '',
          sqft: '',
          description: '',
          listing_type: 'FSBO',
          year_built: '',
          lot_size: '',
          parking: '',
          heating: '',
          cooling: '',
          flooring: '',
          features: [],
          neighborhood: '',
          photos: [],
          video_path: '',
          seller_name: '',
          seller_email: '',
          seller_phone: ''
        });
        fetchListings();
      } else {
        setMessage('❌ Failed to create listing. Please try again.');
      }
    } catch (err) {
      console.error('Error creating listing:', err);
      setMessage('❌ Error connecting to server.');
    }
    
    setSaving(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFeatureToggle = (feature) => {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  // Handle photo uploads
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Limit to 20 photos total
    const currentCount = form.photos.length;
    const availableSlots = 20 - currentCount;
    const filesToUpload = files.slice(0, availableSlots);
    
    if (filesToUpload.length === 0) {
      setMessage('❌ Maximum 20 photos allowed');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      filesToUpload.forEach(file => {
        formData.append('files', file);
      });

      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      
      if (res.ok) {
        const newPhotoUrls = data.photos.map(p => `${API_URL}${p}`);
        setForm(prev => ({
          ...prev,
          photos: [...prev.photos, ...newPhotoUrls]
        }));
        setMessage(`✅ ${filesToUpload.length} photo(s) uploaded`);
      } else {
        setMessage('❌ Failed to upload photos');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setMessage('❌ Error uploading photos');
    }

    setUploading(false);
    e.target.value = ''; // Reset input
  };

  // Handle video upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check video duration (we'll validate on server too)
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = async () => {
      const duration = video.duration;
      if (duration > 60) {
        setMessage('❌ Video must be 60 seconds or less');
        e.target.value = '';
        return;
      }

      setUploading(true);
      setMessage('');

      try {
        const formData = new FormData();
        formData.append('video', file);

        const res = await fetch(`${API_URL}/api/upload/video`, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        
        if (res.ok) {
          setForm(prev => ({
            ...prev,
            video_path: `${API_URL}${data.video}`
          }));
          setMessage('✅ Video uploaded successfully');
        } else {
          setMessage('❌ Failed to upload video');
        }
      } catch (err) {
        console.error('Upload error:', err);
        setMessage('❌ Error uploading video');
      }

      setUploading(false);
    };
    video.src = URL.createObjectURL(file);
    e.target.value = '';
  };

  // Remove photo
  const removePhoto = (index) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  // Remove video
  const removeVideo = () => {
    setForm(prev => ({
      ...prev,
      video_path: ''
    }));
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
        <h1 style={{ margin: '0 0 30px' }}>📋 Seller Dashboard</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 30 }}>
          {['listings', 'offers', 'settings'].map(tab => (
            <button key={tab} onClick={() => { setView(tab); setShowForm(false); }} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: view === tab ? '#10b981' : 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>{tab}</button>
          ))}
        </div>

        {message && (
          <div style={{ padding: '12px 16px', marginBottom: 20, borderRadius: 8, background: message.startsWith('✅') ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', border: `1px solid ${message.startsWith('✅') ? '#10b981' : '#ef4444'}` }}>
            {message}
          </div>
        )}

        {view === 'listings' && (
          <div>
            {!showForm ? (
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0 }}>Your Listings</h2>
                  <button onClick={() => setShowForm(true)} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #0ea5e9, #10b981)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>+ Create New Listing</button>
                </div>

                {loading ? (
                  <p style={{ opacity: 0.7 }}>Loading...</p>
                ) : listings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <p style={{ opacity: 0.7, marginBottom: 20 }}>You don't have any active listings yet.</p>
                    <button onClick={() => setShowForm(true)} style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #0ea5e9, #10b981)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>+ Create Your First Listing</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {listings.map(listing => (
                      <div key={listing.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 18 }}>{listing.address}</div>
                          <div style={{ opacity: 0.7, fontSize: 14 }}>{listing.city}, {listing.state} {listing.zip}</div>
                          <div style={{ marginTop: 8 }}>
                            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: listing.listing_type === 'FSBO' ? '#10b981' : listing.listing_type === 'Rental' ? '#f59e0b' : '#0ea5e9' }}>{listing.listing_type}</span>
                            {listing.status === 'Active' && <span style={{ marginLeft: 8, display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 12, background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>Active</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{formatPrice(listing.price, listing.listing_type)}</div>
                          <div style={{ opacity: 0.7, fontSize: 14 }}>{listing.bedrooms} bed • {listing.bathrooms} bath • {listing.sqft?.toLocaleString()} sqft</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.1)', maxHeight: '85vh', overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 style={{ margin: 0, fontSize: 20 }}>Create New Listing</h2>
                  <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                  {/* Map - Shows first on mobile */}
                  <div style={{ display: 'block' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', height: '200px' }}>
                      {mapUrl ? (
                        <iframe
                          src={mapUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Property Location"
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)' }}>
                          <div style={{ fontSize: 48, marginBottom: 8 }}>🗺️</div>
                          <div style={{ fontSize: 14, textAlign: 'center', padding: '0 20px' }}>Enter an address to see the location</div>
                        </div>
                      )}
                    </div>
                    {mapUrl && (
                      <div style={{ marginTop: 8, padding: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 12, opacity: 0.7 }}>
                        📍 {[form.address, form.city, form.state, form.zip].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Form */}
                  <div style={{ maxHeight: 'none', overflow: 'visible' }}>
                    <form onSubmit={handleSubmit}>
                      {/* Basic Info */}
                      <h3 style={{ margin: '0 0 12px 0', fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>📍 Property Location</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 20 }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Street Address *</label>
                          <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main Street" required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>City *</label>
                            <input name="city" value={form.city} onChange={handleChange} placeholder="Denver" required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>State *</label>
                            <select name="state" value={form.state} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }}>
                              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>ZIP Code</label>
                            <input name="zip" value={form.zip} onChange={handleChange} placeholder="80202" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Listing Type *</label>
                            <select name="listing_type" value={form.listing_type} onChange={handleChange} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }}>
                              {LISTING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>

                  {/* Pricing & Size */}
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>💰 Price & Size</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Price *</label>
                      <input name="price" value={form.price} onChange={handleChange} placeholder="450000" required type="number" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Bedrooms</label>
                      <input name="bedrooms" value={form.bedrooms} onChange={handleChange} placeholder="3" type="number" step="0.5" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Bathrooms</label>
                      <input name="bathrooms" value={form.bathrooms} onChange={handleChange} placeholder="2" type="number" step="0.5" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Sq Ft</label>
                      <input name="sqft" value={form.sqft} onChange={handleChange} placeholder="1800" type="number" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                    </div>
                  </div>

                  {/* Facts & Features */}
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>🏠 Facts & Features</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Year Built</label>
                      <input name="year_built" value={form.year_built} onChange={handleChange} placeholder="2020" type="number" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Lot Size</label>
                      <input name="lot_size" value={form.lot_size} onChange={handleChange} placeholder="0.25 acres" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Parking</label>
                      <input name="parking" value={form.parking} onChange={handleChange} placeholder="2-car garage" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Heating</label>
                      <input name="heating" value={form.heating} onChange={handleChange} placeholder="Central gas" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Cooling</label>
                      <input name="cooling" value={form.cooling} onChange={handleChange} placeholder="Central A/C" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Flooring</label>
                      <input name="flooring" value={form.flooring} onChange={handleChange} placeholder="Hardwood, carpet" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                    </div>
                  </div>

                  {/* Features */}
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>✨ Property Features</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                    {FEATURE_OPTIONS.map(feature => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => handleFeatureToggle(feature)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 20,
                          border: '1px solid',
                          borderColor: form.features.includes(feature) ? '#10b981' : 'rgba(255,255,255,0.2)',
                          background: form.features.includes(feature) ? 'rgba(16,185,129,0.2)' : 'transparent',
                          color: form.features.includes(feature) ? '#10b981' : '#fff',
                          cursor: 'pointer',
                          fontSize: 13,
                          transition: 'all 0.2s'
                        }}
                      >
                        {form.features.includes(feature) ? '✓ ' : ''}{feature}
                      </button>
                    ))}
                  </div>

                  {/* Photo Upload */}
                  <h3 style={{ margin: '0 0 16px 0', fontSize: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>📷 Photos (up to 20)</h3>
                  <div style={{ marginBottom: 24 }}>
                    <input
                      type="file"
                      id="photo-upload"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      disabled={uploading || form.photos.length >= 20}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="photo-upload"
                      style={{
                        display: 'block',
                        padding: '20px',
                        border: '2px dashed rgba(255,255,255,0.3)',
                        borderRadius: 12,
                        textAlign: 'center',
                        cursor: form.photos.length >= 20 ? 'not-allowed' : 'pointer',
                        opacity: form.photos.length >= 20 ? 0.5 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 6 }}>📤</div>
                      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Click to upload photos</div>
                      <div style={{ fontSize: 12, opacity: 0.6 }}>{form.photos.length}/20 photos uploaded</div>
                    </label>
                    
                    {/* Photo Preview Grid */}
                    {form.photos.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
                        {form.photos.map((photo, index) => (
                          <div key={index} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
                            <img 
                              src={photo} 
                              alt={`Photo ${index + 1}`} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              style={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                border: 'none',
                                background: 'rgba(239,68,68,0.9)',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 700
                              }}
                            >×</button>
                            {index === 0 && (
                              <div style={{
                                position: 'absolute',
                                bottom: 4,
                                left: 4,
                                padding: '2px 8px',
                                background: '#10b981',
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 600
                              }}>Cover</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>🎬 Video Tour (max 60 sec)</h3>
                  <div style={{ marginBottom: 20 }}>
                    <input
                      type="file"
                      id="video-upload"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={uploading || form.video_path}
                      style={{ display: 'none' }}
                    />
                    {form.video_path ? (
                      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
                        <video 
                          src={form.video_path} 
                          controls 
                          style={{ width: '100%', borderRadius: 12 }}
                        />
                        <button
                          type="button"
                          onClick={removeVideo}
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: 'none',
                            background: 'rgba(239,68,68,0.9)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >Remove Video</button>
                      </div>
                    ) : (
                      <label
                        htmlFor="video-upload"
                        style={{
                          display: 'block',
                          padding: '20px',
                          border: '2px dashed rgba(255,255,255,0.3)',
                          borderRadius: 12,
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ fontSize: 28, marginBottom: 6 }}>🎥</div>
                        <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Upload video tour</div>
                        <div style={{ fontSize: 12, opacity: 0.6 }}>Max 60 seconds • MP4, WebM, MOV</div>
                      </label>
                    )}
                  </div>

                  {/* Neighborhood */}
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>🏘️ Neighborhood</h3>
                  <div style={{ marginBottom: 20 }}>
                    <textarea name="neighborhood" value={form.neighborhood} onChange={handleChange} placeholder="Describe the neighborhood, nearby amenities, schools, parks..." rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, resize: 'vertical' }} />
                  </div>

                  {/* Description */}
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>📝 Description</h3>
                  <div style={{ marginBottom: 20 }}>
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your property in detail..." rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16, resize: 'vertical' }} />
                  </div>

                  {/* Contact Info */}
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>👤 Your Contact Info</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Your Name *</label>
                      <input name="seller_name" value={form.seller_name} onChange={handleChange} placeholder="John Smith" required style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Your Email *</label>
                        <input name="seller_email" value={form.seller_email} onChange={handleChange} placeholder="john@example.com" required type="email" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>Phone</label>
                        <input name="seller_phone" value={form.seller_phone} onChange={handleChange} placeholder="(555) 123-4567" type="tel" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 16 }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                    <button type="submit" disabled={saving} style={{ flex: 1, padding: '14px 28px', background: 'linear-gradient(135deg, #0ea5e9, #10b981)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', fontSize: 16, opacity: saving ? 0.7 : 1 }}>
                      {saving ? 'Creating...' : 'Create Listing'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>Cancel</button>
                  </div>
                </form>
                  </div>
                  
                  {/* Map Column */}
                  <div style={{ position: 'sticky', top: 0 }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', height: '400px' }}>
                      {mapUrl ? (
                        <iframe
                          src={mapUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Property Location"
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)' }}>
                          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
                          <div style={{ fontSize: 14, textAlign: 'center', padding: '0 20px' }}>Enter an address to see the location on the map</div>
                        </div>
                      )}
                    </div>
                    {mapUrl && (
                      <div style={{ marginTop: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 8, fontSize: 13, opacity: 0.7 }}>
                        📍 {[form.address, form.city, form.state, form.zip].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'offers' && (
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ margin: '0 0 20px' }}>Incoming Offers</h2>
            <p style={{ opacity: 0.7 }}>No offers yet. Create listings to receive offers from buyers.</p>
          </div>
        )}

        {view === 'settings' && (
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
            <h2 style={{ margin: '0 0 20px' }}>Account Settings</h2>
            <p style={{ opacity: 0.7 }}>Manage your seller profile and notification preferences.</p>
            <div style={{ marginTop: 20 }}>
              <p style={{ opacity: 0.6, fontSize: 14 }}>Coming soon: Profile management, notification settings, and payment methods.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}