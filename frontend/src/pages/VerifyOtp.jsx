import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, MailCheck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { apiRequest } from '../utils/api';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [resendMessage, setResendMessage] = useState(null);

  // Retrieve registration data from location state
  const registrationData = location.state || null;

  useEffect(() => {
    // If no registration data is present, redirect to register page
    if (!registrationData || !registrationData.email) {
      setError('No registration session found. Redirecting to registration page...');
      const timer = setTimeout(() => {
        navigate('/register');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [registrationData, navigate]);

  if (!registrationData || !registrationData.email) {
    return (
      <div className="container-width animate-fade-in" style={{ paddingTop: '6rem', maxWidth: '500px' }}>
        <div className="form-card glass text-center" style={{ background: 'white', padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <AlertCircle size={48} style={{ color: '#f87171' }} />
          </div>
          <h2 style={{ color: '#000000', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Access Denied</h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            No registration details found. Please start the registration process first.
          </p>
          <Link to="/register" className="btn btn-primary" style={{ display: 'inline-block', width: '100%', textDecoration: 'none', textAlign: 'center' }}>
            Go to Registration
          </Link>
        </div>
      </div>
    );
  }

  const { first_name, last_name, email, mobno, qualification, city, resume, password, skills, job_title } = registrationData;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the verification code.');
      return;
    }
    if (otp.trim().length !== 6) {
      setError('The verification code must be 6 digits.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('first_name', first_name);
    formData.append('last_name', last_name);
    formData.append('email', email);
    formData.append('mobno', mobno);
    formData.append('qualification', qualification);
    formData.append('city', city);
    if (resume) {
      formData.append('resume', resume);
    }
    formData.append('password', password);
    formData.append('skills', skills);
    formData.append('job_title', job_title);
    formData.append('otp', otp.trim());

    try {
      const data = await apiRequest('/api/register', {
        method: 'POST',
        body: formData
      });

      setSuccess(data.message || 'Email verified and registration submitted successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3500);
    } catch (err) {
      setError(err.message || 'Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    setResendMessage(null);

    try {
      const data = await apiRequest('/api/register/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          mobno
        })
      });

      setResendMessage(data.message || 'A new verification code has been sent to your email.');
      setOtp('');
    } catch (err) {
      setError(err.message || 'Failed to resend email OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-width animate-fade-in" style={{ paddingTop: '6rem', maxWidth: '500px' }}>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Back to Register
        </Link>
      </div>

      <div className="form-card glass" style={{ background: 'white', padding: '2.5rem' }}>
        
        {success ? (
          <div className="text-center" style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <CheckCircle size={56} style={{ color: 'var(--accent)' }} />
            </div>
            <h2 style={{ color: '#000000', fontSize: '1.6rem', fontWeight: 800, marginBottom: '1rem' }}>Verification Successful!</h2>
            <p style={{ color: '#4b5563', fontSize: '1rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              {success}
            </p>
            <p style={{ color: '#8b5cf6', fontSize: '0.9rem', fontWeight: 600 }}>
              Redirecting you to the login page...
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <ShieldCheck size={28} style={{ color: 'var(--secondary)' }} />
              <h2 style={{ color: '#000000', fontSize: '1.5rem', fontWeight: 800 }}>Verify Your Email</h2>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(14, 165, 233, 0.08)', border: '1px solid rgba(14, 165, 233, 0.18)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#0f172a' }}>
              <MailCheck size={22} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '0.1rem' }} />
              <div>
                <strong>Check your email</strong>
                <p style={{ margin: '0.25rem 0 0', color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.4' }}>
                  Enter the 6-digit OTP code sent to <strong>{email}</strong>.
                </p>
                {import.meta.env.DEV && (
                  <p style={{ margin: '0.5rem 0 0', color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 600 }}>
                    💡 Dev Mode: You can also use the master OTP <code>123456</code> to verify.
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {resendMessage && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--accent)', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <CheckCircle size={18} />
                <span>{resendMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label style={{ color: '#000000', fontWeight: 600 }}>6-Digit Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter verification code"
                  className="form-input"
                  required
                  style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.25rem', fontWeight: 700 }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', marginTop: '1rem' }}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Register'}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem', marginTop: '0.75rem' }}
                disabled={loading}
                onClick={handleResendOtp}
              >
                Resend Verification Code
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
