import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Briefcase, Users, Mail, PlusCircle, Trash2, ToggleLeft, ToggleRight, LogOut, CheckCircle, AlertCircle, ChevronDown, ChevronUp, MapPin, Clock, DollarSign, Edit } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Auth check
  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const [activeTab, setActiveTab] = useState('jobs');
  
  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  
  // Applications state
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const [editJob, setEditJob] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editJobLoading, setEditJobLoading] = useState(false);
  const [editJobMsg, setEditJobMsg] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '', department: '', location: '', type: 'Full-Time',
    experience: '', salary: '', description: '', requirements: ''
  });
  const [jobFormLoading, setJobFormLoading] = useState(false);
  const [jobFormMsg, setJobFormMsg] = useState(null);

  // Fetch data
  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data);
    } catch { setJobs([]); }
    finally { setJobsLoading(false); }
  };

  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const res = await fetch('/api/admin/applications');
      const data = await res.json();
      setApplications(data);
    } catch { setApplications([]); }
    finally { setAppsLoading(false); }
  };

  const fetchContacts = async () => {
    setContactsLoading(true);
    try {
      const res = await fetch('/api/admin/contacts');
      const data = await res.json();
      setContacts(data);
    } catch { setContacts([]); }
    finally { setContactsLoading(false); }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchContacts();
  }, []);

  // Create job
  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.department || !jobForm.location || !jobForm.description) {
      setJobFormMsg({ type: 'error', text: 'Title, Department, Location and Description are required.' });
      return;
    }
    setJobFormLoading(true);
    setJobFormMsg(null);
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJobFormMsg({ type: 'success', text: data.message });
      setJobForm({ title: '', department: '', location: '', type: 'Full-Time', experience: '', salary: '', description: '', requirements: '' });
      fetchJobs();
    } catch (err) {
      setJobFormMsg({ type: 'error', text: err.message });
    } finally {
      setJobFormLoading(false);
    }
  };

  // Toggle job
  const toggleJob = async (id) => {
    try {
      await fetch(`/api/admin/jobs/${id}`, { method: 'PATCH' });
      fetchJobs();
    } catch (err) { console.error(err); }
  };

  // Update job handler
  const handleUpdateJob = async (e) => {
    e.preventDefault();
    if (!editJob) return;
    setEditJobLoading(true);
    setEditJobMsg(null);
    try {
      const res = await fetch(`/api/admin/jobs/${editJob._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editJob),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      toast.success('Job updated successfully');
      setShowEditForm(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.message || 'Failed to update job');
      setEditJobMsg({ type: 'error', text: err.message });
    } finally {
      setEditJobLoading(false);
    }
  };
  const deleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this job posting?')) return;
    try {
      await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
      fetchJobs();
    } catch (err) { console.error(err); }
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const tabs = [
    { id: 'jobs', label: 'Job Postings', icon: <Briefcase size={18} />, count: jobs.length },
    { id: 'applications', label: 'Applications', icon: <Users size={18} />, count: applications.length },
    { id: 'contacts', label: 'Contact Messages', icon: <Mail size={18} />, count: contacts.length }
  ];

  return (
    <div className="container-width animate-fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem; }
        .admin-tabs { display: flex; gap: 0.5rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
        .admin-tab {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1.25rem; border-radius: 10px;
          font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease;
          background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); color: var(--text-secondary);
        }
        .admin-tab:hover { color: white; background: rgba(255,255,255,0.06); }
        .admin-tab.active { color: white; background: rgba(59,130,246,0.15); border-color: var(--primary); }
        .tab-badge {
          background: rgba(59,130,246,0.2); color: var(--primary); font-size: 0.75rem; font-weight: 700;
          padding: 0.15rem 0.5rem; border-radius: 20px; min-width: 22px; text-align: center;
        }
        .admin-tab.active .tab-badge { background: var(--primary); color: white; }
        .data-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border-color); }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .data-table th {
          padding: 0.85rem 1.25rem; text-align: left; font-weight: 700; font-size: 0.8rem;
          text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);
          background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border-color);
        }
        .data-table td {
          padding: 0.85rem 1.25rem; border-bottom: 1px solid var(--border-color);
          color: var(--text-secondary); vertical-align: top;
        }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: rgba(59,130,246,0.03); }
        .status-active { color: var(--accent); font-weight: 700; }
        .status-inactive { color: #f87171; font-weight: 700; }
        .action-btn {
          background: none; border: none; cursor: pointer; padding: 0.35rem; border-radius: 6px;
          transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center;
        }
        .action-btn:hover { background: rgba(255,255,255,0.08); }
        .action-btn.danger:hover { background: rgba(239,68,68,0.12); }
        .job-card {
          background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 14px;
          padding: 1.75rem; transition: all 0.2s; position: relative; overflow: hidden;
        }
        .job-card:hover { border-color: rgba(59,130,246,0.2); }
        .job-type-badge {
          display: inline-block; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem;
          border-radius: 6px; background: rgba(6,182,212,0.12); color: var(--secondary); border: 1px solid rgba(6,182,212,0.2);
        }
        .job-meta { display: flex; gap: 1.25rem; color: var(--text-muted); font-size: 0.85rem; margin: 0.75rem 0; flex-wrap: wrap; }
        .job-meta-item { display: flex; align-items: center; gap: 0.3rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
        .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-muted); }
        .empty-state-icon { opacity: 0.3; margin-bottom: 1rem; }
      `}} />

      <Toaster position="top-right" />

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage job postings, view applications, and review contact messages.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Active Jobs', value: jobs.filter(j => j.isActive).length, color: 'var(--accent)' },
          { label: 'Total Applications', value: applications.length, color: 'var(--primary)' },
          { label: 'Contact Messages', value: contacts.length, color: 'var(--secondary)' }
        ].map((stat, i) => (
          <div key={i} className="glass" style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: `3px solid ${stat.color}` }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{stat.label}</p>
            <h2 style={{ color: 'white', fontSize: '2rem', fontWeight: 800 }}>{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        {tabs.map(tab => (
          <button key={tab.id} className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            {tab.icon}
            <span>{tab.label}</span>
            <span className="tab-badge">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ========================= JOBS TAB ========================= */}
      {activeTab === 'jobs' && (
        <div>
          {/* Create Job Toggle */}
          <button
            className="btn btn-primary"
            style={{ marginBottom: '2rem', gap: '0.4rem' }}
            onClick={() => setShowJobForm(!showJobForm)}
          >
            {showJobForm ? <ChevronUp size={18} /> : <PlusCircle size={18} />}
            {showJobForm ? 'Hide Form' : 'Create New Job'}
          </button>

          {/* Create Job Form */}
          {showJobForm && (
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid var(--border-color)' }}>
              <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.75rem' }}>New Job Posting</h3>

              {jobFormMsg && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600,
                  color: jobFormMsg.type === 'success' ? 'var(--accent)' : '#f87171',
                  background: jobFormMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${jobFormMsg.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                }}>
                  {jobFormMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{jobFormMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateJob}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input className="form-input" placeholder="e.g. RF Engineer" required value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Department *</label>
                    <input className="form-input" placeholder="e.g. Telecom Division" required value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location *</label>
                    <input className="form-input" placeholder="e.g. Noida, UP" required value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Job Type</label>
                    <select className="form-input" value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}>
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Experience Required</label>
                    <input className="form-input" placeholder="e.g. 2-5 years" value={jobForm.experience} onChange={e => setJobForm({...jobForm, experience: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Salary Range</label>
                    <input className="form-input" placeholder="e.g. ₹5L - ₹10L per annum" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea className="form-input" placeholder="Detailed job description..." required style={{ minHeight: '120px' }} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Requirements</label>
                  <textarea className="form-input" placeholder="Required skills and qualifications..." style={{ minHeight: '100px' }} value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-accent" style={{ padding: '0.75rem 2rem' }} disabled={jobFormLoading}>
                  {jobFormLoading ? 'Publishing...' : 'Publish Job'}
                </button>
              </form>
            </div>
          )}

          {/* Edit Job Form (conditionally rendered) */}
          {showEditForm && editJob && (
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid var(--border-color)' }}>
              <h3 style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.75rem' }}>Edit Job Posting</h3>
              {editJobMsg && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600,
                             color: editJobMsg.type === 'success' ? 'var(--accent)' : '#f87171',
                             background: editJobMsg.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                             border: `1px solid ${editJobMsg.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  {editJobMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{editJobMsg.text}</span>
                </div>
              )}
              <form onSubmit={handleUpdateJob}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input className="form-input" required value={editJob.title} onChange={e => setEditJob({ ...editJob, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Department *</label>
                    <input className="form-input" required value={editJob.department} onChange={e => setEditJob({ ...editJob, department: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Location *</label>
                    <input className="form-input" required value={editJob.location} onChange={e => setEditJob({ ...editJob, location: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Job Type</label>
                    <select className="form-input" value={editJob.type} onChange={e => setEditJob({ ...editJob, type: e.target.value })}>
                      <option>Full-Time</option>
                      <option>Part-Time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Experience Required</label>
                    <input className="form-input" value={editJob.experience} onChange={e => setEditJob({ ...editJob, experience: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Salary Range</label>
                    <input className="form-input" value={editJob.salary} onChange={e => setEditJob({ ...editJob, salary: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea className="form-input" required style={{ minHeight: '120px' }} value={editJob.description} onChange={e => setEditJob({ ...editJob, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Requirements</label>
                  <textarea className="form-input" style={{ minHeight: '100px' }} value={editJob.requirements} onChange={e => setEditJob({ ...editJob, requirements: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-accent" disabled={editJobLoading} style={{ padding: '0.75rem 2rem' }}>
                  {editJobLoading ? 'Updating...' : 'Update Job'}
                </button>
                <button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem', padding: '0.75rem 2rem' }} onClick={() => setShowEditForm(false)}>
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Jobs List */}
          {jobsLoading ? (
            <div className="empty-state">Loading job postings...</div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <Briefcase size={48} className="empty-state-icon" />
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No job postings yet</p>
              <p style={{ fontSize: '0.9rem' }}>Create your first job posting using the button above.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {jobs.map(job => (
                <div key={job._id} className="job-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>{job.title}</h3>
                        <span className="job-type-badge">{job.type}</span>
                        <span className={job.isActive ? 'status-active' : 'status-inactive'} style={{ fontSize: '0.8rem' }}>
                          ● {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="job-meta">
                        <span className="job-meta-item"><Briefcase size={14} /> {job.department}</span>
                        <span className="job-meta-item"><MapPin size={14} /> {job.location}</span>
                        {job.experience && <span className="job-meta-item"><Clock size={14} /> {job.experience}</span>}
                        {job.salary && <span className="job-meta-item"><DollarSign size={14} /> {job.salary}</span>}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        {job.description.length > 200 ? job.description.substring(0, 200) + '...' : job.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <button className="action-btn" title="Edit" onClick={() => { setEditJob(job); setShowEditForm(true); }} style={{ color: '#60a5fa' }}>
                        <Edit size={20} />
                      </button>
                      <button className="action-btn" title={job.isActive ? 'Deactivate' : 'Activate'} onClick={() => toggleJob(job._id)}
                        style={{ color: job.isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
                        {job.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                      </button>
                      <button className="action-btn danger" title="Delete" onClick={() => deleteJob(job._id)} style={{ color: '#f87171' }}>
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== APPLICATIONS TAB ==================== */}
      {activeTab === 'applications' && (
        <div>
          {appsLoading ? (
            <div className="empty-state">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <Users size={48} className="empty-state-icon" />
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No applications received yet</p>
              <p style={{ fontSize: '0.9rem' }}>Applications will appear here when candidates register.</p>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Qualification</th>
                    <th>City</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, idx) => (
                    <tr key={app._id}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ color: 'white', fontWeight: 600 }}>{app.first_name} {app.last_name}</td>
                      <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{app.job_title || 'General Application'}</td>
                      <td><a href={`mailto:${app.email}`} style={{ color: 'var(--primary)' }}>{app.email}</a></td>
                      <td>{app.mobno}</td>
                      <td>{app.qualification}</td>
                      <td>{app.city}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== CONTACTS TAB ==================== */}
      {activeTab === 'contacts' && (
        <div>
          {contactsLoading ? (
            <div className="empty-state">Loading messages...</div>
          ) : contacts.length === 0 ? (
            <div className="empty-state">
              <Mail size={48} className="empty-state-icon" />
              <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No contact messages yet</p>
              <p style={{ fontSize: '0.9rem' }}>Messages from the contact form will appear here.</p>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Message</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((msg, idx) => (
                    <tr key={msg._id}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ color: 'white', fontWeight: 600 }}>{msg.name}</td>
                      <td>{msg.subject}</td>
                      <td><a href={`mailto:${msg.email}`} style={{ color: 'var(--primary)' }}>{msg.email}</a></td>
                      <td>{msg.tel}</td>
                      <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.msg}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(msg.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
