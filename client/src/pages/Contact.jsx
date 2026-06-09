import { useState } from 'react';
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [msg, setMsg] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !subject || !email || !tel || !msg) {
      setError('Please fill in all form inputs.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, subject, email, tel, msg })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit form.');
      }

      setSuccess(data.message || 'Thank you! Your message was received successfully.');
      setName('');
      setSubject('');
      setEmail('');
      setTel('');
      setMsg('');
    } catch (err) {
      setError(err.message || 'Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-width animate-fade-in" style={{ paddingTop: '4rem' }}>
      
      <div className="text-center">
        <h1 className="section-title">Contact Our Specialists</h1>
        <p className="section-subtitle">
          Have an upcoming network survey, installation project, or custom software requirement? Send us a message today.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .contact-layout {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr;
          gap: 4rem;
          margin-bottom: 5rem;
          align-items: start;
        }
        .contact-info-card {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .info-item {
          display: flex;
          gap: 1rem;
        }
        .info-icon {
          color: var(--secondary);
          background: rgba(6, 182, 212, 0.08);
          border: 1px solid rgba(6,182,212,0.15);
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (max-width: 820px) {
          .contact-layout {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}} />

      <div className="contact-layout">
        
        {/* Info Column */}
        <aside className="glass contact-info-card" style={{ borderRadius: '16px' }}>
          <div>
            <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>Corporate Office</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Rancom Technologies operates across international regions, providing telecom audits and software consulting.</p>
          </div>

          <div className="info-item">
            <div className="info-icon"><MapPin size={20} /></div>
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Office Address</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>452 Telecom Plaza, Sector-62, IT Park, Noida, UP, India</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon"><Phone size={20} /></div>
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Call Support</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+91 (120) 455-8900</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>+1 (800) 555-0199 (US toll-free)</p>
            </div>
          </div>

          <div className="info-item">
            <div className="info-icon"><Mail size={20} /></div>
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Email Queries</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>contact@rancomtechnologies.com</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>support@rancomtechnologies.com</p>
            </div>
          </div>
        </aside>

        {/* Form Column */}
        <main className="glass" style={{ padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Send Us A Message</h3>
          
          {success && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--accent)', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            <div className="form-group-row">
              <div className="form-group">
                <label>Your Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter Your Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Your Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Your Subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Email ID</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="Enter Email Id"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Contact No</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="Enter Contact No"
                  required
                  value={tel}
                  onChange={(e) => setTel(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Message Content</label>
              <textarea 
                className="form-input" 
                placeholder="Enter Your Message Here"
                required
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}
              disabled={loading}
            >
              <Send size={18} />
              <span>{loading ? 'Submitting Message...' : 'Submit Message'}</span>
            </button>

          </form>
        </main>
      </div>

    </div>
  );
}
