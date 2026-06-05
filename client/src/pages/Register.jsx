import React, { useState } from 'react';
import { UserCheck, AlertCircle, CheckCircle } from 'lucide-react';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobno, setMobno] = useState('');
  const [qualification, setQualification] = useState('');
  const [city, setCity] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !mobno || !qualification || !city) {
      setError('Please fill in all inputs.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

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
          mobno,
          qualification,
          city
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setSuccess(data.message || 'Application submitted successfully! Our recruiting team will contact you soon.');
      setFirstName('');
      setLastName('');
      setEmail('');
      setMobno('');
      setQualification('');
      setCity('');
    } catch (err) {
      setError(err.message || 'Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-width animate-fade-in" style={{ paddingTop: '4rem' }}>
      
      <div className="text-center">
        <h1 className="section-title">Career Opportunities</h1>
        <p className="section-subtitle">
          Join a leading team of telecom engineers, RF analysts, and full-stack software developers. Register below for current openings.
        </p>
      </div>

      <div className="form-card glass">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <UserCheck size={28} style={{ color: 'var(--secondary)' }} />
          <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 800 }}>Job Registration Form</h2>
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

        <form onSubmit={handleRegister}>
          
          <div className="form-group-row">
            <div className="form-group">
              <label>First Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Last Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="Enter Your Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter Your Mobile No."
              required
              value={mobno}
              onChange={(e) => setMobno(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Highest Qualification</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. B.Tech ECE, MCA, BS Computer Science"
              required
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Enter Your City"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Submitting Application...' : 'Register Now'}
          </button>

        </form>
      </div>

    </div>
  );
}
