import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import CurrencySelector from './CurrencySelector';

const Footer = () => {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    showToast('Thank you for joining the ELQARA Journal. Welcome to the circle.', 'success');
    setEmail('');
  };

  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-dark)',
        color: 'rgba(250, 247, 242, 0.75)',
        paddingTop: '5rem',
        paddingBottom: '2.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div className="container">
        {/* Top 4-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
            paddingBottom: '4rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Col 1: Brand & Atelier Address */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2rem',
                  letterSpacing: '0.12em',
                  color: 'var(--text-white)',
                  textTransform: 'uppercase',
                  display: 'block',
                  lineHeight: 1
                }}
              >
                ELQARA
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.55rem',
                  letterSpacing: '0.28em',
                  color: 'var(--accent-gold)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginTop: '4px'
                }}
              >
                OBJECTS FOR LIVING
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem', color: 'rgba(250,247,242,0.7)' }}>
              Handcrafted sculptural lighting and interior decor. Rooted in generational Indian artisan woodworking and timeless modern silhouettes.
            </p>

            {/* Official Saharanpur Business Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.82rem', lineHeight: 1.5 }}>
              <MapPin size={16} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: 'var(--text-white)' }}>ELQARA Atelier:</strong><br />
                Udhyog Nagar, Ambala Road,<br />
                Badi Neher, Saharanpur,<br />
                Uttar Pradesh – 247001, India
              </div>
            </div>
          </div>

          {/* Col 2: Curated Collections */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-white)',
                marginBottom: '1.25rem'
              }}
            >
              Collections
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <li>
                <Link to="/shop?category=table-lamps" style={{ color: 'inherit', transition: 'color 150ms' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Table & Accent Lamps
                </Link>
              </li>
              <li>
                <Link to="/shop?category=floor-lamps" style={{ color: 'inherit', transition: 'color 150ms' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Architectural Floor Lamps
                </Link>
              </li>
              <li>
                <Link to="/shop?category=pendant-lights" style={{ color: 'inherit', transition: 'color 150ms' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Pleated Pendant Lights
                </Link>
              </li>
              <li>
                <Link to="/shop?category=home-decor" style={{ color: 'inherit', transition: 'color 150ms' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Saharanpur Hand-carved Decor
                </Link>
              </li>
              <li>
                <Link to="/shop" style={{ color: 'inherit', transition: 'color 150ms' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  All Editions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Brand & Care */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-white)',
                marginBottom: '1.25rem'
              }}
            >
              The Brand
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <li>
                <Link to="/about" style={{ color: 'inherit' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Our Story & Heritage
                </Link>
              </li>
              <li>
                <Link to="/journal" style={{ color: 'inherit' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  The ELQARA Journal
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: 'inherit' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Customer Concierge
                </Link>
              </li>
              <li>
                <Link to="/account" style={{ color: 'inherit' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/admin" style={{ color: 'rgba(250, 247, 242, 0.45)', fontSize: '0.75rem' }}>
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--text-white)',
                marginBottom: '1.25rem'
              }}
            >
              The Collector's Circle
            </h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem', color: 'rgba(250,247,242,0.7)' }}>
              Subscribe to receive private previews of new seasonal editions, artisanal design insights, and 10% off your first curation.
            </p>

            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex' }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.07)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'var(--text-white)',
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--accent-gold)',
                    color: '#FFFFFF',
                    padding: '0 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  aria-label="Subscribe"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'rgba(250,247,242,0.45)' }}>
                We respect your privacy. Unsubscribe at any time.
              </span>
            </form>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Assurance */}
        <div
          style={{
            paddingTop: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            fontSize: '0.78rem',
            color: 'rgba(250, 247, 242, 0.5)'
          }}
        >
          <div>
            © {new Date().getFullYear()} ELQARA — Objects for Living. All rights reserved. Handcrafted with reverence in Saharanpur, India.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(250, 247, 242, 0.7)' }}>Currency:</span>
              <CurrencySelector variant="footer" />
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={14} color="var(--accent-gold)" /> Secure 256-bit Encrypted Checkout
            </span>
            <span>UPI • Credit Cards • NetBanking • Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
