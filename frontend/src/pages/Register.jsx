import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Briefcase, MapPin, Clock, DollarSign, MailCheck, UserCheck } from 'lucide-react';
import { apiRequest } from '../utils/api';

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
      </div>

    </div>
  );
}
