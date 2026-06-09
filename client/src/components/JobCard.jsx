import { Briefcase, MapPin, Clock, DollarSign, ArrowRight } from 'lucide-react';

export default function JobCard({ job, onApply }) {
  return (
    <div style={{
      padding: '1.75rem',
      borderRadius: '14px',
      background: 'rgba(30, 41, 59, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(148, 163, 184, 0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
      e.currentTarget.style.background = 'rgba(30, 41, 59, 1)';
      e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.15)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
      e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      {/* Background accent */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '120px',
        height: '120px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header with title and badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
          <div>
            <h3 style={{ 
              color: 'white', 
              fontSize: '1.3rem', 
              fontWeight: 700, 
              margin: '0 0 0.4rem 0',
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {job.title}
            </h3>
            <p style={{ color: 'rgba(148, 163, 184, 0.8)', fontSize: '0.85rem', margin: 0 }}>
              {job.department}
            </p>
          </div>
          <span style={{
            display: 'inline-block', 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            padding: '0.4rem 0.8rem',
            borderRadius: '8px', 
            background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59, 130, 246, 0.2))',
            color: '#06b6d4',
            border: '1px solid rgba(6,182,212,0.4)',
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {job.type}
          </span>
        </div>

        {/* Details grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem', 
          margin: '1.25rem 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(148, 163, 184, 0.9)', fontSize: '0.85rem' }}>
            <MapPin size={16} style={{ color: '#f97316' }} />
            <span>{job.location}</span>
          </div>
          {job.experience && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(148, 163, 184, 0.9)', fontSize: '0.85rem' }}>
              <Clock size={16} style={{ color: '#8b5cf6' }} />
              <span>{job.experience}</span>
            </div>
          )}
          {job.salary && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(148, 163, 184, 0.9)', fontSize: '0.85rem' }}>
              <DollarSign size={16} style={{ color: '#10b981' }} />
              <span>{job.salary}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p style={{ 
          color: 'rgba(203, 213, 225, 0.9)', 
          fontSize: '0.9rem', 
          lineHeight: '1.6', 
          margin: '1rem 0',
          minHeight: '3rem',
        }}>
          {job.description && job.description.length > 150 
            ? job.description.substring(0, 150) + '...' 
            : job.description}
        </p>

        {/* Requirements */}
        {job.requirements && (
          <div style={{ 
            padding: '0.75rem', 
            background: 'rgba(59, 130, 246, 0.08)',
            borderRadius: '8px',
            marginBottom: '1rem',
            borderLeft: '3px solid rgba(59, 130, 246, 0.4)',
          }}>
            <p style={{ 
              color: 'rgba(148, 163, 184, 0.9)', 
              fontSize: '0.82rem', 
              margin: 0,
              fontWeight: 500,
            }}>
              <strong style={{ color: 'rgba(203, 213, 225, 1)' }}>Requirements:</strong> {job.requirements.length > 100 
                ? job.requirements.substring(0, 100) + '...' 
                : job.requirements}
            </p>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={onApply}
          style={{
            width: '100%',
            padding: '0.75rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #2563eb, #1d4ed8)';
            e.target.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
            e.target.style.transform = 'translateX(0)';
          }}
        >
          Apply Now
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
