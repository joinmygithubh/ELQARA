import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Printer } from 'lucide-react';
import { orderAPI } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderAPI.getById(orderNumber);
        if (res.data?.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Error fetching order receipt:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Generating your official order receipt...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: '4rem 0 6rem' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        {/* Celebration Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-sm)',
            padding: '3rem 2.5rem',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center',
            marginBottom: '2rem'
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}
          >
            <CheckCircle size={36} />
          </div>

          <span className="pre-heading" style={{ color: '#16A34A' }}>
            ORDER CONFIRMED & IN PREPARATION
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', marginTop: '0.4rem', marginBottom: '0.8rem' }}>
            Thank You, {order?.customer?.name || 'Collector'}
          </h1>
          <p style={{ color: 'var(--text-body)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 1.5rem' }}>
            Your order <strong>#{order?.orderNumber || orderNumber}</strong> has been transmitted to our atelier workshop. Our artisans are hand-inspecting and preparing your edition.
          </p>

          <div style={{ display: 'inline-flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-outline"
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}
            >
              <Printer size={15} />
              <span>Print Receipt</span>
            </button>
            <Link to="/shop" className="btn-dark" style={{ padding: '0.6rem 1.4rem', fontSize: '0.8rem' }}>
              <span>Continue Browsing</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Receipt Details Card */}
        {order && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '2.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Order Number
                </span>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 600 }}>
                  {order.orderNumber}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Status
                </span>
                <div>
                  <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={item.image || '/logo-icon.svg'}
                    alt={item.name}
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '2px', backgroundColor: '#F8F5F0' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Qty: {item.quantity} • {item.sku || 'ELQ'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdown & Address */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem',
                borderTop: '1px solid var(--border-hairline)',
                paddingTop: '1.5rem'
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  Destination Address
                </h4>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-body)' }}>
                  <strong>{order.customer.name}</strong><br />
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.landmark && `${order.shippingAddress.landmark}, `}
                  {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}<br />
                  Phone: {order.customer.phone}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                  Financial Breakdown
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Subtotal:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-terracotta)' }}>
                      <span>Discount ({order.coupon?.code || 'Coupon'}):</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Shipping:</span>
                    <span>{order.shippingFee === 0 ? 'Complimentary' : formatPrice(order.shippingFee)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--text-main)',
                      borderTop: '1px solid var(--border-hairline)',
                      paddingTop: '0.5rem',
                      marginTop: '0.2rem'
                    }}
                  >
                    <span>Total Paid/Payable:</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessPage;
