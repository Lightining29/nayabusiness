import React, { useEffect, useState } from 'react';
import axios from 'axios';
import JobCard from '../components/JobCard';
import ApplyModal from '../components/ApplyModal';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch active jobs from backend
    axios.get(`${import.meta.env.VITE_API_URL || ''}/api/jobs`)
      .then(res => setJobs(res.data))
      .catch(err => console.error('Failed to load jobs', err));
  }, []);

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  return (
    <div className="jobs-page">
      <h1 className="jobs-title">Career Opportunities</h1>
      <div className="jobs-grid">
        {jobs.map(job => (
          <JobCard key={job._id} job={job} onApply={() => handleApply(job)} />
        ))}
      </div>
      {showModal && selectedJob && (
        <ApplyModal job={selectedJob} onClose={closeModal} />
      )}
    </div>
  );
};

export default Jobs;
