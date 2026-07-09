import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Briefcase, MapPin, Clock, DollarSign, MailCheck, UserCheck, X, ShieldCheck, Lock, Phone, Mail } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { canUseDemoGoogleLogin, createMockGoogleCredential, renderGoogleSignInButton } from '../utils/googleAuth';

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobno, setMobno] = useState('');
  const [qualification, setQualification] = useState('');
  const [city, setCity] = useState('');
  const [resume, setResume] = useState(null);
  const [password, setPassword] = useState('');
  const [skills, setSkills] = useState('');
  const [selectedJob, setSelectedJob] = useState('General Application');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Google OAuth states for register
  const [showGoogleRegisterModal, setShowGoogleRegisterModal] = useState(false);
  const [googleRegisterData, setGoogleRegisterData] = useState({
    credential: '',
    email: '',
    name: '',
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
    city: '',
    qualification: '',
    skills: '',
    job_title: 'General Application'
  });

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        setJobs(data.filter(j => j.isActive));
      } catch { setJobs([]); }
      finally { setJobsLoading(false); }
    };
    fetchJobs();
  }, []);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setMobno('');
    setQualification('');
    setCity('');
    setResume(null);
    setPassword('');
    setSkills('');
    setSelectedJob('General Application');
  };

  const validateRegistrationFields = () => {
    if (!firstName || !lastName || !email || !mobno || !qualification || !city || !resume || !password) {
      return 'Please fill in all inputs and create a password.';
    }
    return '';
  };

  const requestEmailOtp = async () => {
    await apiRequest('/api/register/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        mobno
      })
    });

    // Redirect to the OTP verification page with the registration details
    navigate('/verify-otp', {
      state: {
        first_name: firstName,
        last_name: lastName,
        email,
        mobno,
        qualification,
        city,
        resume,
        password,
        skills,
        job_title: selectedJob
      }
    });
  };

  const processGoogleRegister = async (credential) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });

      if (data.token) {
        // Already registered — log them in
        localStorage.setItem('token', data.token);
        window.dispatchEvent(new Event('auth-change'));
        setSuccess('Already registered! Logging you in...');
        setTimeout(() => navigate('/profile'), 1000);
      } else if (data.registerRequired) {
        // Split name into first/last
        const parts = (data.name || '').trim().split(' ');
        setGoogleRegisterData({
          credential,
          email: data.email,
          name: data.name,
          firstName: parts[0] || '',
          lastName: parts.slice(1).join(' ') || '',
          password: '',
          phone: '',
          city: '',
          qualification: '',
          skills: '',
          job_title: selectedJob
        });
        setShowGoogleRegisterModal(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { credential, firstName, lastName, password, phone, city, qualification, skills, job_title } = googleRegisterData;
    if (!password || !city) {
      setError('Password and city are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/api/auth/google/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, password, phone, city, firstName, lastName, qualification, skills, job_title })
      });
      setShowGoogleRegisterModal(false);
      localStorage.setItem('token', data.token);
      window.dispatchEvent(new Event('auth-change'));
      setSuccess('Registered with Google successfully! Redirecting...');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMockGoogleRegister = () => {
    const testEmail = prompt('Enter a test email:', 'test-user@gmail.com');
    if (!testEmail) return;
    const testName = prompt('Enter a test name:', 'Test User');
    if (!testName) return;
    processGoogleRegister(createMockGoogleCredential(testEmail, testName));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const validationError = validateRegistrationFields();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await requestEmailOtp();
    } catch (err) {
      setError(err.message || 'Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render Google Sign-In button for Register page
  useEffect(() => {
    let cancelled = false;
    renderGoogleSignInButton({
      elementId: 'google-register-btn',
      onCredential: (credential) => { if (!cancelled) processGoogleRegister(credential); },
      onError: (message) => { if (!cancelled) setError(message); }
    });
    return () => {
      cancelled = true;
      const el = document.getElementById('google-register-btn');
      if (el) el.innerHTML = '';
    };
  }, []);

  return (
    <div className="container-width animate-fade-in" style={{ paddingTop: '4rem' }}>
      
      <div className="text-center">
        <h1 className="section-title">Career Opportunities</h1>
        <p className="section-subtitle">
          Join a leading team of telecom engineers, RF analysts, and full-stack software developers. Browse open positions and register below.
        </p>
      </div>

      {/* Available Jobs Section */}
      {!jobsLoading && jobs.length > 0 && (
        <div style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#000000', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={22} style={{ color: 'var(--primary)' }} /> Open Positions
          </h2>

          <style dangerouslySetInnerHTML={{__html: `
            .open-jobs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.25rem; }
            @media (max-width: 480px) { .open-jobs-grid { grid-template-columns: 1fr; } }
            .open-job-card {
              background: white; border: 1px solid rgba(14, 165, 233, 0.2); border-radius: 14px;
              padding: 1.75rem; transition: all 0.25s ease;
            }
            .open-job-card:hover { border-color: rgba(14,165,233,0.5); transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
            .open-job-type {
              display: inline-block; font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.5rem;
              border-radius: 5px; background: rgba(6,182,212,0.12); color: var(--secondary); border: 1px solid rgba(6,182,212,0.2);
            }
            .open-job-meta { display: flex; flex-wrap: wrap; gap: 1rem; margin: 0.75rem 0 1rem; color: #666666; font-size: 0.85rem; }
            .open-job-meta-item { display: flex; align-items: center; gap: 0.25rem; }
          `}} />

          <div className="open-jobs-grid">
            {jobs.map(job => (
              <div key={job._id} className="open-job-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <h3 style={{ color: '#000000', fontSize: '1.15rem', fontWeight: 700 }}>{job.title}</h3>
                  <span className="open-job-type">{job.type}</span>
                </div>
                <div className="open-job-meta">
                  <span className="open-job-meta-item"><Briefcase size={14} /> {job.department}</span>
                  <span className="open-job-meta-item"><MapPin size={14} /> {job.location}</span>
                  {job.experience && <span className="open-job-meta-item"><Clock size={14} /> {job.experience}</span>}
                  {job.salary && <span className="open-job-meta-item"><DollarSign size={14} /> {job.salary}</span>}
                </div>
                <p style={{ color: '#333333', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description}
                </p>
                {job.requirements && (
                  <p style={{ color: '#666666', fontSize: '0.82rem', marginTop: '0.75rem', fontStyle: 'italic' }}>
                    Requirements: {job.requirements.length > 100 ? job.requirements.substring(0, 100) + '...' : job.requirements}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Registration Form */}
      <div className="form-card glass" style={{ background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <UserCheck size={28} style={{ color: 'var(--secondary)' }} />
          <h2 style={{ color: '#000000', fontSize: '1.75rem', fontWeight: 800 }}>Job Registration Form</h2>
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
          <div className="form-group">
            <label style={{ color: '#000000' }}>Position Applied For</label>
            <select
              className="form-input"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              disabled={loading}
            >
              <option value="General Application">General Application (No Specific Job)</option>
              {jobs.map(job => (
                <option key={job._id} value={job.title}>
                  {job.title} ({job.department} - {job.location})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label style={{ color: '#000000' }}>First Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label style={{ color: '#000000' }}>Last Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: '#000000' }}>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter Your Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label style={{ color: '#000000' }}>Mobile Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Your Mobile No."
              required
              value={mobno}
              onChange={(e) => setMobno(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label style={{ color: '#000000' }}>Highest Qualification</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. B.Tech ECE, MCA, BS Computer Science"
              required
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label style={{ color: '#000000' }}>City</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter Your City"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Resume</label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setResume(e.target.files[0] || null)}
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="form-input"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Skills</label>
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="List your technical skills, frameworks, and tools..."
              className="form-textarea"
              rows={4}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Sending OTP...' : 'Send Email OTP'}
          </button>

        </form>

        {/* Google Sign-Up divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>or register with Google</span>
          <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', minHeight: '44px' }}>
          <div id="google-register-btn" style={{ width: '100%', maxWidth: '400px' }}></div>
        </div>

        {canUseDemoGoogleLogin && (
          <button
            type="button"
            onClick={handleMockGoogleRegister}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              width: '100%', marginTop: '0.75rem', padding: '11px 16px', borderRadius: '12px',
              border: '1.5px dashed #cbd5e1', background: '#f8fafc',
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              fontSize: '0.9rem', fontWeight: 600, color: '#475569',
              transition: 'all 0.2s ease', opacity: loading ? 0.6 : 1
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
            Demo Google Register (Dev only)
          </button>
        )}

      </div>

      {/* Google Registration Modal */}
      {showGoogleRegisterModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem', overflowY: 'auto'
        }}>
          <div style={{
            background: 'white', maxWidth: '500px', width: '100%', padding: '2.5rem',
            borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            position: 'relative', margin: 'auto'
          }}>
            <button onClick={() => setShowGoogleRegisterModal(false)} style={{
              position: 'absolute', top: '1rem', right: '1rem',
              border: 'none', background: 'transparent', cursor: 'pointer', color: '#9ca3af'
            }}>
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <ShieldCheck size={28} style={{ color: 'var(--secondary)' }} />
              <h2 style={{ color: '#000000', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>Complete Your Application</h2>
            </div>
            <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Welcome <strong>{googleRegisterData.name}</strong>! Your Google email is verified. Please fill in your job application details below.
            </p>

            {error && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: 600 }}>
                <AlertCircle size={16} /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleGoogleRegisterSubmit}>
              {/* Google-verified email (read-only) */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.83rem', color: '#374151', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Mail size={13} /> Email (Google verified)
                </label>
                <input type="text" className="form-input" value={googleRegisterData.email} disabled style={{ background: '#f3f4f6', color: '#6b7280' }} />
              </div>

              {/* Position */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.83rem', color: '#374151', fontWeight: 600 }}>Position Applied For</label>
                <select className="form-input" value={googleRegisterData.job_title}
                  onChange={e => setGoogleRegisterData({ ...googleRegisterData, job_title: e.target.value })}>
                  <option value="General Application">General Application (No Specific Job)</option>
                  {jobs.map(job => (
                    <option key={job._id} value={job.title}>{job.title} ({job.department} - {job.location})</option>
                  ))}
                </select>
              </div>

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.83rem', color: '#374151', fontWeight: 600 }}>First Name</label>
                  <input type="text" className="form-input" placeholder="First Name" required
                    value={googleRegisterData.firstName}
                    onChange={e => setGoogleRegisterData({ ...googleRegisterData, firstName: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.83rem', color: '#374151', fontWeight: 600 }}>Last Name</label>
                  <input type="text" className="form-input" placeholder="Last Name" required
                    value={googleRegisterData.lastName}
                    onChange={e => setGoogleRegisterData({ ...googleRegisterData, lastName: e.target.value })} />
                </div>
              </div>

              {/* Phone + City row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.83rem', color: '#374151', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={13} /> Phone <span style={{ color:'#94a3b8', fontWeight:400 }}>(optional)</span></label>
                  <input type="text" className="form-input" placeholder="Mobile number (optional)"
                    value={googleRegisterData.phone}
                    onChange={e => setGoogleRegisterData({ ...googleRegisterData, phone: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.83rem', color: '#374151', fontWeight: 600 }}>City</label>
                  <input type="text" className="form-input" placeholder="Your city" required
                    value={googleRegisterData.city}
                    onChange={e => setGoogleRegisterData({ ...googleRegisterData, city: e.target.value })} />
                </div>
              </div>

              {/* Qualification */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.83rem', color: '#374151', fontWeight: 600 }}>Highest Qualification</label>
                <input type="text" className="form-input" placeholder="e.g. B.Tech ECE, MCA"
                  value={googleRegisterData.qualification}
                  onChange={e => setGoogleRegisterData({ ...googleRegisterData, qualification: e.target.value })} />
              </div>

              {/* Skills */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.83rem', color: '#374151', fontWeight: 600 }}>Skills</label>
                <textarea className="form-textarea" rows={3} placeholder="List your skills..."
                  value={googleRegisterData.skills}
                  onChange={e => setGoogleRegisterData({ ...googleRegisterData, skills: e.target.value })} />
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.83rem', color: '#374151', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Lock size={13} /> Create Password <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: '0.78rem' }}>(for email/password login)</span>
                </label>
                <input type="password" className="form-input" placeholder="Create a secure password" required
                  value={googleRegisterData.password}
                  onChange={e => setGoogleRegisterData({ ...googleRegisterData, password: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }} disabled={loading}>
                {loading ? 'Submitting...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
