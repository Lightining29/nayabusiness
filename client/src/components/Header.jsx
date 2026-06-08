import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Cpu, Menu, X, ChevronDown } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [telecomOpen, setTelecomOpen] = useState(false);
  const [softwareOpen, setSoftwareOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
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
    <header className="glass-nav">
      <div className="header-container">
        <Link to="/" className="logo-container" onClick={() => setIsOpen(false)}>
          <Cpu className="logo-icon" />
          <span>RANCOM <span className="gradient-text-blue" style={{ fontSize: '0.8rem', fontWeight: 600, verticalAlign: 'middle', marginLeft: '0.2rem' }}>TECHNOLOGIES</span></span>
        </Link>

        <button className="menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav>
          <ul className={`nav-links ${isOpen ? 'mobile-open' : ''}`}>
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)} end>Home</NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>About Us</NavLink>
            </li>
            <li className="dropdown-container">
              <span className="nav-link" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => setTelecomOpen(!telecomOpen)}>
                Telecom Services <ChevronDown size={14} />
              </span>
              <div className={`dropdown-menu ${telecomOpen ? 'mobile-show' : ''}`}>
                {telecomServices.map((service, idx) => (
                  <Link key={idx} to={service.path} className="dropdown-item" onClick={() => { setIsOpen(false); setTelecomOpen(false); }}>{service.name}</Link>
                ))}
              </div>
            </li>
            <li className="dropdown-container">
              <span className="nav-link" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }} onClick={() => setSoftwareOpen(!softwareOpen)}>
                Software Services <ChevronDown size={14} />
              </span>
              <div className={`dropdown-menu ${softwareOpen ? 'mobile-show' : ''}`}>
                {softwareServices.map((service, idx) => (
                  <Link key={idx} to={service.path} className="dropdown-item" onClick={() => { setIsOpen(false); setSoftwareOpen(false); }}>{service.name}</Link>
                ))}
              </div>
            </li>
            <li>
              <NavLink to="/blog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Blog</NavLink>
            </li>
            <li>
              <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>Jobs</NavLink>
            </li>
            {isAuth && (
              <li>
                <button className="nav-link" onClick={handleLogout}>Logout</button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
