import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Briefcase, Users, Mail, PlusCircle, Trash2, ToggleLeft, ToggleRight, LogOut, CheckCircle, AlertCircle, ChevronUp, MapPin, Clock, DollarSign, Edit, FileText, Bell } from 'lucide-react';

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

  // Push notification state
  const [notifForm, setNotifForm] = useState({
    title: 'Rancom Technologies',
    body: '',
    icon: '/favicon.svg',
    url: 'https://www.rancomtechnologies.com/',
    topic: 'all'
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifResult, setNotifResult] = useState(null);
  const [subscriberCount, setSubscriberCount] = useState(null);

  const fetchSubscriberCount = async () => {
    try {
      const res = await fetch('/api/notifications/stats');
      if (!res.ok) { setSubscriberCount(0); return; }
      const text = await res.text();
      if (!text) { setSubscriberCount(0); return; }
      const data = JSON.parse(text);
      setSubscriberCount(data.total ?? 0);
    } catch { setSubscriberCount(0); }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifForm.body.trim()) {
      Swal.fire({ icon: 'warning', title: 'Missing Body', text: 'Please enter a notification message.', confirmButtonColor: '#0ea5e9' });
      return;
    }
    setNotifLoading(true);
    setNotifResult(null);
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': sessionStorage.getItem('adminPassword') || 'rancom@2026' },
        body: JSON.stringify(notifForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setNotifResult({ type: 'success', text: data.message });
      Swal.fire({
        icon: 'success', title: '🔔 Notification Sent!',
        text: data.message, confirmButtonColor: '#10b981',
        timer: 3000, timerProgressBar: true, showConfirmButton: false
      });
      setNotifForm(f => ({ ...f, body: '' }));
      fetchSubscriberCount();
    } catch (err) {
      setNotifResult({ type: 'error', text: err.message });
      Swal.fire({ icon: 'error', title: 'Send Failed', text: err.message, confirmButtonColor: '#ef4444' });
    } finally {
      setNotifLoading(false);
    }
  };
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '', department: '', location: '', type: 'Full-Time',
    experience: '', salary: '', description: '', requirements: ''
  });
  const [jobFormLoading, setJobFormLoading] = useState(false);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchJobs();
    fetchApplications();
    fetchContacts();
    fetchSubscriberCount();
  }, []);

  // Create job
  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title || !jobForm.department || !jobForm.location || !jobForm.description) {
      Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Title, Department, Location and Description are required.', confirmButtonColor: '#0ea5e9' });
      return;
    }
    setJobFormLoading(true);
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      Swal.fire({ icon: 'success', title: 'Job Published!', text: data.message, timer: 2500, showConfirmButton: false, timerProgressBar: true });
      setJobForm({ title: '', department: '', location: '', type: 'Full-Time', experience: '', salary: '', description: '', requirements: '' });
      setShowJobForm(false);
      fetchJobs();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message, confirmButtonColor: '#ef4444' });
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
      Swal.fire({ icon: 'success', title: 'Job Updated!', timer: 2000, timerProgressBar: true, showConfirmButton: false, confirmButtonColor: '#10b981' });
      setShowEditForm(false);
      fetchJobs();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: err.message || 'Failed to update job', confirmButtonColor: '#ef4444' });
      setEditJobMsg({ type: 'error', text: err.message });
    } finally {
      setEditJobLoading(false);
    }
  };
  const deleteJob = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Job Posting?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;
    try {
      await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
      fetchJobs();
      Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
    } catch (err) { console.error(err); }
  };

  const openResume = async (application) => {
    if (!application.hasResume) {
      Swal.fire({ icon: 'info', title: 'No Resume', text: 'No resume uploaded for this application.', confirmButtonColor: '#0ea5e9' });
      return;
    }

    Swal.fire({ title: 'Loading resume...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await fetch(`/api/admin/applications/${application._id}/resume`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }
      const blob = await res.blob();
      if (blob.size === 0) throw new Error('Resume file is empty.');
      const blobUrl = URL.createObjectURL(blob);
      const tab = window.open(blobUrl, '_blank');
      if (!tab) {
        const a = document.createElement('a');
        a.href = blobUrl; a.download = application.resumeFileName || 'resume.pdf';
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        Swal.fire({ icon: 'success', title: 'Downloaded!', text: 'Resume downloaded (popup was blocked)', timer: 2500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: 'success', title: 'Opened!', text: 'Resume opened in a new tab.', timer: 2000, showConfirmButton: false, timerProgressBar: true });
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message || 'Could not open resume', confirmButtonColor: '#ef4444' });
    }
  };

  // Interview invite state
  const [interviewModal, setInterviewModal]   = useState(false);
  const [interviewApp,   setInterviewApp]     = useState(null); // selected application
  const [interviewForm,  setInterviewForm]    = useState({
    position: '', interviewDate: '', interviewTime: '', mode: 'online',
    location: '', meetLink: '', interviewers: '', notes: ''
  });
  const [interviewLoading, setInterviewLoading] = useState(false);

  const openInterviewModal = (app) => {
    setInterviewApp(app);
    setInterviewForm({
      position: app.job_title || 'General Application',
      interviewDate: '', interviewTime: '', mode: 'online',
      location: '', meetLink: '', interviewers: '', notes: ''
    });
    setInterviewModal(true);
  };

  const handleSendInterview = async (e) => {
    e.preventDefault();
    setInterviewLoading(true);
    try {
      const res = await fetch('/api/admin/send-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to:   interviewApp.email,
          name: `${interviewApp.first_name} ${interviewApp.last_name}`.trim(),
          ...interviewForm
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.details || data.error || data.message || 'Failed to send interview invitation.');
      setInterviewModal(false);
      const isDevMode = Boolean(data.devMode);
      const isQueued = Boolean(data.queued);
      Swal.fire({
        icon: isDevMode ? 'warning' : 'success',
        title: isDevMode ? 'SMTP Not Configured' : (isQueued ? 'Invitation Sending' : 'Invitation Sent'),
        html: isDevMode
          ? `Interview invite was logged locally, but no email was sent to <strong>${interviewApp.email}</strong>. Configure SMTP settings to send real emails.`
          : `Interview details were sent to <strong>${interviewApp.email}</strong>. If delivery fails, check Render logs for SMTP errors.`,
        timer: 3000, showConfirmButton: false, timerProgressBar: true
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Failed', text: err.message, confirmButtonColor: '#ef4444' });
    } finally { setInterviewLoading(false); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    navigate('/admin');
  };

  const tabs = [
    { id: 'jobs',          label: 'Job Postings',       icon: <Briefcase size={18} />, count: jobs.length },
    { id: 'applications',  label: 'Applications',       icon: <Users size={18} />,     count: applications.length },
    { id: 'contacts',      label: 'Contact Messages',   icon: <Mail size={18} />,      count: contacts.length },
    { id: 'notifications', label: 'Push Notifications', icon: <Bell size={18} />,      count: null }
  ];

  return (
    <>
    <div className="container-width animate-fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem; }
        .admin-tabs { display: flex; gap: 0.5rem; margin-bottom: 2.5rem; flex-wrap: wrap; }
        .admin-tab {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1.25rem; border-radius: 10px;
          font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease;
          background: rgba(14,165,233,0.05); border: 1px solid rgba(14,165,233,0.2); color: #666666;
        }
        .admin-tab:hover { color: #000000; background: rgba(14,165,233,0.12); }
        .admin-tab.active { color: white; background: rgba(14,165,233,0.25); border-color: var(--primary); }
        .tab-badge {
          background: rgba(14,165,233,0.2); color: var(--primary); font-size: 0.75rem; font-weight: 700;
          padding: 0.15rem 0.5rem; border-radius: 20px; min-width: 22px; text-align: center;
        }
        .admin-tab.active .tab-badge { background: var(--primary); color: white; }
        .data-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid rgba(14,165,233,0.2); background: white; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .data-table th {
          padding: 0.85rem 1.25rem; text-align: left; font-weight: 700; font-size: 0.8rem;
          text-transform: uppercase; letter-spacing: 0.05em; color: #666666;
          background: rgba(14,165,233,0.05); border-bottom: 1px solid rgba(14,165,233,0.2);
        }
        .data-table td {
          padding: 0.85rem 1.25rem; border-bottom: 1px solid rgba(14,165,233,0.15);
          color: #333333; vertical-align: top;
        }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: rgba(14,165,233,0.05); }
        .status-active { color: var(--accent); font-weight: 700; }
        .status-inactive { color: #f87171; font-weight: 700; }
        .action-btn {
          background: none; border: none; cursor: pointer; padding: 0.35rem; border-radius: 6px;
          transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center;
        }
        .action-btn:hover { background: rgba(14,165,233,0.08); }
        .action-btn.danger:hover { background: rgba(239,68,68,0.12); }
        .resume-btn {
          border: 1px solid rgba(14,165,233,0.25); background: rgba(14,165,233,0.08); color: var(--primary);
          border-radius: 8px; padding: 0.45rem 0.7rem; display: inline-flex; align-items: center; gap: 0.35rem;
          font-weight: 700; font-size: 0.82rem; cursor: pointer; white-space: nowrap;
        }
        .resume-btn:hover { background: rgba(14,165,233,0.15); border-color: rgba(14,165,233,0.45); }
        .resume-btn:disabled { cursor: not-allowed; opacity: 0.55; color: #94a3b8; background: #f1f5f9; border-color: #e2e8f0; }
        .job-card {
          background: white; border: 1px solid rgba(14,165,233,0.2); border-radius: 14px;
          padding: 1.75rem; transition: all 0.2s; position: relative; overflow: hidden;
        }
        .job-card:hover { border-color: rgba(14,165,233,0.4); }
        .job-type-badge {
          display: inline-block; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem;
          border-radius: 6px; background: rgba(6,182,212,0.12); color: var(--secondary); border: 1px solid rgba(6,182,212,0.2);
        }
        .job-meta { display: flex; gap: 1.25rem; color: #666666; font-size: 0.85rem; margin: 0.75rem 0; flex-wrap: wrap; }
        .job-meta-item { display: flex; align-items: center; gap: 0.3rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        @media (max-width: 640px) { .form-row { grid-template-columns: 1fr; } }
        .empty-state { text-align: center; padding: 4rem 2rem; color: #666666; }
        .empty-state-icon { opacity: 0.3; margin-bottom: 1rem; }
      `}} />

      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#000000', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
          <p style={{ color: '#666666', fontSize: '0.9rem' }}>Manage job postings, view applications, and review contact messages.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ gap: '0.4rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
          <LogOut size={16} /> Sign Out
        </button>
        <a href="/admin/assessments" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', padding:'0.5rem 1rem', borderRadius:'8px', background:'linear-gradient(135deg,#0ea5e9,#0369a1)', color:'white', fontWeight:700, fontSize:'0.85rem', textDecoration:'none' }}>
          🧪 Assessments
        </a>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Active Jobs',         value: jobs.filter(j => j.isActive).length, color: 'var(--accent)'     },
          { label: 'Total Applications',  value: applications.length,                  color: 'var(--primary)'   },
          { label: 'Contact Messages',    value: contacts.length,                      color: 'var(--secondary)' },
          { label: 'Push Subscribers',    value: subscriberCount ?? '…',               color: '#f59e0b'          }
        ].map((stat, i) => (
          <div key={i} className="glass" style={{ padding: '1.5rem', borderRadius: '12px', borderLeft: `3px solid ${stat.color}`, background: 'white' }}>
            <p style={{ color: '#666666', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{stat.label}</p>
            <h2 style={{ color: '#000000', fontSize: '2rem', fontWeight: 800 }}>{stat.value}</h2>
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
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid var(--border-color)', background: 'white' }}>
              <h3 style={{ color: '#000000', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.75rem' }}>New Job Posting</h3>

              <form onSubmit={handleCreateJob}>
                <div className="form-row">
                  <div className="form-group">
                    <label style={{ color: '#000000' }}>Job Title *</label>
                    <input className="form-input" placeholder="e.g. RF Engineer" required value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#000000' }}>Department *</label>
                    <input className="form-input" placeholder="e.g. Telecom Division" required value={jobForm.department} onChange={e => setJobForm({...jobForm, department: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label style={{ color: '#000000' }}>Location *</label>
                    <input className="form-input" placeholder="e.g. Noida, UP" required value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#000000' }}>Job Type</label>
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
                    <label style={{ color: '#000000' }}>Experience Required</label>
                    <input className="form-input" placeholder="e.g. 2-5 years" value={jobForm.experience} onChange={e => setJobForm({...jobForm, experience: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#000000' }}>Salary Range</label>
                    <input className="form-input" placeholder="e.g. ₹5L - ₹10L per annum" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ color: '#000000' }}>Description *</label>
                  <textarea className="form-input" placeholder="Detailed job description..." required style={{ minHeight: '120px' }} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#000000' }}>Requirements</label>
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
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid var(--border-color)', background: 'white' }}>
              <h3 style={{ color: '#000000', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.75rem' }}>Edit Job Posting</h3>
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
                    <label style={{ color: '#000000' }}>Job Title *</label>
                    <input className="form-input" required value={editJob.title} onChange={e => setEditJob({ ...editJob, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#000000' }}>Department *</label>
                    <input className="form-input" required value={editJob.department} onChange={e => setEditJob({ ...editJob, department: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label style={{ color: '#000000' }}>Location *</label>
                    <input className="form-input" required value={editJob.location} onChange={e => setEditJob({ ...editJob, location: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#000000' }}>Job Type</label>
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
                    <label style={{ color: '#000000' }}>Experience Required</label>
                    <input className="form-input" value={editJob.experience} onChange={e => setEditJob({ ...editJob, experience: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#000000' }}>Salary Range</label>
                    <input className="form-input" value={editJob.salary} onChange={e => setEditJob({ ...editJob, salary: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ color: '#000000' }}>Description *</label>
                  <textarea className="form-input" required style={{ minHeight: '120px' }} value={editJob.description} onChange={e => setEditJob({ ...editJob, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label style={{ color: '#000000' }}>Requirements</label>
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
                        <h3 style={{ color: '#000000', fontSize: '1.2rem', fontWeight: 700 }}>{job.title}</h3>
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
                      <p style={{ color: '#333333', fontSize: '0.9rem', lineHeight: '1.6' }}>
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
                    <th>Resume</th>
                    <th>Applied On</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, idx) => (
                    <tr key={app._id}>
                      <td style={{ color: '#666666', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ color: '#000000', fontWeight: 600 }}>{app.first_name} {app.last_name}</td>
                      <td style={{ color: 'var(--secondary)', fontWeight: 600 }}>{app.job_title || 'General Application'}</td>
                      <td><a href={`mailto:${app.email}`} style={{ color: 'var(--primary)' }}>{app.email}</a></td>
                      <td style={{ color: '#333333' }}>{app.mobno}</td>
                      <td style={{ color: '#333333' }}>{app.qualification}</td>
                      <td style={{ color: '#333333' }}>{app.city}</td>
                      <td>
                        <button
                          type="button"
                          className="resume-btn"
                          onClick={() => openResume(app)}
                          disabled={!app.hasResume}
                          title={app.hasResume ? `View ${app.resumeFileName || 'resume.pdf'}` : 'No resume uploaded'}
                        >
                          <FileText size={15} />
                          {app.hasResume ? 'View PDF' : 'No Resume'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openInterviewModal(app)}
                          style={{ marginLeft:'0.5rem', padding:'0.4rem 0.75rem', border:'1px solid rgba(139,92,246,0.3)', background:'rgba(139,92,246,0.08)', color:'#7c3aed', borderRadius:'8px', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'0.3rem', whiteSpace:'nowrap' }}
                          title="Schedule interview & send email"
                        >
                          📅 Interview
                        </button>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#666666' }}>{new Date(app.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
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
                      <td style={{ color: '#666666', fontWeight: 600 }}>{idx + 1}</td>
                      <td style={{ color: '#000000', fontWeight: 600 }}>{msg.name}</td>
                      <td style={{ color: '#333333' }}>{msg.subject}</td>
                      <td><a href={`mailto:${msg.email}`} style={{ color: 'var(--primary)' }}>{msg.email}</a></td>
                      <td style={{ color: '#333333' }}>{msg.tel}</td>
                      <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#333333' }}>{msg.msg}</td>
                      <td style={{ fontSize: '0.85rem', color: '#666666' }}>{new Date(msg.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== NOTIFICATIONS TAB ==================== */}
      {activeTab === 'notifications' && (
        <div>
          <style dangerouslySetInnerHTML={{__html:`
            .notif-grid { display:grid; grid-template-columns:1.1fr 0.9fr; gap:2rem; align-items:start; }
            .notif-card { background:white; border:1px solid rgba(14,165,233,0.18); border-radius:18px; padding:2rem; }
            .notif-stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; margin-top:1rem; }
            .notif-stat-box { background:linear-gradient(135deg,#f8fafc,#f0f9ff); border:1px solid rgba(14,165,233,0.15);
              border-radius:12px; padding:1rem; text-align:center; }
            .notif-stat-val { font-size:1.5rem; font-weight:800; }
            .notif-stat-lbl { font-size:0.72rem; color:#64748b; font-weight:600; margin-top:0.15rem; }
            .notif-preview { background:linear-gradient(135deg,#1e293b,#0f172a); border-radius:16px;
              padding:1.25rem; margin:1.25rem 0; color:white; position:relative; overflow:hidden; }
            .notif-preview::before { content:''; position:absolute; top:-30px; right:-30px; width:100px; height:100px;
              background:rgba(14,165,233,0.15); border-radius:50%; }
            .notif-preview-header { display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem; }
            .notif-preview-icon { width:36px; height:36px; border-radius:8px;
              background:linear-gradient(135deg,#0ea5e9,#06b6d4); display:flex; align-items:center; justify-content:center; }
            .notif-preview-app { font-size:0.75rem; color:rgba(255,255,255,0.6); margin-top:0.15rem; }
            .notif-preview-title { font-weight:700; font-size:0.95rem; color:white; }
            .notif-preview-body { font-size:0.82rem; color:rgba(255,255,255,0.75); line-height:1.5; }
            .template-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; margin-bottom:1.25rem; }
            .template-btn { padding:0.6rem 0.75rem; border:1.5px solid rgba(14,165,233,0.2); border-radius:9px;
              background:rgba(14,165,233,0.04); font-size:0.8rem; font-weight:600; color:#334155;
              cursor:pointer; text-align:left; transition:all 0.18s; }
            .template-btn:hover { border-color:var(--primary); background:rgba(14,165,233,0.1); color:#0284c7; }
            .notif-send-btn { width:100%; padding:0.95rem; border-radius:12px; border:none; cursor:pointer;
              background:linear-gradient(135deg,#0ea5e9,#0369a1); color:white; font-size:1rem;
              font-weight:800; font-family:inherit; transition:all 0.2s; display:flex;
              align-items:center; justify-content:center; gap:0.5rem; box-shadow:0 4px 20px rgba(14,165,233,0.35); }
            .notif-send-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 30px rgba(14,165,233,0.5); }
            .notif-send-btn:disabled { opacity:0.65; cursor:not-allowed; transform:none; }
            @media(max-width:900px){ .notif-grid{grid-template-columns:1fr;} .template-grid{grid-template-columns:1fr;} }
          `}} />

          <div className="notif-grid">

            {/* ── Left: Send Form ── */}
            <div className="notif-card">
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem',
                padding:'1rem 1.25rem', background:'linear-gradient(135deg,#f0f9ff,#e0f2fe)',
                borderRadius:'12px', border:'1px solid rgba(14,165,233,0.2)' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'12px', flexShrink:0,
                  background:'linear-gradient(135deg,#0ea5e9,#0369a1)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Bell size={22} style={{ color:'white' }} />
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#0f172a' }}>Send Push Notification</div>
                  <div style={{ fontSize:'0.8rem', color:'#64748b', marginTop:'0.1rem' }}>
                    Reaches <strong style={{ color:'#0ea5e9' }}>{subscriberCount ?? 0}</strong> active subscribers instantly — even when site is closed
                  </div>
                </div>
              </div>

              {/* Quick templates */}
              <div style={{ marginBottom:'1.25rem' }}>
                <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#94a3b8', letterSpacing:'0.08em',
                  textTransform:'uppercase', marginBottom:'0.6rem' }}>⚡ Quick Templates</div>
                <div className="template-grid">
                  {[
                    { label:'🧑‍💼 New Job Opening',   title:'New Job Opening!',     body:'We have a new position open at Rancom Technologies. Apply now!' },
                    { label:'📝 New Blog Post',       title:'New Article Published', body:'Check out our latest blog post on rancomtechnologies.com' },
                    { label:'🎉 Offer / Discount',    title:'Special Offer!',        body:'Get a free consultation for your software project this week.' },
                    { label:'📢 Company Update',      title:'Update from Rancom',    body:'Important update from Rancom Technologies Pvt Ltd. Visit our site.' },
                  ].map(t => (
                    <button key={t.label} className="template-btn"
                      onClick={() => setNotifForm(f => ({ ...f, title: t.title, body: t.body }))}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live preview */}
              {(notifForm.title || notifForm.body) && (
                <div className="notif-preview">
                  <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.4)', marginBottom:'0.5rem' }}>
                    NOTIFICATION PREVIEW
                  </div>
                  <div className="notif-preview-header">
                    <div className="notif-preview-icon">
                      <Bell size={18} style={{ color:'white' }} />
                    </div>
                    <div>
                      <div className="notif-preview-title">{notifForm.title || 'Rancom Technologies'}</div>
                      <div className="notif-preview-app">rancomtechnologies.com · now</div>
                    </div>
                  </div>
                  <div className="notif-preview-body">{notifForm.body || 'Your message will appear here…'}</div>
                </div>
              )}

              <form onSubmit={handleSendNotification}>
                <div className="form-group" style={{ marginBottom:'1rem' }}>
                  <label style={{ color:'#0f172a', fontWeight:700, fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    Notification Title
                  </label>
                  <input className="form-input" placeholder="e.g. New Job Opening!"
                    value={notifForm.title}
                    onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))} />
                </div>

                <div className="form-group" style={{ marginBottom:'1rem' }}>
                  <label style={{ color:'#0f172a', fontWeight:700, fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    Message Body <span style={{ color:'#ef4444' }}>*</span>
                  </label>
                  <textarea className="form-input" required rows={3}
                    placeholder="Write your notification message here…"
                    style={{ minHeight:'90px', resize:'vertical' }}
                    value={notifForm.body}
                    onChange={e => setNotifForm(f => ({ ...f, body: e.target.value }))} />
                  <div style={{ fontSize:'0.75rem', color: notifForm.body.length > 150 ? '#ef4444' : '#94a3b8', marginTop:'0.25rem', textAlign:'right' }}>
                    {notifForm.body.length}/150 characters
                  </div>
                </div>

                <div className="form-row" style={{ marginBottom:'1rem' }}>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label style={{ color:'#0f172a', fontWeight:700, fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                      Click URL
                    </label>
                    <input className="form-input" placeholder="https://..."
                      value={notifForm.url}
                      onChange={e => setNotifForm(f => ({ ...f, url: e.target.value }))} />
                  </div>
                  <div className="form-group" style={{ marginBottom:0 }}>
                    <label style={{ color:'#0f172a', fontWeight:700, fontSize:'0.82rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                      Audience
                    </label>
                    <select className="form-input" value={notifForm.topic}
                      onChange={e => setNotifForm(f => ({ ...f, topic: e.target.value }))}>
                      <option value="all">🌐 All Subscribers ({subscriberCount ?? 0})</option>
                      <option value="jobs">💼 Jobs Topic</option>
                      <option value="blog">📝 Blog Topic</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="notif-send-btn" disabled={notifLoading || !notifForm.body.trim()}>
                  {notifLoading
                    ? <><span style={{ display:'inline-block', animation:'spin 1s linear infinite', fontSize:'1.1rem' }}>⏳</span> Sending…</>
                    : <><Bell size={18} /> Send to {subscriberCount ?? 0} Subscribers</>
                  }
                </button>
              </form>
            </div>

            {/* ── Right: Stats + Info ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

              {/* Subscriber stats */}
              <div className="notif-card">
                <div style={{ fontWeight:800, fontSize:'1rem', color:'#0f172a', marginBottom:'0.25rem' }}>
                  📊 Subscriber Overview
                </div>
                <div style={{ fontSize:'0.82rem', color:'#64748b', marginBottom:'1rem' }}>
                  Real-time FCM subscriber data from MongoDB
                </div>
                <div className="notif-stat-grid">
                  {[
                    { label:'Active Subscribers', value: subscriberCount ?? '…', color:'#10b981' },
                    { label:'Delivery Method',    value:'FCM WebPush',            color:'#0ea5e9' },
                    { label:'Background Delivery',value:'✓ Yes',                  color:'#10b981' },
                    { label:'Provider',           value:'Firebase',               color:'#f59e0b' },
                  ].map(s => (
                    <div key={s.label} className="notif-stat-box">
                      <div className="notif-stat-val" style={{ color:s.color }}>{s.value}</div>
                      <div className="notif-stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={fetchSubscriberCount} style={{
                  marginTop:'1rem', width:'100%', padding:'0.6rem', borderRadius:'8px',
                  border:'1px solid rgba(14,165,233,0.2)', background:'rgba(14,165,233,0.05)',
                  color:'var(--primary)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer' }}>
                  🔄 Refresh Count
                </button>
              </div>

              {/* How it works */}
              <div className="notif-card">
                <div style={{ fontWeight:800, fontSize:'1rem', color:'#0f172a', marginBottom:'1rem' }}>
                  🔔 How It Works
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                  {[
                    { icon:'1', label:'Visitor clicks 🔔 bell in header', desc:'Browser asks for notification permission' },
                    { icon:'2', label:'Permission granted',               desc:'FCM token saved to database automatically' },
                    { icon:'3', label:'You send a notification here',     desc:'Firebase delivers it instantly to all subscribers' },
                    { icon:'4', label:'Notification appears',             desc:'Even if the browser is closed or site is not open' },
                  ].map(item => (
                    <div key={item.icon} style={{ display:'flex', gap:'0.85rem', alignItems:'flex-start' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'50%', flexShrink:0,
                        background:'linear-gradient(135deg,#0ea5e9,#0369a1)', color:'white',
                        fontSize:'0.75rem', fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {item.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, color:'#0f172a', fontSize:'0.85rem' }}>{item.label}</div>
                        <div style={{ color:'#64748b', fontSize:'0.78rem', marginTop:'0.1rem' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div style={{ background:'linear-gradient(135deg,#fef3c7,#fde68a)', border:'1px solid #f59e0b',
                borderRadius:'14px', padding:'1.25rem' }}>
                <div style={{ fontWeight:800, color:'#92400e', marginBottom:'0.75rem', fontSize:'0.9rem' }}>
                  💡 Best Practices
                </div>
                <ul style={{ margin:0, padding:'0 0 0 1rem', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                  {[
                    'Keep messages under 100 characters',
                    'Send max 1–2 notifications per week',
                    'Use action-driven titles (New Job, Special Offer)',
                    'Always include a relevant click URL',
                  ].map(tip => (
                    <li key={tip} style={{ color:'#78350f', fontSize:'0.8rem' }}>{tip}</li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Interview Invitation Modal ── */}
      {interviewModal && interviewApp && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'1rem', overflowY:'auto' }}>
          <div style={{ background:'white', maxWidth:'540px', width:'100%', borderRadius:'20px', padding:'2rem', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', position:'relative', margin:'auto' }}>

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem', padding:'1rem 1.25rem', background:'linear-gradient(135deg,#fdf4ff,#fae8ff)', borderRadius:'12px', border:'1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1.3rem' }}>📅</div>
              <div>
                <div style={{ fontWeight:800, fontSize:'1.05rem', color:'#0f172a' }}>Schedule Interview</div>
                <div style={{ fontSize:'0.8rem', color:'#7c3aed', marginTop:'0.1rem' }}>
                  {interviewApp.first_name} {interviewApp.last_name} — {interviewApp.email}
                </div>
              </div>
              <button onClick={() => setInterviewModal(false)} style={{ marginLeft:'auto', border:'none', background:'#f1f5f9', borderRadius:'8px', width:'32px', height:'32px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', color:'#64748b', flexShrink:0 }}>✕</button>
            </div>

            <form onSubmit={handleSendInterview}>
              {/* Position */}
              <div className="form-group" style={{ marginBottom:'1rem' }}>
                <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em' }}>Position Applied For</label>
                <input className="form-input" value={interviewForm.position} onChange={e => setInterviewForm(f=>({...f,position:e.target.value}))} placeholder="e.g. MERN Stack Developer" />
              </div>

              {/* Date + Time */}
              <div className="form-row" style={{ marginBottom:'1rem' }}>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em' }}>Interview Date *</label>
                  <input type="date" className="form-input" required value={interviewForm.interviewDate} onChange={e => setInterviewForm(f=>({...f,interviewDate:e.target.value}))} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group" style={{ marginBottom:0 }}>
                  <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em' }}>Interview Time *</label>
                  <input type="time" className="form-input" required value={interviewForm.interviewTime} onChange={e => setInterviewForm(f=>({...f,interviewTime:e.target.value}))} />
                </div>
              </div>

              {/* Mode */}
              <div className="form-group" style={{ marginBottom:'1rem' }}>
                <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em' }}>Interview Mode *</label>
                <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.25rem' }}>
                  {[['online','💻 Online'],['offline','🏢 In-Person'],['phone','📞 Phone']].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setInterviewForm(f=>({...f,mode:val}))}
                      style={{ flex:1, padding:'0.6rem', borderRadius:'9px', border:'1.5px solid', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:'0.82rem', transition:'all 0.18s',
                        borderColor: interviewForm.mode===val ? '#8b5cf6':'#e2e8f0',
                        background: interviewForm.mode===val ? 'rgba(139,92,246,0.1)':'#f8fafc',
                        color: interviewForm.mode===val ? '#6d28d9':'#475569' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location / Meet Link */}
              {interviewForm.mode === 'offline' && (
                <div className="form-group" style={{ marginBottom:'1rem' }}>
                  <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em' }}>Venue / Address</label>
                  <input className="form-input" value={interviewForm.location} onChange={e => setInterviewForm(f=>({...f,location:e.target.value}))} placeholder="e.g. Sector 62, Noida, UP" />
                </div>
              )}
              {interviewForm.mode === 'online' && (
                <div className="form-group" style={{ marginBottom:'1rem' }}>
                  <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em' }}>Meeting Link (Google Meet / Zoom)</label>
                  <input type="url" className="form-input" value={interviewForm.meetLink} onChange={e => setInterviewForm(f=>({...f,meetLink:e.target.value}))} placeholder="https://meet.google.com/..." />
                </div>
              )}
              {interviewForm.mode === 'phone' && (
                <div className="form-group" style={{ marginBottom:'1rem' }}>
                  <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em' }}>Phone Number to Call</label>
                  <input className="form-input" value={interviewForm.location} onChange={e => setInterviewForm(f=>({...f,location:e.target.value}))} placeholder="+91 XXXXXXXXXX" />
                </div>
              )}

              {/* Interviewers */}
              <div className="form-group" style={{ marginBottom:'1rem' }}>
                <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em' }}>Interviewer(s)</label>
                <input className="form-input" value={interviewForm.interviewers} onChange={e => setInterviewForm(f=>({...f,interviewers:e.target.value}))} placeholder="e.g. Rahul Sharma (Tech), Priya Verma (HR)" />
              </div>

              {/* Notes */}
              <div className="form-group" style={{ marginBottom:'1.5rem' }}>
                <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em' }}>Additional Notes / Instructions</label>
                <textarea className="form-input" rows={3} style={{ minHeight:'75px', resize:'vertical' }} value={interviewForm.notes} onChange={e => setInterviewForm(f=>({...f,notes:e.target.value}))} placeholder="e.g. Bring original documents. Dress code: formal." />
              </div>

              {/* Preview strip */}
              {interviewForm.interviewDate && interviewForm.interviewTime && (
                <div style={{ background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:'10px', padding:'0.85rem 1rem', marginBottom:'1.25rem', fontSize:'0.85rem', color:'#4c1d95' }}>
                  <strong>📧 Email preview:</strong> Interview for <em>{interviewForm.position || 'the position'}</em> on <em>{new Date(interviewForm.interviewDate).toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short'})}</em> at <em>{interviewForm.interviewTime}</em> via <em>{interviewForm.mode}</em> will be sent to <strong>{interviewApp.email}</strong>.
                </div>
              )}

              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button type="submit" disabled={interviewLoading}
                  style={{ flex:1, padding:'0.85rem', borderRadius:'12px', border:'none', cursor: interviewLoading ? 'not-allowed':'pointer', background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', color:'white', fontWeight:800, fontSize:'0.95rem', fontFamily:'inherit', transition:'all 0.2s', opacity: interviewLoading ? 0.7:1, boxShadow:'0 4px 16px rgba(139,92,246,0.35)' }}>
                  {interviewLoading ? '⏳ Sending…' : '📧 Send Interview Invitation'}
                </button>
                <button type="button" onClick={() => setInterviewModal(false)}
                  style={{ padding:'0.85rem 1.25rem', borderRadius:'12px', border:'1.5px solid #e2e8f0', background:'white', color:'#475569', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
    </>
  );
}
