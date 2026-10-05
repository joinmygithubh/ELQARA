import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    discountAmount,
    totalAmount,
    coupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { formatPrice, currency } = useCurrency();
  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    await applyCoupon(couponInput);
    setApplying(false);
    setCouponInput('');
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const freeShippingThreshold = 1999;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className={`drawer-backdrop ${isCartOpen ? 'open' : ''}`} onClick={closeCart}>
      <aside
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping Bag Drawer"
      >
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} strokeWidth={1.5} />
            <h2 className="drawer-title">Shopping Bag ({cartItems.length})</h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            style={{ color: 'var(--text-main)', cursor: 'pointer' }}
            aria-label="Close Shopping Bag"
          >
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {cartItems.length > 0 && (
          <div
            style={{
              padding: '0.75rem 1.75rem',
              backgroundColor: '#F5F2EB',
              borderBottom: '1px solid var(--border-hairline)'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', marginBottom: '0.4rem' }}>
              {remainingForFreeShipping === 0 ? (
                <span style={{ color: '#16A34A', fontWeight: 600 }}>
                  ✦ You qualify for complimentary white-glove shipping!
                </span>
              ) : (
                <span>
                  Add <strong>{formatPrice(remainingForFreeShipping)}</strong> more for complimentary shipping
                </span>
              )}
            </div>
            <div style={{ height: '4px', background: '#E5E0D8', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressToFreeShipping}%`,
                  backgroundColor: 'var(--accent-gold)',
                  transition: 'width 300ms ease'
                }}
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="drawer-body">
          {cartItems.length === 0 ? (
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
                <ShoppingBag size={28} strokeWidth={1.2} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.4rem' }}>
                Your bag is empty
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '240px' }}>
                Explore our handcrafted lamps and sculptural home décor.
              </p>
              <button
                type="button"
                className="btn-dark"
                onClick={() => {
                  closeCart();
                  navigate('/shop');
                }}
              >
                Explore Collection
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {cartItems.map((item) => (
                <div
                  key={item.product}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    paddingBottom: '1.25rem',
                    borderBottom: '1px solid var(--border-hairline)'
                  }}
                >
                  <img
                    src={item.image || '/logo-icon.svg'}
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
                        onClick={closeCart}
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
                        onClick={() => removeFromCart(item.product)}
                        style={{ color: 'var(--text-light)', cursor: 'pointer', padding: '2px' }}
                        aria-label="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)', margin: '0.3rem 0' }}>
                      {formatPrice(item.price)}
                    </div>

                    {/* Quantity Stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product, item.quantity - 1)}
                          style={{ padding: '0.25rem 0.5rem', color: 'var(--text-body)' }}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, padding: '0 0.5rem', minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.product, item.quantity + 1)}
                          style={{ padding: '0.25rem 0.5rem', color: 'var(--text-body)' }}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with breakdown */}
        {cartItems.length > 0 && (
          <div className="drawer-footer">
            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Discount code (e.g. WELCOME10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.82rem',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--bg-primary)'
                }}
              />
              <button
                type="submit"
                disabled={applying}
                className="btn-outline"
                style={{ padding: '0.65rem 1rem', fontSize: '0.75rem' }}
              >
                {applying ? 'Applying...' : 'Apply'}
              </button>
            </form>

            {coupon && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.75rem',
                  backgroundColor: '#FEF3C7',
                  fontSize: '0.78rem',
                  color: '#92400E',
                  marginBottom: '1rem',
                  borderRadius: 'var(--radius-xs)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tag size={13} />
                  <span>Coupon {coupon.code} applied (-{formatPrice(discountAmount)})</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  style={{ textDecoration: 'underline', color: '#92400E', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-terracotta)' }}>
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping</span>
                <span>{shippingFee === 0 ? 'Complimentary' : formatPrice(shippingFee)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  color: 'var(--text-main)',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-hairline)',
                  marginTop: '0.2rem'
                }}
              >
                <span>Estimated Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-dark"
              onClick={handleCheckout}
              style={{ width: '100%', padding: '0.9rem', marginBottom: '0.5rem' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <Link
              to="/cart"
              onClick={closeCart}
              style={{
                display: 'block',
                textAlign: 'center',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                paddingTop: '0.4rem'
              }}
            >
              View Full Cart & Details
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
