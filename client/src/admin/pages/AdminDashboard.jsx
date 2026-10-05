import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  Plus
} from 'lucide-react';
import { orderAPI, productAPI, customerAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, prodRes, custRes] = await Promise.all([
          orderAPI.getStats(),
          productAPI.getAll({ adminView: 'true', limit: 1 }),
          customerAPI.getAll({ limit: 5 })
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data.stats);
          setRecentOrders(statsRes.data.recentOrders || []);
          setLowStockProducts(statsRes.data.lowStockProducts || []);
        }

        if (prodRes.data?.success) {
          setProductCount(prodRes.data.total);
        }

        if (custRes.data?.success) {
          setCustomerCount(custRes.data.total);
          setRecentCustomers(custRes.data.customers || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatPrice = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  if (loading) {
    return <div style={{ padding: '3rem', color: 'var(--text-muted)' }}>Aggregating atelier telemetry...</div>;
  }

  return (
    <div>
      {/* Page Title & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="pre-heading">OVERVIEW & METRICS</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
            Atelier Command Center
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <Link to="/admin/products/new" className="btn-dark" style={{ padding: '0.75rem 1.4rem', fontSize: '0.82rem' }}>
            <Plus size={16} />
            <span>Add New Product Edition</span>
          </Link>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}
      >
        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="metric-label">Total Net Revenue</span>
            <TrendingUp size={20} color="var(--accent-gold)" />
          </div>
          <div className="metric-value">{formatPrice(stats?.totalRevenue)}</div>
          <span style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.4rem' }}>
            Active handcrafted sales
          </span>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="metric-label">Total Placed Orders</span>
            <ShoppingBag size={20} color="var(--accent-gold)" />
          </div>
          <div className="metric-value">{stats?.totalOrders || 0}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            {stats?.activeOrders || 0} active in fulfillment
          </span>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="metric-label">Published Editions</span>
            <Package size={20} color="var(--accent-gold)" />
          </div>
          <div className="metric-value">{productCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Across 5 artisanal disciplines
          </span>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="metric-label">Patrons / Collectors</span>
            <Users size={20} color="var(--accent-gold)" />
          </div>
          <div className="metric-value">{customerCount}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Verified customer accounts
          </span>
        </div>
      </div>

      {/* Order Fulfillment Status Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}
      >
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-xs)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confirmed</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--status-confirmed)' }}>
            {stats?.confirmedOrders || 0}
          </div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-xs)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>In Woodshop Packaging</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--status-processing)' }}>
            {stats?.processingOrders || 0}
          </div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-xs)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>In Transit (Shipped)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--status-shipped)' }}>
            {stats?.shippedOrders || 0}
          </div>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-xs)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivered</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--status-delivered)' }}>
            {stats?.deliveredOrders || 0}
          </div>
        </div>
      </div>

      {/* 2-Column: Recent Orders + Low Stock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="admin-dash-grid">
        {/* Recent Orders Table */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>Recent Client Acquisitions</h2>
            <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
              View All Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No orders placed yet.</p>
          ) : (
            <div className="custom-table-wrap">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Collector</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => (
                    <tr key={ord._id}>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-serif)' }}>{ord.orderNumber}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{ord.customer?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customer?.city || ord.shippingAddress?.city}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatPrice(ord.totalAmount)}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: ord.paymentStatus === 'Paid' ? '#16A34A' : '#D97706' }}>
                          {ord.paymentStatus} ({ord.paymentMethod})
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${ord.orderStatus.toLowerCase()}`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <AlertTriangle size={18} color="#D97706" />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>Inventory Alerts</h2>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Products requiring re-turning or timber seasoning (Stock &le; 5 units).
          </p>

          {lowStockProducts.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#16A34A', fontSize: '0.85rem' }}>
              ✓ All handcrafted inventory is adequately stocked.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lowStockProducts.map((p) => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px solid var(--border-hairline)' }}>
                  <img
                    src={p.thumbnail || '/logo-icon.svg'}
                    alt={p.name}
                    style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '2px', backgroundColor: '#F8F5F0' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-main)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {p.sku}</div>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '0.2rem 0.6rem', borderRadius: '2px' }}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-hairline)' }}>
            <Link to="/admin/products" style={{ fontSize: '0.82rem', color: 'var(--text-main)', textDecoration: 'underline' }}>
              Manage All Inventory →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Collectors / Customers Section */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: '1.75rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>Recent Registered Collectors</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Latest customers who joined the ELQARA circle.</p>
          </div>
          <Link to="/admin/customers" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
            View All Collectors →
          </Link>
        </div>

        {recentCustomers.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No registered customers yet.</p>
        ) : (
          <div className="custom-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Collector</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Total Orders</th>
                  <th>Lifetime Spend</th>
                  <th>Joined Date</th>
                  <th>Account Status</th>
                </tr>
              </thead>
              <tbody>
                {recentCustomers.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-serif)' }}>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || '—'}</td>
                    <td><strong>{c.orderCount || 0}</strong> orders</td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(c.totalSpent)}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: c.isBlocked ? '#DC2626' : '#16A34A',
                          backgroundColor: c.isBlocked ? '#FEE2E2' : '#DCFCE7',
                          padding: '2px 8px',
                          borderRadius: '2px'
                        }}
                      >
                        {c.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-dash-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
