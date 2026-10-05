import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingBag, Heart, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!isOpen || !product) return null;

  const isFavorited = isInWishlist(product._id);
  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail || '/logo-icon.svg'];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(25, 22, 20, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '880px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          position: 'relative',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'var(--text-main)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-hairline)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Left: Gallery */}
        <div style={{ backgroundColor: '#FAF7F2', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={images[selectedImage] || images[0]}
            alt={product.name}
            style={{ width: '100%', maxHeight: '380px', objectFit: 'contain' }}
          />
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  style={{
                    width: '54px',
                    height: '54px',
                    border: `2px solid ${selectedImage === i ? 'var(--text-main)' : 'var(--border-hairline)'}`,
                    borderRadius: 'var(--radius-xs)',
                    overflow: 'hidden',
                    backgroundColor: '#FFF'
                  }}
                >
                  <img src={img} alt={`Thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            {product.category?.name || product.categoryName}
          </div>

          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', lineHeight: 1.2, marginBottom: '0.8rem' }}>
            {product.name}
          </h2>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 600 }}>{formatPrice(product.price)}</span>
            {product.mrp > product.price && (
              <span style={{ fontSize: '1rem', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                {formatPrice(product.mrp)}
              </span>
            )}
            {product.discount > 0 && (
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-terracotta)' }}>
                Save {product.discount}%
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {product.shortDescription || product.description?.slice(0, 180) + '...'}
          </p>

          {/* Quick Specifications */}
          <div style={{ backgroundColor: '#FAF7F2', padding: '1rem', borderRadius: 'var(--radius-xs)', marginBottom: '1.5rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Material:</span>{' '}
                <strong>{product.specifications?.material || 'Solid Wood'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Dimensions:</span>{' '}
                <strong>{product.specifications?.dimensions || 'Standard'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Bulb:</span>{' '}
                <strong>{product.specifications?.bulbType || 'LED Warm'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Stock:</span>{' '}
                <strong style={{ color: product.stock > 0 ? '#16A34A' : '#DC2626' }}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Sold Out'}
                </strong>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '0.6rem 0.8rem' }}
              >
                -
              </button>
              <span style={{ padding: '0 0.8rem', fontWeight: 600, fontSize: '0.9rem' }}>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                style={{ padding: '0.6rem 0.8rem' }}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="btn-dark"
              disabled={product.stock <= 0}
              onClick={handleAddToCart}
              style={{ flex: 1 }}
            >
              <ShoppingBag size={16} />
              <span>{product.stock > 0 ? 'Add to Bag' : 'Sold Out'}</span>
            </button>

            <button
              type="button"
              className={`btn-outline ${isFavorited ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
              style={{ width: '48px', padding: 0 }}
              aria-label="Wishlist"
            >
              <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} color={isFavorited ? 'var(--accent-terracotta)' : 'inherit'} />
            </button>
          </div>

          <Link
            to={`/product/${product.slug}`}
            onClick={onClose}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              color: 'var(--text-main)',
              marginTop: '1.25rem',
              textDecoration: 'underline'
            }}
          >
            <span>View Full Specifications & Story</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
