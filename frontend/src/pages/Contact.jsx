import { useState } from 'react';
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
    tel: '',
    msg: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, subject, email, tel, msg } = formData;

    if (!name || !subject || !email || !tel || !msg) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit form.');

      setSuccess(data.message || 'Thank you! Your message was received successfully.');
      setFormData({ name: '', subject: '', email: '', tel: '', msg: '' });
      setTouched({});
    } catch (err) {
      setError(err.message || 'Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { name: 'name', label: 'Your Name', type: 'text', placeholder: 'Enter your name' },
    { name: 'subject', label: 'Subject', type: 'text', placeholder: 'What is this about?' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your.email@example.com' },
    { name: 'tel', label: 'Phone Number', type: 'tel', placeholder: 'Your contact number' },
  ];

  return (
    <div className="container-width animate-fade-in" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#000000',
          marginBottom: '0.75rem',
          background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Get In Touch
        </h1>
        <p style={{
          color: '#4b5563',
          fontSize: '1.1rem',
          maxWidth: '500px',
          margin: '0 auto',
        }}>
          Have questions about our services? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      {/* Main Layout */}
      <div className="contact-outer-grid">

        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Office Info */}
          <div style={{
            padding: '2rem',
            background: 'white',
            border: '1px solid rgba(14, 165, 233, 0.2)',
            borderRadius: '14px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}>
            <h3 style={{
              color: '#000000',
              fontSize: '1.3rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
            }}>
              Rancom Technologies
            </h3>
            <p style={{
              color: '#4b5563',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              marginBottom: '2rem',
            }}>
              Delivering world-class telecom engineering and software solutions since 2015.
            </p>

            {/* Contact Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Address */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  background: 'rgba(249, 115, 22, 0.15)',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f97316',
                }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#000000', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                    Office Address
                  </h4>
                  <p style={{ color: '#4b5563', fontSize: '0.9rem', margin: 0 }}>
                    C-60 R.K tower 3rd Floor Rdc ghaziabad
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8b5cf6',
                }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#000000', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                    Call Us
                  </h4>
                  <p style={{ color: '#4b5563', fontSize: '0.9rem', margin: 0 }}>
                    +91 7503962162
                  </p>
                </div>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}>
                  <Mail size={20} />
                </div>
                <div>
                  <h4 style={{ color: '#000000', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
                    Email Us
                  </h4>
                  <p style={{ color: '#4b5563', fontSize: '0.9rem', margin: 0 }}>
                    hr@appletreeinfotech.in<br />support@rancomtechnologies.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Response Time Info */}
          <div style={{
            padding: '1.5rem',
            background: 'rgba(14, 165, 233, 0.08)',
            border: '1px solid rgba(14, 165, 233, 0.2)',
            borderRadius: '10px',
          }}>
            <p style={{
              color: '#4b5563',
              fontSize: '0.9rem',
              margin: 0,
            }}>
              ⏱️ <strong style={{ color: '#000000' }}>Response Time:</strong> We typically respond within 24 hours during business days.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{
          padding: '2.5rem',
          background: 'white',
          border: '1px solid rgba(14, 165, 233, 0.2)',
          borderRadius: '14px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <h3 style={{
            color: '#000000',
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: '2rem',
          }}>
            Send Us A Message
          </h3>

          {/* Messages */}
          {success && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              color: '#10b981',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              marginBottom: '1.5rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              animation: 'slideDown 0.3s ease',
            }}>
              <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start',
              color: '#f87171',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '1.5rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              animation: 'slideDown 0.3s ease',
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit}>
            {/* Two Column Grid */}
            <div className="contact-form-row">
              {formFields.slice(0, 2).map(field => (
                <div key={field.name}>
                  <label style={{
                    display: 'block',
                    color: '#000000',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                  }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: 'white',
                      border: touched[field.name] && !formData[field.name]
                        ? '1px solid rgba(248, 113, 113, 0.5)'
                        : '1px solid rgba(14, 165, 233, 0.2)',
                      borderRadius: '10px',
                      color: '#000000',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(14, 165, 233, 0.5)';
                      e.target.style.background = '#f0f7ff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(14, 165, 233, 0.2)';
                      e.target.style.background = 'white';
                      handleBlur(e);
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Full Width Fields */}
            <div className="contact-form-row">
              {formFields.slice(2).map(field => (
                <div key={field.name}>
                  <label style={{
                    display: 'block',
                    color: '#000000',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                  }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    style={{
                      width: '100%',
                      padding: '0.875rem',
                      background: 'white',
                      border: touched[field.name] && !formData[field.name]
                        ? '1px solid rgba(248, 113, 113, 0.5)'
                        : '1px solid rgba(14, 165, 233, 0.2)',
                      borderRadius: '10px',
                      color: '#000000',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(14, 165, 233, 0.5)';
                      e.target.style.background = '#f0f7ff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(14, 165, 233, 0.2)';
                      e.target.style.background = 'white';
                      handleBlur(e);
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Message Textarea */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: '#000000',
                fontSize: '0.9rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
              }}>
                Message
              </label>
              <textarea
                name="msg"
                placeholder="Please tell us more about your inquiry..."
                value={formData.msg}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                rows="6"
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'white',
                  border: touched.msg && !formData.msg
                    ? '1px solid rgba(248, 113, 113, 0.5)'
                    : '1px solid rgba(14, 165, 233, 0.2)',
                  borderRadius: '10px',
                  color: '#000000',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(14, 165, 233, 0.5)';
                  e.target.style.background = '#f0f7ff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(14, 165, 233, 0.2)';
                  e.target.style.background = 'white';
                  handleBlur(e);
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                background: loading
                  ? 'rgba(14, 165, 233, 0.5)'
                  : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 20px rgba(14, 165, 233, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = 'linear-gradient(135deg, #0ea5e9, #0284c7)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {loading ? (
                <>
                  <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .contact-outer-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 3rem;
          margin-bottom: 4rem;
          align-items: start;
        }
        .contact-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 768px) {
          .contact-outer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 480px) {
          .contact-form-row {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
