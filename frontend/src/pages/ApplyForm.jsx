import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const FIELDS = [
  { id: 'fullName',      label: 'Full Name',             type: 'text',   placeholder: 'Enter your full name',            required: true },
  { id: 'email',         label: 'Email Address',         type: 'email',  placeholder: 'Enter your email address',        required: true },
  { id: 'phone',         label: 'Mobile Number',         type: 'tel',    placeholder: 'e.g. +91 98765 43210',            required: true },
  { id: 'dob',           label: 'Date of Birth',         type: 'date',   placeholder: '',                                required: true },
  { id: 'gender',        label: 'Gender',                type: 'select', options: ['Male','Female','Other','Prefer not to say'], required: true },
  { id: 'city',          label: 'Current City',          type: 'text',   placeholder: 'e.g. Noida, Delhi',              required: true },
  { id: 'qualification', label: 'Highest Qualification', type: 'text',   placeholder: 'e.g. B.Tech CSE, MCA',           required: true },
  { id: 'college',       label: 'College / University',  type: 'text',   placeholder: 'Enter your institution name',    required: false },
  { id: 'passingYear',   label: 'Year of Passing',       type: 'number', placeholder: 'e.g. 2023',                      required: false },
  { id: 'experience',    label: 'Years of Experience',   type: 'select', options: ['Fresher','Less than 1 year','1-2 years','2-4 years','4+ years'], required: true },
  { id: 'currentCTC',    label: 'Current CTC',           type: 'text',   placeholder: 'e.g. 4 LPA or Fresher',         required: false },
  { id: 'expectedCTC',   label: 'Expected CTC',          type: 'text',   placeholder: 'e.g. 6 LPA',                    required: false },
  { id: 'noticePeriod',  label: 'Notice Period',         type: 'select', options: ['Immediately','15 days','30 days','60 days','90 days'], required: true },
  { id: 'skills',        label: 'Key Skills',            type: 'textarea',placeholder: 'e.g. React, Node.js, Java, Python...', required: true },
  { id: 'linkedIn',      label: 'LinkedIn Profile URL',  type: 'url',    placeholder: 'https://linkedin.com/in/your-name', required: false },
  { id: 'portfolio',     label: 'Portfolio / GitHub URL',type: 'url',    placeholder: 'https://github.com/your-name',   required: false },
  { id: 'referral',      label: 'How did you hear about us?', type: 'select', options: ['LinkedIn','Naukri','Indeed','Company Website','Referral','Other'], required: false },
  { id: 'message',       label: 'Cover Letter / Message',type: 'textarea',placeholder: 'Tell us why you are a great fit for Rancom Technologies...', required: false },
];

