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

  /* Google sign-up button */
  useEffect(() => {
    let cancelled = false;
    const processGoogle = async (credential) => {
      setLoading(true); setError('');
      try {
        const data = await apiRequest('/api/auth/google', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ credential })
        });
        if (data.token) {
          // Already has account — log in
          localStorage.setItem('token', data.token);
          window.dispatchEvent(new Event('auth-change'));
          navigate('/profile');
        } else if (data.registerRequired) {
          // New Google user — create account directly (no OTP needed, Google verifies email)
          try {
            const regData = await apiRequest('/api/auth/google/register', {
              method:'POST', headers:{'Content-Type':'application/json'},
              body: JSON.stringify({ credential, password: Math.random().toString(36).slice(-10), phone:'', city:'' })
            });
            localStorage.setItem('token', regData.token);
            window.dispatchEvent(new Event('auth-change'));
            navigate('/profile');
          } catch (regErr) { setError(regErr.message); }
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
  );
}
