import { useState, useEffect } from 'react';
import { Search, Filter, Loader } from 'lucide-react';
import JobCard from '../components/JobCard';
import ApplyModal from '../components/ApplyModal';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data);
        setFilteredJobs(data);
      })
      .catch(err => console.error('Failed to load jobs', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'All') {
      filtered = filtered.filter(job => job.type === selectedType);
    }

    if (selectedDept !== 'All') {
      filtered = filtered.filter(job => job.department === selectedDept);
    }

    setFilteredJobs(filtered);
  }, [searchTerm, selectedType, selectedDept, jobs]);

  const jobTypes = ['All', ...new Set(jobs.map(j => j.type))];
  const departments = ['All', ...new Set(jobs.map(j => j.department))];

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  return (
    <div className="container-width animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#000000',
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Career Opportunities
        </h1>
        <p style={{ color: '#4b5563', fontSize: '1.05rem' }}>
          Join our team and grow with Rancom Technologies
        </p>
      </div>

      {/* Search & Filters */}
      <div style={{ marginBottom: '2rem' }}>
        {/* Search Bar */}
        <div style={{
          marginBottom: '1.5rem',
          position: 'relative',
        }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search jobs by title or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 2.75rem',
              background: 'white',
              border: '1px solid rgba(14, 165, 233, 0.2)',
              borderRadius: '10px',
              color: '#000000',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(14, 165, 233, 0.5)';
              e.target.style.background = '#f0f7ff';
              e.target.style.boxShadow = '0 4px 15px rgba(14, 165, 233, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(14, 165, 233, 0.2)';
              e.target.style.background = 'white';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
            }}
          />
        </div>

        {/* Filter Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {/* Job Type Filter */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#000000',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}>
              <Filter size={16} /> Job Type
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {jobTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: selectedType === type
                      ? '2px solid #0ea5e9'
                      : '1px solid rgba(14, 165, 233, 0.2)',
                    background: selectedType === type
                      ? 'rgba(14, 165, 233, 0.1)'
                      : 'white',
                    color: selectedType === type ? '#0ea5e9' : '#4b5563',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#000000',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}>
              <Filter size={16} /> Department
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: selectedDept === dept
                      ? '2px solid #06b6d4'
                      : '1px solid rgba(14, 165, 233, 0.2)',
                    background: selectedDept === dept
                      ? 'rgba(6, 182, 212, 0.1)'
                      : 'white',
                    color: selectedDept === dept ? '#06b6d4' : '#4b5563',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: '1rem',
        }}>
          <Loader size={32} style={{ color: '#0ea5e9', animation: 'spin 1s linear infinite' }} />
          <span style={{ color: '#4b5563', fontSize: '1.05rem' }}>
            Loading opportunities...
          </span>
        </div>
      ) : filteredJobs.length > 0 ? (
        <>
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'rgba(14, 165, 233, 0.08)',
            borderRadius: '8px',
            borderLeft: '3px solid #0ea5e9',
          }}>
            <p style={{ color: '#4b5563', margin: 0, fontWeight: 500 }}>
              Found <strong style={{ color: '#0ea5e9' }}>{filteredJobs.length}</strong> position{filteredJobs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {filteredJobs.map(job => (
              <JobCard
                key={job._id}
                job={job}
                onApply={() => handleApply(job)}
              />
            ))}
          </div>
        </>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            opacity: '0.3',
          }}>
            🔍
          </div>
          <h3 style={{ color: '#000000', fontSize: '1.25rem', fontWeight: 600 }}>
            No jobs found
          </h3>
          <p style={{ color: '#4b5563', marginTop: '0.5rem' }}>
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Apply Modal */}
      {showModal && selectedJob && (
        <ApplyModal job={selectedJob} onClose={closeModal} />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
