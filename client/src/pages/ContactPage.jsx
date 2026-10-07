import React, { useState, useEffect } from 'react';
import {
  Compass,
  Hotel,
  Coffee,
  Gift,
  Store,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  FileText,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { enquiryAPI } from '../services/api';

const ContactPage = () => {
  const { showToast } = useToast();

  // Dynamic SEO metadata
  useEffect(() => {
    document.title = 'Trade & Projects | ELQARA';
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content =
      'ELQARA trade and project enquiries for interior designers, hospitality, restaurants, retailers, corporate gifting and larger requirements.';
    window.scrollTo(0, 0);
  }, []);

  // Form State preserving all existing enquiry fields and behaviors
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    businessType: 'Interior designers',
    quantity: '6–20 pieces',
    projectRequirement: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Five Trade Categories
  const tradeCategories = [
    {
      id: '01',
      title: 'Interior designers',
      description: 'Lighting and décor for residential and commercial schemes.',
      icon: Compass
    },
    {
      id: '02',
      title: 'Hospitality',
      description: 'Hotels, resorts and serviced apartments.',
      icon: Hotel
    },
    {
      id: '03',
      title: 'Restaurants & cafés',
      description: 'Warm, practical lighting for tables and counters.',
      icon: Coffee
    },
    {
      id: '04',
      title: 'Corporate gifting',
      description: 'Considered objects for clients and teams.',
      icon: Gift
    },
    {
      id: '05',
      title: 'Retailers',
      description: 'Selected stockists and design stores.',
      icon: Store
    }
  ];

  // Preserved Form Submission Logic & Validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validate Required Fields
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      showToast('Please provide your name (at least 2 characters)', 'error');
      setError('Please provide your name (at least 2 characters).');
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
      setError('Please provide project details with at least 5 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build structured message retaining company, business type, quantity, project scope
      const structuredDetails = [
        formData.company ? `Company / Studio: ${formData.company.trim()}` : null,
        `Business Category: ${formData.businessType}`,
        formData.quantity ? `Estimated Quantity: ${formData.quantity}` : null,
        formData.projectRequirement ? `Project Specification: ${formData.projectRequirement.trim()}` : null,
        `\nProject Scope & Message:\n${formData.message.trim()}`
      ]
        .filter(Boolean)
        .join('\n');

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: `Trade & Projects Enquiry — ${formData.businessType}${formData.company ? ` (${formData.company.trim()})` : ''}`,
        message: structuredDetails.trim(),
        productName: 'Trade & Projects Specification',
        quantity: parseInt(formData.quantity) || 1,
        productUrl: typeof window !== 'undefined' ? window.location.href : ''
      };

      const res = await enquiryAPI.submit(payload);

      if (res.data?.success) {
        setSubmitted(true);
        showToast('Your trade enquiry has been delivered to elqara.home@gmail.com.', 'success');
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
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: '4.5rem 0 7rem' }}>
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 1.5rem' }}>
        
        {/* 1. HERO SECTION */}
        <section style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 4.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.72rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--accent-gold)',
              fontWeight: 600,
              marginBottom: '1rem'
            }}
          >
            <span>B2B & ARCHITECTURAL ATELIER</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.8rem, 5vw, 4rem)',
              color: 'var(--text-main)',
              lineHeight: 1.12,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              marginBottom: '1.25rem'
            }}
          >
            Trade & projects
          </h1>

          <p
            style={{
              color: 'var(--text-body)',
              fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
              lineHeight: 1.65,
              fontWeight: 300,
              maxWidth: '720px',
              margin: '0 auto'
            }}
          >
            For projects, hospitality spaces, gifting and larger requirements — tell us what you are planning and we will come back with the right information.
          </p>
        </section>

        {/* 2. WHO WE WORK WITH SECTION */}
        <section style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--accent-gold)',
                display: 'block',
                marginBottom: '0.4rem',
                fontWeight: 600
              }}
            >
              COLLABORATIVE SECTORS
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 3.2vw, 2.6rem)',
                color: 'var(--text-main)',
                fontWeight: 500
              }}
            >
              Who we work with
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              alignItems: 'stretch'
            }}
          >
            {tradeCategories.map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div
                  key={cat.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-hairline)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2.2rem 1.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = 'rgba(181, 136, 99, 0.35)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-hairline)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem'
                      }}
                    >
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: '#FAF7F2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--accent-gold)'
                        }}
                      >
                        <IconComponent size={20} strokeWidth={1.5} />
                      </div>
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1rem',
                          color: 'var(--accent-gold)',
                          letterSpacing: '0.1em'
                        }}
                      >
                        {cat.id}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.45rem',
                        color: 'var(--text-main)',
                        marginBottom: '0.75rem',
                        fontWeight: 500
                      }}
                    >
                      {cat.title}
                    </h3>

                    <p
                      style={{
                        color: 'var(--text-body)',
                        fontSize: '0.92rem',
                        lineHeight: 1.6,
                        fontWeight: 300
                      }}
                    >
                      {cat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. TRADE INFORMATION STATEMENT BANNER */}
        <section
          style={{
            backgroundColor: '#F4EFEA',
            border: '1px solid rgba(181, 136, 99, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            maxWidth: '960px',
            margin: '0 auto 5rem',
            position: 'relative'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--accent-gold)',
              marginBottom: '0.75rem'
            }}
          >
            <FileText size={18} strokeWidth={1.6} />
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.75rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 600
              }}
            >
              TRADE PROCUREMENT PROTOCOL
            </span>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(1.2rem, 2.2vw, 1.45rem)',
              color: 'var(--text-main)',
              lineHeight: 1.5,
              fontWeight: 400,
              maxWidth: '820px',
              margin: '0 auto'
            }}
          >
            “We will reply with the catalogue, trade pricing and lead times for your quantity. Quantities and specifications are confirmed case by case.”
          </p>
        </section>

        {/* 4. MAIN ENQUIRY FORM SECTION (2-Column: Form & Atelier Info) */}
        <section id="trade-form-section">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.9fr)',
              gap: '3.5rem',
              alignItems: 'start'
            }}
            className="trade-grid-layout"
          >
            {/* Form Column */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                padding: 'clamp(1.75rem, 4vw, 3rem)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-gold)',
                    display: 'block',
                    marginBottom: '0.35rem',
                    fontWeight: 600
                  }}
                >
                  PROJECT SPECIFICATION
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(1.8rem, 3vw, 2.3rem)',
                    color: 'var(--text-main)',
                    fontWeight: 500,
                    marginBottom: '0.5rem'
                  }}
                >
                  Request Trade Information
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.55 }}>
                  Provide your requirements below. Our atelier trade director reviews all commercial briefs personally.
                </p>
              </div>

              {submitted ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '3.5rem 1.5rem',
                    backgroundColor: '#FAF7F2',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-hairline)'
                  }}
                >
                  <CheckCircle2 size={52} color="#16A34A" style={{ margin: '0 auto 1.25rem' }} />
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.9rem',
                      color: 'var(--text-main)',
                      marginBottom: '0.75rem'
                    }}
                  >
                    Trade Enquiry Received
                  </h3>
                  <p
                    style={{
                      color: 'var(--text-body)',
                      fontSize: '0.98rem',
                      lineHeight: 1.6,
                      maxWidth: '480px',
                      margin: '0 auto 2rem'
                    }}
                  >
                    Thank you, <strong>{formData.name}</strong>. We will reply with the catalogue, trade pricing and lead times for your quantity.
                  </p>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        company: '',
                        email: '',
                        phone: '',
                        businessType: 'Interior designers',
                        quantity: '6–20 pieces',
                        projectRequirement: '',
                        message: ''
                      });
                    }}
                    style={{ padding: '0.75rem 1.75rem', fontSize: '0.88rem' }}
                  >
                    Submit Another Project Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
                  {/* Row 1: Name & Company */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        style={{
                          width: '100%',
                          padding: '0.8rem 0.9rem',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          backgroundColor: '#FFF'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                        Company / Design Studio
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Atelier Studio Interiors"
                        style={{
                          width: '100%',
                          padding: '0.8rem 0.9rem',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          backgroundColor: '#FFF'
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 2: Email & Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rahul@example.com"
                        style={{
                          width: '100%',
                          padding: '0.8rem 0.9rem',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          backgroundColor: '#FFF'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        style={{
                          width: '100%',
                          padding: '0.8rem 0.9rem',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          backgroundColor: '#FFF'
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 3: Business Type & Estimated Quantity */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                        Business Type
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.8rem 0.9rem',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          backgroundColor: '#FFF'
                        }}
                      >
                        <option value="Interior designers">Interior designers</option>
                        <option value="Hospitality">Hospitality</option>
                        <option value="Restaurants & cafés">Restaurants & cafés</option>
                        <option value="Corporate gifting">Corporate gifting</option>
                        <option value="Retailers">Retailers</option>
                        <option value="Architectural / Residential Project">Architectural / Residential Project</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                        Estimated Quantity
                      </label>
                      <select
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.8rem 0.9rem',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          backgroundColor: '#FFF'
                        }}
                      >
                        <option value="1–5 pieces (Prototype / Sample)">1–5 pieces (Prototype / Sample)</option>
                        <option value="6–20 pieces">6–20 pieces</option>
                        <option value="21–50 pieces">21–50 pieces</option>
                        <option value="50–100 pieces">50–100 pieces</option>
                        <option value="100+ pieces (Commercial Scale)">100+ pieces (Commercial Scale)</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 4: Project / Requirement */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      Project / Requirement Scope
                    </label>
                    <input
                      type="text"
                      value={formData.projectRequirement}
                      onChange={(e) => setFormData({ ...formData, projectRequirement: e.target.value })}
                      placeholder="e.g. Boutique Hotel Lounge Lighting, Villa Dining Fixtures, Corporate Hampers"
                      style={{
                        width: '100%',
                        padding: '0.8rem 0.9rem',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        backgroundColor: '#FFF'
                      }}
                    />
                  </div>

                  {/* Row 5: Message */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                      Message & Specification Details *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us what you are planning, key deadlines, timber/finish preferences, or specific catalogue pieces you require..."
                      style={{
                        width: '100%',
                        padding: '0.85rem 0.9rem',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.9rem',
                        outline: 'none',
                        resize: 'vertical',
                        lineHeight: 1.5,
                        backgroundColor: '#FFF'
                      }}
                    />
                  </div>

                  {/* Error Notification */}
                  {error && (
                    <div
                      style={{
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FCA5A5',
                        borderRadius: 'var(--radius-xs)',
                        padding: '0.85rem 1rem',
                        color: '#B91C1C',
                        fontSize: '0.86rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      <AlertCircle size={17} style={{ flexShrink: 0 }} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-dark"
                    style={{
                      padding: '1.05rem 1.5rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.75 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      fontSize: '0.95rem',
                      letterSpacing: '0.04em',
                      fontWeight: 600,
                      marginTop: '0.5rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="spin" />
                        <span>Transmitting Trade Enquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send size={17} />
                        <span>Request Trade Information</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Atelier Heritage & Physical Hub */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2.5rem 2rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-gold)',
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontWeight: 600
                  }}
                >
                  DIRECT ATELIER LIAISON
                </span>

                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.8rem',
                    color: 'var(--text-main)',
                    marginBottom: '1.25rem',
                    fontWeight: 500
                  }}
                >
                  ELQARA Workshop & Studio
                </h3>

                <p
                  style={{
                    color: 'var(--text-body)',
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    fontWeight: 300,
                    marginBottom: '1.75rem'
                  }}
                >
                  We partner closely with design studios, hoteliers, and procurement managers worldwide. Custom adaptations, timber seasoning specs, and volume fabrication are executed directly from our Saharanpur workshops.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Phone size={20} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>Trade & Direct Desk:</strong>{' '}
                      <a href="tel:+919876543210" style={{ color: 'var(--text-body)', textDecoration: 'none' }}>
                        +91 98765 43210
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Mail size={20} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>Trade Enquiries:</strong>{' '}
                      <a href="mailto:elqara.home@gmail.com" style={{ color: 'var(--accent-gold)', textDecoration: 'none' }}>
                        elqara.home@gmail.com
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <Clock size={20} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '3px' }}>
                        Production & Desk Hours:
                      </strong>
                      <span style={{ color: 'var(--text-body)', lineHeight: 1.5 }}>
                        Monday – Saturday: 10:00 AM – 7:00 PM IST<br />
                        Response turnaround within 24 business hours.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trade Collaboration Standards Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2.2rem 2rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.72rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--accent-gold)',
                    display: 'block',
                    marginBottom: '0.4rem',
                    fontWeight: 600
                  }}
                >
                  SPECIFIER ADVANTAGES
                </span>

                <h4
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.5rem',
                    color: 'var(--text-main)',
                    marginBottom: '1rem',
                    fontWeight: 500
                  }}
                >
                  Trade Collaboration Standards
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', fontSize: '0.88rem', color: 'var(--text-body)' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    <Layers size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>
                        Custom Finishes & Timber Selection
                      </strong>
                      <span>Kiln-seasoned walnut, teak, and Sheesham with bespoke natural oil or scorched wax finishes.</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    <FileText size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>
                        Architectural Specification Sheets
                      </strong>
                      <span>Photometric details, CAD files, dimensional drawings, and material samples available for schemes.</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                    <ShieldCheck size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <div>
                      <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>
                        Reinforced Wooden Crate Freight
                      </strong>
                      <span>Fully insured white-glove logistics engineered for fragile glass and solid wood luminaires worldwide.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Responsive Style Tweaks */}
      <style>{`
        @media (max-width: 900px) {
          .trade-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
