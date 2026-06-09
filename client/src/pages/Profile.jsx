import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Mail, MapPin, Phone, Save, ShieldCheck, Sparkles, UserRound } from 'lucide-react';

const emptyProfile = {
  name: '',
  email: '',
  phone: '',
  city: '',
  resume: null,
  hasResume: false,
  resumeFileName: '',
  skills: '',
  password: ''
};

export default function Profile() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const skillList = useMemo(
    () => profile.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
    [profile.skills]
  );

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to load profile.');
        }

        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          city: data.city || '',
          resume: null,
          hasResume: !!data.hasResume,
          resumeFileName: data.resumeFileName || '',
          skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
          password: ''
        });
      } catch (err) {
        setError(err.message || 'Server connection error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = (field, value) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleResumeDownload = async () => {
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/me/resume', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to open resume.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.message || 'Could not open resume.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profile.name || !profile.email) {
      setError('Name and email are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const body = new FormData();
      body.append('name', profile.name);
      body.append('email', profile.email);
      body.append('phone', profile.phone);
      body.append('city', profile.city);
      body.append('skills', skillList.join(', '));

      if (profile.password) {
        body.append('password', profile.password);
      }

      if (profile.resume) {
        body.append('resume', profile.resume);
      }

      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setSuccess(data.message || 'Profile updated successfully.');
      setProfile((current) => ({
        ...current,
        resume: null,
        hasResume: data.user?.hasResume ?? current.hasResume,
        resumeFileName: data.user?.resumeFileName || current.resumeFileName,
        password: '',
        skills: Array.isArray(data.user?.skills) ? data.user.skills.join(', ') : current.skills
      }));
    } catch (err) {
      setError(err.message || 'Server connection error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-width animate-fade-in profile-page">
      <style dangerouslySetInnerHTML={{__html: `
        .profile-page { padding-top: 4rem; padding-bottom: 4rem; color: #0f172a; }
        .profile-shell {
          display: grid; grid-template-columns: 0.85fr 1.35fr; gap: 1.5rem; align-items: start;
        }
        .profile-hero {
          background: linear-gradient(135deg, #0f172a, #1d4ed8); color: white; border-radius: 16px;
          padding: 1.75rem; box-shadow: 0 18px 50px rgba(15, 23, 42, 0.18); position: sticky; top: 6rem;
        }
        .profile-avatar {
          width: 82px; height: 82px; border-radius: 18px; background: rgba(255,255,255,0.16);
          display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem;
          border: 1px solid rgba(255,255,255,0.22);
        }
        .profile-hero h1 { font-size: 1.8rem; line-height: 1.15; margin-bottom: 0.5rem; color: white; }
        .profile-muted { color: rgba(255,255,255,0.78); line-height: 1.65; }
        .profile-info-list { display: grid; gap: 0.75rem; margin-top: 1.5rem; }
        .profile-info-item { display: flex; align-items: center; gap: 0.65rem; color: rgba(255,255,255,0.88); word-break: break-word; }
        .profile-card {
          background: white; border: 1px solid rgba(15, 23, 42, 0.08); border-radius: 16px;
          box-shadow: 0 16px 45px rgba(15, 23, 42, 0.08); padding: 1.5rem;
        }
        .profile-card-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
        .profile-card-title { display: flex; align-items: center; gap: 0.55rem; color: #0f172a; font-size: 1.35rem; font-weight: 800; }
        .profile-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
        .profile-grid .full-width { grid-column: 1 / -1; }
        .profile-page label { color: #0f172a; display: block; font-weight: 700; margin-bottom: 0.45rem; }
        .profile-page textarea { min-height: 110px; resize: vertical; }
        .profile-skill-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.8rem; }
        .profile-skill { background: #eef6ff; color: #1d4ed8; border: 1px solid rgba(29, 78, 216, 0.16); border-radius: 999px; padding: 0.35rem 0.65rem; font-size: 0.82rem; font-weight: 700; }
        .profile-alert {
          display: flex; align-items: center; gap: 0.5rem; padding: 0.9rem 1rem; border-radius: 8px;
          margin-bottom: 1rem; font-weight: 600; font-size: 0.92rem;
        }
        .profile-alert.success { color: #047857; background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.22); }
        .profile-alert.error { color: #dc2626; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.22); }
        .profile-loading { background: white; border-radius: 16px; padding: 2rem; text-align: center; box-shadow: 0 16px 45px rgba(15, 23, 42, 0.08); }
        @media (max-width: 880px) {
          .profile-shell { grid-template-columns: 1fr; }
          .profile-hero { position: static; }
        }
        @media (max-width: 640px) {
          .profile-page { padding-top: 2rem; }
          .profile-grid { grid-template-columns: 1fr; }
          .profile-card, .profile-hero { padding: 1.15rem; border-radius: 12px; }
          .profile-card-header { align-items: flex-start; flex-direction: column; }
        }
      `}} />

      {loading ? (
        <div className="profile-loading">Loading your profile...</div>
      ) : (
        <div className="profile-shell">
          <aside className="profile-hero">
            <div className="profile-avatar">
              <UserRound size={42} />
            </div>
            <h1>{profile.name || 'Your Profile'}</h1>
            <p className="profile-muted">Manage your account details, career information, PDF resume, and skills from one clean dashboard.</p>

            <div className="profile-info-list">
              <div className="profile-info-item"><Mail size={18} /> <span>{profile.email || 'No email added'}</span></div>
              <div className="profile-info-item"><Phone size={18} /> <span>{profile.phone || 'No phone added'}</span></div>
              <div className="profile-info-item"><MapPin size={18} /> <span>{profile.city || 'No city added'}</span></div>
              <div className="profile-info-item"><ShieldCheck size={18} /> <span>Protected account</span></div>
            </div>

            {skillList.length > 0 && (
              <div className="profile-skill-row">
                {skillList.slice(0, 8).map((skill) => (
                  <span key={skill} className="profile-skill">{skill}</span>
                ))}
              </div>
            )}
          </aside>

          <section className="profile-card">
            <div className="profile-card-header">
              <h2 className="profile-card-title"><Sparkles size={22} /> Edit Details</h2>
              {profile.hasResume && (
                <button type="button" className="btn btn-secondary" onClick={handleResumeDownload}>
                  <ExternalLink size={16} /> Resume PDF
                </button>
              )}
            </div>

            {success && (
              <div className="profile-alert success">
                <CheckCircle size={18} />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="profile-alert error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="profile-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input className="form-input" type="text" value={profile.name} onChange={(e) => updateProfile('name', e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input className="form-input" type="email" value={profile.email} onChange={(e) => updateProfile('email', e.target.value)} required />
                </div>

                <div className="form-group">
                  <label>Phone No</label>
                  <input className="form-input" type="tel" value={profile.phone} onChange={(e) => updateProfile('phone', e.target.value)} placeholder="Phone number" />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input className="form-input" type="text" value={profile.city} onChange={(e) => updateProfile('city', e.target.value)} placeholder="City" />
                </div>

                <div className="form-group full-width">
                  <label>Resume PDF</label>
                  <input className="form-input" type="file" accept="application/pdf,.pdf" onChange={(e) => updateProfile('resume', e.target.files[0] || null)} />
                  {profile.resumeFileName && (
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                      Current file: {profile.resumeFileName}
                    </p>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Skills</label>
                  <textarea className="form-input" value={profile.skills} onChange={(e) => updateProfile('skills', e.target.value)} placeholder="React, Node.js, RF survey, telecom tools" />
                  {skillList.length > 0 && (
                    <div className="profile-skill-row">
                      {skillList.map((skill) => (
                        <span key={skill} className="profile-skill">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>New Password</label>
                  <input className="form-input" type="password" value={profile.password} onChange={(e) => updateProfile('password', e.target.value)} placeholder="Leave blank to keep current password" />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem 1rem', marginTop: '0.75rem' }} disabled={saving}>
                <Save size={18} /> {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
