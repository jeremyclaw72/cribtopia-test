import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LOGO = "https://media.base44.com/images/public/69b1a2ff64aa2c797de555bf/b3c405919_IMG_6232.png";
const API_URL = 'http://100.104.178.26:3000';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { email, password }
        : { email, password, full_name: fullName, phone, role };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (onLogin) {
        onLogin(data.user);
      }
      
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a2540, #1a3a5c)',
      padding: 20
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        padding: 40,
        width: '100%',
        maxWidth: 400,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <img src={LOGO} style={{ height: 60, borderRadius: 12 }} alt="Cribtopia" />
          <h1 style={{ margin: '20px 0 10px', color: '#fff' }}>Welcome to Cribtopia</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: '12px 16px', 
            marginBottom: 20, 
            borderRadius: 8, 
            background: 'rgba(239,68,68,0.2)', 
            border: '1px solid #ef4444',
            color: '#ef4444'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, color: '#fff', fontWeight: 600 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, color: '#fff', fontWeight: 600 }}>
                  I am a...
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: role === 'buyer' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.2)',
                      background: role === 'buyer' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    🏠 Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('seller')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: role === 'seller' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.2)',
                      background: role === 'seller' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    🏡 Seller
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 6, color: '#fff', fontWeight: 600 }}>
                  Phone (optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.1)',
                    color: '#fff',
                    fontSize: 16,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#fff', fontWeight: 600 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: 16,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, color: '#fff', fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: 16,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 10,
              border: 'none',
              background: loading ? '#6b7280' : 'linear-gradient(135deg, #0ea5e9, #10b981)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 16
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#10b981',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#10b981',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </form>

        <div style={{ 
          marginTop: 24, 
          paddingTop: 24, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}