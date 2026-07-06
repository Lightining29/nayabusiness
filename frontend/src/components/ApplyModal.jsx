import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Briefcase, MapPin, Clock, DollarSign, Send, Loader, CheckCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';

export default function ApplyModal({ job, onClose }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setProfileLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setHasResume(!!data.hasResume);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setIsLoggedIn(true); // Default to logged in so backend error is shown if it is a transient error
        setHasResume(false);
      } finally {
        setProfileLoading(false);
      }
    };
    checkProfileStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setResult({ type: 'error', text: 'Please login first to apply for jobs.' });
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/jobs/${job._id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ coverLetter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Application failed');
      setResult({ type: 'success', text: data.message || 'Application submitted successfully!' });
      setCoverLetter('');
      setCharCount(0);
      setTimeout(onClose, 2000);
    } catch (err) {
      setResult({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLetterChange = (e) => {
    setCoverLetter(e.target.value);
    setCharCount(e.target.value.length);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem',
      animation: 'fadeIn 0.3s ease',
    }} onClick={onClose}>
      <div
        style={{
          maxWidth: '560px', width: '100%',
          padding: '2.5rem',
          borderRadius: '16px',
          background: 'white',
          border: '1px solid rgba(14, 165, 233, 0.2)',
          position: 'relative',
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          animation: 'slideUp 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem',
          background: 'rgba(14, 165, 233, 0.08)',
          border: 'none',
          color: '#4b5563',
          cursor: 'pointer',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          zIndex: 10,
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(14, 165, 233, 0.15)';
          e.target.style.color = '#0ea5e9';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(14, 165, 233, 0.08)';
          e.target.style.color = '#4b5563';
        }}>
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            color: '#000000',
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Apply for Position
          </h2>
          <h3 style={{
            color: '#4b5563',
            fontSize: '1.1rem',
            fontWeight: 600,
            margin: 0,
          }}>
            {job.title}
          </h3>
        </div>

        {/* Job Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '0.75rem',
          marginBottom: '2rem',
          padding: '1.25rem',
          background: 'rgba(14, 165, 233, 0.08)',
          borderRadius: '10px',
          border: '1px solid rgba(14, 165, 233, 0.2)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <Briefcase size={14} style={{ color: '#f97316' }} />
              <span style={{ fontWeight: 500 }}>Department</span>
            </div>
            <p style={{ color: '#000000', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{job.department}</p>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <MapPin size={14} style={{ color: '#f97316' }} />
              <span style={{ fontWeight: 500 }}>Location</span>
            </div>
            <p style={{ color: '#000000', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{job.location}</p>
          </div>
          {job.experience && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <Clock size={14} style={{ color: '#8b5cf6' }} />
                <span style={{ fontWeight: 500 }}>Experience</span>
              </div>
              <p style={{ color: '#000000', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{job.experience}</p>
            </div>
          )}
          {job.salary && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <DollarSign size={14} style={{ color: '#10b981' }} />
                <span style={{ fontWeight: 500 }}>Salary</span>
              </div>
              <p style={{ color: '#000000', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{job.salary}</p>
            </div>
          )}
        </div>

        {/* Profile Validation States */}
        {profileLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1rem',
            textAlign: 'center'
          }}>
            <Loader size={36} style={{ animation: 'spin 1s linear infinite', color: '#0ea5e9', marginBottom: '1rem' }} />
            <p style={{ color: '#4b5563', fontSize: '1rem', fontWeight: 500, margin: 0 }}>Checking application requirements...</p>
          </div>
        ) : !isLoggedIn ? (
          <div style={{
            padding: '2.5rem 1.5rem',
            background: 'rgba(239, 68, 68, 0.03)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '1rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            <AlertCircle size={44} style={{ color: '#ef4444', marginBottom: '1.25rem' }} />
            <h4 style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.75rem 0' }}>Login Required</h4>
            <p style={{ color: '#4b5563', fontSize: '0.975rem', margin: '0 0 1.75rem 0', lineHeight: 1.6 }}>
              You need to sign in to your account before you can apply for career positions.
            </p>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.75rem',
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: 'white',
                borderRadius: '10px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 20px rgba(14, 165, 233, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #0ea5e9, #0284c7)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Go to Login <ArrowRight size={16} />
            </Link>
          </div>
        ) : !hasResume ? (
          <div style={{
            padding: '2.5rem 1.5rem',
            background: 'rgba(249, 115, 22, 0.03)',
            border: '1px solid rgba(249, 115, 22, 0.15)',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '1rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            <FileText size={44} style={{ color: '#f97316', marginBottom: '1.25rem' }} />
            <h4 style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.75rem 0' }}>Resume Required</h4>
            <p style={{ color: '#4b5563', fontSize: '0.975rem', margin: '0 0 1.75rem 0', lineHeight: 1.6 }}>
              Please upload or update your resume in the profile section before submitting your application.
            </p>
            <Link
              to="/profile"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.75rem',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: 'white',
                borderRadius: '10px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #ea580c, #c2410c)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 20px rgba(249, 115, 22, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #f97316, #ea580c)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Go to Profile <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* Messages */}
            {result && (
              <div style={{
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                ...(result.type === 'success' ? {
                  color: '#10b981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                } : {
                  color: '#f87171',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }),
              }}>
                {result.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
                {result.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#000000',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                  }}>
                    Cover Letter (optional)
                  </label>
                  <span style={{ color: '#4b5563', fontSize: '0.85rem' }}>
                    {charCount} / 1000
                  </span>
                </div>
                <textarea
                  maxLength={1000}
                  rows="6"
                  placeholder="Tell us why you're a great fit for this role..."
                  value={coverLetter}
                  onChange={handleLetterChange}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    background: 'white',
                    border: '1px solid rgba(14, 165, 233, 0.2)',
                    borderRadius: '10px',
                    color: '#000000',
                    fontSize: '0.95rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(14, 165, 233, 0.5)';
                    e.target.style.background = '#f0f7ff';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(14, 165, 233, 0.2)';
                    e.target.style.background = 'white';
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: loading
                    ? 'rgba(14, 165, 233, 0.5)'
                    : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 20px rgba(14, 165, 233, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = 'linear-gradient(135deg, #0ea5e9, #0284c7)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Application
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
