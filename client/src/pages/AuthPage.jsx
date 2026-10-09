import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';

const AuthPage = () => {
  // Mode: 'login' | 'register' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [resetSentEmail, setResetSentEmail] = useState('');

  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/account';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        showToast('Welcome back to ELQARA', 'success');
        navigate(from, { replace: true });
      } else if (mode === 'register') {
        if (!formData.name || !formData.email || !formData.password) {
          showToast('Please fill all required fields', 'error');
          setLoading(false);
          return;
        }
        await register(formData);
        showToast('Account created successfully! Welcome.', 'success');
        navigate('/account', { replace: true });
      } else if (mode === 'forgot') {
        if (!formData.email) {
          showToast('Please provide your registered email', 'error');
          setLoading(false);
          return;
        }
        const res = await authAPI.forgotPassword({ email: formData.email });
        if (res.data?.success) {
          showToast(res.data.message, 'success');
          setResetSentEmail(formData.email);
          setMode('reset');
        }
      } else if (mode === 'reset') {
        if (!formData.email || !formData.resetCode || !formData.newPassword) {
          showToast('Please provide your verification code and new password', 'error');
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          showToast('Password must be at least 6 characters', 'error');
          setLoading(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          showToast('Passwords do not match', 'error');
          setLoading(false);
          return;
        }
        const res = await authAPI.resetPassword({
          email: formData.email,
          resetCode: formData.resetCode.trim(),
          newPassword: formData.newPassword
        });
        if (res.data?.success) {
          showToast(res.data.message, 'success');
          setMode('login');
          setFormData((prev) => ({ ...prev, password: '', resetCode: '', newPassword: '', confirmPassword: '' }));
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getHeading = () => {
    switch (mode) {
      case 'register':
        return { pre: 'BECOME A COLLECTOR', title: 'Create Your Account', sub: 'Join our patron circle to receive artisanal updates and tracking.' };
      case 'forgot':
        return { pre: 'CREDENTIAL ASSISTANCE', title: 'Forgot Password', sub: 'Enter your email address to receive password reset guidance.' };
      case 'reset':
        return { pre: 'SECURITY UPDATE', title: 'Reset Password', sub: 'Enter a new secure password for your collector account.' };
      case 'login':
      default:
        return { pre: 'COLLECTOR ACCESS', title: 'Sign In to ELQARA', sub: 'Access your orders, saved addresses, and private previews.' };
    }
  };

  const headingInfo = getHeading();

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-md)',
          padding: '3rem 2.5rem'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="pre-heading" style={{ justifyContent: 'center' }}>
            {headingInfo.pre}
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--text-main)', marginTop: '0.4rem' }}>
            {headingInfo.title}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {headingInfo.sub}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '13px', left: '12px' }} />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Arjun Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xs)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '13px', left: '12px' }} />
              <input
                type="email"
                name="email"
                required
                placeholder="collector@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-xs)',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '13px', left: '12px' }} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xs)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {(mode === 'login' || mode === 'register') && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  Password *
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '13px', left: '12px' }} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xs)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {mode === 'reset' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  6-Digit Verification Code *
                </label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '13px', left: '12px' }} />
                  <input
                    type="text"
                    name="resetCode"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit code sent to your email"
                    value={formData.resetCode}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      outline: 'none',
                      letterSpacing: '0.15em',
                      fontWeight: 600
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  New Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '13px', left: '12px' }} />
                  <input
                    type="password"
                    name="newPassword"
                    required
                    placeholder="At least 6 characters"
                    value={formData.newPassword}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Confirm New Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', top: '13px', left: '12px' }} />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="Repeat new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-xs)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-dark"
            style={{ width: '100%', padding: '0.95rem', marginTop: '0.5rem' }}
          >
            <span>
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                ? 'Create Account'
                : mode === 'forgot'
                ? 'Send Reset Instructions'
                : 'Save New Password'}
            </span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {mode === 'login' && (
            <div>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Register now
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Sign in here
              </button>
            </div>
          )}

          {(mode === 'forgot' || mode === 'reset') && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{ color: 'var(--text-main)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
