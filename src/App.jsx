import React from 'react'
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'

console.log('[App] Starting Cribtopia...')

const LOGO = "https://media.base44.com/images/public/69b1a2ff64aa2c797de555bf/b3c405919_IMG_6232.png";
const API_URL = 'http://100.104.178.26:3000';

// Auth Context
const AuthContext = React.createContext(null);

export function useAuth() {
  return React.useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = React.useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName, phone, role) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, phone, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Chat Widget - visible on all pages with online status
function CribtopiaChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const [messages, setMessages] = React.useState([
    { role: 'assistant', text: 'Hi! I\'m Crib, your Cribtopia assistant. How can I help you today?' }
  ]);
  const [isTyping, setIsTyping] = React.useState(false);

  const handleSend = () => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setMsg('');
    setIsTyping(true);
    
    // Simulate response
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        'Thanks for your message! For detailed assistance, please use the contact form or call us at (239) 555-CRIB.',
        'I\'d be happy to help! You can also check our FAQ section for common questions.',
        'Great question! One of our team members will get back to you shortly.',
        'Thanks for reaching out! Is there anything specific about buying, selling, or renting I can help with?'
      ];
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: responses[Math.floor(Math.random() * responses.length)]
      }]);
    }, 1500);
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      {open && (
        <div style={{ 
          width: 380, 
          height: 500, 
          background: 'linear-gradient(135deg, #0a2540, #1a3a5c)', 
          borderRadius: 16, 
          marginBottom: 10, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)', 
          display: 'flex', 
          flexDirection: 'column',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Header */}
          <div style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid rgba(255,255,255,0.1)', 
            display: 'flex', 
            alignItems: 'center',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '16px 16px 0 0'
          }}>
            <img src={LOGO} style={{ height: 32, borderRadius: 8, marginRight: 12 }} alt="Cribtopia" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                Crib
                <span style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  fontSize: 10,
                  fontWeight: 600,
                  color: '#10b981'
                }}>
                  <span style={{ 
                    width: 6, 
                    height: 6, 
                    borderRadius: '50%', 
                    background: '#10b981',
                    boxShadow: '0 0 6px #10b981'
                  }}></span>
                  Online
                </span>
              </div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>AI Assistant</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: 'white', 
              fontSize: 16, 
              cursor: 'pointer', 
              width: 32, 
              height: 32, 
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>×</button>
          </div>
          
          {/* Messages */}
          <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ 
                marginBottom: 12, 
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{ 
                  maxWidth: '85%',
                  padding: '12px 16px', 
                  borderRadius: 12, 
                  background: m.role === 'user' 
                    ? 'linear-gradient(135deg, #0ea5e9, #10b981)' 
                    : 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: 14,
                  lineHeight: 1.5,
                  boxShadow: m.role === 'user' ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
                <div style={{ 
                  padding: '12px 16px', 
                  borderRadius: 12, 
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span style={{ animation: 'blink 1s infinite', opacity: 0.5 }}>●</span>
                  <span style={{ animation: 'blink 1s infinite 0.2s', opacity: 0.5 }}>●</span>
                  <span style={{ animation: 'blink 1s infinite 0.4s', opacity: 0.5 }}>●</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 8 }}>
            <input 
              value={msg} 
              onChange={e => setMsg(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..." 
              style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 14 }} 
            />
            <button 
              onClick={handleSend} 
              disabled={!msg.trim()}
              style={{ 
                padding: '12px 20px', 
                borderRadius: 10, 
                background: msg.trim() 
                  ? 'linear-gradient(135deg, #0ea5e9, #10b981)' 
                  : 'rgba(255,255,255,0.1)', 
                border: 'none', 
                color: 'white', 
                fontWeight: 600, 
                cursor: msg.trim() ? 'pointer' : 'not-allowed',
                opacity: msg.trim() ? 1 : 0.5
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
      
      {/* Floating Button */}
      <button 
        onClick={() => setOpen(!open)} 
        style={{ 
          width: 64, 
          height: 64, 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #0ea5e9, #10b981)', 
          border: 'none', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
      >
        <span style={{ fontSize: 28 }}>💬</span>
        {/* Online indicator on button */}
        <span style={{ 
          position: 'absolute',
          top: 4,
          right: 4,
          width: 12, 
          height: 12, 
          borderRadius: '50%', 
          background: '#10b981',
          border: '2px solid #0a2540',
          boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
        }}></span>
      </button>
    </div>
  );
}

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, stack: null }
  }

  static getDerivedStateFromError(error) {
    console.error('[ErrorBoundary] Error:', error)
    return { hasError: true, error: error.message, stack: error.stack }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#1a1a2e', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
          <h1>⚠️ Something went wrong</h1>
          <p style={{ color: '#f87171' }}>{this.state.error}</p>
          {this.state.stack && (
            <pre style={{ color: '#fca5a5', fontSize: 11, whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' }}>
              {this.state.stack}
            </pre>
          )}
          <p><a href="#/" style={{ color: '#10b981' }}>Go to Home</a></p>
        </div>
      )
    }
    return this.props.children
  }
}

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'))
const Login = React.lazy(() => import('./pages/Login'))
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'))
const SellerDashboard = React.lazy(() => import('./pages/SellerDashboard'))
const BuyerDashboard = React.lazy(() => import('./pages/BuyerDashboard'))
const ContractDrafter = React.lazy(() => import('./pages/ContractDrafter'))
const FAQAssistant = React.lazy(() => import('./pages/FAQAssistant'))

// Loading fallback
function Loading() {
  return (
    <div style={{ padding: 40, textAlign: 'center', background: '#0a2540', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
      <h2>Loading...</h2>
    </div>
  )
}

function App() {
  console.log('[App] Rendering App...')
  
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Router>
          <React.Suspense fallback={<Loading />}>
            <div style={{ minHeight: '100vh' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/SellerDashboard" element={<SellerDashboard />} />
                <Route path="/BuyerDashboard" element={<BuyerDashboard />} />
                <Route path="/ContractDrafter" element={<ContractDrafter />} />
                <Route path="/FAQAssistant" element={<FAQAssistant />} />
              </Routes>
            </div>
            <CribtopiaChatWidget />
          </React.Suspense>
        </Router>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App