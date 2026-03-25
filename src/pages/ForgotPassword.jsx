import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LOGO = "https://media.base44.com/images/public/69b1a2ff64aa2c797de555bf/b3c405919_IMG_6232.png";
const API_URL = 'http://100.104.178.26:3000';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSubmitted(true);
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
          <h1 style={{ margin: '20px 0 10px', color: '#fff' }}>Reset Your Password</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            {submitted 
              ? 'Check your email for a reset link'
              : 'Enter your email and we\'ll send you a reset link'}
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

        {submitted ? (
          <div style={{ 
            padding: '20px', 
            borderRadius: 12, 
            background: 'rgba(16,185,129,0.2)', 
            border: '1px solid #10b981',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
            <p style={{ color: '#10b981', fontWeight: 600, marginBottom: 8 }}>
              Email sent!
            </p>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
              If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
              The link expires in 1 hour.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#fff', fontWeight: 600 }}>
                Email Address
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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ 
          marginTop: 24, 
          paddingTop: 24, 
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}