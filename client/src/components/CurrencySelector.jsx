// client/src/components/CurrencySelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Globe } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const CurrencySelector = ({ variant = 'header', className = '' }) => {
  const { currency, setCurrency, supportedCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeCurrency = supportedCurrencies.find((c) => c.code === currency) || supportedCurrencies[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    setCurrency(code, true);
    setIsOpen(false);
  };

  const isFooter = variant === 'footer';

  return (
    <div
      ref={dropdownRef}
      className={`currency-selector-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        fontFamily: 'inherit',
        zIndex: 50
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select Currency. Currently ${activeCurrency.code}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: isFooter ? '6px 12px' : '4px 10px',
          background: isFooter ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.12)',
          border: isFooter ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: isFooter ? '0.8rem' : '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.04em',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isFooter ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.22)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isFooter ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.12)';
        }}
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>{activeCurrency.flag}</span>
        <span style={{ fontWeight: 600 }}>{activeCurrency.code}</span>
        <span style={{ opacity: 0.8 }}>({activeCurrency.symbol})</span>
        <ChevronDown
          size={12}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            opacity: 0.7
          }}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            ...(isFooter ? { bottom: 'calc(100% + 8px)', right: 0 } : { top: 'calc(100% + 8px)', right: 0 }),
            width: '240px',
            maxHeight: '320px',
            overflowY: 'auto',
            background: '#1c1b18',
            color: '#f5f3ef',
            borderRadius: '12px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            padding: '6px',
            zIndex: 1000,
            backdropFilter: 'blur(10px)',
            animation: 'fadeInMenu 0.15s ease-out'
          }}
        >
          <div
            style={{
              padding: '6px 10px 8px',
              fontSize: '0.68rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.45)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Globe size={11} /> Select Currency
          </div>

          {supportedCurrencies.map((c) => {
            const isSelected = c.code === currency;
            return (
              <button
                key={c.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(c.code)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(196, 112, 79, 0.22)' : 'transparent',
                  border: isSelected ? '1px solid rgba(196, 112, 79, 0.4)' : '1px solid transparent',
                  color: isSelected ? '#e8a87c' : '#f5f3ef',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.82rem',
                  transition: 'background 0.15s ease',
                  margin: '2px 0'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{c.flag}</span>
                  <div>
                    <span style={{ fontWeight: 600 }}>{c.code}</span>
                    <span style={{ opacity: 0.6, fontSize: '0.75rem', marginLeft: '6px' }}>{c.name}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', opacity: 0.85 }}>{c.symbol}</span>
                  {isSelected && <Check size={13} style={{ color: '#e8a87c' }} />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
