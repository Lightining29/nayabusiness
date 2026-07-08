import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  Briefcase, Users, Mail, PlusCircle, Trash2, ToggleLeft, ToggleRight,
  LogOut, CheckCircle, AlertCircle, ChevronUp, MapPin, Clock, DollarSign,
  Edit, FileText, Bell, ClipboardList, UserCheck, Database
} from 'lucide-react';

const ADMIN_TOKEN = () => sessionStorage.getItem('adminPassword') || 'rancom@2026';
const api = (url, opts = {}) => fetch(url, {
  ...opts,
  headers: {
    'x-admin-token': ADMIN_TOKEN(),
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  },
});

const DIFF_COLORS  = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
const TYPE_COLORS  = { mcq: '#0369a1', theory: '#b45309', sql: '#059669' };
const TYPE_ICONS   = { mcq: '🔘', theory: '📝', sql: '🗄️' };

export default function AssessmentAdmin() {
  const navigate = useNavigate();
  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') !== 'true') navigate('/admin');
  }, [navigate]);

  /* ── tabs ── */
  const [tab, setTab] = useState('tests');

  /* ── data ── */
  const [tests,        setTests]       = useState([]);
  const [stats,        setStats]       = useState({});
  const [selTest,      setSelTest]     = useState(null);
  const [attempts,     setAttempts]    = useState([]);
  const [applications, setApps]        = useState([]);
  const [loading,      setLoading]     = useState(false);

  /* ── UI toggles ── */
  const [showNewTest, setShowNewTest] = useState(false);

  /* ── new test form ── */
  const [tf, setTf] = useState({
    title: '', description: '', jobTitle: 'General', duration: 30,
    passingScore: 60, maxAttempts: 1, shuffleQuestions: true,
    shuffleOptions: true, showResult: true, scheduledAt: '', expiresAt: '',
  });

  /* ── new question form ── */
  const [qf, setQf] = useState({
    text: '', type: 'mcq', options: ['', '', '', ''], correct: '',
    marks: 1, difficulty: 'medium', topic: '', modelAnswer: '',
    sqlSchema: '', sqlExpected: '', sqlHint: '', explanation: '',
  });

  /* ── SQL Runner ── */
  const [sqlRunnerSchema, setSqlRunnerSchema] = useState(
    "CREATE TABLE employees (\n  id INT,\n  name VARCHAR(50),\n  dept VARCHAR(50),\n  salary INT\n);\nINSERT INTO employees VALUES (1,'Alice','Engineering',90000);\nINSERT INTO employees VALUES (2,'Bob','Marketing',75000);\nINSERT INTO employees VALUES (3,'Carol','Engineering',95000);"
  );
  const [sqlRunnerQuery,  setSqlRunnerQuery]  = useState("SELECT * FROM employees WHERE dept = 'Engineering';");
  const [sqlRunnerResult, setSqlRunnerResult] = useState(null);
  const [sqlRunnerBusy,   setSqlRunnerBusy]   = useState(false);

  const adminRunSql = async () => {
    setSqlRunnerBusy(true);
    setSqlRunnerResult(null);
    try {
      const r = await api('/api/assessment/admin/run-sql', {
        method: 'POST',
        body: JSON.stringify({ schema: sqlRunnerSchema, query: sqlRunnerQuery }),
      });
      setSqlRunnerResult(await r.json());
    } catch (e) {
      setSqlRunnerResult({ error: e.message });
    } finally {
      setSqlRunnerBusy(false);
    }
  };

  /* ── fetch everything ── */
  const fetchAll = async () => {
    setLoading(true);
    const [tRes, sRes, aRes] = await Promise.all([
      api('/api/assessment/admin/list'),
      api('/api/assessment/admin/stats'),
      fetch('/api/admin/applications'),
    ]);
    setTests(await tRes.json());
    setStats(await sRes.json());
    setApps(await aRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── create test ── */
  const createTest = async (e) => {
    e.preventDefault();
    const r = await api('/api/assessment/admin/create', { method: 'POST', body: JSON.stringify(tf) });
    const d = await r.json();
    if (!r.ok) { Swal.fire({ icon: 'error', title: 'Error', text: d.error }); return; }
    Swal.fire({ icon: 'success', title: 'Created!', timer: 1800, showConfirmButton: false });
    setShowNewTest(false);
    setTf({ title: '', description: '', jobTitle: 'General', duration: 30, passingScore: 60, maxAttempts: 1, shuffleQuestions: true, shuffleOptions: true, showResult: true, scheduledAt: '', expiresAt: '' });
    fetchAll();
  };

  /* ── delete test ── */
  const deleteTest = async (id) => {
    const r = await Swal.fire({
      icon: 'warning', title: 'Delete Test?', text: 'All attempts will also be deleted.',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete',
    });
    if (!r.isConfirmed) return;
    await api(`/api/assessment/admin/${id}`, { method: 'DELETE' });
    Swal.fire({ icon: 'success', title: 'Deleted!', timer: 1500, showConfirmButton: false });
    fetchAll();
    if (selTest?._id === id) setSelTest(null);
  };

  /* ── add question ── */
  const addQuestion = async (e) => {
    e.preventDefault();
    if (!selTest) return;
    const payload = {
      ...qf,
      options: qf.type === 'mcq' ? qf.options.filter(Boolean) : [],
    };
    if (qf.type === 'mcq' && !payload.correct) {
      Swal.fire({ icon: 'warning', title: 'Correct Answer Required', text: 'Please enter the correct answer.', confirmButtonColor: '#0ea5e9' });
      return;
    }
    if (!payload.correct) payload.correct = '';
    const r = await api(`/api/assessment/admin/${selTest._id}/question`, { method: 'POST', body: JSON.stringify(payload) });
    const d = await r.json();
    if (!r.ok) { Swal.fire({ icon: 'error', title: 'Error', text: d.error }); return; }
    Swal.fire({ icon: 'success', title: 'Question Added!', text: d.message, timer: 1500, showConfirmButton: false });
    setQf({ text: '', type: 'mcq', options: ['', '', '', ''], correct: '', marks: 1, difficulty: 'medium', topic: '', modelAnswer: '', sqlSchema: '', sqlExpected: '', sqlHint: '', explanation: '' });
    const updated = await api(`/api/assessment/admin/${selTest._id}`).then(r2 => r2.json());
    setSelTest(updated);
  };

  /* ── delete question ── */
  const deleteQuestion = async (qid) => {
    await api(`/api/assessment/admin/${selTest._id}/question/${qid}`, { method: 'DELETE' });
    const updated = await api(`/api/assessment/admin/${selTest._id}`).then(r => r.json());
    setSelTest(updated);
  };

  /* ── candidates ── */
  const inviteCandidate = async (regId, name) => {
    const r = await api(`/api/assessment/admin/${selTest._id}/invite`, {
      method: 'POST',
      body: JSON.stringify({ candidateIds: [regId] }),
    });
    const d = await r.json();
    if (!r.ok) { Swal.fire({ icon: 'error', title: 'Error', text: d.error }); return; }
    Swal.fire({ icon: 'success', title: 'Invited & Email Sent!', text: `${name} will receive an email with their access code.`, timer: 2500, showConfirmButton: false });
    const updated = await api(`/api/assessment/admin/${selTest._id}`).then(r2 => r2.json());
    setSelTest(updated);
  };

  const resendInvite = async (email) => {
    const r = await api(`/api/assessment/admin/${selTest._id}/resend-invite/${encodeURIComponent(email)}`, { method: 'POST' });
    const d = await r.json();
    if (!r.ok) { Swal.fire({ icon: 'error', title: 'Error', text: d.error }); return; }
    Swal.fire({ icon: 'success', title: 'Email Resent!', text: d.message, timer: 2000, showConfirmButton: false });
  };

  const removeInvite = async (email) => {
    await api(`/api/assessment/admin/${selTest._id}/invite/${email}`, { method: 'DELETE' });
    const updated = await api(`/api/assessment/admin/${selTest._id}`).then(r => r.json());
    setSelTest(updated);
  };

  /* ── reports ── */
  const loadAttempts = async (testId) => {
    const r = await api(`/api/assessment/admin/${testId}/attempts`);
    setAttempts(await r.json());
    setTab('reports');
  };

  /* ── copy link ── */
  const copyTestLink = (id) => {
    const url = `${window.location.origin}/test/${id}`;
    navigator.clipboard.writeText(url).then(() =>
      Swal.fire({ icon: 'success', title: 'Link Copied!', text: url, timer: 2500, showConfirmButton: false })
    );
  };

  /* ══════════════════════════════════════════
     CSS
  ══════════════════════════════════════════ */
  const CSS = `
    .aa-shell{min-height:100vh;background:#f1f5f9;font-family:inherit;}
    .aa-nav{background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:0.85rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;}
    .aa-nav-title{color:white;font-weight:800;font-size:1.1rem;}
    .aa-tabs{display:flex;gap:0.5rem;flex-wrap:wrap;}
    .aa-tab{padding:0.55rem 1.1rem;border-radius:8px;border:none;cursor:pointer;font-weight:700;font-size:0.85rem;font-family:inherit;transition:all 0.18s;background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);}
    .aa-tab.active{background:white;color:#0f172a;}
    .aa-body{max-width:1200px;margin:0 auto;padding:1.5rem;}
    .aa-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem;}
    .aa-stat{background:white;border-radius:14px;padding:1.25rem;border-left:4px solid;box-shadow:0 2px 12px rgba(0,0,0,0.05);}
    .aa-card{background:white;border-radius:16px;padding:1.5rem;box-shadow:0 2px 12px rgba(0,0,0,0.05);margin-bottom:1.25rem;border:1px solid #e2e8f0;}
    .aa-test-item{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.25rem;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:0.65rem;flex-wrap:wrap;}
    .aa-badge{display:inline-block;padding:0.2rem 0.6rem;border-radius:6px;font-size:0.72rem;font-weight:700;}
    .aa-input{border:1.5px solid #e2e8f0;border-radius:10px;padding:0.65rem 0.9rem;font-family:inherit;font-size:0.9rem;width:100%;outline:none;background:#f8fafc;transition:border-color 0.18s;box-sizing:border-box;}
    .aa-input:focus{border-color:#0ea5e9;background:white;}
    .aa-label{font-size:0.78rem;font-weight:700;color:#374151;margin-bottom:0.3rem;display:block;}
    .aa-grid2{display:grid;grid-template-columns:1fr 1fr;gap:0.85rem;}
    .aa-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.85rem;}
    .aa-btn{padding:0.6rem 1.2rem;border-radius:9px;border:none;cursor:pointer;font-weight:700;font-size:0.85rem;font-family:inherit;transition:all 0.18s;}
    .aa-btn-primary{background:linear-gradient(135deg,#0ea5e9,#0369a1);color:white;box-shadow:0 3px 12px rgba(14,165,233,0.3);}
    .aa-btn-danger{background:rgba(239,68,68,0.1);color:#dc2626;border:1px solid rgba(239,68,68,0.25);}
    .aa-btn-success{background:linear-gradient(135deg,#10b981,#059669);color:white;}
    .aa-btn-outline{background:white;border:1.5px solid #e2e8f0;color:#475569;}
    .aa-section-title{font-size:0.72rem;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:2px solid #f1f5f9;}
    .aa-q-item{display:flex;align-items:flex-start;gap:0.85rem;padding:0.85rem;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;margin-bottom:0.5rem;}
    .aa-violation{display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.5rem;border-radius:6px;background:#fef3c7;color:#92400e;font-size:0.75rem;font-weight:700;}
    .aa-sql-runner{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;}
    .aa-sql-textarea{width:100%;box-sizing:border-box;border:1.5px solid #334155;border-radius:10px;padding:0.85rem;font-family:monospace;font-size:0.84rem;line-height:1.65;background:#0f172a;color:#e2e8f0;resize:vertical;outline:none;min-height:200px;}
    .aa-sql-textarea:focus{border-color:#0ea5e9;}
    .aa-sql-table{width:100%;border-collapse:collapse;font-size:0.85rem;}
    .aa-sql-table th{background:#f1f5f9;padding:0.55rem 0.85rem;text-align:left;font-weight:700;color:#374151;border-bottom:2px solid #e2e8f0;white-space:nowrap;}
    .aa-sql-table td{padding:0.55rem 0.85rem;border-bottom:1px solid #f1f5f9;color:#0f172a;}
    .aa-sql-table tr:hover td{background:#f8fafc;}
    @media(max-width:640px){
      .aa-grid2,.aa-grid3,.aa-sql-runner{grid-template-columns:1fr;}
      .aa-test-item{flex-direction:column;align-items:flex-start;}
    }
  `;

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="aa-shell">
      <style>{CSS}</style>

      {/* ── Nav ── */}
      <div className="aa-nav">
        <div className="aa-nav-title">🧪 Assessment Management</div>
        <div className="aa-tabs">
          {[
            ['tests',      'Tests'],
            ['questions',  'Question Bank'],
            ['candidates', 'Candidates'],
            ['reports',    'Reports'],
            ['sql-runner', '🗄️ SQL Runner'],
          ].map(([id, label]) => (
            <button key={id} className={`aa-tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>
        <button className="aa-btn aa-btn-outline" onClick={() => navigate('/admin/dashboard')}>
          <LogOut size={14} style={{ marginRight: '0.3rem' }} />Dashboard
        </button>
      </div>

      <div className="aa-body">

        {/* ── Stats ── */}
        <div className="aa-stat-grid">
          {[
            { label: 'Total Tests',    value: tests.length,               color: '#0ea5e9' },
            { label: 'Total Attempts', value: stats.totalAttempts ?? '…', color: '#f59e0b' },
            { label: 'Passed',         value: stats.passedAttempts ?? '…', color: '#10b981' },
            { label: 'Applications',   value: applications.length,        color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="aa-stat" style={{ borderLeftColor: s.color }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>{s.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ══════════════════════════════════════
            TESTS TAB
        ══════════════════════════════════════ */}
        {tab === 'tests' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem' }}>📋 All Assessments</h2>
              <button className="aa-btn aa-btn-primary" onClick={() => setShowNewTest(v => !v)}>
                {showNewTest ? <ChevronUp size={16} /> : <PlusCircle size={16} />}
                {showNewTest ? ' Hide Form' : ' Create New Test'}
              </button>
            </div>

            {/* Create test form */}
            {showNewTest && (
              <div className="aa-card" style={{ marginBottom: '1.25rem' }}>
                <div className="aa-section-title">➕ New Assessment</div>
                <form onSubmit={createTest}>
                  <div className="aa-grid2" style={{ marginBottom: '0.85rem' }}>
                    <div>
                      <label className="aa-label">Title *</label>
                      <input className="aa-input" required value={tf.title} onChange={e => setTf(f => ({ ...f, title: e.target.value }))} placeholder="e.g. MERN Stack Test" />
                    </div>
                    <div>
                      <label className="aa-label">Job Title</label>
                      <input className="aa-input" value={tf.jobTitle} onChange={e => setTf(f => ({ ...f, jobTitle: e.target.value }))} placeholder="e.g. Full Stack Developer" />
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.85rem' }}>
                    <label className="aa-label">Description</label>
                    <textarea className="aa-input" style={{ minHeight: '70px' }} value={tf.description} onChange={e => setTf(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." />
                  </div>
                  <div className="aa-grid3" style={{ marginBottom: '0.85rem' }}>
                    <div>
                      <label className="aa-label">Duration (min)</label>
                      <input type="number" className="aa-input" value={tf.duration} min={5} max={180} onChange={e => setTf(f => ({ ...f, duration: +e.target.value }))} />
                    </div>
                    <div>
                      <label className="aa-label">Passing Score (%)</label>
                      <input type="number" className="aa-input" value={tf.passingScore} min={1} max={100} onChange={e => setTf(f => ({ ...f, passingScore: +e.target.value }))} />
                    </div>
                    <div>
                      <label className="aa-label">Max Attempts</label>
                      <input type="number" className="aa-input" value={tf.maxAttempts} min={1} max={5} onChange={e => setTf(f => ({ ...f, maxAttempts: +e.target.value }))} />
                    </div>
                  </div>
                  <div className="aa-grid2" style={{ marginBottom: '0.85rem' }}>
                    <div>
                      <label className="aa-label">Scheduled At</label>
                      <input type="datetime-local" className="aa-input" value={tf.scheduledAt} onChange={e => setTf(f => ({ ...f, scheduledAt: e.target.value }))} />
                    </div>
                    <div>
                      <label className="aa-label">Expires At</label>
                      <input type="datetime-local" className="aa-input" value={tf.expiresAt} onChange={e => setTf(f => ({ ...f, expiresAt: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {[['shuffleQuestions', 'Shuffle Questions'], ['shuffleOptions', 'Shuffle Options'], ['showResult', 'Show Result to Candidate']].map(([k, l]) => (
                      <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
                        <input type="checkbox" checked={tf[k]} onChange={e => setTf(f => ({ ...f, [k]: e.target.checked }))} /> {l}
                      </label>
                    ))}
                  </div>
                  <button type="submit" className="aa-btn aa-btn-primary">✅ Create Assessment</button>
                </form>
              </div>
            )}

            {/* Tests list */}
            {loading
              ? <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading...</div>
              : tests.length === 0
                ? <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No assessments yet. Create your first one above.</div>
                : tests.map(t => (
                  <div key={t._id} className="aa-test-item">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                        <span style={{ fontWeight: 800, color: '#0f172a' }}>{t.title}</span>
                        <span className="aa-badge" style={{ background: t.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: t.isActive ? '#10b981' : '#ef4444' }}>
                          {t.isActive ? '● Active' : '● Inactive'}
                        </span>
                        <span className="aa-badge" style={{ background: 'rgba(14,165,233,0.1)', color: '#0369a1' }}>{t.questions?.length ?? 0} Q</span>
                        <span className="aa-badge" style={{ background: 'rgba(139,92,246,0.1)', color: '#7c3aed' }}>{t.invitedCandidates?.length ?? 0} invited</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.jobTitle} · {t.duration} min · Pass: {t.passingScore}%</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button className="aa-btn aa-btn-outline" onClick={() => { setSelTest(t); setTab('questions'); }}>
                        <Edit size={13} style={{ marginRight: '0.3rem' }} />Edit
                      </button>
                      <button className="aa-btn aa-btn-outline" onClick={() => { setSelTest(t); setTab('candidates'); }}>
                        <Users size={13} style={{ marginRight: '0.3rem' }} />Invite
                      </button>
                      <button className="aa-btn aa-btn-success" onClick={() => { loadAttempts(t._id); setSelTest(t); }}>
                        <FileText size={13} style={{ marginRight: '0.3rem' }} />Reports
                      </button>
                      <button className="aa-btn aa-btn-outline" onClick={() => copyTestLink(t._id)}>🔗 Link</button>
                      <button className="aa-btn aa-btn-danger" onClick={() => deleteTest(t._id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))
            }
          </div>
        )}

        {/* ══════════════════════════════════════
            QUESTION BANK TAB
        ══════════════════════════════════════ */}
        {tab === 'questions' && (
          <div>
            {!selTest ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <ClipboardList size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>Select a test from the Tests tab to manage its questions.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                  {tests.map(t => (
                    <button key={t._id} className="aa-btn aa-btn-outline" onClick={() => setSelTest(t)}>{t.title}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>📝 {selTest.title} — Question Bank</h2>
                  <span className="aa-badge" style={{ background: 'rgba(14,165,233,0.1)', color: '#0369a1' }}>{selTest.questions?.length ?? 0} questions</span>
                </div>

                {/* ── Add Question Form ── */}
                <div className="aa-card" style={{ marginBottom: '1.5rem' }}>
                  <div className="aa-section-title">➕ Add Question</div>

                  {/* Type selector */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                    {[
                      { id: 'mcq',    label: '🔘 MCQ',    desc: 'Multiple choice' },
                      { id: 'theory', label: '📝 Theory', desc: 'Written answer' },
                      { id: 'sql',    label: '🗄️ SQL',    desc: 'SQL auto-graded' },
                    ].map(t => (
                      <button key={t.id} type="button"
                        onClick={() => setQf(f => ({ ...f, type: t.id }))}
                        style={{
                          padding: '0.55rem 1rem', borderRadius: '9px', border: '1.5px solid',
                          borderColor: qf.type === t.id ? '#0ea5e9' : '#e2e8f0',
                          background: qf.type === t.id ? '#eff6ff' : '#f8fafc',
                          color: qf.type === t.id ? '#0369a1' : '#64748b',
                          fontWeight: qf.type === t.id ? 800 : 600, fontSize: '0.85rem',
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
                        }}>
                        {t.label}
                        <div style={{ fontSize: '0.7rem', fontWeight: 500, marginTop: '2px', opacity: 0.75 }}>{t.desc}</div>
                      </button>
                    ))}
                  </div>

                  <form onSubmit={addQuestion}>
                    {/* Question text */}
                    <div style={{ marginBottom: '0.85rem' }}>
                      <label className="aa-label">❓ Question Text *</label>
                      <textarea className="aa-input" required style={{ minHeight: '75px' }}
                        value={qf.text} onChange={e => setQf(f => ({ ...f, text: e.target.value }))}
                        placeholder={
                          qf.type === 'theory' ? 'e.g. Explain the difference between let, const and var.' :
                          qf.type === 'sql'    ? 'e.g. Write a query to find all employees in Engineering with salary > 80000.' :
                          'Enter your question...'
                        } />
                    </div>

                    {/* MCQ options */}
                    {qf.type === 'mcq' && (
                      <div style={{ marginBottom: '0.85rem' }}>
                        <label className="aa-label">📋 Options</label>
                        {qf.options.map((opt, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
                            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(14,165,233,0.1)', color: '#0369a1', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <input className="aa-input" placeholder={`Option ${i + 1}`} value={opt}
                              onChange={e => { const o = [...qf.options]; o[i] = e.target.value; setQf(f => ({ ...f, options: o })); }} />
                          </div>
                        ))}
                        <button type="button" onClick={() => setQf(f => ({ ...f, options: [...f.options, ''] }))}
                          style={{ fontSize: '0.78rem', color: '#0ea5e9', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer', padding: '0.2rem 0' }}>
                          + Add option
                        </button>
                      </div>
                    )}

                    {/* MCQ correct answer */}
                    {qf.type === 'mcq' && (
                      <div style={{ marginBottom: '0.85rem' }}>
                        <label className="aa-label">✅ Correct Answer <span style={{ color: '#64748b', fontWeight: 400 }}>(exact text, case-insensitive)</span></label>
                        <input className="aa-input" required value={qf.correct} onChange={e => setQf(f => ({ ...f, correct: e.target.value }))} placeholder="Type the exact correct answer..." />
                      </div>
                    )}

                    {/* Theory model answer */}
                    {qf.type === 'theory' && (
                      <div style={{ marginBottom: '0.85rem', background: 'rgba(180,83,9,0.06)', border: '1px solid rgba(180,83,9,0.2)', borderRadius: '10px', padding: '0.85rem' }}>
                        <label className="aa-label" style={{ color: '#92400e' }}>📖 Model Answer <span style={{ fontWeight: 400, color: '#b45309' }}>(admin-only, not shown to candidates)</span></label>
                        <textarea className="aa-input" style={{ minHeight: '80px', background: '#fffbeb' }}
                          value={qf.modelAnswer} onChange={e => setQf(f => ({ ...f, modelAnswer: e.target.value }))}
                          placeholder="Write the expected model answer for your reference..." />
                        <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '0.35rem', fontWeight: 600 }}>
                          ✋ Theory questions are manually graded — candidates receive marks pending your review.
                        </div>
                      </div>
                    )}

                    {/* SQL fields */}
                    {qf.type === 'sql' && (
                      <div style={{ marginBottom: '0.85rem', border: '1.5px solid rgba(5,150,105,0.25)', borderRadius: '12px', padding: '1.25rem', background: 'rgba(5,150,105,0.03)' }}>
                        <div className="aa-section-title" style={{ color: '#065f46' }}>🗄️ SQL Question Settings</div>

                        <div style={{ marginBottom: '0.85rem' }}>
                          <label className="aa-label">Database Schema <span style={{ fontWeight: 400, color: '#64748b' }}>(CREATE TABLE + INSERT statements)</span></label>
                          <textarea
                            style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #334155', borderRadius: '10px', padding: '0.85rem', fontFamily: 'monospace', fontSize: '0.83rem', lineHeight: 1.65, background: '#0f172a', color: '#e2e8f0', resize: 'vertical', outline: 'none', minHeight: '130px' }}
                            value={qf.sqlSchema} onChange={e => setQf(f => ({ ...f, sqlSchema: e.target.value }))}
                            placeholder={"CREATE TABLE employees (\n  id INT,\n  name VARCHAR(50),\n  dept VARCHAR(50)\n);\nINSERT INTO employees VALUES (1,'Alice','Engineering');"} />
                        </div>

                        <div style={{ marginBottom: '0.85rem' }}>
                          <label className="aa-label">Expected Output <span style={{ fontWeight: 400, color: '#64748b' }}>(JSON array format)</span></label>
                          <textarea
                            style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #334155', borderRadius: '10px', padding: '0.85rem', fontFamily: 'monospace', fontSize: '0.83rem', lineHeight: 1.65, background: '#0f172a', color: '#86efac', resize: 'vertical', outline: 'none', minHeight: '80px' }}
                            value={qf.sqlExpected} onChange={e => setQf(f => ({ ...f, sqlExpected: e.target.value }))}
                            placeholder={'[{"id":1,"name":"Alice","dept":"Engineering"}]'} />
                        </div>

                        <div>
                          <label className="aa-label">Hint <span style={{ fontWeight: 400, color: '#64748b' }}>(optional, shown to candidate)</span></label>
                          <input className="aa-input" value={qf.sqlHint} onChange={e => setQf(f => ({ ...f, sqlHint: e.target.value }))} placeholder="e.g. Use WHERE to filter rows" />
                        </div>
                      </div>
                    )}

                    {/* Marks / Difficulty / Topic */}
                    <div className="aa-grid3" style={{ marginBottom: '0.85rem' }}>
                      <div>
                        <label className="aa-label">Marks</label>
                        <input type="number" className="aa-input" min={1} max={20} value={qf.marks} onChange={e => setQf(f => ({ ...f, marks: +e.target.value }))} />
                      </div>
                      <div>
                        <label className="aa-label">Difficulty</label>
                        <select className="aa-input" value={qf.difficulty} onChange={e => setQf(f => ({ ...f, difficulty: e.target.value }))}>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className="aa-label">Topic</label>
                        <input className="aa-input" value={qf.topic} onChange={e => setQf(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. SQL, React, Java" />
                      </div>
                    </div>

                    {/* Explanation */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label className="aa-label">💡 Explanation <span style={{ color: '#94a3b8', fontWeight: 400 }}>(shown after submission, optional)</span></label>
                      <textarea className="aa-input" style={{ minHeight: '55px' }} value={qf.explanation}
                        onChange={e => setQf(f => ({ ...f, explanation: e.target.value }))}
                        placeholder="Explain why the answer is correct..." />
                    </div>

                    <button type="submit" className="aa-btn aa-btn-primary" style={{ padding: '0.75rem 2rem' }}>
                      ✅ Add Question
                    </button>
                  </form>
                </div>

                {/* ── Questions list ── */}
                {(selTest.questions || []).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No questions yet. Add your first question above.</div>
                )}
                {(selTest.questions || []).map((q, i) => (
                  <div key={q._id} className="aa-q-item" style={{ flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', width: '100%' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(14,165,233,0.1)', color: '#0369a1', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: '0.35rem' }}>{q.text}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span className="aa-badge" style={{ background: `${TYPE_COLORS[q.type] || '#6b7280'}18`, color: TYPE_COLORS[q.type] || '#6b7280' }}>
                            {TYPE_ICONS[q.type] || '❓'} {q.type?.toUpperCase()}
                          </span>
                          <span className="aa-badge" style={{ background: 'rgba(0,0,0,0.04)', color: DIFF_COLORS[q.difficulty] || '#6b7280' }}>{q.difficulty}</span>
                          <span className="aa-badge" style={{ background: '#f1f5f9', color: '#475569' }}>{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                          {q.topic && <span className="aa-badge" style={{ background: '#f0f9ff', color: '#0369a1' }}>{q.topic}</span>}
                          {q.type === 'mcq'    && <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>✓ {q.correct}</span>}
                          {q.type === 'theory' && <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700, background: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '5px' }}>✋ Manual</span>}
                          {q.type === 'sql'    && <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, background: '#d1fae5', padding: '0.15rem 0.5rem', borderRadius: '5px' }}>🗄️ Auto-checked</span>}
                        </div>
                      </div>
                      <button className="aa-btn aa-btn-danger" style={{ padding: '0.4rem 0.7rem', flexShrink: 0 }} onClick={() => deleteQuestion(q._id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {q.sqlSchema && (
                      <pre style={{ background: '#0f172a', color: '#94a3b8', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.78rem', lineHeight: 1.5, overflowX: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {q.sqlSchema.substring(0, 80)}{q.sqlSchema.length > 80 ? '…' : ''}
                      </pre>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            CANDIDATES TAB
        ══════════════════════════════════════ */}
        {tab === 'candidates' && (
          <div>
            <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem', marginBottom: '1.25rem' }}>👥 Invite Candidates</h2>
            {!selTest ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                <UserCheck size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>Select a test first to invite candidates.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
                  {tests.map(t => (
                    <button key={t._id} className="aa-btn aa-btn-outline" onClick={() => setSelTest(t)}>{t.title}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="aa-card" style={{ marginBottom: '1.25rem', background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.2)' }}>
                  <div style={{ fontWeight: 800, color: '#0369a1' }}>Selected Test: {selTest.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Test link:{' '}
                    <code style={{ background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '5px' }}>
                      {window.location.origin}/test/{selTest._id}
                    </code>
                    <button className="aa-btn aa-btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', marginLeft: '0.5rem' }} onClick={() => copyTestLink(selTest._id)}>Copy</button>
                  </div>
                </div>

                {/* Already invited */}
                {(selTest.invitedCandidates || []).length > 0 && (
                  <div className="aa-card" style={{ marginBottom: '1.25rem' }}>
                    <div className="aa-section-title">✅ Already Invited ({selTest.invitedCandidates.length})</div>
                    {selTest.invitedCandidates.map(ic => (
                      <div key={ic.email} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.85rem', background: '#f8fafc', borderRadius: '9px', marginBottom: '0.4rem', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{ic.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {ic.email} · Code:{' '}
                            <strong style={{ fontFamily: 'monospace', color: '#0369a1', letterSpacing: '0.1em' }}>{ic.accessCode}</strong>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            📧 Invited {new Date(ic.invitedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button className="aa-btn" style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', border: '1px solid rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.08)', color: '#0369a1', fontWeight: 700 }}
                            onClick={() => resendInvite(ic.email)}>
                            <Mail size={12} style={{ marginRight: '0.3rem' }} />Resend
                          </button>
                          <button className="aa-btn aa-btn-danger" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => removeInvite(ic.email)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Invite from applications */}
                <div className="aa-card">
                  <div className="aa-section-title">📥 Add from Applications</div>
                  {applications.filter(a => !selTest.invitedCandidates?.some(ic => ic.email === a.email)).map(a => (
                    <div key={a._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '9px', marginBottom: '0.4rem', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{a.first_name} {a.last_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{a.email} · {a.job_title || 'General Application'}</div>
                      </div>
                      <button className="aa-btn aa-btn-success" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                        onClick={() => inviteCandidate(a._id, `${a.first_name} ${a.last_name}`)}>
                        Invite
                      </button>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No applications available.</div>
                  )}
                  {applications.length > 0 && applications.filter(a => !selTest.invitedCandidates?.some(ic => ic.email === a.email)).length === 0 && (
                    <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>✓ All applicants have been invited.</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════
            REPORTS TAB
        ══════════════════════════════════════ */}
        {tab === 'reports' && (
          <div>
            <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem', marginBottom: '1.25rem' }}>📊 Reports & Performance</h2>
            {tests.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                {tests.map(t => (
                  <button key={t._id}
                    className={`aa-btn ${selTest?._id === t._id ? 'aa-btn-primary' : 'aa-btn-outline'}`}
                    onClick={() => { loadAttempts(t._id); setSelTest(t); }}>
                    {t.title}
                  </button>
                ))}
              </div>
            )}

            {!selTest
              ? <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Select a test above to view reports.</div>
              : attempts.length === 0
                ? <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No attempts yet for this test.</div>
                : (
                  <div className="aa-card">
                    <div className="aa-section-title">Attempts — {selTest.title}</div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            {['#', 'Candidate', 'Email', 'Score', '%', 'Status', 'Violations', 'Time', 'Submitted'].map(h => (
                              <th key={h} style={{ padding: '0.65rem 0.85rem', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {attempts.map((a, i) => (
                            <tr key={a._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '0.75rem 0.85rem', color: '#94a3b8', fontWeight: 700 }}>{i + 1}</td>
                              <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#0f172a' }}>{a.candidate?.name || '—'}</td>
                              <td style={{ padding: '0.75rem 0.85rem', color: '#64748b' }}>{a.candidate?.email}</td>
                              <td style={{ padding: '0.75rem 0.85rem', fontWeight: 700 }}>{a.score}/{a.totalMarks}</td>
                              <td style={{ padding: '0.75rem 0.85rem' }}>
                                <span style={{ fontWeight: 800, color: a.passed ? '#10b981' : '#ef4444' }}>{a.percentage}%</span>
                              </td>
                              <td style={{ padding: '0.75rem 0.85rem' }}>
                                <span className="aa-badge" style={{
                                  background: a.status === 'submitted' ? 'rgba(16,185,129,0.1)' : a.status === 'terminated' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                  color: a.status === 'submitted' ? '#10b981' : a.status === 'terminated' ? '#ef4444' : '#f59e0b',
                                }}>{a.status}</span>
                              </td>
                              <td style={{ padding: '0.75rem 0.85rem' }}>
                                {(a.violations || []).length > 0 ? (
                                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                    {a.violations.map(v => (
                                      <span key={v.type} className="aa-violation">{v.type} ×{v.count}</span>
                                    ))}
                                  </div>
                                ) : (
                                  <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 700 }}>✓ Clean</span>
                                )}
                              </td>
                              <td style={{ padding: '0.75rem 0.85rem', color: '#64748b' }}>
                                {Math.floor((a.timeTaken || 0) / 60)}m {(a.timeTaken || 0) % 60}s
                              </td>
                              <td style={{ padding: '0.75rem 0.85rem', color: '#64748b', fontSize: '0.8rem' }}>
                                {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#64748b' }}>
                      <span>Total: <strong>{attempts.length}</strong></span>
                      <span>Passed: <strong style={{ color: '#10b981' }}>{attempts.filter(a => a.passed).length}</strong></span>
                      <span>Failed: <strong style={{ color: '#ef4444' }}>{attempts.filter(a => !a.passed && a.status === 'submitted').length}</strong></span>
                      <span>Terminated: <strong style={{ color: '#f59e0b' }}>{attempts.filter(a => a.status === 'terminated').length}</strong></span>
                      {attempts.length > 0 && (
                        <span>Avg Score: <strong>
                          {Math.round(
                            attempts.filter(a => a.status === 'submitted').reduce((sum, a) => sum + a.percentage, 0) /
                            (attempts.filter(a => a.status === 'submitted').length || 1)
                          )}%
                        </strong></span>
                      )}
                    </div>
                  </div>
                )
            }
          </div>
        )}

        {/* ══════════════════════════════════════
            SQL RUNNER TAB
        ══════════════════════════════════════ */}
        {tab === 'sql-runner' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Database size={22} style={{ color: '#059669' }} />
              <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.2rem', margin: 0 }}>SQL Runner</h2>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem', marginTop: '0.25rem' }}>
              Write and execute SQL queries against a temporary in-memory database. Perfect for testing question schemas before adding them.
            </p>

            <div className="aa-card" style={{ marginBottom: '1.25rem' }}>
              <div className="aa-sql-runner">
                {/* Schema panel */}
                <div>
                  <label className="aa-label" style={{ marginBottom: '0.5rem', color: '#0f172a', fontSize: '0.82rem' }}>
                    🗃️ Database Schema
                    <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: '0.5rem' }}>CREATE TABLE + INSERT</span>
                  </label>
                  <textarea
                    className="aa-sql-textarea"
                    value={sqlRunnerSchema}
                    onChange={e => setSqlRunnerSchema(e.target.value)}
                    placeholder={"CREATE TABLE employees (\n  id INT,\n  name VARCHAR(50),\n  dept VARCHAR(50),\n  salary INT\n);\nINSERT INTO employees VALUES (1,'Alice','Engineering',90000);"}
                  />
                </div>

                {/* Query panel */}
                <div>
                  <label className="aa-label" style={{ marginBottom: '0.5rem', color: '#0f172a', fontSize: '0.82rem' }}>
                    ⌨️ SQL Query
                  </label>
                  <textarea
                    className="aa-sql-textarea"
                    value={sqlRunnerQuery}
                    onChange={e => setSqlRunnerQuery(e.target.value)}
                    placeholder={"SELECT * FROM employees\nWHERE dept = 'Engineering'\nORDER BY salary DESC;"}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <button className="aa-btn aa-btn-primary" onClick={adminRunSql} disabled={sqlRunnerBusy}
                  style={{ padding: '0.7rem 2rem', fontSize: '0.92rem', opacity: sqlRunnerBusy ? 0.7 : 1 }}>
                  {sqlRunnerBusy ? '⏳ Running…' : '▶ Run SQL'}
                </button>
              </div>
            </div>

            {/* Output */}
            {sqlRunnerResult && (
              <div className="aa-card">
                <div className="aa-section-title">Output</div>

                {sqlRunnerResult.error ? (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', marginBottom: '0.4rem' }}>⚠️ Error</div>
                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.85rem', color: '#dc2626', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{sqlRunnerResult.error}</pre>
                  </div>
                ) : Array.isArray(sqlRunnerResult.rows) ? (
                  sqlRunnerResult.rows.length === 0 ? (
                    <div style={{ color: '#94a3b8', fontStyle: 'italic', padding: '0.75rem' }}>Query returned 0 rows.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="aa-sql-table">
                        <thead>
                          <tr>
                            {Object.keys(sqlRunnerResult.rows[0]).map(col => (
                              <th key={col}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sqlRunnerResult.rows.map((row, ri) => (
                            <tr key={ri}>
                              {Object.values(row).map((val, vi) => (
                                <td key={vi}>{val === null ? <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>NULL</span> : String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        {sqlRunnerResult.rows.length} row{sqlRunnerResult.rows.length !== 1 ? 's' : ''} returned
                      </div>
                    </div>
                  )
                ) : (
                  <pre style={{ background: '#0f172a', color: '#86efac', borderRadius: '8px', padding: '1rem', fontSize: '0.85rem', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {JSON.stringify(sqlRunnerResult, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Info box */}
            <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid rgba(5,150,105,0.25)', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontWeight: 800, color: '#065f46', marginBottom: '0.5rem', fontSize: '0.92rem' }}>ℹ️ About SQL Runner</div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#374151', lineHeight: 1.7 }}>
                SQL Runner uses <strong>alasql</strong> — a pure JavaScript in-memory SQL engine. No external database needed.
                Supports <code style={{ background: 'rgba(5,150,105,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.82rem' }}>SELECT</code>,{' '}
                <code style={{ background: 'rgba(5,150,105,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.82rem' }}>JOINs</code>,{' '}
                <code style={{ background: 'rgba(5,150,105,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.82rem' }}>WHERE</code>,{' '}
                <code style={{ background: 'rgba(5,150,105,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.82rem' }}>GROUP BY</code>,{' '}
                <code style={{ background: 'rgba(5,150,105,0.1)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontSize: '0.82rem' }}>ORDER BY</code>, and aggregate functions.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
