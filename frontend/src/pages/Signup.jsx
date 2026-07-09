import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { apiRequest } from '../utils/api';
import { renderGoogleSignInButton } from '../utils/googleAuth';

/* ── Step 1: Fill details ───────────────────────────────────────── */
function SignupForm({ onOtpSent }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const [first, ...rest] = form.name.trim().split(' ');
      await apiRequest('/api/register/request-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: first, last_name: rest.join(' ') || '-', email: form.email, mobno: form.phone })
      });
      onOtpSent({ ...form, first_name: first, last_name: rest.join(' ') || '-' });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && (
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', padding:'0.85rem 1rem', borderRadius:'9px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#dc2626', fontSize:'0.88rem', fontWeight:600 }}>
          <AlertCircle size={16} />{error}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label style={{ fontSize:'0.82rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.35rem' }}>Full Name</label>
        <div style={{ position:'relative' }}>
          <User size={15} style={{ position:'absolute', left:'0.85rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
          <input type="text" required value={form.name} onChange={e => up('name', e.target.value)} placeholder="Enter your full name"
            style={{ width:'100%', boxSizing:'border-box', padding:'0.75rem 0.85rem 0.75rem 2.4rem', border:'1.5px solid #e2e8f0', borderRadius:'10px', fontSize:'0.92rem', fontFamily:'inherit', outline:'none', background:'#f8fafc', color:'#0f172a' }}
            onFocus={e => e.target.style.borderColor='#0ea5e9'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
        </div>
      </div>

      {/* Email */}
      <div>
        <label style={{ fontSize:'0.82rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.35rem' }}>Email Address</label>
        <div style={{ position:'relative' }}>
          <Mail size={15} style={{ position:'absolute', left:'0.85rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
          <input type="email" required value={form.email} onChange={e => up('email', e.target.value)} placeholder="you@example.com"
            style={{ width:'100%', boxSizing:'border-box', padding:'0.75rem 0.85rem 0.75rem 2.4rem', border:'1.5px solid #e2e8f0', borderRadius:'10px', fontSize:'0.92rem', fontFamily:'inherit', outline:'none', background:'#f8fafc', color:'#0f172a' }}
            onFocus={e => e.target.style.borderColor='#0ea5e9'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
        </div>
      </div>

      {/* Phone + City */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
        <div>
          <label style={{ fontSize:'0.82rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.35rem' }}>Phone</label>
          <div style={{ position:'relative' }}>
            <Phone size={15} style={{ position:'absolute', left:'0.85rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
            <input type="tel" required value={form.phone} onChange={e => up('phone', e.target.value)} placeholder="+91 XXXXXXXXXX"
              style={{ width:'100%', boxSizing:'border-box', padding:'0.75rem 0.85rem 0.75rem 2.4rem', border:'1.5px solid #e2e8f0', borderRadius:'10px', fontSize:'0.92rem', fontFamily:'inherit', outline:'none', background:'#f8fafc', color:'#0f172a' }}
              onFocus={e => e.target.style.borderColor='#0ea5e9'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
          </div>
        </div>
        <div>
          <label style={{ fontSize:'0.82rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.35rem' }}>City</label>
          <div style={{ position:'relative' }}>
            <MapPin size={15} style={{ position:'absolute', left:'0.85rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
            <input type="text" required value={form.city} onChange={e => up('city', e.target.value)} placeholder="Your city"
              style={{ width:'100%', boxSizing:'border-box', padding:'0.75rem 0.85rem 0.75rem 2.4rem', border:'1.5px solid #e2e8f0', borderRadius:'10px', fontSize:'0.92rem', fontFamily:'inherit', outline:'none', background:'#f8fafc', color:'#0f172a' }}
              onFocus={e => e.target.style.borderColor='#0ea5e9'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
          </div>
        </div>
      </div>

      {/* Password */}
      <div>
        <label style={{ fontSize:'0.82rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.35rem' }}>Password</label>
        <div style={{ position:'relative' }}>
          <Lock size={15} style={{ position:'absolute', left:'0.85rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
          <input type={showPass?'text':'password'} required value={form.password} onChange={e => up('password', e.target.value)} placeholder="Min 6 characters"
            style={{ width:'100%', boxSizing:'border-box', padding:'0.75rem 2.5rem 0.75rem 2.4rem', border:'1.5px solid #e2e8f0', borderRadius:'10px', fontSize:'0.92rem', fontFamily:'inherit', outline:'none', background:'#f8fafc', color:'#0f172a' }}
            onFocus={e => e.target.style.borderColor='#0ea5e9'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
          <button type="button" onClick={() => setShowPass(s=>!s)} style={{ position:'absolute', right:'0.85rem', top:'50%', transform:'translateY(-50%)', border:'none', background:'none', cursor:'pointer', color:'#94a3b8', padding:0, display:'flex' }}>
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label style={{ fontSize:'0.82rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.35rem' }}>Confirm Password</label>
        <div style={{ position:'relative' }}>
          <Lock size={15} style={{ position:'absolute', left:'0.85rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
          <input type="password" required value={form.confirm} onChange={e => up('confirm', e.target.value)} placeholder="Re-enter password"
            style={{ width:'100%', boxSizing:'border-box', padding:'0.75rem 0.85rem 0.75rem 2.4rem', border:`1.5px solid ${form.confirm && form.confirm !== form.password ? '#ef4444' : '#e2e8f0'}`, borderRadius:'10px', fontSize:'0.92rem', fontFamily:'inherit', outline:'none', background:'#f8fafc', color:'#0f172a' }}
            onFocus={e => e.target.style.borderColor='#0ea5e9'} onBlur={e => e.target.style.borderColor = form.confirm && form.confirm !== form.password ? '#ef4444' : '#e2e8f0'} />
        </div>
        {form.confirm && form.confirm !== form.password && (
          <p style={{ fontSize:'0.75rem', color:'#ef4444', marginTop:'0.25rem', fontWeight:600 }}>Passwords do not match</p>
        )}
      </div>

      <button type="submit" disabled={loading}
        style={{ padding:'0.9rem', borderRadius:'12px', border:'none', cursor: loading?'not-allowed':'pointer', background:'linear-gradient(135deg,#0ea5e9,#0369a1)', color:'white', fontSize:'1rem', fontWeight:800, fontFamily:'inherit', transition:'all 0.2s', opacity: loading?0.7:1, boxShadow:'0 4px 16px rgba(14,165,233,0.35)', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', marginTop:'0.5rem' }}>
        {loading ? '⏳ Sending OTP...' : <><Mail size={17} /> Verify Email & Sign Up</>}
      </button>
    </form>
  );
}

/* ── Step 2: Enter OTP ──────────────────────────────────────────── */
function OtpStep({ data, onSuccess }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resent, setResent] = useState(false);

  const verify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { setError('Enter the 6-digit code.'); return; }
    setLoading(true); setError('');
    const fd = new FormData();
    fd.append('first_name', data.first_name);
    fd.append('last_name',  data.last_name);
    fd.append('email',      data.email);
    fd.append('mobno',      data.phone);
    fd.append('qualification', '');
    fd.append('city',       data.city);
    fd.append('password',   data.password);
    fd.append('skills',     '');
    fd.append('job_title',  'General Application');
    fd.append('otp',        otp.trim());
    try {
      await apiRequest('/api/register', { method:'POST', body: fd });
      onSuccess(data.email, data.password);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    setLoading(true); setError('');
    try {
      await apiRequest('/api/register/request-otp', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ first_name: data.first_name, last_name: data.last_name, email: data.email, mobno: data.phone })
      });
      setResent(true); setOtp('');
      setTimeout(() => setResent(false), 4000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
        <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>📬</div>
        <h3 style={{ fontWeight:800, color:'#0f172a', fontSize:'1.2rem', margin:0 }}>Check your inbox</h3>
        <p style={{ color:'#64748b', fontSize:'0.88rem', marginTop:'0.4rem' }}>
          We sent a 6-digit code to <strong>{data.email}</strong>
        </p>
      </div>

      {error && (
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', padding:'0.85rem 1rem', borderRadius:'9px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#dc2626', fontSize:'0.88rem', fontWeight:600, marginBottom:'1rem' }}>
          <AlertCircle size={16} />{error}
        </div>
      )}
      {resent && (
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', padding:'0.85rem 1rem', borderRadius:'9px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', color:'#059669', fontSize:'0.88rem', fontWeight:600, marginBottom:'1rem' }}>
          <CheckCircle size={16} /> New code sent!
        </div>
      )}

      <form onSubmit={verify}>
        <input type="text" inputMode="numeric" maxLength={6}
          value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
          placeholder="000000"
          style={{ width:'100%', boxSizing:'border-box', textAlign:'center', letterSpacing:'12px', fontSize:'1.5rem', fontWeight:800, padding:'0.9rem 1rem', border:'2px solid #e2e8f0', borderRadius:'12px', fontFamily:'monospace', outline:'none', marginBottom:'1rem', background:'#f8fafc', color:'#0f172a' }}
          onFocus={e => e.target.style.borderColor='#0ea5e9'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />

        <button type="submit" disabled={loading || otp.length !== 6}
          style={{ width:'100%', padding:'0.9rem', borderRadius:'12px', border:'none', cursor: loading||otp.length!==6?'not-allowed':'pointer', background:'linear-gradient(135deg,#10b981,#059669)', color:'white', fontSize:'1rem', fontWeight:800, fontFamily:'inherit', opacity: loading||otp.length!==6?0.65:1, marginBottom:'0.75rem' }}>
          {loading ? '⏳ Verifying...' : '✅ Verify & Create Account'}
        </button>

        <button type="button" onClick={resend} disabled={loading}
          style={{ width:'100%', padding:'0.75rem', borderRadius:'10px', border:'1.5px solid #e2e8f0', background:'white', color:'#475569', fontSize:'0.88rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity: loading?0.6:1 }}>
          Resend Code
        </button>
      </form>
    </div>
  );
}

/* ── Step 3: Success ────────────────────────────────────────────── */
function SuccessStep() {
  return (
    <div style={{ textAlign:'center', padding:'1rem 0' }}>
      <div style={{ fontSize:'3.5rem', marginBottom:'1rem' }}>🎉</div>
      <h2 style={{ fontWeight:800, color:'#0f172a', fontSize:'1.5rem', marginBottom:'0.5rem' }}>Account Created!</h2>
      <p style={{ color:'#64748b', lineHeight:1.7, marginBottom:'1.5rem' }}>
        Your email is verified and your account is ready.<br/>
        You can now sign in with your <strong>email/password</strong> or <strong>Google</strong>.
      </p>
      <Link to="/login"
        style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.85rem 2rem', background:'linear-gradient(135deg,#0ea5e9,#0369a1)', color:'white', borderRadius:'12px', fontWeight:800, textDecoration:'none', fontSize:'0.95rem', boxShadow:'0 4px 16px rgba(14,165,233,0.35)' }}>
        Sign In Now <ArrowRight size={16} />
      </Link>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function Signup() {
  const navigate  = useNavigate();
  const [step, setStep]     = useState('form'); // form | otp | success
  const [formData, setFormData] = useState(null);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // Google first-time setup modal
  const [googleModal, setGoogleModal] = useState(false);
  const [googleCred,  setGoogleCred]  = useState(null);
  const [googleInfo,  setGoogleInfo]  = useState({ name:'', email:'' });
  const [gForm,       setGForm]       = useState({ password:'', confirm:'', phone:'', city:'' });
  const [gError,      setGError]      = useState('');
  const [gLoading,    setGLoading]    = useState(false);
  const [showGPass,   setShowGPass]   = useState(false);

  const handleGoogleSetup = async (e) => {
    e.preventDefault();
    if (gForm.password !== gForm.confirm) { setGError('Passwords do not match.'); return; }
    if (gForm.password.length < 6) { setGError('Password must be at least 6 characters.'); return; }
    setGLoading(true); setGError('');
    try {
      const data = await apiRequest('/api/auth/google/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: googleCred, password: gForm.password, phone: gForm.phone || '', city: gForm.city || '' })
      });
      setGoogleModal(false);
      localStorage.setItem('token', data.token);
      window.dispatchEvent(new Event('auth-change'));
      navigate('/profile');
    } catch (err) { setGError(err.message); }
    finally { setGLoading(false); }
  };

  /* Google sign-up button */
  useEffect(() => {
    let cancelled = false;
    const processGoogle = async (credential) => {
      setLoading(true); setError('');
      try {
        const data = await apiRequest('/api/auth/google', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential })
        });
        if (data.token) {
          // Already has account — log in
          localStorage.setItem('token', data.token);
          window.dispatchEvent(new Event('auth-change'));
          navigate('/profile');
        } else if (data.registerRequired) {
          // New Google user — show password setup modal
          setGoogleCred(credential);
          setGoogleInfo({ name: data.name || '', email: data.email || '' });
          setGForm({ password: '', confirm: '', phone: '', city: '' });
          setGError('');
          setGoogleModal(true);
        }
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };

    renderGoogleSignInButton({
      elementId: 'google-signup-btn',
      onCredential: (cred) => { if (!cancelled) processGoogle(cred); },
      onError: (msg) => { if (!cancelled) setError(msg); }
    });
    return () => {
      cancelled = true;
      const el = document.getElementById('google-signup-btn');
      if (el) el.innerHTML = '';
    };
  }, [navigate]);

  return (
    <>
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f0f9ff,#fafafa)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem 1rem' }}>
      <div style={{ width:'100%', maxWidth:'440px' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.75rem' }}>
            <img src="/rancom.png" alt="Rancom" style={{ width:'38px', height:'38px', borderRadius:'50%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
            <img src="/appletree.jpeg" alt="Appletree" style={{ width:'34px', height:'34px', borderRadius:'50%', objectFit:'cover', marginLeft:'-6px' }} onError={e=>e.target.style.display='none'} />
          </div>
          <h1 style={{ fontSize:'1.6rem', fontWeight:800, color:'#0f172a', margin:'0 0 0.25rem' }}>Create Account</h1>
          <p style={{ color:'#64748b', fontSize:'0.9rem', margin:0 }}>
            {step === 'form' && 'Sign up with email or Google'}
            {step === 'otp'  && 'Almost there — verify your email'}
            {step === 'success' && 'Welcome to Rancom Technologies!'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background:'white', borderRadius:'20px', padding:'2rem', boxShadow:'0 8px 40px rgba(0,0,0,0.08)', border:'1px solid rgba(14,165,233,0.12)' }}>

          {step === 'form' && (
            <>
              {/* Google sign-up */}
              <div style={{ marginBottom:'1.25rem' }}>
                {error && (
                  <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', padding:'0.75rem 1rem', borderRadius:'9px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#dc2626', fontSize:'0.85rem', fontWeight:600, marginBottom:'0.85rem' }}>
                    <AlertCircle size={15} />{error}
                  </div>
                )}
                <div id="google-signup-btn" style={{ display:'flex', justifyContent:'center', minHeight:'44px' }} />
              </div>

              {/* Divider */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', margin:'1.25rem 0' }}>
                <div style={{ flex:1, height:'1px', background:'#e2e8f0' }} />
                <span style={{ fontSize:'0.78rem', color:'#94a3b8', fontWeight:600 }}>or sign up with email</span>
                <div style={{ flex:1, height:'1px', background:'#e2e8f0' }} />
              </div>

              <SignupForm onOtpSent={(data) => { setFormData(data); setStep('otp'); }} />
            </>
          )}

          {step === 'otp' && (
            <OtpStep data={formData} onSuccess={() => setStep('success')} />
          )}

          {step === 'success' && <SuccessStep />}
        </div>

        {/* Footer links */}
        {step !== 'success' && (
          <p style={{ textAlign:'center', fontSize:'0.85rem', color:'#64748b', marginTop:'1.25rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--primary)', fontWeight:700 }}>Sign in</Link>
            {' · '}
            <Link to="/apply" style={{ color:'var(--accent)', fontWeight:700 }}>Apply for a job</Link>
          </p>
        )}
      </div>
    </div>

    {/* ── Google Setup Modal ── */}
    {googleModal && (
      <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'1rem' }}>
        <div style={{ background:'white', borderRadius:'20px', padding:'2rem', maxWidth:'420px', width:'100%', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', position:'relative', animation:'fadeIn 0.2s ease' }}>

          <button onClick={() => setGoogleModal(false)} style={{ position:'absolute', top:'1rem', right:'1rem', border:'none', background:'#f1f5f9', borderRadius:'8px', width:'30px', height:'30px', cursor:'pointer', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>✕</button>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'linear-gradient(135deg,#0ea5e9,#0369a1)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.75rem' }}>
              <svg viewBox="0 0 24 24" width="26" height="26"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
            </div>
            <h2 style={{ fontWeight:800, fontSize:'1.25rem', color:'#0f172a', margin:0 }}>Complete Your Account</h2>
            <p style={{ color:'#64748b', fontSize:'0.85rem', marginTop:'0.3rem', lineHeight:1.5 }}>
              Welcome <strong>{googleInfo.name}</strong>!<br/>
              Your Google email <strong style={{ color:'#0ea5e9' }}>{googleInfo.email}</strong> is verified.<br/>
              Set a password to also log in with email.
            </p>
          </div>

          {gError && (
            <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', padding:'0.75rem 1rem', borderRadius:'9px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#dc2626', fontSize:'0.85rem', fontWeight:600, marginBottom:'1rem' }}>
              <AlertCircle size={15} />{gError}
            </div>
          )}

          <form onSubmit={handleGoogleSetup} style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
            {/* Password */}
            <div>
              <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.3rem' }}>
                Password <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <div style={{ position:'relative' }}>
                <Lock size={14} style={{ position:'absolute', left:'0.8rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
                <input type={showGPass?'text':'password'} required value={gForm.password}
                  onChange={e => setGForm(f=>({...f,password:e.target.value}))} placeholder="Min 6 characters"
                  style={{ width:'100%', boxSizing:'border-box', padding:'0.7rem 2.4rem 0.7rem 2.3rem', border:'1.5px solid #e2e8f0', borderRadius:'10px', fontSize:'0.9rem', fontFamily:'inherit', outline:'none', background:'#f8fafc' }}
                  onFocus={e=>e.target.style.borderColor='#0ea5e9'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
                <button type="button" onClick={()=>setShowGPass(s=>!s)} style={{ position:'absolute', right:'0.8rem', top:'50%', transform:'translateY(-50%)', border:'none', background:'none', cursor:'pointer', color:'#94a3b8', padding:0, display:'flex' }}>
                  {showGPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.3rem' }}>
                Confirm Password <span style={{ color:'#ef4444' }}>*</span>
              </label>
              <div style={{ position:'relative' }}>
                <Lock size={14} style={{ position:'absolute', left:'0.8rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
                <input type="password" required value={gForm.confirm}
                  onChange={e => setGForm(f=>({...f,confirm:e.target.value}))} placeholder="Re-enter password"
                  style={{ width:'100%', boxSizing:'border-box', padding:'0.7rem 0.85rem 0.7rem 2.3rem', border:`1.5px solid ${gForm.confirm && gForm.confirm!==gForm.password ? '#ef4444':'#e2e8f0'}`, borderRadius:'10px', fontSize:'0.9rem', fontFamily:'inherit', outline:'none', background:'#f8fafc' }}
                  onFocus={e=>e.target.style.borderColor='#0ea5e9'} onBlur={e=>e.target.style.borderColor=gForm.confirm&&gForm.confirm!==gForm.password?'#ef4444':'#e2e8f0'} />
              </div>
              {gForm.confirm && gForm.confirm !== gForm.password && (
                <p style={{ fontSize:'0.72rem', color:'#ef4444', margin:'0.2rem 0 0', fontWeight:600 }}>Passwords do not match</p>
              )}
            </div>

            {/* Phone (optional) */}
            <div>
              <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.3rem' }}>
                Phone <span style={{ color:'#94a3b8', fontWeight:400 }}>(optional)</span>
              </label>
              <div style={{ position:'relative' }}>
                <Phone size={14} style={{ position:'absolute', left:'0.8rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
                <input type="tel" value={gForm.phone}
                  onChange={e => setGForm(f=>({...f,phone:e.target.value}))} placeholder="+91 XXXXXXXXXX"
                  style={{ width:'100%', boxSizing:'border-box', padding:'0.7rem 0.85rem 0.7rem 2.3rem', border:'1.5px solid #e2e8f0', borderRadius:'10px', fontSize:'0.9rem', fontFamily:'inherit', outline:'none', background:'#f8fafc' }}
                  onFocus={e=>e.target.style.borderColor='#0ea5e9'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
              </div>
            </div>

            {/* City (optional) */}
            <div>
              <label style={{ fontSize:'0.8rem', fontWeight:700, color:'#374151', display:'block', marginBottom:'0.3rem' }}>
                City <span style={{ color:'#94a3b8', fontWeight:400 }}>(optional)</span>
              </label>
              <div style={{ position:'relative' }}>
                <MapPin size={14} style={{ position:'absolute', left:'0.8rem', top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }} />
                <input type="text" value={gForm.city}
                  onChange={e => setGForm(f=>({...f,city:e.target.value}))} placeholder="Your city"
                  style={{ width:'100%', boxSizing:'border-box', padding:'0.7rem 0.85rem 0.7rem 2.3rem', border:'1.5px solid #e2e8f0', borderRadius:'10px', fontSize:'0.9rem', fontFamily:'inherit', outline:'none', background:'#f8fafc' }}
                  onFocus={e=>e.target.style.borderColor='#0ea5e9'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
              </div>
            </div>

            <button type="submit" disabled={gLoading || !gForm.password || gForm.password !== gForm.confirm}
              style={{ padding:'0.85rem', borderRadius:'12px', border:'none', cursor: gLoading||!gForm.password||gForm.password!==gForm.confirm?'not-allowed':'pointer', background:'linear-gradient(135deg,#0ea5e9,#0369a1)', color:'white', fontSize:'0.95rem', fontWeight:800, fontFamily:'inherit', transition:'all 0.2s', opacity: gLoading||!gForm.password||gForm.password!==gForm.confirm?0.65:1, boxShadow:'0 4px 16px rgba(14,165,233,0.35)', marginTop:'0.25rem' }}>
              {gLoading ? '⏳ Creating Account...' : '✅ Create Account'}
            </button>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
