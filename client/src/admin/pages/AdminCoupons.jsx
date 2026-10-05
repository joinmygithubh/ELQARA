import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Check, X } from 'lucide-react';
import { couponAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: 0,
    maxDiscount: '',
    expiryDate: '2027-12-31',
    usageLimit: 100,
    isActive: true
  });

  const { showToast } = useToast();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await couponAPI.getAll();
      if (res.data?.success) {
        setCoupons(res.data.coupons);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue || !formData.expiryDate) {
      showToast('Please fill all required coupon fields', 'error');
      return;
    }

    try {
      const res = await couponAPI.create(formData);
      if (res.data?.success) {
        showToast('Coupon created successfully', 'success');
        setIsModalOpen(false);
        setFormData({
          code: '',
          description: '',
          discountType: 'percentage',
          discountValue: '',
          minOrderValue: 0,
          maxDiscount: '',
          expiryDate: '2027-12-31',
          usageLimit: 100,
          isActive: true
        });
        fetchCoupons();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this coupon permanently?')) {
      try {
        const res = await couponAPI.delete(id);
        if (res.data?.success) {
          showToast('Coupon deleted', 'success');
          fetchCoupons();
        }
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const res = await couponAPI.update(coupon._id, { isActive: !coupon.isActive });
      if (res.data?.success) {
        showToast('Coupon status updated', 'success');
        fetchCoupons();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="pre-heading">PROMOTIONS & PRIVILEGES</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
            Coupon Code Management
          </h1>
        </div>

        <button type="button" onClick={() => setIsModalOpen(true)} className="btn-dark" style={{ padding: '0.75rem 1.5rem', fontSize: '0.85rem' }}>
          <Plus size={16} />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="custom-table-wrap">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Max Cap</th>
              <th>Usage Limit</th>
              <th>Used</th>
              <th>Expires</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading coupons...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No coupons found.
                </td>
              </tr>
            ) : (
              coupons.map((cp) => (
                <tr key={cp._id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem' }}>
                    {cp.code}
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} FLAT`}
                  </td>
                  <td>₹{cp.minOrderValue || 0}</td>
                  <td>{cp.maxDiscount ? `₹${cp.maxDiscount}` : 'None'}</td>
                  <td>{cp.usageLimit}</td>
                  <td>{cp.usedCount}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(cp.expiryDate).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(cp)}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: '2px',
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: cp.isActive ? '#DCFCE7' : '#F3F4F6',
                        color: cp.isActive ? '#166534' : '#6B7280'
                      }}
                    >
                      {cp.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleDelete(cp._id)}
                      style={{ padding: '0.4rem', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(25, 22, 20, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 3500
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              padding: '2.5rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem' }}>Create Promotional Coupon</h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE15"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', textTransform: 'uppercase' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)', backgroundColor: '#FFF' }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={formData.discountType === 'percentage' ? '15' : '500'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Minimum Order Value (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    placeholder="1999"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="Leave empty for none"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="100"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xs)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
                <button type="button" className="btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-dark">
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
