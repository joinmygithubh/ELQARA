import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { enquiryAPI } from '../services/api';

const ContactPage = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Bespoke Lighting Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      showToast('Please provide your name (at least 2 characters)', 'error');
      setError('Please provide your name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      showToast('Please enter a valid email address', 'error');
      setError('Please enter a valid email address.');
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 5) {
      showToast('Message must be at least 5 characters', 'error');
      setError('Please provide a message with at least 5 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        productUrl: typeof window !== 'undefined' ? window.location.href : ''
      };

      const res = await enquiryAPI.submit(payload);

      if (res.data?.success) {
        setSubmitted(true);
        showToast('Your enquiry has been delivered to elqara.home@gmail.com.', 'success');
      } else {
        throw new Error(res.data?.message || 'Submission failed');
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "We couldn't send your enquiry right now. Please try again.";
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: '4rem 0 6rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 4rem' }}>
          <span className="pre-heading" style={{ justifyContent: 'center' }}>
            ATELIER CONCIERGE
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.4rem, 4vw, 3.2rem)', color: 'var(--text-main)', marginTop: '0.4rem', marginBottom: '0.8rem' }}>
            We Welcome Your Inquiries
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
            Whether commissioning custom dimensions for an interior project, inquiring about our timber seasoning, or tracking your delivery, our concierge is at your service.
          </p>
        </div>

        {/* 2-Column: Details & Form */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '4rem',
            alignItems: 'start'
          }}
        >
          {/* Left: Official Business Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                padding: '2.5rem'
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '1.5rem' }}>
                ELQARA Headquarters & Atelier
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.92rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <MapPin size={20} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                      Physical Atelier & Workshop:
                    </strong>
                    <span style={{ color: 'var(--text-body)', lineHeight: 1.6 }}>
                      ELQARA<br />
                      Udhyog Nagar, Ambala Road,<br />
                      Badi Neher, Saharanpur,<br />
                      Uttar Pradesh – 247001, India
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Phone size={20} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>Telephone:</strong>{' '}
                    <span style={{ color: 'var(--text-body)' }}>+91 98765 43210</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Mail size={20} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: 'var(--text-main)' }}>Email Inquiries:</strong>{' '}
                    <span style={{ color: 'var(--text-body)' }}>concierge@elqara.com</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <Clock size={20} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <div>
                    <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                      Atelier Hours:
                    </strong>
                    <span style={{ color: 'var(--text-body)', lineHeight: 1.5 }}>
                      Monday – Saturday: 10:00 AM – 7:00 PM IST<br />
                      Sunday: Reserved for artisan wood-drying inspections
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Location Embed Map Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '1rem 1.5rem', backgroundColor: '#FAF7F2', borderBottom: '1px solid var(--border-hairline)', fontSize: '0.82rem', fontWeight: 600 }}>
                Saharanpur Craft Corridor, Uttar Pradesh
              </div>
              <iframe
                title="ELQARA Saharanpur Atelier Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110543.1234567!2d77.5312!3d29.9678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390eeb6bb8544e45%3A0xb36f2f9f1b402cf8!2sSaharanpur%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="240"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right: Message Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '0.6rem' }}>
              Send a Message
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.75rem' }}>
              Our design director responds personally to all inquiries within one business day.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <CheckCircle2 size={48} color="#16A34A" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '0.5rem' }}>
                  Inquiry Dispatched
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Thank you, {formData.name}. We have logged your request and our concierge will reach out promptly.
                </p>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', subject: 'Bespoke Lighting Inquiry', message: '' });
                  }}
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Arjun Sharma"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="arjun@example.com"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', backgroundColor: '#FFF' }}
                  >
                    <option value="Bespoke Lighting Inquiry">Bespoke Lighting Inquiry</option>
                    <option value="Architectural / Trade Partnership">Architectural / Trade Partnership</option>
                    <option value="Order Tracking & Logistics">Order Tracking & Logistics</option>
                    <option value="Care & Restoration Advice">Care & Restoration Advice</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your room, space, or question..."
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', outline: 'none', resize: 'vertical' }}
                  />
                </div>

                {error && (
                  <div
                    style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '4px',
                      padding: '0.75rem 1rem',
                      color: '#B91C1C',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-dark"
                  style={{
                    padding: '0.95rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.75 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Transmitting Inquiry to Atelier...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Transmit Inquiry to Saharanpur</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
