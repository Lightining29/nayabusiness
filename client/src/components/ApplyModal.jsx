import React, { useState } from 'react';
import { X, Briefcase, MapPin, Clock, DollarSign, Send } from 'lucide-react';

export default function ApplyModal({ job, onClose }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
    } catch (err) {
      setResult({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem',
    }} onClick={onClose}>
      <div
        className="glass"
        style={{
          maxWidth: '540px', width: '100%', padding: '2rem', borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)', position: 'relative',
          maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: '1rem', right: '1rem', background: 'none',
          border: 'none', color: 'var(--text-muted, #94a3b8)', cursor: 'pointer',
        }}><X size={20} /></button>

        <h2 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Apply for Position
        </h2>
        <h3 style={{ color: 'var(--primary, #3b82f6)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
          {job.title}
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Briefcase size={14} /> {job.department}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {job.location}</span>
          {job.experience && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {job.experience}</span>}
          {job.salary && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><DollarSign size={14} /> {job.salary}</span>}
        </div>

        {result && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600,
            color: result.type === 'success' ? 'var(--accent, #10b981)' : '#f87171',
            background: result.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${result.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            {result.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Cover Letter (optional)</label>
            <textarea
              className="form-input"
              rows="5"
              placeholder="Tell us why you're a great fit for this role..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <Send size={16} />
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
