import React, { useState, useEffect } from 'react';
import { Eye, Search, Filter, CheckCircle, Truck, Package, Clock, X } from 'lucide-react';
import { orderAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { showToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;

      const res = await orderAPI.getAllAdmin(params);
      if (res.data?.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await orderAPI.updateStatus(orderId, {
        orderStatus: newStatus,
        note: `Status updated to ${newStatus} by Administrator`
      });
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, orderStatus: newStatus } : ord))
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
        }
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

  const orderStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded'];

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <span className="pre-heading">FULFILLMENT & LOGISTICS</span>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
          Customer Orders & Shipments
        </h1>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '1.25rem',
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '1.75rem'
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Search by order #, customer name, email, or phone..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Statuses ({orders.length})</option>
            {orderStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="custom-table-wrap">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items & Qty</th>
              <th>Total Amount</th>
              <th>Payment</th>
              <th>Fulfillment Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem' }}>
                  Loading client orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord._id}>
                  <td style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.05rem' }}>
                    {ord.orderNumber}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{ord.customer?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customer?.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{ord.customer?.phone}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.82rem' }}>
                      {ord.items?.map((it, idx) => (
                        <div key={idx} style={{ whiteSpace: 'nowrap' }}>
                          <strong>{it.quantity}×</strong> {it.name}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{formatPrice(ord.totalAmount)}</div>
                    {ord.discountAmount > 0 && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-terracotta)' }}>
                        Save -{formatPrice(ord.discountAmount)}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: ord.paymentStatus === 'Paid' ? '#16A34A' : '#D97706' }}>
                      {ord.paymentStatus} ({ord.paymentMethod})
                    </span>
                  </td>
                  <td>
                    {/* Status Dropdown */}
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                      style={{
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#FAF7F2',
                        cursor: 'pointer'
                      }}
                    >
                      {orderStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(ord)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        backgroundColor: '#F5F2EA',
                        border: '1px solid var(--border-hairline)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
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
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              padding: '2.5rem',
              maxWidth: '680px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '1rem' }}>
              <div>
                <span className="pre-heading">ORDER DOSSIER</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--text-main)' }}>
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} style={{ cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Destination & Customer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem', fontSize: '0.85rem' }}>
              <div style={{ backgroundColor: '#FAF7F2', padding: '1.25rem', borderRadius: 'var(--radius-xs)' }}>
                <strong style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Client Contact
                </strong>
                <div>Name: {selectedOrder.customer.name}</div>
                <div>Email: {selectedOrder.customer.email}</div>
                <div>Phone: {selectedOrder.customer.phone}</div>
              </div>

              <div style={{ backgroundColor: '#FAF7F2', padding: '1.25rem', borderRadius: 'var(--radius-xs)' }}>
                <strong style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Delivery Destination
                </strong>
                <div>{selectedOrder.shippingAddress.street}</div>
                {selectedOrder.shippingAddress.landmark && <div>Near: {selectedOrder.shippingAddress.landmark}</div>}
                <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} – {selectedOrder.shippingAddress.pincode}</div>
                <div>Country: {selectedOrder.shippingAddress.country}</div>
              </div>
            </div>

            {/* Line Items */}
            <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>
              Artisanal Line Items
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
              {selectedOrder.items?.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-hairline)' }}>
                  <img
                    src={it.image || '/logo-icon.svg'}
                    alt={it.name}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '2px', backgroundColor: '#F8F5F0' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{it.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      SKU: {it.sku} • Quantity: {it.quantity} × {formatPrice(it.price)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600 }}>{formatPrice(it.price * it.quantity)}</div>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Subtotal:</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-terracotta)' }}>
                  <span>Coupon Savings ({selectedOrder.coupon?.code}):</span>
                  <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Shipping:</span>
                <span>{selectedOrder.shippingFee === 0 ? 'Complimentary' : formatPrice(selectedOrder.shippingFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.1rem', fontFamily: 'var(--font-serif)', borderTop: '1px solid var(--border-hairline)', paddingTop: '0.5rem' }}>
                <span>Grand Total:</span>
                <span>{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Status Timeline */}
            <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>
              Fulfillment Journey
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-body)', marginBottom: '1.5rem' }}>
              {selectedOrder.statusTimeline?.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)' }} />
                  <span>
                    <strong>{t.status}</strong>: {t.note} ({new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-dark" onClick={() => setSelectedOrder(null)}>
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
