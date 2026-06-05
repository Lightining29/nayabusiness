import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleBecomeMember = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setPassword('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer>
      <div className="footer-container">
        <div className="footer-brand">
          <h3>
            <Cpu className="logo-icon" />
            <span>RANCOM</span>
          </h3>
          <p>
            RANCOM has been marked as of innovative characteristics with an elaboration of enhanced business and marketing skill sets. We are ebullient in accelerating the stability of your business in the farthest possible way.
          </p>
          <div className="footer-bottom-links" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>Support Contacts:</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email: support@rancomtechnologies.com</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tel: +1 (800) 555-0199</span>
          </div>
        </div>

        <div className="footer-links">
          <h4>Telecom Services</h4>
          <ul>
            <li><Link to="/telecom/los">LOS Survey</Link></li>
            <li><Link to="/telecom/rf">RF Survey</Link></li>
            <li><Link to="/telecom/emf">EMF Survey</Link></li>
            <li><Link to="/telecom/bts">BTS Installation</Link></li>
            <li><Link to="/telecom/router">Router Installation</Link></li>
            <li><Link to="/telecom/network">Network Testing</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Software Services</h4>
          <ul>
            <li><Link to="/services/development">Web Development</Link></li>
            <li><Link to="/services/design">Web Design</Link></li>
            <li><Link to="/services/hosting">Web Hosting</Link></li>
            <li><Link to="/services/logo">Logo Design</Link></li>
            <li><Link to="/services/seo">SEO Services</Link></li>
          </ul>
        </div>

        <div className="footer-newsletter">
          <h4>Become a Member</h4>
          <p>Sign up to receive technical documentation, network billing info, and ticket system access.</p>
          
          {subscribed ? (
            <div style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600, padding: '0.5rem 0' }}>
              ✓ Thank you! Credentials received.
            </div>
          ) : (
            <form onSubmit={handleBecomeMember} className="become-member" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={16} />
                </span>
                <input 
                  type="email" 
                  placeholder="Email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.6rem 0.8rem 0.6rem 2.2rem',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={16} />
                </span>
                <input 
                  type="password" 
                  placeholder="Password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.6rem 0.8rem 0.6rem 2.2rem',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1rem', width: '100%', fontSize: '0.9rem', borderRadius: '6px' }}>
                Continue <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2015 - 2026 RANCOM Technologies. All Rights Reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
