import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import CurrencySelector from './CurrencySelector';

// Recognizable Brand SVG Icons
const InstagramIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const PinterestIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
  </svg>
);

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

            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.25rem', color: 'rgba(250,247,242,0.7)' }}>
              Handcrafted sculptural lighting and interior decor. Rooted in generational Indian artisan woodworking and timeless modern silhouettes.
            </p>

            <div style={{ fontSize: '0.82rem', color: 'rgba(250,247,242,0.6)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Crafted with sustainably harvested solid timbers, cast brass, and hand-blown glass.
            </div>

            {/* Official Social Media Channels */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <a
                href="https://www.instagram.com/elqara.objects/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow ELQARA on Instagram"
                title="Instagram — @elqara.objects"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(250, 247, 242, 0.85)',
                  transition: 'all 0.25s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = 'rgba(250, 247, 242, 0.85)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <InstagramIcon size={18} />
              </a>

              <a
                href="https://in.pinterest.com/elqaraobjects/?actingBusinessId=1091278690866269284"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow ELQARA on Pinterest"
                title="Pinterest — @elqaraobjects"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(250, 247, 242, 0.85)',
                  transition: 'all 0.25s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = 'rgba(250, 247, 242, 0.85)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <PinterestIcon size={18} />
              </a>
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
                  Table Lamps
                </Link>
              </li>
              <li>
                <Link to="/shop?category=floor-lamps" style={{ color: 'inherit', transition: 'color 150ms' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Floor Lamps
                </Link>
              </li>
              <li>
                <Link to="/shop?category=pendant-lights" style={{ color: 'inherit', transition: 'color 150ms' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Pendant Lights
                </Link>
              </li>
              <li>
                <Link to="/shop?category=wall-lights" style={{ color: 'inherit', transition: 'color 150ms' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Wall Lights & Sconces
                </Link>
              </li>
              <li>
                <Link to="/shop?category=candle-lamps" style={{ color: 'inherit', transition: 'color 150ms' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Candle Lamps & Warmers
                </Link>
              </li>
              <li>
                <Link to="/shop?category=home-decor" style={{ color: 'inherit', transition: 'color 150ms' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'inherit')}>
                  Saharanpur Home Decor
                </Link>
              </li>
              <li>
                <Link to="/shop" style={{ color: 'var(--accent-gold)', fontWeight: 600, transition: 'color 150ms' }} onMouseEnter={(e) => (e.target.style.color = '#FFF')} onMouseLeave={(e) => (e.target.style.color = 'var(--accent-gold)')}>
                  All 15 Disciplines →
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
                  Trade & Projects
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
