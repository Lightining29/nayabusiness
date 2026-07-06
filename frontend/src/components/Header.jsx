import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Cpu, Menu, X, ChevronDown, LogIn, UserPlus, UserRound, ShieldCheck, Mail, Lock, Phone, MapPin } from 'lucide-react';
import { Moon, Sun } from "lucide-react";
import { getGoogleClientId } from '../utils/googleAuth';





export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [telecomOpen, setTelecomOpen] = useState(false);
  const [softwareOpen, setSoftwareOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [isAuth, setIsAuth] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginError, setLoginError] = useState('');

  // Header Google Login states
  const [showHeaderGoogleRegisterModal, setShowHeaderGoogleRegisterModal] = useState(false);
  const [headerGoogleRegisterData, setHeaderGoogleRegisterData] = useState({
    credential: '',
    email: '',
    name: '',
    password: '',
    phone: '',
    city: ''
  });

  const processHeaderGoogleLogin = async (credential) => {
    setLoginLoading(true);
    setLoginError('');
    setLoginSuccess('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google login failed');

      if (data.registerRequired) {
        setHeaderGoogleRegisterData({
          credential,
          email: data.email,
          name: data.name,
          password: '',
          phone: '',
          city: ''
        });
        setLoginModalOpen(false); // Close login modal to show registration modal
        setShowHeaderGoogleRegisterModal(true);
      } else {
        localStorage.setItem('token', data.token);
        window.dispatchEvent(new Event('auth-change'));
        setIsAuth(true);
        setLoginSuccess('Logged in with Google successfully!');
        setTimeout(() => {
          setLoginModalOpen(false);
          navigate('/profile');
        }, 500);
      }
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleHeaderGoogleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { credential, password, phone, city } = headerGoogleRegisterData;
    if (!password) {
      setLoginError('Password is required for registration.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');
    setLoginSuccess('');
    try {
      const res = await fetch('/api/auth/google/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, password, phone, city })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google registration failed');

      setShowHeaderGoogleRegisterModal(false);
      localStorage.setItem('token', data.token);
      window.dispatchEvent(new Event('auth-change'));
      setIsAuth(true);
      setLoginSuccess('Google account registered and logged in successfully!');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleHeaderMockGoogleLogin = () => {
    const testEmail = prompt("Enter a test email for Mock Google Login:", "test-header-user@gmail.com");
    if (!testEmail) return;
    const testName = prompt("Enter a test name for Mock Google Login:", "Header Test User");
    if (!testName) return;

    const payload = {
      iss: "https://accounts.google.com",
      email: testEmail,
      name: testName,
      sub: "mock-google-id-" + Date.now()
    };
    const header = { alg: "HS256", typ: "JWT" };
    
    const base64UrlEncode = (obj) => {
      const str = JSON.stringify(obj);
      return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };
    
    const credential = `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.signature`;
    processHeaderGoogleLogin(credential);
  };

  useEffect(() => {
    let cancelled = false;
    if (loginModalOpen && window.google) {
      const initGoogleHeader = async () => {
        try {
          const clientId = await getGoogleClientId();
          if (cancelled) return;
          if (!clientId) {
            console.warn('Google Client ID is not configured.');
            return;
          }
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (!cancelled) processHeaderGoogleLogin(response.credential);
            }
          });
          const btnEl = document.getElementById("google-header-signin-btn");
          if (btnEl) {
            window.google.accounts.id.renderButton(btnEl, {
              theme: "outline",
              size: "large",
              width: 280
            });
          }
        } catch (error) {
          console.error('Failed to initialize Google login in header:', error);
        }
      };
      setTimeout(initGoogleHeader, 200);
    }
    return () => {
      cancelled = true;
      const btnEl = document.getElementById("google-header-signin-btn");
      if (btnEl) btnEl.innerHTML = '';
    };
  }, [loginModalOpen]);

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resume: null,
    password: '',
    skills: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerError, setRegisterError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsAuth(!!localStorage.getItem('token'));
  }, [location.pathname]);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuth(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', syncAuthState);
    window.addEventListener('auth-change', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('auth-change', syncAuthState);
    };
  }, []);
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);
  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    setIsAuth(false);
    navigate('/');
  };


  const openLoginModal = () => {
    setLoginError('');
    setLoginSuccess('');
    setLoginModalOpen(true);
    setIsOpen(false);
  };

  const closeLoginModal = () => {
    if (loginLoading) return;
    setLoginModalOpen(false);
  };

  const updateLoginForm = (field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
  };


  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = loginForm;

    if (!email || !password) {
      setLoginError('Please fill in all fields.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');
    setLoginSuccess('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      localStorage.setItem('token', data.token);
      window.dispatchEvent(new Event('auth-change'));
      setIsAuth(true);
      setLoginSuccess('Login successful!');
      setLoginForm({ email: '', password: '' });
      setTimeout(() => {
        setLoginModalOpen(false);
        navigate('/profile');
      }, 500);
    } catch (err) {
      setLoginError(err.message || 'Server connection error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const openRegisterModal = () => {
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterModalOpen(true);
    setIsOpen(false);
  };

  const closeRegisterModal = () => {
    if (registerLoading) return;
    setRegisterModalOpen(false);
  };

  const updateRegisterForm = (field, value) => {
    setRegisterForm((current) => ({ ...current, [field]: value }));
  };

  const resetRegisterForm = () => {
    setRegisterForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      resume: null,
      password: '',
      skills: ''
    });
  };

  const validateRegisterForm = () => {
    const { firstName, lastName, email, phone, resume, password, skills } = registerForm;

    if (!firstName || !lastName || !email || !phone || !resume || !password || !skills) {
      return 'Please fill in all fields.';
    }
    return '';
  };

  const requestRegisterOtp = async () => {
    const { firstName, lastName, email, phone, resume, password, skills } = registerForm;
    const res = await fetch('/api/register/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        mobno: phone
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send email OTP.');
    }

    // Close the register modal
    setRegisterModalOpen(false);

    // Redirect to the OTP verification page with the registration details
    navigate('/verify-otp', {
      state: {
        first_name: firstName,
        last_name: lastName,
        email,
        mobno: phone,
        qualification: '',
        city: '',
        resume,
        password,
        skills: skills || '',
        job_title: 'General Application'
      }
    });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateRegisterForm();

    if (validationError) {
      setRegisterError(validationError);
      return;
    }

    setRegisterLoading(true);
    setRegisterError('');
    setRegisterSuccess('');

    try {
      await requestRegisterOtp();
    } catch (err) {
      setRegisterError(err.message || 'Server connection error. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const telecomServices = [
    { name: 'LOS Survey', path: '/telecom/los' },
    { name: 'RF Survey', path: '/telecom/rf' },
    { name: 'EMF Survey', path: '/telecom/emf' },
    { name: 'BTS Installation', path: '/telecom/bts' },
    { name: 'Router Installation', path: '/telecom/router' },
    { name: 'Network Testing', path: '/telecom/network' },
    { name: 'Microwave Link Installation', path: '/telecom/microwave' },
    { name: 'SCFT Testing', path: '/telecom/scft' },
    { name: 'Cluster Testing', path: '/telecom/cluster' },
    { name: 'UBR Installation', path: '/telecom/ubr' },
    { name: 'ODSE Installation', path: '/telecom/odse' }
  ];

  const softwareServices = [
    { name: 'Web Development', path: '/services/development' },
    { name: 'Web Design', path: '/services/design' },
    { name: 'Web Hosting', path: '/services/hosting' },
    { name: 'Logo Design', path: '/services/logo' },
    { name: 'SEO Optimization', path: '/services/seo' }
  ];

  return (
    <>
      <header className="glass-nav">
        <div className="header-container">
          <Link to="/" className="logo-container" onClick={() => setIsOpen(false)}>
            <Cpu className="logo-icon" />
            <span>RANCOM <span className="gradient-text-blue" style={{ fontSize: '0.8rem', fontWeight: 600, verticalAlign: 'middle', marginLeft: '0.2rem' }}>TECHNOLOGIES</span></span>
          </Link>

          {/* Mobile Menu Button */}
          <button className="menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Navigation Links */}
          <nav>
            <ul className={`nav-links ${isOpen ? 'mobile-open' : ''}`}>
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                  end
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  About Us
                </NavLink>
              </li>

              {/* Telecom Dropdown */}
              <li className="dropdown-container">
                <span
                  className="nav-link"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  onClick={() => setTelecomOpen(!telecomOpen)}
                >
                  Telecom Services <ChevronDown size={14} />
                </span>
                <div className={`dropdown-menu ${telecomOpen ? 'mobile-show' : ''}`}>
                  {telecomServices.map((service, index) => (
                    <Link
                      key={index}
                      to={service.path}
                      className="dropdown-item"
                      onClick={() => { setIsOpen(false); setTelecomOpen(false); }}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </li>

              {/* Software Dropdown */}
              <li className="dropdown-container">
                <span
                  className="nav-link"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  onClick={() => setSoftwareOpen(!softwareOpen)}
                >
                  Software Services <ChevronDown size={14} />
                </span>
                <div className={`dropdown-menu ${softwareOpen ? 'mobile-show' : ''}`}>
                  {softwareServices.map((service, index) => (
                    <Link
                      key={index}
                      to={service.path}
                      className="dropdown-item"
                      onClick={() => { setIsOpen(false); setSoftwareOpen(false); }}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </li>

              <li>
                <NavLink
                  to="/blog"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Blog
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/jobs"
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  Jobs
                </NavLink>
              </li>
              <li>
                <button
                  className="theme-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </li>
              {/* Auth Buttons */}
              <li className="nav-auth">
                {!isAuth ? (
                  <>
                    <button
                      type="button"
                      className="auth-btn login-btn"
                      style={{
                        background: 'linear-gradient(to right, #1E40AF, #1D4ED8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        marginRight: '0.5rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={openLoginModal}
                    >
                      <LogIn size={16} className="icon" style={{ marginRight: '0.5rem' }} /> Login
                    </button>
                    <button
                      type="button"
                      className="auth-btn register-btn"
                      style={{
                        background: 'linear-gradient(to right, #059669, #047857)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={openRegisterModal}
                    >
                      <UserPlus size={16} className="icon" style={{ marginRight: '0.5rem' }} /> Register
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/profile"
                      className="auth-btn profile-btn"
                      onClick={() => setIsOpen(false)}
                      style={{
                        background: 'linear-gradient(to right, #0ea5e9, #0284c7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.5rem 1rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer',
                        marginRight: '0.5rem'
                      }}
                    >
                      <UserRound size={16} /> Profile
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="auth-btn logout-btn"
                      style={{
                        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.65rem 1.3rem',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        letterSpacing: '0.3px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 20px rgba(239,68,68,0.35)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow =
                          '0 15px 30px rgba(239,68,68,0.5)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow =
                          '0 8px 20px rgba(239,68,68,0.35)';
                      }}
                    >
                       Logout
                    </button>
                  </>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {loginModalOpen && (
        <div className="register-modal-backdrop" onClick={closeLoginModal}>
          <style dangerouslySetInnerHTML={{
            __html: `
          .register-modal-backdrop {
            position: fixed; inset: 0; z-index: 2000; background: rgba(15, 23, 42, 0.55);
            display: flex; align-items: center; justify-content: center; padding: 1rem;
          }
          .register-modal {
            width: min(640px, 100%); max-height: 92vh; overflow-y: auto; background: #ffffff;
            border-radius: 14px; box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28); padding: 1.5rem;
          }
          .login-modal { width: min(440px, 100%); }
          .register-modal-header {
            display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem;
          }
          .register-modal-title {
            color: #0f172a; font-size: 1.35rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;
          }
          .register-modal-close {
            width: 38px; height: 38px; border: none; border-radius: 8px; background: #f1f5f9; color: #0f172a;
            display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
          }
          .register-modal .form-group { margin-bottom: 1rem; }
          .register-modal label { color: #0f172a; font-weight: 700; margin-bottom: 0.45rem; display: block; }
          .register-modal-alert {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.9rem 1rem; border-radius: 8px;
            margin-bottom: 1rem; font-weight: 600; font-size: 0.92rem;
          }
          .register-modal-alert.success { color: #047857; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.22); }
          .register-modal-alert.error { color: #dc2626; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.22); }
          @media (max-width: 640px) {
            .register-modal { padding: 1.1rem; }
            .register-modal-title { font-size: 1.15rem; }
          }
        `}} />

          <div className="register-modal login-modal" role="dialog" aria-modal="true" aria-labelledby="login-modal-title" onClick={(e) => e.stopPropagation()}>
            <div className="register-modal-header">
              <h2 id="login-modal-title" className="register-modal-title">
                <LogIn size={22} /> Login
              </h2>
              <button type="button" className="register-modal-close" onClick={closeLoginModal} aria-label="Close login modal">
                <X size={20} />
              </button>
            </div>

            {loginSuccess && (
              <div className="register-modal-alert success">
                <CheckCircle size={18} />
                <span>{loginSuccess}</span>
              </div>
            )}

            {loginError && (
              <div className="register-modal-alert error">
                <AlertCircle size={18} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input className="form-input" type="email" placeholder="Email address" value={loginForm.email} onChange={(e) => updateLoginForm('email', e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input className="form-input" type="password" placeholder="Password" value={loginForm.password} onChange={(e) => updateLoginForm('password', e.target.value)} required />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem' }} disabled={loginLoading}>
                {loginLoading ? 'Signing in...' : 'Login'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>or sign in with</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            </div>

            {/* Google sign-in container */}
            <div id="google-header-signin-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}></div>

            {/* Mock Google login bypass */}
            <button
              type="button"
              onClick={handleHeaderMockGoogleLogin}
              className="btn btn-secondary"
              disabled={loginLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                width: '100%',
                padding: '0.55rem 0.75rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google Login (Demo Mock)
            </button>
          </div>
        </div>
      )}

      {registerModalOpen && (
        <div className="register-modal-backdrop" onClick={closeRegisterModal}>
          <style dangerouslySetInnerHTML={{
            __html: `
          .register-modal-backdrop {
            position: fixed; inset: 0; z-index: 2000; background: rgba(15, 23, 42, 0.55);
            display: flex; align-items: center; justify-content: center; padding: 1rem;
          }
          .register-modal {
            width: min(640px, 100%); max-height: 92vh; overflow-y: auto; background: #ffffff;
            border-radius: 14px; box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28); padding: 1.5rem;
          }
          .register-modal-header {
            display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem;
          }
          .register-modal-title {
            color: #0f172a; font-size: 1.35rem; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;
          }
          .register-modal-close {
            width: 38px; height: 38px; border: none; border-radius: 8px; background: #f1f5f9; color: #0f172a;
            display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
          }
          .register-modal-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
          .register-modal .form-group { margin-bottom: 1rem; }
          .register-modal .full-width { grid-column: 1 / -1; }
          .register-modal label { color: #0f172a; font-weight: 700; margin-bottom: 0.45rem; display: block; }
          .register-modal textarea { min-height: 96px; resize: vertical; }
          .register-modal-alert {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.9rem 1rem; border-radius: 8px;
            margin-bottom: 1rem; font-weight: 600; font-size: 0.92rem;
          }
          .register-modal-alert.success { color: #047857; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.22); }
          .register-modal-alert.error { color: #dc2626; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.22); }
          @media (max-width: 640px) {
            .register-modal { padding: 1.1rem; }
            .register-modal-grid { grid-template-columns: 1fr; }
            .register-modal-title { font-size: 1.15rem; }
          }
        `}} />

          <div className="register-modal" role="dialog" aria-modal="true" aria-labelledby="register-modal-title" onClick={(e) => e.stopPropagation()}>
            <div className="register-modal-header">
              <h2 id="register-modal-title" className="register-modal-title">
                <UserPlus size={22} /> Register
              </h2>
              <button type="button" className="register-modal-close" onClick={closeRegisterModal} aria-label="Close register modal">
                <X size={20} />
              </button>
            </div>

            {registerSuccess && (
              <div className="register-modal-alert success">
                <CheckCircle size={18} />
                <span>{registerSuccess}</span>
              </div>
            )}

            {registerError && (
              <div className="register-modal-alert error">
                <AlertCircle size={18} />
                <span>{registerError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              <div className="register-modal-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input className="form-input" type="text" placeholder="First name" value={registerForm.firstName} onChange={(e) => updateRegisterForm('firstName', e.target.value)} disabled={registerLoading} required />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input className="form-input" type="text" placeholder="Last name" value={registerForm.lastName} onChange={(e) => updateRegisterForm('lastName', e.target.value)} disabled={registerLoading} required />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" type="email" placeholder="Email address" value={registerForm.email} onChange={(e) => updateRegisterForm('email', e.target.value)} disabled={registerLoading} required />
                </div>

                <div className="form-group">
                  <label>Phone No</label>
                  <input className="form-input" type="tel" placeholder="Phone number" value={registerForm.phone} onChange={(e) => updateRegisterForm('phone', e.target.value)} disabled={registerLoading} required />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input className="form-input" type="password" placeholder="Password" value={registerForm.password} onChange={(e) => updateRegisterForm('password', e.target.value)} disabled={registerLoading} required />
                </div>

                <div className="form-group">
                  <label>Resume</label>
                  <input className="form-input" type="file" accept="application/pdf,.pdf" onChange={(e) => updateRegisterForm('resume', e.target.files[0] || null)} disabled={registerLoading} required />
                </div>

                <div className="form-group full-width">
                  <label>Skills</label>
                  <textarea className="form-input" placeholder="React, Node.js, RF survey, telecom tools..." value={registerForm.skills} onChange={(e) => updateRegisterForm('skills', e.target.value)} disabled={registerLoading} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem' }} disabled={registerLoading}>
                {registerLoading ? 'Sending OTP...' : 'Send Email OTP'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Google Registration Modal for First-time Sign-in */}
      {showHeaderGoogleRegisterModal && (
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
          padding: '1rem'
        }}>
          <div className="form-card glass" style={{
            background: 'white',
            maxWidth: '440px',
            width: '100%',
            padding: '2.25rem',
            borderRadius: '14px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowHeaderGoogleRegisterModal(false)}
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
              <h2 style={{ color: '#000000', fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>Complete Your Profile</h2>
            </div>
            
            <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Welcome <strong>{headerGoogleRegisterData.name}</strong>! Since this is your first time signing in with Google, please set a password and phone number to secure your account.
            </p>

            <form onSubmit={handleHeaderGoogleRegisterSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Mail size={14} /> Email
                </label>
                <input type="text" className="form-input" value={headerGoogleRegisterData.email} disabled style={{ background: '#f3f4f6' }} />
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
                  value={headerGoogleRegisterData.password}
                  onChange={e => setHeaderGoogleRegisterData({ ...headerGoogleRegisterData, password: e.target.value })}
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
                  value={headerGoogleRegisterData.phone}
                  onChange={e => setHeaderGoogleRegisterData({ ...headerGoogleRegisterData, phone: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={14} /> City
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your city"
                  required
                  value={headerGoogleRegisterData.city}
                  onChange={e => setHeaderGoogleRegisterData({ ...headerGoogleRegisterData, city: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loginLoading}>
                {loginLoading ? 'Saving Profile...' : 'Complete & Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
