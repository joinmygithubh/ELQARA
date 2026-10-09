import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, User, MapPin, LogOut, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { orderAPI } from '../services/api';

const AccountPage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'addresses'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const res = await orderAPI.getMyOrders();
        if (res.data?.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchMyOrders();
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', padding: '3.5rem 0 6rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <span className="pre-heading">COLLECTOR DASHBOARD</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.4rem' }}>
            Welcome back, {user?.name}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Manage your bespoke lighting acquisitions, delivery destinations, and atelier correspondence.
          </p>
        </div>

        {/* 2-Column: Sidebar navigation + Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '3rem' }} className="account-grid">
          {/* Left Navigation */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem 0',
              height: 'fit-content'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.9rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'orders' ? 600 : 400,
                color: activeTab === 'orders' ? 'var(--text-main)' : 'var(--text-muted)',
                backgroundColor: activeTab === 'orders' ? '#FAF7F2' : 'transparent',
                borderLeft: activeTab === 'orders' ? '3px solid var(--text-main)' : '3px solid transparent'
              }}
            >
              <Package size={17} />
              <span>My Orders ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.9rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'profile' ? 600 : 400,
                color: activeTab === 'profile' ? 'var(--text-main)' : 'var(--text-muted)',
                backgroundColor: activeTab === 'profile' ? '#FAF7F2' : 'transparent',
                borderLeft: activeTab === 'profile' ? '3px solid var(--text-main)' : '3px solid transparent'
              }}
            >
              <User size={17} />
              <span>Collector Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('addresses')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.9rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'addresses' ? 600 : 400,
                color: activeTab === 'addresses' ? 'var(--text-main)' : 'var(--text-muted)',
                backgroundColor: activeTab === 'addresses' ? '#FAF7F2' : 'transparent',
                borderLeft: activeTab === 'addresses' ? '3px solid var(--text-main)' : '3px solid transparent'
              }}
            >
              <MapPin size={17} />
              <span>Saved Addresses</span>
            </button>

            <div style={{ height: '1px', background: 'var(--border-hairline)', margin: '0.75rem 0' }} />

            <button
              type="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.9rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.88rem',
                color: '#DC2626'
              }}
            >
              <LogOut size={17} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Right Content */}
          <div>
            {activeTab === 'orders' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1.5rem' }}>
                  Order History & Tracking
                </h2>

                {loadingOrders ? (
                  <div>Loading your acquisitions...</div>
                ) : orders.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-hairline)',
                      padding: '4rem 2rem',
                      textAlign: 'center',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <Package size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                      No orders placed yet
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                      Explore our handcrafted lamps and home decor collections.
                    </p>
                    <Link to="/shop" className="btn-dark">
                      Explore Shop Catalog
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map((ord) => (
                      <div
                        key={ord._id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--border-hairline)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '1.75rem',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            borderBottom: '1px solid var(--border-hairline)',
                            paddingBottom: '1rem',
                            marginBottom: '1.25rem',
                            flexWrap: 'wrap',
                            gap: '0.75rem'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                              Order Reference
                            </div>
                            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600 }}>
                              {ord.orderNumber}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>
                              Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span className={`status-badge ${ord.orderStatus.toLowerCase()}`}>
                              {ord.orderStatus}
                            </span>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: '0.4rem' }}>
                              Total: {formatPrice(ord.totalAmount)}
                            </div>
                          </div>
                        </div>

                        {/* Items in this order */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                          {ord.items?.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <img
                                src={item.image || '/logo-icon.svg'}
                                alt={item.name}
                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '2px', backgroundColor: '#F8F5F0' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.92rem', fontWeight: 500, color: 'var(--text-main)' }}>
                                  {item.name}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  Quantity: {item.quantity} • {formatPrice(item.price)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Link
                            to={`/order-success/${ord.orderNumber}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              fontSize: '0.82rem',
                              color: 'var(--text-main)',
                              textDecoration: 'underline'
                            }}
                          >
                            <span>View Official Invoice & Tracking</span>
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2.5rem'
                }}
              >
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1.5rem' }}>
                  Collector Profile
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      Full Name
                    </label>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{user?.name}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      Registered Email
                    </label>
                    <div style={{ fontSize: '1rem' }}>{user?.email}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      Phone
                    </label>
                    <div style={{ fontSize: '1rem' }}>{user?.phone || 'Not provided'}</div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      Account Tier
                    </label>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                      ✦ Verified Patron of Artisanal Craft
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2.5rem'
                }}
              >
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', marginBottom: '1.5rem' }}>
                  Saved Delivery Destinations
                </h2>

                {user?.addresses && user.addresses.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    {user.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid var(--border-hairline)',
                          padding: '1.5rem',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: '#FAF7F2'
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{addr.fullName || user.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-body)', lineHeight: 1.5 }}>
                          {addr.street}<br />
                          {addr.landmark && `${addr.landmark}, `}
                          {addr.city}, {addr.state} – {addr.pincode}<br />
                          Phone: {addr.phone || user.phone}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No addresses saved yet. Your shipping address will be automatically remembered on your next checkout.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .account-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AccountPage;
