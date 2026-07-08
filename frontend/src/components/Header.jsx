import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, ChevronDown, LogIn, UserRound, LogOut,
  Moon, Sun, Bell, Briefcase, Code, Radio, AlertCircle,
  CheckCircle, Lock, Mail
} from 'lucide-react';
import { getGoogleClientId } from '../utils/googleAuth';
import NotificationBell from './NotificationBell';

/* ── data ─────────────────────────────────────────────────────── */
const telecomLinks = [
  { name: 'LOS Survey',             path: '/telecom/los'       },
  { name: 'RF Survey',               path: '/telecom/rf'        },
  { name: 'EMF Survey',              path: '/telecom/emf'       },
  { name: 'BTS Installation',        path: '/telecom/bts'       },
  { name: 'Router Installation',     path: '/telecom/router'    },
  { name: 'Network Testing',         path: '/telecom/network'   },
  { name: 'Microwave Installation',  path: '/telecom/microwave' },
  { name: 'SCFT Testing',            path: '/telecom/scft'      },
];

const softwareLinks = [
  { name: 'Software Development',   path: '/services/software-company' },
  { name: 'Custom Software',        path: '/services/custom-software'  },
  { name: 'Web Development',        path: '/services/web-development'  },
  { name: 'MERN Stack',             path: '/services/mern-stack'       },
  { name: 'Java Development',       path: '/services/java-development' },
  { name: 'Mobile App',             path: '/services/mobile-app'       },
  { name: 'ERP Software',           path: '/services/erp-software'     },
  { name: 'HRMS Software',          path: '/services/hrms-software'    },
  { name: 'E-commerce',             path: '/services/ecommerce'        },
  { name: 'SaaS Development',       path: '/services/saas-development' },
  { name: 'Cloud Solutions',        path: '/services/cloud-solutions'  },
  { name: 'UI/UX Design',           path: '/services/ui-ux-design'     },
];

