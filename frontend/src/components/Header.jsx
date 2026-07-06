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
    { name: 'Software Development Company', path: '/services/software-company' },
    { name: 'Custom Software Development',  path: '/services/custom-software' },
    { name: 'Web Development Company',       path: '/services/web-development' },
    { name: 'MERN Stack Development',        path: '/services/mern-stack' },
    { name: 'Java Development Services',     path: '/services/java-development' },
    { name: 'React.js Development',          path: '/services/reactjs-development' },
    { name: 'Node.js Development',           path: '/services/nodejs-development' },
    { name: 'Mobile App Development',        path: '/services/mobile-app' },
    { name: 'E-commerce Development',        path: '/services/ecommerce' },
    { name: 'ERP Software Development',      path: '/services/erp-software' },
    { name: 'HRMS Software Development',     path: '/services/hrms-software' },
    { name: 'CRM Software Development',      path: '/services/crm-software' },
    { name: 'School Management Software',    path: '/services/school-software' },
    { name: 'Hospital Management Software',  path: '/services/hospital-software' },
    { name: 'SaaS Application Development',  path: '/services/saas-development' },
    { name: 'Cloud Solutions',               path: '/services/cloud-solutions' },
    { name: 'UI/UX Design',                  path: '/services/ui-ux-design' },
    { name: 'DevOps Services',               path: '/services/devops' },
    { name: 'QA & Software Testing',         path: '/services/qa-testing' },
    { name: 'Software Maintenance',          path: '/services/software-maintenance' },
  ];

  return (
    <>
      <header className="glass-nav">
        <div className="header-container">
          <Link to="/" className="logo-container" onClick={() => setIsOpen(false)} style={{ gap: '0.6rem', alignItems: 'center' }}>
            {/* Appletree Infotech logo */}
            <img
              src="/rancom.png"
              alt="Rancom Technologies"
              style={{ height: '36px', width: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1.5px solid rgba(14,165,233,0.25)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#000' }}>
                RANCOM <span className="gradient-text-blue">TECHNOLOGIES</span>
              </span>
              <span style={{ fontSize: '0.76rem', fontWeight: 500, color: '#6b7280', letterSpacing: '0.04em' ,marginTop: '2px',display: 'inline-block'}}>
               Group of <span style={{ color: '#e53e3e', fontWeight: 900 }}>Apple</span><span style={{ color: '#1d460591', fontWeight: 700 }}>tree</span> infotech
              </span>
            </div>
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
                      display: 'inline-flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={openLoginModal}
                  >
                    <LogIn size={16} className="icon" style={{ marginRight: '0.5rem' }} /> Login
                  </button>
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
