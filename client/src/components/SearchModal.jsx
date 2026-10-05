import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { productAPI } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await productAPI.getAll({ search: query, limit: 6 });
        if (res.data?.success) {
          setResults(res.data.products);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const popularKeywords = ['Walnut Mushroom', 'Amber Glass', 'Floor Lamp', 'Pendant', 'Travertine', 'Sheesham Vessel'];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(25, 22, 20, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '5rem 1.5rem 2rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--border-hairline)'
          }}
        >
          <Search size={22} color="var(--text-muted)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search lamps, materials, collections (e.g. Walnut, Brass, Pendant)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1.1rem',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-sans)'
            }}
          />
          {loading && <Loader2 size={18} className="spin" color="var(--accent-gold)" />}
          <button
            type="button"
            onClick={onClose}
            style={{ color: 'var(--text-main)', cursor: 'pointer', padding: '4px' }}
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>

        {/* Popular Tags */}
        {!query && (
          <div style={{ padding: '1.5rem 1.75rem' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
              Suggested Searches
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {popularKeywords.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => setQuery(kw)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    fontSize: '0.82rem',
                    backgroundColor: '#F5F2EB',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-body)',
                    border: '1px solid var(--border-hairline)'
                  }}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '1rem 1.75rem' }}>
            {results.length === 0 && !loading ? (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No handcrafted pieces found matching "{query}". Try browsing our <Link to="/shop" onClick={onClose} style={{ textDecoration: 'underline', color: 'var(--text-main)' }}>shop catalog</Link>.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {results.map((product) => (
                  <Link
                    key={product._id}
                    to={`/product/${product.slug}`}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-xs)',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FAF7F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <img
                      src={product.thumbnail || '/logo-icon.svg'}
                      alt={product.name}
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '2px', backgroundColor: '#EDE6DD' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {product.category?.name || product.categoryName} • {formatPrice(product.price)}
                      </div>
                    </div>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SearchModal;
