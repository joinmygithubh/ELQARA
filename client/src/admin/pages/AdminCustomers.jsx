import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { customerAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerAPI.getAll({ search });
      if (res.data?.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleToggleBlock = async (c) => {
    try {
      const res = await customerAPI.toggleBlock(c._id);
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        setCustomers((prev) =>
          prev.map((item) => (item._id === c._id ? { ...item, isBlocked: res.data.isBlocked } : item))
        );
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const formatPrice = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="pre-heading">PATRON ROSTER</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
          Registered Collectors & Clients
        </h1>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '1.25rem',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          marginBottom: '1.75rem'
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1 }}>
          <input
            type="text"
            placeholder="Search patron by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '0.65rem 0.85rem',
              border: '1px solid var(--border-medium)',
              borderRight: 'none',
              outline: 'none',
              fontSize: '0.85rem'
            }}
          />
          <button type="submit" className="btn-dark" style={{ padding: '0.65rem 1rem', borderRadius: 0 }}>
            <Search size={15} />
          </button>
        </form>
      </div>

      <div className="custom-table-wrap">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Collector Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Total Orders</th>
              <th>Lifetime Spend</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading collectors...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No customer accounts found.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c._id}>
                  <td style={{ fontWeight: 600, fontFamily: 'var(--font-serif)', fontSize: '1.05rem' }}>
                    {c.name}
                  </td>
                  <td>{c.email}</td>
                  <td>{c.phone || '—'}</td>
                  <td>
                    <strong>{c.orderCount || 0}</strong> orders
                  </td>
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
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleBlock(c)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                        backgroundColor: c.isBlocked ? '#DCFCE7' : '#FEE2E2',
                        color: c.isBlocked ? '#16A34A' : '#DC2626',
                        border: 'none',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {c.isBlocked ? 'Unblock' : 'Block Access'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
