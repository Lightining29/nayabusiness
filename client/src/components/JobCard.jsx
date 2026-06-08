import React from 'react';
import { Briefcase, MapPin, Clock, DollarSign } from 'lucide-react';

export default function JobCard({ job, onApply }) {
  return (
    <div className="glass" style={{
      padding: '1.75rem',
      borderRadius: '14px',
      transition: 'all 0.25s ease',
      cursor: 'default',
      border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
        <h3 style={{ color: 'white', fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{job.title}</h3>
        <span style={{
          display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem',
          borderRadius: '5px', background: 'rgba(6,182,212,0.12)', color: 'var(--secondary, #06b6d4)',
          border: '1px solid rgba(6,182,212,0.2)',
        }}>{job.type}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '0.75rem 0 1rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Briefcase size={14} /> {job.department}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {job.location}</span>
        {job.experience && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {job.experience}</span>}
        {job.salary && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><DollarSign size={14} /> {job.salary}</span>}
      </div>

      <p style={{ color: 'var(--text-secondary, #cbd5e1)', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
        {job.description && job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description}
      </p>

      {job.requirements && (
        <p style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.82rem', fontStyle: 'italic', margin: '0 0 1rem 0' }}>
          Requirements: {job.requirements.length > 100 ? job.requirements.substring(0, 100) + '...' : job.requirements}
        </p>
      )}

      <button
        className="btn btn-primary"
        onClick={onApply}
        style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
      >
        Apply Now
      </button>
    </div>
  );
}
