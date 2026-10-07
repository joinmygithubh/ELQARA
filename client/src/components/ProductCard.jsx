import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, MessageSquare } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import EnquiryModal from './EnquiryModal';

const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  if (!product) return null;

  const isFavorited = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;

  return (
    <article className="product-card">
      <div className="product-img-wrapper">
        <Link to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
          <img
            src={product.thumbnail || (product.images && product.images[0]) || '/logo-icon.svg'}
            alt={product.name}
            className="product-img"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="card-badges">
          {product.newArrival && <span className="badge-tag">New</span>}
          {product.bestSeller && <span className="badge-tag">Best Seller</span>}
          {product.discount > 0 && (
            <span className="badge-tag discount">{product.discount}% OFF</span>
          )}
          {isOutOfStock && (
            <span className="badge-tag" style={{ background: '#78716C', color: '#FFF' }}>
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          className={`wishlist-btn-card ${isFavorited ? 'active' : ''}`}
          onClick={() => toggleWishlist(product)}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>

        {/* Quick Add Overlay on Desktop Hover */}
        {!isOutOfStock && (
          <div className="card-hover-actions">
            {onQuickView && (
              <button
                type="button"
                className="btn-quick-add"
                onClick={() => onQuickView(product)}
                aria-label="Quick View"
                style={{ flex: 'none', width: '38px', padding: 0 }}
              >
                <Eye size={16} />
              </button>
            )}
            <button
              type="button"
              className="btn-quick-add"
              onClick={() => addToCart(product, 1)}
            >
              <ShoppingBag size={15} />
              <span>Add to Bag</span>
            </button>
          </div>
        )}

        {isOutOfStock && (
          <div className="card-hover-actions">
            <button
              type="button"
              className="btn-quick-add"
              onClick={() => setIsEnquiryOpen(true)}
              style={{ backgroundColor: '#1C1B18' }}
            >
              <MessageSquare size={14} />
              <span>Request / Enquire</span>
            </button>
          </div>
        )}
      </div>

      <div className="product-info">
        <div className="product-cat-label">
          {product.category?.name || product.categoryName || 'Artisanal Object'}
        </div>

        <Link to={`/product/${product.slug}`} className="product-name-link">
          {product.name}
        </Link>

        {/* Rating preview */}
        {product.ratings && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', color: 'var(--accent-gold)' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.floor(product.ratings.average || 5) ? 'currentColor' : 'none'}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              ({product.ratings.count || 12})
            </span>
          </div>
        )}

        <div className="product-price-row">
          <span className="product-price">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="product-mrp">{formatPrice(product.mrp)}</span>
          )}
          {product.discount > 0 && (
            <span className="product-discount-pill">Save {product.discount}%</span>
          )}
        </div>
      </div>

      {/* Product Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        product={product}
      />
    </article>
  );
};

export default ProductCard;
