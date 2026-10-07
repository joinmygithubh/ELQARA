import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, Phone, Mail, MessageSquare } from 'lucide-react';
import { enquiryAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const EnquiryModal = ({ isOpen, onClose, product = null }) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: 1,
    preferredContact: 'Email',
    subject: product ? `Inquiry regarding ${product.name}` : 'Bespoke Atelier Commission Inquiry',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Update subject or reset form when product changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError('');
      setFormData((prev) => ({
        ...prev,
        subject: product ? `Inquiry: ${product.name}` : 'Bespoke Atelier Commission Inquiry',
        message: prev.message || (product ? `Hello, I am interested in "${product.name}" (SKU: ${product.sku || 'N/A'}). I would like to know more about delivery timeframes, custom timber options, or trade pricing.` : '')
      }));
    }
  }, [isOpen, product]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Client-side validations
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Please provide your name (at least 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!formData.message.trim() || formData.message.trim().length < 5) {
      setError('Please provide an enquiry message with at least 5 characters.');
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
        quantity: Number(formData.quantity) || 1,
        preferredContact: formData.preferredContact,
        productId: product?._id || null,
        productName: product?.name || '',
        productSku: product?.sku || '',
        productUrl: typeof window !== 'undefined' ? window.location.href : ''
      };

      const res = await enquiryAPI.submit(payload);

      if (res.data?.success) {
        setSuccess(true);
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

  const handleReset = () => {
    setSuccess(false);
    setError('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      quantity: 1,
      preferredContact: 'Email',
      subject: product ? `Inquiry: ${product.name}` : 'Bespoke Atelier Commission Inquiry',
      message: ''
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(28, 27, 24, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-sm, 6px)',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--border-hairline, #E7E3DA)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '1.5rem 1.75rem 1.25rem',
            borderBottom: '1px solid var(--border-hairline, #ECE7DE)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            backgroundColor: '#FAF7F2'
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--accent-gold, #C4704F)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '4px'
              }}
            >
              <Sparkles size={12} />
              ATELIER CONCIERGE & COMMISSIONS
            </span>
            <h2
              id="enquiry-modal-title"
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: '1.45rem',
                color: 'var(--text-main, #1C1917)',
                margin: 0,
                lineHeight: 1.25
              }}
            >
              {product ? 'Product Inquiry' : 'Bespoke Atelier Commission'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: 'var(--text-muted, #78716C)',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Product Summary Snippet (if product attached) */}
        {product && (
          <div
            style={{
              padding: '1rem 1.75rem',
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid var(--border-hairline, #ECE7DE)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <img
              src={product.thumbnail || (product.images && product.images[0]) || '/logo-icon.svg'}
              alt={product.name}
              style={{
                width: '56px',
                height: '56px',
                objectFit: 'cover',
                borderRadius: '4px',
                border: '1px solid var(--border-hairline, #ECE7DE)'
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: 'var(--text-main, #1C1917)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {product.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #78716C)', marginTop: '2px' }}>
                SKU: <strong style={{ color: '#1C1917' }}>{product.sku || 'N/A'}</strong>
                {product.price && (
                  <span style={{ marginLeft: '10px' }}>
                    Edition Price: <strong>₹{product.price.toLocaleString('en-IN')}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '1.75rem', flex: 1 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
              <CheckCircle2
                size={54}
                color="#16A34A"
                style={{ margin: '0 auto 1.25rem', display: 'block' }}
              />
              <h3
                style={{
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                  fontSize: '1.5rem',
                  color: 'var(--text-main, #1C1917)',
                  marginBottom: '0.6rem'
                }}
              >
                Your enquiry has been sent successfully.
              </h3>
              <p
                style={{
                  fontSize: '0.92rem',
                  color: 'var(--text-muted, #78716C)',
                  lineHeight: 1.6,
                  maxWidth: '420px',
                  margin: '0 auto 1.75rem'
                }}
              >
                Our design director has received your dispatch at <strong>elqara.home@gmail.com</strong>.
                Our team will contact you shortly with bespoke details.
              </p>
              <button
                type="button"
                className="btn-dark"
                onClick={handleReset}
                style={{ padding: '0.8rem 2rem', margin: '0 auto' }}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
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

              {/* Name & Email Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-main, #1C1917)',
                      marginBottom: '4px'
                    }}
                  >
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      border: '1px solid var(--border-medium, #D5CEBE)',
                      borderRadius: '4px',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-main, #1C1917)',
                      marginBottom: '4px'
                    }}
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="rahul@example.com"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      border: '1px solid var(--border-medium, #D5CEBE)',
                      borderRadius: '4px',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>
              </div>

              {/* Phone & Quantity Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-main, #1C1917)',
                      marginBottom: '4px'
                    }}
                  >
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      border: '1px solid var(--border-medium, #D5CEBE)',
                      borderRadius: '4px',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--text-main, #1C1917)',
                      marginBottom: '4px'
                    }}
                  >
                    Preferred Contact Channel
                  </label>
                  <select
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleChange}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '0.7rem 0.85rem',
                      border: '1px solid var(--border-medium, #D5CEBE)',
                      borderRadius: '4px',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="Email">Email</option>
                    <option value="Phone">Phone Call</option>
                    <option value="WhatsApp">WhatsApp Message</option>
                    <option value="Any">Any Convenient Channel</option>
                  </select>
                </div>
              </div>

              {/* Message Field */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-main, #1C1917)',
                    marginBottom: '4px'
                  }}
                >
                  Enquiry Message *
                </label>
                <textarea
                  required
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share details regarding your room layout, desired timber finish, custom dimensions, or quantity..."
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-medium, #D5CEBE)',
                    borderRadius: '4px',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    backgroundColor: '#FFFFFF',
                    lineHeight: 1.5
                  }}
                />
              </div>

              {/* Security & Notification Notice */}
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted, #78716C)',
                  lineHeight: 1.4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Mail size={13} color="var(--accent-gold, #C4704F)" />
                <span>
                  Dispatched directly to the Atelier Concierge at <strong>elqara.home@gmail.com</strong>.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-dark"
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Transmitting Enquiry...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Enquiry to Atelier</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnquiryModal;
