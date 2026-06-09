import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Cpu, Menu, X, ChevronDown, LogIn, UserPlus } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [telecomOpen, setTelecomOpen] = useState(false);
  const [softwareOpen, setSoftwareOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resume: '',
    password: '',
    skills: ''
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerError, setRegisterError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuth(!!token);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
    navigate('/');
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, phone, resume, password, skills } = registerForm;

    if (!firstName || !lastName || !email || !phone || !resume || !password || !skills) {
      setRegisterError('Please fill in all fields.');
      return;
    }

    setRegisterLoading(true);
    setRegisterError('');
    setRegisterSuccess('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          mobno: phone,
          resume,
          password,
          skills
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      setRegisterSuccess(data.message || 'Registration submitted successfully!');
      setRegisterForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        resume: '',
        password: '',
        skills: ''
      });
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

            {/* Auth Buttons */}
            <li className="nav-auth">
              {!isAuth ? (
                <>
                  <NavLink 
                    to="/login" 
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
                      alignItems: 'center'
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <LogIn size={16} className="icon" style={{ marginRight: '0.5rem' }} /> Login
                  </NavLink>
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
                <button 
                  onClick={handleLogout}
                  className="auth-btn logout-btn"
                  style={{
                    background: 'linear-gradient(to right, #EF4444, #DC2626)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                >
                  Logout
                </button>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>

    {registerModalOpen && (
      <div className="register-modal-backdrop" onClick={closeRegisterModal}>
        <style dangerouslySetInnerHTML={{__html: `
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
                <input className="form-input" type="text" placeholder="First name" value={registerForm.firstName} onChange={(e) => updateRegisterForm('firstName', e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input className="form-input" type="text" placeholder="Last name" value={registerForm.lastName} onChange={(e) => updateRegisterForm('lastName', e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input className="form-input" type="email" placeholder="Email address" value={registerForm.email} onChange={(e) => updateRegisterForm('email', e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Phone No</label>
                <input className="form-input" type="tel" placeholder="Phone number" value={registerForm.phone} onChange={(e) => updateRegisterForm('phone', e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input className="form-input" type="password" placeholder="Password" value={registerForm.password} onChange={(e) => updateRegisterForm('password', e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Resume</label>
                <input className="form-input" type="url" placeholder="https://example.com/resume.pdf" value={registerForm.resume} onChange={(e) => updateRegisterForm('resume', e.target.value)} required />
              </div>

              <div className="form-group full-width">
                <label>Skills</label>
                <textarea className="form-input" placeholder="React, Node.js, RF survey, telecom tools..." value={registerForm.skills} onChange={(e) => updateRegisterForm('skills', e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem' }} disabled={registerLoading}>
              {registerLoading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
