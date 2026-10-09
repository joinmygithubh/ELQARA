import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminLogin(email, password);
      showToast('Master admin authentication successful', 'success');
      navigate('/admin');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#191614',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#24201C',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          padding: '3rem 2.5rem'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'rgba(181, 136, 99, 0.15)',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              border: '1px solid rgba(181, 136, 99, 0.3)'
            }}
          >
            <ShieldCheck size={28} />
          </div>

          <span style={{ fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: 600 }}>
            RESTRICTED ACCESS
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#FAF7F2', marginTop: '0.3rem' }}>
            ELQARA Atelier Portal
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'rgba(250, 247, 242, 0.55)', marginTop: '0.4rem' }}>
            Authorized administrator credentials required to manage products, categories, orders and artisans.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(250, 247, 242, 0.8)', marginBottom: '0.4rem' }}>
              Admin Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', top: '13px', left: '12px' }} />
              <input
                type="email"
                required
                placeholder="admin@elqara.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-xs)',
                  color: '#FFFFFF',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(250, 247, 242, 0.8)', marginBottom: '0.4rem' }}>
              Admin Secret Key / Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="rgba(255, 255, 255, 0.4)" style={{ position: 'absolute', top: '13px', left: '12px' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-xs)',
                  color: '#FFFFFF',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              backgroundColor: 'var(--accent-gold)',
              color: '#FFFFFF',
              padding: '0.95rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              marginTop: '0.5rem',
              boxShadow: 'var(--shadow-warm)'
            }}
          >
            <span>{loading ? 'Authenticating...' : 'Enter Atelier Portal'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: '0.8rem', color: 'rgba(250, 247, 242, 0.5)', textDecoration: 'underline' }}>
            ← Return to ELQARA Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
