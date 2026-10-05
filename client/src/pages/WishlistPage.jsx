import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleMoveToCart = (item) => {
    addToCart(item, 1);
    removeFromWishlist(item._id);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '80vh', padding: '3.5rem 0 6rem' }}>
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="pre-heading">PERSONAL CURATION</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.4rem' }}>
            Your Saved Editions ({wishlistItems.length})
          </h1>
        </div>

        {wishlistItems.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '5rem 2rem',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            <Heart size={42} color="var(--text-muted)" style={{ margin: '0 auto 1.25rem' }} />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '0.6rem' }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Save your favorite lamps, pendants, and handcrafted woodwork as you explore the catalog.
            </p>
            <Link to="/shop" className="btn-dark">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {wishlistItems.map((item) => (
              <div
                key={item._id}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-xs)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '1 / 1', backgroundColor: '#F8F5F0' }}>
                  <img
                    src={item.thumbnail || '/logo-icon.svg'}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item._id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: '1px solid var(--border-hairline)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    aria-label="Remove"
                  >
                    <Trash2 size={15} color="var(--text-muted)" />
                  </button>
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    {item.categoryName || 'Lighting'}
                  </div>
                  <Link
                    to={`/product/${item.slug}`}
                    style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '0.6rem' }}
                  >
                    {item.name}
                  </Link>

                  <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '1.25rem' }}>
                    {formatPrice(item.price)}
                  </div>

                  <button
                    type="button"
                    className="btn-dark"
                    onClick={() => handleMoveToCart(item)}
                    style={{ width: '100%', padding: '0.75rem', marginTop: 'auto', fontSize: '0.8rem' }}
                  >
                    <ShoppingBag size={14} />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
