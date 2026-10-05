import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const CartPage = () => {
  const {
    cartItems,
    subtotal,
    shippingFee,
    discountAmount,
    totalAmount,
    updateQuantity,
    removeFromCart,
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

  if (cartItems.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '80vh', padding: '5rem 1rem' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '560px' }}>
          <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem' }} />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginBottom: '0.8rem' }}>
            Your Bag is Empty
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            There are currently no handcrafted lighting editions in your shopping bag.
          </p>
          <Link to="/shop" className="btn-dark">
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: '3.5rem 0 6rem' }}>
      <div className="container">
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="pre-heading">YOUR SELECTIONS</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.4rem' }}>
            Shopping Bag ({cartItems.length} items)
          </h1>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'start'
          }}
        >
          {/* Left: Cart Items Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cartItems.map((item) => (
              <div
                key={item.product}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1.5rem',
                  display: 'flex',
                  gap: '1.5rem',
                  alignItems: 'center'
                }}
              >
                <img
                  src={item.image || '/logo-icon.svg'}
                  alt={item.name}
                  style={{ width: '84px', height: '84px', objectFit: 'cover', borderRadius: 'var(--radius-xs)', backgroundColor: '#F8F5F0' }}
                />

                <div style={{ flex: 1 }}>
                  <Link
                    to={`/product/${item.slug}`}
                    style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}
                  >
                    {item.name}
                  </Link>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                    SKU: {item.sku}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                    {formatPrice(item.price)}
                  </div>
                </div>

                {/* Quantity */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: '#FAF7F2'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product, item.quantity - 1)}
                    style={{ padding: '0.4rem 0.7rem' }}
                    aria-label="Decrease"
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ padding: '0 0.6rem', fontWeight: 600, fontSize: '0.88rem' }}>
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product, item.quantity + 1)}
                    style={{ padding: '0.4rem 0.7rem' }}
                    aria-label="Increase"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div style={{ fontWeight: 600, fontSize: '1.1rem', minWidth: '90px', textAlign: 'right' }}>
                  {formatPrice(item.price * item.quantity)}
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.product)}
                  style={{ color: 'var(--text-light)', cursor: 'pointer', padding: '6px' }}
                  aria-label="Remove item"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>

          {/* Right: Summary */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '2rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Order Breakdown
            </h2>

            {/* Coupon form */}
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Discount code (e.g. WELCOME10)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.85rem',
                  border: '1px solid var(--border-medium)',
                  outline: 'none'
                }}
              />
              <button type="submit" disabled={applying} className="btn-outline" style={{ padding: '0.65rem 1.2rem', fontSize: '0.78rem' }}>
                {applying ? 'Applying...' : 'Apply'}
              </button>
            </form>

            {coupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FEF3C7', padding: '0.5rem 0.8rem', fontSize: '0.82rem', color: '#92400E', borderRadius: '2px', marginBottom: '1.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Tag size={13} /> {coupon.code} (-{formatPrice(discountAmount)})
                </span>
                <button type="button" onClick={removeCoupon} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
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
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  borderTop: '1px solid var(--border-hairline)',
                  paddingTop: '0.8rem',
                  marginTop: '0.4rem'
                }}
              >
                <span>Estimated Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-dark"
              onClick={() => navigate('/checkout')}
              style={{ width: '100%', padding: '1rem', fontSize: '0.9rem' }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
