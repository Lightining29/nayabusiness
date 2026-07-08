import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

/* ─── SQL Question Component ──────────────────────────────────── */
function SqlQuestion({ question, value, onChange }) {
  const [runResult, setRunResult] = useState(null);
  const [running,   setRunning]   = useState(false);

  const runSql = async () => {
    if (!value.trim()) return;
    setRunning(true); setRunResult(null);
    try {
      const r = await fetch('/api/assessment/run-sql', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schema: question.sqlSchema || '', query: value })
      });
      setRunResult(await r.json());
    } catch (e) { setRunResult({ error: e.message }); }
    finally { setRunning(false); }
  };

  return (
    <div>
      {/* Schema reference */}
      {question.sqlSchema && (
        <div style={{ marginBottom:'1rem' }}>
          <div style={{ fontSize:'0.75rem', fontWeight:800, color:'#64748b', marginBottom:'0.4rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>
            📋 Database Schema
          </div>
          <pre style={{ background:'#0f172a', color:'#94a3b8', borderRadius:'10px', padding:'0.85rem 1rem', fontSize:'0.8rem', lineHeight:1.65, margin:0, overflowX:'auto', whiteSpace:'pre-wrap', wordBreak:'break-word', border:'1px solid #1e293b' }}>
            {question.sqlSchema}
          </pre>
        </div>
      )}

      {/* Hint */}
      {question.sqlHint && (
        <div style={{ marginBottom:'0.75rem', fontSize:'0.82rem', color:'#0369a1', background:'#eff6ff', padding:'0.5rem 0.85rem', borderRadius:'7px', border:'1px solid #bfdbfe', fontWeight:600 }}>
          💡 Hint: {question.sqlHint}
        </div>
      )}

      {/* SQL editor label */}
      <div style={{ fontSize:'0.82rem', color:'#065f46', marginBottom:'0.5rem', fontWeight:700, background:'#f0fdf4', padding:'0.5rem 0.85rem', borderRadius:'7px', border:'1px solid #bbf7d0' }}>
        🗄️ Write your SQL query below. Only SELECT queries are allowed.
      </div>

      {/* SQL textarea */}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={'SELECT * FROM employees\nWHERE salary > 80000\nORDER BY salary DESC;'}
        style={{
          width:'100%', boxSizing:'border-box', padding:'0.9rem 1rem',
          border:'2px solid #1e293b', borderRadius:'10px',
          fontFamily:"'Courier New', Courier, monospace", fontSize:'0.92rem',
          minHeight:'130px', outline:'none', resize:'vertical',
          background:'#0f172a', color:'#e2e8f0', lineHeight:1.7,
          transition:'border-color 0.18s', caretColor:'#10b981'
        }}
        onFocus={e => e.target.style.borderColor='#10b981'}
        onBlur={e => e.target.style.borderColor='#1e293b'}
        spellCheck={false}
      />

      {/* Run button */}
      <div style={{ marginTop:'0.65rem', display:'flex', gap:'0.75rem', alignItems:'center' }}>
        <button onClick={runSql} disabled={running || !value.trim()}
          style={{ padding:'0.5rem 1.25rem', borderRadius:'9px', border:'none', cursor: running || !value.trim() ? 'not-allowed':'pointer', fontFamily:'inherit', fontWeight:700, fontSize:'0.84rem', background:'rgba(5,150,105,0.15)', color:'#059669', transition:'all 0.18s', opacity: running || !value.trim() ? 0.6:1 }}>
          {running ? '⏳ Running…' : '▶ Test Query'}
        </button>
        <span style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Test your query before submitting</span>
      </div>

      {/* Run output */}
      {runResult && (
        <div style={{ marginTop:'0.85rem', background:'#0d1117', border:'1px solid #1e293b', borderRadius:'10px', padding:'0.85rem 1rem', maxHeight:'220px', overflowY:'auto' }}>
          {runResult.error ? (
            <div>
              <div style={{ fontSize:'0.72rem', fontWeight:800, color:'#ef4444', marginBottom:'0.35rem' }}>⚠️ Error</div>
              <pre style={{ margin:0, fontFamily:'monospace', fontSize:'0.82rem', color:'#f87171', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{runResult.error}</pre>
            </div>
          ) : Array.isArray(runResult.rows) ? (
            <div>
              <div style={{ fontSize:'0.72rem', fontWeight:800, color:'#64748b', marginBottom:'0.5rem' }}>
                Output — {runResult.rows.length} row{runResult.rows.length !== 1 ? 's' : ''}
              </div>
              {runResult.rows.length === 0
                ? <div style={{ color:'#64748b', fontStyle:'italic', fontSize:'0.82rem' }}>Query returned 0 rows.</div>
                : (
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.8rem' }}>
                    <thead>
                      <tr>
                        {Object.keys(runResult.rows[0]).map(col => (
                          <th key={col} style={{ padding:'0.3rem 0.65rem', textAlign:'left', fontWeight:700, color:'#94a3b8', borderBottom:'1px solid #1e293b', whiteSpace:'nowrap' }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {runResult.rows.map((row, ri) => (
                        <tr key={ri}>
                          {Object.values(row).map((val, vi) => (
                            <td key={vi} style={{ padding:'0.3rem 0.65rem', color:'#e2e8f0', borderBottom:'1px solid #0f172a', fontFamily:'monospace' }}>
                              {val === null ? <span style={{ color:'#475569', fontStyle:'italic' }}>NULL</span> : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              }
            </div>
          ) : (
            <pre style={{ margin:0, color:'#86efac', fontFamily:'monospace', fontSize:'0.82rem', whiteSpace:'pre-wrap' }}>
              {JSON.stringify(runResult, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Access Gate ─────────────────────────────────────────────── */
function AccessGate({ assessmentId, onStart }) {
  const [email, setEmail] = useState('');
  const [code, setCode]   = useState('');
  const [busy, setBusy]   = useState(false);

  const verify = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/assessment/verify-access', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, email: email.trim(), accessCode: code.trim().toUpperCase() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onStart({ email: email.trim(), accessCode: code.trim().toUpperCase(), meta: data });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Access Denied', text: err.message, confirmButtonColor: '#ef4444' });
    } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: '420px', width: '100%', background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 25px 70px rgba(0,0,0,0.35)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🔐</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Enter Test</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>Enter your email and access code to begin</p>
        </div>
        <form onSubmit={verify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Access Code</label>
            <input type="text" required value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. A3F9C1" maxLength={6}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '1.1rem', letterSpacing: '0.2em', fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <button type="submit" disabled={busy} style={{ padding: '0.9rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', color: 'white', fontSize: '1rem', fontWeight: 800, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1, fontFamily: 'inherit' }}>
            {busy ? '⏳ Verifying...' : '🚀 Start Test'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Test Instructions ───────────────────────────────────────── */
function Instructions({ meta, onConfirm }) {
  const [agreed, setAgreed] = useState(false);
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: '580px', width: '100%', background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 25px 70px rgba(0,0,0,0.35)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>📋 {meta.assessmentTitle}</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Welcome, <strong>{meta.name}</strong>! Please read the instructions carefully.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[['⏱️ Duration', `${meta.duration} minutes`], ['❓ Questions', meta.questionCount], ['📝 Type', 'MCQ / True-False'], ['🎯 Mode', 'Online Proctored']].map(([l, v]) => (
            <div key={l} style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.85rem', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{l}</div>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 800, color: '#92400e', marginBottom: '0.6rem', fontSize: '0.9rem' }}>⚠️ Anti-Cheat Rules</div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {['Do not switch browser tabs — 3 violations will terminate the test','Right-click is disabled during the test','Opening DevTools will flag a violation','Copy-paste is disabled','Do not refresh the page — your progress is saved','Submit before the timer runs out'].map(r => (
              <li key={r} style={{ color: '#78350f', fontSize: '0.82rem' }}>{r}</li>
            ))}
          </ul>
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1.25rem' }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0 }} />
          <span style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>I have read and agree to the test rules. I understand that violations may lead to disqualification.</span>
        </label>
        <button onClick={onConfirm} disabled={!agreed} style={{ width: '100%', padding: '0.95rem', borderRadius: '12px', border: 'none', background: agreed ? 'linear-gradient(135deg,#10b981,#059669)' : '#e2e8f0', color: agreed ? 'white' : '#94a3b8', fontSize: '1rem', fontWeight: 800, cursor: agreed ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.2s' }}>
          ✅ I Agree — Start Test Now
        </button>
      </div>
    </div>
  );
}

/* ─── Timer ───────────────────────────────────────────────────── */
function useTimer(durationMinutes, onExpire) {
  const [secs, setSecs] = useState(durationMinutes * 60);
  const ref = useRef(null);
  useEffect(() => {
    ref.current = setInterval(() => setSecs(s => {
      if (s <= 1) { clearInterval(ref.current); onExpire(); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(ref.current);
  }, []);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return { display: `${m}:${s}`, secs, urgent: secs < 120 };
}

/* ─── Main Test Engine ────────────────────────────────────────── */
function TestEngine({ assessmentId, email, accessCode, onSubmit }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]     = useState({});
  const [current, setCurrent]     = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [duration, setDuration]   = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());
  const violationLog = useRef({});

  /* ── log violation ── */
  const logViolation = useCallback(async (type) => {
    if (!attemptId) return;
    violationLog.current[type] = (violationLog.current[type] || 0) + 1;
    try {
      const r = await fetch('/api/assessment/violation', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, type })
      });
      const d = await r.json();
      if (d.status === 'terminated') {
        Swal.fire({ icon: 'error', title: '🚫 Test Terminated', text: 'Too many tab-switch violations. Your test has been terminated.', allowOutsideClick: false, confirmButtonColor: '#ef4444' })
          .then(() => onSubmit(null));
      }
    } catch {}
  }, [attemptId, onSubmit]);

  /* ── anti-cheat hooks ── */
  useEffect(() => {
    if (!attemptId) return;

    // Right-click disable
    const noRight = e => { e.preventDefault(); logViolation('right-click'); };
    // Copy-paste disable
    const noCopy  = e => { e.preventDefault(); logViolation('copy'); };
    // Tab switch
    const onVis = () => { if (document.hidden) logViolation('tab-switch'); };
    // DevTools detection (F12 / size change)
    const noF12 = e => { if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'J')) { e.preventDefault(); logViolation('devtools'); } };
    // Detect devtools via window size
    const devCheck = setInterval(() => {
      if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) logViolation('devtools');
    }, 3000);
    // Beforeunload warning
    const onUnload = e => { e.preventDefault(); e.returnValue = ''; };

    document.addEventListener('contextmenu', noRight);
    document.addEventListener('copy',  noCopy);
    document.addEventListener('cut',   noCopy);
    document.addEventListener('paste', noCopy);
    document.addEventListener('visibilitychange', onVis);
    document.addEventListener('keydown', noF12);
    window.addEventListener('beforeunload', onUnload);

    return () => {
      document.removeEventListener('contextmenu', noRight);
      document.removeEventListener('copy',  noCopy);
      document.removeEventListener('cut',   noCopy);
      document.removeEventListener('paste', noCopy);
      document.removeEventListener('visibilitychange', onVis);
      document.removeEventListener('keydown', noF12);
      window.removeEventListener('beforeunload', onUnload);
      clearInterval(devCheck);
    };
  }, [attemptId, logViolation]);

  /* ── load questions ── */
  useEffect(() => {
    fetch('/api/assessment/start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentId, email, accessCode })
    }).then(r => r.json()).then(d => {
      if (d.error) { Swal.fire({ icon: 'error', title: 'Error', text: d.error }); return; }
      setAttemptId(d.attemptId);
      setQuestions(d.questions);
      setDuration(d.duration);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [assessmentId, email, accessCode]);

  const submit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const ans = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
    const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
    try {
      const r = await fetch('/api/assessment/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, answers: ans, timeTaken })
      });
      const d = await r.json();
      onSubmit(d);
    } catch { setSubmitting(false); }
  }, [attemptId, answers, submitting, onSubmit]);

  const { display, urgent } = useTimer(duration, submit);
  const q = questions[current];
  const answered = Object.keys(answers).length;

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700 }}>⏳ Loading test...</div>
    </div>
  );

  if (!q) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', userSelect: 'none' }}>
      <style>{`
        .test-header { background:linear-gradient(135deg,#0f172a,#1e3a5f); color:white; padding:0.85rem 1.5rem;
          display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap; position:sticky; top:0; z-index:100; }
        .test-timer { font-size:1.4rem; font-weight:800; font-family:monospace; padding:0.4rem 1rem;
          border-radius:10px; background:rgba(255,255,255,0.12); }
        .test-timer.urgent { background:#ef4444; animation:pulse 1s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
        .test-body { max-width:860px; margin:0 auto; padding:1.5rem; }
        .test-progress-bar { height:6px; background:#e2e8f0; border-radius:3px; margin-bottom:1.5rem; overflow:hidden; }
        .test-progress-fill { height:100%; background:linear-gradient(90deg,#0ea5e9,#06b6d4); border-radius:3px; transition:width 0.3s; }
        .test-card { background:white; border-radius:18px; padding:2rem; box-shadow:0 4px 20px rgba(0,0,0,0.07); margin-bottom:1.25rem; }
        .test-q-num { font-size:0.75rem; font-weight:800; color:#94a3b8; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.75rem; }
        .test-q-text { font-size:1.1rem; font-weight:700; color:#0f172a; line-height:1.6; margin-bottom:1.5rem; }
        .test-option { display:flex; align-items:center; gap:0.85rem; padding:0.9rem 1.1rem;
          border:2px solid #e2e8f0; border-radius:12px; cursor:pointer; transition:all 0.18s; margin-bottom:0.6rem;
          font-size:0.95rem; font-weight:500; color:#1e293b; background:white; }
        .test-option:hover { border-color:#0ea5e9; background:#f0f9ff; }
        .test-option.selected { border-color:#0ea5e9; background:#eff6ff; color:#0369a1; font-weight:700; }
        .test-option-dot { width:20px; height:20px; border-radius:50%; border:2px solid #cbd5e1; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .test-option.selected .test-option-dot { border-color:#0ea5e9; background:#0ea5e9; }
        .test-option.selected .test-option-dot::after { content:''; width:8px; height:8px; border-radius:50%; background:white; }
        .test-nav { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; }
        .test-btn { padding:0.7rem 1.5rem; border-radius:10px; border:none; cursor:pointer; font-family:inherit; font-weight:700; font-size:0.9rem; transition:all 0.18s; }
        .test-btn-outline { background:white; border:1.5px solid #e2e8f0; color:#475569; }
        .test-btn-outline:hover { border-color:#0ea5e9; color:#0ea5e9; }
        .test-btn-primary { background:linear-gradient(135deg,#0ea5e9,#0369a1); color:white; box-shadow:0 4px 15px rgba(14,165,233,0.3); }
        .test-btn-submit { background:linear-gradient(135deg,#10b981,#059669); color:white; box-shadow:0 4px 15px rgba(16,185,129,0.3); }
        .test-palette { display:flex; flex-wrap:wrap; gap:0.35rem; }
        .test-palette-dot { width:28px; height:28px; border-radius:6px; border:2px solid #e2e8f0;
          cursor:pointer; font-size:0.72rem; font-weight:700; display:flex; align-items:center; justify-content:center;
          background:white; color:#64748b; transition:all 0.15s; }
        .test-palette-dot.current { border-color:#0ea5e9; background:#eff6ff; color:#0369a1; }
        .test-palette-dot.answered { border-color:#10b981; background:#ecfdf5; color:#065f46; }
      `}</style>

      {/* Sticky header */}
      <div className="test-header">
        <div style={{ fontWeight: 800, fontSize: '1rem' }}>🧪 Online Assessment</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.85rem', opacity: 0.75 }}>{answered}/{questions.length} answered</span>
          <div className={`test-timer ${urgent ? 'urgent' : ''}`}>{display}</div>
        </div>
      </div>

      <div className="test-body">
        {/* Progress */}
        <div className="test-progress-bar">
          <div className="test-progress-fill" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>

        {/* Question card */}
        <div className="test-card">
          {/* Meta row */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem', flexWrap:'wrap', gap:'0.5rem' }}>
            <div className="test-q-num">Question {current + 1} of {questions.length} · {q.topic || 'General'}</div>
            <div style={{ display:'flex', gap:'0.4rem' }}>
              {q.type === 'mcq'    && <span style={{ fontSize:'0.72rem', fontWeight:800, padding:'0.2rem 0.55rem', borderRadius:'6px', background:'#eff6ff', color:'#1d4ed8' }}>🔘 MCQ</span>}
              {q.type === 'theory' && <span style={{ fontSize:'0.72rem', fontWeight:800, padding:'0.2rem 0.55rem', borderRadius:'6px', background:'#fef3c7', color:'#92400e' }}>📝 Theory</span>}
              {q.type === 'sql'    && <span style={{ fontSize:'0.72rem', fontWeight:800, padding:'0.2rem 0.55rem', borderRadius:'6px', background:'#f0fdf4', color:'#15803d' }}>🗄️ SQL</span>}
            </div>
          </div>

          {/* Question text */}
          <div className="test-q-text">{q.text}</div>

          {/* ── MCQ options ── */}
          {q.type === 'mcq' && (q.options || []).map((opt, oi) => (
            <div key={oi} className={`test-option ${answers[q._id] === opt ? 'selected' : ''}`}
              onClick={() => setAnswers(a => ({ ...a, [q._id]: opt }))}>
              <div className="test-option-dot" />
              <span style={{ flex:1 }}>{opt}</span>
            </div>
          ))}

          {/* ── Theory ── */}
          {q.type === 'theory' && (
            <div>
              <div style={{ fontSize:'0.82rem', color:'#92400e', marginBottom:'0.5rem', fontWeight:700, background:'#fef9f0', padding:'0.5rem 0.85rem', borderRadius:'7px', border:'1px solid #fed7aa' }}>
                📝 Write a detailed answer. Be clear and well-structured.
              </div>
              <textarea placeholder="Write your answer here..."
                value={answers[q._id] || ''}
                onChange={e => setAnswers(a => ({ ...a, [q._id]: e.target.value }))}
                style={{ width:'100%', padding:'0.9rem 1rem', border:'2px solid #e2e8f0', borderRadius:'10px', fontFamily:'inherit', fontSize:'0.92rem', minHeight:'180px', outline:'none', resize:'vertical', boxSizing:'border-box', lineHeight:1.7, transition:'border-color 0.18s' }}
                onFocus={e => e.target.style.borderColor='#f59e0b'}
                onBlur={e => e.target.style.borderColor='#e2e8f0'} />
              <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:'0.35rem', textAlign:'right' }}>
                {(answers[q._id] || '').length} characters
              </div>
            </div>
          )}

          {/* ── SQL ── */}
          {q.type === 'sql' && (
            <SqlQuestion
              question={q}
              value={answers[q._id] || ''}
              onChange={val => setAnswers(a => ({ ...a, [q._id]: val }))}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="test-nav">
          <button className="test-btn test-btn-outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>← Prev</button>
          <div className="test-palette">
            {questions.map((_, i) => (
              <div key={i} className={`test-palette-dot ${i === current ? 'current' : ''} ${answers[questions[i]?._id] ? 'answered' : ''}`}
                onClick={() => setCurrent(i)}>{i + 1}</div>
            ))}
          </div>
          {current < questions.length - 1
            ? <button className="test-btn test-btn-primary" onClick={() => setCurrent(c => c + 1)}>Next →</button>
            : <button className="test-btn test-btn-submit" disabled={submitting}
                onClick={async () => {
                  const unanswered = questions.length - answered;
                  if (unanswered > 0) {
                    const r = await Swal.fire({ icon: 'warning', title: 'Unanswered Questions', text: `You have ${unanswered} unanswered question(s). Submit anyway?`, showCancelButton: true, confirmButtonColor: '#10b981', cancelButtonColor: '#6b7280', confirmButtonText: 'Submit', cancelButtonText: 'Review' });
                    if (!r.isConfirmed) return;
                  }
                  submit();
                }}>
                {submitting ? '⏳ Submitting...' : '✅ Submit Test'}
              </button>
          }
        </div>
      </div>
    </div>
  );
}

/* ─── Result Screen ───────────────────────────────────────────── */
function ResultScreen({ result, email, attemptId }) {
  const pct = result?.percentage ?? 0;
  const passed = result?.passed;
  return (
    <div style={{ minHeight: '100vh', background: passed ? 'linear-gradient(135deg,#ecfdf5,#d1fae5)' : 'linear-gradient(135deg,#fef2f2,#fee2e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ maxWidth: '540px', width: '100%', background: 'white', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{passed ? '🎉' : '😔'}</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          {passed ? 'Congratulations!' : 'Better Luck Next Time'}
        </h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          {passed ? 'You passed the assessment.' : 'You did not meet the passing score.'}
        </p>
        {result?.submitted ? (
          <div style={{ background: '#f1f5f9', borderRadius: '14px', padding: '1.5rem', color: '#475569' }}>Results are hidden by the administrator.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {[['Score', `${result?.score ?? 0} / ${result?.totalMarks ?? 0}`], ['Percentage', `${pct}%`], ['Passing Score', `${result?.passingScore ?? 0}%`], ['Result', passed ? '✅ PASS' : '❌ FAIL']].map(([l,v]) => (
              <div key={l} style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{l}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: passed ? '#10b981' : '#ef4444', marginTop: '0.2rem' }}>{v}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#475569' }}>
          📧 The HR team at Rancom Technologies will contact you regarding next steps.
        </div>
        <a href="/" style={{ display: 'inline-block', padding: '0.85rem 2rem', background: 'linear-gradient(135deg,#0ea5e9,#0369a1)', color: 'white', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', fontSize: '0.95rem' }}>
          Back to Home
        </a>
      </div>
    </div>
  );
}

/* ─── Root Component ──────────────────────────────────────────── */
export default function TakeTest() {
  const { id } = useParams();
  const [stage, setStage] = useState('gate'); // gate | instructions | test | result
  const [access, setAccess] = useState(null);
  const [result, setResult] = useState(null);

  if (stage === 'gate') return <AccessGate assessmentId={id} onStart={a => { setAccess(a); setStage('instructions'); }} />;
  if (stage === 'instructions') return <Instructions meta={access.meta} onConfirm={() => setStage('test')} />;
  if (stage === 'test') return <TestEngine assessmentId={id} email={access.email} accessCode={access.accessCode} onSubmit={r => { setResult(r); setStage('result'); }} />;
  if (stage === 'result') return <ResultScreen result={result} email={access?.email} />;
  return null;
}
