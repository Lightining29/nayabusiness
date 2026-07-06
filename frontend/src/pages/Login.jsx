import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, ShieldCheck, Mail, Lock, Phone, MapPin, User, X } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { canUseDemoGoogleLogin, createMockGoogleCredential, renderGoogleSignInButton } from '../utils/googleAuth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Google OAuth states
  const [showGoogleRegisterModal, setShowGoogleRegisterModal] = useState(false);
  const [googleRegisterData, setGoogleRegisterData] = useState({
    credential: '',
    email: '',
    name: '',
    password: '',
    phone: '',
    city: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await apiRequest('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      localStorage.setItem('token', data.token);
      window.dispatchEvent(new Event('auth-change'));
      setSuccess('Login successful!');
      setTimeout(() => navigate('/profile'), 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCallback = async (response) => {
    const credential = response.credential;
    await processGoogleLogin(credential);
  };

  const processGoogleLogin = async (credential) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await apiRequest('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });

      if (data.registerRequired) {
        setGoogleRegisterData({
          credential,
          email: data.email,
          name: data.name,
          password: '',
          phone: '',
          city: ''
        });
        setShowGoogleRegisterModal(true);
      } else {
        localStorage.setItem('token', data.token);
        window.dispatchEvent(new Event('auth-change'));
        setSuccess('Logged in with Google successfully!');
        setTimeout(() => navigate('/profile'), 500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { credential, password, phone, city } = googleRegisterData;
    if (!password) {
      setError('Password is required for registration.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await apiRequest('/api/auth/google/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, password, phone, city })
      });

      setShowGoogleRegisterModal(false);
      localStorage.setItem('token', data.token);
      window.dispatchEvent(new Event('auth-change'));
      setSuccess('Google account registered and logged in successfully!');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleLogin = () => {
    const testEmail = prompt("Enter a test email for Mock Google Login:", "test-user@gmail.com");
    if (!testEmail) return;
    const testName = prompt("Enter a test name for Mock Google Login:", "Test User");
    if (!testName) return;

    processGoogleLogin(createMockGoogleCredential(testEmail, testName));
  };

  useEffect(() => {
    let cancelled = false;

    renderGoogleSignInButton({
      elementId: 'google-signin-btn',
      onCredential: (credential) => {
        if (!cancelled) processGoogleLogin(credential);
      },
      onError: (message) => {
        if (!cancelled) setError(message);
      }
    });

    return () => {
      cancelled = true;
      const target = document.getElementById('google-signin-btn');
      if (target) target.innerHTML = '';
    };
  }, []);

  return (
    <div className="container-width animate-fade-in" style={{ paddingTop: '5rem', maxWidth: '500px' }}>
      <div className="text-center" style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">User Login</h1>
        <p className="section-subtitle">Enter your credentials or use Google to sign in.</p>
      </div>

      {success && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--accent)', background: 'rgba(16, 185, 129, 0.1)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-card glass" style={{ background: 'white', padding: '2.5rem' }}>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label style={{ color: '#000000', fontWeight: 600 }}>Email Address</label>
            <input type="email" className="form-input" placeholder="Enter your email" required value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
          </div>
          <div className="form-group">
            <label style={{ color: '#000000', fontWeight: 600 }}>Password</label>
            <input type="password" className="form-input" placeholder="Enter your password" required value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
        </div>

        {/* Google Sign-In button rendered by GSI SDK */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          minHeight: '44px',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div id="google-signin-btn" style={{ width: '100%', maxWidth: '400px' }}></div>
        </div>

        {canUseDemoGoogleLogin && (
          <button
            type="button"
            onClick={handleMockGoogleLogin}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              marginTop: '0.75rem',
              padding: '11px 16px',
              borderRadius: '12px',
              border: '1.5px dashed #cbd5e1',
              background: '#f8fafc',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#475569',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Demo Google Login (Dev only)
          </button>
        )}
      </div>

      {/* Google Registration Modal for First-time Sign-in */}
      {showGoogleRegisterModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          animation: 'fade-in 0.25s ease'
        }}>
          <div className="form-card glass animate-slide-up" style={{
            background: 'white',
            maxWidth: '460px',
            width: '100%',
            padding: '2.5rem',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowGoogleRegisterModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#9ca3af'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck size={28} style={{ color: 'var(--secondary)' }} />
              <h2 style={{ color: '#000000', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Complete Your Profile</h2>
            </div>
            
            <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              Welcome <strong>{googleRegisterData.name}</strong>! Since this is your first time signing in with Google, please set a password and phone number to secure your account.
            </p>

            <form onSubmit={handleGoogleRegisterSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Mail size={14} /> Email (Google verified)
                </label>
                <input type="text" className="form-input" value={googleRegisterData.email} disabled style={{ background: '#f3f4f6' }} />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Lock size={14} /> Create Password
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter a secure password"
                  required
                  value={googleRegisterData.password}
                  onChange={e => setGoogleRegisterData({ ...googleRegisterData, password: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Phone size={14} /> Phone Number
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter mobile number"
                  required
                  value={googleRegisterData.phone}
                  onChange={e => setGoogleRegisterData({ ...googleRegisterData, phone: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} /> City
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your city"
                  required
                  value={googleRegisterData.city}
                  onChange={e => setGoogleRegisterData({ ...googleRegisterData, city: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
                {loading ? 'Saving Profile...' : 'Complete & Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
