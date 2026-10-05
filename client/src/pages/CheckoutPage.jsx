import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ShieldCheck, Truck, Lock, ArrowLeft, CheckCircle2, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCurrency } from '../context/CurrencyContext';
import { orderAPI } from '../services/api';

const CheckoutPage = () => {
  const {
    cartItems,
    subtotal,
    shippingFee,
    discountAmount,
    totalAmount,
    coupon,
    applyCoupon,
    removeCoupon,
    clearCart
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { formatPrice, currency, currentRate } = useCurrency();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.addresses?.[0]?.street || '',
    landmark: user?.addresses?.[0]?.landmark || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || 'Uttar Pradesh',
    pincode: user?.addresses?.[0]?.pincode || '',
    notes: '',
    paymentMethod: 'COD'
  });

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    await applyCoupon(couponCodeInput);
    setCouponCodeInput('');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'error');
      navigate('/shop');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      showToast('Please provide your name, email, and phone number', 'error');
      return;
    }

    if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
      showToast('Please provide your complete delivery address with pincode', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          street: formData.street,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: 'India'
        },
        items: cartItems.map((item) => ({
          product: item.product,
          name: item.name,
          slug: item.slug,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          sku: item.sku
        })),
        paymentMethod: formData.paymentMethod,
        couponCode: coupon?.code || '',
        notes: formData.notes,
        displayCurrency: currency,
        exchangeRate: currentRate
      };

      const res = await orderAPI.create(orderPayload);
      if (res.data?.success) {
        // Fire confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {}

        clearCart();
        showToast('Order placed successfully!', 'success');
        navigate(`/order-success/${res.data.order.orderNumber}`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>
          Your Bag is Empty
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Please add handcrafted editions before proceeding to checkout.
        </p>
        <Link to="/shop" className="btn-dark">
          Explore Collection
        </Link>
      </div>
    );
  }

  const indianStates = [
    'Uttar Pradesh',
    'Delhi',
    'Maharashtra',
    'Karnataka',
    'Haryana',
    'Tamil Nadu',
    'Telangana',
    'Gujarat',
    'Rajasthan',
    'West Bengal',
    'Punjab',
    'Kerala',
    'Madhya Pradesh',
    'Uttarakhand',
    'Goa'
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: '3rem 0 6rem' }}>
      <div className="container">
        {/* Top Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <Link
            to="/shop"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: '1rem'
            }}
          >
            <ArrowLeft size={15} />
            <span>Return to Catalog</span>
          </Link>
          <span className="pre-heading">ATELIER SECURE CHECKOUT</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.4rem' }}>
            Delivery & Payment Details
          </h1>
        </div>

        {/* 2-Column Checkout Layout */}
        <form onSubmit={handlePlaceOrder}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '3.5rem',
              alignItems: 'start'
            }}
          >
            {/* Left: Customer Info & Shipping Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Customer Contact */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '2rem',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                  1. Contact Information
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-body)' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Arjun Sharma"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-xs)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-body)' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="arjun@example.com"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-body)' }}>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '2rem',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                  2. Shipping Address
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-body)' }}>
                      Flat / House No. / Building / Street *
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="e.g. Flat 402, Magnolia Enclave, Sector 54"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-xs)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-body)' }}>
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="Near Golf Course Road"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-xs)'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-body)' }}>
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Gurugram"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-body)' }}>
                        State *
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: '#FFF'
                        }}
                      >
                        {indianStates.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-body)' }}>
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        required
                        maxLength={6}
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="122002"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid var(--border-medium)',
                          borderRadius: 'var(--radius-xs)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '2rem',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '1.25rem' }}>
                  3. Payment Method
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      padding: '1rem',
                      border: `1px solid ${formData.paymentMethod === 'COD' ? 'var(--text-main)' : 'var(--border-hairline)'}`,
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      backgroundColor: formData.paymentMethod === 'COD' ? '#FAF7F2' : '#FFFFFF'
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleInputChange}
                      style={{ accentColor: 'var(--text-main)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Cash on Delivery (COD)</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Pay via cash or UPI upon white-glove inspection at your doorstep.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.8rem',
                      padding: '1rem',
                      border: `1px solid ${formData.paymentMethod === 'ONLINE' ? 'var(--text-main)' : 'var(--border-hairline)'}`,
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      backgroundColor: formData.paymentMethod === 'ONLINE' ? '#FAF7F2' : '#FFFFFF'
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="ONLINE"
                      checked={formData.paymentMethod === 'ONLINE'}
                      onChange={handleInputChange}
                      style={{ accentColor: 'var(--text-main)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Instant Online Payment (UPI / Cards / NetBanking)</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Instant 256-bit encrypted verification simulator.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Order Summary Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '2rem',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-sm)',
                position: 'sticky',
                top: '110px'
              }}
            >
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                Order Summary ({cartItems.length})
              </h2>

              {/* Items List */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  paddingRight: '0.5rem',
                  marginBottom: '1.5rem'
                }}
              >
                {cartItems.map((item) => (
                  <div key={item.product} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img
                      src={item.image || '/logo-icon.svg'}
                      alt={item.name}
                      style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '2px', backgroundColor: '#F5F2EB' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.25 }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Field */}
              <div style={{ padding: '1rem 0', borderTop: '1px solid var(--border-hairline)', borderBottom: '1px solid var(--border-hairline)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Coupon (e.g. WELCOME10)"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="btn-outline"
                    style={{ padding: '0.65rem 1.2rem', fontSize: '0.78rem' }}
                  >
                    Apply
                  </button>
                </div>

                {coupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', fontSize: '0.8rem', color: '#92400E' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={13} /> {coupon.code} active (-{formatPrice(discountAmount)})
                    </span>
                    <button type="button" onClick={removeCoupon} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Totals Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-terracotta)' }}>
                    <span>Artisanal Coupon Savings</span>
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
                    fontSize: '1.25rem',
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    borderTop: '1px solid var(--border-hairline)',
                    paddingTop: '0.8rem'
                  }}
                >
                  <span>Grand Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Payment Currency Transparency Notice */}
              {currency !== 'INR' && (
                <div
                  style={{
                    backgroundColor: '#FAF7F2',
                    border: '1px solid var(--border-light)',
                    borderRadius: '4px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-body)',
                    lineHeight: 1.5
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Payment Currency:</span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-terracotta)' }}>₹{Number(totalAmount).toLocaleString('en-IN')} INR</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Displaying in <strong>{currency}</strong> ({formatPrice(totalAmount)}). Final gateway transaction is settled in <strong>INR (₹)</strong> at guaranteed rate of 1 INR = {Number(currentRate).toFixed(4)} {currency}.
                  </div>
                </div>
              )}

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-dark"
                style={{ width: '100%', padding: '1rem', fontSize: '0.9rem' }}
              >
                <Lock size={16} />
                <span>{submitting ? 'Confirming Order...' : `Place Order • ${formatPrice(totalAmount)}`}</span>
              </button>

              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                By placing this order, you support generational woodturning artisans in Saharanpur, UP.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