/* ── Dropdown ─────────────────────────────────────────────────── */
function Dropdown({ label, icon, links, mobileOpen, onMobileToggle, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={onMobileToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: '5px', background: 'none',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
          fontSize: '0.9rem', color: 'var(--nav-text, #475569)', padding: '0.5rem 0',
          transition: 'color 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--nav-text, #475569)'}
        aria-expanded={mobileOpen}
      >
        {icon}{label}
        <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: mobileOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {/* Desktop hover dropdown */}
      <div className="hdr-dropdown-panel">
        <div style={{ display: 'grid', gridTemplateColumns: links.length > 6 ? '1fr 1fr' : '1fr', gap: '2px', padding: '0.5rem' }}>
          {links.map(l => (
            <Link key={l.path} to={l.path} onClick={onClose}
              style={{ display: 'block', padding: '0.5rem 0.85rem', borderRadius: '7px', fontSize: '0.85rem', fontWeight: 500, color: '#334155', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(14,165,233,0.08)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#334155'; }}>
              {l.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile accordion */}
      {mobileOpen && (
        <div style={{ paddingLeft: '1rem', paddingTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {links.map(l => (
            <Link key={l.path} to={l.path} onClick={onClose}
              style={{ padding: '0.45rem 0.75rem', borderRadius: '7px', fontSize: '0.85rem', fontWeight: 500, color: '#475569', display: 'block' }}>
              {l.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Header ──────────────────────────────────────────────── */
export default function Header() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [telecomOpen,  setTelecomOpen]  = useState(false);
  const [softwareOpen, setSoftwareOpen] = useState(false);
  const [darkMode,     setDarkMode]     = useState(() => localStorage.getItem('theme') === 'dark');
  const [isAuth,       setIsAuth]       = useState(false);
  const [scrolled,     setScrolled]     = useState(false);

  /* login modal */
  const [loginOpen,    setLoginOpen]    = useState(false);
  const [loginEmail,   setLoginEmail]   = useState('');
  const [loginPass,    setLoginPass]    = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError,   setLoginError]   = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  /* dark mode */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  /* auth sync */
  useEffect(() => { setIsAuth(!!localStorage.getItem('token')); }, [location.pathname]);
  useEffect(() => {
    const sync = () => setIsAuth(!!localStorage.getItem('token'));
    window.addEventListener('auth-change', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('auth-change', sync); window.removeEventListener('storage', sync); };
  }, []);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close mobile on route change */
  useEffect(() => { setMobileOpen(false); setTelecomOpen(false); setSoftwareOpen(false); }, [location.pathname]);

  const closeAll = () => { setTelecomOpen(false); setSoftwareOpen(false); };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    setIsAuth(false);
    navigate('/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError(''); setLoginSuccess('');
    try {
      const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginEmail, password: loginPass }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      localStorage.setItem('token', d.token);
      window.dispatchEvent(new Event('auth-change'));
      setIsAuth(true); setLoginSuccess('Welcome back!');
      setTimeout(() => { setLoginOpen(false); setLoginEmail(''); setLoginPass(''); setLoginSuccess(''); navigate('/profile'); }, 700);
    } catch (err) { setLoginError(err.message); }
    finally { setLoginLoading(false); }
  };

  /* Google sign-in button in modal */
  useEffect(() => {
    if (!loginOpen) return;
    let cancelled = false;
    setTimeout(async () => {
      if (cancelled) return;
      try {
        const clientId = await getGoogleClientId();
        if (!clientId || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (cancelled) return;
            setLoginLoading(true);
            try {
              const r = await fetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credential: response.credential }) });
              const d = await r.json();
              if (!r.ok) throw new Error(d.error);
              if (d.token) {
                localStorage.setItem('token', d.token);
                window.dispatchEvent(new Event('auth-change'));
                setLoginSuccess('Signed in with Google!');
                setTimeout(() => { setLoginOpen(false); navigate('/profile'); }, 700);
              }
            } catch (err) { setLoginError(err.message); }
            finally { setLoginLoading(false); }
          }
        });
        const el = document.getElementById('hdr-google-btn');
        if (el) window.google.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 300, shape: 'rectangular' });
      } catch {}
    }, 200);
    return () => { cancelled = true; };
  }, [loginOpen]);

  /* ── CSS ── */
  const CSS = `
    .hdr-root {
      position: sticky; top: 0; z-index: 200; width: 100%;
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(14,165,233,0.12);
      transition: box-shadow 0.25s ease;
    }
    .hdr-root.scrolled { box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .dark .hdr-root { background: rgba(2,6,23,0.97); border-bottom-color: rgba(56,189,248,0.1); }

    .hdr-inner {
      max-width: 1280px; margin: 0 auto;
      padding: 0 1.5rem;
      display: flex; align-items: center; gap: 0.5rem; height: 64px;
    }

    /* logo */
    .hdr-logo {
      display: flex; align-items: center; gap: 0.6rem;
      text-decoration: none; flex-shrink: 0; margin-right: 0.5rem;
    }
    .hdr-logo-img {
      width: 38px; height: 38px; border-radius: 50%; object-fit: cover;
      border: 2px solid rgba(14,165,233,0.25); flex-shrink: 0;
    }
    .hdr-logo-text { display: flex; flex-direction: column; line-height: 1.1; }
    .hdr-logo-main { font-size: 1rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; }
    .dark .hdr-logo-main { color: #f8fafc; }
    .hdr-logo-sub { font-size: 0.58rem; font-weight: 500; color: #6b7280; letter-spacing: 0.04em; }
    .dark .hdr-logo-sub { color: #94a3b8; }

    /* nav links */
    .hdr-nav { display: flex; align-items: center; gap: 0.15rem; flex: 1; }
    .hdr-link {
      padding: 0.45rem 0.75rem; border-radius: 8px; font-size: 0.88rem; font-weight: 600;
      color: #475569; text-decoration: none; transition: all 0.18s; white-space: nowrap;
    }
    .hdr-link:hover, .hdr-link.active { color: var(--primary); background: rgba(14,165,233,0.08); }
    .dark .hdr-link { color: #94a3b8; }
    .dark .hdr-link:hover, .dark .hdr-link.active { color: #38bdf8; background: rgba(56,189,248,0.1); }

    /* apply CTA link */
    .hdr-apply {
      padding: 0.4rem 0.9rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700;
      color: #059669; background: rgba(5,150,105,0.08); border: 1.5px solid rgba(5,150,105,0.2);
      text-decoration: none; transition: all 0.18s; white-space: nowrap;
    }
    .hdr-apply:hover { background: rgba(5,150,105,0.14); border-color: rgba(5,150,105,0.4); }

    /* dropdown */
    .hdr-dropdown-wrap { position: relative; }
    .hdr-dropdown-trigger {
      display: flex; align-items: center; gap: 4px; cursor: pointer;
      font-size: 0.88rem; font-weight: 600; color: #475569; background: none; border: none;
      padding: 0.45rem 0.75rem; border-radius: 8px; font-family: inherit; transition: all 0.18s;
      white-space: nowrap;
    }
    .hdr-dropdown-trigger:hover { color: var(--primary); background: rgba(14,165,233,0.08); }
    .dark .hdr-dropdown-trigger { color: #94a3b8; }
    .dark .hdr-dropdown-trigger:hover { color: #38bdf8; background: rgba(56,189,248,0.1); }
    .hdr-dropdown-wrap:hover .hdr-dropdown-panel { opacity: 1; visibility: visible; transform: translateY(0); }

    .hdr-dropdown-panel {
      position: absolute; top: calc(100% + 8px); left: 50%; transform: translateX(-50%) translateY(8px);
      background: white; border: 1px solid rgba(14,165,233,0.18); border-radius: 14px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.12); min-width: 220px; max-width: 420px;
      opacity: 0; visibility: hidden; transition: all 0.2s ease;
      max-height: 70vh; overflow-y: auto; z-index: 300;
    }
    .dark .hdr-dropdown-panel { background: #1e293b; border-color: rgba(56,189,248,0.15); }
    .hdr-dropdown-panel a { color: #334155 !important; }
    .dark .hdr-dropdown-panel a { color: #cbd5e1 !important; }

    /* right side icons */
    .hdr-actions { display: flex; align-items: center; gap: 0.35rem; margin-left: auto; flex-shrink: 0; }
    .hdr-icon-btn {
      width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      background: rgba(14,165,233,0.06); color: #475569; transition: all 0.18s;
    }
    .hdr-icon-btn:hover { background: rgba(14,165,233,0.14); color: var(--primary); }
    .dark .hdr-icon-btn { background: rgba(56,189,248,0.08); color: #94a3b8; }
    .dark .hdr-icon-btn:hover { color: #38bdf8; }

    /* auth buttons */
    .hdr-login-btn {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.88rem; font-weight: 700;
      border: 1.5px solid rgba(14,165,233,0.35); color: var(--primary); background: rgba(14,165,233,0.06);
      cursor: pointer; font-family: inherit; transition: all 0.18s; white-space: nowrap;
    }
    .hdr-login-btn:hover { background: rgba(14,165,233,0.12); border-color: var(--primary); }
    .hdr-profile-btn {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.4rem 1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 700;
      background: linear-gradient(135deg,#0ea5e9,#0284c7); color: white; border: none;
      cursor: pointer; font-family: inherit; text-decoration: none; transition: all 0.18s;
      box-shadow: 0 2px 10px rgba(14,165,233,0.3);
    }
    .hdr-profile-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(14,165,233,0.4); }
    .hdr-logout-btn {
      display: inline-flex; align-items: center; gap: 0.35rem;
      padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.82rem; font-weight: 700;
      background: rgba(239,68,68,0.08); color: #dc2626; border: 1.5px solid rgba(239,68,68,0.2);
      cursor: pointer; font-family: inherit; transition: all 0.18s;
    }
    .hdr-logout-btn:hover { background: rgba(239,68,68,0.14); border-color: rgba(239,68,68,0.4); }

    /* hamburger */
    .hdr-hamburger {
      display: none; width: 40px; height: 40px; border-radius: 10px; border: none;
      background: rgba(14,165,233,0.07); color: #334155; cursor: pointer;
      align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.18s;
    }
    .dark .hdr-hamburger { background: rgba(56,189,248,0.08); color: #cbd5e1; }
    .hdr-hamburger:hover { background: rgba(14,165,233,0.14); }

    /* mobile drawer */
    .hdr-mobile {
      display: none; flex-direction: column; padding: 1rem 1.25rem 1.25rem;
      border-top: 1px solid rgba(14,165,233,0.1); gap: 2px;
      max-height: calc(100vh - 64px); overflow-y: auto;
    }
    .dark .hdr-mobile { border-top-color: rgba(56,189,248,0.1); }
    .hdr-mobile.open { display: flex; }
    .hdr-mobile-link {
      display: block; padding: 0.6rem 0.85rem; border-radius: 9px; font-size: 0.9rem; font-weight: 600;
      color: #334155; text-decoration: none; transition: all 0.15s;
    }
    .hdr-mobile-link:hover, .hdr-mobile-link.active { color: var(--primary); background: rgba(14,165,233,0.08); }
    .dark .hdr-mobile-link { color: #cbd5e1; }
    .dark .hdr-mobile-link:hover { color: #38bdf8; background: rgba(56,189,248,0.1); }
    .hdr-mobile-divider { height: 1px; background: rgba(14,165,233,0.1); margin: 0.5rem 0; }
    .hdr-mobile-section { font-size: 0.68rem; font-weight: 800; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.5rem 0.85rem 0.25rem; }
    .hdr-mobile-auth { display: flex; gap: 0.5rem; padding: 0.5rem 0.25rem 0; flex-wrap: wrap; }

    /* modal backdrop */
    .hdr-modal-bg {
      position: fixed; inset: 0; background: rgba(15,23,42,0.6);
      backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center;
      z-index: 500; padding: 1rem;
    }
    .hdr-modal {
      background: white; border-radius: 20px; padding: 2rem 2rem 1.75rem;
      width: 100%; max-width: 400px; box-shadow: 0 24px 64px rgba(0,0,0,0.18);
      position: relative; animation: fadeInUp 0.22s ease;
    }
    .dark .hdr-modal { background: #1e293b; }
    @keyframes fadeInUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
    .hdr-modal-close {
      position: absolute; top: 1rem; right: 1rem; width: 30px; height: 30px; border-radius: 8px;
      border: none; background: #f1f5f9; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .dark .hdr-modal-close { background: #334155; color: #94a3b8; }
    .hdr-modal-input {
      width: 100%; box-sizing: border-box; padding: 0.75rem 1rem;
      border: 1.5px solid #e2e8f0; border-radius: 10px; font-family: inherit; font-size: 0.92rem;
      outline: none; background: #f8fafc; color: #0f172a; transition: border-color 0.18s; margin-bottom: 0.75rem;
    }
    .dark .hdr-modal-input { background: #0f172a; border-color: #334155; color: white; }
    .hdr-modal-input:focus { border-color: #0ea5e9; background: white; }
    .dark .hdr-modal-input:focus { background: #1e293b; }
    .hdr-modal-btn {
      width: 100%; padding: 0.85rem; border: none; border-radius: 12px; cursor: pointer;
      background: linear-gradient(135deg,#0ea5e9,#0369a1); color: white; font-size: 0.95rem;
      font-weight: 800; font-family: inherit; transition: all 0.2s;
      box-shadow: 0 4px 16px rgba(14,165,233,0.35);
    }
    .hdr-modal-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(14,165,233,0.45); }
    .hdr-modal-btn:disabled { opacity: 0.65; cursor: not-allowed; }
    .hdr-divider { display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0; }
    .hdr-divider-line { flex:1; height:1px; background:#e2e8f0; }
    .dark .hdr-divider-line { background:#334155; }
    .hdr-divider-text { font-size: 0.78rem; color: #94a3b8; font-weight: 600; }

    @media (max-width: 1100px) {
      .hdr-nav { display: none; }
      .hdr-hamburger { display: flex; }
      .hdr-actions .hdr-login-btn span, .hdr-actions .hdr-logout-btn span { display: none; }
    }
    @media (max-width: 480px) {
      .hdr-inner { padding: 0 1rem; }
      .hdr-logo-sub { display: none; }
    }
  `;

  /* ── Render ── */
  return (
    <>
      <style>{CSS}</style>

      <header className={`hdr-root${scrolled ? ' scrolled' : ''}`}>
        <div className="hdr-inner">

          {/* Logo */}
          <Link to="/" className="hdr-logo">
            
            <img src="/rancom.png" alt="Rancom Technologies" className="hdr-logo-img"
              style={{ marginLeft:'-6px', border:'2px solid rgba(14,165,233,0.3)' }}
              onError={e => { e.target.style.display='none'; }} />
            <div className="hdr-logo-text">
              <span className="hdr-logo-main">
                RANCOM <span style={{ background:'linear-gradient(135deg,#0ea5e9,#06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>TECH</span>
              </span>
              <span className="hdr-logo-sub">
                Pvt. Ltd · <span style={{ color:'#e53e3e' }}>apple</span><span style={{ color:'#38a169' }}>tree</span> infotech
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hdr-nav" aria-label="Main navigation">
            <NavLink to="/" className={({isActive}) => `hdr-link${isActive?' active':''}`} end>Home</NavLink>
            <NavLink to="/about" className={({isActive}) => `hdr-link${isActive?' active':''}`}>About</NavLink>

            {/* Telecom dropdown */}
            <div className="hdr-dropdown-wrap">
              <button className="hdr-dropdown-trigger" aria-haspopup="true">
                <Radio size={14} />Telecom <ChevronDown size={13} />
              </button>
              <div className="hdr-dropdown-panel">
                <div style={{ padding:'0.5rem', display:'flex', flexDirection:'column' }}>
                  {telecomLinks.map(l => (
                    <Link key={l.path} to={l.path}
                      style={{ padding:'0.5rem 0.85rem', borderRadius:'7px', fontSize:'0.85rem', fontWeight:500, display:'block' }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(14,165,233,0.08)'; e.currentTarget.style.color='var(--primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color=''; }}>
                      {l.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Software dropdown */}
            <div className="hdr-dropdown-wrap">
              <button className="hdr-dropdown-trigger" aria-haspopup="true">
                <Code size={14} />Services <ChevronDown size={13} />
              </button>
              <div className="hdr-dropdown-panel">
                <div style={{ padding:'0.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1px' }}>
                  {softwareLinks.map(l => (
                    <Link key={l.path} to={l.path}
                      style={{ padding:'0.5rem 0.85rem', borderRadius:'7px', fontSize:'0.82rem', fontWeight:500, display:'block', whiteSpace:'nowrap' }}
                      onMouseEnter={e => { e.currentTarget.style.background='rgba(14,165,233,0.08)'; e.currentTarget.style.color='var(--primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color=''; }}>
                      {l.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <NavLink to="/blog" className={({isActive}) => `hdr-link${isActive?' active':''}`}>Blog</NavLink>
            <NavLink to="/jobs" className={({isActive}) => `hdr-link${isActive?' active':''}`}>Jobs</NavLink>
            <NavLink to="/apply" className="hdr-apply">Apply Now</NavLink>
          </nav>

          {/* Right actions */}
          <div className="hdr-actions">
            {/* Dark mode */}
         

            {/* Notification bell */}
            <NotificationBell />

            {/* Auth */}
            {isAuth ? (
              <>
                <Link to="/profile" className="hdr-profile-btn">
                  <UserRound size={15} /><span>Profile</span>
                </Link>
                <button className="hdr-logout-btn" onClick={handleLogout} title="Sign out">
                  <LogOut size={14} /><span>Logout</span>
                </button>
              </>
            ) : (
              <button className="hdr-login-btn" onClick={() => { setLoginOpen(true); setLoginError(''); setLoginSuccess(''); }}>
                <LogIn size={15} /><span>Login</span>
              </button>
            )}

            {/* Hamburger */}
            <button className="hdr-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <div className={`hdr-mobile${mobileOpen ? ' open' : ''}`}>
          <NavLink to="/" className={({isActive}) => `hdr-mobile-link${isActive?' active':''}`} end>Home</NavLink>
          <NavLink to="/about" className={({isActive}) => `hdr-mobile-link${isActive?' active':''}`}>About</NavLink>

          <div className="hdr-mobile-divider" />
          <div className="hdr-mobile-section">🗼 Telecom Services</div>
          {telecomLinks.map(l => (
            <NavLink key={l.path} to={l.path} className={({isActive}) => `hdr-mobile-link${isActive?' active':''}`}
              style={{ paddingLeft:'1.25rem', fontSize:'0.85rem' }}>{l.name}</NavLink>
          ))}

          <div className="hdr-mobile-divider" />
          <div className="hdr-mobile-section">💻 Software Services</div>
          {softwareLinks.map(l => (
            <NavLink key={l.path} to={l.path} className={({isActive}) => `hdr-mobile-link${isActive?' active':''}`}
              style={{ paddingLeft:'1.25rem', fontSize:'0.85rem' }}>{l.name}</NavLink>
          ))}

          <div className="hdr-mobile-divider" />
          <NavLink to="/blog" className={({isActive}) => `hdr-mobile-link${isActive?' active':''}`}>Blog</NavLink>
          <NavLink to="/jobs" className={({isActive}) => `hdr-mobile-link${isActive?' active':''}`}>Jobs</NavLink>
          <NavLink to="/apply" className="hdr-mobile-link" style={{ color:'#059669', fontWeight:700 }}>🚀 Apply Now</NavLink>

          <div className="hdr-mobile-auth">
            {isAuth ? (
              <>
                <Link to="/profile" className="hdr-profile-btn" style={{ flex:1, justifyContent:'center', textDecoration:'none' }}>
                  <UserRound size={15} /> Profile
                </Link>
                <button className="hdr-logout-btn" style={{ flex:1, justifyContent:'center' }} onClick={handleLogout}>
                  <LogOut size={14} /> Logout
                </button>
              </>
            ) : (
              <button className="hdr-login-btn" style={{ flex:1, justifyContent:'center' }}
                onClick={() => { setMobileOpen(false); setLoginOpen(true); }}>
                <LogIn size={15} /> Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Login Modal ── */}
      {loginOpen && (
        <div className="hdr-modal-bg" onClick={() => setLoginOpen(false)}>
          <div className="hdr-modal" onClick={e => e.stopPropagation()}>
            <button className="hdr-modal-close" onClick={() => setLoginOpen(false)}><X size={15} /></button>

            <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
              <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:'linear-gradient(135deg,#0ea5e9,#0369a1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.75rem' }}>
                <LogIn size={22} color="white" />
              </div>
              <h2 style={{ fontSize:'1.3rem', fontWeight:800, color:'#0f172a', margin:0 }}>Welcome back</h2>
              <p style={{ color:'#64748b', fontSize:'0.85rem', margin:'0.25rem 0 0' }}>Sign in to your Rancom Technologies account</p>
            </div>

            {loginSuccess && (
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', padding:'0.75rem 1rem', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:'9px', marginBottom:'1rem', color:'#047857', fontSize:'0.88rem', fontWeight:600 }}>
                <CheckCircle size={16} />{loginSuccess}
              </div>
            )}
            {loginError && (
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', padding:'0.75rem 1rem', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'9px', marginBottom:'1rem', color:'#dc2626', fontSize:'0.88rem', fontWeight:600 }}>
                <AlertCircle size={16} />{loginError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div style={{ position:'relative', marginBottom:'0.75rem' }}>
                <Mail size={15} style={{ position:'absolute', left:'0.85rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
                <input type="email" required placeholder="Email address" value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)} className="hdr-modal-input"
                  style={{ paddingLeft:'2.4rem', marginBottom:0 }} />
              </div>
              <div style={{ position:'relative', marginBottom:'1rem' }}>
                <Lock size={15} style={{ position:'absolute', left:'0.85rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
                <input type="password" required placeholder="Password" value={loginPass}
                  onChange={e => setLoginPass(e.target.value)} className="hdr-modal-input"
                  style={{ paddingLeft:'2.4rem', marginBottom:0 }} />
              </div>
              <button type="submit" className="hdr-modal-btn" disabled={loginLoading}>
                {loginLoading ? '⏳ Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="hdr-divider">
              <div className="hdr-divider-line" />
              <span className="hdr-divider-text">or continue with</span>
              <div className="hdr-divider-line" />
            </div>

            <div id="hdr-google-btn" style={{ display:'flex', justifyContent:'center', minHeight:'40px' }} />

            <p style={{ textAlign:'center', fontSize:'0.82rem', color:'#64748b', marginTop:'1.25rem', marginBottom:0 }}>
              Don't have an account?{' '}
              <Link to="/apply" onClick={() => setLoginOpen(false)} style={{ color:'var(--primary)', fontWeight:700 }}>Apply now</Link>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
