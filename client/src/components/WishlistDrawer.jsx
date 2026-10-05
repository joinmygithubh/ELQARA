import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const WishlistDrawer = () => {
  const { wishlistItems, isWishlistOpen, closeWishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleMoveToCart = (item) => {
    addToCart(item, 1);
    removeFromWishlist(item._id);
  };

  return (
    <div className={`drawer-backdrop ${isWishlistOpen ? 'open' : ''}`} onClick={closeWishlist}>
      <aside
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Wishlist Drawer"
      >
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Heart size={20} strokeWidth={1.5} color="var(--accent-terracotta)" />
            <h2 className="drawer-title">Wishlist ({wishlistItems.length})</h2>
          </div>
          <button
            type="button"
            onClick={closeWishlist}
            style={{ color: 'var(--text-main)', cursor: 'pointer' }}
            aria-label="Close Wishlist"
          >
            <X size={22} />
          </button>
        </div>

        <div className="drawer-body">
          {wishlistItems.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                padding: '2rem'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#F4EFEA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  marginBottom: '1rem'
                }}
              >
                <Heart size={28} strokeWidth={1.2} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.4rem' }}>
                Your wishlist is empty
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '240px' }}>
                Tap the heart on any lamp or decor item to save it for later.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {wishlistItems.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    paddingBottom: '1.25rem',
                    borderBottom: '1px solid var(--border-hairline)'
                  }}
                >
                  <img
                    src={item.thumbnail || '/logo-icon.svg'}
                    alt={item.name}
                    style={{
                      width: '74px',
                      height: '74px',
                      objectFit: 'cover',
                      backgroundColor: '#F7F4EE',
                      borderRadius: 'var(--radius-xs)'
                    }}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Link
                        to={`/product/${item.slug}`}
                        onClick={closeWishlist}
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: '1rem',
                          color: 'var(--text-main)',
                          lineHeight: 1.25
                        }}
                      >
                        {item.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item._id)}
                        style={{ color: 'var(--text-light)', cursor: 'pointer', padding: '2px' }}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', margin: '0.3rem 0' }}>
                      {formatPrice(item.price)}
                    </div>

                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => handleMoveToCart(item)}
                      style={{ padding: '0.45rem 0.8rem', fontSize: '0.75rem', width: 'fit-content' }}
                    >
                      <ShoppingBag size={13} />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {wishlistItems.length > 0 && (
          <div className="drawer-footer">
            <Link
              to="/wishlist"
              onClick={closeWishlist}
              className="btn-dark"
              style={{ width: '100%', textAlign: 'center', display: 'block' }}
            >
              View Full Wishlist Page
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
};

export default WishlistDrawer;
