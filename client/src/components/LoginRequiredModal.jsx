import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginRequiredModal = () => {
  const { authModal, closeAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authModal?.isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeAuthModal();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'auto';
      };
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [authModal?.isOpen, closeAuthModal]);

  if (!authModal?.isOpen) return null;

  const handleLogin = () => {
    const returnUrl = authModal.returnUrl || '/checkout';
    closeAuthModal();
    navigate('/login', { state: { from: returnUrl } });
  };

  const handleContinueShopping = () => {
    closeAuthModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-required-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(25, 22, 20, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 3500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleContinueShopping}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-hairline)',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleContinueShopping}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Lock Icon */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: 'var(--accent-gold)'
          }}
        >
          <Lock size={24} />
        </div>

        <span className="pre-heading" style={{ justifyContent: 'center' }}>
          COLLECTOR ACCESS
        </span>

        <h2
          id="login-required-title"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.85rem',
            color: 'var(--text-main)',
            marginTop: '0.4rem',
            marginBottom: '0.75rem',
            lineHeight: 1.25
          }}
        >
          You need to log in to buy products.
        </h2>

        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            lineHeight: 1.55,
            marginBottom: '2rem'
          }}
        >
          Please sign in to your patron account to add pieces to your bag, reserve handcrafted editions, and complete checkout.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-dark"
            onClick={handleLogin}
            style={{ width: '100%', padding: '0.9rem', justifyContent: 'center' }}
          >
            <span>Login</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="btn-outline"
            onClick={handleContinueShopping}
            style={{ width: '100%', padding: '0.9rem', justifyContent: 'center' }}
          >
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