export default function ApplyForm() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ position: 'General Application' });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(d => setJobs(d.filter(j => j.isActive))).catch(() => {});
  }, []);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume) {
      Swal.fire({ icon: 'warning', title: 'Resume Required', text: 'Please upload your resume (PDF only).', confirmButtonColor: '#0ea5e9' });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v || ''));
      fd.append('resume', resume);
      const res = await fetch('/api/apply', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#ef4444' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '540px', width: '100%', textAlign: 'center', background: 'white', borderRadius: '24px', padding: '3rem 2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Application Submitted!</h1>
        <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Thank you for applying to <strong>Rancom Technologies</strong>. Our HR team will review your application and reach out within 3–5 business days.
        </p>
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
          <p style={{ color: '#065f46', fontSize: '0.9rem', fontWeight: 600 }}>
            📧 Check your email — you may receive a test invitation link if shortlisted.
          </p>
        </div>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f9ff 0%, #fafafa 100%)', paddingTop: '2rem', paddingBottom: '4rem' }}>
      <style>{`
        .apply-wrap { max-width: 780px; margin: 0 auto; padding: 0 1.25rem; }
        .apply-hero { background: linear-gradient(135deg,#0f172a,#1e40af); border-radius: 20px;
          padding: 2.5rem 2rem; color: white; text-align: center; margin-bottom: 2rem; }
        .apply-hero h1 { font-size: 2rem; font-weight: 800; color: white; margin-bottom: 0.5rem; }
        .apply-hero p  { font-size: 1rem; color: rgba(255,255,255,0.75); max-width: 500px; margin: 0 auto; }
        .apply-card { background: white; border-radius: 20px; padding: 2rem;
          box-shadow: 0 4px 30px rgba(0,0,0,0.06); border: 1px solid rgba(14,165,233,0.12); margin-bottom: 1.5rem; }
        .apply-section-title { font-size: 0.75rem; font-weight: 800; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.25rem;
          padding-bottom: 0.5rem; border-bottom: 2px solid rgba(14,165,233,0.1); display: flex; align-items: center; gap: 0.5rem; }
        .apply-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .apply-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .apply-field label { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
        .apply-field label span { color: #ef4444; }
        .apply-input { border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0.75rem 1rem;
          font-family: inherit; font-size: 0.92rem; color: #0f172a; background: #f8fafc;
          transition: all 0.18s; outline: none; width: 100%; }
        .apply-input:focus { border-color: #0ea5e9; background: white; box-shadow: 0 0 0 3px rgba(14,165,233,0.12); }
        .apply-input::placeholder { color: #94a3b8; }
        .apply-textarea { min-height: 100px; resize: vertical; }
        .apply-file-zone { border: 2px dashed rgba(14,165,233,0.35); border-radius: 12px;
          padding: 1.5rem; text-align: center; cursor: pointer; background: rgba(14,165,233,0.03);
          transition: all 0.2s; }
        .apply-file-zone:hover { border-color: #0ea5e9; background: rgba(14,165,233,0.06); }
        .apply-submit { width: 100%; padding: 1rem; border-radius: 14px; border: none; cursor: pointer;
          background: linear-gradient(135deg,#0ea5e9,#0369a1); color: white; font-size: 1.05rem;
          font-weight: 800; font-family: inherit; transition: all 0.2s;
          box-shadow: 0 6px 25px rgba(14,165,233,0.4); }
        .apply-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 35px rgba(14,165,233,0.5); }
        .apply-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .apply-progress { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap; }
        .apply-step { display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem;
          font-weight: 700; color: #94a3b8; }
        .apply-step.done { color: #10b981; }
        @media(max-width:640px){ .apply-grid { grid-template-columns: 1fr; } .apply-hero h1 { font-size: 1.5rem; } }
      `}</style>

      <div className="apply-wrap">
        {/* Hero */}
        <div className="apply-hero">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💼</div>
          <h1>Apply at Rancom Technologies</h1>
          <p>Fill in your details below. Our HR team reviews every application personally.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            {['100% Free','Quick 5-min Form','Instant Confirmation'].map(t => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '20px', padding: '0.3rem 0.85rem', fontSize: '0.8rem', fontWeight: 600 }}>✓ {t}</span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Position */}
          <div className="apply-card">
            <div className="apply-section-title">🎯 Position Applied For</div>
            <div className="apply-field">
              <label>Select Position <span>*</span></label>
              <select className="apply-input" value={form.position || 'General Application'}
                onChange={e => update('position', e.target.value)} required>
                <option value="General Application">General Application (No Specific Job)</option>
                {jobs.map(j => <option key={j._id} value={j.title}>{j.title} — {j.department} ({j.location})</option>)}
              </select>
            </div>
          </div>

          {/* Personal Info */}
          <div className="apply-card">
            <div className="apply-section-title">👤 Personal Information</div>
            <div className="apply-grid">
              {FIELDS.slice(0, 6).map(f => (
                <div key={f.id} className="apply-field" style={f.id === 'skills' || f.id === 'message' ? { gridColumn: '1/-1' } : {}}>
                  <label>{f.label} {f.required && <span>*</span>}</label>
                  {f.type === 'select' ? (
                    <select className="apply-input" value={form[f.id] || ''} onChange={e => update(f.id, e.target.value)} required={f.required}>
                      <option value="">Select...</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} className="apply-input" placeholder={f.placeholder}
                      value={form[f.id] || ''} onChange={e => update(f.id, e.target.value)} required={f.required} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Education & Experience */}
          <div className="apply-card">
            <div className="apply-section-title">🎓 Education & Experience</div>
            <div className="apply-grid">
              {FIELDS.slice(6, 14).map(f => (
                <div key={f.id} className="apply-field" style={f.id === 'skills' ? { gridColumn: '1/-1' } : {}}>
                  <label>{f.label} {f.required && <span>*</span>}</label>
                  {f.type === 'select' ? (
                    <select className="apply-input" value={form[f.id] || ''} onChange={e => update(f.id, e.target.value)} required={f.required}>
                      <option value="">Select...</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} className="apply-input" placeholder={f.placeholder}
                      value={form[f.id] || ''} onChange={e => update(f.id, e.target.value)} required={f.required} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills & Online Presence */}
          <div className="apply-card">
            <div className="apply-section-title">💡 Skills & Online Presence</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {FIELDS.slice(14).map(f => (
                <div key={f.id} className="apply-field">
                  <label>{f.label} {f.required && <span>*</span>}</label>
                  {f.type === 'textarea' ? (
                    <textarea className={`apply-input apply-textarea`} placeholder={f.placeholder}
                      value={form[f.id] || ''} onChange={e => update(f.id, e.target.value)} required={f.required} />
                  ) : f.type === 'select' ? (
                    <select className="apply-input" value={form[f.id] || ''} onChange={e => update(f.id, e.target.value)}>
                      <option value="">Select...</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type} className="apply-input" placeholder={f.placeholder}
                      value={form[f.id] || ''} onChange={e => update(f.id, e.target.value)} />
                  )}
                </div>
              ))}
              {/* Skills field */}
              <div className="apply-field">
                <label>Key Skills <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea className="apply-input apply-textarea" placeholder="React.js, Node.js, MongoDB, Java, Spring Boot, Python..."
                  value={form.skills || ''} onChange={e => update('skills', e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="apply-card">
            <div className="apply-section-title">📄 Resume Upload</div>
            <label className="apply-file-zone" htmlFor="resume-upload" style={{ display: 'block' }}>
              <input id="resume-upload" type="file" accept="application/pdf,.pdf" style={{ display: 'none' }}
                onChange={e => setResume(e.target.files[0] || null)} />
              {resume ? (
                <div>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>{resume.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                    {(resume.size / 1024).toFixed(0)} KB · Click to change
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📎</div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Click to upload resume</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.35rem' }}>PDF only · Max 2MB</div>
                </div>
              )}
            </label>
          </div>

          {/* Submit */}
          <button type="submit" className="apply-submit" disabled={loading}>
            {loading ? '⏳ Submitting Application...' : '🚀 Submit My Application'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', marginTop: '1rem' }}>
            By submitting, you agree to our privacy policy. We never share your data with third parties.
          </p>
        </form>
      </div>
    </div>
  );
}
