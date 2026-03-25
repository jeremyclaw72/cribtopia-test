import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LOGO = "https://media.base44.com/images/public/69b1a2ff64aa2c797de555bf/b3c405919_IMG_6232.png";
const API_URL = 'http://100.104.178.26:3000';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setTokenError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
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
          border: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          <img src={LOGO} style={{ height: 60, borderRadius: 12, marginBottom: 20 }} alt="Cribtopia" />
          <div style={{ 
            padding: '20px', 
            borderRadius: 12, 
            background: 'rgba(239,68,68,0.2)', 
            border: '1px solid #ef4444'
          }}>
            <p style={{ color: '#ef4444', fontWeight: 600 }}>{tokenError}</p>
          </div>
          <button
            onClick={() => navigate('/forgot-password')}
            style={{
              marginTop: 24,
              padding: '14px 28px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

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
          <h1 style={{ margin: '20px 0 10px', color: '#fff' }}>Create New Password</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            {success 
              ? 'Your password has been reset'
              : 'Enter a new password for your account'}
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

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              padding: '20px', 
              borderRadius: 12, 
              background: 'rgba(16,185,129,0.2)', 
              border: '1px solid #10b981',
              marginBottom: 24
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <p style={{ color: '#10b981', fontWeight: 600 }}>
                Password reset successfully!
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '14px 28px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign In with New Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#fff', fontWeight: 600 }}>
                New Password
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

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, color: '#fff', fontWeight: 600 }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Resetting...' : 'Reset Password'}
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